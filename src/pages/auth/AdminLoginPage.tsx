import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Alert } from '../../components/ui';

export default function AdminLoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please enter your credentials.'); return; }
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-noir-950 flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-fade-in-up">
        <Link to="/" className="flex items-center gap-3 mb-12 justify-center">
          <div className="w-7 h-7 border border-gold-500 flex items-center justify-center">
            <div className="w-3 h-3 bg-gold-500" />
          </div>
          <span className="font-display text-lg tracking-[0.15em] text-gold-400">LuxeGlow</span>
        </Link>

        <div className="bg-noir-900 border border-noir-800 p-8">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold-500 font-body mb-2 text-center">
            Staff Access
          </p>
          <h1 className="font-display text-3xl text-noir-100 mb-8 text-center">Admin Login</h1>

          {error && <div className="mb-6"><Alert type="error" message={error} /></div>}


          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Admin Email"
              type="email"
              placeholder="admin@luxeglow.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" loading={loading} className="w-full mt-2">
              Access Dashboard
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-[10px] tracking-widest uppercase text-noir-700 hover:text-noir-400 transition-colors font-body"
          >
            ← Customer Login
          </Link>
        </div>
      </div>
    </div>
  );
}
