import React from 'react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';

const AboutPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <section style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', padding: '4rem 0', color: '#fff', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '1rem' }}>About Appointy</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '650px', margin: '0 auto', fontSize: '1.1rem' }}>
            We bridge the gap between patients and specialized healthcare professionals with a seamless, smart online booking experience.
          </p>
        </div>
      </section>

      <div className="container" style={{ padding: '4rem 1.5rem', flex: 1 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', color: '#1e293b' }}>Our Mission</h2>
            <p style={{ lineHeight: '1.8', color: '#475569', fontSize: '1.05rem' }}>
              At Appointy, our mission is to make healthcare readily accessible to everyone. We eliminate long wait times, cumbersome phone calls, and scheduling headaches by providing an intuitive platform where patients can discover top-rated medical specialists and book visits instantly.
            </p>
          </div>

          <div className="grid grid-3" style={{ marginBottom: '2.5rem' }}>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🤝</div>
              <h4 style={{ marginBottom: '0.5rem' }}>Trust & Care</h4>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Every doctor is verified for their credentials and authentic reviews.</p>
            </div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚡</div>
              <h4 style={{ marginBottom: '0.5rem' }}>Instant Booking</h4>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Real-time schedule matching ensures your slots are booked immediately.</p>
            </div>
            <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔒</div>
              <h4 style={{ marginBottom: '0.5rem' }}>Data Privacy</h4>
              <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Your personal health records and appointments are completely private and secure.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;
