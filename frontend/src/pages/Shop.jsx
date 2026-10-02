import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ChevronDown, SlidersHorizontal, RotateCcw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { productService, categoryService } from '../services/api';
import { formatInr } from '../utils/currency';

export default function Shop({ initialGender = 'all', pageTitle = 'All Collections' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters state initialized from query params
  const categoryParam = searchParams.get('category') || 'All';
  const genderParam = initialGender !== 'all' ? initialGender : searchParams.get('gender') || 'all';
  const sortParam = searchParams.get('sort') || 'newest';
  const sizeParam = searchParams.get('size') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const filterParam = searchParams.get('filter') || '';

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedGender, setSelectedGender] = useState(genderParam);
  const [selectedSize, setSelectedSize] = useState(sizeParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam || 600);
  const [sort, setSort] = useState(sortParam);

  // Fetch categories once
  useEffect(() => {
    categoryService.getCategories().then((res) => {
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    });
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        const params = {
          sort,
          maxPrice: maxPrice ? Number(maxPrice) : undefined
        };

        if (selectedCategory && selectedCategory !== 'All') {
          params.category = selectedCategory;
        }

        if (selectedGender && selectedGender !== 'all') {
          params.gender = selectedGender;
        }

        if (selectedSize) {
          params.size = selectedSize;
        }

        if (filterParam === 'new') {
          params.newArrival = true;
        } else if (filterParam === 'featured') {
          params.featured = true;
        }

        const res = await productService.getProducts(params);
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [selectedCategory, selectedGender, selectedSize, maxPrice, sort, filterParam]);

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedGender(initialGender);
    setSelectedSize('');
    setMaxPrice(600);
    setSort('newest');
    setSearchParams({});
  };

  const sizesList = ['XS', 'S', 'M', 'L', 'XL'];

  return (
    <div className="bg-xora-cream min-h-screen text-xora-charcoal py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark font-medium">
            Wardrobe Archive
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-xora-charcoal mt-1 tracking-wide">
            {pageTitle}
          </h1>
          <p className="text-xs text-xora-taupe-dark mt-2 font-light">
            Architectural tailoring, pure natural fibers, and timeless silhouettes.
          </p>
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
            </button>

            <span className="text-xs text-xora-taupe-dark">
              Showing <strong className="text-xora-charcoal font-medium">{products.length}</strong> styles
            </span>

            {(selectedCategory !== 'All' || selectedSize || (initialGender === 'all' && selectedGender !== 'all') || Number(maxPrice) < 600) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="hidden sm:inline-flex items-center space-x-1 text-xs text-xora-taupe-dark hover:text-xora-charcoal transition-colors underline"
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
                onChange={(e) => setSort(e.target.value)}
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
          <aside className="hidden lg:block space-y-8 pr-4 border-r border-xora-taupe/20">
            {/* Gender Filter (if viewing all) */}
            {initialGender === 'all' && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-luxury text-xora-charcoal mb-3">
                  Department
                </h3>
                <div className="space-y-1.5 text-xs">
                  {['all', 'women', 'men'].map((g) => (
                    <label key={g} className="flex items-center space-x-2.5 cursor-pointer text-xora-taupe-dark hover:text-xora-charcoal">
                      <input
                        type="radio"
                        name="gender"
                        checked={selectedGender === g}
                        onChange={() => setSelectedGender(g)}
                        className="accent-xora-charcoal w-3.5 h-3.5"
                      />
                      <span className="capitalize">{g === 'all' ? 'All Departments' : `${g}'s Collection`}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Category Filter */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-luxury text-xora-charcoal mb-3">
                Category
              </h3>
              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('All')}
                  className={`block w-full text-left transition-colors ${
                    selectedCategory === 'All'
                      ? 'font-bold text-xora-charcoal pl-1 border-l-2 border-xora-charcoal'
                      : 'text-xora-taupe-dark hover:text-xora-charcoal'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`flex items-center justify-between w-full text-left transition-colors ${
                      selectedCategory === cat.name
                        ? 'font-bold text-xora-charcoal pl-1 border-l-2 border-xora-charcoal'
                        : 'text-xora-taupe-dark hover:text-xora-charcoal'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-[10px] text-xora-taupe-dark/80">({cat.itemCount})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-luxury text-xora-charcoal mb-3">
                Size
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {sizesList.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                    className={`w-9 h-9 text-xs flex items-center justify-center border transition-all ${
                      selectedSize === sz
                        ? 'border-xora-charcoal bg-xora-charcoal text-white font-medium'
                        : 'border-xora-taupe/40 bg-white text-xora-charcoal hover:border-xora-charcoal'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-luxury text-xora-charcoal">
                  Maximum Price
                </h3>
                <span className="text-xs font-medium text-xora-charcoal">{formatInr(maxPrice)}</span>
              </div>
              <input
                type="range"
                min="100"
                max="600"
                step="25"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full accent-xora-charcoal h-1 bg-xora-taupe/30 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-xora-taupe-dark mt-1">
                <span>{formatInr(100)}</span>
                <span>{formatInr(600)}+</span>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3">
            {loading ? (
              <LoadingSpinner message="Refining wardrobe selection..." />
            ) : products.length === 0 ? (
              <EmptyState
                title="No pieces match your filter."
                subtitle="Try loosening your filters or resetting to view the full atelier collection."
                actionText="RESET ALL FILTERS"
                actionLink="#"
                onClick={handleResetFilters}
              />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-6">
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
                  Filter Collection
                </h2>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-xora-charcoal/70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Department */}
              {initialGender === 'all' && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-luxury text-xora-charcoal mb-2">
                    Department
                  </h4>
                  <div className="flex gap-2">
                    {['all', 'women', 'men'].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setSelectedGender(g)}
                        className={`flex-1 py-2 text-xs uppercase tracking-wider border rounded-xs capitalize ${
                          selectedGender === g
                            ? 'bg-xora-charcoal text-white border-xora-charcoal'
                            : 'bg-white text-xora-charcoal border-xora-taupe/40'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-luxury text-xora-charcoal mb-2">
                  Category
                </h4>
                <div className="space-y-1.5 text-xs max-h-40 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('All')}
                    className={`block w-full text-left py-1 ${
                      selectedCategory === 'All' ? 'font-bold text-xora-charcoal' : 'text-xora-taupe-dark'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`block w-full text-left py-1 ${
                        selectedCategory === cat.name ? 'font-bold text-xora-charcoal' : 'text-xora-taupe-dark'
                      }`}
                    >
                      {cat.name} ({cat.itemCount})
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-luxury text-xora-charcoal mb-2">
                  Size
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {sizesList.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                      className={`w-9 h-9 text-xs flex items-center justify-center border ${
                        selectedSize === sz
                          ? 'border-xora-charcoal bg-xora-charcoal text-white'
                          : 'border-xora-taupe/40 bg-white text-xora-charcoal'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold uppercase tracking-luxury">Max Price</span>
                  <span className="font-medium">{formatInr(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="600"
                  step="25"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full accent-xora-charcoal h-1"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-xora-taupe/20 space-y-2">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="btn-luxury w-full"
              >
                APPLY FILTERS
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
