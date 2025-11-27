import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

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
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        props.disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
      }`}
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
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        props.disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
      }`}
    >
      {children}
    </select>
  </div>
);

const FormTextarea = ({ label, id, ...props }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <textarea
      id={id}
      rows="3"
      {...props}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        props.disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
      }`}
    />
  </div>
);

export default function MaintenanceFormModal({
  isOpen,
  onClose,
  onSubmit,
  jobToEdit,
  vehiclesList = [],
}) {
  const { currentUser } = useAuth();

  // Helper para extraer YYYY-MM-DD de un ISO string (ej: "2025-11-25T19:15:44")
  const formatDateForInput = (isoString) => {
    if (!isoString) return "";
    return isoString.split("T")[0];
  };

  const getInitialState = () => {
    // Normalizar el estado para que coincida con los valores del <select> (Title Case)
    // Esto asegura que si el backend devuelve "finalizado", el select muestre "Finalizado"
    let statusNormalized = jobToEdit?.status || "Iniciado";
    if (statusNormalized.toLowerCase() === "finalizado")
      statusNormalized = "Finalizado";
    else if (statusNormalized.toLowerCase() === "iniciado")
      statusNormalized = "Iniciado";

    return {
      vehicleId: jobToEdit?.vehicleId || vehiclesList[0]?.id || "",
      startDate: jobToEdit?.startDate
        ? formatDateForInput(jobToEdit.startDate)
        : new Date().toISOString().split("T")[0],
      endDate: jobToEdit?.endDate ? formatDateForInput(jobToEdit.endDate) : "",
      type: jobToEdit?.type || "Preventivo",
      description: jobToEdit?.description || "",
      cost: jobToEdit?.cost || 0,
      status: statusNormalized,
    };
  };

  const [formData, setFormData] = useState(getInitialState());

  // Lógica para determinar si está finalizado (comparación flexible)
  const isFinished =
    jobToEdit?.status && jobToEdit.status.toLowerCase() === "finalizado";
  const isEditing = !!jobToEdit;

  const title = isEditing
    ? isFinished
      ? "Detalle de Mantenimiento (Finalizado)"
      : "Editar Mantenimiento"
    : "Registrar Mantenimiento";

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
    }
  }, [jobToEdit, isOpen]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFinished) {
      onClose();
      return;
    }

    const selectedVehicle = vehiclesList.find(
      (v) => v.id == formData.vehicleId
    );

    const dataToSubmit = {
      ...formData,
      vehicleName: selectedVehicle
        ? `${selectedVehicle.brand} ${selectedVehicle.model}`
        : "N/A",
      id_empleado: currentUser?.id,
      fecha_creacion: jobToEdit?.fecha_creacion || new Date().toISOString(),
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
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
            <FormSelect
              label="Vehículo"
              id="vehicleId"
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              required
              disabled={isEditing || isFinished}
            >
              <option value="" disabled>
                Seleccione un vehículo
              </option>
              {vehiclesList.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} (ID: {vehicle.id})
                </option>
              ))}
            </FormSelect>

            <FormSelect
              label="Tipo de Mantenimiento"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              disabled={isFinished}
            >
              <option value="Preventivo">Preventivo</option>
              <option value="Correctivo">Correctivo</option>
            </FormSelect>

            <FormSelect
              label="Estado"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isFinished}
            >
              <option value="Iniciado">Iniciado</option>
              <option value="Finalizado">Finalizado</option>
            </FormSelect>

            <FormInput
              label="Costo"
              id="cost"
              name="cost"
              type="number"
              step="0.01"
              value={formData.cost}
              onChange={handleChange}
              disabled={isFinished}
            />

            <FormInput
              label="Fecha de Inicio"
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
              disabled={true}
            />

            <FormInput
              label="Fecha de Fin (Opcional)"
              id="endDate"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              disabled={isFinished}
            />

            <div className="md:col-span-2">
              <FormTextarea
                label="Descripción"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Detalles del trabajo realizado..."
                disabled={isFinished}
              />
            </div>
          </div>

          <footer className="flex justify-end gap-3 p-5 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
            >
              {isFinished ? "Cerrar" : "Cancelar"}
            </button>
            {!isFinished && (
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700"
              >
                {isEditing ? "Guardar Cambios" : "Registrar"}
              </button>
            )}
          </footer>
        </form>
      </div>
    </div>
  );
}
