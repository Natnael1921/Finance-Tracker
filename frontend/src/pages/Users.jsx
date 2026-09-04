import { useState, useEffect } from 'react';
import {
  Users as UsersIcon, Plus, Trash2, Power, Loader2, AlertCircle,
  ShieldCheck, Shield, UserPlus,
} from 'lucide-react';
import Layout from '../components/Layout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/users', form);
      setForm({ name: '', email: '', password: '', role: 'admin' });
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    setActionId(id);
    try {
      await api.patch(`/users/${id}/toggle`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Toggle failed');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this user?')) return;
    setActionId(id);
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    } finally {
      setActionId(null);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-base-50">User Management</h1>
          <p className="text-base-400 text-sm mt-0.5">Manage admin accounts — Superadmin only</p>
        </div>
        <button onClick={() => setShowForm((s) => !s)} className="btn-primary text-sm">
          <UserPlus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add Admin'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 bg-red-950/50 border border-red-800/50 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="glass p-6 mb-6 animate-slide-up">
          <h2 className="text-sm font-semibold text-base-200 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-accent-500" />
            New Admin Account
          </h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text" placeholder="John Doe" required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email" placeholder="admin@finance.com" required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password" placeholder="Min 6 characters" required minLength={6}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="input text-sm"
              />
            </div>
            <div>
              <label className="label">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="select text-sm"
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users table */}
      <div className="glass overflow-hidden">
        <div className="px-6 py-4 border-b border-base-800 flex items-center gap-2">
          <UsersIcon className="w-4 h-4 text-base-400" />
          <h2 className="text-sm font-semibold text-base-200">{users.length} accounts</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-7 h-7 text-accent-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-base-800">
                <tr>
                  {['User', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="table-header">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent-900/50 border border-accent-800/40 flex items-center justify-center shrink-0">
                          <span className="text-accent-400 text-xs font-bold uppercase">{u.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-base-100 text-sm">{u.name}</p>
                          <p className="text-xs text-base-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${u.role === 'superadmin' ? 'bg-purple-900/40 text-purple-400 border border-purple-800/40' : 'bg-blue-900/40 text-blue-400 border border-blue-800/40'}`}>
                        {u.role === 'superadmin' ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${u.isActive ? 'badge-income' : 'badge-expense'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="table-cell text-base-500 text-xs">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="table-cell">
                      {u._id !== currentUser._id && u.role !== 'superadmin' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleToggle(u._id)}
                            disabled={actionId === u._id}
                            title={u.isActive ? 'Deactivate' : 'Activate'}
                            className="btn-ghost p-2 text-base-500 hover:text-amber-400"
                          >
                            {actionId === u._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Power className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            disabled={actionId === u._id}
                            className="btn-ghost p-2 text-base-500 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      {u._id === currentUser._id && (
                        <span className="text-xs text-base-600 italic">You</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
