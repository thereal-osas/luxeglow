import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public pages
import LandingPage from './pages/auth/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminLoginPage from './pages/auth/AdminLoginPage';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import AppointmentsPage from './pages/customer/AppointmentsPage';
import AppointmentDetailPage from './pages/customer/AppointmentDetailPage';
import EditAppointmentPage from './pages/customer/EditAppointmentPage';
import BookAppointmentPage from './pages/customer/BookAppointmentPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookingsPage from './pages/admin/AdminBookingsPage';
import AdminBookingDetailPage from './pages/admin/AdminBookingDetailPage';
import AdminCalendarPage from './pages/admin/AdminCalendarPage';
//import TestConnection from './TestConnection';

//Coming Soon page


function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Customer (protected) */}
          <Route path="/dashboard" element={
            <ProtectedRoute><CustomerDashboard /></ProtectedRoute>
          } />
          <Route path="/appointments" element={
            <ProtectedRoute><AppointmentsPage /></ProtectedRoute>
          } />
          <Route path="/appointments/:id" element={
            <ProtectedRoute><AppointmentDetailPage /></ProtectedRoute>
          } />
          <Route path="/appointments/:id/edit" element={
            <ProtectedRoute><EditAppointmentPage /></ProtectedRoute>
          } />
          <Route path="/book" element={
            <ProtectedRoute><BookAppointmentPage /></ProtectedRoute>
          } />

          {/* Admin (protected, admin-only) */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute requireAdmin><AdminBookingsPage /></ProtectedRoute>
          } />
          <Route path="/admin/bookings/:id" element={
            <ProtectedRoute requireAdmin><AdminBookingDetailPage /></ProtectedRoute>
          } />
          <Route path="/admin/calendar" element={
            <ProtectedRoute requireAdmin><AdminCalendarPage /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
