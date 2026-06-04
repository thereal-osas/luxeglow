import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../data/api';
import { Appointment } from '../../types';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { Badge, Spinner, EmptyState, Button } from '../../components/ui';

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });
}
function formatTime(t: string) {
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.getMyAppointments(user.id).then(data => {
        setAppointments(data);
        setLoading(false);
      });
    }
  }, [user]);

  const upcoming = appointments.filter(a => a.status === 'upcoming');
  const recent = appointments.filter(a => a.status !== 'upcoming').slice(0, 3);
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  if (loading) return (
    <CustomerLayout>
      <Spinner className="mt-20" />
    </CustomerLayout>
  );

  return (
    <CustomerLayout>
      <div className="animate-fade-in-up">
        {/* Welcome */}
        <div className="mb-10">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold-500 font-body mb-1">
            Welcome back
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-noir-100 font-300">
            {user?.firstName} {user?.lastName}
          </h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Upcoming', value: upcoming.length, accent: true },
            { label: 'Completed', value: completedCount, accent: false },
            { label: 'Total Visits', value: appointments.filter(a => a.status !== 'cancelled').length, accent: false },
            { label: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length, accent: false },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`bg-noir-900 border p-6 animate-fade-in-up stagger-${i + 1} ${
                stat.accent ? 'border-gold-700' : 'border-noir-800'
              }`}
            >
              <div className={`font-display text-3xl mb-1 ${stat.accent ? 'text-gold-400' : 'text-noir-200'}`}>
                {stat.value}
              </div>
              <div className="text-[10px] tracking-[0.2em] uppercase text-noir-500 font-body">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Upcoming Appointments */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-noir-200">Upcoming Appointments</h2>
            <Link
              to="/book"
              className="text-[10px] tracking-[0.2em] uppercase text-gold-500 hover:text-gold-400 font-body transition-colors"
            >
              + Book New
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="bg-noir-900 border border-noir-800 p-12 text-center">
              <div className="text-4xl text-noir-700 mb-4">◇</div>
              <p className="font-display text-xl text-noir-400 mb-2">No upcoming appointments</p>
              <p className="text-sm text-noir-600 font-body mb-6">Book your next experience at LuxeGlow</p>
              <Link
                to="/book"
                className="inline-flex bg-gold-500 hover:bg-gold-400 text-noir-950 px-6 py-3 text-xs tracking-widest uppercase font-body font-500 transition-colors"
              >
                Book Appointment
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((appt, i) => (
                <Link
                  key={appt.id}
                  to={`/appointments/${appt.id}`}
                  className={`block bg-noir-900 border border-noir-800 hover:border-gold-700 transition-all duration-300 p-5 animate-fade-in-up stagger-${i + 1}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="w-12 h-12 border border-gold-700 flex items-center justify-center text-gold-400 font-display text-xl shrink-0">
                        {appt.service?.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="font-body font-500 text-sm text-noir-100 mb-0.5">{appt.service?.name}</div>
                        <div className="text-xs text-noir-500 font-body">{appt.stylist?.name}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm text-noir-200 font-body font-500">{formatDate(appt.date)}</div>
                      <div className="text-xs text-noir-500 font-body">{formatTime(appt.time)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent History */}
        {recent.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl text-noir-200">Recent History</h2>
              <Link
                to="/appointments"
                className="text-[10px] tracking-[0.2em] uppercase text-gold-500 hover:text-gold-400 font-body transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {recent.map((appt) => (
                <Link
                  key={appt.id}
                  to={`/appointments/${appt.id}`}
                  className="block bg-noir-900 border border-noir-800 hover:border-noir-700 transition-colors p-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="text-xl text-noir-600 shrink-0">{appt.service?.icon}</div>
                      <div className="min-w-0">
                        <div className="text-sm text-noir-300 font-body font-500 mb-0.5">{appt.service?.name}</div>
                        <div className="text-xs text-noir-600 font-body">{appt.stylist?.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-xs text-noir-500 font-body text-right hidden sm:block">
                        {formatDate(appt.date)}
                      </div>
                      <Badge variant={appt.status}>{appt.status}</Badge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
