import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useFirestoreSingleDoc } from '../../cms/hooks/useFirestoreSingleDoc';
import { 
  Users, UserPlus, Shield, CheckCircle2, XCircle, Search, 
  MoreVertical, Edit2, ShieldAlert, Key, UserX, AlertTriangle, X
} from 'lucide-react';
import toast from 'react-hot-toast';

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
      <div className="absolute inset-0 bg-[#030814]/80 backdrop-blur-sm" onClick={() => !isSaving && onClose()} />
      <div className="relative w-full max-w-[500px] bg-[#0d1321] border border-[#1e293b] rounded-[24px] shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95">
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
              {isSaving ? 'Saving...' : 'Save Changes'}
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
    onAdd(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#030814]/80 backdrop-blur-sm" onClick={() => !isSaving && onClose()} />
      <div className="relative w-full max-w-[500px] bg-[#0d1321] border border-[#1e293b] rounded-[24px] shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in-95">
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
              {/* Admins shouldn't create owners, API rejects it. So we safely omit it or let API block it. */}
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
              className="px-6 py-2.5 bg-[#14f195] hover:bg-[#14f195]/90 text-[#0a0f1c] text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              {isSaving ? 'Creating...' : 'Create User'}
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
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);
  
  const [editingUser, setEditingUser] = useState(null);

  // Fetch users on load
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      toast.error(err.message);
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
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
      
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
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uid, ...data })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
      
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
      const response = await fetch(`/api/admin/users?uid=${uid}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const lowerSearch = search.toLowerCase();
    return users.filter(u => 
      (u.displayName || '').toLowerCase().includes(lowerSearch) || 
      (u.email || '').toLowerCase().includes(lowerSearch) ||
      (u.uid || '').toLowerCase().includes(lowerSearch)
    );
  }, [users, search]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#14f195] mb-1 block">
            USERS / ACCESS CONTROL
          </span>
          <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">User Management</h2>
          <p className="text-gray-400 text-sm">Manage users, roles, and access permissions safely.</p>
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

      <div className="bg-[#0a0f1c] border border-[#1e293b] rounded-[24px] overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[#1e293b] bg-[#0d1321] flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, email, or UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#030814]/50 border border-[#1e293b] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#14f195]/50 transition-all font-mono"
            />
          </div>
        </div>

        {/* User List */}
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-48 w-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#14f195]"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <UserX className="w-12 h-12 mb-3 opacity-50" />
              <p>No users found matching your search.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] bg-[#0d1321]/50">
                  <th className="px-6 py-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">User</th>
                  <th className="px-6 py-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const isSelf = u.uid === user.uid;
                  return (
                    <tr key={u.uid} className="border-b border-[#1e293b]/50 hover:bg-[#1e293b]/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#1e293b] border border-[#334155] overflow-hidden shrink-0 flex items-center justify-center">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt={u.displayName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-gray-400 font-bold font-mono text-sm">{u.email[0].toUpperCase()}</span>
                            )}
                          </div>
                          <div>
                            <div className="text-white font-bold text-sm flex items-center gap-2">
                              {u.displayName || 'Unnamed User'}
                              {isSelf && <span className="bg-[#14f195]/10 text-[#14f195] text-[9px] px-1.5 py-0.5 rounded font-mono uppercase">You</span>}
                            </div>
                            <div className="text-gray-500 text-xs font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-[10px] font-mono font-bold uppercase tracking-widest
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
                            <span className="text-xs text-gray-400 font-bold uppercase">{u.disabled ? 'Disabled' : 'Active'}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingUser({ ...u, isCurrentUser: isSelf })}
                            className="p-2 text-gray-400 hover:text-white hover:bg-[#1e293b] rounded-lg transition-colors border border-transparent hover:border-[#334155]"
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
