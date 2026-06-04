import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../data/api';
import { Appointment, AppointmentStatus } from '../../types';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { Badge, Spinner, EmptyState } from '../../components/ui';

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
  });
}
function formatTime(t: string) {
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

const FILTERS: { label: string; value: 'all' | AppointmentStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'all' | AppointmentStatus>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.getMyAppointments(user.id).then(data => {
        setAppointments(data);
        setLoading(false);
      });
    }
  }, [user]);

  const filtered = filter === 'all' ? appointments : appointments.filter(a => a.status === filter);

  if (loading) return (
    <CustomerLayout>
      <Spinner className="mt-20" />
    </CustomerLayout>
  );

  return (
    <CustomerLayout>
      <div className="animate-fade-in-up">
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold-500 font-body mb-1">History</p>
          <h1 className="font-display text-4xl text-noir-100 font-300">My Appointments</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-1 mb-8 border-b border-noir-800">
          {FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-3 text-[10px] tracking-[0.2em] uppercase font-body transition-colors relative ${
                filter === f.value
                  ? 'text-gold-400'
                  : 'text-noir-500 hover:text-noir-300'
              }`}
            >
              {f.label}
              {filter === f.value && (
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gold-500" />
              )}
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <EmptyState
            icon="◇"
            title="No appointments found"
            message={filter === 'all' ? "You haven't booked any appointments yet." : `No ${filter} appointments.`}
            action={
              filter === 'all' ? (
                <Link
                  to="/book"
                  className="inline-flex bg-gold-500 hover:bg-gold-400 text-noir-950 px-6 py-3 text-xs tracking-widest uppercase font-body font-500 transition-colors"
                >
                  Book Appointment
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((appt, i) => (
              <Link
                key={appt.id}
                to={`/appointments/${appt.id}`}
                className={`block bg-noir-900 border border-noir-800 hover:border-noir-700 transition-colors p-5 md:p-6 animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
              >
                <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 border flex items-center justify-center font-display text-xl shrink-0 ${
                      appt.status === 'upcoming' ? 'border-gold-700 text-gold-400' : 'border-noir-700 text-noir-600'
                    }`}>
                      {appt.service?.icon}
                    </div>
                    <div>
                      <div className="font-body font-500 text-sm text-noir-100 mb-0.5">{appt.service?.name}</div>
                      <div className="text-xs text-noir-500 font-body mb-1">{appt.stylist?.name}</div>
                      <div className="text-xs text-noir-600 font-body">{formatDate(appt.date)} at {formatTime(appt.time)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-[68px] sm:ml-0">
                    <div className="text-xs text-noir-500 font-body">${appt.service?.price}</div>
                    <Badge variant={appt.status}>{appt.status}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
