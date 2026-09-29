import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { appointmentService } from '../../services/appointmentService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate, getStatusBadgeClass } from '../../utils/formatDate.js';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await appointmentService.getMyAppointments();
        setAppointments(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalAppts = appointments.length;
  const upcomingAppts = appointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
  const completedAppts = appointments.filter(a => a.status === 'completed');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div className="container" style={{ padding: '3rem 1.5rem', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', color: '#1e293b' }}>Welcome, {user?.name}!</h1>
            <p style={{ color: '#64748b' }}>Here is a summary of your health appointments.</p>
          </div>
          <Link to="/doctors" className="btn btn-primary">
            Find & Book Doctor
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid" style={{ marginBottom: '3rem' }}>
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">📅</div>
            <div>
              <div className="stat-number">{totalAppts}</div>
              <div className="stat-label">Total Bookings</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-green">⏳</div>
            <div>
              <div className="stat-number">{upcomingAppts.length}</div>
              <div className="stat-label">Upcoming Visits</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">✅</div>
            <div>
              <div className="stat-number">{completedAppts.length}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-teal">👤</div>
            <div>
              <div className="stat-number">{user?.phone ? 'Verified' : 'Active'}</div>
              <div className="stat-label">Account Status</div>
            </div>
          </div>
        </div>

        {/* Recent appointments section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.35rem', color: '#1e293b' }}>Upcoming Appointments</h2>
            <Link to="/patient/appointments" style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.9rem' }}>
              View All &rarr;
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading..." />
          ) : upcomingAppts.length === 0 ? (
            <div className="card empty-state" style={{ padding: '2rem' }}>
              <p>You have no upcoming appointments scheduled.</p>
              <Link to="/doctors" className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>
                Book Now
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {upcomingAppts.slice(0, 3).map((appt) => (
                <div key={appt._id} className="card" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ color: '#1e293b' }}>{appt.doctor?.name} ({appt.doctor?.specialization})</h4>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                      📅 {formatDate(appt.appointmentDate)} at {appt.appointmentTime}
                    </p>
                  </div>
                  <span className={`badge ${getStatusBadgeClass(appt.status)}`}>{appt.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <Footer />
    </div>
  );
};

export default PatientDashboard;
