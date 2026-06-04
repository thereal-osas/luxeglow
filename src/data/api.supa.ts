import { User, Appointment, Stylist, Service, TimeSlot } from '../types';
import {
  MOCK_USERS,
  MOCK_STYLISTS,
  MOCK_SERVICES,
  MOCK_APPOINTMENTS,
  TIME_SLOTS,
  MOCK_PASSWORDS,
} from './mockData';

// Simulate network latency
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// In-memory store
let appointments = [...MOCK_APPOINTMENTS];
let users = [...MOCK_USERS];

// Populate related data
function populateAppointment(appt: Appointment): Appointment {
  return {
    ...appt,
    stylist: MOCK_STYLISTS.find(s => s.id === appt.stylistId),
    service: MOCK_SERVICES.find(s => s.id === appt.serviceId),
    user: users.find(u => u.id === appt.userId),
  };
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await delay(600);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || MOCK_PASSWORDS[email] !== password) {
      throw new Error('Invalid email or password.');
    }
    return { user, token: `mock-token-${user.id}-${Date.now()}` };
  },

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<User> {
    await delay(700);
    if (users.find(u => u.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    const newUser: User = {
      id: `u${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      role: 'customer',
      createdAt: new Date().toISOString().split('T')[0],
    };
    users.push(newUser);
    (MOCK_PASSWORDS as any)[data.email] = data.password;
    return newUser;
  },

  // Services
  async getServices(): Promise<Service[]> {
    await delay(300);
    return MOCK_SERVICES;
  },

  // Stylists
  async getStylists(): Promise<Stylist[]> {
    await delay(300);
    return MOCK_STYLISTS;
  },

  // Time slots
  async getAvailableSlots(date: string, stylistId: string, excludeApptId?: string): Promise<TimeSlot[]> {
    await delay(400);
    const booked = appointments
      .filter(a =>
        a.date === date &&
        a.stylistId === stylistId &&
        a.status !== 'cancelled' &&
        a.id !== excludeApptId
      )
      .map(a => a.time);

    return TIME_SLOTS.map(time => ({
      time,
      available: !booked.includes(time),
    }));
  },

  // Appointments
  async getMyAppointments(userId: string): Promise<Appointment[]> {
    await delay(400);
    return appointments
      .filter(a => a.userId === userId)
      .map(populateAppointment)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getAllAppointments(): Promise<Appointment[]> {
    await delay(400);
    return appointments.map(populateAppointment)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getAppointmentById(id: string): Promise<Appointment> {
    await delay(300);
    const appt = appointments.find(a => a.id === id);
    if (!appt) throw new Error('Appointment not found.');
    return populateAppointment(appt);
  },

  async createAppointment(data: {
    userId: string;
    stylistId: string;
    serviceId: string;
    date: string;
    time: string;
    notes?: string;
  }): Promise<Appointment> {
    await delay(600);
    // Check for conflicts
    const conflict = appointments.find(
      a => a.date === data.date && a.stylistId === data.stylistId && a.time === data.time && a.status !== 'cancelled'
    );
    if (conflict) throw new Error('This time slot is no longer available.');

    const newAppt: Appointment = {
      id: `a${Date.now()}`,
      ...data,
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    };
    appointments.push(newAppt);
    return populateAppointment(newAppt);
  },

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    await delay(600);
    const idx = appointments.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Appointment not found.');
    appointments[idx] = { ...appointments[idx], ...data };
    return populateAppointment(appointments[idx]);
  },

  async cancelAppointment(id: string): Promise<Appointment> {
    await delay(500);
    const idx = appointments.findIndex(a => a.id === id);
    if (idx === -1) throw new Error('Appointment not found.');
    appointments[idx] = { ...appointments[idx], status: 'cancelled' };
    return populateAppointment(appointments[idx]);
  },
};
