import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import MediaPickerModal from '../../components/Dashboard/MediaPickerModal';
import { useImageUpload } from '../hooks/useImageUpload';
import toast from 'react-hot-toast';

const MediaPicker = ({ value, onChange, disabled }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  
  const { uploadImage, isUploading, uploadProgress, resetUploadState } = useImageUpload();

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading('Uploading to Cloudinary...', { id: 'picker-upload' });
      const newUrl = await uploadImage(file);
      toast.success('Upload complete!', { id: 'picker-upload' });
      if (onChange && newUrl) {
        onChange(newUrl);
      }
    } catch (err) {
      toast.error(`Upload failed: ${err.message}`, { id: 'picker-upload' });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      resetUploadState();
    }
  };

  return (
    <div className="space-y-3 w-full">
      {value && (
        <div className="relative overflow-hidden rounded-xl border border-[#1e293b] bg-[#0a0f1c] group flex items-center justify-center p-2 min-h-[140px]">
          <img 
            src={value} 
            alt="Preview" 
            className="max-h-40 w-auto object-contain rounded-lg" 
          />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-red-400 z-10"
            title="Clear Selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          disabled={disabled || isUploading}
          className="flex-1 flex items-center justify-center gap-2 h-[46px] rounded-lg border border-dashed border-[#1e293b] bg-[#0a0f1c] text-sm font-medium text-[#4b6385] transition-colors hover:border-[#14f195] hover:text-[#14f195] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ImageIcon className="h-5 w-5 shrink-0" />
          {value ? 'Change from Library' : 'Choose from Library'}
        </button>

        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileUpload} 
          accept="image/*"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="flex-1 flex items-center justify-center gap-2 h-[46px] rounded-lg border border-dashed border-[#1e293b] bg-[#0a0f1c] text-sm font-medium text-[#4b6385] transition-colors hover:border-[#14f195] hover:text-[#14f195] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? <Loader2 className="h-5 w-5 shrink-0 animate-spin" /> : <UploadCloud className="h-5 w-5 shrink-0" />}
          {isUploading ? `Uploading ${uploadProgress}%` : 'Upload New'}
        </button>
      </div>

      <MediaPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(url) => {
          if (onChange) onChange(url);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default MediaPicker;
