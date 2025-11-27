import React, { useMemo } from "react";
import {
  ComposedChart, // Cambiado de BarChart a ComposedChart para mezclar tipos
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function QuarterlyRentalsChart({ data = [] }) {
  // Procesar datos mensuales a trimestrales acumulando Total ($) y Cantidad (#)
  const quarterlyData = useMemo(() => {
    const quarters = {
      Q1: { total: 0, count: 0 },
      Q2: { total: 0, count: 0 },
      Q3: { total: 0, count: 0 },
      Q4: { total: 0, count: 0 },
    };

    data.forEach((item) => {
      const { month, total, count } = item;
      const numCount = count || 0; // Asegurar número

      if (["Ene", "Feb", "Mar"].includes(month)) {
        quarters.Q1.total += total;
        quarters.Q1.count += numCount;
      } else if (["Abr", "May", "Jun"].includes(month)) {
        quarters.Q2.total += total;
        quarters.Q2.count += numCount;
      } else if (["Jul", "Ago", "Sep"].includes(month)) {
        quarters.Q3.total += total;
        quarters.Q3.count += numCount;
      } else if (["Oct", "Nov", "Dic"].includes(month)) {
        quarters.Q4.total += total;
        quarters.Q4.count += numCount;
      }
    });

    return [
      { quarter: "Q1", total: quarters.Q1.total, count: quarters.Q1.count },
      { quarter: "Q2", total: quarters.Q2.total, count: quarters.Q2.count },
      { quarter: "Q3", total: quarters.Q3.total, count: quarters.Q3.count },
      { quarter: "Q4", total: quarters.Q4.total, count: quarters.Q4.count },
    ];
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xl lg:col-span-2">
      <h3 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">
        Rendimiento Trimestral (Ingresos vs. Alquileres)
      </h3>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <ComposedChart
            data={quarterlyData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f3f4f6"
            />

            <XAxis dataKey="quarter" stroke="#9ca3af" fontSize={12} />

            {/* Eje Izquierdo para Dinero */}
            <YAxis
              yAxisId="left"
              stroke="#FFC74F"
              fontSize={12}
              orientation="left"
              tickFormatter={(val) => `$${val}`}
            />

            {/* Eje Derecho para Cantidad */}
            <YAxis
              yAxisId="right"
              stroke="#0A74DA"
              fontSize={12}
              orientation="right"
              allowDecimals={false}
            />

            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "14px",
              }}
              formatter={(value, name) => {
                if (name === "Ingresos")
                  return [`$ ${value.toLocaleString("es-AR")}`, name];
                return [`${value} un.`, name];
              }}
            />

            <Legend wrapperStyle={{ paddingTop: "10px" }} />

            {/* Barra de Ingresos vinculada al eje izquierdo */}
            <Bar
              yAxisId="left"
              dataKey="total"
              name="Ingresos"
              fill="#FFC74F"
              radius={[4, 4, 0, 0]}
              barSize={40}
            />

            {/* Línea de Cantidad vinculada al eje derecho */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="count"
              name="Cant. Alquileres"
              stroke="#0A74DA"
              strokeWidth={3}
              dot={{ r: 4, fill: "#0A74DA", strokeWidth: 2, stroke: "#fff" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
