import { apiService } from "./api.service";

export const incidentService = {
  // Get all incidents
  getAll: async () => {
    return await apiService.get(`/incidentes/`);
  },

  // Get incident by ID
  getById: async (incidentId) => {
    return await apiService.get(`/incidentes/${incidentId}`);
  },

  // Create new incident
  create: async (incidentData) => {
    return await apiService.post("/incidentes/", incidentData);
  },

  // Update incident
  update: async (incidentId, incidentData) => {
    return await apiService.put(`/incidentes/${incidentId}`, incidentData);
  },

  // Delete incident
  delete: async (incidentId) => {
    return await apiService.delete(`/incidentes/${incidentId}`);
  },
};
