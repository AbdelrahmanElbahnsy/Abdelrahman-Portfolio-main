import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  Users, UserPlus, Shield, CheckCircle2, XCircle, Search, 
  MoreVertical, Edit2, ShieldAlert, Key, UserX, AlertTriangle, X,
  Filter, Calendar, Clock
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
    console.error('Non-JSON response received:', text.substring(0, 200) + '...');
    throw new Error(`Server returned an invalid response (${response.status} ${response.statusText}). Please check server logs.`);
  }

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
};

// ─────────────────────────────────────────────────────────────────────────────
// USER EDITOR MODAL
// ─────────────────────────────────────────────────────────────────────────────
const UserEditorModal = ({ isOpen, onClose, user, currentUserRole, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    role: 'viewer',
    disabled: false
  });

  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        role: user.role || 'viewer',
        disabled: user.disabled || false
      });
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const isTargetOwner = user.role === 'owner';
  const isEditingSelf = user.isCurrentUser;
  
  // Permissions Logic
  const canEditRole = currentUserRole === 'owner' && !isTargetOwner && !isEditingSelf;
  const canDisable = (currentUserRole === 'owner' || currentUserRole === 'admin') && !isTargetOwner && !isEditingSelf;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canEditRole && !canDisable) return onClose();
    onSave(user.uid, formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#030814]/80 backdrop-blur-sm transition-opacity" onClick={() => !isSaving && onClose()} />
      <div className="relative w-full max-w-[500px] bg-[#0d1321] border border-[#1e293b] rounded-[24px] shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#14f195]" /> Manage User
            </h2>
            <p className="text-sm text-gray-400 mt-1">{user.email}</p>
          </div>
          <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isTargetOwner && !isEditingSelf && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-400">This account is an Owner. You cannot modify or disable Owner accounts.</p>
            </div>
          )}
          {isEditingSelf && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-400">You are editing your own session. Some administrative actions are locked to prevent accidental lockout.</p>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">User Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              disabled={!canEditRole || isSaving}
              className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#14f195]/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="owner">Owner (Full Access)</option>
              <option value="admin">Admin (Manage Content & Users)</option>
              <option value="editor">Editor (Manage Content Only)</option>
              <option value="viewer">Viewer (Read Only)</option>
            </select>
            <p className="text-xs text-gray-500 mt-2">Defines the level of access across the dashboard.</p>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">Account Status</label>
            <div className="flex items-center gap-3 bg-[#030814]/50 border border-[#1e293b] p-3 rounded-lg">
              <input
                type="checkbox"
                id="disableUser"
                checked={formData.disabled}
                onChange={(e) => setFormData(prev => ({ ...prev, disabled: e.target.checked }))}
                disabled={!canDisable || isSaving}
                className="w-4 h-4 rounded bg-[#1e293b] border-[#334155] text-red-500 focus:ring-red-500/50 disabled:opacity-50"
              />
              <label htmlFor="disableUser" className="text-sm text-white font-bold">Disable Account</label>
            </div>
            <p className="text-xs text-gray-500 mt-2">Prevent this user from logging in.</p>
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
              disabled={isSaving || (!canEditRole && !canDisable)}
              className="px-6 py-2.5 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] text-sm font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0a0f1c]/30 border-t-[#0a0f1c] rounded-full animate-spin" />
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
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
              className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#14f195]/50 transition-all font-mono text-sm"
              placeholder="user@example.com"
            />
          </div>
          
          <div>
            <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">Full Name (Optional)</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#14f195]/50 transition-all"
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
              className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#14f195]/50 transition-all font-mono text-sm"
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold text-gray-400 mb-2 uppercase tracking-widest">Assign Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
              className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#14f195]/50 transition-all"
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
              className="px-6 py-2.5 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] text-sm font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
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
// USERS MANAGER
// ─────────────────────────────────────────────────────────────────────────────
const UsersManager = ({ currentUserRole }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Fetch users on load
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setErrorState(null);
      const token = await user.getIdToken();
      
      const data = await safeFetchJson('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUsers(data.users || []);
    } catch (err) {
      setErrorState(err.message);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Actions
  const handleAddUser = async (formData) => {
    try {
      setIsSavingUser(true);
      const token = await user.getIdToken();
      
      await safeFetchJson('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      toast.success('User created securely');
      setIsAddOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleUpdateUser = async (uid, data) => {
    try {
      setIsSavingUser(true);
      const token = await user.getIdToken();
      
      await safeFetchJson('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid, ...data })
      });
      
      toast.success('User updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleDeleteUser = async (uid) => {
    if (!window.confirm("Are you absolutely sure you want to permanently delete this user? This cannot be undone.")) return;
    
    try {
      const token = await user.getIdToken();
      await safeFetchJson(`/api/admin/users?uid=${uid}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredUsers = useMemo(() => {
    let result = users;
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(u => 
        (u.displayName || '').toLowerCase().includes(lowerSearch) || 
        (u.email || '').toLowerCase().includes(lowerSearch) ||
        (u.uid || '').toLowerCase().includes(lowerSearch)
      );
    }
    
    if (roleFilter !== 'all') {
      result = result.filter(u => u.role === roleFilter);
    }
    
    if (statusFilter !== 'all') {
      const wantDisabled = statusFilter === 'disabled';
      result = result.filter(u => !!u.disabled === wantDisabled);
    }
    
    // Sort owners first, then admins, then newest
    return result.sort((a, b) => {
      const roleWeight = { owner: 4, admin: 3, editor: 2, viewer: 1 };
      const weightA = roleWeight[a.role] || 0;
      const weightB = roleWeight[b.role] || 0;
      if (weightA !== weightB) return weightB - weightA;
      
      const timeA = new Date(a.creationTime).getTime() || 0;
      const timeB = new Date(b.creationTime).getTime() || 0;
      return timeB - timeA;
    });
  }, [users, search, roleFilter, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#14f195] mb-1 block">
            ACCESS MANAGEMENT
          </span>
          <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">Users & Access</h2>
          <p className="text-gray-400 text-sm">Manage dashboard users, roles, and access permissions safely.</p>
        </div>
        
        {/* Only Owner/Admin can see add button */}
        {(currentUserRole === 'owner' || currentUserRole === 'admin') && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-6 py-2.5 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(20,241,149,0.2)] flex items-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Add User
          </button>
        )}
      </div>

      <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-[24px] overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#1e293b] bg-[#0d1321] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, email, or UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#14f195]/50 transition-all font-mono"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full md:w-auto bg-[#030814]/50 border border-[#1e293b] rounded-lg pl-9 pr-8 py-2 text-xs font-bold text-gray-300 focus:outline-none focus:border-[#14f195]/50 transition-all appearance-none uppercase tracking-wider"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            
            <div className="relative flex-1 md:flex-none">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-auto bg-[#030814]/50 border border-[#1e293b] rounded-lg pl-9 pr-8 py-2 text-xs font-bold text-gray-300 focus:outline-none focus:border-[#14f195]/50 transition-all appearance-none uppercase tracking-wider"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
          </div>
        </div>

        {/* State Management and List */}
        <div className="overflow-x-auto flex-grow min-h-[400px] flex flex-col relative">
          {loading && (
            <div className="absolute inset-0 z-10 bg-[#0a0f1c]/80 backdrop-blur-sm flex items-center justify-center flex-col gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#14f195]"></div>
              <span className="text-sm font-mono text-[#14f195] uppercase tracking-widest font-bold">Loading Users</span>
            </div>
          )}

          {errorState ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Failed to load users</h3>
              <p className="text-red-400/80 text-sm max-w-md mb-6 font-mono bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                {errorState}
              </p>
              <button
                onClick={fetchUsers}
                className="px-5 py-2.5 bg-[#1e293b] hover:bg-[#334155] text-white text-sm font-bold rounded-lg transition-all"
              >
                Try Again
              </button>
            </div>
          ) : !loading && filteredUsers.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-500 animate-in fade-in duration-500">
              <UserX className="w-16 h-16 mb-4 opacity-40" />
              <h3 className="text-lg font-bold text-white mb-1">No users found</h3>
              <p className="text-sm">No accounts match your current filters or search query.</p>
              {(search || roleFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={() => { setSearch(''); setRoleFilter('all'); setStatusFilter('all'); }}
                  className="mt-4 text-[#14f195] text-sm font-bold hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] bg-[#0d1321]/80 sticky top-0 backdrop-blur-md z-0">
                  <th className="px-6 py-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">User</th>
                  <th className="px-6 py-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest hidden lg:table-cell">Activity</th>
                  <th className="px-6 py-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const isSelf = u.uid === user.uid;
                  const createdDate = new Date(u.creationTime).toLocaleDateString();
                  const loginDate = u.lastSignInTime ? new Date(u.lastSignInTime).toLocaleDateString() : 'Never';
                  
                  return (
                    <tr key={u.uid} className="border-b border-[#1e293b]/50 hover:bg-[#1e293b]/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-[#1e293b] border-2 border-[#334155] overflow-hidden shrink-0 flex items-center justify-center">
                              {u.photoURL ? (
                                <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-gray-400 font-bold font-mono text-lg">{u.email[0].toUpperCase()}</span>
                              )}
                            </div>
                            {u.emailVerified && (
                              <div className="absolute -bottom-1 -right-1 bg-[#0d1321] rounded-full p-0.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#14f195]" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-white font-bold text-sm flex items-center gap-2">
                              {u.displayName || 'Unnamed User'}
                              {isSelf && <span className="bg-[#14f195]/10 text-[#14f195] text-[9px] px-1.5 py-0.5 rounded font-mono uppercase tracking-widest">You</span>}
                            </div>
                            <div className="text-gray-500 text-xs font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-mono font-bold uppercase tracking-widest
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
                            <div className={`w-2.5 h-2.5 rounded-full ${u.disabled ? 'bg-red-500' : 'bg-[#14f195] shadow-[0_0_8px_rgba(20,241,149,0.5)]'}`} />
                            <span className={`text-xs font-bold uppercase tracking-wider ${u.disabled ? 'text-red-400' : 'text-[#14f195]'}`}>
                              {u.disabled ? 'Disabled' : 'Active'}
                            </span>
                         </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-xs font-mono text-gray-500">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5" title="Joined">
                            <Calendar className="w-3 h-3 opacity-70" /> {createdDate}
                          </div>
                          <div className="flex items-center gap-1.5" title="Last Login">
                            <Clock className="w-3 h-3 opacity-70" /> {loginDate}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setEditingUser({ ...u, isCurrentUser: isSelf })}
                            className="p-2 text-gray-400 hover:text-[#14f195] hover:bg-[#14f195]/10 rounded-lg transition-colors border border-transparent hover:border-[#14f195]/20"
                            title="Manage User"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {(currentUserRole === 'owner' || currentUserRole === 'admin') && !isSelf && u.role !== 'owner' && (
                            <button
                              onClick={() => handleDeleteUser(u.uid)}
                              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                              title="Delete User"
                            >
                              <X className="w-4 h-4" />
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

      <UserEditorModal 
        isOpen={!!editingUser} 
        onClose={() => setEditingUser(null)} 
        user={editingUser}
        currentUserRole={currentUserRole}
        onSave={handleUpdateUser}
        isSaving={isSavingUser}
      />
      <AddUserModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddUser}
        isSaving={isSavingUser}
      />
    </div>
  );
};

export default UsersManager;
