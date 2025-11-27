// API Configuration
export const API_BASE_URL = "http://localhost:8000";

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
  },
  USERS: `${API_BASE_URL}/usuarios`,
  EMPLOYEES: `${API_BASE_URL}/empleados`,
  CLIENTS: `${API_BASE_URL}/clientes`,
  VEHICLES: `${API_BASE_URL}/vehiculos`,
  MAINTENANCE: `${API_BASE_URL}/mantenimiento`,
  LEASES: `${API_BASE_URL}/alquileres`,
  INVOICES: `${API_BASE_URL}/facturas`,
  INCIDENTS: `${API_BASE_URL}/incidentes`,
  DASHBOARD: `${API_BASE_URL}/dashboard`,
};

export default API_BASE_URL;
