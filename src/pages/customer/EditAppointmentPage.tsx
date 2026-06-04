import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../data/api';
import { Appointment, Service, Stylist, TimeSlot } from '../../types';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { Button, Alert, Spinner, Select, Input } from '../../components/ui';

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

export default function EditAppointmentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [form, setForm] = useState({ serviceId: '', stylistId: '', date: '', time: '' });
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.getAppointmentById(id),
      api.getServices(),
      api.getStylists(),
    ]).then(([appt, svcs, stys]) => {
      setAppointment(appt);
      setServices(svcs);
      setStylists(stys);
      setForm({
        serviceId: appt.serviceId,
        stylistId: appt.stylistId,
        date: appt.date,
        time: appt.time,
      });
      setLoading(false);
    }).catch(() => {
      setError('Failed to load appointment.');
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (form.date && form.stylistId) {
      setSlotsLoading(true);
      api.getAvailableSlots(form.date, form.stylistId, id).then(s => {
        setSlots(s);
        setSlotsLoading(false);
      });
    }
  }, [form.date, form.stylistId, id]);

  const handleSave = async () => {
    if (!id || !form.date || !form.time) { setError('Please fill in all fields.'); return; }
    setSaving(true);
    setError('');
    try {
      await api.updateAppointment(id, {
        serviceId: form.serviceId,
        stylistId: form.stylistId,
        date: form.date,
        time: form.time,
      });
      navigate(`/appointments/${id}`, { state: { updated: true } });
    } catch (err: any) {
      setError(err.message || 'Failed to update appointment.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CustomerLayout><Spinner className="mt-20" /></CustomerLayout>;
  if (!appointment) return (
    <CustomerLayout>
      <Alert type="error" message={error || 'Appointment not found.'} />
    </CustomerLayout>
  );

  if (appointment.status !== 'upcoming') return (
    <CustomerLayout>
      <Alert type="error" message="Only upcoming appointments can be modified." />
    </CustomerLayout>
  );

  return (
    <CustomerLayout>
      <div className="animate-fade-in-up max-w-xl">
        <Link
          to={`/appointments/${id}`}
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-noir-500 hover:text-gold-400 font-body transition-colors mb-8"
        >
          ← Back
        </Link>

        <div className="mb-8">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold-500 font-body mb-1">Modify</p>
          <h1 className="font-display text-4xl text-noir-100 font-300">Edit Appointment</h1>
        </div>

        {error && <div className="mb-6"><Alert type="error" message={error} /></div>}

        <div className="space-y-6">
          {/* Service */}
          <div className="bg-noir-900 border border-noir-800 p-6">
            <Select
              label="Service"
              value={form.serviceId}
              onChange={e => setForm({ ...form, serviceId: e.target.value })}
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name} — ${s.price}</option>
              ))}
            </Select>
          </div>

          {/* Stylist */}
          <div className="bg-noir-900 border border-noir-800 p-6">
            <Select
              label="Stylist"
              value={form.stylistId}
              onChange={e => setForm({ ...form, stylistId: e.target.value })}
            >
              {stylists.map(s => (
                <option key={s.id} value={s.id}>{s.name} — {s.specialty}</option>
              ))}
            </Select>
          </div>

          {/* Date */}
          <div className="bg-noir-900 border border-noir-800 p-6">
            <label className="block text-[10px] tracking-[0.2em] uppercase text-noir-400 mb-2 font-body">Date</label>
            <input
              type="date"
              min={getMinDate()}
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value, time: '' })}
              className="w-full bg-noir-800 border border-noir-700 text-noir-100 px-4 py-3 focus:outline-none focus:border-gold-500 font-body text-sm"
            />
            {form.date && (
              <p className="mt-2 text-sm text-gold-400 font-display">{formatDate(form.date)}</p>
            )}
          </div>

          {/* Time */}
          {form.date && form.stylistId && (
            <div className="bg-noir-900 border border-noir-800 p-6">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-noir-400 mb-4 font-body">
                Available Times
              </label>
              {slotsLoading ? (
                <Spinner />
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map(slot => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => slot.available && setForm({ ...form, time: slot.time })}
                      className={`py-2.5 text-xs font-body font-500 tracking-wider transition-all duration-200 ${
                        !slot.available
                          ? 'bg-noir-800 border border-noir-700 text-noir-700 cursor-not-allowed'
                          : form.time === slot.time
                          ? 'bg-gold-500 text-noir-950 border border-gold-500'
                          : 'bg-noir-800 border border-noir-700 text-noir-300 hover:border-gold-700'
                      }`}
                    >
                      {formatTime(slot.time)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t border-noir-800">
          <Link
            to={`/appointments/${id}`}
            className="flex-1 border border-noir-700 text-noir-400 hover:border-noir-500 px-6 py-3 text-xs tracking-widest uppercase font-body font-500 text-center transition-colors"
          >
            Cancel
          </Link>
          <Button
            loading={saving}
            disabled={!form.date || !form.time}
            onClick={handleSave}
            className="flex-1"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </CustomerLayout>
  );
}
