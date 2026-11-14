import { useCallback, useEffect, useRef, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import ProductCard from './ProductCard';
import { productService } from '../services/api';

const PAGE_SIZE = 8;
<<<<<<< Updated upstream
=======
const initialFilters = { gender: '', category: '', size: '', colour: '', sort: 'popular', under999: false };
>>>>>>> Stashed changes

export default function HomepageCollection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');
<<<<<<< Updated upstream
  const sentinelRef = useRef(null);
  const nextPageRef = useRef(1);
  const lastPageRef = useRef(null);
  const seenProductIds = useRef(new Set());
  const loadingRef = useRef(false);
  const errorRef = useRef(false);
=======
  const [errorDetails, setErrorDetails] = useState('');
  const requestIdRef = useRef(0);
  const pageLoadedIdsRef = useRef(new Set());
  const pageRequestRef = useRef(false);
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
    loadNextPage();
  }, [loadNextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || error || loading) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadNextPage();
    }, { rootMargin: '300px' });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, hasMore, loading, loadNextPage]);

  const retry = () => {
    errorRef.current = false;
    loadNextPage();
  };
=======
    let cancelled = false;
    const requestId = ++requestIdRef.current;
    const params = { page, limit: PAGE_SIZE, sort: filters.sort };
    if (filters.gender) params.gender = filters.gender;
    if (filters.category) params.category = filters.category;
    if (filters.size) params.size = filters.size;
    if (filters.colour) params.colour = filters.colour;
    const endpoint = `/api/products?${new URLSearchParams(params).toString()}`;

    const loadPage = async () => {
      pageRequestRef.current = true;
      setLoading(true);
      setError('');
      setErrorDetails('');
      try {
        const response = await productService.getProducts(params);
        const data = response.data;
        if (!data?.success || !Array.isArray(data.products)) {
          throw new Error(data?.message || 'The API response did not contain a products array.');
        }
        if (cancelled || requestId !== requestIdRef.current) return;

        const normalizedProducts = data.products.filter((product) => product && product._id);
        if (page === 1) pageLoadedIdsRef.current = new Set(normalizedProducts.map((product) => product._id));
        const freshProducts = page === 1 ? normalizedProducts : normalizedProducts.filter((product) => !pageLoadedIdsRef.current.has(product._id));
        freshProducts.forEach((product) => pageLoadedIdsRef.current.add(product._id));
        setProducts((current) => page === 1 ? normalizedProducts : [...current, ...freshProducts]);
        setTotalCount(Number.isFinite(Number(data.totalCount)) ? Number(data.totalCount) : normalizedProducts.length);
        setTotalPages(Number.isInteger(Number(data.totalPages)) ? Number(data.totalPages) : null);
      } catch (requestError) {
        if (cancelled || requestId !== requestIdRef.current) return;
        const status = requestError.response?.status;
        const reason = requestError.response?.data?.message || requestError.message || 'Network request failed.';
        setError(`We could not load products. ${status ? `The server returned HTTP ${status}.` : 'The API server could not be reached.'}`);
        setErrorDetails(`${endpoint} — ${reason}`);
        console.error('Homepage collection request failed:', endpoint, requestError);
      } finally {
        pageRequestRef.current = false;
        if (!cancelled && requestId === requestIdRef.current) setLoading(false);
      }
    };

    loadPage();
    return () => { cancelled = true; };
  }, [page, filters.gender, filters.category, filters.size, filters.colour, filters.sort, retryCount]);

  const availableCategories = useMemo(() => Array.from(new Set(products.map((product) => product.category).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b)), [products]);
  const availableSizes = useMemo(() => {
    const sizes = Array.from(new Set(products.flatMap((product) => product.sizes || [])));
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    return sizes.sort((a, b) => {
      const ai = order.indexOf(a);
      const bi = order.indexOf(b);
      if (ai >= 0 && bi >= 0) return ai - bi;
      if (ai >= 0) return -1;
      if (bi >= 0) return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
  }, [products]);
  const availableColours = useMemo(() => Array.from(new Set(products.flatMap((product) =>
    (product.colours || []).map((colour) => typeof colour === 'string' ? colour : colour?.name).filter(Boolean)
  ))).sort((a, b) => a.localeCompare(b)), [products]);
  const availableGenders = useMemo(() => Array.from(new Set(products.map((product) => product.gender).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b)), [products]);

  const visibleProducts = useMemo(() => products.filter((product) => {
    if (filters.gender && product.gender && product.gender.toLowerCase() !== filters.gender.toLowerCase()) return false;
    if (filters.under999) {
      const price = Number(product.discountPrice || product.price);
      if (!Number.isFinite(price) || catalogUnitsToRupees(price) > 999) return false;
    }
    return true;
  }), [products, filters.gender, filters.under999]);

  const hasMore = totalPages !== null ? page < totalPages : products.length < totalCount;
  const loadNextPage = useCallback(() => {
    if (!pageRequestRef.current && !loading && !error && hasMore) {
      pageRequestRef.current = true;
      setPage((current) => current + 1);
    }
  }, [loading, error, hasMore]);

  const filterSelect = (label, value, name, options, placeholder) => (
    <label className="relative shrink-0">
      <span className="sr-only">{label}</span>
      <select aria-label={label} value={value} onChange={(event) => updateFilter(name, event.target.value)}
        className="appearance-none rounded-full border border-xora-taupe/40 bg-white py-2.5 pl-4 pr-9 text-xs text-xora-charcoal hover:border-xora-charcoal focus:border-xora-charcoal focus:outline-none">
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-xora-taupe-dark" />
    </label>
  );
>>>>>>> Stashed changes

  return (
    <section className="border-b border-xora-taupe/30 py-10 sm:py-14" aria-labelledby="homepage-collection-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 border-b border-xora-taupe/20 pb-4">
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
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-xora-taupe-dark" role="status">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading the collection...
          </div>
        ) : products.length === 0 && !error ? (
          <p className="py-8 text-center font-serif text-xl text-xora-taupe-dark">
            Our collection is coming soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

<<<<<<< Updated upstream
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
=======
        {loading && products.length > 0 && <div className="flex items-center justify-center gap-2 pt-8 text-sm text-xora-taupe-dark" role="status"><LoaderCircle className="h-4 w-4 animate-spin" />Loading more...</div>}
        {error && products.length > 0 && <p className="pt-6 text-center text-sm text-xora-taupe-dark" role="status">{error} <button type="button" onClick={() => { setError(''); setErrorDetails(''); setLoading(true); setRetryCount((current) => current + 1); }} className="underline">Retry</button></p>}
        {!loading && !error && products.length > 0 && !hasMore && <p className="pt-8 text-center text-sm text-xora-taupe-dark">You’ve reached the end of the collection.</p>}
        {hasMore && <div className="mt-8 text-center"><button type="button" onClick={loadNextPage} disabled={loading || Boolean(error)} className="border border-xora-charcoal px-8 py-3 text-xs uppercase tracking-luxury text-xora-charcoal transition-colors hover:bg-xora-charcoal hover:text-white disabled:cursor-wait disabled:opacity-50">{loading ? 'Loading…' : 'Next'}</button></div>}
>>>>>>> Stashed changes
      </div>
    </section>
  );
}
