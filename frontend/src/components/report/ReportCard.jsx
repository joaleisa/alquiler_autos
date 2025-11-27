import React from "react";
import { TrendingUp, TrendingDown, Info, Download } from "lucide-react";

const PROGRESS_BAR_COLOR = "bg-blue-500";

export default function ReportCard({
  title,
  subtitle,
  metrics = [],
  progressValue = 0,
  progressLabel = "Progreso",
  details = [],
}) {
  const isPositiveTrend = progressValue >= 50;

  return (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 space-y-4 relative overflow-hidden">
      {}
      <div className="absolute top-4 right-4 text-gray-300">
        <Info className="w-6 h-6" />
      </div>

      {}
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>

      {}
      <div className="grid grid-cols-2 gap-4 border-b border-gray-100 pb-4">
        {metrics.map((metric, index) => (
          <div key={index} className="text-center">
            <p className="text-sm text-gray-500">{metric.label}</p>
            <p className="text-xl font-extrabold text-gray-900">
              {metric.value}
            </p>
          </div>
        ))}
      </div>

      {}
      <div className="w-full pt-2">
        <p className="text-xs text-gray-500 mb-1">
          {progressLabel}{" "}
          <span className="font-semibold text-gray-800">{progressValue}%</span>
        </p>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`${PROGRESS_BAR_COLOR} h-full transition-all duration-500 ease-out`}
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>

      {}
      <div className="flex items-center text-sm pt-2">
        {isPositiveTrend ? (
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
        )}
        <span
          className={`${
            isPositiveTrend ? "text-green-600" : "text-red-600"
          } font-medium`}
        >
          {isPositiveTrend ? "+XX%" : "-XX%"}
        </span>
        <span className="text-gray-500 ml-1">vs Período Anterior</span>
      </div>

      {}
      {details.length > 0 && (
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-2">Elementos:</p>
          <ul className="text-xs text-gray-600 space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
            {details.map((detail, index) => (
              <li key={index} className="flex justify-between items-center">
                <span>{detail.label}</span>
                <span className="font-medium">{detail.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
