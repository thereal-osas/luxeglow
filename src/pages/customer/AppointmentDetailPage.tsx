import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../data/api';
import { Appointment } from '../../types';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { Badge, Button, Modal, Spinner, Alert } from '../../components/ui';

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

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      api.getAppointmentById(id)
        .then(setAppointment)
        .catch(() => setError('Appointment not found.'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleCancel = async () => {
    if (!appointment) return;
    setCancelling(true);
    try {
      const updated = await api.cancelAppointment(appointment.id);
      setAppointment(updated);
      setCancelModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <CustomerLayout><Spinner className="mt-20" /></CustomerLayout>;
  if (!appointment || error) return (
    <CustomerLayout>
      <Alert type="error" message={error || 'Appointment not found.'} />
    </CustomerLayout>
  );

  const isUpcoming = appointment.status === 'upcoming';
  const isPast = new Date(appointment.date) < new Date();

  return (
    <CustomerLayout>
      <div className="animate-fade-in-up max-w-xl">
        {/* Back */}
        <Link
          to="/appointments"
          className="inline-flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase text-noir-500 hover:text-gold-400 font-body transition-colors mb-8"
        >
          ← Back to Appointments
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold-500 font-body mb-1">
              Appointment Details
            </p>
            <h1 className="font-display text-3xl text-noir-100 font-300">{appointment.service?.name}</h1>
          </div>
          <Badge variant={appointment.status}>{appointment.status}</Badge>
        </div>

        {/* Main card */}
        <div className="bg-noir-900 border border-noir-800 divide-y divide-noir-800 mb-6">
          <div className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 border border-gold-700 flex items-center justify-center text-gold-400 font-display text-2xl">
              {appointment.service?.icon}
            </div>
            <div>
              <div className="font-body font-500 text-noir-100 mb-0.5">{appointment.service?.name}</div>
              <div className="text-sm text-noir-500 font-body">{appointment.service?.duration} minutes · ${appointment.service?.price}</div>
            </div>
          </div>

          <div className="p-6 grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-noir-600 font-body mb-1">Date</p>
              <p className="text-sm text-noir-200 font-body">{formatDate(appointment.date)}</p>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-noir-600 font-body mb-1">Time</p>
              <p className="text-sm text-noir-200 font-body">{formatTime(appointment.time)}</p>
            </div>
          </div>

          <div className="p-6 flex items-center gap-4">
            <div className="w-10 h-10 bg-noir-800 border border-noir-700 flex items-center justify-center text-xs font-body text-noir-400">
              {appointment.stylist?.avatar}
            </div>
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-noir-600 font-body mb-0.5">Stylist</p>
              <p className="text-sm text-noir-200 font-body font-500">{appointment.stylist?.name}</p>
              <p className="text-xs text-noir-500 font-body">{appointment.stylist?.specialty}</p>
            </div>
          </div>

          {appointment.notes && (
            <div className="p-6">
              <p className="text-[10px] tracking-[0.2em] uppercase text-noir-600 font-body mb-1">Notes</p>
              <p className="text-sm text-noir-400 font-body">{appointment.notes}</p>
            </div>
          )}

          <div className="p-6">
            <p className="text-[10px] tracking-[0.2em] uppercase text-noir-600 font-body mb-1">Booking ID</p>
            <p className="text-xs text-noir-600 font-mono">{appointment.id}</p>
          </div>
        </div>

        {/* Actions */}
        {isUpcoming && (
          <div className="flex gap-3">
            <Link
              to={`/appointments/${appointment.id}/edit`}
              className="flex-1 border border-gold-600 text-gold-400 hover:bg-gold-600 hover:text-noir-950 px-6 py-3 text-xs tracking-widest uppercase font-body font-500 transition-all duration-300 text-center"
            >
              Modify
            </Link>
            <Button
              variant="danger"
              onClick={() => setCancelModal(true)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        )}

        {appointment.status === 'completed' && (
          <Link
            to="/book"
            className="block w-full bg-gold-500 hover:bg-gold-400 text-noir-950 px-6 py-3 text-xs tracking-widest uppercase font-body font-500 transition-colors text-center"
          >
            Book Again
          </Link>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal isOpen={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Appointment">
        <div className="space-y-4">
          <p className="text-sm text-noir-400 font-body leading-relaxed">
            Are you sure you want to cancel your <span className="text-noir-100">{appointment.service?.name}</span> appointment
            with <span className="text-noir-100">{appointment.stylist?.name}</span> on <span className="text-noir-100">{formatDate(appointment.date)}</span>?
          </p>
          <p className="text-xs text-noir-600 font-body">This action cannot be undone.</p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setCancelModal(false)} className="flex-1">
              Keep Appointment
            </Button>
            <Button variant="danger" loading={cancelling} onClick={handleCancel} className="flex-1">
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </CustomerLayout>
  );
}
