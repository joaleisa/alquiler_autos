import React, { useState, useEffect } from "react";
import {
  DollarSign,
  ClipboardList,
  Users,
  Car,
  X,
  RefreshCw,
} from "lucide-react";
import { dashboardService } from "../services";

import KpiCard from "../components/dashboard/KpiCard";
import MonthlyRevenueChart from "../components/dashboard/MonthlyRevenueChart";
import FleetAvailabilityRadialChart from "../components/dashboard/FleetAvailabilityRadialChart";
import PopularVehiclesChart from "../components/dashboard/PopularVehiclesChart";
import QuarterlyRentalsChart from "../components/dashboard/QuarterlyRentalsChart";
import InventoryBarChart from "../components/dashboard/InventoryBarChart";
import ReportsTable from "../components/dashboard/ReportsTable";

export default function Home() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [detailView, setDetailView] = useState(null);
  const [masterVehicleFilter, setMasterVehicleFilter] = useState("");
  const [monthRangeFilter, setMonthRangeFilter] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getData();
      setDashboardData(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al cargar datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-lg font-semibold text-gray-700">
            Cargando dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg text-gray-600">No hay datos disponibles</p>
          <button
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Extraemos inventoryData del objeto de respuesta
  const {
    kpis,
    monthlyRevenue,
    popularVehicles,
    detailedRentals,
    inventoryData,
  } = dashboardData;

  const handleRevenueClick = (data) => {
    const month = data.month;
    setDetailView(`Detalle de Facturación para ${month}`);
    setMasterVehicleFilter("");
    setMonthRangeFilter(null);
  };

  const handleVehicleClick = (data) => {
    const vehicleName = data.name;
    const newFilter = masterVehicleFilter === vehicleName ? "" : vehicleName;
    setMasterVehicleFilter(newFilter);
    setMonthRangeFilter(null);
    setDetailView(null);
  };

  const handleRangeSelection = (startMonth, endMonth) => {
    setMonthRangeFilter({ start: startMonth, end: endMonth });
    setDetailView(null);
    setMasterVehicleFilter("");
  };

  const clearMonthRangeFilter = () => setMonthRangeFilter(null);

  return (
    <section className="space-y-8 p-6">
      <header className="flex justify-between items-center pb-3 border-b border-gray-200">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Dashboard de Gestión
          </h1>
          <p className="text-base text-gray-600">
            Resumen ejecutivo y métricas críticas de RentApp.
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            title="Actualizar datos"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Facturación Total"
          value={kpis.totalRevenue}
          icon={DollarSign}
          unit="$"
          color="bg-green-600"
        />
        <KpiCard
          title="Alquileres Totales"
          value={kpis.totalRentals}
          icon={ClipboardList}
          color="bg-indigo-600"
        />
        <KpiCard
          title="Clientes Activos"
          value={kpis.activeClients}
          icon={Users}
          color="bg-yellow-600"
        />
        <KpiCard
          title="Vehículos Disponibles"
          value={kpis.availableVehicles}
          icon={Car}
          color="bg-red-600"
        />
      </div>

      {monthRangeFilter && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-md shadow-md flex justify-between items-center transition-all duration-300">
          <p className="font-semibold text-orange-800">
            Filtro de Rango de Meses Activo:{" "}
            <strong>{monthRangeFilter.start}</strong> a{" "}
            <strong>{monthRangeFilter.end}</strong> (Se aplicará a la tabla de
            reportes).
          </p>
          <button
            onClick={clearMonthRangeFilter}
            className="text-orange-600 hover:text-orange-800 font-bold flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Limpiar Rango
          </button>
        </div>
      )}

      {detailView && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md shadow-md">
          <p className="font-semibold text-blue-800">{detailView}</p>
          <p className="text-sm text-blue-600">
            Aquí se cargaría una tabla o un informe específico con las
            transacciones del mes. (Simulación de Drill-Down)
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <MonthlyRevenueChart
            data={monthlyRevenue}
            onDataPointClick={handleRevenueClick}
            onRangeSelected={handleRangeSelection}
            currentMonthRange={monthRangeFilter}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FleetAvailabilityRadialChart kpis={kpis} />

        <PopularVehiclesChart
          data={popularVehicles}
          onSegmentClick={handleVehicleClick}
          activeSegment={masterVehicleFilter}
        />

        <QuarterlyRentalsChart data={monthlyRevenue} />

        {/* Ahora pasamos los datos reales de inventario */}
        <InventoryBarChart data={inventoryData} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ReportsTable
          rentalsData={detailedRentals}
          crossFilterVehicle={masterVehicleFilter}
          monthRangeFilter={monthRangeFilter}
          onClearVehicleFilter={() => setMasterVehicleFilter("")}
          onClearMonthRangeFilter={clearMonthRangeFilter}
        />
      </div>
    </section>
  );
}
