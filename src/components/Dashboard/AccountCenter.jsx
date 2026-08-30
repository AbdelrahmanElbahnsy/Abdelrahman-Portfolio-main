import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import { useImageUpload } from '../../cms/hooks/useImageUpload';
import ImageUploader from '../../cms/components/ImageUploader';
import { auth } from '../../services/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { 
  User, Shield, Palette, AlertTriangle, 
  CheckCircle2, Clock, Calendar, Lock,
  LogOut, ShieldAlert, Activity, FileText, Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'personal', label: 'Personal Info', icon: User },
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

const AccountCenter = () => {
  // ─── HOOKS ─────────────────────────────────────────────────────────────────
  const { user, logout } = useAuth();
  
  const { 
    data: profileData, 
    loading: profileLoading, 
    setDocData, 
    subscribe 
  } = useFirestoreSingleDoc('profile', 'main');

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

  // ─── STATE ─────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Personal Info Form State
  const [formData, setFormData] = useState({});
  const [initialData, setInitialData] = useState({});
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security Tab State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // ─── EFFECTS ───────────────────────────────────────────────────────────────
  // Subscribe to real-time updates from Firestore profile/main
  useEffect(() => {
    const unsubscribe = subscribe();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [subscribe]);

  // Sync profile data to form state when data arrives
  useEffect(() => {
    if (profileData && Object.keys(initialData).length === 0) {
      const pData = {
        fullName: profileData.fullName || '',
        fullNameAr: profileData.fullNameAr || '',
        bio: profileData.bio || '',
        email: profileData.email || '',
        github: profileData.github || '',
        linkedin: profileData.linkedin || '',
        avatar: profileData.avatar || '',
        resumeUrl: profileData.resumeUrl || ''
      };
      setFormData(pData);
      setInitialData(pData);
    }
  }, [profileData, initialData]);

  // Initialize theme from localStorage/DOM
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isDark = !document.documentElement.classList.contains('light-theme');
      setIsDarkMode(isDark);
    }
  }, []);

  // ─── COMPUTED VALUES ───────────────────────────────────────────────────────
  // Calculate completion percentage based on the 8 core profile fields
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

  const isProfileDirty = useMemo(() => {
    const fields = ['fullName', 'fullNameAr', 'bio', 'email', 'github', 'linkedin'];
    const textDirty = fields.some(k => (formData[k] || '') !== (initialData[k] || ''));
    const filesDirty = avatarFile || resumeFile;
    return textDirty || !!filesDirty;
  }, [formData, initialData, avatarFile, resumeFile]);

  // ─── HANDLERS ──────────────────────────────────────────────────────────────
  const handleFormChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!isProfileDirty) return;
    
    setIsSavingProfile(true);
    try {
      const payload = {
        fullName: formData.fullName || '',
        fullNameAr: formData.fullNameAr || '',
        bio: formData.bio || '',
        email: formData.email || '',
        github: formData.github || '',
        linkedin: formData.linkedin || '',
      };

      // Handle avatar upload if changed
      if (avatarFile) {
        const url = await uploadAvatar('profile');
        if (url) payload.avatar = url;
      }

      // Handle resume upload if changed
      if (resumeFile) {
        // Upload resume directly to a media folder
        const url = await uploadResume('documents');
        if (url) payload.resumeUrl = url;
      }

      // The setDocData uses setDoc with { merge: true } under the hood, ensuring safe partial updates
      await setDocData(payload);
      toast.success('Profile updated successfully');
      
      // Reset upload states so new images become the 'initial' existing state visually
      if (avatarFile) resetAvatar();
      if (resumeFile) resetResume();
      
      // Update initial data tracker to prevent unnecessary saves
      setInitialData(prev => ({ ...prev, ...payload }));
      
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
      // 1. Re-authenticate first to prevent Firebase 'auth/requires-recent-login' errors
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // 2. Update password
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
      // Router will naturally redirect to /login due to AuthProvider protections
    } catch (err) {
      toast.error('Failed to sign out');
    }
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  if (!user || profileLoading) {
    return (
      <div className="flex items-center justify-center h-64 w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#14f195]"></div>
      </div>
    );
  }

  // Format dates securely checking existence
  const memberSince = user?.metadata?.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Unknown';
    
  const lastLogin = user?.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Unknown';

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* ═══ PREMIUM HEADER CARD ═══ */}
      <div className="relative w-full rounded-[24px] overflow-hidden bg-[#0d1321] border border-[#1e293b] shadow-2xl">
        {/* Abstract Background */}
        <div className="h-40 w-full bg-gradient-to-r from-[#0a0f1c] via-[#1e293b] to-[#0a0f1c] relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1321]"></div>
        </div>

        {/* Profile Details Area */}
        <div className="relative px-6 md:px-10 pb-8 flex flex-col md:flex-row gap-6 items-center md:items-end -mt-16 text-center md:text-left">
          
          {/* Avatar Container */}
          <div className="relative shrink-0">
            <div className="w-32 h-32 rounded-[20px] bg-[#0a0f1c] border-[4px] border-[#0d1321] shadow-2xl overflow-hidden flex items-center justify-center">
              {profileData?.avatar ? (
                <img src={profileData.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#1e293b] to-[#334155] flex items-center justify-center text-4xl font-black text-white">
                  {user.email[0].toUpperCase()}
                </div>
              )}
            </div>
            {/* Status indicator derived from auth */}
            <div className="absolute -bottom-2 -right-2 bg-[#0d1321] p-1.5 rounded-full border border-[#1e293b] shadow-lg">
              <div className="w-4 h-4 rounded-full bg-[#14f195] animate-pulse shadow-[0_0_10px_rgba(20,241,149,0.5)]"></div>
            </div>
          </div>

          {/* Info Block */}
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
              <p className="text-gray-400 font-mono text-sm mt-1">{user.email}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6 mt-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Since {memberSince}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Last: {lastLogin}</span>
              </div>
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
            {TABS.map((tab) => {
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
            })}
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
                
                {/* Completion Widget */}
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
                  <p className="text-xs text-gray-500 mt-4">Calculated based on {profileData ? Object.keys(profileData).length : 0} configured schema fields.</p>
                </div>

                {/* Authentication Widget */}
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

          {/* TAB 2: PERSONAL INFO */}
          {activeTab === 'personal' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Public Profile Information</h2>
                <p className="text-gray-400 text-sm">This data populates the main portfolio layout and SEO tags.</p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-2">
                <SectionHeader number="01" title="IDENTITY" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label="FULL NAME (ENGLISH)"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleFormChange}
                    placeholder="e.g. John Doe"
                  />
                  <InputField
                    label="FULL NAME (ARABIC)"
                    name="fullNameAr"
                    value={formData.fullNameAr}
                    onChange={handleFormChange}
                    placeholder="e.g. جون دو"
                  />
                </div>
                
                <div className="mt-5">
                  <InputField
                    label="SHORT BIO / DESCRIPTION"
                    name="bio"
                    type="textarea"
                    value={formData.bio}
                    onChange={handleFormChange}
                    placeholder="A brief description of who you are and what you do..."
                  />
                </div>

                <SectionHeader number="02" title="PUBLIC CONTACT & SOCIALS" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField
                    label="PUBLIC EMAIL (NOT AUTH)"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleFormChange}
                    isMonospace
                    helper="This is the email shown to visitors. Changing this does not affect your login email."
                  />
                  <InputField
                    label="GITHUB URL"
                    name="github"
                    value={formData.github}
                    onChange={handleFormChange}
                    isMonospace
                  />
                  <InputField
                    label="LINKEDIN URL"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleFormChange}
                    isMonospace
                  />
                </div>

                <SectionHeader number="03" title="MEDIA & DOCUMENTS" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-gray-400 mb-3 uppercase tracking-widest">
                      PORTRAIT AVATAR
                    </label>
                    <ImageUploader
                      imageFile={avatarFile}
                      existingImage={profileData?.avatar}
                      onFileChange={handleAvatarChange}
                      isUploading={isAvatarUploading}
                      uploadProgress={avatarProgress}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono font-bold text-gray-400 mb-3 uppercase tracking-widest">
                      RESUME / CV (PDF)
                    </label>
                    <div className="space-y-3">
                       <InputField
                        label=""
                        name="resumeUrl"
                        value={formData.resumeUrl}
                        onChange={handleFormChange}
                        isMonospace
                        placeholder="Direct URL or upload below..."
                      />
                      <div className="mt-2">
                        <ImageUploader
                          imageFile={resumeFile}
                          existingImage={null} // Don't show preview for PDF
                          onFileChange={handleResumeChange}
                          isUploading={isResumeUploading}
                          uploadProgress={resumeProgress}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-8 mt-8 border-t border-[#1e293b] flex justify-end">
                  <button
                    type="submit"
                    disabled={!isProfileDirty || isSavingProfile}
                    className="px-6 py-2.5 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] text-sm font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSavingProfile ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#0a0f1c]/30 border-t-[#0a0f1c] rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Changes</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: APPEARANCE */}
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

          {/* TAB 4: SECURITY */}
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

          {/* TAB 5: DANGER ZONE */}
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
    </div>
  );
};

export default AccountCenter;
