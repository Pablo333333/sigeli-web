import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
}

export default function DataTable<T extends { id: string | number }>({ 
  columns, 
  data, 
  loading 
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="w-full h-32 flex items-center justify-center bg-white border border-slate-200 rounded-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map((column, index) => (
              <th 
                key={index} 
                className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                {columns.map((column, index) => (
                  <td key={index} className="px-6 py-4 text-sm text-slate-700">
                    {typeof column.accessor === 'function' 
                      ? column.accessor(item) 
                      : (item[column.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td 
                colSpan={columns.length} 
                className="px-6 py-12 text-center text-slate-400 italic"
              >
                No se encontraron registros.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
