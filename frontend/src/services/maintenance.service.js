import { apiService } from "./api.service";

export const maintenanceService = {
  // Get all maintenance records
  getAll: async (skip = 0, limit = 100) => {
    return await apiService.get(`/mantenimiento?skip=${skip}&limit=${limit}`);
  },

  // Get maintenance by ID
  getById: async (maintenanceId) => {
    return await apiService.get(`/mantenimiento/${maintenanceId}`);
  },

  // Create new maintenance record
  create: async (maintenanceData) => {
    return await apiService.post("/mantenimiento", maintenanceData);
  },

  // Update maintenance record
  update: async (maintenanceId, maintenanceData) => {
    return await apiService.put(`/mantenimiento/${maintenanceId}`, maintenanceData);
  },

  // Finish maintenance record
  finish: async (maintenanceId) => {
    return await apiService.patch(`/mantenimiento/${maintenanceId}/finalizar`);
  },

  // Delete maintenance record
  delete: async (maintenanceId) => {
    return await apiService.delete(`/mantenimiento/${maintenanceId}`);
  },
};
