import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatInr } from '../utils/currency';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingFee
  } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  const threshold = 200;
  const remainingForFreeShipping = Math.max(0, threshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / threshold) * 100);

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleViewCart = () => {
    closeCart();
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-xora-charcoal/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-xora-offwhite shadow-2xl flex flex-col justify-between animate-fade-in border-l border-xora-taupe/20">
          {/* Header */}
          <div className="px-6 py-5 border-b border-xora-taupe/20 flex items-center justify-between bg-white/50">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4 text-xora-charcoal" />
              <h2 className="font-serif text-lg tracking-wider uppercase text-xora-charcoal">
                Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-1.5 text-xora-charcoal/70 hover:text-xora-charcoal hover:bg-xora-sand/50 rounded-full transition-colors"
              id="close-cart-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary shipping bar */}
          <div className="bg-xora-sand/40 px-6 py-3 border-b border-xora-taupe/20 text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-xora-charcoal/80 mb-1.5">
                Add <span className="font-semibold text-xora-charcoal">{formatInr(remainingForFreeShipping)}</span> more to unlock complimentary delivery
              </p>
            ) : (
              <p className="text-emerald-800 font-medium mb-1.5">
                ✓ You have unlocked complimentary express shipping
              </p>
            )}
            <div className="w-full bg-xora-taupe/30 h-1 rounded-full overflow-hidden">
              <div
                className="bg-xora-charcoal h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-xora-taupe/20">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-xora-sand/50 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-xora-taupe-dark" />
                </div>
                <h3 className="font-serif text-2xl text-xora-charcoal mb-2">
                  Your bag is waiting.
                </h3>
                <p className="text-xs text-xora-taupe-dark max-w-xs mb-6 font-light">
                  Explore our collection of understated modern essentials to begin building your capsule wardrobe.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeCart();
                    navigate('/shop');
                  }}
                  className="btn-luxury"
                  id="empty-cart-shop-btn"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item._id} className="py-4 flex space-x-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-26 flex-shrink-0 bg-xora-sand overflow-hidden rounded-xs">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm font-normal text-xora-charcoal leading-snug">
                          {item.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item._id)}
                          className="text-xora-taupe-dark hover:text-red-600 transition-colors ml-2 p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-xora-taupe-dark mt-1 space-x-2">
                        <span>Size: <strong className="text-xora-charcoal font-medium">{item.size}</strong></span>
                        <span>•</span>
                        <span>Colour: <strong className="text-xora-charcoal font-medium">{item.colour}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity controls */}
                      <div className="flex items-center border border-xora-taupe/40 bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="p-1 px-2 text-xora-charcoal hover:bg-xora-sand/50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs px-2 font-medium min-w-[20px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="p-1 px-2 text-xora-charcoal hover:bg-xora-sand/50 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-semibold text-xora-charcoal">
                          {formatInr(item.price * item.quantity)}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="block text-[10px] text-xora-taupe-dark line-through">
                            {formatInr(item.originalPrice * item.quantity)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Checkout Actions */}
          {items.length > 0 && (
            <div className="border-t border-xora-taupe/30 p-6 bg-white/70 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-xora-taupe-dark">
                  <span>Subtotal</span>
                  <span className="font-medium text-xora-charcoal">{formatInr(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xora-taupe-dark">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? 'Complimentary' : formatInr(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-xora-charcoal pt-2 border-t border-xora-taupe/20">
                  <span>Estimated Total</span>
                  <span>{formatInr(subtotal + shippingFee)}</span>
                </div>
              </div>

              <div className="flex flex-col space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleCheckout}
                  className="btn-luxury w-full flex items-center justify-center space-x-2"
                  id="cart-drawer-checkout-btn"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleViewCart}
                  className="btn-luxury-outline w-full"
                  id="cart-drawer-view-bag-btn"
                >
                  VIEW FULL BAG
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
