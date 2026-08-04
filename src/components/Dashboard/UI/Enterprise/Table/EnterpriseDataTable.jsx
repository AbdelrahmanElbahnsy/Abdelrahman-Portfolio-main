import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, LayoutGrid, List } from 'lucide-react';
import EnterpriseEmptyState from '../State/EnterpriseEmptyState';
import EnterpriseLoadingState from '../State/EnterpriseLoadingState';

const EnterpriseDataTable = ({ 
  data = [], 
  columns = [], 
  isLoading = false,
  emptyStateTitle = 'No data available',
  emptyStateDescription = 'Get started by creating a new entry.',
  onEmptyAction,
  emptyActionLabel,
  viewMode = 'table', // 'table' | 'grid'
  gridRenderItem = null // function to render grid card
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle dates/timestamps if they are objects with .toDate()
        if (aValue?.toDate) aValue = aValue.toDate().getTime();
        if (bValue?.toDate) bValue = bValue.toDate().getTime();

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  if (isLoading) {
    return <EnterpriseLoadingState fullHeight />;
  }

  if (data.length === 0) {
    return (
      <EnterpriseEmptyState 
        title={emptyStateTitle}
        description={emptyStateDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  if (viewMode === 'grid' && gridRenderItem) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
        {sortedData.map((item, index) => gridRenderItem(item, index))}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto bg-[#111827] border border-white/10 rounded-2xl shadow-xl animate-in fade-in duration-500 relative">
      <table className="w-full text-left text-sm text-gray-400">
        <thead className="text-xs text-gray-500 uppercase bg-black/40 border-b border-white/5 sticky top-0 z-10 backdrop-blur-md">
          <tr>
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={`px-6 py-4 font-bold tracking-wider ${col.sortable !== false ? 'cursor-pointer hover:text-white transition-colors group' : ''} ${col.className || ''}`}
                onClick={() => col.sortable !== false && col.accessorKey && requestSort(col.accessorKey)}
              >
                <div className="flex items-center gap-2">
                  {col.header}
                  {col.sortable !== false && col.accessorKey && (
                    <span className="text-gray-600 group-hover:text-gray-400 transition-colors">
                      {sortConfig.key === col.accessorKey ? (
                        sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3 text-cms-primary" /> : <ChevronDown className="w-3 h-3 text-cms-primary" />
                      ) : (
                        <ChevronsUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                      )}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sortedData.map((row, rowIndex) => (
            <tr 
              key={row.id || rowIndex} 
              className="hover:bg-white/[0.02] transition-colors group"
            >
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={`px-6 py-4 whitespace-nowrap ${col.cellClassName || ''}`}>
                  {col.cell ? col.cell(row) : row[col.accessorKey]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EnterpriseDataTable;
