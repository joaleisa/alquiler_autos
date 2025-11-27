import { useState, useEffect } from "react";
import { Plus, Search, Sliders, X } from "lucide-react";
import { incidentService, leaseService } from "../services";
import IncidentList from "../components/incident/IncidentList";
import IncidentFormModal from "../components/incident/IncidentFormModal";
import SearchBoxWithButton from "../components/ui/SearchBoxWithButton";
import StyledPrimaryButton from "../components/ui/StyledPrimaryButton";

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [rentalsList, setRentalsList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Estado para el filtro de tipo
  const [typeFilter, setTypeFilter] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incidentToEdit, setIncidentToEdit] = useState(null);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [incidentsData, rentalsData] = await Promise.all([
        incidentService.getAll(),
        leaseService.getAll(),
      ]);

      setIncidents(Array.isArray(incidentsData) ? incidentsData : []);
      setRentalsList(Array.isArray(rentalsData) ? rentalsData : []);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Error al cargar datos");
      setIncidents([]);
      setRentalsList([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredIncidents = incidents.filter((incident) => {
    const matchesSearch =
      incident.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.vehicleName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter ? incident.type === typeFilter : true;

    return matchesSearch && matchesType;
  });

  const handleSearchExecution = () => {
    console.log("Ejecutando búsqueda de incidentes con:", searchTerm);
  };

  const handleOpenCreateModal = () => {
    setIncidentToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (incident) => {
    setIncidentToEdit(incident);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIncidentToEdit(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (incidentToEdit) {
        await incidentService.update(incidentToEdit.id, formData);
        alert("Incidente actualizado exitosamente");
      } else {
        await incidentService.create(formData);
        alert("Incidente registrado exitosamente");
      }
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMsg =
        error.response?.data?.detail || "Error al guardar el incidente";
      alert(errorMsg);
    }
  };

  const handleDelete = async (incidentId) => {
    if (
      window.confirm("¿Estás seguro de que quieres eliminar este incidente?")
    ) {
      try {
        await incidentService.delete(incidentId);
        alert("Incidente eliminado exitosamente");
        await loadData();
      } catch (error) {
        console.error("Error deleting incident:", error);
        const errorMsg =
          error.response?.data?.detail || "Error al eliminar el incidente";
        alert(errorMsg);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando incidentes...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex justify-between items-center pb-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de Incidentes
        </h1>
        <StyledPrimaryButton onClick={handleOpenCreateModal}>
          <Plus className="w-5 h-5" />
          <span>Registrar Incidente</span>
        </StyledPrimaryButton>
      </header>

      <div className="flex gap-6">
        <SearchBoxWithButton
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearchClick={handleSearchExecution}
          onOpenAdvancedFilters={() => setIsAdvancedFilterOpen((prev) => !prev)}
          view="table"
          showViewToggle={false}
          placeholder="Buscar por Alquiler, Cliente o Descripción..."
        />
      </div>

      <div className="mt-6 flex gap-6">
        {isAdvancedFilterOpen && (
          <div className="w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-5 shrink-0 transition-all duration-300">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sliders className="w-5 h-5 text-gray-600" />
                Filtros de Incidente
              </h3>
              <button
                onClick={() => setIsAdvancedFilterOpen(false)}
                className="btn size-8 rounded-full p-0 text-gray-500 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="font-semibold text-gray-700">Tipo:</div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="Daño">Daño</option>
                <option value="Multa">Multa</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex-grow">
          <IncidentList
            incidents={filteredIncidents}
            onEdit={handleOpenEditModal}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <IncidentFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        incidentToEdit={incidentToEdit}
        rentalsList={rentalsList}
      />
    </section>
  );
}
