import React from "react";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MaintenanceAlertWidget() {
  const navigate = useNavigate();

  const alerts = [
    {
      id: 1,
      vehicle: "VW Golf",
      km: "61,000",
      message: "Mantenimiento correctivo pendiente.",
    },
    {
      id: 2,
      vehicle: "Fiat Cronos",
      km: "22,000",
      message: "Próximo service preventivo (Km 24k).",
    },
  ];

  const handleClick = () => {
    navigate("/mantenimiento", {
      state: {
        filter: "PENDIENTE",
        message:
          "Mostrando vehículos con mantenimiento preventivo o correctivo pendiente.",
      },
    });
  };

  return (
    <div
      className="bg-white p-5 rounded-xl border border-yellow-300 shadow-lg lg:col-span-1 cursor-pointer transition-shadow hover:shadow-yellow-300/60"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600" />
          <h3 className="font-bold text-lg text-gray-900">
            Alertas de Mantenimiento ({alerts.length})
          </h3>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="text-sm border-l-4 border-yellow-500 pl-3"
          >
            <p className="font-semibold text-gray-800">
              {alert.vehicle} ({alert.km} km)
            </p>
            <p className="text-xs text-gray-600">{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
