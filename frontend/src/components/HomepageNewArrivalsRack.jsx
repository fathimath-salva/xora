import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import ClothingRack from './ClothingRack';
import { productService } from '../services/api';
import { demoRackProducts } from '../data/demoRackProducts';

const PAGE_SIZE = 8;

export default function HomepageNewArrivalsRack() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [error, setError] = useState('');
  const nextPageRef = useRef(1);
  const lastPageRef = useRef(null);
  const seenProductIds = useRef(new Set());
  const loadingRef = useRef(false);
  const cancelledRef = useRef(false);

  const loadNextPage = useCallback(async () => {
    if (loadingRef.current || !hasMore || demoMode) return;
    if (lastPageRef.current !== null && nextPageRef.current > lastPageRef.current) {
      setHasMore(false);
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    setError('');

    try {
      const page = nextPageRef.current;
      const response = await productService.getProducts({ page, limit: PAGE_SIZE });
      const data = response.data;
      if (!data?.success || !Array.isArray(data.products)) {
        throw new Error(data?.message || 'The product service returned an unexpected response.');
      }
      if (cancelledRef.current) return;

      if (page === 1 && data.products.length === 0) {
        setProducts(demoRackProducts);
        setDemoMode(true);
        setHasMore(false);
        return;
      }

      const uniqueProducts = data.products.filter((product) => {
        if (!product?._id || seenProductIds.current.has(product._id)) return false;
        seenProductIds.current.add(product._id);
        return true;
      });
      setProducts((current) => [...current, ...uniqueProducts]);
      nextPageRef.current = page + 1;

      const totalPages = Number(data.totalPages);
      if (Number.isInteger(totalPages) && totalPages >= 0) {
        lastPageRef.current = totalPages;
        setHasMore(page < totalPages);
      } else {
        setHasMore(data.products.length === PAGE_SIZE && uniqueProducts.length > 0);
      }
    } catch (requestError) {
      if (cancelledRef.current) return;
      if (nextPageRef.current === 1) {
        console.error('Unable to load homepage rack products:', requestError);
        setProducts(demoRackProducts);
        setDemoMode(true);
        setHasMore(false);
      } else {
        console.error('Unable to load more homepage rack products:', requestError);
        setError('We could not load more garments. Please try again.');
      }
    } finally {
      loadingRef.current = false;
      if (!cancelledRef.current) setLoading(false);
    }
  }, [demoMode, hasMore]);

  useEffect(() => {
    cancelledRef.current = false;
    loadNextPage();
    return () => { cancelledRef.current = true; };
  }, [loadNextPage]);

  const retry = () => {
    setError('');
    loadNextPage();
  };

  return (
    <section className="border-y border-xora-taupe/25 bg-xora-offwhite/50 py-10 sm:py-14" aria-labelledby="homepage-rack-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 border-b border-xora-taupe/20 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark font-medium">
              Curated Essentials
            </span>
            <h2 id="homepage-rack-title" className="mt-1 font-serif text-3xl tracking-wide text-xora-charcoal sm:text-4xl">
              New Arrivals
            </h2>
            <p className="mt-2 text-sm text-xora-taupe-dark font-light">
              Explore the collection garment by garment.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center text-xs uppercase tracking-luxury text-xora-charcoal transition-colors hover:text-xora-taupe-dark"
          >
            <span>View All Products</span>
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </div>

        {loading && products.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-xora-taupe-dark" role="status">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Preparing the collection...
          </div>
        ) : products.length > 0 ? (
          <ClothingRack
            products={products}
            demoMode={demoMode}
            hasMore={hasMore}
            loadingMore={loading && products.length > 0}
            error={error}
            onNearEnd={loadNextPage}
            onRetry={retry}
          />
        ) : (
          <p className="py-8 text-center font-serif text-xl text-xora-taupe-dark">
            Our collection is coming soon.
          </p>
        )}
      </div>
    </section>
  );
}
