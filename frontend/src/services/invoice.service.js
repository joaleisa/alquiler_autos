import { apiService } from "./api.service";

export const invoiceService = {
  // Get all invoices with optional filters
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.paymentMethod)
      params.append("paymentMethod", filters.paymentMethod);
    if (filters.clientName) params.append("clientName", filters.clientName);

    const queryString = params.toString();
    return await apiService.get(
      `/facturas/${queryString ? `?${queryString}` : ""}`
    );
  },

  // Get invoice by ID
  getById: async (invoiceId) => {
    return await apiService.get(`/facturas/${invoiceId}`);
  },

  // Create new invoice
  create: async (invoiceData) => {
    return await apiService.post("/facturas/", invoiceData);
  },

  // Update invoice
  update: async (invoiceId, invoiceData) => {
    return await apiService.put(`/facturas/${invoiceId}`, invoiceData);
  },

  // Mark invoice as paid (change status to "pagada")
  markAsPaid: async (invoiceId) => {
    return await apiService.patch(`/facturas/${invoiceId}/pagar`);
  },

  // Cancel invoice (change status to "anulada")
  delete: async (invoiceId) => {
    return await apiService.patch(`/facturas/${invoiceId}/anular`);
  },
};
