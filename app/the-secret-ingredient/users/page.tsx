'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../_lib/supabase';
import { useAuth } from '../_components/AuthProvider';
import ProtectedRoute from '../_components/ProtectedRoute';
import AppHeader from '../_components/AppHeader';

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  owner:  { label: 'Owner',  color: 'bg-purple-100 text-purple-700' },
  editor: { label: 'Editor', color: 'bg-blue-100 text-blue-700' },
  viewer: { label: 'Viewer', color: 'bg-gray-100 text-gray-600' },
};

const EMPTY_INVITE = { email: '', role: 'viewer', status: '', error: '' };

interface User {
  id: string;
  role: string;
  email?: string;
}

interface Invite {
  email: string;
  role: string;
}

function UserManagementContent() {
  const { session, role } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [invite, setInvite] = useState(EMPTY_INVITE);

  useEffect(() => {
    if (role === null) return;
    if (role !== 'owner') return;
    Promise.all([loadUsers(), loadInvites()]).then(() => setLoading(false));
  }, [role]);

  async function loadUsers() {
    const { data } = await supabase
      .from('profiles')
      .select('id, role, email')
      .order('role');
    setUsers(data ?? []);
  }

  async function loadInvites() {
    const { data } = await supabase
      .from('invites')
      .select('*')
      .order('invited_at', { ascending: false });
    setInvites(data ?? []);
  }

  async function handleRoleChange(userId: string, newRole: string) {
    setSaving(userId);
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    setSaving(null);
  }

  async function handleInviteRoleChange(email: string, newRole: string) {
    setSaving(`invite-${email}`);
    await supabase.from('invites').update({ role: newRole }).eq('email', email);
    setInvites((prev) => prev.map((i) => (i.email === email ? { ...i, role: newRole } : i)));
    setSaving(null);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInvite((prev) => ({ ...prev, status: 'sending', error: '' }));

    const { error } = await supabase
      .from('invites')
      .upsert({ email: invite.email, role: invite.role }, { onConflict: 'email' });

    if (error) {
      setInvite((prev) => ({ ...prev, status: '', error: error.message }));
    } else {
      setInvite(EMPTY_INVITE);
      await loadInvites();
    }
  }

  async function handleRemoveInvite(email: string) {
    await supabase.from('invites').delete().eq('email', email);
    setInvites((prev) => prev.filter((i) => i.email !== email));
  }

  if (role === null || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (role !== 'owner') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">You don't have access to this page.</p>
          <button onClick={() => router.push('/the-secret-ingredient')} className="text-green-700 underline">
            Go home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 pb-24">
      <AppHeader title="User Management" />

      <div className="max-w-2xl mx-auto px-4 mt-6 space-y-6">

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Roles</h2>
          <div className="space-y-2 text-sm text-gray-600">
            {Object.entries(ROLE_LABELS).map(([key, { label, color }]) => (
              <div key={key} className="flex gap-3 items-start">
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-0.5 ${color}`}>{label}</span>
                <span>
                  {key === 'owner' && 'Full access — manage users and recipes'}
                  {key === 'editor' && 'Can add and edit recipes'}
                  {key === 'viewer' && 'Can browse and favourite recipes'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-green-800 mb-4">Invite a Member</h2>
          <form onSubmit={handleInvite} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={invite.email}
                onChange={(e) => setInvite({ ...invite, email: e.target.value })}
                placeholder="family@example.com"
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              />
              <select
                value={invite.role}
                onChange={(e) => setInvite({ ...invite, role: e.target.value })}
                className="border border-gray-300 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            {invite.error && <p className="text-red-600 text-sm">{invite.error}</p>}
            <button
              type="submit"
              disabled={invite.status === 'sending'}
              className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 text-sm"
            >
              {invite.status === 'sending' ? 'Inviting…' : 'Send Invite'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-green-800 px-6 pt-5 pb-3">Members</h2>
          <div className="divide-y divide-gray-100">
            {users.map((user) => {
              const isCurrentUser = user.id === session!.user.id;
              const roleInfo = ROLE_LABELS[user.role] ?? ROLE_LABELS.viewer;
              return (
                <div key={user.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {user.email ?? 'Unknown user'}
                      {isCurrentUser && <span className="ml-2 text-xs text-gray-400">(you)</span>}
                    </p>
                  </div>
                  {isCurrentUser ? (
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  ) : (
                    <select
                      value={user.role}
                      disabled={saving === user.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="owner">Owner</option>
                    </select>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {invites.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold text-green-800 px-6 pt-5 pb-3">Pending Invites</h2>
            <div className="divide-y divide-gray-100">
              {invites.map((inv) => {
                const roleInfo = ROLE_LABELS[inv.role] ?? ROLE_LABELS.viewer;
                return (
                  <div key={inv.email} className="flex items-center gap-4 px-6 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{inv.email}</p>
                      <p className="text-xs text-gray-400">Pending</p>
                    </div>
                    <select
                      value={inv.role ?? 'viewer'}
                      disabled={saving === `invite-${inv.email}`}
                      onChange={(e) => handleInviteRoleChange(inv.email, e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="owner">Owner</option>
                    </select>
                    <button
                      onClick={() => handleRemoveInvite(inv.email)}
                      className="text-red-500 hover:text-red-700 text-xs font-medium"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <UserManagementContent />
    </ProtectedRoute>
  );
}
