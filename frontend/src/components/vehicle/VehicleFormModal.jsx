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

export default function VehicleFormModal({
  isOpen,
  onClose,
  onSubmit,
  vehicleToEdit,
}) {
  const getInitialState = () => ({
    brand: vehicleToEdit?.brand || "",
    model: vehicleToEdit?.model || "",
    patente: vehicleToEdit?.patente || "",
    year: vehicleToEdit?.year || new Date().getFullYear(),
    pricePerDay: vehicleToEdit?.pricePerDay || "",
    thumbnail: vehicleToEdit?.thumbnail || "",
    seats: vehicleToEdit?.seats || 5,
    transmission: vehicleToEdit?.transmission || "Manual",
    fuel: vehicleToEdit?.fuel || "Nafta",
    kilometraje_actual: vehicleToEdit?.kilometraje_actual || 0,
    // El estado "disponible" se asigna automáticamente en el backend al crear,
    // o podemos enviarlo explícitamente si es necesario.
  });

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
    }
  }, [isOpen, vehicleToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convertir tipos de datos según el Schema
    const dataToSubmit = {
      ...formData,
      year: parseInt(formData.year, 10),
      pricePerDay: parseFloat(formData.pricePerDay),
      seats: parseInt(formData.seats, 10),
      kilometraje_actual: parseInt(formData.kilometraje_actual, 10),
      thumbnail: formData.thumbnail.trim() === "" ? null : formData.thumbnail,
    };

    onSubmit(dataToSubmit);
  };

  if (!isOpen) return null;

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
            {vehicleToEdit ? "Editar Vehículo" : "Registrar Nuevo Vehículo"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto">
            <FormInput
              label="Marca"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              placeholder="Ej: Toyota"
            />

            <FormInput
              label="Modelo"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              placeholder="Ej: Corolla"
            />

            <FormInput
              label="Patente"
              id="patente"
              name="patente"
              value={formData.patente}
              onChange={handleChange}
              required
              placeholder="Ej: AA123BB"
            />

            <FormInput
              label="Año"
              id="year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              required
            />

            <FormInput
              label="Precio por Día ($)"
              id="pricePerDay"
              name="pricePerDay"
              type="number"
              step="0.01"
              value={formData.pricePerDay}
              onChange={handleChange}
              required
            />

            <FormInput
              label="Kilometraje Actual"
              id="kilometraje_actual"
              name="kilometraje_actual"
              type="number"
              value={formData.kilometraje_actual}
              onChange={handleChange}
              required
            />

            <FormSelect
              label="Transmisión"
              id="transmission"
              name="transmission"
              value={formData.transmission}
              onChange={handleChange}
            >
              <option value="Manual">Manual</option>
              <option value="Automatica">Automática</option>
            </FormSelect>

            <FormSelect
              label="Combustible"
              id="fuel"
              name="fuel"
              value={formData.fuel}
              onChange={handleChange}
            >
              <option value="Nafta">Nafta</option>
              <option value="Diesel">Diesel</option>
              <option value="GNC">GNC</option>
              <option value="Hibrido">Híbrido</option>
              <option value="Electrico">Eléctrico</option>
            </FormSelect>

            <FormInput
              label="Cantidad de Asientos"
              id="seats"
              name="seats"
              type="number"
              value={formData.seats}
              onChange={handleChange}
              required
            />

            <div className="md:col-span-2">
              <FormInput
                label="URL de Imagen (Thumbnail)"
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
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
              {vehicleToEdit ? "Guardar Cambios" : "Crear Vehículo"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
