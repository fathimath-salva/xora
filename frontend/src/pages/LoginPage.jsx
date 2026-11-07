import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirect = new URLSearchParams(location.search).get('redirect');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(form.email, form.password, rememberMe);
    if (result.success) {
      const destination = redirect || (result.user?.role === 'admin' ? '/admin' : '/account');
      navigate(destination, { replace: true });
      return;
    }

    setError(result.message || 'Unable to sign in.');
    setLoading(false);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-xora-cream px-4 py-12 sm:px-6">
      <div className="w-full max-w-md">
        <div className="bg-xora-offwhite border border-xora-taupe/30 p-6 sm:p-8">
            <span className="text-[11px] uppercase tracking-luxury text-xora-taupe-dark">Your account</span>
            <h2 className="font-serif text-3xl text-xora-charcoal mt-2">Sign In</h2>

            {error && (
              <div className="mt-4 rounded-xs border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-[11px] uppercase tracking-luxury font-medium text-xora-charcoal mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="username"
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
                  autoComplete="current-password"
                  className="w-full border border-xora-taupe/40 bg-white px-3.5 py-2.5 text-xs focus:outline-none focus:border-xora-charcoal"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-xora-taupe-dark">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 accent-xora-charcoal"
                />
                <span>Remember me</span>
              </label>

              <button type="submit" disabled={loading} className="btn-luxury w-full py-3.5 text-[10px] disabled:opacity-60">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-xs text-xora-taupe-dark">
              Need an account?{' '}
              <Link to="/register" className="font-medium text-xora-charcoal underline underline-offset-4">
                Create Account
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
