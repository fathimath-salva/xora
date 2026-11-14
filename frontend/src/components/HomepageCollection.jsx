import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, LoaderCircle, RotateCcw } from 'lucide-react';
import ProductCard from './ProductCard';
import { productService } from '../services/api';
import { catalogUnitsToRupees } from '../utils/currency';

const PAGE_SIZE = 8;
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
  const requestIdRef = useRef(0);
  const pageLoadedIdsRef = useRef(new Set());
  const pageRequestRef = useRef(false);

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
    setPage(1);
    pageLoadedIdsRef.current = new Set();
    pageRequestRef.current = false;
    setProducts([]);
    setTotalCount(0);
    setTotalPages(null);
    setError('');
    setLoading(true);
  };
  const clearFilters = () => {
    setFilters(initialFilters);
    setPage(1);
    pageLoadedIdsRef.current = new Set();
    pageRequestRef.current = false;
    setProducts([]);
    setTotalCount(0);
    setTotalPages(null);
    setError('');
    setLoading(true);
  };
  const activeFilters = Object.entries(filters).some(([key, value]) => key === 'sort' ? value !== 'popular' : Boolean(value));

  useEffect(() => {
    let cancelled = false;
    const requestId = ++requestIdRef.current;
    const params = { page, limit: PAGE_SIZE, sort: filters.sort };
    if (filters.gender) params.gender = filters.gender;
    if (filters.category) params.category = filters.category;
    if (filters.size) params.size = filters.size;
    if (filters.colour) params.colour = filters.colour;

    const loadPage = async () => {
      pageRequestRef.current = true;
      setLoading(true);
      setError('');
      try {
        const { data } = await productService.getProducts(params);
        if (!data?.success || !Array.isArray(data.products)) throw new Error(data?.message || 'The product response did not contain a products array.');
        if (cancelled || requestId !== requestIdRef.current) return;
        const received = data.products.filter((product) => product?._id);
        if (page === 1) pageLoadedIdsRef.current = new Set();
        const fresh = received.filter((product) => !pageLoadedIdsRef.current.has(product._id));
        fresh.forEach((product) => pageLoadedIdsRef.current.add(product._id));
        setProducts((current) => page === 1 ? fresh : [...current, ...fresh]);
        setTotalCount(Number.isFinite(Number(data.totalCount)) ? Number(data.totalCount) : received.length);
        setTotalPages(Number.isInteger(Number(data.totalPages)) ? Number(data.totalPages) : null);
      } catch (requestError) {
        if (!cancelled && requestId === requestIdRef.current) {
          const status = requestError.response?.status;
          setError(`We could not load products. ${status ? `The server returned HTTP ${status}.` : 'The API server could not be reached.'}`);
          console.error('Homepage collection request failed:', requestError);
        }
      } finally {
        if (requestId === requestIdRef.current) pageRequestRef.current = false;
        if (!cancelled && requestId === requestIdRef.current) setLoading(false);
      }
    };
    loadPage();
    return () => { cancelled = true; };
  }, [page, filters.gender, filters.category, filters.size, filters.colour, filters.sort, filters.under999, retryCount]);

  const availableCategories = useMemo(() => [...new Set(products.map((product) => product.category).filter(Boolean))].sort(), [products]);
  const availableSizes = useMemo(() => [...new Set(products.flatMap((product) => product.sizes || []))].sort(), [products]);
  const availableColours = useMemo(() => [...new Set(products.flatMap((product) => (product.colours || []).map((colour) => typeof colour === 'string' ? colour : colour?.name).filter(Boolean)))].sort(), [products]);
  const availableGenders = useMemo(() => [...new Set(products.map((product) => product.gender).filter(Boolean))].sort(), [products]);
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
    if (pageRequestRef.current || loading || error || !hasMore) return;
    pageRequestRef.current = true;
    setPage((current) => current + 1);
  }, [loading, error, hasMore]);
  const filterSelect = (label, value, name, options, placeholder) => (
    <label className="relative shrink-0">
      <span className="sr-only">{label}</span>
      <select aria-label={label} value={value} onChange={(event) => updateFilter(name, event.target.value)} className="appearance-none rounded-full border border-xora-taupe/40 bg-white py-2.5 pl-4 pr-9 text-xs text-xora-charcoal hover:border-xora-charcoal focus:border-xora-charcoal focus:outline-none">
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-xora-taupe-dark" />
    </label>
  );

  return (
    <section className="border-b border-xora-taupe/30 py-10 sm:py-14" aria-labelledby="homepage-collection-title">
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
            <label className="relative shrink-0"><span className="sr-only">Sort</span><select aria-label="Sort" value={filters.sort} onChange={(event) => updateFilter('sort', event.target.value)} className="appearance-none rounded-full border border-xora-taupe/40 bg-white py-2.5 pl-4 pr-9 text-xs text-xora-charcoal"><option value="popular">Sort: Popular</option><option value="newest">Newest</option><option value="price-asc">Price: Low to High</option><option value="price-desc">Price: High to Low</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-xora-taupe-dark" /></label>
            <label className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-xs ${filters.under999 ? 'border-xora-charcoal bg-xora-charcoal text-white' : 'border-xora-taupe/40 bg-white text-xora-charcoal'}`}><input type="checkbox" checked={filters.under999} onChange={(event) => updateFilter('under999', event.target.checked)} />Under ₹999</label>
            {activeFilters && <button type="button" onClick={clearFilters} className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-xs text-xora-taupe-dark underline"><RotateCcw className="h-3 w-3" />Clear filters</button>}
          </div>
        </div>
        <p className="mb-5 text-xs text-xora-taupe-dark" aria-live="polite"><strong className="font-medium text-xora-charcoal">{visibleProducts.length}</strong> products</p>
        {loading && products.length === 0 ? <div className="flex items-center justify-center gap-2 py-8 text-sm text-xora-taupe-dark" role="status"><LoaderCircle className="h-4 w-4 animate-spin" />Loading the collection...</div> : visibleProducts.length > 0 ? <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4 xl:gap-8">{visibleProducts.map((product) => <ProductCard key={product._id} product={product} />)}</div> : error ? <p className="py-8 text-center text-sm text-xora-taupe-dark" role="alert">{error} <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="underline">Try again</button></p> : <p className="py-8 text-center font-serif text-xl text-xora-taupe-dark">No products match these filters.</p>}
        {loading && products.length > 0 && <div className="flex items-center justify-center gap-2 pt-8 text-sm text-xora-taupe-dark" role="status"><LoaderCircle className="h-4 w-4 animate-spin" />Loading more...</div>}
        {error && products.length > 0 && <p className="pt-6 text-center text-sm text-xora-taupe-dark" role="status">{error} <button type="button" onClick={() => setRetryCount((count) => count + 1)} className="underline">Retry</button></p>}
        {!loading && !error && products.length > 0 && !hasMore && <p className="pt-8 text-center text-sm text-xora-taupe-dark">You’ve reached the end of the collection.</p>}
        {hasMore && <div className="mt-8 text-center"><button type="button" onClick={loadNextPage} disabled={loading || Boolean(error)} className="border border-xora-charcoal px-8 py-3 text-xs uppercase tracking-luxury text-xora-charcoal transition-colors hover:bg-xora-charcoal hover:text-white disabled:cursor-wait disabled:opacity-50">{loading ? 'Loading…' : 'Next'}</button></div>}
      </div>
    </section>
  );
}
