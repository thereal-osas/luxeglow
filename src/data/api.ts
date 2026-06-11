// src/data/api.ts
// ─────────────────────────────────────────────────────────────────────────────
// SUPABASE REPLACEMENT — drop this file in place of the mock api.ts
// Every function signature is identical to the mock version so no component
// needs to change.
//
// SETUP:
//   1. npm install @supabase/supabase-js
//   2. Create src/lib/supabase.ts  (see below)
//   3. Add .env variables (see bottom of file)
// ─────────────────────────────────────────────────────────────────────────────

import { supabase } from '../lib/supabase';
import { User, Appointment, Stylist, Service, TimeSlot } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Supabase returns joined rows as nested objects — reshape to match our types */
function mapAppointment(row: any): Appointment {
  const cleanDate = row.date
    ? (row.date.includes('T') ? row.date.split('T')[0] : row.date.split(' ')[0])
    : '';

  return {
    id: String(row.id),
    userId: String(row.user_id),
    stylistId: row.stylist_id ? String(row.stylist_id) : '',
    serviceId: row.service_id ? String(row.service_id) : '',
    date: cleanDate,
    time: row.time,
    status: row.status,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    // Populated relations (present when we use .select('*, service:services(*), stylist:stylists(*), user:profiles(*)'))
    stylist: row.stylist
      ? {
        id: String(row.stylist.id),
        name: row.stylist.name,
        specialty: row.stylist.specialty,
        bio: row.stylist.bio,
        avatar: row.stylist.avatar,
        rating: row.stylist.rating,
        availability: row.stylist.availability ?? [],
      }
      : undefined,
    service: row.service
      ? {
        id: String(row.service.id),
        name: row.service.name,
        duration: row.service.duration,
        price: row.service.price,
        description: row.service.description,
        category: row.service.category,
        icon: row.service.icon,
      }
      : undefined,
    user: row.user
      ? {
        id: String(row.user.id),
        firstName: row.user.first_name,
        lastName: row.user.last_name,
        email: row.user.email,
        phone: row.user.phone,
        role: row.user.role,
        createdAt: row.user.created_at,
      }
      : undefined,
  };
}

// SELECT string reused across every appointment query
const APPOINTMENT_SELECT = `
  *,
  service:services(*),
  stylist:stylists(*),
  user:profiles(*)
`;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const api = {

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw new Error(error?.message ?? 'Invalid email or password.');

    // Fetch the profile row (first_name, last_name, role, etc.)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) throw new Error('Profile not found.');

    const user: User = {
      id: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      phone: profile.phone,
      role: profile.role,
      createdAt: profile.created_at,
    };

    return { user, token: data.session?.access_token ?? '' };
  },

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<User> {
    // 1. Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user) {
      // Supabase returns a generic message for duplicate emails — make it friendlier
      if (authError?.message?.toLowerCase().includes('already registered')) {
        throw new Error('An account with this email already exists.');
      }
      throw new Error(authError?.message ?? 'Registration failed.');
    }

    // 2. Upsert the profile row.
    // We use upsert (not insert) for two reasons:
    //   a) A DB trigger may have already created the row → INSERT would fail
    //      with a duplicate-key error (23505).
    //   b) signUp without email-confirmation fires onAuthStateChange before
    //      the INSERT runs, so a SELECT in that handler returns 403 because
    //      the row doesn't exist yet — upsert lets us write the full row.
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(
        {
          id: authData.user.id,
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          role: 'customer',
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      console.error('Profile upsert error:', profileError);
      throw new Error(profileError.message || 'Failed to create profile.');
    }

    return {
      id: authData.user.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      role: 'customer' as const,
      createdAt: new Date().toISOString(),
    };
  },

  // ─── Services ───────────────────────────────────────────────────────────────

  async getServices(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('name');

    if (error) throw new Error(error.message);

    return (data ?? []).map(row => ({
      id: row.id,
      name: row.name,
      duration: row.duration,
      price: row.price,
      description: row.description,
      category: row.category,
      icon: row.icon,
    }));
  },

  // ─── Stylists ────────────────────────────────────────────────────────────────

  async getStylists(): Promise<Stylist[]> {
    const { data, error } = await supabase
      .from('stylists')
      .select('*')
      .order('name');

    if (error) throw new Error(error.message);

    return (data ?? []).map(row => ({
      id: row.id,
      name: row.name,
      specialty: row.specialty,
      bio: row.bio,
      avatar: row.avatar,
      rating: row.rating,
      availability: row.availability ?? [],
    }));
  },

  // ─── Time Slots ──────────────────────────────────────────────────────────────

  async getAvailableSlots(
    date: string,
    stylistId: string,
    excludeApptId?: string
  ): Promise<TimeSlot[]> {
    // All possible slots for the day
    const ALL_SLOTS = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
      '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    ];

    // Fetch already-booked slots for this stylist on this date
    let query = supabase
      .from('appointments')
      .select('time')
      .eq('date', date)
      .eq('stylist_id', stylistId)
      .neq('status', 'cancelled');

    // When editing an existing appointment, exclude it from the conflict check
    if (excludeApptId) {
      query = query.neq('id', excludeApptId);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const booked = new Set((data ?? []).map(r => r.time));

    return ALL_SLOTS.map(time => ({
      time,
      available: !booked.has(time),
    }));
  },

  // ─── Appointments — Customer ─────────────────────────────────────────────────

  async getMyAppointments(userId: string): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(APPOINTMENT_SELECT)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapAppointment);
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .select(APPOINTMENT_SELECT)
      .eq('id', id)
      .single();

    if (error || !data) throw new Error('Appointment not found.');
    return mapAppointment(data);
  },

  async createAppointment(input: {
    userId: string;
    stylistId: string;
    serviceId: string;
    date: string;
    time: string;
    notes?: string;
  }): Promise<Appointment> {
    // Check for conflicts first (belt-and-suspenders alongside DB constraints)
    const { data: existing } = await supabase
      .from('appointments')
      .select('id')
      .eq('date', input.date)
      .eq('stylist_id', input.stylistId)
      .eq('time', input.time)
      .neq('status', 'cancelled')
      .maybeSingle();

    if (existing) throw new Error('This time slot is no longer available.');

    const { data, error } = await supabase
      .from('appointments')
      .insert({
        user_id: input.userId,
        stylist_id: input.stylistId,
        service_id: input.serviceId,
        date: input.date,
        time: input.time,
        status: 'upcoming',
        notes: input.notes ?? null,
      })
      .select(APPOINTMENT_SELECT)
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to create appointment.');
    return mapAppointment(data);
  },

  async updateAppointment(id: string, updates: {
    serviceId?: string;
    stylistId?: string;
    date?: string;
    time?: string;
    notes?: string;
    status?: string;
  }): Promise<Appointment> {
    // Map camelCase fields back to snake_case for Supabase
    const payload: Record<string, any> = {};
    if (updates.serviceId !== undefined) payload.service_id = updates.serviceId;
    if (updates.stylistId !== undefined) payload.stylist_id = updates.stylistId;
    if (updates.date !== undefined) payload.date = updates.date;
    if (updates.time !== undefined) payload.time = updates.time;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.status !== undefined) payload.status = updates.status;

    const { data, error } = await supabase
      .from('appointments')
      .update(payload)
      .eq('id', id)
      .select(APPOINTMENT_SELECT)
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to update appointment.');
    return mapAppointment(data);
  },

  async cancelAppointment(id: string): Promise<Appointment> {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select(APPOINTMENT_SELECT)
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Failed to cancel appointment.');
    return mapAppointment(data);
  },

  // ─── Appointments — Admin ────────────────────────────────────────────────────

  async getAllAppointments(): Promise<Appointment[]> {
    // Requires admin role — enforced by the RLS policy on the DB side
    const { data, error } = await supabase
      .from('appointments')
      .select(APPOINTMENT_SELECT)
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []).map(mapAppointment);
  },
};
