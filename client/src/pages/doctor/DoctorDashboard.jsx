import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { appointmentService } from '../../services/appointmentService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate, getStatusBadgeClass } from '../../utils/formatDate.js';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctorAppointments = async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getDoctorAppointments();
      setAppointments(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorAppointments();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(id, { status: newStatus });
      fetchDoctorAppointments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div className="container" style={{ padding: '3rem 1.5rem', flex: 1 }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', color: '#1e293b' }}>Doctor Portal</h1>
          <p style={{ color: '#64748b' }}>Welcome, {user?.name}. Manage your patient appointments below.</p>
        </div>

        <div className="stats-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">📋</div>
            <div>
              <div className="stat-number">{appointments.length}</div>
              <div className="stat-label">Total Appointments</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green">⏳</div>
            <div>
              <div className="stat-number">{appointments.filter(a => a.status === 'confirmed').length}</div>
              <div className="stat-label">Confirmed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-yellow">⌛</div>
            <div>
              <div className="stat-number">{appointments.filter(a => a.status === 'pending').length}</div>
              <div className="stat-label">Pending Review</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">🩺</div>
            <div>
              <div className="stat-number">{appointments.filter(a => a.status === 'completed').length}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Scheduled Appointments</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {loading ? (
              <LoadingSpinner text="Fetching schedule..." />
            ) : appointments.length === 0 ? (
              <div className="empty-state">
                <p>No appointments scheduled yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt) => (
                      <tr key={appt._id}>
                        <td>
                          <strong>{appt.patient?.name || 'Patient'}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{appt.patient?.phone}</div>
                        </td>
                        <td>{formatDate(appt.appointmentDate)}</td>
                        <td>{appt.appointmentTime}</td>
                        <td>{appt.reason || 'General Checkup'}</td>
                        <td>
                          <span className={`badge ${getStatusBadgeClass(appt.status)}`}>{appt.status}</span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {appt.status === 'pending' && (
                              <button onClick={() => handleStatusUpdate(appt._id, 'confirmed')} className="btn btn-primary btn-sm">Confirm</button>
                            )}
                            {appt.status === 'confirmed' && (
                              <button onClick={() => handleStatusUpdate(appt._id, 'completed')} className="btn btn-secondary btn-sm">Complete</button>
                            )}
                            {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                              <button onClick={() => handleStatusUpdate(appt._id, 'cancelled')} className="btn btn-outline-danger btn-sm">Cancel</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default DoctorDashboard;
