import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirect = new URLSearchParams(location.search).get('redirect') || '/account';

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(form.name, form.email, form.password, form.confirmPassword);
    if (result.success) {
      navigate(redirect, { replace: true });
      return;
    }

    setError(result.message || 'Registration failed.');
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] bg-xora-cream py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        <div className="bg-xora-offwhite border border-xora-taupe/30 p-6 sm:p-8 flex items-center">
          <div className="w-full">
            <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark">New to XORA</span>
            <h2 className="font-serif text-3xl text-xora-charcoal mt-2">Create Account</h2>

            {error && (
              <div className="mt-4 rounded-xs border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-luxury font-medium text-xora-charcoal mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-luxury font-medium text-xora-charcoal mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-luxury font-medium text-xora-charcoal mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-luxury font-medium text-xora-charcoal mb-1">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-luxury w-full py-3.5 text-[10px] disabled:opacity-60">
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="mt-6 text-xs text-xora-taupe-dark">
              Already registered?{' '}
              <Link to="/login" className="font-medium text-xora-charcoal underline underline-offset-4">
                Sign in
              </Link>
            </div>
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden rounded-xs">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80"
            alt="New XORA customer wardrobe"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-white">
            <span className="text-[11px] uppercase tracking-luxury text-xora-sand">Premium wardrobe</span>
            <h1 className="font-serif text-4xl mt-2">Build a wardrobe that lasts.</h1>
          </div>
        </div>
      </div>
    </div>
  );
}
