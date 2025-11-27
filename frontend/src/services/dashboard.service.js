import apiService from "./api.service";

export const dashboardService = {
  getData: async () => {
    try {
      // 1. Llamamos a ambos endpoints en paralelo
      const [dashboardResp, vehiclesResp] = await Promise.all([
        apiService.get("/dashboard"),
        apiService.get("/vehiculos/"), // Necesario para el gráfico de inventario
      ]);

      const dashboardData = dashboardResp?.data || dashboardResp;
      const vehicles = Array.isArray(vehiclesResp)
        ? vehiclesResp
        : vehiclesResp?.data || [];

      if (!dashboardData) {
        throw new Error("No se recibieron datos del dashboard");
      }

      // --- PROCESAMIENTO DE DATOS ---

      // A. Inventario por Marca (Calculado desde /vehiculos)
      const inventoryMap = {};
      vehicles.forEach((v) => {
        // Filtro: No contar vehículos dados de baja
        if (v.estado && v.estado.toLowerCase() === "baja") return;

        const key = v.brand ? v.brand.trim() : "Otros";
        inventoryMap[key] = (inventoryMap[key] || 0) + 1;
      });

      const inventoryData = Object.entries(inventoryMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      // B. Cálculo de Alquileres por Mes (Recuperado)
      const months = [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ];
      const rentalsCountByMonth = {};
      months.forEach((m) => (rentalsCountByMonth[m] = 0));

      // Recorremos los alquileres detallados para contar cuántos hubo por mes
      (dashboardData.detailedRentals || []).forEach((rental) => {
        const dateStr = rental.startDate || rental.date_time_start;
        if (dateStr) {
          const date = new Date(dateStr);
          // Ajuste simple de zona horaria para evitar errores de mes
          const userTimezoneOffset = date.getTimezoneOffset() * 60000;
          const adjustedDate = new Date(date.getTime() + userTimezoneOffset);

          if (!isNaN(adjustedDate)) {
            const monthIndex = adjustedDate.getMonth(); // 0-11
            if (months[monthIndex]) {
              rentalsCountByMonth[months[monthIndex]]++;
            }
          }
        }
      });

      // C. Mapeo de Ingresos Mensuales + Cantidad (Merge)
      const monthlyRevenue = (dashboardData.monthlyRevenue || []).map(
        (item) => ({
          month: item.month,
          total: item.total || 0,
          // Aquí asignamos el conteo calculado en el paso B
          count: rentalsCountByMonth[item.month] || 0,
        })
      );

      // D. Mapeo de Vehículos Populares (Backend -> Recharts value)
      const popularVehicles = (dashboardData.popularVehicles || []).map(
        (item) => ({
          name: item.name,
          value: item.rentals,
        })
      );

      // E. Mapeo de Alquileres Detallados
      const detailedRentals = (dashboardData.detailedRentals || []).map(
        (item) => ({
          id: item.rentalId,
          clientName: item.clientName,
          vehicle: item.vehicleName,
          startDate: item.startDate,
          endDate: item.endDate,
          total: parseFloat(item.total || 0),
          status: "Finalizado",
          invoiceStatus: "Emitida",
        })
      );

      return {
        kpis: dashboardData.kpis || {
          totalRevenue: 0,
          totalRentals: 0,
          activeClients: 0,
          availableVehicles: 0,
        },
        monthlyRevenue, // Ahora incluye 'total' y 'count' correctamente
        popularVehicles,
        detailedRentals,
        inventoryData,
      };
    } catch (error) {
      console.error("Error obteniendo datos del dashboard:", error);
      return {
        kpis: {
          totalRevenue: 0,
          totalRentals: 0,
          activeClients: 0,
          availableVehicles: 0,
        },
        monthlyRevenue: [],
        popularVehicles: [],
        detailedRentals: [],
        inventoryData: [],
      };
    }
  },
};
