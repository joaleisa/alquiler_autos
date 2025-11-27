import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      <Sidebar />

      <main className="flex-grow p-8 ml-64">
        <Outlet />
      </main>
    </div>
  );
}
