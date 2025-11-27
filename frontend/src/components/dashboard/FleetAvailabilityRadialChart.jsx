import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function FleetAvailabilityRadialChart({ kpis }) {
  const total = kpis.totalVehicles;
  const availablePercent =
    total > 0 ? Math.round((kpis.availableVehicles / total) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xl lg:col-span-2">
      <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
        Disponibilidad Operativa de Flota
      </h3>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={[
                { name: "Disponible", value: availablePercent },
                {
                  name: "Alquilado/Mantenimiento",
                  value: 100 - availablePercent,
                },
              ]}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={100}
              startAngle={90}
              endAngle={-270}
              paddingAngle={-20}
            >
              <Cell fill="#0A74DA" />
              <Cell fill="#F3F4F6" />
            </Pie>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-4xl font-extrabold"
              fill="#1f2937"
            >
              {availablePercent}%
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-center text-gray-600 mt-2">
        {kpis.availableVehicles} de {total} unidades listas.
      </p>
    </div>
  );
}
