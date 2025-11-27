import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const BAR_COLOR = "#0A74DA";

export default function InventoryBarChart({ data = [] }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xl lg:col-span-2">
      <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
        Distribución de Flota (Por Marca)
      </h3>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <XAxis
              dataKey="name"
              stroke="#9ca3af"
              fontSize={12}
              tick={{ fill: "#6b7280" }}
            />
            <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
            <Tooltip
              cursor={{ fill: "#f9fafb" }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
              formatter={(value) => [`${value} Unidades`, "Cantidad"]}
            />
            <Bar
              dataKey="count"
              name="Unidades"
              fill={BAR_COLOR}
              radius={[4, 4, 0, 0]}
              barSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
