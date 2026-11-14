'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import { Users, Search, ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (roleFilter) query.set('role', roleFilter);
      if (search) query.set('search', search);

      const res = await api.getAdminUsers(query.toString());
      if (res.success && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadUsers, 200);
    return () => clearTimeout(timer);
  }, [roleFilter, search]);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.updateAdminUserStatus(userId, nextStatus);
      await loadUsers();
    } catch (err) {
      console.error('Failed to toggle user status:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Users Directory</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage all customer, business owner, and staff accounts with multi-tenant RBAC.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto">
          {['', 'CUSTOMER', 'BUSINESS_OWNER', 'BUSINESS_STAFF', 'SUPER_ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                roleFilter === r
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {r === '' ? 'All Roles' : r}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-800/80 border border-slate-700 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Email & Contact</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Visits Made</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Joined</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-6 bg-slate-700 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : users.length > 0 ? (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-750 transition">
                    <td className="px-6 py-3.5 font-bold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-[10px]">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-400">
                      <div>{u.email}</div>
                      {u.phone && <div className="text-[10px] text-slate-500">{u.phone}</div>}
                    </td>
                    <td className="px-6 py-3.5 font-semibold text-purple-300 font-mono text-[11px]">
                      {u.role}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-emerald-400 font-bold">
                      {u._count?.visits || 0}
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-red-500/20 text-red-300'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {u.role !== 'SUPER_ADMIN' && (
                        <button
                          onClick={() => handleToggleStatus(u.id, u.status)}
                          className={`text-xs font-semibold underline ${
                            u.status === 'ACTIVE'
                              ? 'text-red-400 hover:text-red-300'
                              : 'text-emerald-400 hover:text-emerald-300'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No users found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
