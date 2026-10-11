import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/public/Home.jsx';
import DoctorsPage from './pages/public/DoctorsPage.jsx';
import DoctorDetailPage from './pages/public/DoctorDetailPage.jsx';
import AboutPage from './pages/public/AboutPage.jsx';
import ContactPage from './pages/public/ContactPage.jsx';

import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import VerifyOTPPage from './pages/auth/VerifyOTPPage.jsx';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/auth/ResetPasswordPage.jsx';

import LoadingSpinner from './components/LoadingSpinner.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Code split heavy dashboard bundles for fast initial mobile page load
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard.jsx'));
const BookAppointmentPage = lazy(() => import('./pages/patient/BookAppointmentPage.jsx'));
const MyAppointmentsPage = lazy(() => import('./pages/patient/MyAppointmentsPage.jsx'));
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard.jsx'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullPage text="Loading Appointy..." />}>
      <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/doctors" element={<DoctorsPage />} />
      <Route path="/doctors/:id" element={<DoctorDetailPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-otp" element={<VerifyOTPPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

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
    </Suspense>
  );
};

export default App;
