import React from 'react';
import { Edit2, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

const ExperienceCard = ({ experience, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) => {
  // Parse technologies from comma-separated string
  const tags = experience.technologies
    ? experience.technologies.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="bg-[#131b2c] rounded-2xl border border-[#1e293b] p-6 shadow-sm hover:shadow-xl hover:border-[#1e293b]/80 hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full group relative overflow-hidden">
      {/* Accent glow on hover */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#14f195] rounded-full blur-3xl opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
      
      {/* Numbering (Subtly Prominent) */}
      <div className="text-[3rem] leading-none font-black text-white/5 font-mono absolute -top-4 -left-2 select-none pointer-events-none group-hover:text-white/10 transition-colors">
        {String(experience.order).padStart(2, '0')}
      </div>

      <div className="relative z-10 flex-grow flex flex-col">
        <div className="mb-4 pt-4">
          <h3 className="text-xl font-bold text-white mb-3 tracking-tight">
            {experience.title}
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed line-clamp-4">
            {experience.description}
          </p>
        </div>

        {tags.length > 0 && (
          <div className="mt-auto mb-6">
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#14f195]/70 mb-3">
              Technologies
            </h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className="px-2.5 py-1 text-[11px] font-mono font-semibold text-gray-300 bg-[#0f172a] border border-[#1e293b] rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="relative z-10 pt-4 mt-auto border-t border-[#1e293b] flex items-center justify-between opacity-60 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1.5">
          <button 
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label="Move Up"
            title="Move Up"
            className="p-2 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button 
            onClick={onMoveDown}
            disabled={isLast}
            aria-label="Move Down"
            title="Move Down"
            className="p-2 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1.5">
          <button 
            onClick={() => onEdit(experience)}
            aria-label="Edit Experience"
            title="Edit Experience"
            className="p-2 text-blue-400/80 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDelete(experience)}
            aria-label="Delete Experience"
            title="Delete Experience"
            className="p-2 text-red-400/80 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;
