import React from "react";

export default function KpiCard({
  title,
  value,
  icon: Icon,
  unit = "",
  color = "bg-blue-600",
  onClick,
  isActive = false,
}) {
  const isPositive =
    title === "Facturación Total" || title === "Clientes Activos";
  const delta = isPositive ? "" : "";

  const activeClass = isActive
    ? "ring-4 ring-offset-2 ring-blue-400/70 border-blue-600"
    : "border-gray-100";

  return (
    <div
      className={`bg-white p-5 rounded-xl border-2 shadow-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-blue-200/50 cursor-pointer ${activeClass}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${color} text-white shadow-lg`}>
          <Icon className="w-7 h-7" />
        </div>
        <div
          className={`text-sm font-semibold ${
            isPositive ? "text-green-500" : "text-red-500"
          }`}
        >
          {delta}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-extrabold text-gray-900 mt-1">
          {unit}
          {value.toLocaleString("es-AR")}
        </p>
      </div>
    </div>
  );
}
