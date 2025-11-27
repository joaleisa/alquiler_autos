import { X } from "lucide-react";
import { useState, useEffect } from "react";

const FormInput = ({ label, id, ...props }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <input
      id={id}
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

const FormSelect = ({ label, id, children, ...props }) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 mb-1"
    >
      {label}
    </label>
    <select
      id={id}
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      {children}
    </select>
  </div>
);

export default function FinishRentalModal({
  isOpen,
  onClose,
  onSubmit,
  rentalToFinish,
}) {
  const [finalMileage, setFinalMileage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Tarjeta de Crédito");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setFinalMileage("");
      setPaymentMethod("Tarjeta de Crédito");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen || !rentalToFinish) return null;

  const { id, vehicleName, kilometraje_inicio } = rentalToFinish;

  const handleSubmit = (e) => {
    e.preventDefault();

    const kmFin = parseFloat(finalMileage);
    const kmInicio = parseFloat(kilometraje_inicio);

    if (!kmFin || kmFin <= kmInicio) {
      setError(
        `El kilometraje final debe ser mayor que el inicial (${kmInicio.toLocaleString(
          "es-AR"
        )} km).`
      );
      return;
    }

    setError("");
    onSubmit({
      rentalId: id,
      kilometraje_fin: kmFin,
      metodo_pago: paymentMethod,
      status: "FINALIZADO",
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-lg rounded-lg shadow-xl z-50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex justify-between items-center p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Finalizar Alquiler
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {}
            <FormInput
              label="Vehículo"
              id="vehicleName"
              type="text"
              value={vehicleName}
              readOnly
              className="w-full px-3 py-2 border-gray-300 rounded-lg bg-gray-100"
            />
            <FormInput
              label="Kilometraje Inicial"
              id="km_inicio"
              type="text"
              value={`${kilometraje_inicio.toLocaleString("es-AR")} km`}
              readOnly
              className="w-full px-3 py-2 border-gray-300 rounded-lg bg-gray-100"
            />

            <hr className="my-2" />

            {}
            <FormInput
              label="Kilometraje Final (Devolución)"
              id="kilometraje_fin"
              name="kilometraje_fin"
              type="number"
              value={finalMileage}
              onChange={(e) => setFinalMileage(e.target.value)}
              placeholder="Ingrese el kilometraje actual del odómetro"
              required
            />

            <FormSelect
              label="Método de Pago (para Factura)"
              id="metodo_pago"
              name="metodo_pago"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
              <option value="Tarjeta de Débito">Tarjeta de Débito</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
            </FormSelect>

            {}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <footer className="flex justify-end gap-3 p-5 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700"
            >
              Finalizar y Generar Factura
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
