import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Smartphone, Banknote, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService, addressService } from '../services/api';
import { formatInr } from '../utils/currency';
import { indianStatesAndTerritories } from '../utils/india';

const paymentOptions = [
  { value: 'Google Pay (UPI)', icon: Smartphone },
  { value: 'PhonePe (UPI)', icon: Smartphone },
  { value: 'Paytm (UPI)', icon: Smartphone },
  { value: 'UPI', icon: Smartphone },
  { value: 'Cash on Delivery', label: 'Cash on Delivery (COD)', icon: Banknote }
];

export default function CheckoutPage() {
  const { items, subtotal, shippingFee, estimatedTax, grandTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Google Pay (UPI)');
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  // Load user saved addresses
  useEffect(() => {
    if (isAuthenticated) {
      addressService.getAddresses().then((res) => {
        if (res.data.success && res.data.addresses.length > 0) {
          setSavedAddresses(res.data.addresses);
          const defaultAddr = res.data.addresses.find((a) => a.isDefault) || res.data.addresses[0];
          setSelectedAddressId(defaultAddr._id);
          setShippingAddress({
            fullName: defaultAddr.fullName,
            phone: defaultAddr.phone,
            addressLine1: defaultAddr.addressLine1,
            addressLine2: defaultAddr.addressLine2 || '',
            city: defaultAddr.city,
            state: defaultAddr.state,
            postalCode: defaultAddr.postalCode,
            country: 'India'
          });
        }
      });
    }
  }, [isAuthenticated]);

  const handleSavedAddressChange = (addressId) => {
    setSelectedAddressId(addressId);
    const addr = savedAddresses.find((a) => a._id === addressId);
    if (addr) {
      setShippingAddress({
        fullName: addr.fullName,
        phone: addr.phone,
        addressLine1: addr.addressLine1,
        addressLine2: addr.addressLine2 || '',
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: 'India'
      });
    }
  };

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError('');

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent('/checkout')}`);
      return;
    }

    if (!shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode) {
      setError('Please provide all required shipping fields.');
      return;
    }

    if (!shippingAddress.phone) {
      setError('Please provide a mobile number for courier delivery.');
      return;
    }

    try {
      setLoading(true);

      const orderPayload = {
        items: items.map((i) => ({
          product: i.productId,
          name: i.name,
          image: i.image,
          price: i.price,
          quantity: i.quantity,
          size: i.size,
          colour: i.colour
        })),
        shippingAddress,
        paymentMethod,
        notes: orderNotes
      };

      const res = await orderService.createOrder(orderPayload);
      if (res.data.success) {
        clearCart();
        navigate(`/order-confirmation/${res.data.order._id}`);
      }
    } catch (err) {
      console.error('Order creation failed:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please review information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-xora-cream min-h-screen text-xora-charcoal py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center text-xs uppercase tracking-luxury text-xora-taupe-dark hover:text-xora-charcoal mb-4"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            <span>Return to Shopping Bag</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-xora-charcoal">
            Secure Checkout
          </h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xs flex items-center space-x-3 text-xs">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Form Section (Left 7 Cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Account Confirmation */}
              {!isAuthenticated && (
                <div className="bg-xora-sand/50 p-4 border border-xora-taupe/30 rounded-xs flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-xora-charcoal">Have a XORA account?</span>
                    <p className="text-xora-taupe-dark">Sign in to retrieve saved addresses and track privileges.</p>
                  </div>
                  <Link
                    to="/login?redirect=/checkout"
                    className="btn-luxury py-2 px-4 text-[10px] whitespace-nowrap"
                  >
                    SIGN IN
                  </Link>
                </div>
              )}

              {/* Saved Addresses (if available) */}
              {savedAddresses.length > 0 && (
                <div className="bg-xora-offwhite p-6 border border-xora-taupe/30 rounded-xs space-y-4">
                  <h3 className="text-xs uppercase tracking-luxury font-semibold text-xora-charcoal">
                    Saved Addresses
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr._id}
                        onClick={() => handleSavedAddressChange(addr._id)}
                        className={`p-3.5 border rounded-xs cursor-pointer text-xs transition-all ${
                          selectedAddressId === addr._id
                            ? 'border-xora-charcoal bg-white shadow-xs'
                            : 'border-xora-taupe/30 bg-xora-sand/20 hover:border-xora-taupe'
                        }`}
                      >
                        <p className="font-semibold text-xora-charcoal">{addr.fullName}</p>
                        <p className="text-xora-taupe-dark mt-1 line-clamp-1">{addr.addressLine1}</p>
                        <p className="text-xora-taupe-dark">{addr.city}, {addr.state} {addr.postalCode}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Address Details */}
              <div className="bg-xora-offwhite p-6 sm:p-8 border border-xora-taupe/30 rounded-xs space-y-5">
                <h2 className="font-serif text-xl text-xora-charcoal tracking-wide border-b border-xora-taupe/20 pb-3">
                  1. Shipping Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-luxury font-medium text-xora-charcoal mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingAddress.fullName}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g. Aarav Sharma"
                      className="w-full bg-white border border-xora-taupe/40 px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal"
                      id="checkout-fullname"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-luxury font-medium text-xora-charcoal mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+91 98765 43210"
                      className="w-full bg-white border border-xora-taupe/40 px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal"
                      id="checkout-phone"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-luxury font-medium text-xora-charcoal mb-1">
                      House/Flat No. & Street/Area *
                    </label>
                    <input
                      type="text"
                      name="addressLine1"
                      value={shippingAddress.addressLine1}
                      onChange={handleInputChange}
                      required
                      placeholder="Flat 12, MG Road"
                      className="w-full bg-white border border-xora-taupe/40 px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal"
                      id="checkout-address1"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs uppercase tracking-luxury font-medium text-xora-charcoal mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="addressLine2"
                      value={shippingAddress.addressLine2}
                      onChange={handleInputChange}
                      placeholder="Near Cubbon Park"
                      className="w-full bg-white border border-xora-taupe/40 px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-luxury font-medium text-xora-charcoal mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      required
                      placeholder="Bengaluru"
                      className="w-full bg-white border border-xora-taupe/40 px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal"
                      id="checkout-city"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs uppercase tracking-luxury font-medium text-xora-charcoal mb-1">
                        State *
                      </label>
                      <select
                        name="state"
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white border border-xora-taupe/40 px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal"
                      >
                        <option value="">Select State / UT</option>
                        {shippingAddress.state && !indianStatesAndTerritories.includes(shippingAddress.state) && (
                          <option value={shippingAddress.state}>{shippingAddress.state}</option>
                        )}
                        {indianStatesAndTerritories.map((state) => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-luxury font-medium text-xora-charcoal mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={shippingAddress.postalCode}
                        onChange={handleInputChange}
                        required
                        placeholder="560001"
                        inputMode="numeric"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        className="w-full bg-white border border-xora-taupe/40 px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal"
                        id="checkout-postalcode"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-luxury font-medium text-xora-charcoal mb-1">
                    Special Delivery Instructions (Optional)
                  </label>
                  <textarea
                    rows="2"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    placeholder="Call on arrival or leave with the building reception"
                    className="w-full bg-white border border-xora-taupe/40 px-3.5 py-2 text-xs focus:outline-none focus:border-xora-charcoal resize-none"
                  />
                </div>
              </div>

              {/* Payment Section */}
              <div className="bg-xora-offwhite p-6 sm:p-8 border border-xora-taupe/30 rounded-xs space-y-5">
                <div className="border-b border-xora-taupe/20 pb-3 flex items-center justify-between">
                  <h2 className="font-serif text-xl text-xora-charcoal tracking-wide">
                    2. Payment Method
                  </h2>
                  <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                    Sandbox / Test Mode
                  </span>
                </div>

                <div className="space-y-3">
                  {paymentOptions.map(({ value, label, icon: PaymentIcon }) => (
                    <label key={value} className={`block border p-4 rounded-xs cursor-pointer transition-all ${
                      paymentMethod === value
                        ? 'border-xora-charcoal bg-white shadow-xs'
                        : 'border-xora-taupe/30 bg-xora-sand/20'
                    }`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="payment"
                            value={value}
                            checked={paymentMethod === value}
                            onChange={() => setPaymentMethod(value)}
                            className="accent-xora-charcoal w-4 h-4"
                          />
                          <PaymentIcon className="w-4 h-4 text-xora-charcoal flex-shrink-0" />
                          <span className="text-xs font-semibold text-xora-charcoal">
                            {label || value}
                          </span>
                        </div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-xora-taupe-dark">
                          {value === 'Cash on Delivery' ? 'Pay on delivery' : 'Test mode'}
                        </span>
                      </div>
                    </label>
                  ))}
                  <p className="text-[10px] text-xora-taupe-dark italic">
                    Mock checkout only. UPI payments are not processed and no payment gateway is connected; this records an order for testing.
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary & Confirmation Button (Right 5 Cols) */}
            <div className="lg:col-span-5">
              <div className="bg-xora-offwhite p-6 sm:p-8 rounded-xs border border-xora-taupe/30 space-y-6 shadow-xs sticky top-28">
                <h2 className="font-serif text-xl text-xora-charcoal tracking-wide border-b border-xora-taupe/20 pb-4">
                  Bag Overview ({items.reduce((s, i) => s + i.quantity, 0)})
                </h2>

                {/* Items preview list */}
                <div className="max-h-60 overflow-y-auto divide-y divide-xora-taupe/20 pr-1">
                  {items.map((item) => (
                    <div key={item._id} className="py-3 flex space-x-3 items-center">
                      <img
                        src={item.image}
                        alt=""
                        className="w-12 h-16 object-cover rounded-xs bg-xora-sand flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-xs text-xora-charcoal truncate">{item.name}</h4>
                        <p className="text-[10px] text-xora-taupe-dark">
                          Qty: {item.quantity} • Size: {item.size} • {item.colour}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-xora-charcoal">
                        {formatInr(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Cost breakdown */}
                <div className="space-y-2 pt-2 border-t border-xora-taupe/20 text-xs">
                  <div className="flex justify-between text-xora-taupe-dark">
                    <span>Subtotal</span>
                    <span className="font-medium text-xora-charcoal">{formatInr(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xora-taupe-dark">
                    <span>Express Shipping</span>
                    <span>{shippingFee === 0 ? 'Complimentary' : formatInr(shippingFee)}</span>
                  </div>
                  <div className="flex justify-between text-xora-taupe-dark">
                    <span>Estimated Tax (8%)</span>
                    <span className="font-medium text-xora-charcoal">{formatInr(estimatedTax)}</span>
                  </div>
                  <div className="flex justify-between items-baseline text-base font-semibold text-xora-charcoal pt-3 border-t border-xora-taupe/20">
                    <span>Grand Total</span>
                    <span className="text-xl">{formatInr(grandTotal)}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-luxury w-full py-4 text-xs flex items-center justify-center space-x-2"
                  id="place-order-btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span>PROCESSING ORDER...</span>
                    </>
                  ) : (
                    <span>{paymentMethod === 'Cash on Delivery' ? 'PLACE COD ORDER' : 'PLACE TEST ORDER'} ({formatInr(grandTotal)})</span>
                  )}
                </button>

                <div className="text-center pt-2">
                  <span className="text-[10px] text-xora-taupe-dark flex items-center justify-center space-x-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Your transaction is protected by end-to-end encryption.</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
