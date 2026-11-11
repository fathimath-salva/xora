import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, RotateCcw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { productService } from '../services/api';
import { catalogUnitsToRupees } from '../utils/currency';

export default function Shop({ initialGender = 'men' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [availableSizes, setAvailableSizes] = useState([]);

  const selectedCategory = searchParams.get('category') || 'All';
  const selectedCollection = searchParams.get('collection') || '';
  const selectedSize = searchParams.get('size') || '';
  const sort = searchParams.get('sort') || 'popular';
  const filterParam = searchParams.get('filter') || '';
  const searchTerm = searchParams.get('search') || '';
  const selectedGender = searchParams.get('gender') || initialGender;
  const selectedColour = searchParams.get('colour') || '';
  const under999 = searchParams.get('under999') === 'true';

  const updateShopParam = useCallback((key, value) => setSearchParams((current) => {
    const next = new URLSearchParams(current);
    if (value) next.set(key, value);
    else next.delete(key);
    return next;
  }), [setSearchParams]);

  useEffect(() => {
    let cancelled = false;
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const params = { sort };
        if (selectedGender !== 'all') params.gender = selectedGender;
        if (searchTerm) params.search = searchTerm;
        if (selectedCollection) params.collection = selectedCollection;
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (selectedSize) params.size = selectedSize;
        if (filterParam === 'new') params.newArrival = true;
        else if (filterParam === 'featured') params.featured = true;

        const res = await productService.getProducts(params);
        if (!res.data?.success || !Array.isArray(res.data.products)) {
          throw new Error(res.data?.message || 'The product service returned an unexpected response.');
        }
        if (selectedCollection && res.data.products.some((product) => product.collectionName !== selectedCollection)) {
          throw new Error('Collection filtering is unavailable. Please update the backend deployment and try again.');
        }
        if (cancelled) return;
        setProducts(res.data.products);
        const allSizes = Array.from(new Set(res.data.products.flatMap((product) => product.sizes || [])));
        const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
        setAvailableSizes(allSizes.sort((a, b) => {
          const ai = order.indexOf(a);
          const bi = order.indexOf(b);
          if (ai >= 0 && bi >= 0) return ai - bi;
          if (ai >= 0) return -1;
          if (bi >= 0) return 1;
          return a.localeCompare(b, undefined, { numeric: true });
        }));
      } catch (error) {
        if (!cancelled) setLoadError(error.response?.data?.message || 'We could not load products. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchFilteredProducts();
    return () => { cancelled = true; };
  }, [selectedCategory, selectedCollection, selectedSize, selectedGender, sort, filterParam, searchTerm, retryCount]);

  const filteredProducts = useMemo(() => products.filter((product) => {
    const price = Number(product.discountPrice || product.price);
    if (selectedGender !== 'all' && product.gender && product.gender.toLowerCase() !== selectedGender.toLowerCase()) return false;
    const colours = (product.colours || []).map((colour) => typeof colour === 'string' ? colour : colour?.name);
    if (selectedColour && !colours.includes(selectedColour)) return false;
    if (under999 && (!Number.isFinite(price) || catalogUnitsToRupees(price) > 999)) return false;
    return true;
  }), [products, selectedGender, selectedColour, under999]);

  const availableColours = useMemo(() => Array.from(new Set(
    products.flatMap((product) => (product.colours || [])
      .map((colour) => typeof colour === 'string' ? colour : colour?.name).filter(Boolean))
  )).sort((a, b) => a.localeCompare(b)), [products]);
  const availableCategories = useMemo(() => Array.from(new Set(products.map((product) => product.category).filter(Boolean)))
    .sort((a, b) => a.localeCompare(b)), [products]);
  const availableGenders = useMemo(() => [
    ...(new Set(products.map((product) => product.gender).filter(Boolean)).size > 1
      ? [{ value: 'all', label: 'All genders' }]
      : []),
    ...Array.from(new Set(products.map((product) => product.gender).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b))
  ], [products]);

  const hasActiveFilter = selectedCategory !== 'All' || selectedCollection || selectedSize || filterParam ||
    selectedColour || under999 || selectedGender !== initialGender;
  const handleResetFilters = () => {
    const next = new URLSearchParams();
    if (searchTerm) next.set('search', searchTerm);
    setSearchParams(next);
  };

  const filterSelect = (label, value, onChange, options, placeholder) => (
    <label className="relative shrink-0">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label}
        className="appearance-none rounded-full border border-xora-taupe/40 bg-white py-2.5 pl-4 pr-9 text-xs text-xora-charcoal hover:border-xora-charcoal focus:border-xora-charcoal focus:outline-none">
        <option value="">{placeholder}</option>
        {options.map((option) => typeof option === 'string'
          ? <option key={option} value={option}>{option}</option>
          : <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-xora-taupe-dark" />
    </label>
  );

  return (
    <div className="min-h-screen overflow-x-hidden bg-xora-cream py-10 text-xora-charcoal sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <header className="mb-7 max-w-2xl">
          <span className="text-[11px] font-medium uppercase tracking-luxury text-xora-taupe-dark">Wardrobe Archive</span>
          <h1 className="mt-1 font-serif text-3xl font-light tracking-wide text-xora-charcoal sm:text-5xl">Our Collection</h1>
          <p className="mt-2 text-xs font-light text-xora-taupe-dark">Explore considered essentials, refined fabrics and enduring silhouettes.</p>
        </header>

        <div className="mb-5 overflow-x-auto border-b border-xora-taupe/30 pb-4">
          <div className="flex min-w-max items-center gap-2">
            {filterSelect('Gender', selectedGender === initialGender ? '' : selectedGender,
              (value) => updateShopParam('gender', value), availableGenders, 'Gender')}
            {filterSelect('Categories', selectedCategory === 'All' ? '' : selectedCategory,
              (value) => updateShopParam('category', value), availableCategories, 'Categories')}
            {filterSelect('Size', selectedSize, (value) => updateShopParam('size', value), availableSizes, 'Size')}
            {filterSelect('Colour', selectedColour, (value) => updateShopParam('colour', value), availableColours, 'Colour')}
            {filterSelect('Sort', sort, (value) => updateShopParam('sort', value),
              [
                { value: 'popular', label: 'Popular' },
                { value: 'newest', label: 'Newest' },
                { value: 'price-asc', label: 'Price: Low to High' },
                { value: 'price-desc', label: 'Price: High to Low' }
              ], 'Sort: Popular')}
            <label className={`inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-xs transition-colors ${under999 ? 'border-xora-charcoal bg-xora-charcoal text-white' : 'border-xora-taupe/40 bg-white text-xora-charcoal hover:border-xora-charcoal'}`}>
              <input type="checkbox" checked={under999} onChange={(event) => updateShopParam('under999', event.target.checked ? 'true' : '')} />
              Under ₹999
            </label>
            {hasActiveFilter && <button type="button" onClick={handleResetFilters} className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-xs text-xora-taupe-dark underline hover:text-xora-charcoal" id="reset-filters-btn"><RotateCcw className="h-3 w-3" />Clear filters</button>}
          </div>
        </div>

        <div className="mb-6 text-xs text-xora-taupe-dark">Showing <strong className="font-medium text-xora-charcoal">{filteredProducts.length}</strong> styles</div>
        {loading ? <LoadingSpinner message="Refining wardrobe selection…" /> : loadError ? (
          <div role="alert" className="border border-red-200 bg-red-50 p-5 text-sm text-red-800">
            {loadError}<button type="button" onClick={() => setRetryCount((count) => count + 1)} className="ml-3 underline">Retry</button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState title={selectedSize ? `No products available in size ${selectedSize}.` : 'No pieces match your filter.'}
            subtitle="Try clearing a filter to view more of the collection." actionText="RESET FILTERS" actionLink="#" onClick={handleResetFilters} />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
            {filteredProducts.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  );
}
