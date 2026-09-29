import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';

const features = [
  { icon: '🔍', title: 'Easy Doctor Search', desc: 'Find doctors by specialization, name, or location with powerful filters.' },
  { icon: '📅', title: 'Online Booking', desc: 'Book appointments 24/7 from the comfort of your home in just a few clicks.' },
  { icon: '💳', title: 'Secure Payments', desc: 'Pay online securely through Razorpay or choose cash on visit.' },
  { icon: '🔔', title: 'Flexible Scheduling', desc: 'Choose from available time slots and reschedule anytime if needed.' },
];

const steps = [
  { num: 1, icon: '🔍', title: 'Search Doctor', desc: 'Find the right specialist for your needs.' },
  { num: 2, icon: '📅', title: 'Choose Date & Time', desc: 'Pick from available slots that suit you.' },
  { num: 3, icon: '✅', title: 'Book Appointment', desc: 'Confirm your booking in seconds.' },
  { num: 4, icon: '👨‍⚕️', title: 'Meet Your Doctor', desc: 'Visit and get the care you deserve.' },
];

const specializations = [
  { icon: '🫀', name: 'Cardiologist' },
  { icon: '🧠', name: 'Neurologist' },
  { icon: '🦷', name: 'Dentist' },
  { icon: '👶', name: 'Pediatrician' },
  { icon: '🦴', name: 'Orthopedic' },
  { icon: '🔬', name: 'Dermatologist' },
  { icon: '👁️', name: 'Ophthalmologist' },
  { icon: '🩺', name: 'General Physician' },
];

const Home = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section className="hero" style={{ padding: '5.5rem 0', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)', color: '#fff', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '850px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '3.25rem', fontWeight: 800, lineHeight: 1.15, color: '#fff', marginBottom: '1.5rem', letterSpacing: '-0.02em' }}>
            Find the Right Doctor, Book Your Visit Instantly.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '680px', margin: '0 auto 2.5rem' }}>
            Appointy connects you with certified healthcare specialists, verified patient reviews, real-time schedule availability, and frictionless digital appointments.
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link to="/doctors" className="btn btn-lg" style={{ background: '#fff', color: '#1d4ed8', fontWeight: 700, padding: '1rem 2.25rem', fontSize: '1.1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.25)' }}>
              🔍 Find Doctors
            </Link>
            <Link to="/register" className="btn btn-lg btn-secondary" style={{ padding: '1rem 2.25rem', fontSize: '1.1rem', boxShadow: '0 10px 25px rgba(16,185,129,0.35)' }}>
              📅 Book Appointment
            </Link>
          </div>

          {/* Trust Indicators */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.15)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#22c55e', fontSize: '1.25rem' }}>✓</span>
              <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>100% Verified Doctors</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#22c55e', fontSize: '1.25rem' }}>✓</span>
              <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>Instant Confirmation</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: '#22c55e', fontSize: '1.25rem' }}>✓</span>
              <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)' }}>Zero Booking Fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: '#fff', padding: '2.5rem 0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', textAlign: 'center' }}>
            {[['500+', 'Expert Doctors'], ['10,000+', 'Happy Patients'], ['50+', 'Specializations'], ['99%', 'Satisfaction Rate']].map(([num, label]) => (
              <div key={label}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563eb' }}>{num}</div>
                <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">Why Choose Appointy?</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              We make healthcare accessible and convenient for everyone.
            </p>
          </div>
          <div className="grid grid-4">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" style={{ background: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>Book your appointment in 4 simple steps.</p>
          </div>
          <div className="grid grid-4">
            {steps.map((step) => (
              <div key={step.num} className="step-card">
                <div className="step-number">{step.num}</div>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{step.icon}</div>
                <h4 style={{ marginBottom: '0.5rem' }}>{step.title}</h4>
                <p style={{ fontSize: '0.9rem' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specializations */}
      <section className="section" style={{ background: '#f8fafc' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 className="section-title">Browse by Specialization</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>Find the right specialist for your health needs.</p>
          </div>
          <div className="grid grid-4" style={{ maxWidth: '1000px', margin: '0 auto' }}>
            {specializations.map((s) => (
              <Link key={s.name} to={`/doctors?specialization=${s.name}`}
                style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', textDecoration: 'none', transition: 'all 0.2s', display: 'block' }}
                onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(37,99,235,0.15)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{s.icon}</div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{s.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Patient Testimonials */}
      <section className="section" style={{ background: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 className="section-title">What Our Patients Say</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Real experiences from patients who found top doctors through Appointy.
            </p>
          </div>
          <div className="grid grid-3">
            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ color: '#f59e0b', fontSize: '1.25rem', marginBottom: '0.75rem' }}>★★★★★</div>
              <p style={{ fontStyle: 'italic', color: '#475569', marginBottom: '1.25rem' }}>
                "Booking an appointment with a specialist was completely hassle-free. Got my slot confirmed in under a minute without waiting in lines!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dbeafe', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>AM</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>Anand Menon</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Patient &bull; Ernakulam</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ color: '#f59e0b', fontSize: '1.25rem', marginBottom: '0.75rem' }}>★★★★★</div>
              <p style={{ fontStyle: 'italic', color: '#475569', marginBottom: '1.25rem' }}>
                "Appointy has made managing clinic schedules extremely organized. Patients receive clear confirmations and we have zero schedule conflicts."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>DS</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>Dr. Sarah Johnson</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>General Physician</div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ color: '#f59e0b', fontSize: '1.25rem', marginBottom: '0.75rem' }}>★★★★★</div>
              <p style={{ fontStyle: 'italic', color: '#475569', marginBottom: '1.25rem' }}>
                "Clean interface, transparent consultation fees, and very easy to reschedule appointments when needed. Highly recommended healthcare app!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>RK</div>
                <div>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>Reshma Krishnan</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Patient &bull; Kochi</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', padding: '5rem 0', textAlign: 'center', color: '#fff' }}>
        <div className="container">
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Ready to Book Your Appointment?</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '2rem', fontSize: '1.125rem' }}>
            Join thousands of patients who trust Appointy for their healthcare needs.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: '#2563eb', fontWeight: 700 }}>
              Get Started Free
            </Link>
            <Link to="/doctors" className="btn btn-lg btn-outline" style={{ borderColor: '#fff', color: '#fff' }}>
              Browse Doctors
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
