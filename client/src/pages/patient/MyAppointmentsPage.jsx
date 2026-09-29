import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import PaymentModal from '../../components/PaymentModal.jsx';
import { appointmentService } from '../../services/appointmentService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate, getStatusBadgeClass } from '../../utils/formatDate.js';

const MyAppointmentsPage = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAppointmentForPay, setSelectedAppointmentForPay] = useState(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getMyAppointments();
      setAppointments(res.data.data || []);
    } catch (err) {
      setError('Failed to fetch your appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setActionLoading(true);
    try {
      await appointmentService.cancelAppointment(id);
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <PaymentModal
        isOpen={!!selectedAppointmentForPay}
        onClose={() => setSelectedAppointmentForPay(null)}
        appointment={selectedAppointmentForPay}
        onSuccess={() => {
          setSelectedAppointmentForPay(null);
          fetchAppointments();
        }}
      />

      <div className="container" style={{ padding: '3rem 1.5rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#1e293b' }}>My Appointments</h1>
            <p style={{ color: '#64748b' }}>Track and manage all your scheduled doctor visits</p>
          </div>
          <Link to="/doctors" className="btn btn-primary">
            + Book New Appointment
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading appointments..." />
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state-icon">📅</div>
            <h3>No Appointments Yet</h3>
            <p>You haven't scheduled any doctor appointments yet.</p>
            <Link to="/doctors" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Find Doctors
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {appointments.map((appt) => (
              <div key={appt._id} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 style={{ fontSize: '1.2rem', color: '#1e293b' }}>
                        {appt.doctor?.name || 'Doctor'}
                      </h3>
                      <span className={`badge ${getStatusBadgeClass(appt.status)}`}>
                        {appt.status}
                      </span>
                      <span className={`badge ${appt.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                        {appt.paymentStatus === 'paid' ? '💳 Paid Online' : '💵 Payment Pending'}
                      </span>
                    </div>
                    <div style={{ color: '#2563eb', fontSize: '0.9rem', fontWeight: 500, marginTop: '0.25rem' }}>
                      {appt.doctor?.specialization}
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap', fontSize: '0.9rem', color: '#475569' }}>
                      <div>📅 <strong>Date:</strong> {formatDate(appt.appointmentDate)}</div>
                      <div>⏰ <strong>Time:</strong> {appt.appointmentTime}</div>
                      <div>💰 <strong>Fee:</strong> ₹{appt.doctor?.consultationFee || 500}</div>
                    </div>

                    {appt.reason && (
                      <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.75rem', background: '#f8fafc', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                        <strong>Reason:</strong> {appt.reason}
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {appt.paymentStatus !== 'paid' && appt.status !== 'cancelled' && (
                      <button
                        onClick={() => setSelectedAppointmentForPay(appt)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontWeight: 600 }}
                      >
                        💳 Pay ₹{appt.doctor?.consultationFee || 500} (Demo)
                      </button>
                    )}
                    {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                      <button
                        onClick={() => handleCancel(appt._id)}
                        disabled={actionLoading}
                        className="btn btn-outline-danger btn-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default MyAppointmentsPage;
