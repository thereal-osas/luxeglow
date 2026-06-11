import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Alert } from '../../components/ui';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!form.email || !form.password) return 'Please enter your email and password.';
    if (!/\S+@\S+\.\S+/.test(form.email)) return 'Please enter a valid email address.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-noir-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 border-r border-noir-800 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at 40% 60%, #c99318, transparent 60%)' }}
        />
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-7 h-7 border border-gold-500 flex items-center justify-center">
            <div className="w-3 h-3 bg-gold-500" />
          </div>
          <span className="font-display text-lg tracking-[0.15em] text-gold-400">LuxeGlow</span>
        </Link>

        <div className="relative z-10">
          <h2 className="font-display text-5xl font-300 text-noir-100 mb-4 leading-tight">
            Welcome<br /><em className="text-gold-400 not-italic">back.</em>
          </h2>
          <p className="text-noir-500 font-body text-sm leading-relaxed max-w-xs">
            Your beauty journey continues. Sign in to manage your appointments and preferences.
          </p>
        </div>

        <div className="flex gap-3 relative z-10">
          <div className="w-2 h-2 bg-gold-500" />
          <div className="w-2 h-2 bg-noir-700" />
          <div className="w-2 h-2 bg-noir-700" />
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-7 h-7 border border-gold-500 flex items-center justify-center">
              <div className="w-3 h-3 bg-gold-500" />
            </div>
            <span className="font-display text-lg tracking-[0.15em] text-gold-400">LuxeGlow</span>
          </Link>

          <p className="text-[11px] tracking-[0.3em] uppercase text-gold-500 font-body mb-2">Customer Login</p>
          <h1 className="font-display text-3xl text-noir-100 mb-8">Sign In</h1>

          {error && <div className="mb-6"><Alert type="error" message={error} /></div>}



          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
            />
            <div className="flex items-center gap-3 py-1">
              <input
                type="checkbox"
                id="remember"
                checked={form.remember}
                onChange={e => setForm({ ...form, remember: e.target.checked })}
                className="w-4 h-4 accent-gold-500"
              />
              <label htmlFor="remember" className="text-xs text-noir-500 font-body cursor-pointer">
                Remember me
              </label>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2">
              Sign In
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-noir-800 text-center">
            <p className="text-xs text-noir-600 font-body">
              New to LuxeGlow?{' '}
              <Link to="/register" className="text-gold-500 hover:text-gold-400 transition-colors">
                Create an account
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/admin/login"
              className="text-[14px] tracking-widest uppercase text-noir-700 hover:text-noir-400 transition-colors font-body"
            >
              Admin Access →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
