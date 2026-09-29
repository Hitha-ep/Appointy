import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div className="container">
        <div style={styles.grid}>
          {/* Brand */}
          <div>
            <div style={styles.logo}>🏥 <span style={{ color: '#2563eb', fontWeight: 800 }}>Appointy</span></div>
            <p style={styles.tagline}>Your health, our priority. Book appointments with top doctors easily and securely.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={styles.colTitle}>Quick Links</h4>
            <ul style={styles.linkList}>
              <li><Link to="/" style={styles.link}>Home</Link></li>
              <li><Link to="/doctors" style={styles.link}>Find Doctors</Link></li>
              <li><Link to="/about" style={styles.link}>About Us</Link></li>
              <li><Link to="/contact" style={styles.link}>Contact</Link></li>
            </ul>
          </div>

          {/* For Users */}
          <div>
            <h4 style={styles.colTitle}>For Patients</h4>
            <ul style={styles.linkList}>
              <li><Link to="/register" style={styles.link}>Register</Link></li>
              <li><Link to="/login" style={styles.link}>Login</Link></li>
              <li><Link to="/patient/appointments" style={styles.link}>My Appointments</Link></li>
              <li><Link to="/patient/dashboard" style={styles.link}>Dashboard</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={styles.colTitle}>Contact Info</h4>
            <ul style={styles.contactList}>
              <li>📍 Kaloor, Ernakulam, Kerala</li>
              <li>📞 +91 9000000000</li>
              <li>✉️ support@appointy.com</li>
              <li>🕐 Mon-Sat: 9AM - 6PM</li>
            </ul>
          </div>
        </div>

        <div style={styles.bottom}>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            © {new Date().getFullYear()} Appointy. All rights reserved.
          </p>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Built with ❤️ using MERN Stack
          </p>
        </div>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    background: '#0f172a',
    color: '#cbd5e1',
    paddingTop: '3rem',
    paddingBottom: '1.5rem',
    marginTop: 'auto',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2.5rem',
    paddingBottom: '2.5rem',
    borderBottom: '1px solid #1e293b',
  },
  logo: {
    fontSize: '1.375rem',
    fontWeight: 700,
    marginBottom: '0.875rem',
    color: '#f1f5f9',
  },
  tagline: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    lineHeight: 1.6,
  },
  colTitle: {
    color: '#f1f5f9',
    fontWeight: 600,
    marginBottom: '1rem',
    fontSize: '1rem',
  },
  linkList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  link: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  contactList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.625rem',
    color: '#94a3b8',
    fontSize: '0.875rem',
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1.5rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
};

export default Footer;
