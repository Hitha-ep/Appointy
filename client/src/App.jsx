import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/public/Home.jsx';
import DoctorsPage from './pages/public/DoctorsPage.jsx';
import DoctorDetailPage from './pages/public/DoctorDetailPage.jsx';
import AboutPage from './pages/public/AboutPage.jsx';
import ContactPage from './pages/public/ContactPage.jsx';

import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';

import BookAppointmentPage from './pages/patient/BookAppointmentPage.jsx';
import MyAppointmentsPage from './pages/patient/MyAppointmentsPage.jsx';
import PatientDashboard from './pages/patient/PatientDashboard.jsx';

import DoctorDashboard from './pages/doctor/DoctorDashboard.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';

import ProtectedRoute from './components/ProtectedRoute.jsx';

const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/doctors" element={<DoctorsPage />} />
      <Route path="/doctors/:id" element={<DoctorDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Patient Routes */}
      <Route
        path="/patient/dashboard"
        element={
          <ProtectedRoute roles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/appointments"
        element={
          <ProtectedRoute roles={['patient']}>
            <MyAppointmentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/patient/book/:doctorId"
        element={
          <ProtectedRoute roles={['patient']}>
            <BookAppointmentPage />
          </ProtectedRoute>
        }
      />

      {/* Doctor Routes */}
      <Route
        path="/doctor/dashboard"
        element={
          <ProtectedRoute roles={['doctor']}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
