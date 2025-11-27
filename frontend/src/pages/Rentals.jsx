import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Sliders,
  X,
  PlayCircle,
  CheckCircle,
} from "lucide-react";
import {
  leaseService,
  vehicleService,
  invoiceService,
  clientService,
} from "../services";

import RentalFormModal from "../components/rental/RentalFormModal";
import FinishRentalModal from "../components/rental/FinishRentalModal";
import SearchBoxWithButton from "../components/ui/SearchBoxWithButton";
import StyledPrimaryButton from "../components/ui/StyledPrimaryButton";
import GenericTable from "../components/ui/GenericTable";
import TableActionCell from "../components/ui/TableActionCell";

import { formatCurrency, formatDate } from "../utils/formatters";

const StatusBadge = ({ status }) => {
  const statusMap = {
    RESERVADO: { text: "Reservado", color: "bg-indigo-100 text-indigo-800" },
    ALQUILADO: { text: "Alquilado", color: "bg-yellow-100 text-yellow-800" },
    CONFIRMADO: { text: "Confirmado", color: "bg-blue-100 text-blue-800" },
    INICIADO: { text: "En Curso", color: "bg-purple-100 text-purple-800" },
    FINALIZADO: { text: "Finalizado", color: "bg-green-100 text-green-800" },
    CANCELADO: { text: "Cancelado", color: "bg-red-100 text-red-800" },
  };

  // Normalizamos a mayúsculas para el mapeo visual
  const normalizedStatus = status ? status.toUpperCase() : "DESCONOCIDO";

  const { text, color } = statusMap[normalizedStatus] || {
    text: status,
    color: "bg-gray-100 text-gray-800",
  };
  return (
    <span
      className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${color}`}
    >
      {text}
    </span>
  );
};

export default function Rentals() {
  const [searchTerm, setSearchTerm] = useState("");
  // Estado para el filtro de estado
  const [statusFilter, setStatusFilter] = useState("");

  // Estados de datos
  const [rentals, setRentals] = useState([]);
  const [clients, setClients] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [rentalToEdit, setRentalToEdit] = useState(null);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [rentalToFinish, setRentalToFinish] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsData, allLeases, vehiclesData, invoicesData] =
        await Promise.all([
          clientService.getAll(),
          leaseService.getAll(),
          vehicleService.getAll(),
          invoiceService.getAll(),
        ]);

      setClients(clientsData);

      // --- MAPEO DE DATOS ---
      const formattedLeases = allLeases.map((lease) => {
        let status = lease.state ? lease.state.toUpperCase() : "DESCONOCIDO";

        return {
          ...lease,
          id: lease.id,
          clientId: lease.clientId,
          clientName: lease.clientName,
          vehicleId: lease.vehicleId,
          vehicleName:
            lease.vehicleBrand && lease.vehicleModel
              ? `${lease.vehicleBrand} ${lease.vehicleModel}`
              : "Vehículo Desconocido",
          startDate: lease.date_time_start,
          endDate: lease.date_time_end,
          total: parseFloat(lease.amount || 0),
          status: status, // Mantenemos mayúsculas para lógica interna si se prefiere, o raw state
          // Para filtrado usaremos toLowerCase()
          kilometraje_inicio: lease.start_kilometers,
          fecha_confirmacion: lease.date_confirm,
          fecha_creacion: lease.date_create,
        };
      });

      const activeRentals = formattedLeases.filter(
        (r) => r.status !== "RESERVADO"
      );
      setRentals(activeRentals);

      setVehicles(vehiclesData);
      setInvoices(invoicesData);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const filteredRentals = rentals.filter((res) => {
    const term = searchTerm.toLowerCase();
    const vehiclePatente =
      vehicles.find((v) => v.id === res.vehicleId)?.patente || "";

    // 1. Filtro por texto
    const matchesSearch =
      res.clientName?.toLowerCase().includes(term) ||
      res.vehicleName?.toLowerCase().includes(term) ||
      res.id?.toString().toLowerCase().includes(term) ||
      vehiclePatente.toLowerCase().includes(term);

    // 2. Filtro por estado (insensible a mayúsculas/minúsculas)
    const matchesStatus = statusFilter
      ? res.status?.toLowerCase() === statusFilter.toLowerCase()
      : true;

    return matchesSearch && matchesStatus;
  });

  const handleSearchExecution = () => {
    console.log("Ejecutando búsqueda de alquileres con:", searchTerm);
  };

  const handleNewRental = () => {
    setRentalToEdit(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (rental) => {
    setRentalToEdit(rental);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setRentalToEdit(null);
  };

  const handleEditSubmit = async (formData) => {
    try {
      if (!rentalToEdit) {
        await leaseService.create({
          ...formData,
          status: "confirmado",
          fecha_confirmacion: new Date().toISOString(),
        });
        alert("Alquiler creado exitosamente");
      } else {
        if (formData.status === "finalizado") {
          handleCloseEditModal();
          setTimeout(() => handleOpenFinishModal(rentalToEdit), 100);
          return;
        }

        if (formData.status === "cancelado") {
          handleCloseEditModal();
          setTimeout(() => handleDelete(rentalToEdit.id), 100);
          return;
        }

        await leaseService.update(rentalToEdit.id, formData);
        alert("Alquiler actualizado exitosamente");
      }
      await loadData();
      handleCloseEditModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMsg =
        error.response?.data?.detail || "Error al procesar la solicitud";
      alert(errorMsg);
    }
  };

  const handleOpenFinishModal = (rental) => {
    setRentalToFinish(rental);
    setIsFinishModalOpen(true);
  };

  const handleFinishSubmit = async (data) => {
    try {
      const endKm = parseInt(data.kilometraje_fin, 10);

      if (isNaN(endKm)) {
        alert("El kilometraje final es inválido o está vacío.");
        return;
      }

      console.log("Finalizando alquiler...", {
        id: data.rentalId,
        end_kilometers: endKm,
      });

      const response = await leaseService.finish(data.rentalId, {
        end_kilometers: endKm,
      });

      const finishedRental = response?.data || response;

      if (finishedRental) {
        const invoiceData = {
          rentalId: parseInt(finishedRental.id, 10),
          paymentMethod: data.metodo_pago || "Efectivo",
        };

        console.log("Creando factura automática:", invoiceData);
        await invoiceService.create(invoiceData);
        alert("Alquiler finalizado y factura generada exitosamente.");
      } else {
        alert(
          "Alquiler finalizado, pero no se pudo generar la factura automáticamente."
        );
      }

      await loadData();
      setIsFinishModalOpen(false);
      setRentalToFinish(null);
    } catch (error) {
      console.error("Error en proceso de finalización/facturación:", error);
      let errorMsg = "Error al finalizar el alquiler.";
      const errorDetail = error.response?.data?.detail;

      if (Array.isArray(errorDetail)) {
        errorMsg = errorDetail
          .map((err) => `${err.loc.join(".")} : ${err.msg}`)
          .join("\n");
      } else if (typeof errorDetail === "string") {
        errorMsg = errorDetail;
      }
      alert(`Error del servidor:\n${errorMsg}`);
    }
  };

  const handleDelete = async (rentalId) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres CANCELAR el alquiler ID ${rentalId}?`
      )
    ) {
      try {
        await leaseService.delete(rentalId);
        alert("Alquiler cancelado exitosamente");
        await loadData();
      } catch (error) {
        console.error("Error canceling rental:", error);
        alert(error.response?.data?.detail || "Error al cancelar el alquiler");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando alquileres...</p>
        </div>
      </div>
    );
  }

  const columns = [
    { header: "# Alquiler", field: "id" },
    { header: "Cliente / Vehículo", field: "clientVehicle" },
    { header: "Período", field: "period" },
    { header: "Monto Total", field: "total", align: "right" },
    { header: "Estado", field: "status" },
  ];

  return (
    <section className="space-y-6">
      <header className="flex justify-between items-center pb-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de Alquileres Activos
        </h1>
        <StyledPrimaryButton onClick={handleNewRental}>
          <Plus className="w-5 h-5" />
          <span>Registrar Alquiler</span>
        </StyledPrimaryButton>
      </header>

      <div className="flex gap-6">
        <SearchBoxWithButton
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearchClick={handleSearchExecution}
          onOpenAdvancedFilters={() => setIsAdvancedFilterOpen((prev) => !prev)}
          showViewToggle={false}
          placeholder="Buscar por Cliente, Vehículo o ID de Alquiler..."
        />
      </div>

      <div className="mt-6 flex gap-6">
        {isAdvancedFilterOpen && (
          <div className="w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-5 shrink-0 transition-all duration-300">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sliders className="w-5 h-5 text-gray-600" />
                Filtros de Alquiler
              </h3>
              <button
                onClick={() => setIsAdvancedFilterOpen(false)}
                className="btn size-8 rounded-full p-0 text-gray-500 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="font-semibold text-gray-700">Estado:</div>
              {/* Selector funcional de Estado */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="confirmado">Confirmado</option>
                <option value="finalizado">Finalizado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex-grow">
          <GenericTable
            columns={columns}
            data={filteredRentals}
            emptyMessage="No se encontraron alquileres que coincidan con los filtros."
          >
            {(rental) => (
              <tr
                key={rental.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {rental.id}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {rental.clientName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {rental.vehicleName}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-800">
                    Inicia: {formatDate(rental.startDate)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Finaliza: {formatDate(rental.endDate)}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-extrabold text-gray-900">
                    {formatCurrency(rental.total)}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={rental.status} />
                </td>

                <TableActionCell
                  data={rental}
                  onAction={
                    rental.status === "ALQUILADO" ||
                    rental.status === "INICIADO" ||
                    rental.status === "CONFIRMADO"
                      ? handleOpenFinishModal
                      : null
                  }
                  additionalActionIcon={CheckCircle}
                  additionalActionTitle="Finalizar Alquiler"
                  onEdit={handleOpenEditModal}
                  onDelete={
                    rental.status !== "FINALIZADO"
                      ? () => handleDelete(rental.id)
                      : null
                  }
                />
              </tr>
            )}
          </GenericTable>
        </div>
      </div>

      <RentalFormModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        rentalToEdit={rentalToEdit}
        clientsList={clients}
        vehiclesList={vehicles}
      />

      <FinishRentalModal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        onSubmit={handleFinishSubmit}
        rentalToFinish={rentalToFinish}
      />
    </section>
  );
}
