import api from './api.js';

export const appointmentService = {
  bookAppointment: (data) => api.post('/appointments', data),
  getMyAppointments: () => api.get('/appointments/my'),
  getDoctorAppointments: () => api.get('/appointments/doctor'),
  getAllAppointments: (params) => api.get('/appointments', { params }),
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  cancelAppointment: (id) => api.put(`/appointments/${id}/cancel`),
  rescheduleAppointment: (id, data) => api.put(`/appointments/${id}/reschedule`, data),
  updateAppointmentStatus: (id, data) => api.put(`/appointments/${id}/status`, data),
};
