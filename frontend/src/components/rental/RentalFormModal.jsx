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

export default function RentalFormModal({
  isOpen,
  onClose,
  onSubmit,
  clientsList = [],
  vehiclesList = [],
  rentalToEdit = null, // Prop nueva para recibir datos si es edición
}) {
  const { currentUser } = useAuth();

  // Función auxiliar para formatear fecha para input datetime-local (YYYY-MM-DDTHH:mm)
  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().slice(0, 16);
  };

  const availableVehicles = vehiclesList.filter(
    (v) =>
      v.estado === "disponible" ||
      (rentalToEdit && v.id === rentalToEdit.vehicleId)
  );

  const getVehicleMileage = (vehicleId) => {
    if (vehicleId) {
      // Usamos == para comparar string (del select) con number (del objeto)
      const vehicle = vehiclesList.find((v) => v.id == vehicleId);
      return vehicle?.kilometraje_actual || 0;
    }
    const defaultVehicle = availableVehicles[0];
    return defaultVehicle?.kilometraje_actual || 0;
  };

  const getInitialState = () => {
    // Si estamos EDITANDO, cargamos los datos existentes
    if (rentalToEdit) {
      return {
        clientId: rentalToEdit.clientId || rentalToEdit.client?.id || "",
        vehicleId: rentalToEdit.vehicleId || rentalToEdit.vehicle?.id || "",
        startDate: formatDateTimeLocal(rentalToEdit.startDate),
        endDate: formatDateTimeLocal(rentalToEdit.endDate),
        status: rentalToEdit.status
          ? rentalToEdit.status.toLowerCase()
          : "confirmado",
        kilometraje_inicio: rentalToEdit.kilometraje_inicio,
        kilometraje_fin: "",
      };
    }

    // Si es NUEVO (Creación)
    const defaultVehicleId = availableVehicles[0]?.id || "";
    return {
      clientId: clientsList[0]?.id || "",
      vehicleId: defaultVehicleId,
      startDate: new Date().toISOString().slice(0, 16),
      endDate: "",
      status: "confirmado",
      kilometraje_inicio: getVehicleMileage(defaultVehicleId),
      kilometraje_fin: "",
    };
  };

  const [formData, setFormData] = useState(getInitialState());
  const [estimatedCost, setEstimatedCost] = useState(0);

  // Recalcular costo estimado
  useEffect(() => {
    const { startDate, endDate, vehicleId } = formData;

    if (startDate && endDate && vehicleId) {
      const vehicle = vehiclesList.find((v) => v.id == vehicleId);
      const pricePerDay = vehicle?.pricePerDay || vehicle?.daily_rate || 0;

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

  // Resetear formulario al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState());
      if (!rentalToEdit) setEstimatedCost(0);
    }
  }, [isOpen, rentalToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si cambian el vehículo, actualizar kilometraje inicial
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
      startKm = Math.floor(startKm); // Asegurar entero
    }

    // 3. Construir payload BASE estricto según el Schema
    const dataToSubmit = {
      clientId: parseInt(formData.clientId, 10),
      vehicleId: parseInt(formData.vehicleId, 10),
      employeeId: safeEmployeeId,
      date_time_start: new Date(formData.startDate).toISOString(),
      date_time_end: new Date(formData.endDate).toISOString(),
      start_kilometers: startKm,
    };

    // 4. Solo agregamos campos extra si estamos en modo EDICIÓN
    if (rentalToEdit) {
      dataToSubmit.status = formData.status;

      if (formData.status === "confirmado") {
        dataToSubmit.fecha_confirmacion =
          rentalToEdit?.fecha_confirmacion || new Date().toISOString();
      } else if (formData.status === "cancelado") {
        dataToSubmit.fecha_cancelacion = new Date().toISOString();
      } else if (formData.status === "finalizado") {
        dataToSubmit.fecha_finalizacion = new Date().toISOString();
      }
    }

    if (safeEmployeeId === 0) {
      console.warn(
        "Advertencia: employeeId es 0. Esto podría causar un error 404 si el backend valida existencia."
      );
    }

    console.log(
      "Enviando formulario alquiler (Schema Validado):",
      dataToSubmit
    );
    onSubmit(dataToSubmit);
    onClose();
  };

  if (!isOpen) return null;

  const isEditing = !!rentalToEdit;

  // Filtro de clientes: Solo mostrar activos o el seleccionado si estamos editando
  const activeClients = clientsList.filter(
    (client) =>
      (client.status && client.status.toLowerCase() === "activo") ||
      (rentalToEdit && client.id == rentalToEdit.clientId)
  );

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
            {isEditing ? "Editar Alquiler" : "Registrar Alquiler Inmediato"}
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
              {activeClients.map((client) => (
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
                const isSelected =
                  rentalToEdit && rentalToEdit.vehicleId === vehicle.id;
                const isDisabled =
                  vehicle.estado !== "disponible" && !isSelected;

                return (
                  <option
                    key={vehicle.id}
                    value={vehicle.id}
                    disabled={isDisabled}
                  >
                    {vehicle.brand} {vehicle.model}
                    {isDisabled
                      ? ` (${vehicle.estado})`
                      : ` ($${vehicle.pricePerDay || 0}/día)`}
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

            {/* SELECCIÓN DE ESTADO */}
            <FormSelect
              label="Estado"
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={!isEditing}
            >
              {!isEditing ? (
                <option value="confirmado">Confirmado</option>
              ) : (
                <>
                  <option value="confirmado">Confirmado</option>
                  <option value="finalizado">Finalizado</option>
                  <option value="cancelado">Cancelado</option>
                </>
              )}
            </FormSelect>

            {/* Kilometraje inicial */}
            <FormInput
              label="Kilometraje Inicial"
              id="kilometraje_inicio"
              name="kilometraje_inicio"
              type="number"
              value={formData.kilometraje_inicio}
              onChange={handleChange}
            />

            {/* MENSAJE CONDICIONAL: Si estado es FINALIZADO, avisar de redirección a facturación */}
            {formData.status === "finalizado" && (
              <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-sm flex flex-col gap-1">
                <span className="font-semibold flex items-center gap-2">
                  ℹ️ Facturación Requerida
                </span>
                <span>
                  Al guardar con estado <strong>Finalizado</strong>, serás
                  redirigido automáticamente a la pantalla de finalización para
                  ingresar el kilometraje de devolución y generar la factura.
                </span>
              </div>
            )}

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
              {isEditing
                ? formData.status === "finalizado"
                  ? "Continuar a Facturación"
                  : "Guardar Cambios"
                : "Registrar Alquiler"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
