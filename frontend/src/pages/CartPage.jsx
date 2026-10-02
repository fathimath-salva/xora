import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import EmptyState from '../components/EmptyState';
import { formatInr } from '../utils/currency';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    subtotal,
    shippingFee,
    estimatedTax,
    grandTotal
  } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="bg-xora-cream min-h-[70vh] flex items-center justify-center py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is waiting."
          subtitle="Discover elevated essentials designed for everyday confidence and timeless presence."
          actionText="CONTINUE SHOPPING"
          actionLink="/shop"
        />
      </div>
    );
  }

  return (
    <div className="bg-xora-cream min-h-screen text-xora-charcoal py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark font-medium">
            Review Selection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-xora-charcoal mt-1 tracking-wide">
            Your Shopping Bag
          </h1>
          <p className="text-xs text-xora-taupe-dark mt-2 font-light">
            {items.reduce((s, i) => s + i.quantity, 0)} essential pieces selected
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Items Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="hidden sm:grid grid-cols-12 text-[11px] uppercase tracking-luxury text-xora-taupe-dark pb-3 border-b border-xora-taupe/30">
              <span className="col-span-6">Garment</span>
              <span className="col-span-2 text-center">Quantity</span>
              <span className="col-span-2 text-right">Price</span>
              <span className="col-span-2 text-right">Total</span>
            </div>

            <div className="divide-y divide-xora-taupe/20 border-b border-xora-taupe/20">
              {items.map((item) => (
                <div key={item._id} className="py-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 items-center">
                  {/* Garment details */}
                  <div className="sm:col-span-6 flex space-x-4 w-full">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-26 sm:w-24 sm:h-32 object-cover rounded-xs bg-xora-sand flex-shrink-0"
                    />
                    <div className="flex flex-col justify-between py-1">
                      <div>
                        <Link
                          to={`/product/${item.productId}`}
                          className="font-serif text-base sm:text-lg text-xora-charcoal hover:text-xora-taupe-dark transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <div className="text-xs text-xora-taupe-dark mt-1 space-y-0.5">
                          <p>Size: <strong className="text-xora-charcoal font-medium">{item.size}</strong></p>
                          <p>Colour: <strong className="text-xora-charcoal font-medium">{item.colour}</strong></p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item._id)}
                        className="inline-flex items-center text-xs text-xora-taupe-dark hover:text-red-700 transition-colors mt-2"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="sm:col-span-2 flex items-center justify-center w-full sm:w-auto">
                    <div className="flex items-center border border-xora-taupe/40 bg-white">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="px-2.5 py-1 text-xora-charcoal hover:bg-xora-sand/50"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold px-3 min-w-[28px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="px-2.5 py-1 text-xora-charcoal hover:bg-xora-sand/50"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Unit price */}
                  <div className="sm:col-span-2 text-right hidden sm:block text-xs font-medium text-xora-charcoal">
                    {formatInr(item.price)}
                  </div>

                  {/* Subtotal */}
                  <div className="sm:col-span-2 flex justify-between sm:justify-end items-center w-full sm:w-auto text-sm font-semibold text-xora-charcoal">
                    <span className="sm:hidden text-xs text-xora-taupe-dark">Total:</span>
                    <span>{formatInr(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-between items-center">
              <Link
                to="/shop"
                className="text-xs uppercase tracking-luxury text-xora-charcoal hover:text-xora-taupe-dark underline underline-offset-4"
              >
                ← CONTINUE SHOPPING
              </Link>
            </div>
          </div>

          {/* Order Summary Column */}
          <div className="lg:col-span-4">
            <div className="bg-xora-offwhite p-6 sm:p-8 rounded-xs border border-xora-taupe/30 space-y-6 shadow-xs sticky top-28">
              <h2 className="font-serif text-xl text-xora-charcoal tracking-wide border-b border-xora-taupe/20 pb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-xora-taupe-dark">
                  <span>Bag Subtotal</span>
                  <span className="text-xora-charcoal font-medium">{formatInr(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xora-taupe-dark">
                  <span>Express Courier Shipping</span>
                  <span>{shippingFee === 0 ? 'Complimentary' : formatInr(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-xora-taupe-dark">
                  <span>Estimated Luxury Sales Tax</span>
                  <span className="text-xora-charcoal font-medium">{formatInr(estimatedTax)}</span>
                </div>

                <div className="border-t border-xora-taupe/20 pt-4 flex justify-between items-baseline text-base font-semibold text-xora-charcoal">
                  <span>Estimated Total</span>
                  <span className="text-lg">{formatInr(grandTotal)}</span>
                </div>
              </div>

              {shippingFee > 0 && (
                <div className="text-[11px] text-xora-taupe-dark bg-xora-sand/50 p-3 rounded border border-xora-taupe/20">
                  Add <strong>{formatInr(200 - subtotal)}</strong> more to receive complimentary express delivery.
                </div>
              )}

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                className="btn-luxury w-full py-4 text-xs flex items-center justify-center space-x-2"
                id="cart-proceed-checkout-btn"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <div className="space-y-2 pt-2 border-t border-xora-taupe/20 text-[11px] text-xora-taupe-dark">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-xora-charcoal" />
                  <span>Secure 256-Bit Encrypted Transaction</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-xora-charcoal" />
                  <span>Signature Garment Bag Included</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
