import { useState, useEffect } from "react";
import { Search, LayoutGrid, List, Sliders, X, Plus } from "lucide-react";
import { vehicleService } from "../services";
import VehicleList from "../components/vehicle/VehicleList";
import VehicleFormModal from "../components/vehicle/VehicleFormModal";
import SearchBoxWithButton from "../components/ui/SearchBoxWithButton";
import StyledPrimaryButton from "../components/ui/StyledPrimaryButton";

const getToggleClasses = (currentView, buttonView) => {
  return `p-2 rounded-lg transition-all duration-200 ${
    currentView === buttonView
      ? "bg-blue-100 text-blue-600 shadow-sm"
      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
  }`;
};

export default function Vehicles() {
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para filtros avanzados
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedFuel, setSelectedFuel] = useState("");

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // Estados para el modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [vehicleToEdit, setVehicleToEdit] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getAll();

      // Filtramos para excluir los que tienen estado "baja"
      const activeVehicles = Array.isArray(data)
        ? data.filter((v) => v.estado?.toLowerCase() !== "baja")
        : [];

      setVehicles(activeVehicles);
    } catch (error) {
      console.error("Error loading vehicles:", error);
      alert("Error al cargar vehículos");
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const term = searchTerm.toLowerCase();

    // 1. Filtro de Texto (Marca, Modelo, Patente)
    const matchesSearch =
      v.brand?.toLowerCase().includes(term) ||
      v.model?.toLowerCase().includes(term) ||
      v.patente?.toLowerCase().includes(term);

    // 2. Filtro de Precio
    const price = parseFloat(v.pricePerDay);
    const matchesMinPrice = priceRange.min
      ? price >= parseFloat(priceRange.min)
      : true;
    const matchesMaxPrice = priceRange.max
      ? price <= parseFloat(priceRange.max)
      : true;

    // 3. Filtro de Combustible
    const matchesFuel = selectedFuel ? v.fuel === selectedFuel : true;

    return matchesSearch && matchesMinPrice && matchesMaxPrice && matchesFuel;
  });

  const handleSearchExecution = () => {
    console.log("Ejecutando búsqueda profunda con:", searchTerm);
  };

  const clearAdvancedFilters = () => {
    setPriceRange({ min: "", max: "" });
    setSelectedFuel("");
  };

  // Manejadores del Modal
  const handleOpenCreateModal = () => {
    setVehicleToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (vehicle) => {
    setVehicleToEdit(vehicle);
    setIsFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFormModalOpen(false);
    setVehicleToEdit(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (vehicleToEdit) {
        await vehicleService.update(vehicleToEdit.id, formData);
        alert("Vehículo actualizado exitosamente");
      } else {
        await vehicleService.create(formData);
        alert("Vehículo creado exitosamente");
      }
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving vehicle:", error);
      const errorMsg =
        error.response?.data?.detail || "Error al guardar el vehículo";
      alert(errorMsg);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    if (
      window.confirm("¿Estás seguro de que quieres dar de baja este vehículo?")
    ) {
      try {
        await vehicleService.delete(vehicleId);
        alert("Vehículo eliminado exitosamente");
        await loadData();
      } catch (error) {
        console.error("Error deleting vehicle:", error);
        const errorMsg =
          error.response?.data?.detail || "Error al eliminar el vehículo";
        alert(errorMsg);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando vehículos...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex justify-between items-center pb-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de Vehículos
        </h1>
        <StyledPrimaryButton onClick={handleOpenCreateModal}>
          <Plus className="w-5 h-5" />
          <span>Nuevo Vehículo</span>
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
          placeholder="Ubicación, Marca o Patente..."
        />
      </div>

      <div className="mt-6 flex gap-6">
        {isAdvancedFilterOpen && (
          <div className="w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-5 shrink-0 transition-all duration-300">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sliders className="w-5 h-5 text-gray-600" />
                Filtros Avanzados
              </h3>
              <button
                onClick={() => setIsAdvancedFilterOpen(false)}
                className="btn size-8 rounded-full p-0 text-gray-500 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Filtro de Precio */}
              <div>
                <div className="font-semibold text-gray-700 mb-2">
                  Rango de Precios ($ / día):
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Filtro de Combustible */}
              <div>
                <div className="font-semibold text-gray-700 mb-2">
                  Tipo de Combustible:
                </div>
                <select
                  value={selectedFuel}
                  onChange={(e) => setSelectedFuel(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Todos</option>
                  <option value="Nafta">Nafta</option>
                  <option value="Diesel">Diesel</option>
                  <option value="GNC">GNC</option>
                  <option value="Hibrido">Híbrido</option>
                  <option value="Electrico">Eléctrico</option>
                </select>
              </div>

              {/* Botón Limpiar */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={clearAdvancedFilters}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1 font-medium"
                >
                  <X className="w-3 h-3" /> Limpiar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-grow">
          <VehicleList
            vehicles={filteredVehicles}
            view={view}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteVehicle}
          />
        </div>
      </div>

      <VehicleFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        vehicleToEdit={vehicleToEdit}
      />
    </section>
  );
}
