import React, { useState, useEffect } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import { validateSchema } from '../validators/schemaValidator';

const CrudForm = ({ 
  schema, 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  submitLabel = "Save"
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field changes
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { isValid, errors: validationErrors } = validateSchema(formData, schema);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#131b2c] rounded-xl border border-[#1e293b] p-6 shadow-xl relative overflow-hidden">
      {isSubmitting && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#0a0f1c]/50 backdrop-blur-sm">
          <Loader2 className="h-10 w-10 animate-spin text-[#14f195]" />
        </div>
      )}

      <h3 className="mb-6 text-xl font-bold">{schema.title}</h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {schema.fields.map(field => {
          if (field.type === 'hidden') return null;

          return (
            <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
              <label className="mb-1 block text-sm text-gray-400">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1c] p-2.5 text-white focus:border-[#14f195] focus:outline-none transition-colors"
                  rows="4"
                  disabled={isSubmitting || field.readonly}
                />
              ) : field.type === 'select' ? (
                <select
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1c] p-2.5 text-white focus:border-[#14f195] focus:outline-none transition-colors"
                  disabled={isSubmitting || field.readonly}
                >
                  <option value="">Select an option</option>
                  {field.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : field.type === 'boolean' ? (
                <label className="flex items-center gap-2 mt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={!!formData[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.checked)}
                    className="w-4 h-4 rounded border-[#1e293b] bg-[#0a0f1c] text-[#14f195] focus:ring-[#14f195]"
                    disabled={isSubmitting || field.readonly}
                  />
                  <span className="text-white text-sm">Enabled</span>
                </label>
              ) : field.type === 'image' || field.type === 'array' ? (
                <div className="text-xs text-gray-500 p-3 rounded bg-[#0a0f1c] border border-[#1e293b]">
                  {field.type} input is custom implemented for this schema.
                </div>
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'date' ? 'date' : 'text'}
                  name={field.name}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="w-full rounded-lg border border-[#1e293b] bg-[#0a0f1c] p-2.5 text-white focus:border-[#14f195] focus:outline-none transition-colors"
                  disabled={isSubmitting || field.readonly}
                />
              )}

              {errors[field.name] && (
                <p className="mt-1 text-xs text-red-500">{errors[field.name]}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-end gap-3 border-t border-[#1e293b] pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg border border-[#1e293b] px-5 py-2.5 font-semibold text-white hover:bg-[#1e293b] transition-colors disabled:opacity-50"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-lg bg-[#14f195] px-6 py-2.5 font-bold text-[#0a0f1c] hover:bg-[#10d482] transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="h-4 w-4" /> {submitLabel}</>
          )}
        </button>
      </div>
    </form>
  );
};

export default CrudForm;
