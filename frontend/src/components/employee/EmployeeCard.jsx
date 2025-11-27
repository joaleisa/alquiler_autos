import { Mail, Phone, Briefcase, Edit, Trash2, Hash } from "lucide-react";

const EmployeeAvatar = ({ name }) => {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "EM";
  return (
    <div className="size-12 rounded-full bg-gradient-to-br from-orange-600 to-amber-500 text-white flex items-center justify-center font-extrabold text-xl shadow-lg">
      {initials.slice(0, 2)}
    </div>
  );
};

export default function EmployeeCard({ employee, onEdit, onDelete }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] transform">
      {}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <EmployeeAvatar name={employee.name} />
          <div>
            <p className="text-xl font-extrabold text-gray-900 leading-snug">
              {employee.name}
            </p>
            <p className="text-xs text-gray-500">{employee.cargo}</p>
          </div>
        </div>
        {}
        {employee.dni && (
          <div className="text-xs font-semibold text-gray-500 mt-1 p-1 px-2 rounded bg-gray-100">
            DNI: {employee.dni}
          </div>
        )}
      </div>

      {}
      <div className="space-y-3 my-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Briefcase className="w-4 h-4 text-gray-500" />
          <span className="font-semibold">{employee.cargo}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Mail className="w-4 h-4 text-gray-500" />
          <span className="truncate">{employee.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Phone className="w-4 h-4 text-gray-500" />
          <span>{employee.phone}</span>
        </div>
      </div>

      {}
      <div className="flex justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          onClick={() => onEdit(employee)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-blue-600 border border-blue-200 rounded-lg font-medium transition hover:bg-blue-600 hover:text-white"
          title="Modificar Empleado"
        >
          <Edit className="w-4 h-4" />
          Editar
        </button>
        <button
          onClick={() => onDelete(employee.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 border border-red-200 rounded-lg font-medium transition hover:bg-red-600 hover:text-white"
          title="Eliminar Empleado"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar
        </button>
      </div>
    </div>
  );
}
