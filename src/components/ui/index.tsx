import React, { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

// ── Button ────────────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-body font-500 tracking-widest uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-gold-500 hover:bg-gold-400 text-noir-950',
    outline: 'border border-gold-600 text-gold-400 hover:bg-gold-600 hover:text-noir-950',
    ghost: 'text-noir-300 hover:text-gold-400 hover:bg-noir-800',
    danger: 'bg-blush-700 hover:bg-blush-600 text-white border border-blush-600',
  };
  const sizes = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3 text-xs',
    lg: 'px-8 py-4 text-sm',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          Processing...
        </>
      ) : children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] tracking-[0.2em] uppercase text-noir-400 mb-2 font-body">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-noir-900 border ${error ? 'border-blush-500' : 'border-noir-700'} text-noir-100 px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors duration-200 font-body text-sm placeholder-noir-600 ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-blush-400 font-body">{error}</p>}
    </div>
  );
}

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: ReactNode;
}

export function Select({ label, error, children, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] tracking-[0.2em] uppercase text-noir-400 mb-2 font-body">
          {label}
        </label>
      )}
      <select
        className={`w-full bg-noir-900 border ${error ? 'border-blush-500' : 'border-noir-700'} text-noir-100 px-4 py-3 focus:outline-none focus:border-gold-500 transition-colors duration-200 font-body text-sm ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs text-blush-400 font-body">{error}</p>}
    </div>
  );
}

// ── Badge ─────────────────────────────────────────────────────────────────────
type BadgeVariant = 'upcoming' | 'completed' | 'cancelled' | 'gold';

export function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  const styles = {
    upcoming: 'bg-gold-900/40 text-gold-400 border border-gold-800',
    completed: 'bg-noir-800 text-noir-300 border border-noir-700',
    cancelled: 'bg-blush-900/30 text-blush-400 border border-blush-900',
    gold: 'bg-gold-500 text-noir-950',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 text-[10px] tracking-widest uppercase font-body font-500 ${styles[variant]}`}>
      {children}
    </span>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 border border-gold-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-noir-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-noir-900 border border-noir-700 w-full max-w-md animate-fade-in-up">
        <div className="flex items-center justify-between p-6 border-b border-noir-800">
          <h3 className="font-display text-xl text-noir-100">{title}</h3>
          <button onClick={onClose} className="text-noir-500 hover:text-noir-200 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, message, action }: {
  icon?: string;
  title: string;
  message?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {icon && <div className="text-5xl mb-6 text-noir-600">{icon}</div>}
      <h3 className="font-display text-2xl text-noir-300 mb-2">{title}</h3>
      {message && <p className="text-sm text-noir-500 font-body max-w-sm">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ── Alert ─────────────────────────────────────────────────────────────────────
export function Alert({ type, message }: { type: 'error' | 'success'; message: string }) {
  return (
    <div className={`p-4 text-sm font-body border ${
      type === 'error'
        ? 'bg-blush-950/50 border-blush-800 text-blush-300'
        : 'bg-gold-950/30 border-gold-800 text-gold-300'
    }`}>
      {message}
    </div>
  );
}
