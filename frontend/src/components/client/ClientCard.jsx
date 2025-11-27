import { Mail, Phone, Hash, Edit, Trash2 } from "lucide-react";
import StyledActionButton from "../ui/StyledActionButton";

const StatusBadge = ({ status }) => {
  const isActive = status === "activo";
  return (
    <span
      className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
        isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {status}
    </span>
  );
};

export default function ClientCard({ client, onEdit, onDelete }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] transform">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 text-white flex items-center justify-center font-extrabold text-xl shadow-lg">
            {client.name.charAt(0)}
          </div>
          <h3 className="text-xl font-extrabold text-gray-900 leading-snug">
            {client.name}
          </h3>
        </div>
        <StatusBadge status={client.status} />
      </div>

      <div className="space-y-3 my-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Hash className="w-4 h-4 text-gray-500" />
          <span className="font-semibold">DNI: {client.dni}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Mail className="w-4 h-4 text-gray-500" />
          <span className="truncate">{client.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Phone className="w-4 h-4 text-gray-500" />
          <span>{client.phone}</span>
        </div>
      </div>

      {}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        {}
        <button
          onClick={() => onEdit(client)}
          title="Modificar Cliente"
          className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg font-medium transition-colors hover:bg-blue-700 hover:shadow-md"
        >
          <Edit className="w-4 h-4" />
          Editar
        </button>

        {}
        <button
          onClick={() => onDelete(client.id)}
          title="Eliminar Cliente"
          className="flex items-center gap-2 px-4 py-2 text-sm border border-red-400 text-red-600 rounded-lg font-medium transition-colors hover:bg-red-50 hover:border-red-600 hover:shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar
        </button>
      </div>
    </div>
  );
}
