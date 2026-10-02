import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatInr } from '../utils/currency';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || 'M');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [addedNotice, setAddedNotice] = useState(false);

  if (!product) return null;

  const isFavorited = isInWishlist(product._id);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addToCart(product, selectedSize, product.colours?.[0]?.name || 'Default', 1);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
      setShowQuickAdd(false);
    }, 1500);
  };

  const handleHeartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative flex flex-col h-full bg-transparent">
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-xora-sand/60 rounded-xs mb-3.5">
        <Link to={`/product/${product._id}`} className="block w-full h-full">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col space-y-1 z-10">
          {product.discountPrice && (
            <span className="bg-xora-charcoal text-white text-[10px] uppercase tracking-widest px-2 py-0.5 font-medium">
              Sale
            </span>
          )}
          {product.newArrival && !product.discountPrice && (
            <span className="bg-xora-offwhite/90 backdrop-blur-xs text-xora-charcoal text-[10px] uppercase tracking-widest px-2 py-0.5 font-medium border border-xora-taupe/40">
              New
            </span>
          )}
          {isLowStock && (
            <span className="bg-amber-100 text-amber-900 text-[10px] uppercase tracking-widest px-2 py-0.5 font-medium border border-amber-300">
              Only {product.stock} Left
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-neutral-800 text-white text-[10px] uppercase tracking-widest px-2 py-0.5 font-medium">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist Heart Icon */}
        <button
          type="button"
          onClick={handleHeartClick}
          aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 z-10 ${
            isFavorited
              ? 'bg-xora-charcoal text-white shadow-md'
              : 'bg-white/80 backdrop-blur-xs text-xora-charcoal hover:bg-white hover:scale-110 shadow-xs'
          }`}
        >
          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : 'stroke-[1.5]'}`} />
        </button>

        {/* Desktop Quick Add Bar */}
        {!isOutOfStock && (
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex flex-col space-y-2">
            {showQuickAdd ? (
              <div className="bg-xora-offwhite p-2.5 rounded-xs shadow-lg space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-[11px] text-xora-taupe-dark">
                  <span>Select Size:</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowQuickAdd(false);
                    }}
                    className="text-xs hover:text-xora-black"
                  >
                    ✕
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {product.sizes?.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedSize(size);
                      }}
                      className={`text-xs px-2.5 py-1 rounded-xs border transition-colors ${
                        selectedSize === size
                          ? 'border-xora-charcoal bg-xora-charcoal text-white font-medium'
                          : 'border-xora-taupe/40 bg-white text-xora-charcoal hover:border-xora-charcoal'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className="btn-luxury w-full py-2 text-[10px]"
                >
                  {addedNotice ? (
                    <span className="flex items-center justify-center space-x-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>ADDED TO BAG</span>
                    </span>
                  ) : (
                    'CONFIRM & ADD'
                  )}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowQuickAdd(true);
                }}
                className="w-full bg-white/95 backdrop-blur-xs text-xora-charcoal text-[11px] uppercase tracking-luxury font-medium py-2.5 hover:bg-xora-charcoal hover:text-white transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-grow">
        <p className="text-[11px] uppercase tracking-widest text-xora-taupe-dark mb-1">
          {product.category}
        </p>

        <h3 className="font-serif text-sm sm:text-base font-normal text-xora-charcoal hover:text-xora-taupe-dark transition-colors line-clamp-1 mb-1">
          <Link to={`/product/${product._id}`}>{product.name}</Link>
        </h3>

        {/* Pricing */}
        <div className="flex items-center space-x-2 mt-auto pt-1">
          {product.discountPrice ? (
            <>
              <span className="text-xs sm:text-sm font-semibold text-xora-charcoal">
                {formatInr(product.discountPrice)}
              </span>
              <span className="text-xs text-xora-taupe-dark line-through">
                {formatInr(product.price)}
              </span>
            </>
          ) : (
            <span className="text-xs sm:text-sm font-semibold text-xora-charcoal">
              {formatInr(product.price)}
            </span>
          )}
        </div>

        {/* Colour swatches indicator */}
        {product.colours && product.colours.length > 0 && (
          <div className="flex items-center space-x-1.5 mt-2">
            {product.colours.slice(0, 4).map((c, i) => (
              <span
                key={i}
                title={c.name}
                className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                style={{ backgroundColor: c.hex || '#C4B5A5' }}
              />
            ))}
            {product.colours.length > 4 && (
              <span className="text-[10px] text-xora-taupe-dark font-mono">
                +{product.colours.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
