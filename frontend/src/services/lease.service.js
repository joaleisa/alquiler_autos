import apiService from "./api.service";

export const leaseService = {
  // Get all leases/rentals
  getAll: async () => {
    const response = await apiService.get("/alquileres/");
    // Verificamos si response.data es el array (estructura típica de Axios)
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    // Si response ya es el array (apiService ya lo procesó)
    if (Array.isArray(response)) {
      return response;
    }
    // Fallback para evitar errores como "map is not a function"
    return [];
  },

  // Get lease by ID
  getById: async (id) => {
    const response = await apiService.get(`/alquileres/${id}`);
    return response.data || response;
  },

  // Create new lease
  create: async (data) => {
    return await apiService.post("/alquileres/", data);
  },

  // Update lease
  update: async (id, data) => {
    return await apiService.put(`/alquileres/${id}`, data);
  },

  // Delete lease
  delete: async (id) => {
    return await apiService.delete(`/alquileres/${id}`);
  },

  // Start rental
  start: async (id, data) => {
    return await apiService.post(`/alquileres/${id}/iniciar`, data);
  },

  // Finish rental
  // CORRECCIÓN: Método PATCH y endpoint correcto
  finish: async (id, data) => {
    return await apiService.patch(`/alquileres/${id}/finalizar`, data);
  },
};
