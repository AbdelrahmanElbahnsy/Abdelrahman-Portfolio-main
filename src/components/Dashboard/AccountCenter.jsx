import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import UsersManager from './UsersManager';
import { useImageUpload } from '../../cms/hooks/useImageUpload';
import ImageUploader from '../../cms/components/ImageUploader';
import { auth } from '../../services/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { 
  User, Shield, Palette, AlertTriangle, 
  CheckCircle2, Clock, Calendar, Lock,
  LogOut, Activity, Edit2, X, FileText, Image as ImageIcon, Link as LinkIcon, Users
} from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
];

const InputField = ({ label, name, value, onChange, type = 'text', placeholder, helper, isMonospace }) => (
  <div className="w-full">
    <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">
      {label}
    </label>
    {type === 'textarea' ? (
      <textarea
        name={name}
        value={value ?? ''}
        onChange={onChange}
        rows={4}
        placeholder={placeholder}
        className={`w-full bg-[#030814]/50 border border-[#1e293b] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#14f195]/50 focus:ring-1 focus:ring-[#14f195]/50 transition-all resize-none ${isMonospace ? 'font-mono text-sm' : ''}`}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-[#030814]/50 border border-[#1e293b] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#14f195]/50 focus:ring-1 focus:ring-[#14f195]/50 transition-all ${isMonospace ? 'font-mono text-sm' : ''}`}
      />
    )}
    {helper && <p className="text-xs text-gray-500 mt-2">{helper}</p>}
  </div>
);

const SectionHeader = ({ number, title }) => (
  <div className="flex items-center gap-3 mt-8 mb-4 border-b border-[#1e293b] pb-2">
    <span className="text-[10px] font-mono font-bold text-[#14f195]/80 uppercase tracking-widest">{number} /</span>
    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">{title}</h3>
  </div>
);


// ─────────────────────────────────────────────────────────────────────────────
// EDITOR MODAL
// ─────────────────────────────────────────────────────────────────────────────
const ProfileEditorModal = ({ isOpen, onClose, profileData, onSave, isSaving }) => {
  const {
    imageFile: avatarFile,
    isUploading: isAvatarUploading,
    uploadProgress: avatarProgress,
    handleFileChange: handleAvatarChange,
    uploadImage: uploadAvatar,
    resetUpload: resetAvatar
  } = useImageUpload();

  const {
    imageFile: resumeFile,
    isUploading: isResumeUploading,
    uploadProgress: resumeProgress,
    handleFileChange: handleResumeChange,
    uploadImage: uploadResume,
    resetUpload: resetResume
  } = useImageUpload();

  const [formData, setFormData] = useState({});
  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    if (isOpen) {
      if (profileData) {
        const pData = {
          fullName: profileData.fullName || '',
          fullNameAr: profileData.fullNameAr || '',
          bio: profileData.bio || '',
          email: profileData.email || '',
          github: profileData.github || '',
          linkedin: profileData.linkedin || '',
          resumeUrl: profileData.resumeUrl || '',
          avatar: profileData.avatar || ''
        };
        setFormData(pData);
        setInitialData(pData);
      }
      resetAvatar();
      resetResume();
    }
  }, [isOpen, profileData]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSaving) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, onClose]);

  const isDirty = useMemo(() => {
    const fields = ['fullName', 'fullNameAr', 'bio', 'email', 'github', 'linkedin', 'resumeUrl'];
    const textDirty = fields.some(k => (formData[k] || '') !== (initialData[k] || ''));
    const filesDirty = avatarFile || resumeFile;
    return textDirty || !!filesDirty;
  }, [formData, initialData, avatarFile, resumeFile]);

  const tempAvatar = useMemo(() => {
    if (avatarFile) return URL.createObjectURL(avatarFile);
    return formData.avatar;
  }, [avatarFile, formData.avatar]);

  useEffect(() => {
    return () => {
      if (avatarFile && tempAvatar && tempAvatar.startsWith('blob:')) {
        URL.revokeObjectURL(tempAvatar);
      }
    };
  }, [tempAvatar, avatarFile]);

  // MUST BE AFTER ALL HOOKS
  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDirty) return;
    
    // We pass the files explicitly to the parent so it can upload them
    await onSave(formData, avatarFile, uploadAvatar, resumeFile, uploadResume);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSaving) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[#030814]/80 backdrop-blur-sm transition-opacity"
        onClick={handleOverlayClick}
      ></div>

      {/* Modal */}
      <div className="relative w-full max-w-[800px] max-h-[95vh] md:max-h-[90vh] bg-[#0d1321] border border-[#1e293b] rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#1e293b] bg-[#0d1321] shrink-0">
          <div className="min-w-0">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#14f195] mb-1 block">
              PORTFOLIO CMS
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight truncate flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-gray-400" />
              Edit Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 -mr-2 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors shrink-0 ml-4 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-[#1e293b] scrollbar-track-transparent">
          <form id="profile-form" onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto">

            <SectionHeader number="01" title="IDENTITY" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              <div>
                <label className="block text-[11px] font-mono font-bold text-gray-400 mb-3 uppercase tracking-widest">
                  PROFILE PICTURE / AVATAR
                </label>
                <ImageUploader
                  imageFile={avatarFile}
                  existingImage={formData.avatar}
                  onFileChange={handleAvatarChange}
                  isUploading={isAvatarUploading}
                  uploadProgress={avatarProgress}
                />
              </div>
              <div className="space-y-5">
                <InputField
                  label="FULL NAME (ENGLISH)"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                />
                <InputField
                  label="FULL NAME (ARABIC)"
                  name="fullNameAr"
                  value={formData.fullNameAr}
                  onChange={handleChange}
                  placeholder="e.g. جون دو"
                />
              </div>
            </div>

            <SectionHeader number="02" title="PROFESSIONAL PROFILE" />
            <div className="space-y-5">
              <InputField
                label="SHORT BIO / DESCRIPTION"
                name="bio"
                type="textarea"
                value={formData.bio}
                onChange={handleChange}
                placeholder="A brief description of who you are and what you do..."
                helper="This will appear in the main hero or about sections of the portfolio."
              />
            </div>

            <SectionHeader number="03" title="PUBLIC CONTACT" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <InputField
                label="PUBLIC EMAIL"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                isMonospace
                helper="This is the contact email shown to visitors, distinct from your Auth email."
              />
              <div className="space-y-5">
                <InputField
                  label="GITHUB URL"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  isMonospace
                />
                <InputField
                  label="LINKEDIN URL"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  isMonospace
                />
              </div>
            </div>
            
            <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-xl p-5 mt-5">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-gray-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Resume / CV Document</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                   <InputField
                    label="RESUME DIRECT URL"
                    name="resumeUrl"
                    value={formData.resumeUrl}
                    onChange={handleChange}
                    isMonospace
                    placeholder="https://..."
                    helper="Paste a link or upload a file below."
                  />
                  {formData.resumeUrl && !resumeFile && (
                     <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300">
                       <LinkIcon className="w-3 h-3" /> View current resume
                     </a>
                  )}
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">
                    UPLOAD NEW RESUME (PDF)
                  </label>
                  <ImageUploader
                    imageFile={resumeFile}
                    existingImage={null} // Don't preview PDF
                    onFileChange={handleResumeChange}
                    isUploading={isResumeUploading}
                    uploadProgress={resumeProgress}
                  />
                </div>
              </div>
            </div>

            <SectionHeader number="04" title="PREVIEW" />
            <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-2xl p-6 flex items-center gap-6 mb-4">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-[#1e293b] shrink-0 border border-[#334155]">
                {tempAvatar ? (
                  <img src={tempAvatar} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-2xl">
                    {formData.fullName?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-bold text-lg md:text-xl truncate">{formData.fullName || 'Your Name'}</h3>
                <p className="text-[#14f195] text-sm mt-0.5 truncate">{formData.email || 'your.email@example.com'}</p>
                <p className="text-gray-500 text-xs mt-2 line-clamp-2 max-w-md">{formData.bio || 'Your bio will appear here...'}</p>
              </div>
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#1e293b] bg-[#0d1321] shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="profile-form"
            disabled={!isDirty || isSaving}
            className="px-6 py-2.5 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] text-sm font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0a0f1c]/30 border-t-[#0a0f1c] rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const AccountCenter = () => {
  const { user, logout } = useAuth();
  
  // Real-time listener for current user's role
  const { data: adminData, subscribe: subscribeAdmin } = useFirestoreSingleDoc('admins', user?.uid);
  const currentUserRole = adminData?.role || 'viewer';

  const { 
    data: profileData, 
    loading: profileLoading, 
    setDocData, 
    subscribe 
  } = useFirestoreSingleDoc('profile', 'main');

  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security Tab State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Subscribe to real-time updates from Firestore profile/main and admins
  useEffect(() => {
    const unsubscribeProfile = subscribe();
    let unsubscribeAdmin;
    if (user?.uid) {
      unsubscribeAdmin = subscribeAdmin();
    }
    return () => {
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeAdmin) unsubscribeAdmin();
    };
  }, [subscribe, subscribeAdmin, user?.uid]);

  // Initialize theme from localStorage/DOM
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isDark = !document.documentElement.classList.contains('light-theme');
      setIsDarkMode(isDark);
    }
  }, []);

  const completionPercentage = useMemo(() => {
    if (!profileData) return 0;
    const fields = ['fullName', 'fullNameAr', 'bio', 'email', 'github', 'linkedin', 'avatar', 'resumeUrl'];
    let filled = 0;
    fields.forEach(field => {
      if (profileData[field] && typeof profileData[field] === 'string' && profileData[field].trim() !== '') {
        filled++;
      }
    });
    return Math.round((filled / fields.length) * 100);
  }, [profileData]);

  // Handle Profile Save
  const handleProfileSave = async (formData, avatarFile, uploadAvatar, resumeFile, uploadResume) => {
    setIsSavingProfile(true);
    try {
      // Build strictly defined payload to prevent data corruption
      const payload = {
        fullName: formData.fullName || '',
        fullNameAr: formData.fullNameAr || '',
        bio: formData.bio || '',
        email: formData.email || '',
        github: formData.github || '',
        linkedin: formData.linkedin || '',
        resumeUrl: formData.resumeUrl || ''
      };

      // Handle file uploads natively via existing hook functions passed down
      if (avatarFile) {
        const url = await uploadAvatar('profile');
        if (url) payload.avatar = url;
      }

      if (resumeFile) {
        const url = await uploadResume('documents');
        if (url) payload.resumeUrl = url;
      }

      // Safe merge via useFirestoreSingleDoc -> setDoc(..., { merge: true })
      await setDocData(payload);
      toast.success('Profile updated successfully');
      setIsEditorOpen(false);
    } catch (err) {
      toast.error(err.message || 'Error updating profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleThemeToggle = () => {
    const newIsDark = !isDarkMode;
    setIsDarkMode(newIsDark);
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio-theme', newIsDark ? 'dark' : 'light');
      if (newIsDark) {
        document.documentElement.classList.remove('light-theme');
      } else {
        document.documentElement.classList.add('light-theme');
      }
    }
    toast.success(`Theme updated to ${newIsDark ? 'Dark' : 'Light'} Mode`);
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsUpdatingPassword(true);
    try {
      // Re-authenticate first to satisfy Firebase 'auth/requires-recent-login'
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        toast.error('Incorrect current password');
      } else if (error.code === 'auth/requires-recent-login') {
        toast.error('This operation requires recent authentication. Please sign out and sign in again.');
      } else {
        toast.error(error.message || 'Failed to update password');
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
    } catch (err) {
      toast.error('Failed to sign out');
    }
  };

  if (!user || profileLoading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#14f195]"></div>
      </div>
    );
  }

  const memberSince = user?.metadata?.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Unknown';
    
  const lastLogin = user?.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Unknown';

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 relative">
      
      {/* ═══ PREMIUM HEADER CARD ═══ */}
      <div className="relative w-full rounded-[24px] overflow-hidden bg-[#0d1321] border border-[#1e293b] shadow-2xl">
        <div className="h-40 w-full bg-gradient-to-r from-[#0a0f1c] via-[#1e293b] to-[#0a0f1c] relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1321]"></div>
        </div>

        <div className="relative px-6 md:px-10 pb-8 flex flex-col md:flex-row gap-6 items-center md:items-end -mt-16 text-center md:text-left">
          
          <div className="relative shrink-0">
            <div className="w-32 h-32 rounded-[20px] bg-[#0a0f1c] border-[4px] border-[#0d1321] shadow-2xl overflow-hidden flex items-center justify-center">
              {profileData?.avatar ? (
                <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#1e293b] to-[#334155] flex items-center justify-center text-4xl font-black text-white">
                  {profileData?.fullName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                </div>
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#0d1321] p-1.5 rounded-full border border-[#1e293b] shadow-lg">
              <div className="w-4 h-4 rounded-full bg-[#14f195] animate-pulse shadow-[0_0_10px_rgba(20,241,149,0.5)]"></div>
            </div>
          </div>

          <div className="flex-1 mt-4 md:mt-0 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
            <div>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
                <h1 className="text-3xl font-black text-white tracking-tight">
                  {profileData?.fullName || 'Admin User'}
                </h1>
                {user.emailVerified && (
                  <span className="bg-[#14f195]/10 text-[#14f195] text-[10px] font-mono font-bold px-2 py-1 rounded border border-[#14f195]/20 uppercase tracking-widest flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              <p className="text-gray-400 font-mono text-sm mt-1">{profileData?.email || user.email}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 mt-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Since {memberSince}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Last: {lastLogin}</span>
              </div>
            </div>
            
            <div className="shrink-0 w-full md:w-auto">
              <button
                onClick={() => setIsEditorOpen(true)}
                className="w-full md:w-auto px-6 py-3 bg-[#1e293b] hover:bg-[#334155] text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-[#334155]"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ MAIN LAYOUT ═══ */}
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col space-y-1.5 sticky top-24">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-3 block px-4">
              Account Settings
            </span>
            
            {/* Dynamic Tabs based on Role */}
            {(() => {
              const displayTabs = [...TABS];
              if (currentUserRole === 'owner' || currentUserRole === 'admin') {
                displayTabs.splice(1, 0, { id: 'users', label: 'Users & Access', icon: Users });
              }
              
              return displayTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all outline-none
                      ${isActive 
                        ? tab.danger 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                          : 'bg-[#1e293b] text-white border border-[#334155] shadow-sm'
                        : tab.danger 
                          ? 'text-red-400/70 hover:bg-red-500/5 hover:text-red-400 border border-transparent'
                          : 'text-gray-400 hover:bg-[#1e293b]/50 hover:text-gray-300 border border-transparent'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? '' : 'opacity-70'}`} />
                    {tab.label}
                  </button>
                );
              });
            })()}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-[#0d1321] border border-[#1e293b] rounded-[24px] p-6 md:p-10 min-h-[500px]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Account Overview</h2>
                <p className="text-gray-400 text-sm">Review your live authentication and profile status.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#0a0f1c] border border-[#1e293b] p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest">Public Profile</span>
                    <span className="text-lg font-bold text-[#14f195]">{completionPercentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#14f195] to-emerald-400 rounded-full transition-all duration-1000"
                      style={{ width: `${completionPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-4">Calculated based on configured schema fields. Click "Edit Profile" to update.</p>
                </div>

                <div className="bg-[#0a0f1c] border border-[#1e293b] p-6 rounded-2xl">
                   <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest">Auth Provider</span>
                    <Lock className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1e293b] flex items-center justify-center">
                      <Shield className={`w-5 h-5 ${user.emailVerified ? 'text-[#14f195]' : 'text-yellow-400'}`} />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">Firebase Authentication</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{user.providerData[0]?.providerId || 'password'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1.5: USERS & ACCESS */}
          {activeTab === 'users' && (currentUserRole === 'owner' || currentUserRole === 'admin') && (
            <UsersManager currentUserRole={currentUserRole} />
          )}

          {/* TAB 2: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Appearance Settings</h2>
                <p className="text-gray-400 text-sm">Control the display mode of the AdminOS dashboard.</p>
              </div>

              <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-white font-bold mb-1">Interface Theme</h3>
                  <p className="text-gray-400 text-sm">Toggle between Dark Mode (default) and Light Mode.</p>
                </div>
                <button
                  onClick={handleThemeToggle}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all border ${
                    isDarkMode 
                      ? 'bg-[#1e293b] text-white border-[#334155] hover:bg-[#334155]' 
                      : 'bg-white text-gray-900 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY */}
          {activeTab === 'security' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Security Configuration</h2>
                <p className="text-gray-400 text-sm">Manage your Firebase authentication credentials.</p>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-6 max-w-lg">
                <div className="bg-[#0a0f1c] border border-[#1e293b] p-6 rounded-2xl space-y-5">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#14f195]" /> Update Password
                  </h3>
                  
                  <InputField
                    label="CURRENT PASSWORD"
                    type="password"
                    name="currentPassword"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    isMonospace
                  />
                  
                  <InputField
                    label="NEW PASSWORD"
                    type="password"
                    name="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    isMonospace
                  />
                  
                  <InputField
                    label="CONFIRM NEW PASSWORD"
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    isMonospace
                  />
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword}
                      className="px-6 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50 border border-[#334155]"
                    >
                      {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: DANGER ZONE */}
          {activeTab === 'danger' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Danger Zone</h2>
                <p className="text-gray-400 text-sm">Destructive and security-sensitive account operations.</p>
              </div>

              <div className="border border-red-500/20 bg-red-500/5 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <h3 className="text-red-400 font-bold mb-1 flex items-center gap-2">
                      <LogOut className="w-5 h-5" /> Sign Out
                    </h3>
                    <p className="text-gray-400 text-sm max-w-md">
                      Securely end your current session. You will need to re-authenticate with your email and password to access the AdminOS dashboard again.
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold rounded-lg border border-red-500/20 transition-all shrink-0"
                  >
                    Sign Out Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal is safely positioned outside conditional renders, 
          managing its own safe internal hooks */}
      <ProfileEditorModal 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        profileData={profileData} 
        onSave={handleProfileSave} 
        isSaving={isSavingProfile} 
      />
    </div>
  );
};

export default AccountCenter;
