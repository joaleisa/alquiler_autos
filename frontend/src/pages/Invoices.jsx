import { useState, useEffect } from "react";
import {
  Plus,
  Sliders,
  X,
  CheckCircle,
  Eye,
  Download,
  Trash2,
  Car,
  Calendar,
  Gauge,
} from "lucide-react";
import { invoiceService, leaseService } from "../services";

import SearchBoxWithButton from "../components/ui/SearchBoxWithButton";
import StyledPrimaryButton from "../components/ui/StyledPrimaryButton";
import GenericTable from "../components/ui/GenericTable";
import InvoiceDetailModal from "../components/invoice/InvoiceDetailModal";
import InvoiceFormModal from "../components/invoice/InvoiceFormModal";

import { formatCurrency, formatDate } from "../utils/formatters";

const InvoiceStatusBadge = ({ status }) => {
  const isPaid = status === "COBRADA" || status === "pagada";
  const isPending = status === "pendiente" || status === "NO COBRADA";

  let colorClass = "bg-gray-100 text-gray-800";
  if (isPaid) colorClass = "bg-green-100 text-green-800";
  if (isPending) colorClass = "bg-yellow-100 text-yellow-800";

  return (
    <span
      className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${colorClass}`}
    >
      {status}
    </span>
  );
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState({
    invoice: null,
    rental: null,
  });
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invoicesData, reservationsData] = await Promise.all([
        invoiceService.getAll(),
        leaseService.getAll(),
      ]);

      // Aseguramos que sean arrays
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      setReservations(Array.isArray(reservationsData) ? reservationsData : []);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.rentalId?.toString().includes(searchTerm) ||
      invoice.id?.toString().includes(searchTerm);
    const matchesStatus = statusFilter ? invoice.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const handleSearchExecution = () => {
    console.log("Ejecutando búsqueda de facturas con:", searchTerm);
  };

  const handleOpenCreateModal = () => {
    setInvoiceToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setInvoiceToEdit(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (invoiceToEdit) {
        await invoiceService.update(invoiceToEdit.id, formData);
        alert("Factura actualizada exitosamente");
      } else {
        await invoiceService.create(formData);
        alert("Factura creada exitosamente");
      }
      await loadData();
      handleCloseFormModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMsg =
        error.response?.data?.detail || "Error al guardar la factura";
      alert(errorMsg);
    }
  };

  const handleMarkAsPaid = async (invoice) => {
    if (
      window.confirm(
        `¿Confirmar que la factura ID ${invoice.id} ha sido COBRADA?`
      )
    ) {
      try {
        await invoiceService.markAsPaid(invoice.id);
        alert("Factura marcada como cobrada");
        await loadData();
      } catch (error) {
        console.error("Error marking invoice as paid:", error);
        const errorMsg =
          error.response?.data?.detail || "Error al marcar como cobrada";
        alert(errorMsg);
      }
    }
  };

  const handleDelete = async (invoiceId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta factura?")) {
      try {
        await invoiceService.delete(invoiceId);
        alert("Factura eliminada exitosamente");
        await loadData();
      } catch (error) {
        console.error("Error deleting invoice:", error);
        const errorMsg =
          error.response?.data?.detail || "Error al eliminar la factura";
        alert(errorMsg);
      }
    }
  };

  // Función para exportar a CSV
  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    // Encabezados del CSV
    const headers = [
      "ID Factura",
      "ID Alquiler",
      "Cliente",
      "Vehículo",
      "Fecha Emisión",
      "Total",
      "Estado",
      "Método de Pago",
    ];

    // Filas de datos
    const rows = filteredInvoices.map((invoice) => {
      // Buscamos datos relacionados para completar el reporte
      const relatedRental = reservations.find((r) => r.id === invoice.rentalId);
      const issueDate = invoice.issuedDate || invoice.issueDate;
      const vehicleInfo =
        invoice.vehicleInfo || relatedRental?.vehicleName || "N/A";

      // Función auxiliar para escapar comillas y manejar nulos
      const escape = (value) => {
        const stringValue = String(value || "");
        if (stringValue.includes(",") || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      };

      return [
        escape(invoice.id),
        escape(invoice.rentalId),
        escape(invoice.clientName),
        escape(vehicleInfo),
        escape(formatDate(issueDate)),
        escape(invoice.total),
        escape(invoice.status),
        escape(invoice.paymentMethod),
      ].join(",");
    });

    // Unir todo en un string
    const csvContent = [headers.join(","), ...rows].join("\n");

    // Crear Blob y descargar
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `facturas_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenDetailModal = (invoice) => {
    const rental = reservations.find((r) => r.id === invoice.rentalId);
    setSelectedDetail({ invoice, rental });
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedDetail({ invoice: null, rental: null });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando facturas...</p>
        </div>
      </div>
    );
  }

  const columns = [
    { header: "ID", field: "id" },
    { header: "Cliente / Vehículo", field: "clientName" },
    { header: "Periodo / KM", field: "period" },
    { header: "Emisión", field: "issuedDate" },
    { header: "Total", field: "total", align: "right" },
    { header: "Estado", field: "status" },
  ];

  return (
    <section className="space-y-6">
      <header className="flex justify-between items-center pb-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de Facturación
        </h1>
        <div className="flex gap-3">
          <StyledPrimaryButton
            onClick={handleOpenCreateModal}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Factura</span>
          </StyledPrimaryButton>

          {/* Botón de Exportar con funcionalidad */}
          <StyledPrimaryButton
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="w-5 h-5" />
            <span>Exportar Datos</span>
          </StyledPrimaryButton>
        </div>
      </header>

      <div className="flex gap-6">
        <SearchBoxWithButton
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearchClick={handleSearchExecution}
          onOpenAdvancedFilters={() => setIsAdvancedFilterOpen((prev) => !prev)}
          showViewToggle={false}
          placeholder="Buscar por Cliente, ID Factura o ID Alquiler..."
        />
      </div>

      <div className="mt-6 flex gap-6">
        {isAdvancedFilterOpen && (
          <div className="w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-5 shrink-0 transition-all duration-300">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sliders className="w-5 h-5 text-gray-600" />
                Filtros de Factura
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
                Estado de Cobro:
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="pagada">Cobrada</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex-grow">
          <GenericTable
            columns={columns}
            data={filteredInvoices}
            emptyMessage="No se encontraron facturas que coincidan con los filtros."
          >
            {(invoice) => {
              const relatedRental = reservations.find(
                (r) => r.id === invoice.rentalId
              );

              const issueDate = invoice.issuedDate || invoice.issueDate;
              const vehicleInfo =
                invoice.vehicleInfo || relatedRental?.vehicleName || "N/A";
              const leasePeriod =
                invoice.leaseDates ||
                (relatedRental
                  ? `${formatDate(relatedRental.startDate)} - ${formatDate(
                      relatedRental.endDate
                    )}`
                  : "N/A");

              const startKm =
                relatedRental?.start_kilometers ||
                relatedRental?.kilometraje_inicio ||
                0;
              const endKm =
                relatedRental?.end_kilometers ||
                relatedRental?.kilometraje_fin ||
                (relatedRental?.status === "ALQUILADO" ? "En curso" : "---");

              return (
                <tr
                  key={invoice.id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      #{invoice.id}
                    </div>
                    <div className="text-xs text-gray-500">
                      Ref. Alq: {invoice.rentalId}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.clientName}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Car className="w-3 h-3" />
                      {vehicleInfo}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-800 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {leasePeriod}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Gauge className="w-3 h-3 text-gray-400" />
                      KM: {startKm} ➝ {endKm}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-800">
                      {formatDate(issueDate)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="text-sm font-extrabold text-gray-900">
                      {formatCurrency(parseFloat(invoice.total))}
                    </div>
                    <div className="text-xs text-gray-500">
                      {invoice.paymentMethod}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <InvoiceStatusBadge status={invoice.status} />
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenDetailModal(invoice)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Ver detalles"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      {(invoice.status === "pendiente" ||
                        invoice.status === "NO COBRADA") && (
                        <>
                          {/* Botón Editar eliminado como se solicitó */}

                          <button
                            onClick={() => handleMarkAsPaid(invoice)}
                            className="text-green-600 hover:text-green-800"
                            title="Marcar como cobrada"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Eliminar factura"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }}
          </GenericTable>
        </div>
      </div>

      <InvoiceDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        invoice={selectedDetail.invoice}
        rental={selectedDetail.rental}
      />

      <InvoiceFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        onSubmit={handleFormSubmit}
        invoiceToEdit={invoiceToEdit}
        rentalsList={reservations}
      />
    </section>
  );
}
