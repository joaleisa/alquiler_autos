import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LogOut, Key, Briefcase, Mail, Phone, Hash, Car } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  ClipboardList,
  Wrench,
  AlertTriangle,
  DollarSign,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Vehículos", icon: Car, path: "/vehiculos" },
  // { name: "Reservas", icon: CalendarCheck, path: "/reservas" },
  { name: "Clientes", icon: Users, path: "/clientes" },
  { name: "Alquileres", icon: ClipboardList, path: "/alquileres" },
  { name: "Mantenimiento", icon: Wrench, path: "/mantenimiento" },
  { name: "Incidentes", icon: AlertTriangle, path: "/incidentes" },
  { name: "Facturación", icon: DollarSign, path: "/facturacion" },
  { name: "Empleados", icon: Briefcase, path: "/empleados" },
  { name: "Usuarios", icon: Key, path: "/usuarios" },
];

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center space-x-3 py-1.5 px-4">
    <div className="text-gray-400">
      <Icon className="w-4 h-4" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
    </div>
  </div>
);

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // LÓGICA DE RECUPERACIÓN DE DATOS CORREGIDA
  // Buscamos las propiedades específicas que devuelve tu backend
  const employeeName =
    currentUser?.employeeName ||
    currentUser?.username ||
    currentUser?.name ||
    "Usuario";

  const employeeId = currentUser?.employeeId || currentUser?.id || "N/A";

  // Campos opcionales (se muestran solo si existen en el currentUser)
  const employeeDNI = currentUser?.dni || "N/A";
  const employeeCargo = currentUser?.cargo || "Empleado";
  const employeeEmail = currentUser?.email || "N/A";
  const employeePhone = currentUser?.phone || "N/A";

  const employeeInitials = employeeName.charAt(0).toUpperCase();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-50">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center gap-3">
        <div className="size-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
          <Car className="w-4 h-4" />
        </div>
        <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text">
          RentApp
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map(({ name, icon: Icon, path }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm">{name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="p-4 border-t border-gray-200 relative">
        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className="flex w-full items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition"
        >
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-base shrink-0">
            {employeeInitials}
          </div>
          <div className="text-left min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {employeeName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              Legajo: {employeeId}
            </p>
          </div>
        </button>

        {/* Popover Profile Details */}
        {isProfileOpen && (
          <div
            className="absolute left-full bottom-0 ml-3 mb-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <h4 className="font-bold text-lg text-gray-800 truncate">
                {employeeName}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                  {employeeCargo}
                </span>
              </div>
            </div>

            <div className="py-2">
              <DetailRow icon={Hash} label="ID Empleado" value={employeeId} />
              {employeeDNI !== "N/A" && (
                <DetailRow icon={Briefcase} label="DNI" value={employeeDNI} />
              )}
              {employeeEmail !== "N/A" && (
                <DetailRow icon={Mail} label="Email" value={employeeEmail} />
              )}
              {employeePhone !== "N/A" && (
                <DetailRow
                  icon={Phone}
                  label="Teléfono"
                  value={employeePhone}
                />
              )}
            </div>

            {/* Logout Button */}
            <div className="p-3 border-t border-gray-100 bg-gray-50">
              <button
                onClick={logout}
                className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-sm hover:bg-red-600 transition active:scale-95"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
