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
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {visibleTech.map((technology) => (
        <span
          key={technology}
          className="rounded-md border border-cyan-400 bg-transparent px-3 py-1 text-xs font-semibold uppercase text-cyan-300"
        >
          {technology}
        </span>
      ))}

      {remaining > 0 ? (
        <span className="rounded-md border border-cyan-400 bg-transparent px-3 py-1 text-xs font-semibold uppercase text-cyan-300">
          +{remaining}
        </span>
      ) : null}
    </div>
  );
};

export default memo(TechTags);
