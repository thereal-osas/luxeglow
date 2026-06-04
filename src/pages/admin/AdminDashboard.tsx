import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../data/api';
import { Appointment } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Badge, Spinner } from '../../components/ui';

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  });
}
function formatTime(t: string) {
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export default function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAllAppointments().then(data => {
      setAppointments(data);
      setLoading(false);
    });
  }, []);

  const upcoming = appointments.filter(a => a.status === 'upcoming');
  const today = new Date().toISOString().split('T')[0];
  const todaysAppts = upcoming.filter(a => a.date === today);
  const completed = appointments.filter(a => a.status === 'completed');
  const cancelled = appointments.filter(a => a.status === 'cancelled');

  if (loading) return <AdminLayout><Spinner className="mt-20" /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="animate-fade-in-up">
        <div className="mb-10">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold-500 font-body mb-1">Overview</p>
          <h1 className="font-display text-4xl md:text-5xl text-noir-100 font-300">Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Today's Bookings", value: todaysAppts.length, accent: true },
            { label: 'Upcoming Total', value: upcoming.length, accent: false },
            { label: 'Completed', value: completed.length, accent: false },
            { label: 'Cancelled', value: cancelled.length, accent: false },
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

        {/* Upcoming appointments */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl text-noir-200">Upcoming Appointments</h2>
            <Link
              to="/admin/bookings"
              className="text-[10px] tracking-[0.2em] uppercase text-gold-500 hover:text-gold-400 font-body transition-colors"
            >
              Manage All →
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="bg-noir-900 border border-noir-800 p-12 text-center">
              <p className="font-display text-xl text-noir-400">No upcoming appointments</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-noir-800">
                    {['Customer', 'Service', 'Stylist', 'Date', 'Time', 'Status', ''].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[9px] tracking-[0.3em] uppercase text-noir-600 font-body">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-noir-800">
                  {upcoming.slice(0, 8).map((appt, i) => (
                    <tr
                      key={appt.id}
                      className={`bg-noir-900 hover:bg-noir-800 transition-colors animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                    >
                      <td className="px-4 py-4 text-sm text-noir-100 font-body font-500">
                        {appt.user?.firstName} {appt.user?.lastName}
                      </td>
                      <td className="px-4 py-4 text-sm text-noir-400 font-body">{appt.service?.name}</td>
                      <td className="px-4 py-4 text-sm text-noir-400 font-body">{appt.stylist?.name}</td>
                      <td className="px-4 py-4 text-sm text-noir-400 font-body">{formatDate(appt.date)}</td>
                      <td className="px-4 py-4 text-sm text-noir-400 font-body">{formatTime(appt.time)}</td>
                      <td className="px-4 py-4"><Badge variant="upcoming">Upcoming</Badge></td>
                      <td className="px-4 py-4">
                        <Link
                          to={`/admin/bookings/${appt.id}`}
                          className="text-[10px] tracking-widest uppercase text-noir-500 hover:text-gold-400 font-body transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
