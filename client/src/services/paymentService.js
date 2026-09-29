import api from './api.js';

export const paymentService = {
  createOrder: (appointmentId) => api.post('/payments/create-order', { appointmentId }),
  verifyPayment: (data) => api.post('/payments/verify', data),
  demoPay: (appointmentId) => api.post('/payments/demo-pay', { appointmentId }),
};
