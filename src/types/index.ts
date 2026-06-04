export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface Stylist {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  avatar: string;
  rating: number;
  availability: string[];
}

export interface Service {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  description: string;
  category: string;
  icon: string;
}

export type AppointmentStatus = 'upcoming' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  userId: string;
  stylistId: string;
  serviceId: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  // Populated fields
  stylist?: Stylist;
  service?: Service;
  user?: User;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
