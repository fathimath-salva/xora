import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { X, ChevronDown, SlidersHorizontal, RotateCcw, Tag, Sparkles, Layers } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { productService } from '../services/api';
import { buildShopProductParams, SHOP_CATEGORIES } from '../utils/shopFilters';

export default function Shop({ initialGender = 'men', pageTitle = "Men's Collection" }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [availableSizes, setAvailableSizes] = useState([]);
  const [availableColours, setAvailableColours] = useState([]);

  // Read filters from URL query params
  const categoryParam = searchParams.get('category') || 'All';
  const collectionParam = searchParams.get('collection') || '';
  const sortParam = searchParams.get('sort') || 'newest';
  const sizeParam = searchParams.get('size') || '';
  const filterParam = searchParams.get('filter') || '';
  const searchTerm = searchParams.get('search') || '';
  const colourParam = searchParams.get('colour') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const [priceDraft, setPriceDraft] = useState({ min: minPriceParam, max: maxPriceParam });
  const [priceError, setPriceError] = useState('');

  const selectedCategory = categoryParam;
  const selectedCollection = collectionParam;
  const selectedSize = sizeParam;
  const selectedColour = colourParam;
  const sort = sortParam;

  useEffect(() => {
    setPriceDraft({ min: minPriceParam, max: maxPriceParam });
  }, [minPriceParam, maxPriceParam]);

  const updateShopParam = useCallback((key, value) => setSearchParams((current) => {
    const next = new URLSearchParams(current);
    if (value) next.set(key, value);
    else next.delete(key);
    return next;
  }), [setSearchParams]);
  const shopLinkWithParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    next.set(key, value);
    return `/shop?${next.toString()}`;
  };

  // Determine the active page heading
  const getPageHeading = () => {
    if (filterParam === 'new') return 'New Arrivals';
    if (selectedCollection) return selectedCollection;
    if (selectedCategory && selectedCategory !== 'All') return selectedCategory;
    return pageTitle;
  };

  const getPageSubtitle = () => {
    if (filterParam === 'new') return 'The latest pieces to arrive at the YAQANA atelier.';
    if (selectedCollection) return `Products in the ${selectedCollection} collection.`;
    if (selectedCategory === 'T-Shirts') return 'Premium cotton jersey, polos, and relaxed-fit essentials.';
    if (selectedCategory === 'Hoodies') return 'Soft brushed-fleece layers for cooler days and relaxed weekends.';
    if (selectedCategory === 'Shirts') return 'Oxford, linen, poplin, and chambray shirts for every occasion.';
    if (selectedCategory === 'Trousers') return 'Tailored wool, refined chinos, and wide-leg linen trousers.';
    if (selectedCategory === 'Jeans') return 'Denim in considered washes, made for everyday rotation.';
    if (selectedCategory === 'Jackets') return 'Lightweight layers and enduring outerwear silhouettes.';
    return 'Architectural tailoring, natural fibers, and enduring menswear silhouettes.';
  };

  // Fetch collections once
  useEffect(() => {
    productService.getCollections().then((res) => setCollections(res.data.collections || [])).catch(() => {});
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const params = buildShopProductParams({
          category: selectedCategory,
          collection: selectedCollection,
          colour: selectedColour,
          minPrice: minPriceParam,
          maxPrice: maxPriceParam,
          search: searchTerm,
          size: selectedSize,
          sort,
          filter: filterParam
        });

        const res = await productService.getProducts(params);
        if (!res.data?.success || !Array.isArray(res.data.products)) {
          throw new Error(res.data?.message || 'The product service returned an unexpected response.');
        }
        if (selectedCollection && res.data.products.some((product) => product.collectionName !== selectedCollection)) {
          throw new Error('Collection filtering is unavailable. Please update the backend deployment and try again.');
        }

        setProducts(res.data.products);
        setTotalCount(res.data.totalCount ?? res.data.products.length);
        setCollections((current) => current.length ? current : Array.from(new Set(
          res.data.products.map((product) => product.collectionName).filter(Boolean)
        )).sort((a, b) => a.localeCompare(b)));

        // Build the available sizes list from all products in the current view
        setAvailableSizes((current) => {
          const allSizes = Array.from(new Set([
            ...current,
            ...res.data.products.flatMap((product) => product.sizes || [])
          ]));
          const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
          return allSizes.sort((a, b) => {
            const ai = order.indexOf(a);
            const bi = order.indexOf(b);
            if (ai >= 0 && bi >= 0) return ai - bi;
            if (ai >= 0) return 1;
            if (bi >= 0) return -1;
            return a.localeCompare(b, undefined, { numeric: true });
          });
        });
        setAvailableColours(Array.from(new Set(
          res.data.products.flatMap((product) => (product.colours || []).map((colour) => colour.name).filter(Boolean))
        )).sort((a, b) => a.localeCompare(b)));
      } catch (err) {
        setLoadError(err.response?.data?.message || err.message || 'We could not load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
    // Reset sizes when category changes so we don't show stale sizes
    setAvailableSizes([]);
    setAvailableColours([]);
  }, [selectedCategory, selectedCollection, selectedSize, selectedColour, minPriceParam, maxPriceParam, sort, filterParam, searchTerm, retryCount]);

  const hasActiveFilter = selectedCategory !== 'All' || selectedCollection || selectedSize || selectedColour || minPriceParam || maxPriceParam || filterParam;

  const handleResetFilters = () => {
    setSearchParams({});
    setPriceError('');
  };

  const applyPriceFilter = (event) => {
    event.preventDefault();
    const min = priceDraft.min.trim();
    const max = priceDraft.max.trim();
    if ((min && (!Number.isFinite(Number(min)) || Number(min) < 0)) ||
        (max && (!Number.isFinite(Number(max)) || Number(max) < 0))) {
      setPriceError('Enter a valid non-negative price.');
      return;
    }
    if (min && max && Number(min) > Number(max)) {
      setPriceError('Minimum price cannot exceed maximum price.');
      return;
    }
    setPriceError('');
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (min) next.set('minPrice', min);
      else next.delete('minPrice');
      if (max) next.set('maxPrice', max);
      else next.delete('maxPrice');
      return next;
    });
  };

  return (
    <div className="bg-xora-cream min-h-screen text-xora-charcoal py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark font-medium">
            Wardrobe Archive
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-xora-charcoal mt-1 tracking-wide">
            {getPageHeading()}
          </h1>
          <p className="text-xs text-xora-taupe-dark mt-2 font-light">
            {getPageSubtitle()}
          </p>
        </div>

        {/* Category Navigation Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <Link
            to="/shop"
            state={{ scrollToTop: true }}
            className={`inline-flex items-center px-4 py-1.5 text-[11px] uppercase tracking-luxury border transition-all ${
              selectedCategory === 'All' && !filterParam && !selectedCollection
                ? 'bg-xora-charcoal text-white border-xora-charcoal'
                : 'border-xora-taupe/40 text-xora-taupe-dark hover:border-xora-charcoal hover:text-xora-charcoal bg-white'
            }`}
            id="shop-all-link"
          >
            All Products
          </Link>
          <Link
            to={shopLinkWithParam('filter', 'new')}
            className={`inline-flex items-center gap-1 px-4 py-1.5 text-[11px] uppercase tracking-luxury border transition-all ${
              filterParam === 'new'
                ? 'bg-xora-charcoal text-white border-xora-charcoal'
                : 'border-xora-taupe/40 text-xora-taupe-dark hover:border-xora-charcoal hover:text-xora-charcoal bg-white'
            }`}
            id="shop-new-link"
          >
            <Sparkles className="w-3 h-3" />
            New
          </Link>
          {collections.length > 0 && collections.map((col) => (
            <Link
              key={col}
              to={shopLinkWithParam('collection', col)}
              state={{ scrollToTop: true }}
              className={`inline-flex items-center gap-1 px-4 py-1.5 text-[11px] uppercase tracking-luxury border transition-all ${
                selectedCollection === col
                  ? 'bg-xora-charcoal text-white border-xora-charcoal'
                  : 'border-xora-taupe/40 text-xora-taupe-dark hover:border-xora-charcoal hover:text-xora-charcoal bg-white'
              }`}
            >
              <Layers className="w-3 h-3" />
              {col}
            </Link>
          ))}
          {SHOP_CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={shopLinkWithParam('category', cat)}
              state={{ scrollToTop: true }}
              className={`inline-flex items-center gap-1 px-4 py-1.5 text-[11px] uppercase tracking-luxury border transition-all ${
                selectedCategory === cat && !filterParam
                  ? 'bg-xora-charcoal text-white border-xora-charcoal'
                  : 'border-xora-taupe/40 text-xora-taupe-dark hover:border-xora-charcoal hover:text-xora-charcoal bg-white'
              }`}
              id={`shop-cat-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Tag className="w-3 h-3" />
              {cat}
            </Link>
          ))}
        </div>

        {/* Filter & Sort Controls Bar */}
        <div className="flex flex-wrap items-center justify-between pb-6 mb-8 border-b border-xora-taupe/30 gap-4">
          <div className="flex items-center space-x-3">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center space-x-2 text-xs uppercase tracking-luxury font-medium border border-xora-taupe/40 px-4 py-2.5 bg-white text-xora-charcoal hover:border-xora-charcoal"
              id="mobile-filter-open-btn"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {(selectedSize || selectedColour || minPriceParam || maxPriceParam) && (
                <span className="ml-1 bg-xora-charcoal text-white text-[10px] px-1.5 py-0.5 rounded">Active</span>
              )}
            </button>

            <span className="text-xs text-xora-taupe-dark">
              Showing <strong className="text-xora-charcoal font-medium">{totalCount}</strong> styles
            </span>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="hidden sm:inline-flex items-center space-x-1 text-xs text-xora-taupe-dark hover:text-xora-charcoal transition-colors underline"
                id="reset-filters-btn"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center space-x-2">
            <label htmlFor="shop-sort" className="text-xs text-xora-taupe-dark uppercase tracking-wider hidden sm:inline">
              Sort By:
            </label>
            <div className="relative">
              <select
                id="shop-sort"
                value={sort}
                onChange={(e) => updateShopParam('sort', e.target.value === 'newest' ? '' : e.target.value)}
                className="appearance-none bg-white border border-xora-taupe/40 px-4 py-2.5 pr-8 text-xs text-xora-charcoal focus:outline-none focus:border-xora-charcoal font-medium cursor-pointer"
              >
                <option value="newest">Newest Additions</option>
                <option value="featured">Featured First</option>
                <option value="popular">Best Sellers</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-xora-taupe-dark absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block space-y-6 pr-4 border-r border-xora-taupe/20">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-luxury text-xora-charcoal mb-4">
                Filter by Size
              </h3>
              {availableSizes.length === 0 ? (
                <p className="text-xs text-xora-taupe-dark">
                  {loading ? 'Loading sizes…' : loadError ? 'Sizes unavailable.' : 'No sizes available.'}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => updateShopParam('size', selectedSize === sz ? '' : sz)}
                      className={`w-10 h-10 text-xs flex items-center justify-center border transition-all font-medium ${
                        selectedSize === sz
                          ? 'border-xora-charcoal bg-xora-charcoal text-white shadow-sm'
                          : 'border-xora-taupe/40 bg-white text-xora-charcoal hover:border-xora-charcoal'
                      }`}
                      id={`size-filter-${sz}`}
                      aria-pressed={selectedSize === sz}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              )}
              {selectedSize && (
                <button
                  type="button"
                  onClick={() => updateShopParam('size', '')}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-xora-taupe-dark hover:text-xora-charcoal underline"
                >
                  <X className="w-3 h-3" />
                  Clear size filter
                </button>
              )}
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-luxury text-xora-charcoal mb-4">
                Filter by Colour
              </h3>
              {availableColours.length === 0 ? (
                <p className="text-xs text-xora-taupe-dark">{loading ? 'Loading colours…' : 'No colours available.'}</p>
              ) : (
                <select
                  aria-label="Filter by colour"
                  value={selectedColour}
                  onChange={(event) => updateShopParam('colour', event.target.value)}
                  className="w-full bg-white border border-xora-taupe/40 px-3 py-2.5 text-xs text-xora-charcoal focus:outline-none focus:border-xora-charcoal"
                >
                  <option value="">All colours</option>
                  {availableColours.map((colour) => <option key={colour} value={colour}>{colour}</option>)}
                </select>
              )}
            </div>
            <form onSubmit={applyPriceFilter} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-luxury text-xora-charcoal">
                Filter by Price (₹)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[10px] uppercase tracking-wider text-xora-taupe-dark">
                  Min
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={priceDraft.min}
                    onChange={(event) => setPriceDraft((current) => ({ ...current, min: event.target.value }))}
                    className="mt-1 w-full bg-white border border-xora-taupe/40 px-2 py-2 text-xs text-xora-charcoal"
                    aria-label="Minimum price in rupees"
                  />
                </label>
                <label className="text-[10px] uppercase tracking-wider text-xora-taupe-dark">
                  Max
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={priceDraft.max}
                    onChange={(event) => setPriceDraft((current) => ({ ...current, max: event.target.value }))}
                    className="mt-1 w-full bg-white border border-xora-taupe/40 px-2 py-2 text-xs text-xora-charcoal"
                    aria-label="Maximum price in rupees"
                  />
                </label>
              </div>
              {priceError && <p role="alert" className="text-xs text-red-700">{priceError}</p>}
              <button type="submit" className="btn-luxury-outline w-full">Apply Price</button>
            </form>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3">
            {loading ? (
              <LoadingSpinner message="Refining wardrobe selection…" />
            ) : loadError ? (
              <div role="alert" className="border border-red-200 bg-red-50 p-5 text-sm text-red-800">
                {loadError}
                <button type="button" onClick={() => setRetryCount((c) => c + 1)} className="ml-3 underline">Retry</button>
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                title={selectedSize ? `No products available in size ${selectedSize}.` : 'No pieces match your filter.'}
                subtitle={selectedSize ? 'Try a different size or clear the size filter to view all available styles.' : 'Try resetting your filters to view the full collection.'}
                actionText="RESET FILTERS"
                actionLink="#"
                onClick={handleResetFilters}
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Slide-over Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden overflow-hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-xora-offwhite p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-xora-taupe/20">
                <h2 className="font-serif text-xl text-xora-charcoal uppercase tracking-wider">
                  Filters
                </h2>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-xora-charcoal/70"
                  aria-label="Close filter drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <p className="text-xs text-xora-taupe-dark mb-3">Select a size to filter the collection.</p>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => updateShopParam('size', selectedSize === sz ? '' : sz)}
                      className={`w-11 h-11 text-xs flex items-center justify-center border font-medium transition-all ${
                        selectedSize === sz
                          ? 'border-xora-charcoal bg-xora-charcoal text-white'
                          : 'border-xora-taupe/40 bg-white text-xora-charcoal'
                      }`}
                      aria-pressed={selectedSize === sz}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                {selectedSize && (
                  <button
                    type="button"
                    onClick={() => updateShopParam('size', '')}
                    className="mt-3 inline-flex items-center gap-1 text-xs text-xora-taupe-dark underline"
                  >
                    <X className="w-3 h-3" />
                    Clear size
                  </button>
                )}
              </div>
              <div>
                <p className="text-xs text-xora-taupe-dark mb-3">Select a colour.</p>
                <select
                  aria-label="Filter by colour"
                  value={selectedColour}
                  onChange={(event) => updateShopParam('colour', event.target.value)}
                  className="w-full bg-white border border-xora-taupe/40 px-3 py-2.5 text-xs text-xora-charcoal"
                >
                  <option value="">All colours</option>
                  {availableColours.map((colour) => <option key={colour} value={colour}>{colour}</option>)}
                </select>
              </div>
              <form onSubmit={applyPriceFilter} className="space-y-3">
                <p className="text-xs text-xora-taupe-dark">Set a price range in rupees.</p>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-[10px] uppercase tracking-wider text-xora-taupe-dark">
                    Min
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={priceDraft.min}
                      onChange={(event) => setPriceDraft((current) => ({ ...current, min: event.target.value }))}
                      className="mt-1 w-full bg-white border border-xora-taupe/40 px-2 py-2 text-xs text-xora-charcoal"
                      aria-label="Minimum price in rupees"
                    />
                  </label>
                  <label className="text-[10px] uppercase tracking-wider text-xora-taupe-dark">
                    Max
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={priceDraft.max}
                      onChange={(event) => setPriceDraft((current) => ({ ...current, max: event.target.value }))}
                      className="mt-1 w-full bg-white border border-xora-taupe/40 px-2 py-2 text-xs text-xora-charcoal"
                      aria-label="Maximum price in rupees"
                    />
                  </label>
                </div>
                {priceError && <p role="alert" className="text-xs text-red-700">{priceError}</p>}
                <button type="submit" className="btn-luxury-outline w-full">Apply Price</button>
              </form>
            </div>

            <div className="pt-6 border-t border-xora-taupe/20 space-y-2">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="btn-luxury w-full"
                id="apply-filters-mobile-btn"
              >
                APPLY
              </button>
              <button
                type="button"
                onClick={() => {
                  handleResetFilters();
                  setMobileFilterOpen(false);
                }}
                className="btn-luxury-outline w-full"
              >
                RESET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
