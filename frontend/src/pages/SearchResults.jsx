import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { productService } from '../services/api';
import { Search } from 'lucide-react';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSearch = async () => {
      try {
        setLoading(true);
        const res = await productService.getProducts({ search: query, limit: 30 });
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error('Failed to perform search query', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();
    window.scrollTo(0, 0);
  }, [query]);

  return (
    <div className="bg-xora-cream min-h-screen text-xora-charcoal py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark font-medium">
            Search Archive
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-xora-charcoal mt-1">
            {query ? `Results for "${query}"` : 'All Garments'}
          </h1>
          <p className="text-xs text-xora-taupe-dark mt-2 font-light">
            Found <strong className="text-xora-charcoal">{products.length}</strong> matching silhouettes
          </p>
        </div>

        {loading ? (
          <LoadingSpinner message="Searching atelier catalog..." />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Search}
            title={`No results for "${query}"`}
            subtitle="We could not find items matching your search term. Explore our classic collections."
            actionText="VIEW ALL PIECES"
            actionLink="/shop"
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
