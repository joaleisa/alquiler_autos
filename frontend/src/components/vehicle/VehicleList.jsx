import VehicleCard from "./VehicleCard";
import { Edit, Trash2 } from "lucide-react";

// Badge simple para la tabla
const TableStatusBadge = ({ status }) => {
  const statusText = {
    disponible: "Disponible",
    en_mantenimiento: "Mantenimiento",
    no_disponible: "No Disponible",
    baja: "Baja",
  };
  const statusColor = {
    disponible: "bg-green-100 text-green-800",
    en_mantenimiento: "bg-yellow-100 text-yellow-800",
    no_disponible: "bg-red-100 text-red-800",
    baja: "bg-gray-100 text-gray-800",
  };
  const normalizedStatus = status ? status.toLowerCase() : "no_disponible";

  return (
    <span
      className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${
        statusColor[normalizedStatus] || "bg-gray-100 text-gray-800"
      }`}
    >
      {statusText[normalizedStatus] || status}
    </span>
  );
};

export default function VehicleList({ vehicles, view, onEdit, onDelete }) {
  if (view === "grid") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-1">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            onEdit={onEdit}
            onDelete={(id) => {
              // Validación para Grid View
              if (vehicle.estado?.toLowerCase() === "disponible") {
                onDelete(id);
              } else {
                alert(
                  "No se puede dar de baja: El vehículo no está disponible (tiene reservas o está en mantenimiento)."
                );
              }
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Vehículo
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Patente
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Estado
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Kilometraje
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Precio /día
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vehicles.map((vehicle) => {
              const isDeletable =
                vehicle.estado?.toLowerCase() === "disponible";

              return (
                <tr
                  key={vehicle.id}
                  className="hover:bg-gray-50 transition-colors duration-150 group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        className="w-12 h-12 object-cover rounded-lg bg-gray-200 shadow-sm"
                        src={
                          vehicle.thumbnail ||
                          "https://via.placeholder.com/150x100?text=Car-doba"
                        }
                        alt={`${vehicle.brand} ${vehicle.model}`}
                      />
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {vehicle.brand} {vehicle.model}
                        </div>
                        <div className="text-xs text-gray-500">
                          {vehicle.year} • {vehicle.transmission}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded w-fit">
                      {vehicle.patente}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <TableStatusBadge status={vehicle.estado} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">
                      {vehicle.kilometraje_actual.toLocaleString("es-AR")} km
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-bold text-green-600">
                      ${vehicle.pricePerDay}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(vehicle)}
                        className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => isDeletable && onDelete(vehicle.id)}
                        className={`p-1 rounded transition-colors ${
                          isDeletable
                            ? "text-red-600 hover:text-red-900 hover:bg-red-50"
                            : "text-gray-300 cursor-not-allowed"
                        }`}
                        title={
                          isDeletable
                            ? "Dar de Baja"
                            : "No se puede dar de baja: El vehículo no está disponible"
                        }
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
