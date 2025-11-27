import ReservationStatusBadge from "./ReservationStatusBadge";
import StyledActionButton from "../ui/StyledActionButton";
import { Edit, Trash2, Eye, PlayCircle, CheckCircle } from "lucide-react";

export default function ReservationList({
  reservations,
  onStart,
  onFinish,
  onEdit,
  onDelete,
}) {
  const formatCurrency = (amount) => {
    if (typeof amount === "number") {
      return `$${amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
    }
    return "N/A";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                # Reserva
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Cliente / Vehículo
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Período
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Monto Total
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Estado
              </th>
              <th scope="col" className="relative px-6 py-3 text-right">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservations.map((res) => (
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
                  <div className="text-sm text-gray-500">{res.vehicleName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-800">
                    {res.startDate.slice(0, 10)} — {res.endDate.slice(0, 10)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-extrabold text-gray-900">
                    {formatCurrency(res.total)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ReservationStatusBadge status={res.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center gap-1">
                    {}
                    {(res.status === "ALQUILADO" ||
                      res.status === "INICIADO") && (
                      <StyledActionButton
                        onClick={() => onFinish(res)}
                        title="Finalizar Alquiler"
                        colorClass="text-green-600"
                        isIconOnly={true}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </StyledActionButton>
                    )}

                    {}
                    {res.status === "RESERVADO" && (
                      <StyledActionButton
                        onClick={() => onStart(res)}
                        title="Iniciar Alquiler (Confirmar)"
                        colorClass="text-blue-600"
                        isIconOnly={true}
                      >
                        <PlayCircle className="w-5 h-5" />
                      </StyledActionButton>
                    )}

                    {}
                    {(res.status === "RESERVADO" ||
                      res.status === "CANCELADO") && (
                      <StyledActionButton
                        onClick={() => onEdit(res)}
                        title="Ver/Modificar Reserva"
                        colorClass="text-indigo-600"
                        isIconOnly={true}
                      >
                        <Eye className="w-5 h-5" />
                      </StyledActionButton>
                    )}

                    {}
                    {res.status !== "FINALIZADO" && (
                      <StyledActionButton
                        onClick={() => onDelete(res.id)}
                        title="Cancelar Reserva"
                        colorClass="text-red-600"
                        isIconOnly={true}
                      >
                        <Trash2 className="w-5 h-5" />
                      </StyledActionButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {reservations.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No se encontraron reservas.
        </div>
      )}
    </div>
  );
}
