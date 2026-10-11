import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { authService } from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.jsx';

const VerifyOTPPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthUser } = useAuth() || {};

  // Get email from URL params or navigation state
  const queryParams = new URLSearchParams(location.search);
  const emailFromQuery = queryParams.get('email');
  const emailFromState = location.state?.email;
  const email = emailFromQuery || emailFromState || '';

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRefs = useRef([]);

  // 30-second countdown timer for Resend OTP
  useEffect(() => {
    let timer;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, canResend]);

  const handleDigitChange = (index, value) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value;
    setOtpDigits(newOtp);

    // Auto-focus next input field
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtpDigits(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');

    if (!email) {
      return setStatus({ type: 'error', message: 'Missing email address. Please return to login.' });
    }

    if (fullOtp.length < 6) {
      return setStatus({ type: 'error', message: 'Please enter all 6 digits of the OTP code.' });
    }

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await authService.verifyOtp({ email, otp: fullOtp });
      const data = res.data;

      setStatus({
        type: 'success',
        message: data.message || 'Email verified successfully!',
      });
      setIsSuccess(true);

      if (data.token && data.user) {
        localStorage.setItem('appointy_token', data.token);
        localStorage.setItem('appointy_user', JSON.stringify(data.user));
        localStorage.setItem('user', JSON.stringify(data.user));
        if (setAuthUser) setAuthUser(data.user);
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Invalid or expired OTP code.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || resendLoading || !email) return;

    setResendLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await authService.resendOtp({ email });
      setStatus({
        type: 'success',
        message: res.data.message || 'A new 6-digit OTP has been sent to your email.',
      });
      setCanResend(false);
      setCountdown(30);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to resend OTP code.',
      });
    } finally {
      setResendLoading(false);
    }
  };

  const handleContinue = () => {
    const userJson = localStorage.getItem('appointy_user') || localStorage.getItem('user');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.role === 'admin') navigate('/admin/dashboard');
        else if (user.role === 'doctor') navigate('/doctor/dashboard');
        else navigate('/patient/dashboard');
        return;
      } catch {
        // Ignore invalid cached user data and fall back to login.
      }
    }
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '440px', width: '100%' }}>
          <div className="card" style={{ padding: 'clamp(1.25rem, 5vw, 2.5rem)' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📩</div>
              <h2 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.75rem)', fontWeight: 700 }}>Email Verification</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.375rem' }}>
                We sent a 6-digit verification code to:
              </p>
              <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem', marginTop: '0.25rem', wordBreak: 'break-all' }}>
                {email || 'your email'}
              </div>
            </div>

            {status.message && (
              <div className={`alert ${status.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {status.message}
              </div>
            )}

            {isSuccess ? (
              <div style={{ textAlign: 'center', paddingTop: '1rem' }}>
                <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ color: '#166534', marginBottom: '0.5rem' }}>Verified Successfully!</h3>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                  Your email address has been verified. You now have full access to Appointy.
                </p>
                <button
                  onClick={handleContinue}
                  className="btn btn-primary btn-block btn-lg"
                >
                  Proceed to Dashboard ➔
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerify}>
                {/* 6-Digit OTP Box Grid */}
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label" style={{ textAlign: 'center', display: 'block', marginBottom: '1rem' }}>
                    Enter 6-Digit OTP Code
                  </label>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(6, 1fr)',
                      gap: 'clamp(4px, 1.5vw, 10px)',
                      width: '100%',
                      boxSizing: 'border-box',
                    }}
                    onPaste={handlePaste}
                  >
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        style={{
                          width: '100%',
                          aspectRatio: '1 / 1',
                          textAlign: 'center',
                          fontSize: 'clamp(1rem, 5vw, 1.5rem)',
                          fontWeight: '700',
                          borderRadius: '10px',
                          border: digit ? '2px solid #2563eb' : '1.5px solid #cbd5e1',
                          background: digit ? '#eff6ff' : '#ffffff',
                          color: '#1e293b',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          boxSizing: 'border-box',
                          padding: 0,
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#64748b', marginTop: '0.75rem' }}>
                    ⏱️ Code expires in 5 minutes
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-block btn-lg"
                  disabled={loading || otpDigits.join('').length < 6}
                >
                  {loading ? 'Verifying...' : 'Verify OTP Code'}
                </button>

                {/* Resend OTP Section */}
                <div style={{ textAlign: 'center', marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    Didn't receive the code?{' '}
                  </span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="btn btn-ghost"
                      disabled={resendLoading}
                      style={{ color: '#2563eb', fontWeight: 600, padding: '0 0.25rem' }}
                    >
                      {resendLoading ? 'Resending...' : 'Resend OTP'}
                    </button>
                  ) : (
                    <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>
                      Resend in {countdown}s
                    </span>
                  )}
                </div>
              </form>
            )}

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
              Entered wrong email? <Link to="/register" style={{ color: '#2563eb', fontWeight: 600 }}>Register again</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VerifyOTPPage;
