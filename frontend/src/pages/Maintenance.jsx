import { useState, useEffect } from "react";
import { Plus, Sliders, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import { maintenanceService, vehicleService } from "../services";

import MaintenanceFormModal from "../components/maintenance/MaintenanceFormModal";
import MaintenanceList from "../components/maintenance/MaintenanceList";

import SearchBoxWithButton from "../components/ui/SearchBoxWithButton";
import StyledPrimaryButton from "../components/ui/StyledPrimaryButton";

export default function Maintenance() {
  const location = useLocation();

  const [maintenanceJobs, setMaintenanceJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [vehiclesList, setVehiclesList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [jobToEdit, setJobToEdit] = useState(null);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  const [dashboardFilterMessage, setDashboardFilterMessage] = useState(null);

  // Nuevos estados para los filtros avanzados
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (
      location.state &&
      location.state.filter === "PENDIENTE" &&
      allJobs.length > 0
    ) {
      const pendingJobs = allJobs.filter(
        (job) => job.type === "Preventivo" || job.type === "Correctivo"
      );

      setMaintenanceJobs(pendingJobs);
      setDashboardFilterMessage(location.state.message);

      window.history.replaceState({}, document.title, location.pathname);
    } else if (allJobs.length > 0) {
      setMaintenanceJobs(allJobs);
      setDashboardFilterMessage(null);
    }
  }, [location.state, allJobs]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [jobsData, vehiclesData] = await Promise.all([
        maintenanceService.getAll(),
        vehicleService.getAll(),
      ]);
      setAllJobs(jobsData);
      setMaintenanceJobs(jobsData);
      setVehiclesList(vehiclesData);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const jobsSource = dashboardFilterMessage ? maintenanceJobs : allJobs;

  const filteredJobs = jobsSource.filter((job) => {
    // 1. Búsqueda por texto
    const matchesSearch =
      job.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Filtro por Estado
    const matchesStatus = statusFilter
      ? job.status?.toLowerCase() === statusFilter.toLowerCase()
      : true;

    // 3. Filtro por Fecha
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const jobDate = new Date(job.startDate);
      const startFilter = dateFrom ? new Date(dateFrom) : null;
      const endFilter = dateTo ? new Date(dateTo) : null;

      if (endFilter) endFilter.setHours(23, 59, 59, 999);

      if (startFilter && jobDate < startFilter) matchesDate = false;
      if (endFilter && jobDate > endFilter) matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleSearchExecution = () => {
    console.log("Ejecutando búsqueda de mantenimiento con:", searchTerm);
  };

  const handleOpenCreateModal = () => {
    setJobToEdit(null);
    setIsModalOpen(true);
  };
  const handleOpenEditModal = (job) => {
    setJobToEdit(job);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setJobToEdit(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (jobToEdit) {
        await maintenanceService.update(jobToEdit.id, formData);
        alert("Mantenimiento actualizado exitosamente");
      } else {
        await maintenanceService.create(formData);
        alert("Mantenimiento registrado exitosamente");
      }
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMsg =
        error.response?.data?.detail || "Error al guardar el mantenimiento";
      alert(errorMsg);
    }
  };

  // NUEVA FUNCIÓN: Finalizar mantenimiento
  const handleFinish = async (job) => {
    if (
      window.confirm(
        `¿Confirmar la finalización del mantenimiento para ${job.vehicleName}?`
      )
    ) {
      try {
        await maintenanceService.finish(job.id);
        alert("Mantenimiento finalizado exitosamente");
        await loadData();
      } catch (error) {
        console.error("Error finishing maintenance:", error);
        const errorMsg =
          error.response?.data?.detail || "Error al finalizar el mantenimiento";
        alert(errorMsg);
      }
    }
  };

  const handleDelete = async (jobId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este registro?")
    ) {
      try {
        await maintenanceService.delete(jobId);
        alert("Mantenimiento eliminado exitosamente");
        await loadData();
      } catch (error) {
        console.error("Error deleting maintenance:", error);
        const errorMsg =
          error.response?.data?.detail || "Error al eliminar el mantenimiento";
        alert(errorMsg);
      }
    }
  };

  const handleClearDashboardFilter = async () => {
    await loadData();
    setDashboardFilterMessage(null);
    setSearchTerm("");
  };

  const clearAdvancedFilters = () => {
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando mantenimientos...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex justify-between items-center pb-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de Mantenimiento
        </h1>
        <StyledPrimaryButton onClick={handleOpenCreateModal}>
          <Plus className="w-5 h-5" />
          <span>Registrar Mantenimiento</span>
        </StyledPrimaryButton>
      </header>

      {dashboardFilterMessage && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-md shadow-md flex justify-between items-center">
          <p className="font-semibold text-yellow-800">
            {dashboardFilterMessage}
          </p>
          <button
            onClick={handleClearDashboardFilter}
            className="text-yellow-800 hover:text-yellow-900 font-bold flex items-center gap-1 transition-colors"
          >
            <X className="w-4 h-4" />
            Mostrar Todos
          </button>
        </div>
      )}

      <div className="flex gap-6">
        <SearchBoxWithButton
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearchClick={handleSearchExecution}
          onOpenAdvancedFilters={() => setIsAdvancedFilterOpen((prev) => !prev)}
          view="table"
          showViewToggle={false}
          placeholder="Buscar por Vehículo o Descripción..."
        />
      </div>

      <div className="flex flex-col gap-6">
        {isAdvancedFilterOpen && (
          <div className="w-full bg-white rounded-xl shadow-lg border border-gray-100 p-5 transition-all duration-300">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sliders className="w-5 h-5 text-gray-600" />
                Filtros de Mantenimiento
              </h3>
              <button
                onClick={() => setIsAdvancedFilterOpen(false)}
                className="btn size-8 rounded-full p-0 text-gray-500 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  <option value="iniciado">Iniciado</option>
                  <option value="en proceso">En Proceso</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={clearAdvancedFilters}
                className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Limpiar Filtros
              </button>
            </div>
          </div>
        )}

        <div className="flex-grow">
          <MaintenanceList
            maintenanceJobs={filteredJobs}
            onEdit={handleOpenEditModal}
            onDelete={handleDelete}
            onFinish={handleFinish} // PASAMOS LA NUEVA FUNCIÓN
          />
        </div>
      </div>

      <MaintenanceFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        jobToEdit={jobToEdit}
        vehiclesList={vehiclesList}
      />
    </section>
  );
}
