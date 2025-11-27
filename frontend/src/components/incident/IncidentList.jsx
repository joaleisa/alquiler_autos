import StyledActionButton from "../ui/StyledActionButton";
import { Edit, Trash2, AlertCircle } from "lucide-react";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Date(dateString).toLocaleDateString("es-AR", options);
};

const TypeBadge = ({ type }) => {
  // Normalización para evitar errores con mayúsculas/minúsculas
  const isDamage = type && type.toLowerCase().includes("daño");
  return (
    <span
      className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${
        isDamage ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
      }`}
    >
      {type}
    </span>
  );
};

// CORRECCIÓN: Función robusta que acepta strings numéricos
const formatCurrency = (amount) => {
  const num = parseFloat(amount);
  if (!isNaN(num)) {
    return `$${num.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return "$0,00";
};

export default function IncidentList({ incidents, onEdit, onDelete }) {
  const incidentsToRender = incidents ?? [];

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
                Alquiler / Cliente
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Detalle del Incidente
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Tipo
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Costo
              </th>
              <th scope="col" className="relative px-6 py-3 text-right">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {incidentsToRender.map((incident) => (
              <tr
                key={incident.id}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {incident.clientName}
                  </div>
                  <div className="text-xs text-gray-500">
                    Alquiler ID: {incident.rentalId}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {incident.vehicleName}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">
                    {incident.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TypeBadge type={incident.type} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-extrabold text-gray-900">
                    {formatCurrency(incident.cost)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center gap-1">
                    <StyledActionButton
                      onClick={() => onEdit(incident)}
                      title="Ver/Modificar Incidente"
                      colorClass="text-blue-600"
                      isIconOnly={true}
                    >
                      <Edit className="w-5 h-5" />
                    </StyledActionButton>
                    <StyledActionButton
                      onClick={() => onDelete(incident.id)}
                      title="Eliminar Registro"
                      colorClass="text-red-600"
                      isIconOnly={true}
                    >
                      <Trash2 className="w-5 h-5" />
                    </StyledActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {incidentsToRender.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No se encontraron incidentes registrados.
        </div>
      )}
    </div>
  );
}
