import React from "react";

const ReservationStatusBadge = ({ status }) => {
  const statusMap = {
    RESERVADO: { text: "Reservado", color: "bg-indigo-100 text-indigo-800" },
    ALQUILADO: { text: "Alquilado", color: "bg-blue-100 text-blue-800" },
    INICIADO: { text: "En Curso", color: "bg-green-100 text-green-800" },
    FINALIZADO: { text: "Finalizado", color: "bg-gray-100 text-gray-800" },
    CANCELADO: { text: "Cancelado", color: "bg-red-100 text-red-800" },
  };

  const { text, color } = statusMap[status] || {
    text: status,
    color: "bg-yellow-100 text-yellow-800",
  };

  return (
    <span
      className={`px-2.5 py-0.5 inline-flex text-xs font-semibold rounded-full ${color}`}
    >
      {text}
    </span>
  );
};

export default ReservationStatusBadge;
