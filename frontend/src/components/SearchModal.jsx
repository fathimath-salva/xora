import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { productService } from '../services/api';
import { formatInr } from '../utils/currency';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await productService.getProducts({ search: query.trim(), gender: 'men', limit: 4 });
        if (res.data.success) {
          setResults(res.data.products);
        }
      } catch (err) {
        console.warn('Search query error', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleTagClick = (tag) => {
    onClose();
    navigate(`/search?q=${encodeURIComponent(tag)}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-xora-charcoal/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative min-h-screen sm:min-h-[400px] flex items-start justify-center pt-8 sm:pt-20 px-4">
        <div className="w-full max-w-2xl bg-xora-offwhite rounded-xs shadow-2xl border border-xora-taupe/30 overflow-hidden animate-fade-in">
          {/* Search Input Bar */}
          <form onSubmit={handleSubmit} className="relative flex items-center border-b border-xora-taupe/30 px-6 py-4">
            <Search className="w-5 h-5 text-xora-taupe-dark mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search garments, fabrics, styles..."
              className="w-full bg-transparent text-base sm:text-lg text-xora-charcoal placeholder-xora-taupe-dark/70 focus:outline-none font-serif"
              id="search-modal-input"
            />
            {loading && <Loader2 className="w-5 h-5 animate-spin text-xora-taupe-dark mr-2" />}
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-xora-taupe-dark hover:text-xora-charcoal mr-2"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-xs uppercase tracking-luxury text-xora-taupe-dark hover:text-xora-charcoal pl-3 border-l border-xora-taupe/30"
            >
              Close
            </button>
          </form>

          {/* Quick Suggestions & Results */}
          <div className="p-6">
            {!query ? (
              <div>
                <p className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark mb-3">
                  Curated Searches
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Cashmere', 'Wool Overcoat', 'Pleated Trouser', 'Oxford Shirt', 'Linen Blazer', 'Knitwear'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagClick(tag)}
                      className="text-xs px-3 py-1.5 bg-xora-sand/60 hover:bg-xora-sand text-xora-charcoal rounded-xs transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : results.length > 0 ? (
              <div>
                <p className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark mb-3">
                  Live Results ({results.length})
                </p>
                <div className="space-y-3">
                  {results.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => {
                        onClose();
                        navigate(`/product/${product._id}`);
                      }}
                      className="flex items-center space-x-4 p-2 hover:bg-xora-sand/40 rounded-xs cursor-pointer transition-colors"
                    >
                      <img
                        src={product.images?.[0]}
                        alt={product.name}
                        className="w-12 h-14 object-cover rounded-xs"
                      />
                      <div className="flex-1">
                        <p className="font-serif text-sm text-xora-charcoal">{product.name}</p>
                        <p className="text-[11px] text-xora-taupe-dark">{product.category} • {product.gender}</p>
                      </div>
                      <div className="text-xs font-semibold text-xora-charcoal">
                        {formatInr(product.discountPrice || product.price)}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full mt-4 btn-luxury-outline py-2.5 text-[11px] flex items-center justify-center space-x-2"
                >
                  <span>VIEW ALL RESULTS FOR "{query}"</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : !loading ? (
              <div className="py-8 text-center text-xora-taupe-dark">
                <p className="text-sm font-serif">No products found matching "{query}"</p>
                <p className="text-xs mt-1">Try searching for cashmere, trousers, linen, or coat</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
