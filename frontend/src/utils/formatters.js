export const formatCurrency = (amount) => {
  if (typeof amount === "number") {
    return `$${amount.toLocaleString("es-AR", { minimumFractionDigits: 2 })}`;
  }
  return "N/A";
};

export const formatDate = (
  dateString,
  options = { year: "numeric", month: "2-digit", day: "2-digit" }
) => {
  if (!dateString) return "N/A";

  const fullOptions =
    dateString.includes("T") && dateString.length > 10
      ? { ...options, hour: "2-digit", minute: "2-digit" }
      : options;
  try {
    return new Date(dateString).toLocaleString("es-AR", fullOptions);
  } catch (e) {
    return "Fecha Inválida";
  }
};
