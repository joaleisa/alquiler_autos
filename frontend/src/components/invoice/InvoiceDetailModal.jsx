import {
  X,
  Printer,
  Car,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
} from "lucide-react";

const formatDate = (
  dateString,
  options = { year: "numeric", month: "2-digit", day: "2-digit" }
) => {
  if (!dateString) return "N/A";
  const fullOptions = dateString.includes("T")
    ? { ...options, hour: "2-digit", minute: "2-digit" }
    : options;
  return new Date(dateString).toLocaleString("es-AR", fullOptions);
};

const DetailRow = ({ label, value, className = "" }) => (
  <div
    className={`flex justify-between py-2 border-b border-gray-100 ${className}`}
  >
    <span className="text-sm font-medium text-gray-600">{label}</span>
    <span className="text-sm font-semibold text-gray-900 text-right">
      {value}
    </span>
  </div>
);

export default function InvoiceDetailModal({
  isOpen,
  onClose,
  invoice,
  rental,
}) {
  if (!isOpen || !invoice) return null;

  // 1. Normalización de datos
  const {
    id,
    total,
    paymentMethod,
    status,
    // Nuevos campos del backend
    incidents = [],
    leaseAmount = 0,
    incidentsTotal = 0,
  } = invoice;

  const issueDate = invoice.issuedDate || invoice.issueDate;

  const clientName = invoice.clientName || rental?.clientName || "N/A";
  const vehicleName = invoice.vehicleInfo || rental?.vehicleName || "N/A";

  const start = rental?.startDate || rental?.date_time_start;
  const end = rental?.endDate || rental?.date_time_end;
  const period =
    start && end
      ? `${formatDate(start)} - ${formatDate(end)}`
      : invoice.leaseDates || "N/A";

  const kmStart = rental?.start_kilometers ?? rental?.kilometraje_inicio;
  const kmEnd = rental?.end_kilometers ?? rental?.kilometraje_fin;

  // Helper para formatear moneda
  const formatMoney = (val) =>
    `$${parseFloat(val || 0).toLocaleString("es-AR", {
      minimumFractionDigits: 2,
    })}`;

  return (
    <>
      {/* --- MODAL VISUAL (Se oculta al imprimir) --- */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 print:hidden"
        onClick={onClose}
      >
        <div
          className="bg-white w-full max-w-2xl rounded-lg shadow-xl z-50 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <header className="flex justify-between items-center p-5 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Detalle de Factura
              </h2>
              <p className="text-sm text-gray-500">Factura ID: {id}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </header>

          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Resumen</h3>
              <DetailRow label="Estado" value={status} />
              <DetailRow
                label="Fecha de Emisión"
                value={formatDate(issueDate)}
              />
              <DetailRow label="Método de Pago" value={paymentMethod} />
            </div>

            {/* Tabla de Desglose de Costos */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Desglose de Conceptos
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <DetailRow
                  label="Costo Base Alquiler"
                  value={formatMoney(
                    leaseAmount > 0 ? leaseAmount : total - incidentsTotal
                  )}
                />

                {incidents.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">
                      Incidentes / Adicionales
                    </p>
                    {incidents.map((inc, idx) => (
                      <DetailRow
                        key={idx}
                        label={`${inc.type}: ${inc.description}`}
                        value={formatMoney(inc.cost)}
                        className="py-1 text-xs border-none"
                      />
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-gray-300">
                  <span className="text-base font-bold text-gray-800">
                    Total a Pagar
                  </span>
                  <span className="text-xl font-extrabold text-blue-600">
                    {formatMoney(total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Información del Vehículo
              </h3>
              <DetailRow label="Cliente" value={clientName} />
              <DetailRow label="Vehículo" value={vehicleName} />
              <DetailRow label="Período" value={period} />
              <DetailRow
                label="Kilometraje"
                value={`${kmStart || "?"} km → ${kmEnd || "?"} km`}
              />
            </div>
          </div>

          <footer className="flex justify-end gap-3 p-5 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700"
            >
              <Printer className="w-5 h-5" />
              Imprimir Factura
            </button>
          </footer>
        </div>
      </div>

      {/* --- DISEÑO DE IMPRESIÓN (FACTURA A4) --- */}
      <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[9999] print:p-12 font-sans text-gray-800">
        {/* Header Factura */}
        <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
              FACTURA
            </h1>
            <div className="flex items-center gap-2 text-gray-600">
              <Car className="w-5 h-5" />
              <span className="font-bold text-lg">RentApp S.A.</span>
            </div>
            <div className="text-sm text-gray-500 space-y-0.5 pl-7">
              <p>Av. Siempre Viva 123</p>
              <p>Córdoba, Argentina</p>
              <p>CUIT: 30-12345678-9</p>
            </div>
          </div>

          <div className="text-right space-y-2">
            <div>
              <p className="text-sm text-gray-500 uppercase font-bold">
                Factura N°
              </p>
              <p className="text-2xl font-mono text-gray-900">
                {String(id).padStart(8, "0")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 uppercase font-bold">Fecha</p>
              <p className="text-gray-900">{formatDate(issueDate)}</p>
            </div>
          </div>
        </div>

        {/* Info Cliente */}
        <div className="flex justify-between mb-10">
          <div className="w-1/2">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Facturar a
            </h3>
            <p className="text-xl font-bold text-gray-900">{clientName}</p>
            <p className="text-gray-600 text-sm mt-1">
              Condición de Pago: {paymentMethod}
            </p>
          </div>
          <div className="w-1/2 text-right">
            <div
              className={`inline-block px-4 py-1 rounded border-2 ${
                status === "COBRADA" || status === "pagada"
                  ? "border-green-600 text-green-800 font-bold"
                  : "border-gray-300 text-gray-500"
              }`}
            >
              {status ? status.toUpperCase() : "PENDIENTE"}
            </div>
          </div>
        </div>

        {/* Tabla de Items */}
        <table className="w-full mb-8">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Concepto
              </th>
              <th className="text-right py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Importe
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* Item Alquiler */}
            <tr>
              <td className="py-4 px-4 text-gray-800">
                <span className="font-bold">Servicio de Alquiler</span>
                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                  <p>{vehicleName}</p>
                  <p>Período: {period}</p>
                  <p>Ref. Interna #{rental?.id || "N/A"}</p>
                </div>
              </td>
              <td className="py-4 px-4 text-right text-gray-800 font-medium align-top">
                {formatMoney(
                  leaseAmount > 0 ? leaseAmount : total - incidentsTotal
                )}
              </td>
            </tr>

            {/* Items Incidentes */}
            {incidents.map((inc, idx) => (
              <tr key={idx}>
                <td className="py-4 px-4 text-gray-800">
                  <span className="font-bold text-orange-700">{inc.type}</span>
                  <p className="text-xs text-gray-500 mt-1">
                    {inc.description}
                  </p>
                </td>
                <td className="py-4 px-4 text-right text-gray-800 font-medium align-top">
                  {formatMoney(inc.cost)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="flex justify-end border-t-2 border-gray-800 pt-6">
          <div className="w-1/2 max-w-xs space-y-3">
            <div className="flex justify-between items-center text-2xl font-bold text-gray-900 pt-2">
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>
          </div>
        </div>

        {/* Footer Factura */}
        <div className="fixed bottom-12 left-12 right-12 text-center border-t border-gray-100 pt-8">
          <p className="text-gray-500 text-sm mb-2">
            ¡Gracias por elegir RentApp!
          </p>
          <div className="flex justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3" /> +54 351 123 4567
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> facturacion@rentapp.com
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Córdoba, ARG
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
