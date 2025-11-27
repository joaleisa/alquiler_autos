import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Sliders,
  X,
  PlayCircle,
  CheckCircle,
  Eye,
} from "lucide-react";
// AGREGADO: clientService
import {
  leaseService,
  vehicleService,
  invoiceService,
  clientService,
} from "../services";

import ReservationFormModal from "../components/reservation/ReservationFormModal";
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
    INICIADO: { text: "En Curso", color: "bg-purple-100 text-purple-800" },
    FINALIZADO: { text: "Finalizado", color: "bg-green-100 text-green-800" },
    CANCELADO: { text: "Cancelado", color: "bg-red-100 text-red-800" },
  };
  const { text, color } = statusMap[status] || {
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

export default function Reservations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [reservations, setReservations] = useState([]);

  // Datos necesarios para el formulario
  const [vehicles, setVehicles] = useState([]);
  const [clients, setClients] = useState([]); // AGREGADO: Estado para clientes

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view] = useState("table");
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [reservationToEdit, setReservationToEdit] = useState(null);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);
  const [rentalToFinish, setRentalToFinish] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // AGREGADO: Carga de clientes
      const [reservationsData, vehiclesData, invoicesData, clientsData] =
        await Promise.all([
          leaseService.getAll(),
          vehicleService.getAll(),
          invoiceService.getAll(),
          clientService.getAll(), // Llamada al servicio
        ]);
      setReservations(reservationsData);
      setVehicles(vehiclesData);
      setInvoices(invoicesData);
      setClients(clientsData); // Seteo del estado
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = reservations.filter((res) => {
    const term = searchTerm.toLowerCase();
    const vehiclePatente =
      vehicles.find((v) => v.id === res.vehicleId)?.patente || "";

    return (
      res.clientName?.toLowerCase().includes(term) ||
      res.vehicleName?.toLowerCase().includes(term) ||
      res.id?.toLowerCase().includes(term) ||
      vehiclePatente.toLowerCase().includes(term)
    );
  });

  const handleSearchExecution = () => {
    console.log("Ejecutando búsqueda de reservas con:", searchTerm);
  };

  const handleNewReservation = () => {
    setReservationToEdit(null);
    setIsEditModalOpen(true);
  };
  const handleOpenEditModal = (reservation) => {
    setReservationToEdit(reservation);
    setIsEditModalOpen(true);
  };
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setReservationToEdit(null);
  };
  const handleEditSubmit = async (formData) => {
    try {
      if (reservationToEdit) {
        await leaseService.update(reservationToEdit.id, formData);
        alert("Reserva actualizada exitosamente");
      } else {
        await leaseService.create(formData);
        alert("Reserva creada exitosamente");
      }
      await loadData();
      handleCloseEditModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMsg =
        error.response?.data?.detail || "Error al guardar la reserva";
      alert(errorMsg);
    }
  };

  const handleStartRental = async (reservation) => {
    if (
      !window.confirm(
        `¿Iniciar el alquiler para ${reservation.clientName} con el ${reservation.vehicleName}?`
      )
    ) {
      return;
    }

    try {
      await leaseService.start(reservation.id, {
        fecha_confirmacion: new Date().toISOString(),
      });
      alert("Alquiler iniciado exitosamente");
      await loadData();
    } catch (error) {
      console.error("Error starting rental:", error);
      alert(error.response?.data?.detail || "Error al iniciar el alquiler");
    }
  };

  const handleOpenFinishModal = (rental) => {
    setRentalToFinish(rental);
    setIsFinishModalOpen(true);
  };

  const handleFinishSubmit = async (data) => {
    try {
      await leaseService.finish(data.rentalId, {
        kilometraje_fin: data.kilometraje_fin,
        metodo_pago: data.metodo_pago,
      });
      alert("Alquiler finalizado exitosamente");
      await loadData();
      setIsFinishModalOpen(false);
      setRentalToFinish(null);
    } catch (error) {
      console.error("Error finishing rental:", error);
      alert(error.response?.data?.detail || "Error al finalizar el alquiler");
    }
  };

  const handleDelete = async (reservationId) => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres CANCELAR la reserva ID ${reservationId}?`
      )
    ) {
      try {
        await leaseService.delete(reservationId);
        alert("Reserva cancelada exitosamente");
        await loadData();
      } catch (error) {
        console.error("Error canceling reservation:", error);
        alert(error.response?.data?.detail || "Error al cancelar la reserva");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando reservas...</p>
        </div>
      </div>
    );
  }

  const columns = [
    { header: "# Reserva", field: "id" },
    { header: "Cliente / Vehículo", field: "clientVehicle" },
    { header: "Período", field: "period" },
    { header: "Monto Total", field: "total", align: "right" },
    { header: "Estado", field: "status" },
  ];

  return (
    <section className="space-y-6">
      <header className="flex justify-between items-center pb-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de Reservas
        </h1>
        <StyledPrimaryButton onClick={handleNewReservation}>
          <Plus className="w-5 h-5" />
          <span>Registrar Reserva</span>
        </StyledPrimaryButton>
      </header>

      <div className="flex gap-6">
        <SearchBoxWithButton
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearchClick={handleSearchExecution}
          onOpenAdvancedFilters={() => setIsAdvancedFilterOpen((prev) => !prev)}
          view={view}
          showViewToggle={false}
          placeholder="Buscar por Cliente, Vehículo o ID de Reserva..."
        />
      </div>

      <div className="mt-6 flex gap-6">
        {isAdvancedFilterOpen && (
          <div className="w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-5 shrink-0 transition-all duration-300">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sliders className="w-5 h-5 text-gray-600" />
                Filtros de Reserva
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
                Estado de la Reserva:
              </div>
              <div className="h-24 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">
                (Checkboxes de Estado)
              </div>
            </div>
          </div>
        )}

        <div className="flex-grow">
          <GenericTable
            columns={columns}
            data={filteredReservations}
            emptyMessage="No se encontraron reservas que coincidan con los filtros."
          >
            {(res) => (
              <tr
                key={res.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900">
                    {res.id}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {res.clientName}
                  </div>
                  <div className="text-xs text-gray-500">{res.vehicleName}</div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-800">
                    Inicia: {formatDate(res.startDate)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Finaliza: {formatDate(res.endDate)}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-extrabold text-gray-900">
                    {formatCurrency(res.total)}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={res.status} />
                </td>

                <TableActionCell
                  data={res}
                  onAction={
                    res.status === "RESERVADO"
                      ? handleStartRental
                      : res.status === "ALQUILADO" || res.status === "INICIADO"
                      ? handleOpenFinishModal
                      : null
                  }
                  additionalActionIcon={
                    res.status === "RESERVADO"
                      ? PlayCircle
                      : res.status === "ALQUILADO" || res.status === "INICIADO"
                      ? CheckCircle
                      : null
                  }
                  additionalActionTitle={
                    res.status === "RESERVADO"
                      ? "Iniciar Alquiler"
                      : res.status === "ALQUILADO" || res.status === "INICIADO"
                      ? "Finalizar Alquiler"
                      : null
                  }
                  onEdit={
                    res.status === "RESERVADO" ? handleOpenEditModal : null
                  }
                  onDelete={
                    res.status !== "FINALIZADO"
                      ? () => handleDelete(res.id)
                      : null
                  }
                />
              </tr>
            )}
          </GenericTable>
        </div>
      </div>

      <ReservationFormModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleEditSubmit}
        reservationToEdit={reservationToEdit}
        // AGREGADO: Paso de datos al modal
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
