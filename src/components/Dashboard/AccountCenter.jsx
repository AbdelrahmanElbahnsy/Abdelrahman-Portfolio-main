import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import UsersManager from './UsersManager';
import AppearanceManager from './AppearanceManager';
import { useImageUpload } from '../../cms/hooks/useImageUpload';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, updateProfile, sendEmailVerification } from 'firebase/auth';
import {
  Shield, Palette, AlertTriangle,
  CheckCircle2, Clock, Calendar, Lock,
  LogOut, Activity, Edit2, X, Users, Upload,
  Copy, Check, Key, ShieldCheck, ShieldAlert,
  UserCircle, Mail, Fingerprint, Globe, Zap,
  ChevronRight, Info, WifiOff
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
];

/** Role → display label */
const ROLE_LABELS = {
  owner: 'Owner',
  admin: 'Administrator',
  editor: 'Editor',
  viewer: 'Viewer',
};

/** Role → access level description */
const ACCESS_LEVELS = {
  owner:  'Full Administrative Access',
  admin:  'Content & User Management',
  editor: 'Content Management Only',
  viewer: 'Read-Only Access',
};

/** Role → badge color scheme */
const ROLE_COLORS = {
  owner:  'bg-purple-500/10 text-purple-400 border-purple-500/20',
  admin:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  editor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  viewer: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

/** Derive role-based permissions list */
const getPermissions = (role) => {
  const allPerms = [
    { label: 'Manage Users & Access',        roles: ['owner', 'admin'] },
    { label: 'Manage Portfolio Content',     roles: ['owner', 'admin', 'editor'] },
    { label: 'Manage Appearance & Theme',    roles: ['owner', 'admin', 'editor'] },
    { label: 'Manage Projects',              roles: ['owner', 'admin', 'editor'] },
    { label: 'Manage Skills',                roles: ['owner', 'admin', 'editor'] },
    { label: 'Manage Certifications',        roles: ['owner', 'admin', 'editor'] },
    { label: 'Manage Social Links',          roles: ['owner', 'admin', 'editor'] },
    { label: 'Manage System Settings',       roles: ['owner', 'admin'] },
    { label: 'Full System Administration',   roles: ['owner'] },
  ];
  return allPerms.filter((p) => p.roles.includes(role));
};

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SMALL COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

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

const ModalSectionHeader = ({ number, title }) => (
  <div className="flex items-center gap-3 mt-8 mb-4 border-b border-[#1e293b] pb-2">
    <span className="text-[10px] font-mono font-bold text-[#14f195]/80 uppercase tracking-widest">{number} /</span>
    <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest">{title}</h3>
  </div>
);

/** A compact meta-info row inside a section card */
const InfoRow = ({ icon: Icon, label, value, mono = false }) => (
  <div className="flex items-start gap-3 py-3 border-b border-[#1e293b]/60 last:border-0">
    <div className="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-gray-400" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-0.5">{label}</p>
      <p className={`text-sm text-white font-medium break-words ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  </div>
);

/** Section wrapper with consistent heading style */
const PageSection = ({ title, subtitle, children, className = '' }) => (
  <section className={`space-y-4 ${className}`}>
    <div className="flex items-baseline gap-3">
      <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-gray-500 font-mono hidden sm:block">{subtitle}</p>}
    </div>
    {children}
  </section>
);

// ─────────────────────────────────────────────────────────────────────────────
// COPY-TO-CLIPBOARD BUTTON
// ─────────────────────────────────────────────────────────────────────────────

const CopyButton = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold
        border transition-all duration-200 shrink-0
        ${copied
          ? 'bg-[#14f195]/10 text-[#14f195] border-[#14f195]/30'
          : 'bg-[#1e293b] text-gray-400 border-[#334155] hover:text-white hover:border-gray-500'
        }
      `}
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : label}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EDIT PROFILE MODAL (renamed from "Edit Account")
// ─────────────────────────────────────────────────────────────────────────────

const ProfileEditorModal = ({ isOpen, onClose, user, onSave, isSaving }) => {
  const { uploadImage, isUploading, resetUploadState, uploadProgress } = useImageUpload();
  const fileInputRef = useRef(null);

  const [formData, setFormData]     = useState({ displayName: '', photoURL: '' });
  const [initialData, setInitialData] = useState({ displayName: '', photoURL: '' });
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      const pData = {
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
      };
      setFormData(pData);
      setInitialData(pData);
      setAvatarFile(null);
      resetUploadState();
    }
  }, [isOpen, user, resetUploadState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSaving && !isUploading) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, isUploading, onClose]);

  const isDirty = useMemo(
    () => formData.displayName !== initialData.displayName || !!avatarFile,
    [formData, initialData, avatarFile]
  );

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

  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setAvatarFile(e.target.files[0]);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isDirty) return;
    await onSave(formData, avatarFile, uploadImage);
  };
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isSaving && !isUploading) onClose();
  };

  const isWorking = isSaving || isUploading;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Edit Profile"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6"
    >
      <div className="absolute inset-0 bg-[#030814]/80 backdrop-blur-sm" onClick={handleOverlayClick} />
      <div className="relative w-full max-w-[580px] max-h-[95vh] md:max-h-[90vh] bg-[#0d1321] border border-[#1e293b] rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#1e293b] bg-[#0d1321] shrink-0">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#14f195] mb-1 block">
              ADMIN PROFILE
            </span>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-gray-400" aria-hidden="true" />
              Edit Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isWorking}
            aria-label="Close modal"
            className="p-2 -mr-2 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors shrink-0 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 scrollbar-thin scrollbar-thumb-[#1e293b] scrollbar-track-transparent">
          <form id="admin-profile-form" onSubmit={handleSubmit} className="space-y-4 max-w-3xl mx-auto">
            <ModalSectionHeader number="01" title="PROFILE IDENTITY" />

            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 mb-2">
              {/* Avatar upload */}
              <div className="shrink-0 flex flex-col items-center gap-3">
                <label className="block text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest text-center">
                  Admin Avatar
                </label>
                <div className="relative w-28 h-28 rounded-2xl bg-[#1e293b] border border-[#334155] overflow-hidden group">
                  {tempAvatar ? (
                    <img src={tempAvatar} alt="Admin avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-500 select-none">
                      {formData.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Upload new avatar"
                      className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                    <span className="text-[10px] text-white/70 mt-1 font-mono">Upload</span>
                  </div>
                  {isUploading && (
                    <div className="absolute inset-0 bg-[#0d1321]/80 flex flex-col items-center justify-center">
                      <div className="text-[#14f195] text-xs font-mono font-bold mb-1">{uploadProgress}%</div>
                      <div className="w-2/3 h-1 bg-[#1e293b] rounded-full overflow-hidden">
                        <div className="h-full bg-[#14f195] transition-all" style={{ width: `${uploadProgress}%` }} />
                      </div>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" aria-hidden="true" />
                <p className="text-[10px] text-gray-500 font-mono text-center">Click avatar to change</p>
              </div>

              {/* Display name */}
              <div className="flex-grow flex flex-col justify-center space-y-5">
                <InputField
                  label="DISPLAY NAME"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="e.g. Abdelrahman El-bahnsy"
                />
              </div>
            </div>

            <ModalSectionHeader number="02" title="ACCOUNT INFORMATION" />
            <div className="bg-[#030814]/60 border border-[#1e293b] rounded-xl p-4 space-y-3">
              <div>
                <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Auth Email</p>
                <p className="text-sm text-gray-300 font-mono break-all">{user.email}</p>
              </div>
              <div className="border-t border-[#1e293b] pt-3">
                <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Firebase UID</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm text-gray-300 font-mono break-all flex-1 min-w-0">{user.uid}</p>
                  <CopyButton text={user.uid} label="Copy UID" />
                </div>
              </div>
              <p className="text-xs text-gray-500 border-t border-[#1e293b] pt-3">
                To change your email address or password, use the <strong className="text-gray-400">Security</strong> tab.
              </p>
            </div>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#1e293b] bg-[#0d1321] shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isWorking}
            className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="admin-profile-form"
            disabled={!isDirty || isWorking}
            className="px-6 py-2.5 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] text-sm font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isWorking ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0a0f1c]/30 border-t-[#0a0f1c] rounded-full animate-spin" aria-hidden="true" />
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
// OVERVIEW: PROFILE HERO
// ─────────────────────────────────────────────────────────────────────────────

const ProfileHero = ({ user, isEmailVerified, currentUserRole, onEditProfile }) => {
  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown';

  const lastSignIn = user?.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Unknown';

  const roleLabel = ROLE_LABELS[currentUserRole] || currentUserRole;
  const roleColor = ROLE_COLORS[currentUserRole] || ROLE_COLORS.viewer;
  const isOwner  = currentUserRole === 'owner';

  return (
    <div className="relative w-full rounded-[20px] overflow-hidden bg-[#0d1321] border border-[#1e293b] shadow-2xl">
      {/* Ambient grid background */}
      <div className="h-32 w-full bg-gradient-to-r from-[#0a0f1c] via-[#0f1a2e] to-[#0a0f1c] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:28px_28px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0d1321]" />
        {/* Subtle emerald glow top-left */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#14f195]/5 rounded-full blur-3xl" />
      </div>

      {/* Content area */}
      <div className="relative px-5 sm:px-8 pb-7 flex flex-col sm:flex-row gap-5 items-center sm:items-end -mt-14 text-center sm:text-left">

        {/* Avatar */}
        <div className="relative shrink-0 z-10">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[18px] bg-[#0a0f1c] border-[3px] border-[#0d1321] shadow-2xl overflow-hidden flex items-center justify-center">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Admin avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-[#1e293b] to-[#334155] flex items-center justify-center text-3xl sm:text-4xl font-black text-white select-none">
                {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
            )}
          </div>
          {/* Active indicator */}
          <div className="absolute -bottom-1.5 -right-1.5 bg-[#0d1321] p-1 rounded-full border border-[#1e293b]">
            <div className="w-3.5 h-3.5 rounded-full bg-[#14f195] animate-pulse shadow-[0_0_8px_rgba(20,241,149,0.6)]" title="Session active" />
          </div>
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-end justify-between gap-4 w-full mt-2 sm:mt-0">
          <div className="min-w-0">
            {/* Role + owner badge row */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-mono font-bold uppercase tracking-widest ${roleColor}`}>
                {isOwner && <Key className="w-3 h-3" aria-hidden="true" />}
                {roleLabel}
              </span>
              {isEmailVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-mono font-bold uppercase tracking-widest bg-[#14f195]/8 text-[#14f195] border-[#14f195]/20">
                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" /> Verified Email
                </span>
              )}
              {!isEmailVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-mono font-bold uppercase tracking-widest bg-yellow-500/8 text-yellow-400 border-yellow-500/20">
                  <ShieldAlert className="w-3 h-3" aria-hidden="true" /> Unverified Email
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight truncate">
              {user.displayName || 'Admin Account'}
            </h1>
            <p className="text-gray-400 font-mono text-sm mt-1 break-all">{user.email}</p>

            {/* Timestamps */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-5 mt-3 text-[11px] font-mono text-gray-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                Created {memberSince}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                Last sign‑in {lastSignIn}
              </span>
            </div>
          </div>

          {/* Edit Profile CTA */}
          <div className="shrink-0 w-full sm:w-auto">
            <button
              onClick={onEditProfile}
              className="w-full sm:w-auto px-5 py-2.5 bg-[#1e293b] hover:bg-[#293548] text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-[#334155] hover:border-[#475569] text-sm"
            >
              <Edit2 className="w-4 h-4" aria-hidden="true" />
              Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW: ACCOUNT OVERVIEW CARDS
// ─────────────────────────────────────────────────────────────────────────────

const AccountOverviewCards = ({ user, isEmailVerified, currentUserRole }) => {
  const memberSince = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Unknown';
  const lastSignIn = user?.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Unknown';
  const provider = user.providerData?.[0]?.providerId || 'password';
  const providerLabel = provider === 'password' ? 'Email / Password' : provider === 'google.com' ? 'Google OAuth' : provider;

  const cards = [
    {
      label: 'Session Status',
      value: 'Active',
      icon: Zap,
      accent: 'text-[#14f195]',
      dot: 'bg-[#14f195] shadow-[0_0_8px_rgba(20,241,149,0.5)]',
      note: 'Currently authenticated',
    },
    {
      label: 'Admin Role',
      value: ROLE_LABELS[currentUserRole] || currentUserRole,
      icon: Key,
      accent: currentUserRole === 'owner' ? 'text-purple-400' : currentUserRole === 'admin' ? 'text-blue-400' : 'text-emerald-400',
      note: 'Via RBAC policies',
    },
    {
      label: 'Auth Provider',
      value: providerLabel,
      icon: Globe,
      accent: 'text-gray-300',
      note: 'Firebase Authentication',
    },
    {
      label: 'Email Status',
      value: isEmailVerified ? 'Verified' : 'Unverified',
      icon: Mail,
      accent: isEmailVerified ? 'text-[#14f195]' : 'text-yellow-400',
      note: isEmailVerified ? 'Identity confirmed' : 'Verification pending',
    },
    {
      label: 'Last Sign-In',
      value: lastSignIn,
      icon: Clock,
      accent: 'text-gray-300',
      note: 'Most recent session',
    },
    {
      label: 'Account Created',
      value: memberSince,
      icon: Calendar,
      accent: 'text-gray-300',
      note: 'Registration date',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-[#0a0f1c] border border-[#1e293b] rounded-2xl p-5 hover:border-[#334155] transition-colors duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest">{card.label}</span>
              <div className="w-7 h-7 rounded-lg bg-[#1e293b] flex items-center justify-center">
                <Icon className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              {card.dot && (
                <div className={`w-2 h-2 rounded-full shrink-0 ${card.dot}`} aria-hidden="true" />
              )}
              <span className={`text-base font-bold leading-snug ${card.accent}`}>{card.value}</span>
            </div>
            <p className="text-[11px] text-gray-500 font-mono">{card.note}</p>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW: PERSONAL INFORMATION
// ─────────────────────────────────────────────────────────────────────────────

const PersonalInformation = ({ user, onEditProfile }) => (
  <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-2xl overflow-hidden">
    {/* Section label bar */}
    <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#0d1321]/50">
      <div className="flex items-center gap-2">
        <UserCircle className="w-4 h-4 text-[#14f195]" aria-hidden="true" />
        <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest">Personal Information</span>
      </div>
      <button
        onClick={onEditProfile}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-gray-400 hover:text-white bg-[#1e293b] hover:bg-[#293548] border border-[#334155] rounded-lg transition-all"
      >
        <Edit2 className="w-3 h-3" aria-hidden="true" />
        Edit
      </button>
    </div>

    <div className="px-6 py-2">
      <InfoRow icon={UserCircle} label="Display Name" value={user.displayName || '—'} />
      <InfoRow icon={Mail}       label="Auth Email"   value={user.email} mono />

      {/* UID with copy */}
      <div className="flex items-start gap-3 py-3">
        <div className="w-8 h-8 rounded-lg bg-[#1e293b] flex items-center justify-center shrink-0 mt-0.5">
          <Fingerprint className="w-4 h-4 text-gray-400" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-1">Firebase UID</p>
          <div className="flex items-start gap-2 flex-wrap">
            <p className="text-sm text-white font-mono break-all flex-1 min-w-0 leading-relaxed">{user.uid}</p>
            <CopyButton text={user.uid} label="Copy UID" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW: SECURITY SNAPSHOT
// ─────────────────────────────────────────────────────────────────────────────

const SecuritySnapshot = ({ user, isEmailVerified, onNavigateToSecurity }) => {
  const provider = user.providerData?.[0]?.providerId || 'password';
  const providerLabel = provider === 'password' ? 'Email / Password' : provider === 'google.com' ? 'Google OAuth' : provider;
  const hasPasswordAuth = user.providerData?.some((p) => p.providerId === 'password');

  return (
    <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#0d1321]/50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#14f195]" aria-hidden="true" />
          <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest">Security Snapshot</span>
        </div>
      </div>

      <div className="px-6 py-2">
        <InfoRow icon={Lock}        label="Auth Method"          value={providerLabel} />
        <InfoRow icon={Mail}        label="Email Verification"   value={isEmailVerified ? 'Verified' : 'Not Verified'} />
        <InfoRow icon={Key}         label="Password Auth"        value={hasPasswordAuth ? 'Enabled' : 'Not Configured'} />
        <InfoRow icon={Clock}       label="Last Auth Activity"   value={
          user.metadata?.lastSignInTime
            ? new Date(user.metadata.lastSignInTime).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
            : 'Unknown'
        } />
      </div>

      <div className="px-6 py-4 border-t border-[#1e293b]">
        <button
          onClick={onNavigateToSecurity}
          className="inline-flex items-center gap-1.5 text-sm font-bold text-[#14f195] hover:text-[#14f195]/80 transition-colors"
        >
          Manage Security Settings
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW: ADMIN ACCESS
// ─────────────────────────────────────────────────────────────────────────────

const AdminAccess = ({ currentUserRole, onNavigateToUsers }) => {
  const permissions = getPermissions(currentUserRole);
  const roleLabel   = ROLE_LABELS[currentUserRole]  || currentUserRole;
  const accessLevel = ACCESS_LEVELS[currentUserRole] || 'Role-limited access';
  const roleColor   = ROLE_COLORS[currentUserRole]  || ROLE_COLORS.viewer;
  const canSeeUsers = currentUserRole === 'owner' || currentUserRole === 'admin';

  return (
    <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 border-b border-[#1e293b] bg-[#0d1321]/50">
        <Shield className="w-4 h-4 text-[#14f195]" aria-hidden="true" />
        <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest">Admin Access</span>
      </div>

      <div className="px-6 pt-4 pb-2">
        {/* Role + access level */}
        <div className="flex flex-col sm:flex-row gap-4 mb-5">
          <div className="flex-1 bg-[#0d1321] border border-[#1e293b] rounded-xl p-4">
            <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Admin Role</p>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-mono font-bold uppercase tracking-wider ${roleColor}`}>
              {currentUserRole === 'owner' && <Key className="w-3.5 h-3.5" aria-hidden="true" />}
              {roleLabel}
            </span>
          </div>
          <div className="flex-1 bg-[#0d1321] border border-[#1e293b] rounded-xl p-4">
            <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-2">Access Level</p>
            <p className="text-sm font-bold text-white">{accessLevel}</p>
          </div>
        </div>

        {/* RBAC badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#14f195] shadow-[0_0_6px_rgba(20,241,149,0.5)]" aria-hidden="true" />
          <span className="text-[11px] font-mono text-gray-400">RBAC policies active — role enforced by Firestore rules</span>
        </div>

        {/* Permissions */}
        <div>
          <p className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest mb-3">Granted Permissions</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="list">
            {permissions.map((perm) => (
              <li
                key={perm.label}
                className="flex items-center gap-2 text-sm text-gray-300"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[#14f195] shrink-0" aria-hidden="true" />
                {perm.label}
              </li>
            ))}
          </ul>
          {permissions.length === 0 && (
            <p className="text-sm text-gray-500 italic">No elevated permissions for this role.</p>
          )}
        </div>
      </div>

      {canSeeUsers && (
        <div className="px-6 py-4 border-t border-[#1e293b]">
          <button
            onClick={onNavigateToUsers}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#14f195] hover:text-[#14f195]/80 transition-colors"
          >
            View Users &amp; Permissions
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW: RECENT ACTIVITY (empty state — no audit log exists)
// ─────────────────────────────────────────────────────────────────────────────

const RecentActivity = () => (
  <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-2xl overflow-hidden">
    <div className="flex items-center gap-2 px-6 py-4 border-b border-[#1e293b] bg-[#0d1321]/50">
      <Activity className="w-4 h-4 text-[#14f195]" aria-hidden="true" />
      <span className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest">Recent Activity</span>
    </div>

    <div className="flex flex-col items-center justify-center py-14 px-6 text-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-[#1e293b] border border-[#334155] flex items-center justify-center">
        <WifiOff className="w-6 h-6 text-gray-600" aria-hidden="true" />
      </div>
      <div>
        <p className="text-white font-bold text-sm mb-1">Activity log not configured</p>
        <p className="text-gray-500 text-xs font-mono max-w-xs leading-relaxed">
          Audit logging is not active for this AdminOS instance. Enable server-side audit logging to track admin events.
        </p>
      </div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e293b] border border-[#334155] text-[10px] font-mono text-gray-500">
        <Info className="w-3 h-3" aria-hidden="true" />
        No activity data available
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW TAB — assembled from sections above
// ─────────────────────────────────────────────────────────────────────────────

const OverviewTab = ({ user, isEmailVerified, currentUserRole, onEditProfile, onNavigateToSecurity, onNavigateToUsers }) => (
  <div className="space-y-8 animate-in fade-in duration-300">
    {/* A. Profile Hero */}
    <ProfileHero user={user} isEmailVerified={isEmailVerified} currentUserRole={currentUserRole} onEditProfile={onEditProfile} />

    {/* B. Account Overview Cards */}
    <PageSection title="Account Overview" subtitle="Real-time authentication metadata">
      <AccountOverviewCards user={user} isEmailVerified={isEmailVerified} currentUserRole={currentUserRole} />
    </PageSection>

    {/* C. Personal Information */}
    <PageSection title="Personal Information" subtitle="Identity &amp; identifiers">
      <PersonalInformation user={user} onEditProfile={onEditProfile} />
    </PageSection>

    {/* D + E: two-column on large, single on small */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* D. Security Snapshot */}
      <PageSection title="Security Snapshot">
        <SecuritySnapshot user={user} isEmailVerified={isEmailVerified} onNavigateToSecurity={onNavigateToSecurity} />
      </PageSection>

      {/* E. Admin Access */}
      <PageSection title="Admin Access">
        <AdminAccess currentUserRole={currentUserRole} onNavigateToUsers={onNavigateToUsers} />
      </PageSection>
    </div>

    {/* F. Recent Activity */}
    <PageSection title="Recent Activity" subtitle="Audit event log">
      <RecentActivity />
    </PageSection>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY: EMAIL VERIFICATION CARD
// ─────────────────────────────────────────────────────────────────────────────

const EmailVerificationCard = ({ user, isEmailVerified, refreshUser }) => {
  const [isSending, setIsSending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleSendVerification = async () => {
    setIsSending(true);
    try {
      await sendEmailVerification(user);
      toast.success('Verification email sent successfully.');
      setCooldown(60);
    } catch (err) {
      if (err.code === 'auth/too-many-requests') {
        toast.error('Too many requests. Please try again later.');
      } else {
        toast.error('Failed to send verification email.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckAgain = async () => {
    setIsChecking(true);
    try {
      await refreshUser();
      // wait a tiny bit to ensure state reflects 
      // but actually useAuth sets state. We can check user.emailVerified directly since it mutated.
      if (user.emailVerified) {
        toast.success('Email is verified.');
      } else {
        toast.error('Email is still unverified.');
      }
    } catch (err) {
      toast.error('Failed to check verification status.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="bg-[#0a0f1c] border border-[#1e293b] p-6 rounded-2xl space-y-5">
      <h3 className="text-white font-bold mb-1 flex items-center gap-2">
        {isEmailVerified ? (
          <CheckCircle2 className="w-5 h-5 text-[#14f195]" aria-hidden="true" />
        ) : (
          <ShieldAlert className="w-5 h-5 text-yellow-400" aria-hidden="true" />
        )}
        Email Verification
      </h3>
      
      {isEmailVerified ? (
        <div className="bg-[#14f195]/10 border border-[#14f195]/20 rounded-xl p-4">
          <p className="text-sm font-bold text-[#14f195] mb-1">VERIFIED EMAIL</p>
          <p className="text-xs text-[#14f195]/80 font-mono">Your email address is verified.</p>
        </div>
      ) : (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <p className="text-sm font-bold text-yellow-400 mb-1">UNVERIFIED EMAIL</p>
          <p className="text-xs text-yellow-400/80 font-mono">Your email address has not been verified yet.</p>
        </div>
      )}

      {!isEmailVerified && (
        <div className="pt-2 flex flex-wrap gap-3">
          <button
            onClick={handleSendVerification}
            disabled={isSending || cooldown > 0}
            aria-label="Send Verification Email"
            className="px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 border border-[#334155]"
          >
            {isSending ? 'Sending...' : cooldown > 0 ? `Resend available in ${cooldown}s` : 'Send Verification Email'}
          </button>
          
          <button
            onClick={handleCheckAgain}
            disabled={isChecking}
            aria-label="Check verification again"
            className="px-4 py-2 bg-transparent hover:bg-[#1e293b] text-gray-400 hover:text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 border border-[#334155]"
          >
            {isChecking ? 'Checking...' : 'Check Again'}
          </button>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT CENTER (main page)
// ─────────────────────────────────────────────────────────────────────────────

const AccountCenter = () => {
  const { user, logout, isEmailVerified, refreshUser } = useAuth();
  const { data: adminData, subscribe: subscribeAdmin } = useFirestoreSingleDoc('admins', user?.uid);
  const currentUserRole = adminData?.role || 'viewer';

  const [activeTab, setActiveTab] = useState('overview');

  const [isEditorOpen,    setIsEditorOpen]    = useState(false);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  const [currentPassword,  setCurrentPassword]  = useState('');
  const [newPassword,      setNewPassword]      = useState('');
  const [confirmPassword,  setConfirmPassword]  = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    let unsubscribeAdmin;
    if (user?.uid) {
      unsubscribeAdmin = subscribeAdmin();
    }
    return () => { if (unsubscribeAdmin) unsubscribeAdmin(); };
  }, [subscribeAdmin, user?.uid]);

  // ── Handlers ────────────────────────────────────────────────────────────────

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
        photoURL: finalPhotoURL,
      });
      toast.success('Profile updated successfully');
      setIsEditorOpen(false);
    } catch (err) {
      toast.error(err.message || 'Error updating profile');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('New passwords do not match'); return; }
    if (newPassword.length < 6)          { toast.error('Password must be at least 6 characters'); return; }

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
        toast.error('Please sign out and sign in again before changing your password.');
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
    } catch {
      toast.error('Failed to sign out');
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────────

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64 w-full" aria-label="Loading account data">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#14f195]" />
      </div>
    );
  }

  // ── Build tab list (inject Users & Access for owner/admin) ──────────────────

  const displayTabs = [...TABS];
  if (currentUserRole === 'owner' || currentUserRole === 'admin') {
    displayTabs.splice(1, 0, { id: 'users', label: 'Users & Access', icon: Users });
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Page title (visible above the tab shell) */}
      <div className="px-1">
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#14f195] mb-0.5">
          Admin Identity
        </p>
        <h1 className="text-2xl font-black text-white tracking-tight">Account Center</h1>
        <p className="text-sm text-gray-400 mt-1">Profile, security &amp; administrative access controls.</p>
      </div>

      {/* Tab shell */}
      <div className="flex flex-col md:flex-row gap-5 md:gap-7">

        {/* Sidebar nav */}
        <div className="w-full md:w-56 shrink-0">
          <nav
            aria-label="Account Center navigation"
            className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible md:sticky md:top-24 pb-1 md:pb-0 hide-scrollbar"
            style={{ overscrollBehaviorX: 'contain' }}
          >
            <span className="hidden md:block text-[10px] font-mono font-bold uppercase tracking-widest text-gray-500 mb-2 px-3">
              Account Settings
            </span>
            {displayTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`
                    shrink-0 md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-2.5
                    px-3.5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all outline-none
                    focus-visible:ring-2 focus-visible:ring-[#14f195]/50
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
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? '' : 'opacity-70'}`} aria-hidden="true" />
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab content pane */}
        <div className="flex-1 min-w-0 bg-[#0d1321] border border-[#1e293b] rounded-[20px] p-5 md:p-8 min-h-[500px]">

          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <OverviewTab
              user={user}
              isEmailVerified={isEmailVerified}
              currentUserRole={currentUserRole}
              onEditProfile={() => setIsEditorOpen(true)}
              onNavigateToSecurity={() => setActiveTab('security')}
              onNavigateToUsers={() => setActiveTab('users')}
            />
          )}

          {/* USERS & ACCESS */}
          {activeTab === 'users' && (currentUserRole === 'owner' || currentUserRole === 'admin') && (
            <UsersManager currentUserRole={currentUserRole} />
          )}

          {/* APPEARANCE */}
          {activeTab === 'appearance' && (
            <AppearanceManager currentUserRole={currentUserRole} />
          )}

          {/* SECURITY */}
          {activeTab === 'security' && (
            <div className="animate-in fade-in duration-300">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Security Configuration</h2>
                <p className="text-gray-400 text-sm">Manage your Firebase authentication credentials.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <EmailVerificationCard user={user} isEmailVerified={isEmailVerified} refreshUser={refreshUser} />

                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                  <div className="bg-[#0a0f1c] border border-[#1e293b] p-6 rounded-2xl space-y-5">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#14f195]" aria-hidden="true" /> Update Password
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
            </div>
          )}

          {/* DANGER ZONE */}
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
                      <LogOut className="w-5 h-5" aria-hidden="true" /> Sign Out
                    </h3>
                    <p className="text-gray-400 text-sm max-w-md">
                      Securely end your current admin session. You will need to re-authenticate with your credentials to access the AdminOS dashboard.
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

      {/* Edit Profile Modal */}
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
