import api from './api.js';

export const doctorService = {
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  getDoctorSlots: (id, date) => api.get(`/doctors/${id}/slots`, { params: { date } }),
  getSpecializations: () => api.get('/doctors/specializations'),
  getDoctorProfile: () => api.get('/doctors/profile/me'),
  updateDoctor: (id, data) => api.put(`/doctors/${id}`, data),
  updateAvailability: (id, data) => api.put(`/doctors/${id}/availability`, data),
  createDoctor: (data) => api.post('/doctors', data),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),
};
