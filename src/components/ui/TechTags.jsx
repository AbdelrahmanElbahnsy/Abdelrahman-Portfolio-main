import React, { memo, useMemo } from 'react';
import { normalizeTechnologySource } from '../../utils/projectTechnologies';

const TechTags = ({ technologies = [], maxVisible, className = '' }) => {
  const normalizedTechnologies = useMemo(
    () => normalizeTechnologySource(technologies),
    [technologies]
  );

  const hasLimit = Number.isInteger(maxVisible) && maxVisible > 0;
  const visibleTech = hasLimit
    ? normalizedTechnologies.slice(0, maxVisible)
    : normalizedTechnologies;
  const remaining = hasLimit
    ? Math.max(normalizedTechnologies.length - maxVisible, 0)
    : 0;

  if (visibleTech.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`.trim()}>
      {visibleTech.map((technology) => (
        <span
          key={technology}
          className="rounded border border-cyan-500/30 bg-transparent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300"
        >
          {technology}
        </span>
      ))}

      {remaining > 0 ? (
        <span className="rounded border border-cyan-500/30 bg-transparent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
          +{remaining}
        </span>
      ) : null}
    </div>
  );
};

export default memo(TechTags);
