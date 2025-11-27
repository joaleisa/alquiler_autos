import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Sliders,
  X,
  Key,
  User,
  Edit,
  Trash2,
} from "lucide-react";
import { userService } from "../services";

import UserList from "../components/user/UserList";
import UserFormModal from "../components/user/UserFormModal";
import SearchBoxWithButton from "../components/ui/SearchBoxWithButton";
import StyledPrimaryButton from "../components/ui/StyledPrimaryButton";
import GenericTable from "../components/ui/GenericTable";
import TableActionCell from "../components/ui/TableActionCell";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Error loading users:", error);
      alert("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearchExecution = () => {
    console.log("Ejecutando búsqueda de usuarios con:", searchTerm);
  };

  const handleOpenCreateModal = () => {
    setUserToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setUserToEdit(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setUserToEdit(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (userToEdit) {
        await userService.updatePassword(userToEdit.userId, formData.password);
        alert("Contraseña actualizada exitosamente");
      } else {
        await userService.create({
          employeeId: formData.employeeId,
          username: formData.username,
          password: formData.password,
        });
        alert("Usuario creado exitosamente");
      }
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMsg = error.response?.data?.detail || "Error al guardar el usuario";
      alert(errorMsg);
    }
  };

  const handleDelete = async (user) => {
    console.log("Delete function received:", user);
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar a ${user?.name || "este usuario"}?`
      )
    ) {
      try {
        await userService.delete(user);
        alert("Usuario eliminado exitosamente");
        await loadData();
      } catch (error) {
        console.error("Error deleting user:", error);
        const errorMsg = error.response?.data?.detail || "Error al eliminar el usuario";
        alert(errorMsg);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  const columns = [
    { header: "Nombre de Usuario", field: "username" },
    { header: "Empleado Vinculado", field: "employeeName" },
  ];

  return (
    <section className="space-y-6">
      <header className="flex justify-between items-center pb-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Gestión de Usuarios del Sistema
        </h1>
        <StyledPrimaryButton onClick={handleOpenCreateModal}>
          <Plus className="w-5 h-5" />
          <span>Crear Usuario</span>
        </StyledPrimaryButton>
      </header>

      <div className="flex gap-6">
        <SearchBoxWithButton
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSearchClick={handleSearchExecution}
          onOpenAdvancedFilters={() => setIsAdvancedFilterOpen((prev) => !prev)}
          view="table"
          showViewToggle={false}
          placeholder="Buscar por Nombre de Usuario o Empleado..."
        />
      </div>

      <div className="mt-6 flex gap-6">
        {isAdvancedFilterOpen && (
          <div className="w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-5 shrink-0 transition-all duration-300">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Sliders className="w-5 h-5 text-gray-600" />
                Filtros de Acceso
              </h3>
              <button
                onClick={() => setIsAdvancedFilterOpen(false)}
                className="btn size-8 rounded-full p-0 text-gray-500 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="font-semibold text-gray-700">
                Cargo de Empleado:
              </div>
              <div className="h-16 bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">
                (Dropdown de Cargo Mock)
              </div>
            </div>
          </div>
        )}

        <div className="flex-grow">
          <GenericTable
            columns={columns}
            data={filteredUsers}
            emptyMessage="No se encontraron usuarios que coincidan con la búsqueda."
          >
            {(user) => (
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

                <TableActionCell
                  data={user}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDelete}
                  additionalActionTitle="Modificar Contraseña"
                  hideDelete={false}
                />
              </tr>
            )}
          </GenericTable>
        </div>
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        userToEdit={userToEdit}
      />
    </section>
  );
}
