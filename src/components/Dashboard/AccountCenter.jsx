import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import UsersManager from './UsersManager';
import AppearanceManager from './AppearanceManager';
import { useImageUpload } from '../../cms/hooks/useImageUpload';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, updateProfile } from 'firebase/auth';
import { 
  Shield, Palette, AlertTriangle, 
  CheckCircle2, Clock, Calendar, Lock,
  LogOut, Activity, Edit2, X, Users, Upload
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
    <input
      type={type}
      name={name}
      value={value ?? ''}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full bg-[#030814]/50 border border-[#1e293b] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#14f195]/50 focus:ring-1 focus:ring-[#14f195]/50 transition-all ${isMonospace ? 'font-mono text-sm' : ''}`}
    />
    {helper && <p className="text-xs text-gray-500 mt-2">{helper}</p>}
  </div>
);

const SectionHeader = ({ number, title }) => (
  <div className="flex items-center gap-3 mt-8 mb-4 border-b border-[#1e293b] pb-2">
    <span className="text-[10px] font-mono font-bold text-[#14f195]/80 uppercase tracking-widest">{number} /</span>
    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">{title}</h3>
  </div>
);

const ProfileEditorModal = ({ isOpen, onClose, user, onSave, isSaving }) => {
  const { uploadImage, isUploading, resetUploadState, uploadProgress } = useImageUpload();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ displayName: '', photoURL: '' });
  const [initialData, setInitialData] = useState({ displayName: '', photoURL: '' });
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      const pData = {
        displayName: user.displayName || '',
        photoURL: user.photoURL || ''
      };
      setFormData(pData);
      setInitialData(pData);
      setAvatarFile(null);
      resetUploadState();
    }
  }, [isOpen, user, resetUploadState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSaving && !isUploading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, isUploading, onClose]);

  const isDirty = useMemo(() => {
    return formData.displayName !== initialData.displayName || !!avatarFile;
  }, [formData, initialData, avatarFile]);

  const tempAvatar = useMemo(() => {
    if (avatarFile) return URL.createObjectURL(avatarFile);
    return formData.photoURL;
  }, [avatarFile, formData.photoURL]);

  useEffect(() => {
    return () => {
      if (avatarFile && tempAvatar && tempAvatar.startsWith('blob:')) {
        URL.revokeObjectURL(tempAvatar);
      }
    };
  }, [tempAvatar, avatarFile]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDirty) return;
    
    await onSave(formData, avatarFile, uploadImage);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSaving && !isUploading) {
      onClose();
    }
  };

  const isWorking = isSaving || isUploading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
      <div className="absolute inset-0 bg-[#030814]/80 backdrop-blur-sm transition-opacity" onClick={handleOverlayClick}></div>
      <div className="relative w-full max-w-[600px] max-h-[95vh] md:max-h-[90vh] bg-[#0d1321] border border-[#1e293b] rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between p-6 border-b border-[#1e293b] bg-[#0d1321] shrink-0">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#14f195] mb-1 block">ADMIN ACCOUNT</span>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-gray-400" />
              Edit Account
            </h2>
          </div>
          <button onClick={onClose} disabled={isWorking} className="p-2 -mr-2 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors shrink-0 disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-[#1e293b] scrollbar-track-transparent">
          <form id="admin-account-form" onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto">
            <SectionHeader number="01" title="ACCOUNT IDENTITY" />
            
            <div className="flex flex-col md:flex-row gap-8 mb-6">
              <div className="shrink-0 flex flex-col items-center gap-3">
                <label className="block text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest text-center">Admin Avatar</label>
                <div className="relative w-32 h-32 rounded-2xl bg-[#1e293b] border border-[#334155] overflow-hidden group">
                  {tempAvatar ? (
                    <img src={tempAvatar} alt="Admin Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-500">
                      {formData.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white">
                      <Upload className="w-5 h-5" />
                    </button>
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-[#0d1321]/80 flex flex-col items-center justify-center">
                      <div className="text-[#14f195] text-xs font-mono font-bold mb-1">{uploadProgress}%</div>
                      <div className="w-2/3 h-1 bg-[#1e293b] rounded-full overflow-hidden">
                        <div className="h-full bg-[#14f195]" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              </div>
              
              <div className="flex-grow space-y-5 flex flex-col justify-center">
                <InputField
                  label="ADMIN DISPLAY NAME"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="e.g. Admin User"
                />
              </div>
            </div>
            
            <SectionHeader number="02" title="ACCOUNT INFORMATION" />
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex flex-col gap-2">
              <p className="text-sm text-blue-400 font-mono"><strong>Auth Email:</strong> {user.email}</p>
              <p className="text-sm text-blue-400 font-mono"><strong>Auth UID:</strong> {user.uid}</p>
              <p className="text-xs text-blue-400/80 mt-1">To change your email address or password, use the Security tab.</p>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#1e293b] bg-[#0d1321] shrink-0">
          <button type="button" onClick={onClose} disabled={isWorking} className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button type="submit" form="admin-account-form" disabled={!isDirty || isWorking} className="px-6 py-2.5 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] text-sm font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
            {isWorking ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0a0f1c]/30 border-t-[#0a0f1c] rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Account</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AccountCenter = () => {
  const { user, logout } = useAuth();
  const { data: adminData, subscribe: subscribeAdmin } = useFirestoreSingleDoc('admins', user?.uid);
  const currentUserRole = adminData?.role || 'viewer';

  const [activeTab, setActiveTab] = useState('overview');
  
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    let unsubscribeAdmin;
    if (user?.uid) {
      unsubscribeAdmin = subscribeAdmin();
    }
    return () => {
      if (unsubscribeAdmin) unsubscribeAdmin();
    };
  }, [subscribeAdmin, user?.uid]);

  const handleAccountSave = async (formData, avatarFile, uploadImage) => {
    setIsSavingAccount(true);
    try {
      let finalPhotoURL = formData.photoURL;
      if (avatarFile) {
        const url = await uploadImage(avatarFile);
        if (url) finalPhotoURL = url;
      }
      
      await updateProfile(user, {
        displayName: formData.displayName,
        photoURL: finalPhotoURL
      });
      
      // Force user object to refresh across the app if needed, 
      // but Firebase Auth listener usually catches it, or we just rely on local re-render
      // because we modified the user object in place somewhat, 
      // though usually a reload is not needed for display name.
      toast.success('Admin account updated securely');
      setIsEditorOpen(false);
    } catch (err) {
      toast.error(err.message || 'Error updating account');
    } finally {
      setIsSavingAccount(false);
    }
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
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
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

  if (!user) {
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
      <div className="relative w-full rounded-[24px] overflow-hidden bg-[#0d1321] border border-[#1e293b] shadow-2xl">
        <div className="h-40 w-full bg-gradient-to-r from-[#0a0f1c] via-[#1e293b] to-[#0a0f1c] relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d1321]"></div>
        </div>

        <div className="relative px-6 md:px-10 pb-8 flex flex-col md:flex-row gap-6 items-center md:items-end -mt-16 text-center md:text-left">
          
          <div className="relative shrink-0">
            <div className="w-32 h-32 rounded-[20px] bg-[#0a0f1c] border-[4px] border-[#0d1321] shadow-2xl overflow-hidden flex items-center justify-center">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Admin Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#1e293b] to-[#334155] flex items-center justify-center text-4xl font-black text-white">
                  {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
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
                  {user.displayName || 'Admin Account'}
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
            
            <div className="shrink-0 w-full md:w-auto">
              <button
                onClick={() => setIsEditorOpen(true)}
                className="w-full md:w-auto px-6 py-3 bg-[#1e293b] hover:bg-[#334155] text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-[#334155]"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col space-y-1.5 sticky top-24">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-3 block px-4">
              Account Settings
            </span>
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

        <div className="flex-1 bg-[#0d1321] border border-[#1e293b] rounded-[24px] p-6 md:p-10 min-h-[500px]">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Account Overview</h2>
                <p className="text-gray-400 text-sm">Review your real authentication status and admin account.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="bg-[#0a0f1c] border border-[#1e293b] p-6 rounded-2xl">
                   <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest">Admin Role</span>
                    <Users className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#1e293b] flex items-center justify-center">
                      <Activity className="w-5 h-5 text-[#14f195]" />
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm capitalize">{currentUserRole} Access</div>
                      <div className="text-xs text-gray-400 mt-0.5">Assigned via RBAC policies.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (currentUserRole === 'owner' || currentUserRole === 'admin') && (
            <UsersManager currentUserRole={currentUserRole} />
          )}

          {activeTab === 'appearance' && (
            <AppearanceManager currentUserRole={currentUserRole} />
          )}

          {activeTab === 'security' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Security Configuration</h2>
                <p className="text-gray-400 text-sm">Manage your real Firebase authentication credentials.</p>
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

      <ProfileEditorModal 
        isOpen={isEditorOpen} 
        onClose={() => setIsEditorOpen(false)} 
        user={user} 
        onSave={handleAccountSave} 
        isSaving={isSavingAccount} 
      />
    </div>
  );
};

export default AccountCenter;
