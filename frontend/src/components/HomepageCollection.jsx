import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, LoaderCircle, RotateCcw } from 'lucide-react';
import ProductCard from './ProductCard';
import { productService } from '../services/api';
import { catalogUnitsToRupees } from '../utils/currency';

const PAGE_SIZE = 24;
const initialFilters = { gender: '', category: '', size: '', colour: '', sort: 'popular', under999: false };

export default function HomepageCollection() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const sentinelRef = useRef(null);
  const requestIdRef = useRef(0);
  const pageLoadedIdsRef = useRef(new Set());

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
    pageLoadedIdsRef.current = new Set();
    setProducts([]);
    setTotalCount(0);
    setTotalPages(null);
    setError('');
    setErrorDetails('');
    setLoading(true);
  };

  const activeFilters = Object.entries(filters).some(([key, value]) => key === 'sort' ? value !== 'popular' : Boolean(value));
  const clearFilters = () => {
    setFilters(initialFilters);
    setPage(1);
    pageLoadedIdsRef.current = new Set();
    setProducts([]);
    setTotalCount(0);
    setTotalPages(null);
    setError('');
    setErrorDetails('');
    setLoading(true);
  };

  useEffect(() => {
    let cancelled = false;
    const requestId = ++requestIdRef.current;
    const params = { page, limit: PAGE_SIZE, sort: filters.sort };
    if (filters.gender) params.gender = filters.gender;
    if (filters.category) params.category = filters.category;
    if (filters.size) params.size = filters.size;
    if (filters.colour) params.colour = filters.colour;
    const endpoint = `/api/products?${new URLSearchParams(params).toString()}`;

    const loadPage = async () => {
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
    if (!loading && !error && hasMore) setPage((current) => current + 1);
  }, [loading, error, hasMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || error || loading) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) loadNextPage();
    }, { rootMargin: '300px' });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [error, hasMore, loading, loadNextPage]);

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

  return (
    <section className="overflow-hidden border-b border-xora-taupe/30 py-10 sm:py-14" aria-labelledby="homepage-collection-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-6 border-b border-xora-taupe/20 pb-4">
          <span className="text-[11px] font-medium uppercase tracking-luxury text-xora-taupe-dark">YAQANA</span>
          <h2 id="homepage-collection-title" className="mt-1 font-serif text-3xl tracking-wide text-xora-charcoal sm:text-4xl">OUR COLLECTION</h2>
          <p className="mt-2 text-sm font-light text-xora-taupe-dark">Discover the YAQANA collection.</p>
        </header>

        <div className="mb-5 overflow-x-auto border-b border-xora-taupe/30 pb-4">
          <div className="flex min-w-max items-center gap-2">
            {filterSelect('Gender', filters.gender, 'gender', availableGenders, 'Gender')}
            {filterSelect('Categories', filters.category, 'category', availableCategories, 'Categories')}
            {filterSelect('Size', filters.size, 'size', availableSizes, 'Size')}
            {filterSelect('Colour', filters.colour, 'colour', availableColours, 'Colour')}
            <label className="relative shrink-0">
              <span className="sr-only">Sort</span>
              <select aria-label="Sort" value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)}
                className="appearance-none rounded-full border border-xora-taupe/40 bg-white py-2.5 pl-4 pr-9 text-xs text-xora-charcoal hover:border-xora-charcoal focus:border-xora-charcoal focus:outline-none">
                <option value="popular">Sort: Popular</option><option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-xora-taupe-dark" />
            </label>
            <label className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-xs transition-colors ${filters.under999 ? 'border-xora-charcoal bg-xora-charcoal text-white' : 'border-xora-taupe/40 bg-white text-xora-charcoal hover:border-xora-charcoal'}`}>
              <input type="checkbox" checked={filters.under999} onChange={(event) => updateFilter('under999', event.target.checked)} />
              Under ₹999
            </label>
            {activeFilters && <button type="button" onClick={clearFilters} className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-xs text-xora-taupe-dark underline hover:text-xora-charcoal"><RotateCcw className="h-3 w-3" />Clear filters</button>}
          </div>
        </div>

        <p className="mb-5 text-xs text-xora-taupe-dark" aria-live="polite"><strong className="font-medium text-xora-charcoal">{visibleProducts.length}</strong> products</p>

        {visibleProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4 xl:gap-8">
            {visibleProducts.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-xora-taupe-dark" role="status"><LoaderCircle className="h-4 w-4 animate-spin" />Loading the collection...</div>
        ) : error ? (
          <div className="py-5 text-center">
            <p className="text-sm text-xora-taupe-dark" role="alert">{error}</p>
            {errorDetails && <p className="mx-auto mt-2 max-w-2xl break-all text-xs text-xora-taupe-dark/80">{errorDetails}</p>}
            <button type="button" onClick={() => { setError(''); setErrorDetails(''); setLoading(true); setRetryCount((current) => current + 1); }} className="mt-3 text-xs uppercase tracking-luxury underline underline-offset-4">Try again</button>
          </div>
        ) : (
          <p className="py-8 text-center font-serif text-xl text-xora-taupe-dark">No products match these filters.</p>
        )}

        <div ref={sentinelRef} className="h-px" aria-hidden="true" />
        {loading && products.length > 0 && <div className="flex items-center justify-center gap-2 pt-8 text-sm text-xora-taupe-dark" role="status"><LoaderCircle className="h-4 w-4 animate-spin" />Loading more...</div>}
        {error && products.length > 0 && <p className="pt-6 text-center text-sm text-xora-taupe-dark" role="status">{error} <button type="button" onClick={() => { setError(''); setErrorDetails(''); setLoading(true); setRetryCount((current) => current + 1); }} className="underline">Retry</button></p>}
      </div>
    </section>
  );
}
