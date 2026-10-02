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
          <div className="mt-8 space-y-3 text-left border border-xora-taupe/30 bg-white p-5 rounded-xs text-xs text-xora-charcoal">
            <div className="flex justify-between">
              <span>Order Number</span>
              <span className="font-medium">#{String(order._id).slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Total</span>
              <span className="font-medium">{formatInr(order.total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment</span>
              <span className="font-medium">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status</span>
              <span className="font-medium">{paymentStatus}</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className="font-medium text-emerald-700">{order.orderStatus}</span>
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
