import React from 'react';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';

const CrudTable = ({ 
  data = [], 
  loading = false,
  schema,
  onEdit, 
  onDelete,
  emptyMessage = "No items available." 
}) => {
  if (loading) return <LoadingSkeleton />;
  if (!data || data.length === 0) return <EmptyState message={emptyMessage} />;

  // Find fields to display (at most 3 for simplicity in table view, prioritizing some)
  const displayFields = schema?.fields?.filter(f => 
    f.type !== 'textarea' && f.type !== 'image' && f.type !== 'array'
  ).slice(0, 3) || [];

  return (
    <div className="overflow-x-auto bg-[#131b2c] rounded-xl border border-[#1e293b] shadow-xl">
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="bg-[#0a0f1c] text-xs uppercase text-gray-500 border-b border-[#1e293b]">
          <tr>
            {displayFields.map((field) => (
              <th key={field.name} className="px-6 py-4 font-medium tracking-wider">
                {field.label}
              </th>
            ))}
            <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1e293b]">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-[#1e293b]/50 transition-colors group">
              {displayFields.map((field) => (
                <td key={field.name} className="px-6 py-4 whitespace-nowrap">
                  {field.type === 'url' && item[field.name] ? (
                    <a 
                      href={item[field.name]} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      Link <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : field.type === 'boolean' ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item[field.name] ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'}`}>
                      {item[field.name] ? 'Yes' : 'No'}
                    </span>
                  ) : (
                    item[field.name] || <span className="text-gray-600">-</span>
                  )}
                </td>
              ))}
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      className="p-2 text-cyan-300 hover:bg-cyan-500/10 hover:text-cyan-200 rounded-lg transition-colors border border-transparent hover:border-cyan-400/20"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4"/>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CrudTable;
