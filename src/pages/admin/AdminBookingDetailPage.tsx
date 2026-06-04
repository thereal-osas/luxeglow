import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../data/api';
import { Appointment, Service, Stylist, TimeSlot } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Badge, Button, Modal, Spinner, Alert, Select } from '../../components/ui';

function formatDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
}
function formatTime(t: string) {
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}
function getMinDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

export default function AdminBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ serviceId: '', stylistId: '', date: '', time: '' });
  const [saving, setSaving] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([api.getAppointmentById(id), api.getServices(), api.getStylists()])
      .then(([appt, svcs, stys]) => {
        setAppointment(appt);
        setServices(svcs);
        setStylists(stys);
        setForm({ serviceId: appt.serviceId, stylistId: appt.stylistId, date: appt.date, time: appt.time });
        setLoading(false);
      })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, [id]);

  useEffect(() => {
    if (editing && form.date && form.stylistId) {
      setSlotsLoading(true);
      api.getAvailableSlots(form.date, form.stylistId, id).then(s => {
        setSlots(s);
        setSlotsLoading(false);
      });
    }
  }, [form.date, form.stylistId, editing, id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setError('');
    try {
      const updated = await api.updateAppointment(id, form);
      setAppointment(updated);
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    setCancelling(true);
    try {
      const updated = await api.cancelAppointment(id);
      setAppointment(updated);
      setCancelModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <AdminLayout><Spinner className="mt-20" /></AdminLayout>;
  if (!appointment) return <AdminLayout><Alert type="error" message={error || 'Not found.'} /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="animate-fade-in-up max-w-2xl">
        <Link
          to="/admin/bookings"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-noir-500 hover:text-gold-400 font-body transition-colors mb-8"
        >
          ← All Bookings
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-500 font-body mb-1">Booking</p>
            <h1 className="font-display text-3xl text-noir-100 font-300">{appointment.service?.name}</h1>
          </div>
          <Badge variant={appointment.status}>{appointment.status}</Badge>
        </div>

        {error && <div className="mb-6"><Alert type="error" message={error} /></div>}

        {/* Customer info */}
        <div className="bg-noir-900 border border-noir-800 p-6 mb-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-noir-600 font-body mb-3">Customer</p>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-noir-800 border border-noir-700 flex items-center justify-center text-xs font-body text-noir-400">
              {appointment.user?.firstName[0]}{appointment.user?.lastName[0]}
            </div>
            <div>
              <div className="font-body font-500 text-sm text-noir-100">{appointment.user?.firstName} {appointment.user?.lastName}</div>
              <div className="text-xs text-noir-500 font-body">{appointment.user?.email}</div>
              <div className="text-xs text-noir-500 font-body">{appointment.user?.phone}</div>
            </div>
          </div>
        </div>

        {/* Edit / View */}
        {editing ? (
          <div className="bg-noir-900 border border-gold-700 p-6 mb-4 space-y-4">
            <p className="text-[10px] tracking-[0.2em] uppercase text-gold-500 font-body mb-2">Edit Booking</p>
            <Select label="Service" value={form.serviceId} onChange={e => setForm({ ...form, serviceId: e.target.value })}>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <Select label="Stylist" value={form.stylistId} onChange={e => setForm({ ...form, stylistId: e.target.value, time: '' })}>
              {stylists.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
            <div>
              <label className="block text-[10px] tracking-[0.2em] uppercase text-noir-400 mb-2 font-body">Date</label>
              <input
                type="date"
                min={getMinDate()}
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value, time: '' })}
                className="w-full bg-noir-800 border border-noir-700 text-noir-100 px-4 py-3 focus:outline-none focus:border-gold-500 font-body text-sm"
              />
            </div>
            {form.date && form.stylistId && (
              <div>
                <label className="block text-[10px] tracking-[0.2em] uppercase text-noir-400 mb-3 font-body">Time</label>
                {slotsLoading ? <Spinner /> : (
                  <div className="grid grid-cols-4 gap-2">
                    {slots.map(slot => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => slot.available && setForm({ ...form, time: slot.time })}
                        className={`py-2 text-[10px] font-body font-500 transition-all ${
                          !slot.available ? 'bg-noir-800 border border-noir-700 text-noir-700 cursor-not-allowed' :
                          form.time === slot.time ? 'bg-gold-500 text-noir-950 border border-gold-500' :
                          'bg-noir-800 border border-noir-700 text-noir-300 hover:border-gold-700'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">Cancel</Button>
              <Button loading={saving} onClick={handleSave} className="flex-1">Save</Button>
            </div>
          </div>
        ) : (
          <div className="bg-noir-900 border border-noir-800 divide-y divide-noir-800 mb-4">
            {[
              { label: 'Service', value: `${appointment.service?.name} — ${appointment.service?.duration} min · $${appointment.service?.price}` },
              { label: 'Stylist', value: appointment.stylist?.name },
              { label: 'Date', value: formatDate(appointment.date) },
              { label: 'Time', value: formatTime(appointment.time) },
              { label: 'Booking ID', value: appointment.id },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between p-4 gap-4">
                <span className="text-[10px] tracking-[0.2em] uppercase text-noir-600 font-body shrink-0">{row.label}</span>
                <span className="text-sm text-noir-200 font-body text-right">{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {appointment.status === 'upcoming' && !editing && (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setEditing(true)} className="flex-1">Edit Booking</Button>
            <Button variant="danger" onClick={() => setCancelModal(true)} className="flex-1">Cancel Booking</Button>
          </div>
        )}
      </div>

      <Modal isOpen={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Booking">
        <div className="space-y-4">
          <p className="text-sm text-noir-400 font-body">
            Cancel this <span className="text-noir-100">{appointment.service?.name}</span> appointment for{' '}
            <span className="text-noir-100">{appointment.user?.firstName} {appointment.user?.lastName}</span>?
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setCancelModal(false)} className="flex-1">Keep</Button>
            <Button variant="danger" loading={cancelling} onClick={handleCancel} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
}
