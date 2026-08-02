/**
 * Generic Schema Validator
 * Validates form data against a provided schema definition.
 */
export const validateSchema = (data, schema) => {
  const errors = {};

  if (!schema || !schema.fields) {
    return { isValid: true, errors };
  }

  schema.fields.forEach((field) => {
    const value = data[field.name];

    // Check required
    if (field.required) {
      if (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0)
      ) {
        errors[field.name] = `${field.label || field.name} is required.`;
      }
    }

    // Check min/max for numbers
    if (field.type === 'number' && value !== undefined && value !== null && value !== '') {
      const numVal = Number(value);
      if (field.min !== undefined && numVal < field.min) {
        errors[field.name] = `Minimum value is ${field.min}.`;
      }
      if (field.max !== undefined && numVal > field.max) {
        errors[field.name] = `Maximum value is ${field.max}.`;
      }
    }

    // Check minLength/maxLength for strings
    if ((field.type === 'text' || field.type === 'textarea') && typeof value === 'string') {
      if (field.minLength !== undefined && value.length < field.minLength) {
        errors[field.name] = `Minimum length is ${field.minLength} characters.`;
      }
      if (field.maxLength !== undefined && value.length > field.maxLength) {
        errors[field.name] = `Maximum length is ${field.maxLength} characters.`;
      }
    }

    // Check pattern (regex)
    if (field.pattern && typeof value === 'string' && value) {
      const regex = new RegExp(field.pattern);
      if (!regex.test(value)) {
        errors[field.name] = field.patternMessage || `Invalid format for ${field.label || field.name}.`;
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
