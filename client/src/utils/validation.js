// Form validation helper utilities

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }
  return '';
};

export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < 6) {
    return 'Password must be at least 6 characters long.';
  }
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return 'Please confirm your password.';
  }
  if (password !== confirmPassword) {
    return 'Passwords do not match.';
  }
  return '';
};

export const validatePhone = (phone) => {
  if (!phone || !phone.trim()) {
    return 'Phone number is required.';
  }
  const cleanPhone = phone.trim().replace(/[\s\-\(\)]/g, '');
  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return 'Phone number must be a valid 10-digit number.';
  }
  return '';
};

export const validateName = (name) => {
  if (!name || !name.trim()) {
    return 'Full name is required.';
  }
  if (name.trim().length < 2) {
    return 'Name must be at least 2 characters.';
  }
  const nameRegex = /^[a-zA-Z\s\.\']{2,}$/;
  if (!nameRegex.test(name.trim())) {
    return 'Name should contain only letters and spaces.';
  }
  return '';
};

export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required.`;
  }
  return '';
};

export const validateFee = (fee) => {
  if (fee === undefined || fee === null || fee === '') {
    return 'Consultation fee is required.';
  }
  if (isNaN(fee) || Number(fee) < 0) {
    return 'Please enter a valid positive consultation fee.';
  }
  return '';
};

export const validateExperience = (exp) => {
  if (exp === undefined || exp === null || exp === '') {
    return 'Years of experience is required.';
  }
  if (isNaN(exp) || Number(exp) < 0) {
    return 'Please enter a valid positive number for experience.';
  }
  return '';
};

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '#e2e8f0' };
  
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score: 1, label: 'Weak', color: '#ef4444' };
  if (score <= 4) return { score: 2, label: 'Medium', color: '#f59e0b' };
  return { score: 3, label: 'Strong', color: '#10b981' };
};
