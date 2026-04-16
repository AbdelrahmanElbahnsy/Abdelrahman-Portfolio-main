import React, { useState, useEffect, useCallback, memo } from 'react';
import { getSingleDocument, setSingleDocument } from '../../services/firestore';
import { uploadImage } from '../../services/storage';
import { Loader2, Save, UploadCloud, User } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfileManager = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({ fullName: '', bio: '', email: '', github: '', linkedin: '', resumeUrl: '', avatar: '' });
  const [imageFile, setImageFile] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSingleDocument('profile', 'main');
      if (data) setFormData(prev => ({ ...prev, ...data }));
    } catch (err) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setUploadProgress(0);
    
    try {
      let avatarUrl = formData.avatar || '';
      
      if (imageFile) {
        toast('Compressing and Uploading...', { icon: '⏳' });
        avatarUrl = await uploadImage(imageFile, 'profile', (progress) => {
           setUploadProgress(progress);
        });
      }

      await setSingleDocument('profile', 'main', { ...formData, avatar: avatarUrl });
      setFormData(prev => ({ ...prev, avatar: avatarUrl }));
      setImageFile(null);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(`Upload Failed: ${err.message}`, { duration: 5000 });
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  }, [formData, imageFile]);

  const handleChange = useCallback((e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleFileChange = useCallback((e) => {
    if (e.target.files[0]) {
      if (e.target.files[0].size > 2 * 1024 * 1024) {
        toast.error("File is too large! Maximum allowed is 2MB.");
        return;
      }
      setImageFile(e.target.files[0]);
    }
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-10 h-10 animate-spin text-[#14f195]" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <h2 className="text-3xl font-bold">Profile Info</h2>
      
      <div className="bg-[#131b2c] p-8 rounded-3xl border border-[#1e293b] shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6 pb-6 border-b border-[#1e293b]">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-[#1e293b] border-2 border-[#14f195] flex items-center justify-center overflow-hidden">
                {imageFile ? (
                  <img src={URL.createObjectURL(imageFile)} className="w-full h-full object-cover" alt="Preview"/>
                ) : formData.avatar ? (
                  <img src={formData.avatar} loading="lazy" className="w-full h-full object-cover" alt="Avatar"/>
                ) : (
                  <User className="text-[#14f195] w-10 h-10" />
                )}
              </div>
              <label className="absolute inset-0 bg-black/60 text-[#14f195] flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm z-10">
                <UploadCloud className="w-6 h-6" />
                <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handleFileChange}/>
              </label>
              
              {uploadProgress > 0 && uploadProgress < 100 && (
                 <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-md z-20">
                    <span className="text-[#14f195] font-bold text-sm">{uploadProgress}%</span>
                 </div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold">Profile Avatar</h3>
              <p className="text-sm text-gray-400 mb-2">Click the image to upload a new one (<span className="text-[#14f195]">Max 2MB</span>).</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors" required/>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Public Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors" required/>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Bio / Description</label>
            <textarea rows="4" name="bio" value={formData.bio} onChange={handleChange} className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors" required/>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">GitHub Profile URL</label>
              <input type="url" name="github" value={formData.github} onChange={handleChange} className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">LinkedIn Profile URL</label>
              <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Resume / CV Document URL</label>
              <input type="url" name="resumeUrl" value={formData.resumeUrl} onChange={handleChange} className="w-full p-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:border-[#14f195] text-white outline-none transition-colors" />
            </div>
          </div>

          <div className="pt-6 border-t border-[#1e293b] flex justify-end">
             <button type="submit" disabled={isSaving} className="bg-[#14f195] text-[#0a0f1c] px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#10d482] transition-colors disabled:opacity-50">
               {isSaving ? <Loader2 className="w-5 h-5 animate-spin"/> : <><Save className="w-5 h-5" /> Save Profile</>}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default memo(ProfileManager);
