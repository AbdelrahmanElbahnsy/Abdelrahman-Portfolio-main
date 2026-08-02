import React, { useMemo } from 'react';
import { UploadCloud, Image as ImageIcon } from 'lucide-react';

const ImageUploader = ({ 
  imageFile, 
  existingImage, 
  onFileChange, 
  isUploading, 
  uploadProgress 
}) => {
  const imagePreview = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return existingImage;
  }, [existingImage, imageFile]);

  // Clean up object URL when component unmounts or imagePreview changes
  React.useEffect(() => {
    return () => {
      if (imagePreview && imageFile) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imageFile, imagePreview]);

  return (
    <div className="space-y-3">
      {imagePreview ? (
        <div className="overflow-hidden rounded-xl border border-[#1e293b] bg-[#0a0f1c]">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-36 w-full object-cover"
          />
        </div>
      ) : null}

      <div className="group relative flex h-[46px] cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#1e293b] bg-[#0a0f1c] transition-colors hover:border-[#14f195]">
        {imageFile ? (
          <span className="flex items-center gap-2 truncate px-4 text-sm font-medium text-[#14f195]">
            <ImageIcon className="h-4 w-4 shrink-0" /> {imageFile.name}
          </span>
        ) : existingImage ? (
          <span className="flex items-center gap-2 truncate px-4 text-sm font-medium text-cyan-300">
            <ImageIcon className="h-4 w-4 shrink-0" /> Current image selected
          </span>
        ) : (
          <span className="flex items-center gap-2 text-sm text-gray-400">
            <UploadCloud className="h-5 w-5" /> Choose an Image
          </span>
        )}

        <input
          type="file"
          accept="image/jpeg, image/png, image/webp"
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          onChange={onFileChange}
          disabled={isUploading}
        />

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="absolute inset-x-0 bottom-0 z-20 h-1 bg-[#1e293b]">
            <div
              className="h-full bg-[#14f195] transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
