import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/calendar', label: 'Calendar' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-noir-950">
      <header className="border-b border-noir-800 bg-noir-950/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="w-7 h-7 border border-gold-500 flex items-center justify-center">
                <div className="w-3 h-3 bg-gold-500" />
              </div>
              <span className="font-display text-lg tracking-[0.15em] text-gold-400">LuxeGlow</span>
              <span className="text-[9px] tracking-[0.3em] uppercase text-noir-500 font-body border border-noir-700 px-2 py-0.5">
                Admin
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-[11px] tracking-[0.2em] uppercase font-body transition-colors duration-200 ${
                    location.pathname === link.to
                      ? 'text-gold-400'
                      : 'text-noir-400 hover:text-noir-200'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-6">
              <span className="text-xs text-noir-500 font-body">{user?.firstName} {user?.lastName}</span>
              <button
                onClick={handleLogout}
                className="text-[11px] tracking-[0.2em] uppercase text-noir-500 hover:text-blush-400 transition-colors font-body"
              >
                Logout
              </button>
            </div>

            <button className="md:hidden text-noir-400" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-noir-800 bg-noir-900">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="block px-6 py-4 text-[11px] tracking-[0.2em] uppercase font-body text-noir-400 border-b border-noir-800"
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="w-full text-left px-6 py-4 text-[11px] tracking-[0.2em] uppercase font-body text-blush-400"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
