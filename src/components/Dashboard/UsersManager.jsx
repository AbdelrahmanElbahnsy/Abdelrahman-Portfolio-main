import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Users, UserPlus, Shield, CheckCircle2, Search, 
  MoreVertical, Edit2, ShieldAlert, Key, UserX, AlertTriangle, X,
  Filter, Calendar, Clock, Lock, Mail, ShieldCheck, Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// SAFE FETCH HELPER
// ─────────────────────────────────────────────────────────────────────────────
const safeFetchJson = async (url, options) => {
  let response;
  try {
    response = await fetch(url, options);
  } catch (networkError) {
    throw new Error('Network error: Unable to connect to the server.');
  }

  const text = await response.text();
  let data;
  
  try {
    data = JSON.parse(text);
  } catch (parseError) {
    throw new Error(`Server returned an invalid response (${response.status}). Please check server logs.`);
  }

  if (!response.ok) {
    throw new Error(data.error?.message || data.error || `Request failed with status ${response.status}`);
  }

  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────────────────────────────────────────
const TableSkeleton = () => (
  <div className="animate-pulse flex flex-col gap-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-6 py-4 px-6 border-b border-[#1e293b]/50">
        <div className="w-12 h-12 rounded-xl bg-[#1e293b] shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#1e293b] rounded w-1/3" />
          <div className="h-3 bg-[#1e293b] rounded w-1/4" />
        </div>
        <div className="w-24 h-6 bg-[#1e293b] rounded-full hidden md:block" />
        <div className="w-20 h-6 bg-[#1e293b] rounded-full hidden md:block" />
        <div className="w-8 h-8 bg-[#1e293b] rounded-lg shrink-0" />
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// USER DETAILS DRAWER
// ─────────────────────────────────────────────────────────────────────────────
const UserDetailsDrawer = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;
  const createdDate = new Date(user.creationTime).toLocaleString();
  const loginDate = user.lastSignInTime ? new Date(user.lastSignInTime).toLocaleString() : 'Never';

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      <div className="absolute inset-0 bg-[#030814]/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#0a0f1c] h-full border-l border-[#1e293b] shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="p-6 border-b border-[#1e293b] flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-[#14f195]" /> User Profile
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-[#1e293b]">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-[#1e293b] border-2 border-[#334155] overflow-hidden shrink-0 flex items-center justify-center">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 font-bold font-mono text-3xl">{user.email[0].toUpperCase()}</span>
                )}
              </div>
              {user.emailVerified && (
                <div className="absolute -bottom-2 -right-2 bg-[#0d1321] rounded-full p-1 border border-[#334155]">
                  <CheckCircle2 className="w-5 h-5 text-[#14f195]" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">{user.displayName || 'Unnamed User'}</h3>
              <p className="text-gray-400 text-sm font-mono mt-1">{user.email}</p>
              <div className="flex items-center gap-2 mt-3">
                 <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-[10px] font-mono font-bold uppercase tracking-widest
                    ${user.role === 'owner' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                      user.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      user.role === 'editor' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                      'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}
                  >
                    {user.role === 'owner' && <Key className="w-3 h-3" />}
                    {user.role}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border text-[10px] font-mono font-bold uppercase tracking-widest
                    ${user.disabled ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-[#14f195]/10 text-[#14f195] border-[#14f195]/20'}`}
                  >
                    {user.disabled ? 'Disabled' : 'Active'}
                  </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[11px] font-mono font-bold text-gray-500 uppercase tracking-widest border-b border-[#1e293b] pb-2">Technical Details</h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-[#030814]/50 border border-[#1e293b] p-4 rounded-xl flex items-start gap-4">
                <Shield className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">User ID (UID)</div>
                  <div className="text-sm text-gray-300 font-mono break-all">{user.uid}</div>
                </div>
              </div>
              <div className="bg-[#030814]/50 border border-[#1e293b] p-4 rounded-xl flex items-start gap-4">
                <Calendar className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Account Created</div>
                  <div className="text-sm text-gray-300 font-mono">{createdDate}</div>
                </div>
              </div>
              <div className="bg-[#030814]/50 border border-[#1e293b] p-4 rounded-xl flex items-start gap-4">
                <Clock className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider mb-1">Last Sign In</div>
                  <div className="text-sm text-gray-300 font-mono">{loginDate}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ADD USER MODAL
// ─────────────────────────────────────────────────────────────────────────────
const AddUserModal = ({ isOpen, onClose, onAdd, isSaving }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'viewer'
  });

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setFormData({ email: '', password: '', displayName: '', role: 'viewer' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#030814]/80 backdrop-blur-sm transition-opacity" onClick={() => !isSaving && onClose()} />
      <div className="relative w-full max-w-[500px] bg-[#0d1321] border border-[#1e293b] rounded-[24px] shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#14f195]" /> Add New User
            </h2>
            <p className="text-sm text-gray-400 mt-1">Create a new authorized account.</p>
          </div>
          <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#14f195]/50 transition-all font-mono text-sm"
              placeholder="user@example.com"
            />
          </div>
          
          <div>
            <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">Full Name (Optional)</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#14f195]/50 transition-all"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">Temporary Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#14f195]/50 transition-all font-mono text-sm"
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">Assign Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#14f195]/50 transition-all"
            >
              <option value="admin">Admin (Manage Content & Users)</option>
              <option value="editor">Editor (Manage Content Only)</option>
              <option value="viewer">Viewer (Read Only)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] text-sm font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0a0f1c]/30 border-t-[#0a0f1c] rounded-full animate-spin" />
                  Creating...
                </>
              ) : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// USER EDITOR MODAL
// ─────────────────────────────────────────────────────────────────────────────
const UserEditorModal = ({ isOpen, onClose, user, currentUserRole, onSave, isSaving }) => {
  const [formData, setFormData] = useState({ displayName: '', role: 'viewer', disabled: false });

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        displayName: user.displayName || '',
        role: user.role || 'viewer',
        disabled: user.disabled || false
      });
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const isTargetOwner = user.role === 'owner';
  const isEditingSelf = user.isCurrentUser;
  
  // Permissions Logic based on strict RBAC
  const canEditRole = currentUserRole === 'owner' && !isTargetOwner && !isEditingSelf;
  const canDisable = (currentUserRole === 'owner' || currentUserRole === 'admin') && !isTargetOwner && !isEditingSelf;
  const canEditName = (currentUserRole === 'owner' || currentUserRole === 'admin');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canEditRole && !canDisable && !canEditName) return onClose();
    onSave(user.uid, formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#030814]/80 backdrop-blur-sm transition-opacity" onClick={() => !isSaving && onClose()} />
      <div className="relative w-full max-w-[500px] bg-[#0d1321] border border-[#1e293b] rounded-[24px] shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-[#14f195]" /> Edit User
            </h2>
            <p className="text-sm text-gray-400 mt-1">{user.email}</p>
          </div>
          <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-[#1e293b] rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isTargetOwner && !isEditingSelf && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-400">This account is an Owner. Administrative actions are locked.</p>
            </div>
          )}
          {isEditingSelf && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-400">You are editing your own session. Role modifications are locked to prevent accidental lockout.</p>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">Display Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              disabled={!canEditName || isSaving}
              className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#14f195]/50 transition-all disabled:opacity-50"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">User Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              disabled={!canEditRole || isSaving}
              className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#14f195]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="owner">Owner (Full Access)</option>
              <option value="admin">Admin (Manage Content & Users)</option>
              <option value="editor">Editor (Manage Content Only)</option>
              <option value="viewer">Viewer (Read Only)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">Account Status</label>
            <div className="flex items-center gap-3 bg-[#030814]/50 border border-[#1e293b] p-4 rounded-xl transition-colors focus-within:border-red-500/50">
              <input
                type="checkbox"
                id="disableUser"
                checked={formData.disabled}
                onChange={(e) => setFormData(prev => ({ ...prev, disabled: e.target.checked }))}
                disabled={!canDisable || isSaving}
                className="w-4 h-4 rounded bg-[#1e293b] border-[#334155] text-red-500 focus:ring-red-500/50 disabled:opacity-50"
              />
              <label htmlFor="disableUser" className={`text-sm font-bold ${formData.disabled ? 'text-red-400' : 'text-white'}`}>Disable Account Login</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-[#1e293b]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || (!canEditRole && !canDisable && !canEditName)}
              className="px-6 py-2.5 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] text-sm font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <><div className="w-4 h-4 border-2 border-[#0a0f1c]/30 border-t-[#0a0f1c] rounded-full animate-spin" /> Saving</>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// USERS MANAGER
// ─────────────────────────────────────────────────────────────────────────────
const UsersManager = ({ currentUserRole }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  
  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setErrorState(null);
      const token = await user.getIdToken();
      const data = await safeFetchJson('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(data.users || []);
    } catch (err) {
      setErrorState(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Derived Stats
  const stats = useMemo(() => {
    return users.reduce((acc, u) => {
      acc.total++;
      if (!u.disabled) acc.active++;
      else acc.disabled++;
      if (u.role === 'admin' || u.role === 'owner') acc.admins++;
      return acc;
    }, { total: 0, active: 0, disabled: 0, admins: 0 });
  }, [users]);

  // Handle Updates
  const handleAddUser = async (formData) => {
    try {
      setIsProcessing(true);
      const token = await user.getIdToken();
      await safeFetchJson('/api/admin/users', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      toast.success('User created securely');
      setIsAddOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateUser = async (uid, data) => {
    try {
      setIsProcessing(true);
      const token = await user.getIdToken();
      await safeFetchJson('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, ...data })
      });
      toast.success('User updated securely');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.role === 'owner') {
      toast.error("Owners cannot be deleted.");
      return;
    }
    if (!window.confirm(`Delete user ${targetUser.email}?nnThis action is permanent and cannot be undone.`)) return;
    try {
      setIsProcessing(true);
      const token = await user.getIdToken();
      await safeFetchJson(`/api/admin/users?uid=${targetUser.uid}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async (targetUser) => {
    if (!window.confirm(`Generate a password reset link for ${targetUser.email}?`)) return;
    try {
      const toastId = toast.loading('Generating secure link...');
      const token = await user.getIdToken();
      const data = await safeFetchJson('/api/admin/users', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', targetEmail: targetUser.email })
      });
      
      if (data.link) {
         // In a real email setup, the backend sends the email.
         // Since we don't have an SMTP server, we securely provide the admin the link to share.
         toast.success(
           (t) => (
             <div className="flex flex-col gap-2">
               <span className="font-bold">Link Generated</span>
               <span className="text-xs text-gray-400">Provide this link to the user:</span>
               <a href={data.link} target="_blank" rel="noreferrer" className="text-blue-400 underline text-xs break-all">
                 {data.link}
               </a>
             </div>
           ),
           { id: toastId, duration: 15000 }
         );
      } else {
         toast.success("Password reset initiated", { id: toastId });
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // List processing
  const filteredUsers = useMemo(() => {
    let result = users;
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(u => 
        (u.displayName || '').toLowerCase().includes(lower) || 
        (u.email || '').toLowerCase().includes(lower) ||
        (u.uid || '').toLowerCase().includes(lower)
      );
    }
    if (roleFilter !== 'all') result = result.filter(u => u.role === roleFilter);
    if (statusFilter !== 'all') result = result.filter(u => !!u.disabled === (statusFilter === 'disabled'));
    
    return result.sort((a, b) => {
      const w = { owner: 4, admin: 3, editor: 2, viewer: 1 };
      const diff = (w[b.role] || 0) - (w[a.role] || 0);
      if (diff !== 0) return diff;
      return (new Date(b.creationTime).getTime() || 0) - (new Date(a.creationTime).getTime() || 0);
    });
  }, [users, search, roleFilter, statusFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <div className="p-2 bg-[#14f195]/10 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-[#14f195]" />
             </div>
             <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#14f195]">Identity & Access</span>
           </div>
           <h2 className="text-3xl font-bold text-white tracking-tight">Users & Roles</h2>
           <p className="text-gray-400 text-sm mt-1">Manage platform access, roles, and administrative privileges.</p>
        </div>

        {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-6 py-2.5 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(20,241,149,0.2)] flex items-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
           <div className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">Total Users</div>
           <div className="text-2xl font-bold text-white">{stats.total}</div>
         </div>
         <div className="bg-[#0a0f1c] border border-[#14f195]/20 rounded-2xl p-5 shadow-[0_0_15px_rgba(20,241,149,0.05)] relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10"><CheckCircle2 className="w-12 h-12 text-[#14f195]" /></div>
           <div className="text-[#14f195] text-xs font-mono uppercase tracking-wider mb-2">Active</div>
           <div className="text-2xl font-bold text-white relative z-10">{stats.active}</div>
         </div>
         <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
           <div className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">Disabled</div>
           <div className="text-2xl font-bold text-white">{stats.disabled}</div>
         </div>
         <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-2xl p-5 shadow-sm">
           <div className="text-gray-400 text-xs font-mono uppercase tracking-wider mb-2">Admins/Owners</div>
           <div className="text-2xl font-bold text-white">{stats.admins}</div>
         </div>
      </div>

      <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-[24px] overflow-visible flex flex-col shadow-xl">
        {/* Toolbar */}
        <div className="p-5 border-b border-[#1e293b] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[#14f195] transition-colors" />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#030814] border border-[#1e293b] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#14f195]/50 transition-all font-mono shadow-inner"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full md:w-auto bg-[#030814] border border-[#1e293b] rounded-xl pl-10 pr-8 py-2.5 text-[11px] font-bold text-gray-300 focus:outline-none focus:border-[#14f195]/50 transition-all appearance-none uppercase tracking-wider"
              >
                <option value="all">Roles: All</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            
            <div className="relative flex-1 md:flex-none">
              <Zap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto bg-[#030814] border border-[#1e293b] rounded-xl pl-10 pr-8 py-2.5 text-[11px] font-bold text-gray-300 focus:outline-none focus:border-[#14f195]/50 transition-all appearance-none uppercase tracking-wider"
              >
                <option value="all">Status: All</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto overscroll-x-contain min-h-[300px]">
          {loading ? (
             <div className="p-6"><TableSkeleton /></div>
          ) : errorState ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-4 opacity-80" />
              <h3 className="text-lg font-bold text-white mb-2">Connection Error</h3>
              <p className="text-red-400 text-sm max-w-md mb-6 font-mono bg-red-500/10 p-4 rounded-xl border border-red-500/20">{errorState}</p>
              <button onClick={fetchUsers} className="px-6 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-white text-sm font-bold rounded-xl transition-all">Retry Request</button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center text-gray-500">
              <UserX className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-lg font-bold text-white mb-1">No matches found</h3>
              <p className="text-sm">Adjust your search or filter criteria.</p>
            </div>
          ) : (
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] bg-[#0d1321] text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4 font-bold">User</th>
                  <th className="px-6 py-4 font-bold">Role</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold hidden lg:table-cell">Joined</th>
                  <th className="px-6 py-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]/50">
                {filteredUsers.map(u => {
                  const isSelf = u.uid === user.uid;
                  return (
                    <tr key={u.uid} className="hover:bg-[#1e293b]/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-[#030814] border border-[#1e293b] overflow-hidden flex items-center justify-center">
                              {u.photoURL ? (
                                <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-gray-400 font-bold font-mono text-sm">{u.email[0].toUpperCase()}</span>
                              )}
                            </div>
                            {u.emailVerified && (
                              <div className="absolute -bottom-1 -right-1 bg-[#0a0f1c] rounded-full p-0.5">
                                <CheckCircle2 className="w-3 h-3 text-[#14f195]" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-white font-bold text-sm flex items-center gap-2">
                              {u.displayName || <span className="text-gray-500 italic">Unnamed</span>}
                              {isSelf && <span className="bg-[#14f195]/10 text-[#14f195] text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-widest border border-[#14f195]/20">You</span>}
                            </div>
                            <div className="text-gray-400 text-xs font-mono mt-0.5 flex items-center gap-1.5">
                              <Mail className="w-3 h-3 opacity-50" /> {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[10px] font-mono font-bold uppercase tracking-widest
                          ${u.role === 'owner' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 
                            u.role === 'admin' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                            u.role === 'editor' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}
                        >
                          {u.role === 'owner' && <Key className="w-3 h-3" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${u.disabled ? 'bg-red-500' : 'bg-[#14f195] shadow-[0_0_8px_rgba(20,241,149,0.5)]'}`} />
                            <span className={`text-xs font-bold ${u.disabled ? 'text-red-400' : 'text-[#14f195]'}`}>
                              {u.disabled ? 'Disabled' : 'Active'}
                            </span>
                         </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="text-gray-400 text-xs font-mono">{new Date(u.creationTime).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          
                          <button onClick={() => setViewingUser(u)} className="p-2 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors tooltip-trigger" title="View Details">
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                            <button onClick={() => setEditingUser({ ...u, isCurrentUser: isSelf })} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit User">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                            <button onClick={() => handleResetPassword(u)} className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors" title="Reset Password">
                              <Lock className="w-4 h-4" />
                            </button>
                          )}

                          {(currentUserRole === 'owner' || currentUserRole === 'admin') && !isSelf && u.role !== 'owner' && (
                            <button onClick={() => handleDeleteUser(u)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors ml-2" title="Delete User">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                          {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
                            <button onClick={() => setIsAddOpen(true)} className="p-2 text-gray-400 hover:text-[#14f195] hover:bg-[#14f195]/10 rounded-lg transition-colors ml-2 hidden" title="Add User">
                              <UserPlus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <UserDetailsDrawer isOpen={!!viewingUser} onClose={() => setViewingUser(null)} user={viewingUser} />
      
      <AddUserModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddUser}
        isSaving={isProcessing}
      />

      <UserEditorModal 
        isOpen={!!editingUser} 
        onClose={() => setEditingUser(null)} 
        user={editingUser}
        currentUserRole={currentUserRole}
        onSave={handleUpdateUser}
        isSaving={isProcessing}
      />
    </div>
  );
};

export default UsersManager;
