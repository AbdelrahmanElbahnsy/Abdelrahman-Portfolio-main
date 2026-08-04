import React from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

const EnterpriseUploader = ({
  file,
  existingImageUrl,
  onFileChange,
  progress = 0,
  disabled = false,
  maxSizeMB = 2,
  label = 'Upload Image',
  hint
}) => {
  const imagePreview = file ? URL.createObjectURL(file) : existingImageUrl;

  return (
    <div className="flex flex-col">
      <label className="mb-1.5 text-sm font-bold text-gray-300">{label} {maxSizeMB && `(Max ${maxSizeMB}MB)`}</label>
      
      <div className="space-y-3">
        {imagePreview && (
          <div className="overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-inner">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-36 w-full object-cover"
            />
          </div>
        )}

        <div className={`group relative flex h-[46px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed border-white/5 bg-white/5' : 'border-white/20 bg-black/40 hover:border-cms-primary hover:bg-cms-primary/5'}`}
        >
          {file ? (
            <span className="flex items-center gap-2 truncate px-4 text-sm font-bold text-cms-primary">
              <ImageIcon className="h-4 w-4 shrink-0" /> {file.name}
            </span>
          ) : existingImageUrl ? (
            <span className="flex items-center gap-2 truncate px-4 text-sm font-medium text-cyan-300">
              <ImageIcon className="h-4 w-4 shrink-0" /> Current image selected
            </span>
          ) : (
            <span className="flex items-center gap-2 text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
              <UploadCloud className="h-4 w-4" /> Choose an Image
            </span>
          )}

          <input
            type="file"
            accept="image/jpeg, image/png, image/webp"
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            onChange={onFileChange}
            disabled={disabled}
          />

          {progress > 0 && progress < 100 && (
            <div className="absolute inset-x-0 bottom-0 z-20 h-1 bg-white/10">
              <div
                className="h-full bg-cms-primary transition-all duration-300 ease-out shadow-[0_0_10px_rgba(20,241,149,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
      {hint && <span className="mt-1.5 text-xs text-gray-500">{hint}</span>}
    </div>
  );
};

export default EnterpriseUploader;
