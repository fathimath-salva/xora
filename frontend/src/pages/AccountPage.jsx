import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Heart,
  Lock,
  LogOut,
  MapPin,
  Package,
  User,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { addressService, authService, orderService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatInr } from '../utils/currency';
import { indianStatesAndTerritories } from '../utils/india';

const tabs = [
  { id: 'overview', label: 'Overview', icon: Sparkles },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'security', label: 'Security', icon: Lock }
];

export default function AccountPage() {
  const { user, logout, updateUser } = useAuth();
  const { wishlist, removeFromWishlist } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [profileStatus, setProfileStatus] = useState('');
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });
  const activeTab = searchParams.get('tab') || 'overview';

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [ordersRes, addressesRes] = await Promise.all([
          orderService.getMyOrders(),
          addressService.getAddresses()
        ]);

        if (ordersRes.data.success) setOrders(ordersRes.data.orders || []);
        if (addressesRes.data.success) setAddresses(addressesRes.data.addresses || []);
      } catch (err) {
        console.error('Failed to load account data', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadUserData();
      setProfileForm({ name: user.name || '', phone: user.phone || '' });
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.updateProfile({ name: profileForm.name, phone: profileForm.phone });
      if (res.data.success) {
        updateUser(res.data.user);
        setProfileStatus('Profile updated successfully.');
      }
    } catch (err) {
      setProfileStatus(err.response?.data?.message || 'Unable to update profile.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.changePassword(passwordForm);
      setPasswordForm({ currentPassword: '', newPassword: '' });
      alert(res.data.message || 'Password changed.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update password.');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressService.createAddress(addressForm);
      if (res.data.success) {
        setAddresses((prev) => [res.data.address, ...prev]);
        setAddressForm({
          fullName: user?.name || '',
          phone: user?.phone || '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'India'
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Unable to save address.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-xora-offwhite border border-xora-taupe/30 p-8 max-w-lg text-center">
          <h2 className="font-serif text-3xl text-xora-charcoal">Welcome back</h2>
          <p className="mt-3 text-sm text-xora-taupe-dark">Please sign in to manage your XORA account.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link className="btn-luxury" to="/login?redirect=/account">Sign In</Link>
            <Link className="btn-luxury-outline" to="/register?redirect=/account">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) => ['Pending', 'Confirmed', 'Processing', 'Shipped'].includes(order.orderStatus)).length;
  const deliveredOrders = orders.filter((order) => order.orderStatus === 'Delivered').length;

  if (loading) return <LoadingSpinner message="Opening your account..." />;

  return (
    <div className="bg-xora-cream min-h-screen py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark">Account</span>
            <h1 className="font-serif text-3xl sm:text-4xl text-xora-charcoal mt-1">Welcome back, {user.name}</h1>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              window.location.href = '/';
            }}
            className="inline-flex items-center text-xs uppercase tracking-luxury text-xora-charcoal hover:text-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <div className="bg-xora-offwhite border border-xora-taupe/30 p-4 rounded-xs space-y-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSearchParams({ tab: id })}
                  className={`w-full flex items-center justify-between rounded-xs px-3 py-2.5 text-left text-xs uppercase tracking-luxury transition-colors ${
                    activeTab === id
                      ? 'bg-xora-charcoal text-white'
                      : 'text-xora-charcoal hover:bg-xora-sand/80'
                  }`}
                >
                  <span className="inline-flex items-center">
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <div className="lg:col-span-9">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Total Orders', value: totalOrders },
                    { label: 'Pending Orders', value: pendingOrders },
                    { label: 'Delivered Orders', value: deliveredOrders }
                  ].map((stat) => (
                    <div key={stat.label} className="bg-xora-offwhite border border-xora-taupe/30 p-5 rounded-xs">
                      <div className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark">{stat.label}</div>
                      <div className="font-serif text-3xl mt-2 text-xora-charcoal">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="bg-xora-offwhite border border-xora-taupe/30 p-6 rounded-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-serif text-2xl text-xora-charcoal">Recent Orders</h2>
                    <Link to="/account?tab=orders" className="text-xs uppercase tracking-luxury text-xora-charcoal hover:text-xora-taupe-dark">
                      View All <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order._id} className="flex items-center justify-between border border-xora-taupe/20 bg-white px-4 py-3 rounded-xs">
                        <div>
                          <p className="text-xs uppercase tracking-wider text-xora-taupe-dark">#{String(order._id).slice(-6).toUpperCase()}</p>
                          <p className="text-sm text-xora-charcoal font-medium mt-1">{order.orderStatus}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-xora-taupe-dark">{new Date(order.createdAt).toLocaleDateString()}</p>
                          <p className="text-sm font-medium text-xora-charcoal">{formatInr(order.total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="bg-xora-offwhite border border-xora-taupe/30 p-6 rounded-xs">
                <h2 className="font-serif text-2xl text-xora-charcoal">Profile Details</h2>
                <form onSubmit={handleProfileSave} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury font-medium text-xora-charcoal mb-1">Full Name</label>
                    <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal" />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury font-medium text-xora-charcoal mb-1">Mobile Number</label>
                    <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal" />
                  </div>
                  <button type="submit" className="btn-luxury">Save Changes</button>
                  {profileStatus && <p className="text-xs text-emerald-700">{profileStatus}</p>}
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-xora-offwhite border border-xora-taupe/30 p-6 rounded-xs space-y-4">
                <h2 className="font-serif text-2xl text-xora-charcoal">Order History</h2>
                {orders.length === 0 ? (
                  <p className="text-sm text-xora-taupe-dark">You haven’t placed any orders yet.</p>
                ) : (
                  orders.map((order) => (
                    <div key={order._id} className="border border-xora-taupe/20 bg-white p-4 rounded-xs">
                      <div className="flex justify-between gap-3 flex-wrap">
                        <div>
                          <p className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark">Order #{String(order._id).slice(-6).toUpperCase()}</p>
                          <p className="text-sm font-medium text-xora-charcoal mt-1">{order.orderStatus}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-xora-taupe-dark">{new Date(order.createdAt).toLocaleDateString()}</p>
                          <p className="text-sm font-medium text-xora-charcoal">{formatInr(order.total)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {order.items?.map((item) => (
                          <div key={`${order._id}-${item.product}`} className="flex items-center gap-2 bg-xora-sand px-2 py-1 rounded-xs text-[11px]">
                            <span>{item.name}</span>
                            <span className="text-xora-taupe-dark">x{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-xora-offwhite border border-xora-taupe/30 p-6 rounded-xs">
                <h2 className="font-serif text-2xl text-xora-charcoal">Your Wishlist</h2>
                {wishlist.length === 0 ? (
                  <p className="mt-4 text-sm text-xora-taupe-dark">Your wishlist is empty.</p>
                ) : (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlist.map((product) => (
                      <div key={product._id || product.id} className="flex gap-3 border border-xora-taupe/20 bg-white p-3 rounded-xs">
                        <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'} alt={product.name} className="w-20 h-24 object-cover rounded-xs" />
                        <div className="flex-1">
                          <p className="font-serif text-xl text-xora-charcoal">{product.name}</p>
                          <p className="text-xs text-xora-taupe-dark">{product.category}</p>
                          <p className="text-sm font-medium mt-2">{formatInr(product.discountPrice || product.price)}</p>
                          <div className="mt-3 flex gap-2">
                            <Link to={`/product/${product._id}`} className="btn-luxury py-2 px-3 text-[10px]">View</Link>
                            <button type="button" onClick={() => removeFromWishlist(product._id)} className="btn-luxury-outline py-2 px-3 text-[10px]">Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-xora-offwhite border border-xora-taupe/30 p-6 rounded-xs">
                  <h2 className="font-serif text-2xl text-xora-charcoal">Saved Addresses</h2>
                  <div className="mt-4 space-y-3">
                    {addresses.length === 0 ? (
                      <p className="text-sm text-xora-taupe-dark">No saved addresses yet.</p>
                    ) : (
                      addresses.map((address) => (
                        <div key={address._id} className="border border-xora-taupe/20 bg-white p-4 rounded-xs text-sm text-xora-charcoal">
                          <p className="font-medium">{address.fullName}</p>
                          <p className="mt-1 text-xora-taupe-dark">{address.addressLine1}</p>
                          <p className="text-xora-taupe-dark">{address.city}, {address.state} {address.postalCode}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-xora-offwhite border border-xora-taupe/30 p-6 rounded-xs">
                  <h2 className="font-serif text-2xl text-xora-charcoal">Add Address</h2>
                  <form onSubmit={handleAddAddress} className="mt-4 space-y-3">
                    <input value={addressForm.fullName} onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })} placeholder="Full Name" className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal" />
                    <input value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} placeholder="Mobile Number (+91)" className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal" />
                    <input value={addressForm.addressLine1} onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })} placeholder="House/Flat No., Street/Area" className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal" />
                    <input value={addressForm.addressLine2} onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })} placeholder="Landmark (optional)" className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal" />
                    <div className="grid grid-cols-2 gap-3">
                      <input value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} placeholder="City" className="border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal" />
                      <select value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} className="border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal">
                        <option value="">State / UT</option>
                        {addressForm.state && !indianStatesAndTerritories.includes(addressForm.state) && (
                          <option value={addressForm.state}>{addressForm.state}</option>
                        )}
                        {indianStatesAndTerritories.map((state) => <option key={state} value={state}>{state}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input value={addressForm.postalCode} onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })} placeholder="PIN Code" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" className="border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal" />
                      <input value={addressForm.country} onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })} placeholder="Country" className="border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal" />
                    </div>
                    <button type="submit" className="btn-luxury w-full">Save Address</button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-xora-offwhite border border-xora-taupe/30 p-6 rounded-xs">
                <h2 className="font-serif text-2xl text-xora-charcoal">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury font-medium text-xora-charcoal mb-1">Current Password</label>
                    <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal" />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-luxury font-medium text-xora-charcoal mb-1">New Password</label>
                    <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal" />
                  </div>
                  <button type="submit" className="btn-luxury">Update Password</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
