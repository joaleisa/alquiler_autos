import { X } from "lucide-react";
import { useState, useEffect } from "react";

const FormInput = ({ label, id, ...props }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <input
      id={id}
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const FormSelect = ({ label, id, children, ...props }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <select
      id={id}
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </select>
  </div>
);

export default function ClientFormModal({
  isOpen,
  onClose,
  onSubmit,
  clientToEdit,
}) {
  const getInitialState = () => ({
    name: clientToEdit?.name || "",
    dni: clientToEdit?.dni || "",
    email: clientToEdit?.email || "",
    phone: clientToEdit?.phone || "",
    // Normalizamos a minúscula por defecto para coincidir con el backend y los values del select
    status: clientToEdit?.status ? clientToEdit.status.toLowerCase() : "activo",
  });

  const [formData, setFormData] = useState(getInitialState());

  const isEditing = !!clientToEdit;
  const title = isEditing ? "Editar Cliente" : "Agregar Nuevo Cliente";

  useEffect(() => {
    setFormData(getInitialState());
  }, [clientToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-lg shadow-xl z-50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FormInput
                label="Nombre Completo"
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <FormInput
              label="DNI"
              id="dni"
              name="dni"
              type="text"
              value={formData.dni}
              onChange={handleChange}
              placeholder="Ej: 30.123.456"
              required
            />

            <FormInput
              label="Teléfono"
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />

            <div className="md:col-span-2">
              <FormInput
                label="Correo Electrónico"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="md:col-span-2">
              <FormSelect
                label="Estado"
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </FormSelect>
            </div>
          </div>

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
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700"
            >
              {isEditing ? "Guardar Cambios" : "Crear Cliente"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
