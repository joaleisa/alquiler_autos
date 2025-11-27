import { apiService } from "./api.service";

export const authService = {
  // Login
  login: async (username, password) => {
    return await apiService.post("/auth/login", { username, password });
  },

  // You can add more auth methods here in the future
  // logout: async () => { ... },
  // refreshToken: async () => { ... },
  // resetPassword: async (email) => { ... },
};
