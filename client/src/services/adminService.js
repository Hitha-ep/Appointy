import api from './api.js';

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getAllDoctors: () => api.get('/admin/doctors'),
  getAllPatients: (params) => api.get('/admin/patients', { params }),
  getAllAppointments: (params) => api.get('/admin/appointments', { params }),
  getAnalytics: () => api.get('/admin/analytics'),
  addDoctor: (data) => api.post('/admin/doctors', data),
  updateDoctor: (id, data) => api.put(`/admin/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/admin/doctors/${id}`),
};
