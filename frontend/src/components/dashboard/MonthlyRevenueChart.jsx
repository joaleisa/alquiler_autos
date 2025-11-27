import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Brush,
} from "recharts";

const AREA_GRADIENT_STOP_COLOR = "#4ECDC4";

const CustomDot = (props) => {
  const { cx, cy, stroke, payload, index, onClick } = props;

  if (!cx || !cy) return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={5}
      stroke={stroke}
      fill="#0A74DA"
      cursor="pointer"
      onClick={() => onClick(payload, index)}
      onMouseEnter={(e) => e.target.setAttribute("r", 8)}
      onMouseLeave={(e) => e.target.setAttribute("r", 5)}
    />
  );
};

export default function MonthlyRevenueChart({
  data,
  onDataPointClick,
  onRangeSelected,
}) {
  const handleBrushChange = ({ startIndex, endIndex }) => {
    if (onRangeSelected) {
      const startMonth = data[startIndex].month;
      const endMonth = data[endIndex].month;

      onRangeSelected(startMonth, endMonth);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xl col-span-1 lg:col-span-2">
      <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
        Facturación Mensual Histórica (Arrastre para Seleccionar Periodo)
      </h3>
      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <AreaChart
            data={data}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={AREA_GRADIENT_STOP_COLOR}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={AREA_GRADIENT_STOP_COLOR}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
            <YAxis
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
            />
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
              labelStyle={{ fontWeight: "bold" }}
              formatter={(value) => [
                `$${value.toLocaleString("es-AR")}`,
                "Monto",
              ]}
            />

            {}
            <Brush
              dataKey="month"
              height={25}
              stroke="#0A74DA"
              fill="#F0F8FF"
              travellerWidth={10}
              onChange={handleBrushChange}
            />

            {}
            <Area
              type="monotone"
              dataKey="total"
              stroke={AREA_GRADIENT_STOP_COLOR}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              strokeWidth={3}
            />
            {}
            <Area
              type="monotone"
              dataKey="total"
              stroke={AREA_GRADIENT_STOP_COLOR}
              strokeWidth={3}
              fill="none"
              dot={<CustomDot onClick={onDataPointClick} />}
            />

            <Legend wrapperStyle={{ fontSize: "12px" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
