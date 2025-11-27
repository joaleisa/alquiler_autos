import { apiService } from "./api.service";

export const vehicleService = {
  // Get all vehicles
  getAll: async () => {
    return await apiService.get(`/vehiculos/`);
  },

  // Get vehicle by ID
  getById: async (vehicleId) => {
    return await apiService.get(`/vehiculos/${vehicleId}`);
  },

  // Create new vehicle
  create: async (vehicleData) => {
    return await apiService.post("/vehiculos", vehicleData);
  },

  // Update vehicle
  update: async (vehicleId, vehicleData) => {
    return await apiService.put(`/vehiculos/${vehicleId}`, vehicleData);
  },

  // Delete vehicle
  delete: async (vehicleId) => {
    return await apiService.delete(`/vehiculos/${vehicleId}`);
  },
};
