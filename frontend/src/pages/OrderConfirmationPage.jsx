import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, PackageCheck } from 'lucide-react';
import { orderService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatInr } from '../utils/currency';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await orderService.getOrderById(id);
        if (res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to load order confirmation', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id]);

  if (loading) return <LoadingSpinner message="Confirming your order..." />;

  const paymentStatus = order?.paymentMethod === 'Cash on Delivery'
    ? order.paymentStatus
    : 'Pending (test mode)';

  return (
    <div className="bg-xora-cream min-h-[70vh] py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-xora-offwhite border border-xora-taupe/30 rounded-xs p-6 sm:p-10 text-center">
        <div className="flex items-center justify-center text-emerald-700">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <h1 className="font-serif text-4xl mt-4 text-xora-charcoal">Order Confirmed</h1>
        <p className="mt-3 text-sm text-xora-taupe-dark">
          Your order has been recorded. No payment was processed in this test checkout.
        </p>

        {order && (
          <div className="mt-8 space-y-3 text-left border border-xora-taupe/30 bg-xora-offwhite p-5 rounded-xs text-xs text-xora-charcoal">
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span>Order Number</span>
              <span className="font-medium">#{String(order._id).slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span>Subtotal</span>
              <span className="font-medium">{formatInr(order.subtotal)}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span>Shipping</span>
              <span className="font-medium">{order.shippingFee === 0 ? 'Complimentary' : formatInr(order.shippingFee)}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4 border-t border-xora-taupe/20 pt-3">
              <span>Total</span>
              <span className="font-medium">{formatInr(order.total)}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span>Payment</span>
              <span className="font-medium break-words sm:text-right">{order.paymentMethod}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span>Payment Status</span>
              <span className="font-medium">{paymentStatus}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
              <span>Status</span>
              <span className="font-medium text-emerald-700">{order.orderStatus}</span>
            </div>
            <div className="border-t border-xora-taupe/20 pt-3">
              <p className="font-medium mb-2">Items</p>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={`${item.product}-${item.size}-${item.colour}`} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-12 h-14 object-cover bg-xora-sand flex-shrink-0" />
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
                  order.shippingAddress.fullName,
                  order.shippingAddress.addressLine1,
                  order.shippingAddress.addressLine2,
                  order.shippingAddress.city,
                  order.shippingAddress.state,
                  order.shippingAddress.postalCode,
                  order.shippingAddress.country
                ].filter(Boolean).join(', ')}
              </span>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/shop" className="btn-luxury">Continue Shopping</Link>
          <Link to="/account?tab=orders" className="btn-luxury-outline">View Orders</Link>
        </div>
      </div>
    </div>
  );
}
