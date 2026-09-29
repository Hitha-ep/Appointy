import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'doctor') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>🏥</span>
          <span style={styles.logoText}>Appointy</span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-desktop-links" style={styles.desktopLinks}>
          <Link to="/" style={styles.link}>Home</Link>
          <Link to="/doctors" style={styles.link}>Doctors</Link>
          <Link to="/about" style={styles.link}>About</Link>
          <Link to="/contact" style={styles.link}>Contact</Link>
        </div>

        {/* Auth Buttons */}
        <div className="nav-auth-buttons" style={styles.authButtons}>
          {user ? (
            <>
              <Link to={getDashboardLink()} className="btn btn-outline btn-sm">
                Dashboard
              </Link>
              <span style={styles.userName}>Hi, {user.name.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          style={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Home</Link>
          <Link to="/doctors" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Doctors</Link>
          <Link to="/about" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>About</Link>
          <Link to="/contact" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Contact</Link>
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '0.5rem' }}>
            {user ? (
              <>
                <Link to={getDashboardLink()} style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
                <button onClick={handleLogout} style={{ ...styles.mobileLink, background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', width: '100%', textAlign: 'left' }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  inner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '70px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textDecoration: 'none',
  },
  logoIcon: { fontSize: '1.5rem' },
  logoText: {
    fontSize: '1.375rem',
    fontWeight: 800,
    color: '#2563eb',
    letterSpacing: '-0.5px',
  },
  desktopLinks: {
    display: 'flex',
    gap: '0.25rem',
    '@media (max-width: 768px)': { display: 'none' },
  },
  link: {
    padding: '0.5rem 0.875rem',
    color: '#475569',
    fontWeight: 500,
    fontSize: '0.9375rem',
    borderRadius: '6px',
    transition: 'all 0.2s',
    textDecoration: 'none',
  },
  authButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  userName: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: 500,
  },
  hamburger: {
    display: 'none',
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#475569',
  },
  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    padding: '1rem',
    borderTop: '1px solid #e2e8f0',
    background: '#fff',
  },
  mobileLink: {
    padding: '0.75rem 0.5rem',
    color: '#475569',
    fontWeight: 500,
    fontSize: '1rem',
    textDecoration: 'none',
    borderRadius: '6px',
    display: 'block',
  },
};

// Add responsive CSS via style tag
const NavbarCSS = () => (
  <style>{`
    @media (max-width: 768px) {
      .nav-desktop-links { display: none !important; }
      .nav-hamburger { display: block !important; }
      .nav-auth-buttons { display: none !important; }
    }
    nav .nav-desktop-links { display: flex; }
    nav .nav-hamburger { display: none; }
    nav .nav-auth-buttons { display: flex; }
    @media (max-width: 768px) {
      nav .nav-desktop-links { display: none; }
      nav .nav-hamburger { display: block; }
      nav .nav-auth-buttons { display: none; }
    }
  `}</style>
);

export default Navbar;
