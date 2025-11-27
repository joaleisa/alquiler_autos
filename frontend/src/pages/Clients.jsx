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
import { clientService } from "../services";

import ClientFormModal from "../components/client/ClientFormModal";
import ClientCard from "../components/client/ClientCard";
import SearchBoxWithButton from "../components/ui/SearchBoxWithButton";
import StyledPrimaryButton from "../components/ui/StyledPrimaryButton";
import GenericTable from "../components/ui/GenericTable";
import TableActionCell from "../components/ui/TableActionCell";

import { formatDate } from "../utils/formatters";

const getToggleClasses = (currentView, buttonView) => {
  return `p-2 rounded-lg transition-all duration-200 ${
    currentView === buttonView
      ? "bg-blue-100 text-blue-600 shadow-sm"
      : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
  }`;
};

const StatusBadge = ({ status }) => {
  // Normalizamos a minúsculas para asegurar que "Activo", "activo" o "ACTIVO" funcionen
  const normalizedStatus = status ? status.toLowerCase() : "";
  const isActive = normalizedStatus === "activo";

  return (
    <span
      className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${
        isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {status}
    </span>
  );
};

export default function Clients() {
  const [searchTerm, setSearchTerm] = useState("");
  // Estado para el filtro de activo/inactivo
  const [statusFilter, setStatusFilter] = useState("");

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [view, setView] = useState("grid");
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAll();
      // Protección: Aseguramos que data sea un array antes de setearlo
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading clients:", error);
      alert("Error al cargar clientes");
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase();

    // 1. Filtro por texto (Nombre, Email, DNI)
    const matchesSearch =
      client.name?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.dni?.includes(term);

    // 2. Filtro por estado (Activo/Inactivo)
    const matchesStatus = statusFilter
      ? client.status?.toLowerCase() === statusFilter.toLowerCase()
      : true;

    return matchesSearch && matchesStatus;
  });

  const handleSearchExecution = () => {
    console.log("Ejecutando búsqueda de clientes con:", searchTerm);
  };

  const handleOpenCreateModal = () => {
    setClientToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setClientToEdit(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (clientToEdit) {
        // 1. Actualizar datos generales (PUT)
        await clientService.update(clientToEdit.id, formData);

        // 2. Verificar si el estado cambió para llamar al endpoint PATCH específico
        const currentStatus = clientToEdit.status
          ? clientToEdit.status.toLowerCase()
          : "";
        const newStatus = formData.status ? formData.status.toLowerCase() : "";

        if (currentStatus !== newStatus) {
          console.log(`Actualizando estado de ${currentStatus} a ${newStatus}`);
          await clientService.updateStatus(clientToEdit.id, formData.status);
        }

        alert("Cliente actualizado exitosamente");
      } else {
        await clientService.create(formData);
        alert("Cliente creado exitosamente");
      }
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMsg =
        error.response?.data?.detail || "Error al guardar el cliente";
      alert(errorMsg);
    }
  };

  const handleDeleteClient = async (clientData) => {
    // La tabla devuelve el objeto completo, nos aseguramos de obtener el ID
    const clientId = clientData.id || clientData;
    const clientName = clientData.name || "este cliente";

    if (
      window.confirm(`¿Estás seguro de que quieres eliminar a ${clientName}?`)
    ) {
      try {
        await clientService.delete(clientId);
        alert("Cliente eliminado exitosamente");
        await loadData();
      } catch (error) {
        console.error("Error deleting client:", error);
        const errorMsg =
          error.response?.data?.detail || "Error al eliminar el cliente";
        alert(errorMsg);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  const columns = [
    { header: "Nombre", field: "name" },
    { header: "DNI", field: "dni" },
    { header: "Contacto", field: "phone" },
    { header: "Estado", field: "status" },
  ];

  const TableView = () => (
    <GenericTable
      columns={columns}
      data={filteredClients}
      emptyMessage="No se encontraron clientes que coincidan con la búsqueda."
    >
      {(client) => (
        <tr
          key={client.id}
          className="hover:bg-gray-50 transition-colors duration-150"
        >
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">
              {client.name}
            </div>
            <div className="text-sm text-gray-500">{client.email}</div>
          </td>

          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-gray-900">
              {client.dni}
            </div>
          </td>

          <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm text-gray-800">{client.phone}</div>
          </td>

          <td className="px-6 py-4 whitespace-nowrap">
            <StatusBadge status={client.status} />
          </td>

          <TableActionCell
            data={client}
            onEdit={handleOpenEditModal}
            onDelete={handleDeleteClient}
            hideDelete={false}
          />
        </tr>
      )}
    </GenericTable>
  );

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 transition-opacity duration-500">
      {filteredClients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteClient}
        />
      ))}
    </div>
  );

  return (
    <section className="space-y-6">
      <header className="flex justify-between items-center pb-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de Clientes
        </h1>
        <div className="flex gap-3">
          <StyledPrimaryButton onClick={handleOpenCreateModal}>
            <Plus className="w-5 h-5" />
            <span>Agregar Cliente</span>
          </StyledPrimaryButton>
        </div>
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
          placeholder="Buscar por nombre, email o DNI..."
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
              <div className="font-semibold text-gray-700">
                Estado de Cuenta:
              </div>
              {/* Selector Funcional de Estado */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
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

      <ClientFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        clientToEdit={clientToEdit}
      />
    </section>
  );
}
