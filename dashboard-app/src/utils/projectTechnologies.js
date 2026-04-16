const normalizeTechnologyTokens = (items) => {
  const seen = new Set();

  return items
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => {
      if (!item) {
        return false;
      }

      const normalized = item.toLowerCase();

      if (seen.has(normalized)) {
        return false;
      }

      seen.add(normalized);
      return true;
    });
};

export const parseTechnologiesInput = (value) => {
  if (typeof value !== 'string') {
    return [];
  }

  return normalizeTechnologyTokens(value.split(','));
};

export const normalizeTechnologySource = (value) => {
  if (Array.isArray(value)) {
    return normalizeTechnologyTokens(value);
  }

  if (typeof value !== 'string') {
    return [];
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return [];
  }

  if (trimmedValue.includes(',')) {
    return normalizeTechnologyTokens(trimmedValue.split(','));
  }

  return normalizeTechnologyTokens(trimmedValue.split(/\s{2,}|[|;/\n]+/));
};

export const normalizeProjectTechnologies = (project) => {
  const source = project?.technologies ?? project?.tags ?? [];
  return normalizeTechnologySource(source);
};
