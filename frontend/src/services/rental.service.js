import { apiService } from "./api.service";

export const rentalService = {
  // Get all rentals (active leases)
  getAll: async (skip = 0, limit = 100) => {
    return await apiService.get(`/alquileres?skip=${skip}&limit=${limit}`);
  },

  // Get rental by ID
  getById: async (rentalId) => {
    return await apiService.get(`/alquileres/${rentalId}`);
  },

  // Create new rental
  create: async (rentalData) => {
    return await apiService.post("/alquileres", rentalData);
  },

  // Update rental
  update: async (rentalId, rentalData) => {
    return await apiService.put(`/alquileres/${rentalId}`, rentalData);
  },

  // Finish rental
  finish: async (rentalId, finishData) => {
    return await apiService.post(`/alquileres/${rentalId}/finalizar`, finishData);
  },

  // Cancel rental
  delete: async (rentalId) => {
    return await apiService.delete(`/alquileres/${rentalId}`);
  },
};