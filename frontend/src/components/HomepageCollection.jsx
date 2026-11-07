import { useCallback, useEffect, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import ProductCard from './ProductCard';
import { productService } from '../services/api';

const PAGE_SIZE = 8;

export default function HomepageCollection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
  const sentinelRef = useRef(null);
  const nextPageRef = useRef(1);
  const lastPageRef = useRef(null);
  const seenProductIds = useRef(new Set());
  const loadingRef = useRef(false);
  const errorRef = useRef(false);

  const loadNextPage = useCallback(async () => {
    if (loadingRef.current || errorRef.current || !hasMore) return;
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

      const totalPages = Number(data.totalPages);
      const hasPagination = Number.isInteger(totalPages) && totalPages >= 0;
      const uniqueProducts = data.products.filter((product) => {
        if (!product?._id || seenProductIds.current.has(product._id)) return false;
        seenProductIds.current.add(product._id);
        return true;
      });

      if (page === 1 && data.products.length === 0) {
        setHasMore(false);
      } else {
        setProducts((current) => [...current, ...uniqueProducts]);
        nextPageRef.current = page + 1;
        if (hasPagination) {
          lastPageRef.current = totalPages;
          setHasMore(page < totalPages);
        } else {
          setHasMore(data.products.length === PAGE_SIZE && uniqueProducts.length > 0);
        }
      }
    } catch (requestError) {
      console.error('Error fetching homepage collection:', requestError);
      errorRef.current = true;
      setError('We could not load more of the collection. Please try again.');
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore]);

  useEffect(() => {
    loadNextPage();
  }, [loadNextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || error) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadNextPage();
    }, { rootMargin: '300px' });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, hasMore, loadNextPage]);

  const retry = () => {
    errorRef.current = false;
    loadNextPage();
  };

  return (
    <section className="border-b border-xora-taupe/30 py-16 sm:py-20" aria-labelledby="homepage-collection-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-xora-taupe/20 pb-4">
          <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark font-medium">
            YAQANA
          </span>
          <h2 id="homepage-collection-title" className="mt-1 font-serif text-3xl sm:text-4xl tracking-wide text-xora-charcoal">
            OUR COLLECTION
          </h2>
          <p className="mt-2 text-sm text-xora-taupe-dark font-light">
            Discover the YAQANA collection.
          </p>
        </div>

        {loading && products.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-xora-taupe-dark" role="status">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading the collection...
          </div>
        ) : products.length === 0 && !error ? (
          <p className="py-12 text-center font-serif text-xl text-xora-taupe-dark">
            Our collection is coming soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        <div ref={sentinelRef} className="h-px" aria-hidden="true" />
        {loading && products.length > 0 && (
          <div className="flex items-center justify-center gap-2 pt-8 text-sm text-xora-taupe-dark" role="status">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading more...
          </div>
        )}
        {error && (
          <div className="pt-6 text-center">
            <p className="text-sm text-xora-taupe-dark" role="status">{error}</p>
            <button type="button" onClick={retry} className="mt-3 text-xs uppercase tracking-luxury underline underline-offset-4">
              Try again
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
