import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  LayoutGrid,
  List,
  X,
  Sliders,
} from "lucide-react";
import { employeeService } from "../services";

import EmployeeFormModal from "../components/employee/EmployeeFormModal";
import EmployeeCard from "../components/employee/EmployeeCard";
import SearchBoxWithButton from "../components/ui/SearchBoxWithButton";
import StyledPrimaryButton from "../components/ui/StyledPrimaryButton";
import StyledActionButton from "../components/ui/StyledActionButton";
import GenericTable from "../components/ui/GenericTable";
import TableActionCell from "../components/ui/TableActionCell";

const getToggleClasses = (currentView, buttonView) => {
  return `p-2 rounded-lg transition-all duration-200 ${
    currentView === buttonView
      ? "bg-blue-100 text-blue-600 shadow-sm"
      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
  }`;
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState(null);
  const [view, setView] = useState("grid");
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setEmployees(data);
    } catch (error) {
      console.error("Error loading employees:", error);
      alert("Error al cargar empleados");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.cargo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.dni?.includes(searchTerm)
  );

  const handleSearchExecution = () => {
    console.log("Ejecutando búsqueda de empleados con:", searchTerm);
  };

  const handleOpenCreateModal = () => {
    setEmployeeToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (employee) => {
    setEmployeeToEdit(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEmployeeToEdit(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (employeeToEdit) {
        await employeeService.update(employeeToEdit.id, formData);
        alert("Empleado actualizado exitosamente");
      } else {
        await employeeService.create(formData);
        alert("Empleado creado exitosamente");
      }
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMsg = error.response?.data?.detail || "Error al guardar el empleado";
      alert(errorMsg);
    }
  };

  const handleDelete = async (employee) => {
  
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar a ${employee?.name || "este empleado"}?`
      )
    ) {
      try {
        await employeeService.delete(employee);
        alert("Empleado eliminado exitosamente");
        await loadData();
      } catch (error) {
        console.error("Error deleting employee:", error);
        const errorMsg = error.response?.data?.detail || "Error al eliminar el empleado";
        alert(errorMsg);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando empleados...</p>
        </div>
      </div>
    );
  }

  const columns = [
    { header: "Nombre", field: "name" },
    { header: "DNI", field: "dni" },
    { header: "Contacto", field: "contact" },
    { header: "Cargo", field: "cargo" },
  ];

  const TableView = () => (
    <GenericTable
      columns={columns}
      data={filteredEmployees}
      emptyMessage="No se encontraron empleados que coincidan con la búsqueda."
    >
      {(employee) => (
        <tr
          key={employee.id}
          className="hover:bg-gray-50 transition-colors duration-150"
        >
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">
              {employee.name}
            </div>
          </td>

          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">
              {employee.dni}
            </div>
          </td>

          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-800">{employee.email}</div>
            <div className="text-sm text-gray-500">{employee.phone}</div>
          </td>

          <td className="px-6 py-4 whitespace-nowrap">
            <span className="px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
              {employee.cargo}
            </span>
          </td>

          <TableActionCell
            data={employee}
            onEdit={handleOpenEditModal}
            onDelete={handleDelete}
          />
        </tr>
      )}
    </GenericTable>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 transition-opacity duration-500">
      {filteredEmployees.map((employee) => (
        <EmployeeCard
          key={employee.id}
          employee={employee}
          onEdit={handleOpenEditModal}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );

  return (
    <section className="space-y-6">
      <header className="flex justify-between items-center pb-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de Empleados
        </h1>
        <StyledPrimaryButton onClick={handleOpenCreateModal}>
          <Plus className="w-5 h-5" />
          <span>Agregar Empleado</span>
        </StyledPrimaryButton>
      </header>

      <div className="flex gap-6">
        <SearchBoxWithButton
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearchClick={handleSearchExecution}
          onOpenAdvancedFilters={() => setIsAdvancedFilterOpen((prev) => !prev)}
          view={view}
          onViewChange={setView}
          showViewToggle={true}
          placeholder="Buscar por Nombre, DNI, o Cargo..."
        />
      </div>

      <div className="mt-6 flex gap-6">
        {isAdvancedFilterOpen && (
          <div className="w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-5 shrink-0 transition-all duration-300">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold text-lg flex items-center gap-2">
                Filtros de Empleado
              </h3>
              <button
                onClick={() => setIsAdvancedFilterOpen(false)}
                className="btn size-8 rounded-full p-0 text-gray-500 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="font-semibold text-gray-700">Cargo:</div>
              <div className="h-16 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">
                (Dropdown de Cargos Mock)
              </div>
            </div>
          </div>
        )}

        <div className="flex-grow">
          <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden">
            {view === "table" && <TableView />}
            {view === "grid" && <GridView />}
          </div>
        </div>
      </div>

      <EmployeeFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        employeeToEdit={employeeToEdit}
      />
    </section>
  );
}
