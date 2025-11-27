import { useState, useEffect } from "react";
import { Search, Sliders } from "lucide-react";

export default function VehicleFilters({ onChange, onOpenAdvancedFilters }) {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    onChange({ searchTerm: searchTerm });
  }, [searchTerm, onChange]);

  return (
    <div className="flex items-center w-full gap-2">
      {}
      <div className="relative flex-grow">
        <input
          id="search"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Ubicación, Marca o Patente..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {}
      <button
        onClick={onOpenAdvancedFilters}
        className="btn size-10 rounded-lg bg-gray-100 text-gray-600 p-0 hover:bg-gray-200 focus:ring-2 focus:ring-indigo-500 transition"
        title="Filtros Avanzados"
      >
        <Sliders className="w-5 h-5" />
      </button>
    </div>
  );
}
