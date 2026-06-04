import { User, Stylist, Service, Appointment } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    firstName: 'Aria',
    lastName: 'Sinclair',
    email: 'demo@luxeglow.com',
    phone: '(555) 234-5678',
    role: 'customer',
    createdAt: '2024-01-15',
  },
  {
    id: 'u2',
    firstName: 'Admin',
    lastName: 'LuxeGlow',
    email: 'admin@luxeglow.com',
    phone: '(555) 000-0001',
    role: 'admin',
    createdAt: '2023-06-01',
  },
];

export const MOCK_STYLISTS: Stylist[] = [
  {
    id: 's1',
    name: 'Vivienne Morel',
    specialty: 'Color & Highlights',
    bio: 'Master colorist with 12 years creating bespoke transformations.',
    avatar: 'VM',
    rating: 4.9,
    availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  },
  {
    id: 's2',
    name: 'Julian Rhodes',
    specialty: 'Cuts & Styling',
    bio: 'Precision cuts and avant-garde styling for the modern aesthetic.',
    avatar: 'JR',
    rating: 4.8,
    availability: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  },
  {
    id: 's3',
    name: 'Cleo Nakamura',
    specialty: 'Skincare & Facials',
    bio: 'Licensed esthetician specializing in transformative facial treatments.',
    avatar: 'CN',
    rating: 4.9,
    availability: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
  },
  {
    id: 's4',
    name: 'Isabelle Dumont',
    specialty: 'Nails & Spa',
    bio: 'Award-winning nail artist with a passion for intricate nail art.',
    avatar: 'ID',
    rating: 4.7,
    availability: ['Monday', 'Tuesday', 'Thursday', 'Friday', 'Saturday'],
  },
  {
    id: 's5',
    name: 'Marcus Bell',
    specialty: 'Massage Therapy',
    bio: 'Certified massage therapist focusing on deep tissue and relaxation.',
    avatar: 'MB',
    rating: 4.8,
    availability: ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  },
];

export const MOCK_SERVICES: Service[] = [
  {
    id: 'svc1',
    name: 'Hair Styling',
    duration: 60,
    price: 85,
    description: 'Expert blow-dry, curls, or updo styling for any occasion.',
    category: 'Hair',
    icon: '✦',
  },
  {
    id: 'svc2',
    name: 'Hair Treatment',
    duration: 90,
    price: 120,
    description: 'Nourishing treatments to restore shine, strength, and vitality.',
    category: 'Hair',
    icon: '◈',
  },
  {
    id: 'svc3',
    name: 'Facial Treatment',
    duration: 75,
    price: 95,
    description: 'Bespoke facial treatments tailored to your unique skin needs.',
    category: 'Skin',
    icon: '◇',
  },
  {
    id: 'svc4',
    name: 'Manicure',
    duration: 45,
    price: 55,
    description: 'Luxury nail care with cuticle treatment and polish application.',
    category: 'Nails',
    icon: '◆',
  },
  {
    id: 'svc5',
    name: 'Pedicure',
    duration: 60,
    price: 70,
    description: 'Indulgent foot care ritual with exfoliation and massage.',
    category: 'Nails',
    icon: '◉',
  },
  {
    id: 'svc6',
    name: 'Massage Therapy',
    duration: 90,
    price: 110,
    description: 'Restorative full-body massage using premium botanical oils.',
    category: 'Wellness',
    icon: '◌',
  },
];

const today = new Date();
const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r.toISOString().split('T')[0];
};

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    userId: 'u1',
    stylistId: 's1',
    serviceId: 'svc1',
    date: addDays(today, 3),
    time: '10:00',
    status: 'upcoming',
    notes: 'Beachy waves',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a2',
    userId: 'u1',
    stylistId: 's3',
    serviceId: 'svc3',
    date: addDays(today, 7),
    time: '14:00',
    status: 'upcoming',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a3',
    userId: 'u1',
    stylistId: 's2',
    serviceId: 'svc1',
    date: addDays(today, -14),
    time: '11:30',
    status: 'completed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a4',
    userId: 'u1',
    stylistId: 's4',
    serviceId: 'svc4',
    date: addDays(today, -7),
    time: '15:00',
    status: 'completed',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'a5',
    userId: 'u1',
    stylistId: 's5',
    serviceId: 'svc6',
    date: addDays(today, -3),
    time: '16:00',
    status: 'cancelled',
    createdAt: new Date().toISOString(),
  },
];

export const TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];

export const MOCK_PASSWORDS: Record<string, string> = {
  'demo@luxeglow.com': 'demo1234',
  'admin@luxeglow.com': 'admin1234',
};
