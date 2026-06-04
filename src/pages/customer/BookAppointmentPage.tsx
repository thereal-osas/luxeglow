import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../data/api';
import { Service, Stylist, TimeSlot } from '../../types';
import { CustomerLayout } from '../../components/layout/CustomerLayout';
import { Button, Alert, Spinner } from '../../components/ui';

type Step = 1 | 2 | 3 | 4 | 5;

interface BookingState {
  serviceId: string;
  stylistId: string;
  date: string;
  time: string;
  notes: string;
}

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

const STEPS = ['Service', 'Stylist', 'Date', 'Time', 'Review'];

export default function BookAppointmentPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [booking, setBooking] = useState<BookingState>({
    serviceId: '', stylistId: '', date: '', time: '', notes: '',
  });
  const [services, setServices] = useState<Service[]>([]);
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([api.getServices(), api.getStylists()]).then(([svcs, stys]) => {
      setServices(svcs);
      setStylists(stys);
    });
  }, []);

  useEffect(() => {
    if (booking.date && booking.stylistId) {
      setSlotsLoading(true);
      api.getAvailableSlots(booking.date, booking.stylistId).then(s => {
        setSlots(s);
        setSlotsLoading(false);
      });
    }
  }, [booking.date, booking.stylistId]);

  const selectedService = services.find(s => s.id === booking.serviceId);
  const selectedStylist = stylists.find(s => s.id === booking.stylistId);

  const canProceed = () => {
    if (step === 1) return !!booking.serviceId;
    if (step === 2) return true; // stylist optional
    if (step === 3) return !!booking.date;
    if (step === 4) return !!booking.time;
    return true;
  };

  const handleNext = () => {
    if (step < 5) setStep((step + 1) as Step);
  };
  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step);
    setError('');
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError('');
    try {
      const appt = await api.createAppointment({
        userId: user.id,
        stylistId: booking.stylistId || stylists[0].id,
        serviceId: booking.serviceId,
        date: booking.date,
        time: booking.time,
        notes: booking.notes || undefined,
      });
      navigate(`/appointments/${appt.id}`, { state: { booked: true } });
    } catch (err: any) {
      setError(err.message || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="animate-fade-in-up max-w-2xl">
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold-500 font-body mb-1">New Booking</p>
          <h1 className="font-display text-4xl text-noir-100 font-300">Book an Appointment</h1>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((label, i) => {
            const n = (i + 1) as Step;
            const active = n === step;
            const done = n < step;
            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 flex items-center justify-center text-[11px] font-body font-500 transition-all duration-300 ${
                      active ? 'bg-gold-500 text-noir-950' :
                      done ? 'bg-noir-800 text-gold-400 border border-gold-700' :
                      'bg-noir-900 border border-noir-700 text-noir-600'
                    }`}
                  >
                    {done ? '✓' : n}
                  </div>
                  <div className={`text-[9px] tracking-widest uppercase font-body mt-1.5 ${active ? 'text-gold-400' : 'text-noir-600'}`}>
                    {label}
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mb-5 transition-colors duration-300 ${done ? 'bg-gold-700' : 'bg-noir-800'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {error && <div className="mb-6"><Alert type="error" message={error} /></div>}

        {/* Step 1: Service */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <h2 className="font-display text-2xl text-noir-200 mb-6">Choose a Service</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map(svc => (
                <button
                  key={svc.id}
                  onClick={() => setBooking({ ...booking, serviceId: svc.id })}
                  className={`text-left p-5 border transition-all duration-200 ${
                    booking.serviceId === svc.id
                      ? 'bg-noir-800 border-gold-500'
                      : 'bg-noir-900 border-noir-800 hover:border-noir-600'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`text-2xl ${booking.serviceId === svc.id ? 'text-gold-400' : 'text-noir-600'}`}>
                      {svc.icon}
                    </div>
                    <div>
                      <div className="font-body font-500 text-sm text-noir-100 mb-0.5">{svc.name}</div>
                      <div className="text-xs text-noir-500 font-body mb-2">{svc.description}</div>
                      <div className="flex gap-3 text-[10px] text-noir-600 font-body">
                        <span>{svc.duration} min</span>
                        <span>·</span>
                        <span className="text-gold-600">${svc.price}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Stylist */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <h2 className="font-display text-2xl text-noir-200 mb-2">Choose a Stylist</h2>
            <p className="text-xs text-noir-600 font-body mb-6">Optional — leave unselected and we'll assign one for you.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {stylists.map(stylist => (
                <button
                  key={stylist.id}
                  onClick={() => setBooking({ ...booking, stylistId: booking.stylistId === stylist.id ? '' : stylist.id })}
                  className={`text-left p-5 border transition-all duration-200 ${
                    booking.stylistId === stylist.id
                      ? 'bg-noir-800 border-gold-500'
                      : 'bg-noir-900 border-noir-800 hover:border-noir-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center text-sm font-body border ${
                      booking.stylistId === stylist.id ? 'border-gold-500 text-gold-400 bg-noir-800' : 'border-noir-700 text-noir-500'
                    }`}>
                      {stylist.avatar}
                    </div>
                    <div>
                      <div className="font-body font-500 text-sm text-noir-100 mb-0.5">{stylist.name}</div>
                      <div className="text-xs text-gold-600 font-body mb-1">{stylist.specialty}</div>
                      <div className="flex items-center gap-1">
                        <span className="text-gold-500 text-xs">★</span>
                        <span className="text-xs text-noir-500 font-body">{stylist.rating}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Date */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <h2 className="font-display text-2xl text-noir-200 mb-6">Choose a Date</h2>
            <div className="bg-noir-900 border border-noir-800 p-6">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-noir-400 mb-3 font-body">
                Select Date
              </label>
              <input
                type="date"
                min={getMinDate()}
                value={booking.date}
                onChange={e => setBooking({ ...booking, date: e.target.value, time: '' })}
                className="w-full bg-noir-800 border border-noir-700 text-noir-100 px-4 py-3 focus:outline-none focus:border-gold-500 font-body text-sm"
              />
              {booking.date && (
                <p className="mt-3 text-sm text-gold-400 font-display">{formatDate(booking.date)}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Time */}
        {step === 4 && (
          <div className="animate-fade-in-up">
            <h2 className="font-display text-2xl text-noir-200 mb-6">Choose a Time</h2>
            {slotsLoading ? (
              <Spinner />
            ) : slots.length === 0 ? (
              <Alert type="error" message="No available slots for this date. Please select another date." />
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {slots.map(slot => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => slot.available && setBooking({ ...booking, time: slot.time })}
                    className={`py-3 text-xs font-body font-500 tracking-wider transition-all duration-200 ${
                      !slot.available
                        ? 'bg-noir-900 border border-noir-800 text-noir-700 cursor-not-allowed'
                        : booking.time === slot.time
                        ? 'bg-gold-500 text-noir-950 border border-gold-500'
                        : 'bg-noir-900 border border-noir-800 text-noir-300 hover:border-gold-700 hover:text-gold-400'
                    }`}
                  >
                    {formatTime(slot.time)}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 5: Review */}
        {step === 5 && (
          <div className="animate-fade-in-up">
            <h2 className="font-display text-2xl text-noir-200 mb-6">Review & Confirm</h2>
            <div className="bg-noir-900 border border-noir-800 divide-y divide-noir-800 mb-6">
              {[
                { label: 'Service', value: `${selectedService?.name} — ${selectedService?.duration} min · $${selectedService?.price}` },
                { label: 'Stylist', value: booking.stylistId ? selectedStylist?.name : 'Any available stylist' },
                { label: 'Date', value: formatDate(booking.date) },
                { label: 'Time', value: formatTime(booking.time) },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between p-4 gap-4">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-noir-600 font-body shrink-0">{row.label}</span>
                  <span className="text-sm text-noir-200 font-body text-right">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <label className="block text-[10px] tracking-[0.2em] uppercase text-noir-400 mb-2 font-body">
                Notes (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Any special requests or notes for your stylist..."
                value={booking.notes}
                onChange={e => setBooking({ ...booking, notes: e.target.value })}
                className="w-full bg-noir-900 border border-noir-700 text-noir-100 px-4 py-3 focus:outline-none focus:border-gold-500 font-body text-sm placeholder-noir-600 resize-none"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-noir-800">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              ← Back
            </Button>
          )}
          <div className="flex-1" />
          {step < 5 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Continue →
            </Button>
          ) : (
            <Button onClick={handleSubmit} loading={submitting} size="lg">
              Confirm Booking
            </Button>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
