import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Footer from '../../components/Footer.jsx';
import { authService } from '../../services/authService.js';
import {
  validatePassword,
  validateConfirmPassword,
} from '../../utils/validation.js';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [touched, setTouched] = useState({ password: false, confirmPassword: false });
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'password') {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(password),
        confirmPassword: touched.confirmPassword
          ? validateConfirmPassword(password, confirmPassword)
          : prev.confirmPassword,
      }));
    } else if (field === 'confirmPassword') {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(password, confirmPassword),
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (touched.password) {
      setErrors((prev) => ({
        ...prev,
        password: validatePassword(val),
        confirmPassword: touched.confirmPassword
          ? validateConfirmPassword(val, confirmPassword)
          : prev.confirmPassword,
      }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const val = e.target.value;
    setConfirmPassword(val);
    if (touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(password, val),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ password: true, confirmPassword: true });

    const passErr = validatePassword(password);
    const confirmErr = validateConfirmPassword(password, confirmPassword);

    setErrors({ password: passErr, confirmPassword: confirmErr });

    if (passErr || confirmErr) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await authService.resetPassword(token, password);
      setStatus({
        type: 'success',
        message: res.data.message || 'Password reset successfully!',
      });
      setIsSuccess(true);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Password reset failed or token is invalid/expired.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '460px', width: '100%' }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔑</div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Reset Password</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Enter your new secure password below
              </p>
            </div>

            {status.message && (
              <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {status.message}
              </div>
            )}

            {isSuccess ? (
              <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
                <button
                  onClick={() => navigate('/login')}
                  className="btn btn-primary btn-block"
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                {/* New Password */}
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div className="input-password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-input ${touched.password && errors.password ? 'is-invalid' : ''}`}
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={() => handleBlur('password')}
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

                {/* Confirm New Password */}
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <div className="input-password-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`form-input ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      onBlur={() => handleBlur('confirmPassword')}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <span className="form-error-msg">⚠️ {errors.confirmPassword}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={loading || (touched.password && !!errors.password) || (touched.confirmPassword && !!errors.confirmPassword)}
                  style={{ marginTop: '1.5rem' }}
                >
                  {loading ? 'Resetting Password...' : 'Save New Password'}
                </button>
              </form>
            )}

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
              Back to <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Login</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ResetPasswordPage;
