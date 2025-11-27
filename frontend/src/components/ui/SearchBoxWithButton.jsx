import { Search, Sliders, LayoutGrid, List } from "lucide-react";

export default function SearchBoxWithButton({
  searchTerm,
  onSearchTermChange,
  onSearchClick,
  onOpenAdvancedFilters,
  view,
  onViewChange,
  placeholder = "Buscar por ubicación, marca o patente...",
  showViewToggle = false,
}) {
  return (
    <div className="flex items-center gap-4 w-full">
      <div className="flex flex-grow bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 transition-shadow focus-within:shadow-xl">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2.5 text-base text-gray-800 bg-transparent focus:outline-none"
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <button
          onClick={onSearchClick}
          className="flex items-center justify-center px-6 py-2 bg-indigo-600 text-white font-semibold rounded-xl transition-colors duration-200 hover:bg-indigo-700 shadow-md"
        >
          Buscar
        </button>
      </div>

      <div className="flex items-center gap-3">
        {}
        <button
          onClick={onOpenAdvancedFilters}
          className="btn size-11 rounded-xl p-0 text-gray-600 hover:bg-gray-100 transition flex items-center justify-center"
          title="Filtros Avanzados"
        >
          <Sliders className="w-5 h-5" />
        </button>

        {}
        {showViewToggle && (
          <div className="flex items-center rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => onViewChange("grid")}
              className={`p-2 rounded-lg transition-all duration-200 ${
                view === "grid"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:bg-gray-200"
              }`}
              aria-label="Vista de Cuadrícula"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => onViewChange("table")}
              className={`p-2 rounded-lg transition-all duration-200 ${
                view === "table"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:bg-gray-200"
              }`}
              aria-label="Vista de Tabla"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
