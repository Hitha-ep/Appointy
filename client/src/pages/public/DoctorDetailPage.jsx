import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { doctorService } from '../../services/doctorService.js';
import { useAuth } from '../../context/AuthContext.jsx';

const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await doctorService.getDoctorById(id);
        setDoctor(res.data.data);
      } catch (err) {
        setError('Doctor details not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  if (loading) return <LoadingSpinner fullPage text="Loading doctor profile..." />;

  if (error || !doctor) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', flex: 1 }}>
          <h2>Doctor Not Found</h2>
          <p style={{ margin: '1rem 0' }}>The doctor you are looking for does not exist or has been removed.</p>
          <Link to="/doctors" className="btn btn-primary">Back to Doctors</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const initials = doctor.name ? doctor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'DR';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div className="container" style={{ padding: '3rem 1.5rem', flex: 1 }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {doctor.profileImage && !imgError ? (
                <img
                  src={doctor.profileImage}
                  alt={doctor.name}
                  onError={() => setImgError(true)}
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid #2563eb',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
                  }}
                />
              ) : (
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700 }}>
                  {initials}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '2rem', color: '#1e293b' }}>{doctor.name}</h1>
                  <span className={`badge ${doctor.isAvailable ? 'badge-success' : 'badge-danger'}`}>
                    {doctor.isAvailable ? 'Available for Booking' : 'Currently Unavailable'}
                  </span>
                </div>
                <div style={{ fontSize: '1.1rem', color: '#2563eb', fontWeight: 600, marginTop: '0.25rem' }}>{doctor.specialization}</div>
                <p style={{ color: '#64748b', marginTop: '0.25rem' }}>🎓 {doctor.qualification || 'MBBS'} &bull; 💼 {doctor.experience} years experience</p>
                <div style={{ marginTop: '1rem', fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>
                  ₹{doctor.consultationFee} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 400 }}>/ Consultation</span>
                </div>
              </div>
              <div>
                <Link to={`/patient/book/${doctor._id}`} className="btn btn-primary btn-lg">
                  📅 Book Appointment
                </Link>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
            <div>
              <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>About Dr. {doctor.name.split(' ')[1] || doctor.name}</h3>
                <p style={{ color: '#475569', lineHeight: '1.8' }}>
                  {doctor.about || `${doctor.name} is a dedicated ${doctor.specialization} specializing in quality diagnosis and compassionate patient care with ${doctor.experience} years of clinical expertise.`}
                </p>
              </div>

              <div className="card" style={{ padding: '2rem' }}>
                <h3 style={{ marginBottom: '1rem' }}>Availability & Schedule</h3>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Working Days:</strong>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    {doctor.availableDays && doctor.availableDays.length > 0 ? (
                      doctor.availableDays.map(day => (
                        <span key={day} className="badge badge-info">{day}</span>
                      ))
                    ) : (
                      <span style={{ color: '#64748b' }}>Mon - Fri</span>
                    )}
                  </div>
                </div>
                <div>
                  <strong>Hours:</strong>
                  <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
                    {doctor.availableTimeSlots?.startTime || '09:00'} - {doctor.availableTimeSlots?.endTime || '17:00'}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <div className="card" style={{ padding: '1.5rem', background: '#f8fafc' }}>
                <h4 style={{ marginBottom: '1rem' }}>Clinic & Contact</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: '#475569' }}>
                  <div>📞 {doctor.phone || '+91 90000 00000'}</div>
                  <div>✉️ {doctor.email || 'doctor@appointy.com'}</div>
                  <div>📍 Appointy Medical Center, Kaloor, Ernakulam</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};

export default DoctorDetailPage;
