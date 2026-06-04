import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../data/api';
import { Appointment } from '../../types';
import { AdminLayout } from '../../components/layout/AdminLayout';
import { Spinner, Badge } from '../../components/ui';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
function pad(n: number) { return String(n).padStart(2, '0'); }
function formatTime(t: string) {
  const [h, m] = t.split(':');
  const hour = parseInt(h);
  return `${hour > 12 ? hour - 12 : hour}:${m}${hour >= 12 ? 'p' : 'a'}`;
}

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function AdminCalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');

  useEffect(() => {
    api.getAllAppointments().then(data => {
      setAppointments(data);
      setLoading(false);
    });
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
    setSelectedDate(null);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const getApptsByDate = (dateStr: string) =>
    appointments.filter(a => a.date === dateStr && a.status !== 'cancelled');

  const selectedAppts = selectedDate ? getApptsByDate(selectedDate) : [];

  // Week view: get current week from today
  const getWeekDates = () => {
    const base = selectedDate ? new Date(selectedDate + 'T12:00:00') : new Date(viewYear, viewMonth, 1);
    const day = base.getDay();
    const start = new Date(base);
    start.setDate(base.getDate() - day);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    });
  };

  if (loading) return <AdminLayout><Spinner className="mt-20" /></AdminLayout>;

  return (
    <AdminLayout>
      <div className="animate-fade-in-up">
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold-500 font-body mb-1">Schedule</p>
          <h1 className="font-display text-4xl text-noir-100 font-300">Booking Calendar</h1>
        </div>

        {/* View toggle + nav */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="w-8 h-8 border border-noir-700 text-noir-400 hover:text-gold-400 hover:border-gold-700 transition-colors flex items-center justify-center">
              ←
            </button>
            <span className="font-display text-xl text-noir-200 min-w-[180px] text-center">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button onClick={nextMonth} className="w-8 h-8 border border-noir-700 text-noir-400 hover:text-gold-400 hover:border-gold-700 transition-colors flex items-center justify-center">
              →
            </button>
          </div>
          <div className="flex gap-1">
            {(['month', 'week'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 text-[10px] tracking-[0.2em] uppercase font-body transition-colors ${
                  view === v ? 'bg-gold-500 text-noir-950' : 'border border-noir-700 text-noir-500 hover:text-noir-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Month view */}
        {view === 'month' && (
          <div className="bg-noir-900 border border-noir-800 overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-noir-800">
              {DAY_NAMES.map(d => (
                <div key={d} className="py-3 text-center text-[9px] tracking-[0.2em] uppercase text-noir-600 font-body">
                  {d}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7">
              {/* Empty cells */}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="border-b border-r border-noir-800 min-h-[80px] bg-noir-950/30" />
              ))}

              {/* Day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = `${viewYear}-${pad(viewMonth + 1)}-${pad(dayNum)}`;
                const dayAppts = getApptsByDate(dateStr);
                const isToday = dateStr === today.toISOString().split('T')[0];
                const isSelected = dateStr === selectedDate;
                const col = (firstDay + i) % 7;

                return (
                  <div
                    key={dayNum}
                    onClick={() => setSelectedDate(dateStr === selectedDate ? null : dateStr)}
                    className={`border-b border-r border-noir-800 min-h-[80px] p-2 cursor-pointer transition-colors ${
                      isSelected ? 'bg-noir-800' :
                      isToday ? 'bg-gold-950/20' :
                      'hover:bg-noir-800/50'
                    } ${col === 6 ? 'border-r-0' : ''}`}
                  >
                    <div className={`text-xs font-body mb-1.5 w-6 h-6 flex items-center justify-center ${
                      isToday ? 'bg-gold-500 text-noir-950 font-500' :
                      isSelected ? 'text-gold-400' :
                      'text-noir-500'
                    }`}>
                      {dayNum}
                    </div>
                    <div className="space-y-0.5">
                      {dayAppts.slice(0, 2).map(appt => (
                        <div
                          key={appt.id}
                          className="text-[9px] font-body bg-gold-900/40 text-gold-400 px-1.5 py-0.5 truncate border border-gold-800/50"
                        >
                          {formatTime(appt.time)} {appt.service?.name}
                        </div>
                      ))}
                      {dayAppts.length > 2 && (
                        <div className="text-[9px] font-body text-noir-500">+{dayAppts.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Week view */}
        {view === 'week' && (
          <div className="bg-noir-900 border border-noir-800 overflow-x-auto">
            <div className="grid grid-cols-7 min-w-[600px]">
              {getWeekDates().map(dateStr => {
                const d = new Date(dateStr + 'T12:00:00');
                const dayAppts = getApptsByDate(dateStr);
                const isToday = dateStr === today.toISOString().split('T')[0];
                return (
                  <div key={dateStr} className="border-r border-noir-800 last:border-r-0">
                    <div className={`p-3 border-b border-noir-800 text-center ${isToday ? 'bg-gold-950/20' : ''}`}>
                      <div className="text-[9px] tracking-[0.2em] uppercase text-noir-600 font-body">
                        {DAY_NAMES[d.getDay()]}
                      </div>
                      <div className={`text-lg font-display ${isToday ? 'text-gold-400' : 'text-noir-300'}`}>
                        {d.getDate()}
                      </div>
                    </div>
                    <div className="p-2 min-h-[200px] space-y-1.5">
                      {dayAppts.map(appt => (
                        <Link
                          key={appt.id}
                          to={`/admin/bookings/${appt.id}`}
                          className="block bg-noir-800 border border-noir-700 hover:border-gold-700 p-2 transition-colors"
                        >
                          <div className="text-[9px] text-gold-500 font-body mb-0.5">{formatTime(appt.time)}</div>
                          <div className="text-[10px] text-noir-200 font-body font-500 truncate">{appt.service?.name}</div>
                          <div className="text-[9px] text-noir-500 font-body truncate">{appt.stylist?.name}</div>
                        </Link>
                      ))}
                      {dayAppts.length === 0 && (
                        <p className="text-[9px] text-noir-700 font-body text-center pt-4">Free</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected date detail */}
        {selectedDate && view === 'month' && (
          <div className="mt-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl text-noir-200">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric'
                })}
              </h2>
              <span className="text-xs text-noir-600 font-body">{selectedAppts.length} appointment{selectedAppts.length !== 1 ? 's' : ''}</span>
            </div>
            {selectedAppts.length === 0 ? (
              <div className="bg-noir-900 border border-noir-800 p-8 text-center">
                <p className="text-sm text-noir-600 font-body">No appointments on this day.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedAppts.sort((a, b) => a.time.localeCompare(b.time)).map(appt => (
                  <Link
                    key={appt.id}
                    to={`/admin/bookings/${appt.id}`}
                    className="flex items-center justify-between bg-noir-900 border border-noir-800 hover:border-gold-700 p-4 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-gold-400 font-body w-12">{formatTime(appt.time)}</div>
                      <div>
                        <div className="text-sm text-noir-100 font-body font-500">{appt.service?.name}</div>
                        <div className="text-xs text-noir-500 font-body">{appt.user?.firstName} {appt.user?.lastName} · {appt.stylist?.name}</div>
                      </div>
                    </div>
                    <Badge variant={appt.status}>{appt.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
