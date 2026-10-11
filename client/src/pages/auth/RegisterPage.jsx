import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Footer from '../../components/Footer.jsx';
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
} from '../../utils/validation.js';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'patient',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateField = (field, value, currentFormData = formData) => {
    switch (field) {
      case 'name':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(currentFormData.password, value);
      default:
        return '';
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, formData[field]),
      ...(field === 'password' && touched.confirmPassword
        ? { confirmPassword: validateConfirmPassword(formData.password, formData.confirmPassword) }
        : {}),
    }));
  };

  const handleChange = (field, value) => {
    const updatedFormData = { ...formData, [field]: value };
    setFormData(updatedFormData);

    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, value, updatedFormData),
        ...(field === 'password' && touched.confirmPassword
          ? { confirmPassword: validateConfirmPassword(value, updatedFormData.confirmPassword) }
          : {}),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields touched
    const allTouched = {
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    };
    setTouched(allTouched);

    const nameErr = validateName(formData.name);
    const emailErr = validateEmail(formData.email);
    const phoneErr = validatePhone(formData.phone);
    const passErr = validatePassword(formData.password);
    const confirmErr = validateConfirmPassword(formData.password, formData.confirmPassword);

    const newErrors = {
      name: nameErr,
      email: emailErr,
      phone: phoneErr,
      password: passErr,
      confirmPassword: confirmErr,
    };
    setErrors(newErrors);

    if (nameErr || emailErr || phoneErr || passErr || confirmErr) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      });

      // Redirect to OTP verification page with OTP state if direct/fallback
      navigate(`/verify-otp?email=${encodeURIComponent(formData.email)}`, {
        state: { email: formData.email, debugOtp: result?.debugOtp, emailSent: result?.emailSent },
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const hasFormErrors =
    (touched.name && !!errors.name) ||
    (touched.email && !!errors.email) ||
    (touched.phone && !!errors.phone) ||
    (touched.password && !!errors.password) ||
    (touched.confirmPassword && !!errors.confirmPassword);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <div className="container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '520px', width: '100%' }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🩺</div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Join Appointy</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>Create an account to book your appointments</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} noValidate>
              {/* Role Selection */}
              <div className="form-group">
                <label className="form-label">Account Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className={`btn ${formData.role === 'patient' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFormData({ ...formData, role: 'patient' })}
                  >
                    👤 Patient
                  </button>
                  <button
                    type="button"
                    className={`btn ${formData.role === 'doctor' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setFormData({ ...formData, role: 'doctor' })}
                  >
                    👨‍⚕️ Doctor
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className={`form-input ${touched.name && errors.name ? 'is-invalid' : ''}`}
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                />
                {touched.name && errors.name && (
                  <span className="form-error-msg">⚠️ {errors.name}</span>
                )}
              </div>

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
                />
                {touched.email && errors.email && (
                  <span className="form-error-msg">⚠️ {errors.email}</span>
                )}
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className={`form-input ${touched.phone && errors.phone ? 'is-invalid' : ''}`}
                  placeholder="10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                />
                {touched.phone && errors.phone && (
                  <span className="form-error-msg">⚠️ {errors.phone}</span>
                )}
              </div>

              {/* Password & Confirm Password */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-password-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-input ${touched.password && errors.password ? 'is-invalid' : ''}`}
                      placeholder="Min 6 characters"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
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

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-password-wrapper">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`form-input ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Repeat password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
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
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading || hasFormErrors}
                style={{ marginTop: '1.5rem' }}
              >
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
              Already registered? <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Login here</Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterPage;
