import { apiService } from "./api.service";

export const employeeService = {
  // Get all employees
  getAll: async (skip = 0, limit = 100) => {
    return await apiService.get(`/empleados?skip=${skip}&limit=${limit}`);
  },

  // Get employee by ID
  getById: async (employeeId) => {
    return await apiService.get(`/empleados/${employeeId}`);
  },

  // Create new employee
  create: async (employeeData) => {
    return await apiService.post("/empleados", employeeData);
  },

  // Update employee
  update: async (employeeId, employeeData) => {
    return await apiService.put(`/empleados/${employeeId}`, employeeData);
  },

  // Delete employee
  delete: async (employeeId) => {
    return await apiService.delete(`/empleados/${employeeId}`);
  },
};
