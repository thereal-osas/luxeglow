import React, { useState, useEffect } from 'react';

// ── Countdown target — adjust to your launch date ─────────────────────────────
const LAUNCH_DATE = new Date('2026-06-12T00:00:00');

function getTimeLeft() {
  const diff = LAUNCH_DATE.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function CountUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center border border-gold-800"
        style={{ background: 'rgba(201,147,24,0.04)' }}
      >
        {/* Corner accents */}
        <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-gold-500" />
        <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-gold-500" />
        <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-gold-500" />
        <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-gold-500" />
        <span className="font-display text-3xl sm:text-4xl text-gold-300 tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="text-[9px] tracking-[0.3em] uppercase text-noir-600 font-body">{label}</span>
    </div>
  );
}

export default function ComingSoonPage() {
  const [time, setTime] = useState(getTimeLeft());
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [particles] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 1.5 + 0.5,
      delay: Math.random() * 4,
      duration: Math.random() * 6 + 6,
    }))
  );

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div
      className="min-h-screen bg-noir-950 text-noir-100 flex flex-col items-center justify-center relative overflow-hidden px-6"
    >
      {/* Grain overlay */}
      <div className="absolute inset-0 bg-grain opacity-40 pointer-events-none" />

      {/* Radial gold glow — top center */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(201,147,24,0.14) 0%, transparent 70%)',
        }}
      />

      {/* Radial blush glow — bottom */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, rgba(226,101,78,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-gold-500 opacity-20 pointer-events-none"
          style={{
            top: p.top,
            left: p.left,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `floatDot ${p.duration}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        />
      ))}

      {/* Horizontal rule lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-800 to-transparent opacity-40" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-800 to-transparent opacity-40" />

      {/* ── Logo ─────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-16 sm:mb-20 relative z-10">
        <div className="w-7 h-7 border border-gold-500 flex items-center justify-center">
          <div className="w-3 h-3 bg-gold-500" />
        </div>
        <span className="font-display text-lg tracking-[0.15em] text-gold-400">LuxeGlow</span>
      </div>

      {/* ── Main copy ─────────────────────────────────────────────────────────── */}
      <div className="relative z-10 text-center max-w-xl mx-auto">
        <p className="text-[10px] tracking-[0.4em] uppercase text-gold-600 font-body mb-5">
          Something beautiful is coming
        </p>

        <h1
          className="font-display text-6xl sm:text-7xl md:text-8xl font-light text-noir-100 leading-none mb-3"
          style={{ letterSpacing: '0.02em' }}
        >
          Coming
          <br />
          <em className="text-gold-400 not-italic">Soon.</em>
        </h1>

        <p className="text-noir-500 font-body text-sm leading-relaxed mt-6 mb-12 max-w-sm mx-auto">
          We're crafting a new era of luxury beauty experiences. Be the first to know when we open
          our doors.
        </p>

        {/* ── Countdown ──────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-center gap-4 sm:gap-6 mb-14">
          <CountUnit value={time.days} label="Days" />
          <div className="text-gold-700 font-display text-4xl mt-6 select-none">·</div>
          <CountUnit value={time.hours} label="Hours" />
          <div className="text-gold-700 font-display text-4xl mt-6 select-none">·</div>
          <CountUnit value={time.minutes} label="Minutes" />
          <div className="text-gold-700 font-display text-4xl mt-6 select-none">·</div>
          <CountUnit value={time.seconds} label="Seconds" />
        </div>

        {/* ── Email capture ──────────────────────────────────────────────────── */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 bg-transparent border border-noir-800 focus:border-gold-600 px-4 py-3 text-sm text-noir-200 placeholder-noir-700 font-body outline-none transition-colors duration-200"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-gold-500 hover:bg-gold-400 text-noir-950 text-[11px] tracking-[0.25em] uppercase font-body font-medium transition-colors duration-200 whitespace-nowrap"
            >
              Notify Me
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-3 max-w-sm mx-auto border border-gold-900 px-6 py-4" style={{ background: 'rgba(201,147,24,0.06)' }}>
            <span className="text-gold-500 text-lg">✦</span>
            <p className="text-sm text-noir-300 font-body">
              You're on the list. We'll be in touch.
            </p>
          </div>
        )}

        {/* ── Decorative divider ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-4 mt-14 justify-center">
          <div className="h-px w-12 bg-noir-800" />
          <span className="text-gold-700 text-[10px]">✦</span>
          <div className="h-px w-12 bg-noir-800" />
        </div>

        <p className="mt-5 text-[10px] tracking-[0.25em] uppercase text-noir-700 font-body">
          Luxury · Beauty · Wellness
        </p>
      </div>

      {/* Float animation keyframes — injected inline so no extra CSS file needed */}
      <style>{`
        @keyframes floatDot {
          from { transform: translateY(0px) scale(1); opacity: 0.15; }
          to   { transform: translateY(-18px) scale(1.4); opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}
