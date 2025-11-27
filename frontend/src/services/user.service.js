import { apiService } from "./api.service";

export const userService = {
  // Get all users
  getAll: async (skip = 0, limit = 100) => {
    return await apiService.get(`/usuarios?skip=${skip}&limit=${limit}`);
  },

  // Get user by ID
  getById: async (userId) => {
    return await apiService.get(`/usuarios/${userId}`);
  },

  // Create new user
  create: async (userData) => {
    return await apiService.post("/usuarios", userData);
  },

  // Update user password
  updatePassword: async (userId, password) => {
    return await apiService.patch(`/usuarios/${userId}/password`, { password });
  },

  // Delete user (if endpoint exists)
  delete: async (userId) => {
    return await apiService.delete(`/usuarios/${userId}`);
  },
};
