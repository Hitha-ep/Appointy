import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../../components/Footer.jsx';
import { authService } from '../../services/authService.js';
import { validateEmail } from '../../utils/validation.js';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [resetUrl, setResetUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBlur = () => {
    setTouched(true);
    setEmailError(validateEmail(email));
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (touched) {
      setEmailError(validateEmail(val));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);

    const err = validateEmail(email);
    setEmailError(err);
    if (err) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await authService.forgotPassword(email);
      const data = res.data;
      setStatus({
        type: 'success',
        message: data.message || 'Password reset link generated successfully.',
      });
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to process request. Please try again.',
      });
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
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔐</div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Forgot Password?</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Enter your registered email address to receive password reset instructions.
              </p>
            </div>

            {status.message && (
              <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {status.message}
              </div>
            )}

            {resetUrl ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
                  <p style={{ color: '#1e40af', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 500 }}>
                    Click below to reset your password:
                  </p>
                  <button
                    onClick={() => navigate(resetUrl)}
                    className="btn btn-primary btn-block"
                  >
                    🔑 Reset My Password Now
                  </button>
                </div>
                <Link to="/login" style={{ color: '#64748b', fontSize: '0.9rem', textDecoration: 'underline' }}>
                  Return to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className={`form-input ${touched && emailError ? 'is-invalid' : ''}`}
                    placeholder="name@example.com"
                    value={email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="off"
                  />
                  {touched && emailError && (
                    <span className="form-error-msg">⚠️ {emailError}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading || (touched && !!emailError)}
                  style={{ marginTop: '1.5rem' }}
                >
                  {loading ? 'Sending Request...' : 'Send Password Reset Link'}
                </button>
              </form>
            )}

            <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
              Remember your password?{' '}
              <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
