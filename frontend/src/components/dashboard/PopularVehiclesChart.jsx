import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

const HIGHLIGHT_COLOR = "#0A74DA";
const PIE_COLORS = ["#4ECDC4", "#FF6B6B", "#FFC74F", "#0A74DA", "#A463F2"];

export default function PopularVehiclesChart({
  data,
  onSegmentClick,
  activeSegment,
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xl col-span-1">
      <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
        Top Vehículos Alquilados
      </h3>
      <div style={{ width: "100%", height: 180 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="value" // CORRECCIÓN: Cambiado de "rentals" a "value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={60}
              paddingAngle={5}
            >
              {data.map((entry, index) => {
                const isActive = entry.name === activeSegment;
                const color = PIE_COLORS[index % PIE_COLORS.length];

                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isActive ? HIGHLIGHT_COLOR : color}
                    fillOpacity={isActive ? 1.0 : 0.7}
                    stroke={isActive ? HIGHLIGHT_COLOR : "none"}
                    strokeWidth={isActive ? 3 : 1}
                    onClick={() => onSegmentClick(entry, index)}
                    style={{ cursor: "pointer" }}
                  />
                );
              })}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
              formatter={(value, name, props) => [
                `${value} alquileres`,
                props.payload.name,
              ]}
            />
            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
