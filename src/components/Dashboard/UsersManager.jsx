import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  Users, UserPlus, Shield, CheckCircle2, Search,
  Edit2, ShieldAlert, Key, AlertTriangle, X,
  Filter, Calendar, Clock, Lock, Mail, ShieldCheck,
  Eye, Trash2, MoreVertical, LockOpen, RefreshCw,
  Globe, Fingerprint, ChevronDown, Copy, Check,
  WifiOff, UserX, Info, Circle
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const ROLE_LABELS = { owner: 'Owner', admin: 'Admin', editor: 'Editor', viewer: 'Viewer', unassigned: 'Unassigned' };
const ROLE_DESCRIPTIONS = {
  owner:      'Full system access — all controls',
  admin:      'Manage users and portfolio administration',
  editor:     'Manage portfolio content only',
  viewer:     'Read-only access',
  unassigned: 'No elevated permissions',
};
const ROLE_COLORS = {
  owner:      'bg-purple-500/10 text-purple-400 border-purple-500/20',
  admin:      'bg-blue-500/10 text-blue-400 border-blue-500/20',
  editor:     'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  viewer:     'bg-gray-500/10 text-gray-400 border-gray-500/20',
  unassigned: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const getProviderLabel = (providerData) => {
  const pid = providerData?.[0]?.providerId;
  if (pid === 'password') return 'Password';
  if (pid === 'google.com') return 'Google';
  if (pid) return pid;
  return 'Password';
};

const getProviderBadge = (providerData) => {
  const label = getProviderLabel(providerData);
  const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border uppercase tracking-wide';
  if (label === 'Google') return `${base} bg-blue-500/10 text-blue-300 border-blue-500/20`;
  return `${base} bg-gray-500/10 text-gray-400 border-gray-500/20`;
};

const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return '—'; }
};
const fmtDateTime = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
};

const PERMISSIONS_BY_ROLE = {
  owner:  ['Manage Users & Access', 'Manage Portfolio Content', 'Manage Appearance', 'Full System Administration'],
  admin:  ['Manage Users & Access', 'Manage Portfolio Content', 'Manage Appearance'],
  editor: ['Manage Portfolio Content', 'Manage Appearance'],
  viewer: [],
  unassigned: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// SAFE FETCH HELPER
// ─────────────────────────────────────────────────────────────────────────────

const safeFetchJson = async (url, options) => {
  let response;
  try { response = await fetch(url, options); }
  catch { throw new Error('Network error — unable to reach the server.'); }
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error(`Server returned an invalid response (${response.status}). Check server logs.`); }
  if (!response.ok) throw new Error(data.error?.message || data.error || `Request failed with status ${response.status}`);
  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// COPY BUTTON
// ─────────────────────────────────────────────────────────────────────────────

const CopyButton = ({ text, label = 'Copy' }) => {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { toast.error('Failed to copy'); }
  };
  return (
    <button onClick={handle} aria-label={`Copy ${label}`}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono font-bold border transition-all shrink-0 ${
        copied ? 'bg-[#14f195]/10 text-[#14f195] border-[#14f195]/30' : 'bg-[#1e293b] text-gray-400 border-[#334155] hover:text-white'
      }`}>
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied' : label}
    </button>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// USER AVATAR
// ─────────────────────────────────────────────────────────────────────────────

const UserAvatar = ({ user, size = 'md' }) => {
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-2xl', xl: 'w-24 h-24 text-4xl' };
  return (
    <div className={`relative shrink-0 rounded-xl bg-[#1e293b] border border-[#334155] overflow-hidden flex items-center justify-center ${sizes[size]}`}>
      {user.photoURL
        ? <img src={user.photoURL} alt={user.displayName || user.email} className="w-full h-full object-cover" />
        : <span className="font-bold text-gray-300 font-mono select-none">{(user.displayName || user.email || '?')[0].toUpperCase()}</span>
      }
      {user.emailVerified && (
        <div className="absolute -bottom-1 -right-1 bg-[#0a0f1c] rounded-full p-0.5 border border-[#1e293b]">
          <CheckCircle2 className="w-3 h-3 text-[#14f195]" />
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────────────────────────────────────────

const TableSkeleton = () => (
  <div className="animate-pulse flex flex-col gap-4 p-6">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-4 py-3 border-b border-[#1e293b]/50">
        <div className="w-10 h-10 rounded-xl bg-[#1e293b] shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#1e293b] rounded w-1/4" />
          <div className="h-3 bg-[#1e293b] rounded w-1/3" />
        </div>
        <div className="w-16 h-5 bg-[#1e293b] rounded-full hidden md:block" />
        <div className="w-14 h-5 bg-[#1e293b] rounded-full hidden md:block" />
        <div className="w-20 h-8 bg-[#1e293b] rounded-lg shrink-0" />
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRM ACTION MODAL (replaces window.confirm)
// ─────────────────────────────────────────────────────────────────────────────

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmLabel = 'Confirm', isDangerous = false, requireEmail = null, targetEmail = '' }) => {
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) { setInputVal(''); setTimeout(() => inputRef.current?.focus(), 100); }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  const canConfirm = !requireEmail || inputVal.trim() === targetEmail;

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#030814]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[440px] bg-[#0d1321] border border-[#1e293b] rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        <div className={`flex items-center gap-3 p-5 border-b ${isDangerous ? 'border-red-500/20 bg-red-500/5' : 'border-[#1e293b]'}`}>
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDangerous ? 'bg-red-500/10' : 'bg-[#1e293b]'}`}>
            {isDangerous ? <Trash2 className="w-4.5 h-4.5 text-red-400" /> : <AlertTriangle className="w-4.5 h-4.5 text-yellow-400" />}
          </div>
          <h2 className={`text-base font-bold ${isDangerous ? 'text-red-400' : 'text-white'}`}>{title}</h2>
          <button onClick={onClose} aria-label="Close" className="ml-auto p-1.5 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-300 leading-relaxed">{message}</p>
          {requireEmail && (
            <div>
              <label className="block text-[11px] font-mono font-bold text-gray-400 uppercase tracking-widest mb-2">
                Type <span className="text-white">{targetEmail}</span> to confirm
              </label>
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                className="w-full bg-[#030814] border border-[#1e293b] rounded-lg px-3 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-red-500/50 transition-all"
                placeholder={targetEmail}
              />
            </div>
          )}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-colors">Cancel</button>
            <button
              onClick={() => { if (canConfirm) { onConfirm(); onClose(); } }}
              disabled={!canConfirm}
              className={`px-5 py-2 text-sm font-bold rounded-lg transition-all disabled:opacity-40 ${
                isDangerous
                  ? 'bg-red-500/90 hover:bg-red-500 text-white'
                  : 'bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c]'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// USER DETAILS MODAL
// ─────────────────────────────────────────────────────────────────────────────

const UserDetailsModal = ({ isOpen, onClose, user, currentUserRole, onEdit, onResetPassword, onToggleDisable, onDelete }) => {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const isOwner = user.role === 'owner';
  const isSelf  = user.isCurrentUser;
  const canEdit    = (currentUserRole === 'owner' || currentUserRole === 'admin');
  
  // Specific permissions per action
  const canDisable = canEdit && !isOwner && !isSelf && (currentUserRole === 'owner' || user.role !== 'admin');
  const canDelete  = canEdit && !isOwner && !isSelf && (currentUserRole === 'owner' || user.role !== 'admin');
  const canReset   = canEdit && (currentUserRole === 'owner' || !isOwner) && !user.disabled;
  const perms = PERMISSIONS_BY_ROLE[user.role] || [];

  return (
    <div role="dialog" aria-modal="true" aria-label={`User details: ${user.displayName || user.email}`} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#030814]/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[580px] max-h-[92vh] bg-[#0d1321] border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e293b] bg-[#0d1321]/80 shrink-0">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#14f195] block mb-0.5">USER PROFILE</span>
            <h2 className="text-lg font-bold text-white tracking-tight">Account Details</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">

          {/* Profile Hero */}
          <div className="px-6 py-5 bg-[#0a0f1c]/60 border-b border-[#1e293b]">
            <div className="flex items-start gap-4">
              <UserAvatar user={user} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white truncate">{user.displayName || <span className="text-gray-500 italic text-base">Unnamed User</span>}</h3>
                  {isSelf && <span className="px-1.5 py-0.5 bg-[#14f195]/10 text-[#14f195] text-[9px] font-mono font-bold uppercase border border-[#14f195]/20 rounded">You</span>}
                </div>
                <p className="text-sm text-gray-400 font-mono break-all">{user.email}</p>
                <div className="flex flex-wrap gap-2 mt-2.5">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-mono font-bold uppercase tracking-widest ${ROLE_COLORS[user.role] || ROLE_COLORS.unassigned}`}>
                    {user.role === 'owner' && <Key className="w-3 h-3" />}
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-mono font-bold uppercase tracking-widest ${user.disabled ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-[#14f195]/8 text-[#14f195] border-[#14f195]/20'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.disabled ? 'bg-red-400' : 'bg-[#14f195]'}`} />
                    {user.disabled ? 'Disabled' : 'Active'}
                  </span>
                  {user.emailVerified
                    ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-mono font-bold bg-[#14f195]/8 text-[#14f195] border-[#14f195]/20"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                    : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-mono font-bold bg-yellow-500/8 text-yellow-400 border-yellow-500/20"><ShieldAlert className="w-3 h-3" /> Unverified</span>
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 space-y-5">

            {/* 01 / IDENTITY */}
            <section>
              <p className="text-[10px] font-mono font-bold text-[#14f195] uppercase tracking-widest mb-3 flex items-center gap-2"><span className="text-gray-500">01 /</span> Identity</p>
              <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-xl divide-y divide-[#1e293b]">
                <div className="flex items-start gap-3 p-4">
                  <Mail className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">Email</p>
                    <p className="text-sm text-white font-mono break-all">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4">
                  <Fingerprint className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-0.5">Firebase UID</p>
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className="text-sm text-white font-mono break-all flex-1 min-w-0">{user.uid}</p>
                      <CopyButton text={user.uid} label="Copy UID" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 02 / ACCESS */}
            <section>
              <p className="text-[10px] font-mono font-bold text-[#14f195] uppercase tracking-widest mb-3 flex items-center gap-2"><span className="text-gray-500">02 /</span> Access & Role</p>
              <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Role</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-mono font-bold uppercase ${ROLE_COLORS[user.role] || ROLE_COLORS.unassigned}`}>
                    {user.role === 'owner' && <Key className="w-3 h-3" />}
                    {ROLE_LABELS[user.role] || user.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Access Level</span>
                  <span className="text-xs text-gray-300 font-medium">{ROLE_DESCRIPTIONS[user.role] || '—'}</span>
                </div>
                <div className="pt-2 border-t border-[#1e293b]">
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-2">Granted Permissions</p>
                  {perms.length > 0
                    ? <ul className="space-y-1">{perms.map(p => (
                        <li key={p} className="flex items-center gap-2 text-xs text-gray-300">
                          <CheckCircle2 className="w-3 h-3 text-[#14f195] shrink-0" />{p}
                        </li>
                      ))}</ul>
                    : <p className="text-xs text-gray-500 italic">No elevated permissions.</p>
                  }
                </div>
              </div>
            </section>

            {/* 03 / AUTHENTICATION */}
            <section>
              <p className="text-[10px] font-mono font-bold text-[#14f195] uppercase tracking-widest mb-3 flex items-center gap-2"><span className="text-gray-500">03 /</span> Authentication</p>
              <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-xl divide-y divide-[#1e293b]">
                {[
                  { icon: Globe,       label: 'Auth Provider',   value: getProviderLabel(user.providerData) },
                  { icon: CheckCircle2,label: 'Email Verified',  value: user.emailVerified ? 'Verified' : 'Not Verified' },
                  { icon: Shield,      label: 'Account Status',  value: user.disabled ? 'Disabled' : 'Active' },
                  { icon: Calendar,    label: 'Account Created', value: fmtDate(user.creationTime) },
                  { icon: Clock,       label: 'Last Sign-In',    value: fmtDateTime(user.lastSignInTime) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 p-3.5">
                    <Icon className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-[11px] font-mono text-gray-500 uppercase tracking-wide flex-1">{label}</span>
                    <span className="text-sm text-white font-medium text-right">{value}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 04 / ACTIONS */}
            {canEdit && (
              <section className="pb-2">
                <p className="text-[10px] font-mono font-bold text-[#14f195] uppercase tracking-widest mb-3 flex items-center gap-2"><span className="text-gray-500">04 /</span> Actions</p>
                <div className="space-y-2">
                  {/* Primary actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button onClick={() => { onClose(); onEdit(user); }}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1e293b] hover:bg-[#293548] text-white text-sm font-bold rounded-xl border border-[#334155] transition-all">
                      <Edit2 className="w-4 h-4" /> Edit User
                    </button>
                    <div className="relative group">
                      <button onClick={() => { onClose(); onResetPassword(user); }}
                        disabled={!canReset}
                        title={user.disabled ? 'Password reset is unavailable while this account is disabled.' : (!canReset ? 'Admins cannot reset the Owner password.' : '')}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1e293b] hover:bg-[#293548] text-white text-sm font-bold rounded-xl border border-[#334155] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        <RefreshCw className="w-4 h-4 text-yellow-400" /> Send Password Reset
                      </button>
                    </div>
                  </div>
                  {/* Status toggle */}
                  <div className="relative group">
                    <button onClick={() => { onClose(); onToggleDisable(user); }}
                      disabled={!canDisable}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                        user.disabled
                          ? 'bg-[#14f195]/8 hover:bg-[#14f195]/15 text-[#14f195] border-[#14f195]/20'
                          : 'bg-yellow-500/8 hover:bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
                      }`}>
                      {user.disabled ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      {user.disabled ? 'Enable Account' : 'Disable Account'}
                    </button>
                    {!canDisable && (
                      <p className="text-[10px] text-gray-500 text-center mt-1 font-mono">
                        {isOwner ? 'Owner accounts are protected from being disabled.' : isSelf ? 'You cannot disable your own account.' : 'You do not have permission to disable this user.'}
                      </p>
                    )}
                  </div>
                  {/* Delete — visually separated */}
                  <div className="pt-2 border-t border-[#1e293b]">
                    <button onClick={() => { onClose(); onDelete(user); }}
                      disabled={!canDelete}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-xl border bg-red-500/8 hover:bg-red-500/15 text-red-400 border-red-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                      <Trash2 className="w-4 h-4" /> Delete User
                    </button>
                    {!canDelete && (
                      <p className="text-[10px] text-gray-500 text-center mt-1 font-mono">
                        {isOwner ? 'Owner accounts are protected from deletion.' : isSelf ? 'You cannot delete your own account.' : 'You do not have permission to delete this user.'}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ADD USER MODAL — redesigned
// ─────────────────────────────────────────────────────────────────────────────

const AddUserModal = ({ isOpen, onClose, onAdd, isSaving, currentUserRole }) => {
  const [form, setForm] = useState({ email: '', password: '', displayName: '', role: 'viewer' });

  useEffect(() => { if (isOpen) setForm({ email: '', password: '', displayName: '', role: 'viewer' }); }, [isOpen]);
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape' && isOpen && !isSaving) onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const availableRoles = currentUserRole === 'owner'
    ? ['admin', 'editor', 'viewer']
    : ['editor', 'viewer']; // admins cannot create admin/owner

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    onAdd(form);
  };

  return (
    <div role="dialog" aria-modal="true" aria-label="Add New User" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#030814]/80 backdrop-blur-sm" onClick={() => !isSaving && onClose()} />
      <div className="relative w-full max-w-[500px] max-h-[92vh] bg-[#0d1321] border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between p-6 border-b border-[#1e293b] shrink-0">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#14f195] mb-1 block">USER MANAGEMENT</span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2"><UserPlus className="w-5 h-5 text-[#14f195]" /> Add New User</h2>
            <p className="text-sm text-gray-400 mt-1">Create a new authorized account.</p>
          </div>
          <button onClick={onClose} disabled={isSaving} aria-label="Close" className="p-2 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors disabled:opacity-50">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <form id="add-user-form" onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: 'DISPLAY NAME (OPTIONAL)', name: 'displayName', type: 'text', placeholder: 'e.g. John Doe' },
              { label: 'EMAIL ADDRESS', name: 'email', type: 'email', placeholder: 'user@example.com', required: true },
              { label: 'TEMPORARY PASSWORD', name: 'password', type: 'password', placeholder: 'Min 6 characters', required: true },
            ].map(({ label, name, type, placeholder, required }) => (
              <div key={name}>
                <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">{label}</label>
                <input type={type} required={required} value={form[name]} placeholder={placeholder}
                  onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
                  className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#14f195]/50 transition-all font-mono" />
              </div>
            ))}
            <div>
              <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">ASSIGN ROLE</label>
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#14f195]/50 transition-all">
                {availableRoles.map(r => (
                  <option key={r} value={r}>{ROLE_LABELS[r]} — {ROLE_DESCRIPTIONS[r]}</option>
                ))}
              </select>
              <p className="text-[11px] text-gray-500 mt-2 font-mono">New users are assigned viewer access by default for safety.</p>
            </div>
          </form>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#1e293b] shrink-0">
          <button type="button" onClick={onClose} disabled={isSaving} className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors disabled:opacity-50">Cancel</button>
          <button type="submit" form="add-user-form" disabled={isSaving}
            className="px-6 py-2.5 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_0_15px_rgba(20,241,149,0.2)]">
            {isSaving ? <><div className="w-4 h-4 border-2 border-[#0a0f1c]/30 border-t-[#0a0f1c] rounded-full animate-spin" />Creating...</> : 'Create User'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EDIT USER MODAL — redesigned
// ─────────────────────────────────────────────────────────────────────────────

const EditUserModal = ({ isOpen, onClose, user, currentUserRole, onSave, isSaving }) => {
  const [form, setForm] = useState({ displayName: '', role: 'viewer', disabled: false });

  useEffect(() => {
    if (isOpen && user) setForm({ displayName: user.displayName || '', role: user.role || 'viewer', disabled: user.disabled || false });
  }, [isOpen, user]);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape' && isOpen && !isSaving) onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isOpen, isSaving, onClose]);

  if (!isOpen || !user) return null;

  const isTargetOwner = user.role === 'owner';
  const isSelf = user.isCurrentUser;
  const canEditName = currentUserRole === 'owner' || currentUserRole === 'admin';
  const canEditRole = (currentUserRole === 'owner' && !isTargetOwner) || (currentUserRole === 'admin' && !isTargetOwner && !isSelf && user.role !== 'admin');
  const canDisable  = (currentUserRole === 'owner' && !isTargetOwner && !isSelf) || (currentUserRole === 'admin' && !isTargetOwner && !isSelf && user.role !== 'admin');

  // Available roles for the dropdown depending on the authenticated user's role
  const availableRoles = currentUserRole === 'owner' ? ['admin', 'editor', 'viewer'] : ['editor', 'viewer'];

  return (
    <div role="dialog" aria-modal="true" aria-label={`Edit user: ${user.displayName || user.email}`} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#030814]/80 backdrop-blur-sm" onClick={() => !isSaving && onClose()} />
      <div className="relative w-full max-w-[500px] max-h-[92vh] bg-[#0d1321] border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between p-6 border-b border-[#1e293b] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar user={user} size="sm" />
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#14f195] block mb-0.5">EDITING USER</span>
              <h2 className="text-lg font-bold text-white truncate">{user.displayName || user.email}</h2>
              <p className="text-xs text-gray-400 font-mono truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} disabled={isSaving} aria-label="Close" className="p-2 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors shrink-0 disabled:opacity-50 ml-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Warnings */}
          {isTargetOwner && !isSelf && (
            <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-400">Owner accounts are protected. Administrative actions are restricted.</p>
            </div>
          )}
          {isSelf && (
            <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-400">You are editing your own account. Role and status changes are locked.</p>
            </div>
          )}

          {/* Display Name */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">Display Name</label>
            <input type="text" value={form.displayName}
              onChange={e => setForm(p => ({ ...p, displayName: e.target.value }))}
              disabled={!canEditName || isSaving}
              placeholder="e.g. John Doe"
              className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#14f195]/50 transition-all disabled:opacity-50" />
          </div>

          {/* Role */}
          <div>
            <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">Role</label>
            {canEditRole ? (
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} disabled={isSaving}
                className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#14f195]/50 transition-all disabled:opacity-50">
                {availableRoles.map(r => <option key={r} value={r}>{ROLE_LABELS[r]} — {ROLE_DESCRIPTIONS[r]}</option>)}
              </select>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#030814]/50 border border-[#1e293b] rounded-xl opacity-60">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${ROLE_COLORS[user.role] || ROLE_COLORS.unassigned}`}>
                  {user.role === 'owner' && <Key className="w-3 h-3" />}{ROLE_LABELS[user.role] || user.role}
                </span>
                <span className="text-xs text-gray-500">
                  {isTargetOwner ? 'Owner privileges cannot be modified.' : isSelf ? 'You cannot modify your own role.' : 'You lack permission to change this role.'}
                </span>
              </div>
            )}
          </div>

          {/* Account Status */}
          {canDisable && (
            <div>
              <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">Account Status</label>
              <label className="flex items-center gap-3 px-4 py-3 bg-[#030814]/50 border border-[#1e293b] rounded-xl cursor-pointer hover:border-gray-600 transition-colors">
                <input type="checkbox" checked={form.disabled} onChange={e => setForm(p => ({ ...p, disabled: e.target.checked }))}
                  disabled={isSaving}
                  className="w-4 h-4 rounded bg-[#1e293b] border-[#334155] text-red-500 focus:ring-red-500/50" />
                <span className={`text-sm font-bold ${form.disabled ? 'text-red-400' : 'text-white'}`}>
                  {form.disabled ? 'Account Disabled — Login Blocked' : 'Account Active — Login Allowed'}
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#1e293b] shrink-0">
          <button type="button" onClick={onClose} disabled={isSaving} className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors disabled:opacity-50">Cancel</button>
          <button onClick={() => onSave(user.uid, form)} disabled={isSaving || (!canEditRole && !canDisable && !canEditName)}
            className="px-6 py-2.5 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2">
            {isSaving ? <><div className="w-4 h-4 border-2 border-[#0a0f1c]/30 border-t-[#0a0f1c] rounded-full animate-spin" />Saving...</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ROW ACTION MENU (⋮)
// ─────────────────────────────────────────────────────────────────────────────

const RowActionMenu = ({ user, currentUserRole, currentUserId, onView, onEdit, onResetPassword, onToggleDisable, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const isOwner  = user.role === 'owner';
  const isSelf   = user.uid === currentUserId;
  const canEdit   = currentUserRole === 'owner' || currentUserRole === 'admin';
  const canDisable= canEdit && !isOwner && !isSelf && (currentUserRole === 'owner' || user.role !== 'admin');
  const canDelete = canEdit && !isOwner && !isSelf && (currentUserRole === 'owner' || user.role !== 'admin');
  const canReset  = canEdit && (currentUserRole === 'owner' || !isOwner) && !user.disabled;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} aria-label="More actions" aria-haspopup="true" aria-expanded={open}
        className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-[#1e293b] border border-transparent hover:border-[#334155] transition-all focus-visible:ring-2 focus-visible:ring-[#14f195]/50 outline-none">
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-[#0d1321] border border-[#1e293b] rounded-xl shadow-2xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-150">
          <div className="p-1">
            <button onClick={() => { setOpen(false); onView(user); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors text-left">
              <Eye className="w-4 h-4 text-gray-400 shrink-0" /> View Details
            </button>
            {canEdit && (
              <button onClick={() => { setOpen(false); onEdit({ ...user, isCurrentUser: isSelf }); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors text-left">
                <Edit2 className="w-4 h-4 text-blue-400 shrink-0" /> Edit User
              </button>
            )}
            {canReset && (
              <button onClick={() => { setOpen(false); onResetPassword(user); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors text-left">
                <RefreshCw className="w-4 h-4 text-yellow-400 shrink-0" /> Reset Password
              </button>
            )}
            {canDisable && (
              <button onClick={() => { setOpen(false); onToggleDisable(user); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[#1e293b] rounded-lg transition-colors text-left ${user.disabled ? 'text-[#14f195]' : 'text-yellow-400'}`}>
                {user.disabled ? <LockOpen className="w-4 h-4 shrink-0" /> : <Lock className="w-4 h-4 shrink-0" />}
                {user.disabled ? 'Enable Account' : 'Disable Account'}
              </button>
            )}
            {canDelete && (
              <>
                <div className="my-1 border-t border-[#1e293b]" />
                <button onClick={() => { setOpen(false); onDelete(user); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/8 rounded-lg transition-colors text-left">
                  <Trash2 className="w-4 h-4 shrink-0" /> Delete User
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN USERS MANAGER
// ─────────────────────────────────────────────────────────────────────────────

const UsersManager = ({ currentUserRole }) => {
  const { user } = useAuth();
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [errorState, setErrorState] = useState(null);

  // Filters
  const [search,         setSearch]         = useState('');
  const [roleFilter,     setRoleFilter]     = useState('all');
  const [statusFilter,   setStatusFilter]   = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [sortBy,         setSortBy]         = useState('role');

  // Modal state
  const [isAddOpen,     setIsAddOpen]     = useState(false);
  const [editingUser,   setEditingUser]   = useState(null);
  const [viewingUser,   setViewingUser]   = useState(null);
  const [isProcessing,  setIsProcessing]  = useState(false);

  // Confirmation modals
  const [confirmDelete,  setConfirmDelete]  = useState(null); // user object
  const [confirmDisable, setConfirmDisable] = useState(null); // user object
  const [confirmReset,   setConfirmReset]   = useState(null); // user object

  // ── Data loading ────────────────────────────────────────────────────────────

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setErrorState(null);
      const token = await user.getIdToken();
      const data = await safeFetchJson('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } });
      setUsers(data.users || []);
    } catch (err) {
      setErrorState(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Stats ───────────────────────────────────────────────────────────────────

  const stats = useMemo(() => users.reduce((acc, u) => {
    acc.total++;
    if (!u.disabled) acc.active++; else acc.disabled++;
    if (u.role === 'admin' || u.role === 'owner') acc.admins++;
    if (u.emailVerified) acc.verified++;
    return acc;
  }, { total: 0, active: 0, disabled: 0, admins: 0, verified: 0 }), [users]);

  // ── Filtered + sorted list ──────────────────────────────────────────────────

  const filteredUsers = useMemo(() => {
    let res = users;
    if (search) {
      const q = search.toLowerCase();
      res = res.filter(u =>
        (u.displayName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.uid || '').toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'all') res = res.filter(u => u.role === roleFilter);
    if (statusFilter !== 'all') res = res.filter(u => !!u.disabled === (statusFilter === 'disabled'));
    if (providerFilter !== 'all') {
      res = res.filter(u => {
        const pid = u.providerData?.[0]?.providerId;
        if (providerFilter === 'password') return pid === 'password' || !pid;
        if (providerFilter === 'google')   return pid === 'google.com';
        return pid && pid !== 'password' && pid !== 'google.com';
      });
    }
    const w = { owner: 4, admin: 3, editor: 2, viewer: 1, unassigned: 0 };
    return [...res].sort((a, b) => {
      if (sortBy === 'role')      return (w[b.role] || 0) - (w[a.role] || 0);
      if (sortBy === 'name')      return (a.displayName || a.email || '').localeCompare(b.displayName || b.email || '');
      if (sortBy === 'created')   return (new Date(b.creationTime).getTime() || 0) - (new Date(a.creationTime).getTime() || 0);
      if (sortBy === 'lastSignIn')return (new Date(b.lastSignInTime || 0).getTime()) - (new Date(a.lastSignInTime || 0).getTime());
      return 0;
    });
  }, [users, search, roleFilter, statusFilter, providerFilter, sortBy]);

  // ── Mutations ───────────────────────────────────────────────────────────────

  const withToken = async (fn) => {
    setIsProcessing(true);
    try {
      const token = await user.getIdToken();
      await fn(token);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddUser = async (formData) => {
    await withToken(async (token) => {
      await safeFetchJson('/api/admin/users', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      toast.success('User created successfully');
      setIsAddOpen(false);
      fetchUsers();
    }).catch(err => toast.error(err.message));
  };

  const handleUpdateUser = async (uid, data) => {
    await withToken(async (token) => {
      await safeFetchJson('/api/admin/users', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, ...data }),
      });
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    }).catch(err => toast.error(err.message));
  };

  const executeDelete = async (targetUser) => {
    await withToken(async (token) => {
      await safeFetchJson(`/api/admin/users?uid=${targetUser.uid}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('User deleted successfully');
      fetchUsers();
    }).catch(err => toast.error(err.message));
  };

  const executeToggleDisable = async (targetUser) => {
    await withToken(async (token) => {
      await safeFetchJson('/api/admin/users', {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: targetUser.uid, disabled: !targetUser.disabled }),
      });
      toast.success(targetUser.disabled ? 'Account enabled' : 'Account disabled');
      fetchUsers();
    }).catch(err => toast.error(err.message));
  };

  const executeResetPassword = async (targetUser) => {
    const toastId = toast.loading('Sending password reset email...');
    try {
      const { getAuth, sendPasswordResetEmail } = await import('firebase/auth');
      const auth = getAuth();
      await sendPasswordResetEmail(auth, targetUser.email);
      toast.success('Password reset email sent successfully.', { id: toastId });
    } catch (err) {
      console.error('Password reset error:', err);
      toast.error(err.message || 'Failed to send password reset email.', { id: toastId });
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-in fade-in duration-300">

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-[#14f195]/10 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-[#14f195]" />
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#14f195]">Identity & Access</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Users & Roles</h2>
          <p className="text-gray-400 text-sm mt-1">Manage platform access, roles, and administrative privileges.</p>
        </div>
        {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
          <button onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(20,241,149,0.2)] shrink-0">
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Users',     value: stats.total,    accent: 'text-white',       border: 'border-[#1e293b]' },
          { label: 'Active',          value: stats.active,   accent: 'text-[#14f195]',   border: 'border-[#14f195]/20', glow: true },
          { label: 'Disabled',        value: stats.disabled, accent: 'text-red-400',     border: 'border-red-500/20' },
          { label: 'Admins/Owners',   value: stats.admins,   accent: 'text-purple-400',  border: 'border-purple-500/20' },
          { label: 'Verified Email',  value: stats.verified, accent: 'text-blue-400',    border: 'border-blue-500/20' },
        ].map(({ label, value, accent, border, glow }) => (
          <div key={label} className={`bg-[#0a0f1c] border ${border} rounded-2xl p-4 ${glow ? 'shadow-[0_0_12px_rgba(20,241,149,0.05)]' : ''}`}>
            <p className={`text-[10px] font-mono font-bold uppercase tracking-wider mb-1.5 ${accent}`}>{label}</p>
            <p className={`text-2xl font-black ${accent}`}>{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">

        {/* Toolbar */}
        <div className="p-4 border-b border-[#1e293b] flex flex-col gap-3">
          {/* Search row */}
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#14f195] transition-colors pointer-events-none" />
            <input type="text" placeholder="Search by name, email or UID…" value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#030814] border border-[#1e293b] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#14f195]/50 transition-all font-mono" />
          </div>
          {/* Filters row */}
          <div className="flex flex-wrap gap-2">
            {[
              {
                label: 'Role', value: roleFilter, set: setRoleFilter,
                options: [
                  { value: 'all', label: 'All Roles' },
                  { value: 'owner', label: 'Owner' }, { value: 'admin', label: 'Admin' },
                  { value: 'editor', label: 'Editor' }, { value: 'viewer', label: 'Viewer' },
                  { value: 'unassigned', label: 'Unassigned' },
                ]
              },
              {
                label: 'Status', value: statusFilter, set: setStatusFilter,
                options: [{ value: 'all', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'disabled', label: 'Disabled' }]
              },
              {
                label: 'Auth', value: providerFilter, set: setProviderFilter,
                options: [{ value: 'all', label: 'All Providers' }, { value: 'password', label: 'Password' }, { value: 'google', label: 'Google' }, { value: 'other', label: 'Other' }]
              },
              {
                label: 'Sort', value: sortBy, set: setSortBy,
                options: [{ value: 'role', label: 'Sort: Role' }, { value: 'name', label: 'Sort: Name' }, { value: 'created', label: 'Sort: Created' }, { value: 'lastSignIn', label: 'Sort: Last Sign-In' }]
              },
            ].map(({ label, value, set, options }) => (
              <div key={label} className="relative">
                <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                <select value={value} onChange={e => set(e.target.value)} aria-label={`Filter by ${label}`}
                  className="bg-[#030814] border border-[#1e293b] rounded-lg pl-7 pr-7 py-2 text-[11px] font-bold text-gray-300 focus:outline-none focus:border-[#14f195]/50 transition-all appearance-none cursor-pointer hover:border-gray-600">
                  {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
              </div>
            ))}
            {(search || roleFilter !== 'all' || statusFilter !== 'all' || providerFilter !== 'all') && (
              <button onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); setProviderFilter('all'); }}
                className="flex items-center gap-1 px-3 py-2 text-[11px] font-bold text-gray-400 hover:text-white border border-[#1e293b] hover:border-gray-500 rounded-lg transition-all">
                <X className="w-3 h-3" /> Clear
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto overscroll-x-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
          {loading ? (
            <TableSkeleton />
          ) : errorState ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4 opacity-80" />
              <h3 className="text-lg font-bold text-white mb-2">Connection Error</h3>
              <p className="text-red-400 text-sm max-w-md mb-6 font-mono bg-red-500/10 p-4 rounded-xl border border-red-500/20">{errorState}</p>
              <button onClick={fetchUsers} className="px-6 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-white text-sm font-bold rounded-xl transition-all">
                Retry Request
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <UserX className="w-14 h-14 mb-4 text-gray-600" />
              <h3 className="text-base font-bold text-white mb-1">No users found</h3>
              <p className="text-sm text-gray-500">{search || roleFilter !== 'all' || statusFilter !== 'all' ? 'Try adjusting your search or filter criteria.' : 'No users have been added yet.'}</p>
            </div>
          ) : (
            <table className="w-full min-w-[760px] text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] bg-[#0d1321]">
                  {['User', 'Role', 'Status', 'Auth', 'Verification', 'Joined', 'Last Sign-In', 'Actions'].map(h => (
                    <th key={h} className={`px-5 py-3.5 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest ${
                      h === 'Joined' ? 'hidden sm:table-cell' : 
                      h === 'Last Sign-In' ? 'hidden lg:table-cell' : 
                      h === 'Verification' ? 'hidden md:table-cell' :
                      h === 'Actions' ? 'text-right' : ''
                    }`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/50">
                {filteredUsers.map(u => {
                  const isSelf = u.uid === user.uid;
                  return (
                    <tr key={u.uid} className="hover:bg-[#1e293b]/20 transition-colors">
                      {/* User */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={u} size="md" />
                          <div className="min-w-0">
                            <div className="text-white font-bold text-sm flex items-center gap-1.5 flex-wrap">
                              <span className="truncate max-w-[160px]">{u.displayName || <span className="text-gray-500 italic font-normal">Unnamed</span>}</span>
                              {isSelf && <span className="bg-[#14f195]/10 text-[#14f195] text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-widest border border-[#14f195]/20 shrink-0">You</span>}
                            </div>
                            <div className="text-gray-400 text-xs font-mono mt-0.5 truncate max-w-[180px]">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      {/* Role */}
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-mono font-bold uppercase tracking-widest ${ROLE_COLORS[u.role] || ROLE_COLORS.unassigned}`}>
                          {u.role === 'owner' && <Key className="w-3 h-3" />}
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${u.disabled ? 'bg-red-500' : 'bg-[#14f195] shadow-[0_0_6px_rgba(20,241,149,0.5)]'}`} />
                          <span className={`text-xs font-bold ${u.disabled ? 'text-red-400' : 'text-[#14f195]'}`}>
                            {u.disabled ? 'Disabled' : 'Active'}
                          </span>
                        </div>
                      </td>
                      {/* Auth Provider */}
                      <td className="px-5 py-3.5">
                        <span className={getProviderBadge(u.providerData)}>
                          {getProviderLabel(u.providerData)}
                        </span>
                      </td>
                      {/* Verification */}
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        {u.emailVerified ? (
                           <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#14f195]">
                             <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" /> Verified
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-gray-400">
                             <Circle className="w-3.5 h-3.5" aria-hidden="true" /> Unverified
                           </span>
                        )}
                      </td>
                      {/* Joined */}
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-gray-400 text-xs font-mono whitespace-nowrap">{fmtDate(u.creationTime)}</span>
                      </td>
                      {/* Last Sign-In */}
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="text-gray-400 text-xs font-mono whitespace-nowrap">{fmtDateTime(u.lastSignInTime)}</span>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setViewingUser({ ...u, isCurrentUser: isSelf })} title="View details" aria-label={`View details for ${u.displayName || u.email}`}
                            className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-[#1e293b] border border-transparent hover:border-[#334155] transition-all focus-visible:ring-2 focus-visible:ring-[#14f195]/50 outline-none">
                            <Eye className="w-4 h-4" />
                          </button>
                          {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                            <button onClick={() => setEditingUser({ ...u, isCurrentUser: isSelf })} title="Edit user" aria-label={`Edit ${u.displayName || u.email}`}
                              className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all focus-visible:ring-2 focus-visible:ring-blue-500/50 outline-none">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          <RowActionMenu
                            user={u}
                            currentUserRole={currentUserRole}
                            currentUserId={user.uid}
                            onView={(u) => setViewingUser({ ...u, isCurrentUser: u.uid === user.uid })}
                            onEdit={(u) => setEditingUser(u)}
                            onResetPassword={(u) => setConfirmReset(u)}
                            onToggleDisable={(u) => setConfirmDisable(u)}
                            onDelete={(u) => setConfirmDelete(u)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer count */}
        {!loading && !errorState && filteredUsers.length > 0 && (
          <div className="px-5 py-3 border-t border-[#1e293b] flex items-center justify-between">
            <p className="text-[11px] font-mono text-gray-500">
              Showing <span className="text-white font-bold">{filteredUsers.length}</span> of <span className="text-white font-bold">{users.length}</span> users
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ── */}

      <UserDetailsModal
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        user={viewingUser}
        currentUserRole={currentUserRole}
        onEdit={(u) => { setViewingUser(null); setEditingUser(u); }}
        onResetPassword={(u) => { setViewingUser(null); setConfirmReset(u); }}
        onToggleDisable={(u) => { setViewingUser(null); setConfirmDisable(u); }}
        onDelete={(u) => { setViewingUser(null); setConfirmDelete(u); }}
      />

      <AddUserModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddUser}
        isSaving={isProcessing}
        currentUserRole={currentUserRole}
      />

      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        currentUserRole={currentUserRole}
        onSave={handleUpdateUser}
        isSaving={isProcessing}
      />

      {/* Reset Password Confirm */}
      <ConfirmModal
        isOpen={!!confirmReset}
        onClose={() => setConfirmReset(null)}
        onConfirm={() => executeResetPassword(confirmReset)}
        title="Send Password Reset"
        message={`Send a Firebase password reset email directly to ${confirmReset?.displayName || confirmReset?.email}?`}
        confirmLabel="Send Email"
        isDangerous={false}
      />

      {/* Disable / Enable Confirm */}
      <ConfirmModal
        isOpen={!!confirmDisable}
        onClose={() => setConfirmDisable(null)}
        onConfirm={() => executeToggleDisable(confirmDisable)}
        title={confirmDisable?.disabled ? 'Enable Account' : 'Disable Account'}
        message={confirmDisable?.disabled
          ? `Re-enable login access for ${confirmDisable?.displayName || confirmDisable?.email}? They will immediately be able to sign in.`
          : `Disable login access for ${confirmDisable?.displayName || confirmDisable?.email}? This will prevent the account from authenticating until re-enabled.`
        }
        confirmLabel={confirmDisable?.disabled ? 'Enable Account' : 'Disable Account'}
        isDangerous={!confirmDisable?.disabled}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => executeDelete(confirmDelete)}
        title="Delete User"
        message={`Permanently delete the account for ${confirmDelete?.displayName || confirmDelete?.email}? This removes their Firebase Authentication record and admin access. This action cannot be undone.`}
        confirmLabel="Delete User"
        isDangerous={true}
        requireEmail={true}
        targetEmail={confirmDelete?.email || ''}
      />
    </div>
  );
};

export default UsersManager;
