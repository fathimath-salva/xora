import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PackageCheck } from 'lucide-react';
import { orderService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatInr } from '../utils/currency';
import { getProductImage } from '../utils/productImage';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setLoadError('');
        setOrder(null);
        const res = await orderService.getOrderById(id);
        if (res.data?.success && res.data.order) {
          setOrder(res.data.order);
        } else {
          setLoadError(res.data?.message || 'Order details are unavailable.');
        }
      } catch (err) {
        console.error('Failed to load order confirmation', err);
        setLoadError(err.response?.data?.message || 'We could not load this order. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (loading) return <LoadingSpinner message="Confirming your order..." />;
  if (!order) {
    return (
      <div className="bg-xora-cream min-h-[70vh] px-4 py-12">
        <div className="mx-auto max-w-2xl border border-xora-taupe/30 bg-xora-offwhite p-8 text-center">
          <h1 className="font-serif text-3xl text-xora-charcoal">Order details unavailable</h1>
          <p role="alert" className="mt-3 text-sm text-xora-taupe-dark">{loadError || 'The order service did not return this order.'}</p>
          <Link to="/account?tab=orders" className="btn-luxury-outline mt-6">View Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-xora-cream min-h-[70vh] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-xora-offwhite border border-xora-taupe/30 rounded-xs p-6 sm:p-10 text-center">
        <div className="flex items-center justify-center text-xora-taupe-dark">
          <PackageCheck className="w-12 h-12" />
        </div>

        <h1 className="font-serif text-4xl mt-4 text-xora-charcoal">Order Received</h1>
        <p className="mt-3 text-sm text-xora-taupe-dark">
          Your order has been recorded. No payment was processed in this test checkout.
        </p>

        {order && (
          <div id="order-tracking" className="mt-8 space-y-3 text-left border border-xora-taupe/30 bg-xora-offwhite p-5 rounded-xs text-xs text-xora-charcoal">
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span>Order Number</span>
              <span className="font-medium">#{String(order._id).slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span>Subtotal</span>
              <span className="font-medium">{order.subtotal == null ? 'Not provided' : formatInr(order.subtotal)}</span>
            </div>
            {order.shippingFee != null && (
              <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span>Shipping</span>
                <span className="font-medium">{formatInr(order.shippingFee)}</span>
              </div>
            )}
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4 border-t border-xora-taupe/20 pt-3">
              <span>Total</span>
              <span className="font-medium">{order.total == null ? 'Not provided' : formatInr(order.total)}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span>Payment</span>
              <span className="font-medium break-words sm:text-right">{order.paymentMethod || 'Not provided'}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span>Payment Status</span>
              <span className="font-medium">{order.paymentStatus || 'Not provided by the order service'}</span>
            </div>
            <div id="order-status" className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span>Status</span>
              <span className="font-medium">{order.orderStatus || 'Not provided by the order service'}</span>
            </div>
            <div className="border-t border-xora-taupe/20 pt-3">
              <p className="font-medium mb-2">Items</p>
              <div className="space-y-3">
                {(order.items || []).map((item) => (
                  <div key={`${item.product}-${item.size}-${item.colour}`} className="flex items-center gap-3">
                    <img src={item.image || getProductImage({ category: item.category })} alt={item.name} className="w-12 h-14 object-cover bg-xora-sand flex-shrink-0" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = getProductImage({ category: item.category }); }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium break-words">{item.name}</p>
                      <p className="text-xora-taupe-dark mt-1">Qty {item.quantity} · Size {item.size} · {item.colour}</p>
                    </div>
                    <span className="font-medium flex-shrink-0">{formatInr(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-xora-taupe/20 pt-3 flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span>Shipping address</span>
              <span className="font-medium break-words sm:text-right">
                {[
                  order.shippingAddress?.fullName,
                  order.shippingAddress?.addressLine1,
                  order.shippingAddress?.addressLine2,
                  order.shippingAddress?.city,
                  order.shippingAddress?.state,
                  order.shippingAddress?.postalCode,
                  order.shippingAddress?.country
                ].filter(Boolean).join(', ') || 'Address not provided'}
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <a href="#order-status" className="btn-luxury-outline">View Current Status</a>
          <Link to="/shop" className="btn-luxury">Continue Shopping</Link>
          <Link to="/account?tab=orders" className="btn-luxury-outline">View Orders</Link>
        </div>
      </div>
    </div>
  );
}
