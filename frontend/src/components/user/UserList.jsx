import StyledActionButton from "../ui/StyledActionButton";
import { Edit, Trash2, Key, User } from "lucide-react";

export default function UserList({ users, onEdit, onDelete }) {
  const usersToRender = users ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Nombre de Usuario
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                Empleado Vinculado
              </th>
              <th scope="col" className="relative px-6 py-3 text-right">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usersToRender.map((user) => (
              <tr
                key={user.userId}
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-bold text-gray-900">
                      {user.username}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="text-sm text-gray-800">
                      {user.employeeName}
                    </span>
                    <span className="text-xs text-gray-500">
                      (ID: {user.employeeId})
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center gap-1">
                    {}
                    <StyledActionButton
                      onClick={() => onEdit(user)}
                      title="Modificar Contraseña"
                      colorClass="text-blue-600"
                      isIconOnly={true}
                    >
                      <Edit className="w-5 h-5" />
                    </StyledActionButton>
                    {}
                    <StyledActionButton
                      onClick={() => onDelete(user.userId)}
                      title="Eliminar Usuario"
                      colorClass="text-red-600"
                      isIconOnly={true}
                    >
                      <Trash2 className="w-5 h-5" />
                    </StyledActionButton>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {usersToRender.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No se encontraron usuarios.
        </div>
      )}
    </div>
  );
}
