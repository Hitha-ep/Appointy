import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Footer from '../../components/Footer.jsx';
import { validateEmail, validatePassword } from '../../utils/validation.js';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState({ email: '', password: '' });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'email') {
      setErrors((prev) => ({ ...prev, email: validateEmail(formData.email) }));
    } else if (field === 'password') {
      setErrors((prev) => ({ ...prev, password: validatePassword(formData.password) }));
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      if (field === 'email') {
        setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
      } else if (field === 'password') {
        setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    const emailErr = validateEmail(formData.email);
    const passErr = validatePassword(formData.password);

    setErrors({ email: emailErr, password: passErr });

    if (emailErr || passErr) return;

    setError('');
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password);
      const role = data.user.role;
      if (from) {
        navigate(from, { replace: true });
      } else if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (err) {
      const errData = err.response?.data;
      if (errData && errData.isEmailVerified === false) {
        const unverifiedEmail = errData.email || formData.email;
        setError(
          <span>
            {errData.message || 'Your email address is not verified.'}{' '}
            <Link
              to={`/verify-otp?email=${encodeURIComponent(unverifiedEmail)}`}
              style={{ fontWeight: 700, color: '#dc2626', textDecoration: 'underline' }}
            >
              Verify OTP Now
            </Link>
          </span>
        );
      } else {
        setError(errData?.message || err.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '440px', width: '100%' }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏥</div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Welcome Back</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Login to your Appointy account</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate autoComplete="off">
              {/* Email Address */}
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className={`form-input ${touched.email && errors.email ? 'is-invalid' : ''}`}
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  autoComplete="off"
                />
                {touched.email && errors.email && (
                  <span className="form-error-msg">⚠️ {errors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="input-password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className={`form-input ${touched.password && errors.password ? 'is-invalid' : ''}`}
                    placeholder="Enter password"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    onBlur={() => handleBlur('password')}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
                {touched.password && errors.password && (
                  <span className="form-error-msg">⚠️ {errors.password}</span>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading || (touched.email && !!errors.email) || (touched.password && !!errors.password)}
                style={{ marginTop: '1.5rem' }}
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
              Don't have an account? <Link to="/register" style={{ color: '#2563eb', fontWeight: 600 }}>Create an account</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;
