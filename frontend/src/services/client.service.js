import apiService from "./api.service";

export const clientService = {
  // Get all clients
  getAll: async () => {
    const response = await apiService.get("/clientes/");
    // Validación robusta para asegurar que siempre devolvemos un array
    if (response?.data && Array.isArray(response.data)) {
      return response.data;
    }
    if (Array.isArray(response)) {
      return response;
    }
    // Si no es array, devolvemos vacío para evitar que la UI (clients.filter) explote
    return [];
  },

  // Get client by ID
  getById: async (clientId) => {
    return await apiService.get(`/clientes/${clientId}`);
  },

  // Create new client
  create: async (clientData) => {
    return await apiService.post("/clientes", clientData);
  },

  // Update client (General info)
  update: async (clientId, clientData) => {
    return await apiService.put(`/clientes/${clientId}`, clientData);
  },

  // Update client status (PATCH)
  updateStatus: async (clientId, status) => {
    return await apiService.patch(`/clientes/${clientId}/estado`, { status });
  },

  // Delete client
  delete: async (clientId) => {
    return await apiService.delete(`/clientes/${clientId}`);
  },
};
