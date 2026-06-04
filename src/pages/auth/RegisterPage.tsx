import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button, Input, Alert } from '../../components/ui';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>({
    firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required.';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required.';
    if (!form.email) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address.';
    if (!form.phone.trim()) errs.phone = 'Phone number is required.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setApiError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/login', { state: { registered: true } });
    } catch (err: any) {
      setApiError(err.message || 'Registration failed. Please try again.');
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
          style={{ backgroundImage: 'radial-gradient(circle at 40% 40%, #c99318, transparent 60%)' }}
        />
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-7 h-7 border border-gold-500 flex items-center justify-center">
            <div className="w-3 h-3 bg-gold-500" />
          </div>
          <span className="font-display text-lg tracking-[0.15em] text-gold-400">LuxeGlow</span>
        </Link>

        <div className="relative z-10">
          <h2 className="font-display text-5xl font-300 text-noir-100 mb-4 leading-tight">
            Begin your<br /><em className="text-gold-400 not-italic">journey.</em>
          </h2>
          <p className="text-noir-500 font-body text-sm leading-relaxed max-w-xs">
            Join LuxeGlow and discover a world of personalized beauty and wellness experiences.
          </p>
          <div className="mt-8 space-y-3">
            {['Book appointments online', 'Choose your preferred stylist', 'Manage your schedule'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-gold-500" />
                <span className="text-xs text-noir-500 font-body">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 relative z-10">
          <div className="w-2 h-2 bg-noir-700" />
          <div className="w-2 h-2 bg-gold-500" />
          <div className="w-2 h-2 bg-noir-700" />
        </div>
      </div>

      {/* Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm animate-fade-in-up py-8">
          <Link to="/" className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-7 h-7 border border-gold-500 flex items-center justify-center">
              <div className="w-3 h-3 bg-gold-500" />
            </div>
            <span className="font-display text-lg tracking-[0.15em] text-gold-400">LuxeGlow</span>
          </Link>

          <p className="text-[11px] tracking-[0.3em] uppercase text-gold-500 font-body mb-2">New Account</p>
          <h1 className="font-display text-3xl text-noir-100 mb-8">Create Account</h1>

          {apiError && <div className="mb-6"><Alert type="error" message={apiError} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                placeholder="Aria"
                value={form.firstName}
                onChange={update('firstName')}
                error={errors.firstName}
              />
              <Input
                label="Last Name"
                placeholder="Sinclair"
                value={form.lastName}
                onChange={update('lastName')}
                error={errors.lastName}
              />
            </div>
            <Input
              label="Email Address"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={update('email')}
              error={errors.email}
              autoComplete="email"
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="(555) 234-5678"
              value={form.phone}
              onChange={update('phone')}
              error={errors.phone}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={update('password')}
              error={errors.password}
              autoComplete="new-password"
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            <Button type="submit" loading={loading} className="w-full mt-2">
              Create Account
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-noir-800 text-center">
            <p className="text-xs text-noir-600 font-body">
              Already have an account?{' '}
              <Link to="/login" className="text-gold-500 hover:text-gold-400 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
