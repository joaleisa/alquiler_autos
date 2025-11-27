import { Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Vehicles from "./pages/Vehicles";
import Reservations from "./pages/Reservations";
import Clients from "./pages/Clients";
import Invoices from "./pages/Invoices";
import Maintenance from "./pages/Maintenance";
import Incidents from "./pages/Incidents";
import Rentals from "./pages/Rentals";
import Employees from "./pages/Employees";
import Users from "./pages/Users";

import Login from "./pages/Login";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Home />} />
        <Route path="vehiculos" element={<Vehicles />} />
        <Route path="reservas" element={<Reservations />} />
        <Route path="clientes" element={<Clients />} />
        <Route path="facturacion" element={<Invoices />} />
        <Route path="mantenimiento" element={<Maintenance />} />
        <Route path="incidentes" element={<Incidents />} />
        <Route path="alquileres" element={<Rentals />} />
        <Route path="empleados" element={<Employees />} />
        <Route path="usuarios" element={<Users />} />
      </Route>
    </Routes>
  );
}

export default App;
