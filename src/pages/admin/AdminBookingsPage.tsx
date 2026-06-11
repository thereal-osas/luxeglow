import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../data/api';
import { Appointment, AppointmentStatus, Stylist, Service } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Badge, Spinner, Select, Button, EmptyState, Modal, Alert } from '../../components/ui';

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}
function formatTime(t: string) {
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

export default function AdminBookingsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', stylist: '', service: '', date: '' });
  const [cancelModal, setCancelModal] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.getAllAppointments(),
      api.getStylists(),
      api.getServices()
    ]).then(([apptData, stylistData, serviceData]) => {
      setAppointments(apptData);
      setStylists(stylistData);
      setServices(serviceData);
      setLoading(false);
    }).catch((err: any) => {
      setError(err.message || 'Failed to load bookings.');
      setLoading(false);
    });
  };

  useEffect(() => { load(); }, []);

  const filtered = appointments.filter(a => {
    if (filters.status && a.status !== filters.status) return false;
    if (filters.stylist && a.stylistId !== filters.stylist) return false;
    if (filters.service && a.serviceId !== filters.service) return false;
    if (filters.date && a.date !== filters.date) return false;
    return true;
  });

  const handleCancel = async () => {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      await api.cancelAppointment(cancelModal.id);
      setAppointments(prev => prev.map(a =>
        a.id === cancelModal.id ? { ...a, status: 'cancelled' as AppointmentStatus } : a
      ));
      setCancelModal(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const clearFilters = () => setFilters({ status: '', stylist: '', service: '', date: '' });
  const hasFilters = Object.values(filters).some(v => !!v);

  if (loading) return <AdminLayout><Spinner className="mt-20" /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="animate-fade-in-up">
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold-500 font-body mb-1">Management</p>
          <h1 className="font-display text-4xl text-noir-100 font-300">All Bookings</h1>
        </div>

        {error && <div className="mb-6"><Alert type="error" message={error} /></div>}

        {/* Filters */}
        <div className="bg-noir-900 border border-noir-800 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-noir-600 font-body">Filters</p>
            {hasFilters && (
              <button onClick={clearFilters} className="text-[10px] tracking-widest uppercase text-blush-400 hover:text-blush-300 font-body transition-colors">
                Clear All
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Select
              label="Status"
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </Select>
            <Select
              label="Stylist"
              value={filters.stylist}
              onChange={e => setFilters({ ...filters, stylist: e.target.value })}
            >
              <option value="">All Stylists</option>
              {stylists.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Select
              label="Service"
              value={filters.service}
              onChange={e => setFilters({ ...filters, service: e.target.value })}
            >
              <option value="">All Services</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-noir-400 mb-2 font-body">Date</label>
              <input
                type="date"
                value={filters.date}
                onChange={e => setFilters({ ...filters, date: e.target.value })}
                className="w-full bg-noir-900 border border-noir-700 text-noir-100 px-4 py-3 focus:outline-none focus:border-gold-500 font-body text-sm"
              />
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-noir-500 font-body">
            Showing <span className="text-noir-200">{filtered.length}</span> of {appointments.length} bookings
          </p>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <EmptyState icon="◇" title="No bookings found" message="Try adjusting your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-noir-800">
                  {['Customer', 'Service', 'Stylist', 'Date & Time', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[9px] tracking-[0.3em] uppercase text-noir-600 font-body">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-noir-800">
                {filtered.map((appt, i) => (
                  <tr
                    key={appt.id}
                    className={`bg-noir-900 hover:bg-noir-800/50 transition-colors animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}
                  >
                    <td className="px-4 py-4">
                      <div className="text-sm text-noir-100 font-body font-500">
                        {appt.user?.firstName} {appt.user?.lastName}
                      </div>
                      <div className="text-xs text-noir-600 font-body">{appt.user?.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-noir-600">{appt.service?.icon}</span>
                        <span className="text-sm text-noir-300 font-body">{appt.service?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-noir-400 font-body">{appt.stylist?.name}</td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-noir-200 font-body">{formatDate(appt.date)}</div>
                      <div className="text-xs text-noir-500 font-body">{formatTime(appt.time)}</div>
                    </td>
                    <td className="px-4 py-4"><Badge variant={appt.status}>{appt.status}</Badge></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          to={`/admin/bookings/${appt.id}`}
                          className="text-[10px] tracking-widest uppercase text-gold-600 hover:text-gold-400 font-body transition-colors"
                        >
                          View
                        </Link>
                        {appt.status === 'upcoming' && (
                          <button
                            onClick={() => setCancelModal(appt)}
                            className="text-[10px] tracking-widest uppercase text-blush-600 hover:text-blush-400 font-body transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel modal */}
      <Modal isOpen={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Booking">
        <div className="space-y-4">
          <p className="text-sm text-noir-400 font-body leading-relaxed">
            Cancel <span className="text-noir-100">{cancelModal?.service?.name}</span> for{' '}
            <span className="text-noir-100">{cancelModal?.user?.firstName} {cancelModal?.user?.lastName}</span>?
          </p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setCancelModal(null)} className="flex-1">Keep</Button>
            <Button variant="danger" loading={cancelling} onClick={handleCancel} className="flex-1">Cancel Booking</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
