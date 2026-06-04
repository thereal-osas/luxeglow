import React from 'react';
import { Link } from 'react-router-dom';

const services = [
  { name: 'Hair', icon: '✦' },
  { name: 'Skin', icon: '◇' },
  { name: 'Nails', icon: '◆' },
  { name: 'Wellness', icon: '◌' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-noir-950 text-noir-100">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 border border-gold-500 flex items-center justify-center">
            <div className="w-3 h-3 bg-gold-500" />
          </div>
          <span className="font-display text-lg tracking-[0.15em] text-gold-400">LuxeGlow</span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            to="/login"
            className="text-[11px] tracking-[0.2em] uppercase text-noir-400 hover:text-noir-100 transition-colors font-body"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="bg-gold-500 hover:bg-gold-400 text-noir-950 px-5 py-2.5 text-[11px] tracking-widest uppercase font-body font-500 transition-colors"
          >
            Book Now
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background ornament */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-noir-800 rounded-full opacity-30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-noir-800 rounded-full opacity-20" />
          <div
            className="absolute top-0 right-0 w-1/2 h-full opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle at 70% 50%, #c99318, transparent 60%)',
            }}
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <p className="text-[11px] tracking-[0.4em] uppercase text-gold-500 font-body mb-6 animate-fade-in-up">
              Premium Beauty & Wellness
            </p>
            <h1 className="font-display text-6xl sm:text-7xl lg:text-8xl font-300 text-noir-50 mb-6 leading-none animate-fade-in-up stagger-1">
              Where
              <br />
              <em className="text-gold-400 not-italic">Beauty</em>
              <br />
              Flourishes
            </h1>
            <p className="text-noir-400 font-body text-base leading-relaxed max-w-md mb-10 animate-fade-in-up stagger-2">
              Reserve your moment of transformation. Expert stylists, curated treatments, and an experience designed around you.
            </p>
            <div className="flex items-center gap-4 animate-fade-in-up stagger-3">
              <Link
                to="/register"
                className="bg-gold-500 hover:bg-gold-400 text-noir-950 px-8 py-4 text-xs tracking-widest uppercase font-body font-500 transition-all duration-300"
              >
                Book Appointment
              </Link>
              <Link
                to="/login"
                className="border border-noir-700 text-noir-300 hover:border-gold-600 hover:text-gold-400 px-8 py-4 text-xs tracking-widest uppercase font-body transition-all duration-300"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative right panel */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:flex flex-col justify-center gap-4 pr-12">
          {services.map((s, i) => (
            <div
              key={s.name}
              className="flex items-center gap-4 animate-fade-in-up"
              style={{ animationDelay: `${0.3 + i * 0.08}s` }}
            >
              <div className="w-10 h-10 border border-noir-700 flex items-center justify-center text-gold-500">
                {s.icon}
              </div>
              <span className="text-[11px] tracking-[0.3em] uppercase text-noir-500 font-body">{s.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Services strip */}
      <section className="border-t border-noir-800 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-[11px] tracking-[0.4em] uppercase text-gold-500 font-body mb-10 text-center">
            Our Services
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'Hair Styling', price: 'from $85', icon: '✦' },
              { name: 'Hair Treatment', price: 'from $120', icon: '◈' },
              { name: 'Facial', price: 'from $95', icon: '◇' },
              { name: 'Manicure', price: 'from $55', icon: '◆' },
              { name: 'Pedicure', price: 'from $70', icon: '◉' },
              { name: 'Massage', price: 'from $110', icon: '◌' },
            ].map((svc) => (
              <div
                key={svc.name}
                className="bg-noir-900 border border-noir-800 p-6 flex flex-col items-center text-center hover:border-gold-700 transition-colors duration-300"
              >
                <div className="text-2xl text-gold-500 mb-3">{svc.icon}</div>
                <div className="text-xs font-body font-500 text-noir-200 mb-1">{svc.name}</div>
                <div className="text-[10px] text-noir-500 font-body">{svc.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-noir-800 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-300 text-noir-100 mb-4">
            Ready for your transformation?
          </h2>
          <p className="text-noir-500 font-body mb-10">Create an account and book your first appointment today.</p>
          <Link
            to="/register"
            className="inline-flex bg-gold-500 hover:bg-gold-400 text-noir-950 px-10 py-4 text-xs tracking-widest uppercase font-body font-500 transition-all duration-300"
          >
            Get Started — It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-noir-800 py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border border-gold-600 flex items-center justify-center">
              <div className="w-2 h-2 bg-gold-600" />
            </div>
            <span className="font-display text-sm text-gold-600">LuxeGlow</span>
          </div>
          <p className="text-[10px] text-noir-600 tracking-widest uppercase font-body">
            © 2025 LuxeGlow Salon — Premium Beauty & Wellness
          </p>
        </div>
      </footer>
    </div>
  );
}
