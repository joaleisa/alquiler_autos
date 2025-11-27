import { X, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { employeeService } from "../../services";

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

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  userToEdit,
}) {
  const [employeesList, setEmployeesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const getInitialState = () => ({
    employeeId: userToEdit?.employeeId || employeesList[0]?.id || "",
    username: userToEdit?.username || "",
    password: "",
  });

  const [formData, setFormData] = useState(getInitialState());

  const isEditing = !!userToEdit;
  const title = isEditing ? "Modificar Contraseña" : "Crear Nuevo Usuario";

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen]);

  useEffect(() => {
    setFormData(getInitialState());
  }, [userToEdit, isOpen, employeesList]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setEmployeesList(data);
    } catch (error) {
      console.error("Error loading employees:", error);
      alert("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const selectedEmployee = employeesList.find(
      (emp) => emp.id === formData.employeeId
    );
    onSubmit({
      ...formData,
      employeeName: selectedEmployee?.name || "N/A",
    });
  };

  if (!isOpen) return null;

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
          <div className="p-6 space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Cargando empleados...</p>
              </div>
            ) : (
              <>
                <FormSelect
                  label="Empleado a Vincular"
                  id="employeeId"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  disabled={isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditing ? "bg-gray-100" : ""
                  }`}
                  required
                >
                  <option value="" disabled>
                    Seleccione un empleado
                  </option>
                  {employeesList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} (Cargo: {emp.cargo})
                    </option>
                  ))}
                </FormSelect>

                <FormInput
                  label="Nombre de Usuario"
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isEditing}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isEditing ? "bg-gray-100" : ""
                  }`}
                  required
                />

                <div className="relative">
                  <FormInput
                    label={isEditing ? "Nueva Contraseña" : "Contraseña"}
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Dejar en blanco para no cambiar"
                    required={!isEditing}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500">
                  {isEditing
                    ? "Solo se puede modificar la contraseña. Para cambiar el empleado o nombre de usuario, elimine y cree uno nuevo."
                    : "La contraseña será hasheada en el backend."}
                </p>
              </>
            )}
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
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? "Actualizar Contraseña" : "Crear Usuario"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
