import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

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
      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
    >
      {children}
    </select>
  </div>
);
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
      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
    />
  </div>
);

export default function ReservationFormModal({
  isOpen,
  onClose,
  onSubmit,
  clientsList = [],
  vehiclesList = [],
}) {
  const { currentUser } = useAuth();

  // FILTRO: Solo vehículos con estado "disponible" (insensible a mayúsculas)
  const reservableVehicles = vehiclesList.filter(
    (v) => v.estado && v.estado.toLowerCase() === "disponible"
  );

  const getVehicleMileage = (vehicleId) => {
    if (vehicleId) {
      // Usamos == para comparar string (del select) con number (del objeto)
      const vehicle = vehiclesList.find((v) => v.id == vehicleId);
      return vehicle?.kilometraje_actual || 0;
    }
    const defaultVehicle = reservableVehicles[0];
    return defaultVehicle?.kilometraje_actual || 0;
  };

  const getInitialState = () => {
    const defaultVehicleId = reservableVehicles[0]?.id || "";
    return {
      clientId: clientsList[0]?.id || "",
      vehicleId: defaultVehicleId,
      startDate: "",
      endDate: "",
      status: "creado", // Estado inicial para reserva
      kilometraje_inicio: getVehicleMileage(defaultVehicleId),
    };
  };

  const [formData, setFormData] = useState(getInitialState());
  const [estimatedCost, setEstimatedCost] = useState(0);

  useEffect(() => {
    const { startDate, endDate, vehicleId } = formData;

    if (startDate && endDate && vehicleId) {
      // Usamos == para búsqueda segura
      const vehicle = vehiclesList.find((v) => v.id == vehicleId);
      const pricePerDay = vehicle?.pricePerDay || 0;

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        setEstimatedCost(0);
        return;
      }

      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setEstimatedCost(diffDays * pricePerDay);
    } else {
      setEstimatedCost(0);
    }
  }, [formData.startDate, formData.endDate, formData.vehicleId, vehiclesList]);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
      setEstimatedCost(0);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "vehicleId") {
      const newMileage = getVehicleMileage(value);
      setFormData((prev) => ({
        ...prev,
        vehicleId: value,
        kilometraje_inicio: newMileage,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Obtener ID de empleado de forma segura
    let safeEmployeeId = 0;
    if (currentUser) {
      if (currentUser.employeeId) {
        safeEmployeeId = parseInt(currentUser.employeeId, 10);
      } else if (currentUser.id) {
        safeEmployeeId = parseInt(currentUser.id, 10);
      }
    }
    if (isNaN(safeEmployeeId)) safeEmployeeId = 0;

    // 2. Validar Kilometraje Inicial
    let startKm = parseInt(formData.kilometraje_inicio, 10);
    if (isNaN(startKm)) {
      startKm = getVehicleMileage(formData.vehicleId);
    } else {
      startKm = Math.floor(startKm);
    }

    // 3. Construir payload BASE estricto según el Schema del backend
    // { clientId, vehicleId, employeeId, date_time_start, date_time_end, start_kilometers }
    const dataToSubmit = {
      clientId: parseInt(formData.clientId, 10),
      vehicleId: parseInt(formData.vehicleId, 10),
      employeeId: safeEmployeeId,
      date_time_start: new Date(formData.startDate).toISOString(),
      date_time_end: new Date(formData.endDate).toISOString(),
      start_kilometers: startKm,
      // NOTA: No enviamos 'status' ni fechas de creación/confirmación manuales
      // para evitar error 500. El backend asignará el estado inicial (generalmente 'creado').
    };

    if (safeEmployeeId === 0) {
      console.warn(
        "Advertencia: employeeId es 0. Esto podría causar un error 404 si el backend valida existencia."
      );
    }

    console.log("Registrando reserva (Schema Validado):", dataToSubmit);
    onSubmit(dataToSubmit);
    onClose();
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
            Registrar Nueva Reserva
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
            <FormSelect
              label="Cliente"
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
            >
              {clientsList.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} (ID: {client.id})
                </option>
              ))}
            </FormSelect>

            <FormSelect
              label="Vehículo"
              id="vehicleId"
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Seleccione un vehículo
              </option>
              {vehiclesList.map((vehicle) => {
                // Validación estricta del estado disponible
                const isAvailable =
                  vehicle.estado &&
                  vehicle.estado.toLowerCase() === "disponible";

                return (
                  <option
                    key={vehicle.id}
                    value={vehicle.id}
                    disabled={!isAvailable}
                  >
                    {vehicle.brand} {vehicle.model}
                    {!isAvailable
                      ? ` (${vehicle.estado})`
                      : ` ($${vehicle.pricePerDay}/día)`}
                  </option>
                );
              })}
            </FormSelect>

            <FormInput
              label="Fecha y Hora de Retiro"
              id="startDate"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleChange}
              required
            />
            <FormInput
              label="Fecha y Hora de Devolución"
              id="endDate"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleChange}
              required
            />

            <FormSelect
              label="Estado Inicial"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled // Deshabilitado porque siempre nace como 'creado'
            >
              <option value="creado">Creado</option>
            </FormSelect>

            <FormInput
              label="Kilometraje Inicial (Automático)"
              id="kilometraje_inicio"
              name="kilometraje_inicio"
              type="number"
              value={formData.kilometraje_inicio}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-gray-100 text-gray-600"
            />

            <div className="md:col-span-2">
              <FormInput
                label="Costo Estimado"
                id="costo_estimado"
                type="text"
                value={`$ ${estimatedCost.toLocaleString("es-AR")}`}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm bg-blue-50 text-blue-800 font-bold"
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
              Crear Reserva
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
