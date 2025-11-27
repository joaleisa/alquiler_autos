import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function InvoiceFormModal({
  isOpen,
  onClose,
  onSubmit,
  invoiceToEdit,
  rentalsList,
}) {
  const [formData, setFormData] = useState({
    rentalId: "",
    paymentMethod: "",
    issueDate: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (invoiceToEdit) {
      setFormData({
        rentalId: invoiceToEdit.rentalId || "",
        paymentMethod: invoiceToEdit.paymentMethod || "",
        issueDate: invoiceToEdit.issueDate
          ? invoiceToEdit.issueDate.split("T")[0]
          : "",
      });
    } else {
      setFormData({
        rentalId: "",
        paymentMethod: "",
        issueDate: new Date().toISOString().split("T")[0],
      });
    }
    setErrors({});
  }, [invoiceToEdit, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rentalId) {
      newErrors.rentalId = "Debe seleccionar un alquiler";
    }

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Debe seleccionar un método de pago";
    }

    if (!formData.issueDate) {
      newErrors.issueDate = "La fecha de emisión es obligatoria";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;

  const paymentMethods = [
    "Efectivo",
    "Tarjeta de Crédito",
    "Tarjeta de Débito",
    "Transferencia",
    "Cheque",
  ];

  const availableRentals = rentalsList.filter((rental) => {
  if (invoiceToEdit && rental.id === invoiceToEdit.rentalId) {
    return true;
  }
    return true;
  });

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-lg shadow-xl z-50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {invoiceToEdit ? "Editar Factura" : "Crear Nueva Factura"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="rentalId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Alquiler *
            </label>
            <select
              id="rentalId"
              name="rentalId"
              value={formData.rentalId}
              onChange={handleChange}
              disabled={invoiceToEdit}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.rentalId ? "border-red-500" : "border-gray-300"
              } ${invoiceToEdit ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              <option value="">Seleccione un alquiler</option>
              {availableRentals.map((rental) => (
                <option key={rental.id} value={rental.id}>
                  {rental.id} - {rental.clientName} ({rental.vehicleName})
                </option>
              ))}
            </select>
            {errors.rentalId && (
              <p className="text-red-500 text-xs mt-1">{errors.rentalId}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="paymentMethod"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Método de Pago *
            </label>
            <select
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.paymentMethod ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Seleccione un método</option>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            {errors.paymentMethod && (
              <p className="text-red-500 text-xs mt-1">
                {errors.paymentMethod}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="issueDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Fecha de Emisión *
            </label>
            <input
              type="date"
              id="issueDate"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.issueDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.issueDate && (
              <p className="text-red-500 text-xs mt-1">{errors.issueDate}</p>
            )}
          </div>

          {invoiceToEdit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Nota:</strong> No se puede cambiar el alquiler asociado
                a una factura existente.
              </p>
            </div>
          )}
        </form>

        <footer className="flex justify-end gap-3 p-5 bg-gray-50 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700"
          >
            {invoiceToEdit ? "Actualizar" : "Crear"} Factura
          </button>
        </footer>
      </div>
    </div>
  );
}