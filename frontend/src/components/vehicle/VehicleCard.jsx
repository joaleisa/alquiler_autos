import { Truck, DollarSign, Gauge, Edit, Trash2 } from "lucide-react";

const VehicleStatusBadge = ({ status }) => {
  const statusText = {
    disponible: "Disponible",
    en_mantenimiento: "Mantenimiento",
    no_disponible: "No Disponible",
    baja: "Baja",
  };
  const statusColor = {
    disponible: "bg-green-600",
    en_mantenimiento: "bg-yellow-600",
    no_disponible: "bg-red-600",
    baja: "bg-gray-600",
  };

  // Normalización para evitar errores si viene en mayúsculas
  const normalizedStatus = status ? status.toLowerCase() : "no_disponible";

  return (
    <span
      className={`px-2 py-0.5 text-xs font-semibold rounded-full text-white ${
        statusColor[normalizedStatus] || "bg-gray-500"
      }`}
    >
      {statusText[normalizedStatus] || status}
    </span>
  );
};

export default function VehicleCard({ vehicle, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl transform hover:scale-[1.01] group relative">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={
            vehicle.thumbnail ||
            "https://via.placeholder.com/600x400?text=Car-doba"
          }
          alt={vehicle.model}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4 flex flex-col justify-end">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-lg font-bold text-white leading-tight shadow-sm">
                {vehicle.brand} {vehicle.model}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-white/90">
                <Truck className="w-3.5 h-3.5" />
                <p className="text-xs font-mono">{vehicle.patente}</p>
              </div>
            </div>
            <VehicleStatusBadge status={vehicle.estado} />
          </div>
        </div>

        {/* Actions Overlay (Visible on Hover) */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(vehicle);
            }}
            className="p-2 bg-white/90 text-blue-600 rounded-full shadow-lg hover:bg-blue-50 transition-colors backdrop-blur-sm"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(vehicle.id);
            }}
            className="p-2 bg-white/90 text-red-600 rounded-full shadow-lg hover:bg-red-50 transition-colors backdrop-blur-sm"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Details Footer */}
      <div className="p-4 flex justify-between items-center bg-white border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
          <Gauge className="w-4 h-4 text-blue-500" />
          <span>{vehicle.kilometraje_actual?.toLocaleString("es-AR")} km</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="text-lg font-bold text-gray-900">
            {vehicle.pricePerDay}
          </span>
          <span className="text-xs text-gray-500">/día</span>
        </div>
      </div>
    </div>
  );
}
