import api from '../config/axios';

export const labService = {
  getAll: () => api.get('/labs'),
  getById: (id) => api.get(`/labs/${id}`),
  create: (data) => api.post('/labs', data),
  update: (id, data) => api.put(`/labs/${id}`, data),
  delete: (id) => api.delete(`/labs/${id}`),
};