export default function GenericTable({
  columns,
  data,
  children,
  emptyMessage = "No se encontraron registros.",
}) {
  const dataToRender = data ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                    col.align === "right" ? "text-right" : ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
              {}
              <th scope="col" className="relative px-6 py-3 text-right">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {}
            {dataToRender.map(children)}
          </tbody>
        </table>
      </div>
      {dataToRender.length === 0 && (
        <div className="p-8 text-center text-gray-500">{emptyMessage}</div>
      )}
    </div>
  );
}
