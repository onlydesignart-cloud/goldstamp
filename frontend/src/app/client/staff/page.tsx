'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import {
  UserCheck,
  Plus,
  CheckCircle2,
  XCircle,
  Shield,
  KeyRound,
  Copy,
  Check,
  LogIn,
  QrCode,
  Sparkles,
  RefreshCw,
  Lock,
} from 'lucide-react';

export default function ClientStaffPage() {
  const { business, user, switchDemoRole } = useAuth();
  const router = useRouter();

  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New staff form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('staff123');
  const [roleTitle, setRoleTitle] = useState('Front Desk Marshall');
  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const targetBizId = business?.id || 'biz_smashzone';

  const loadStaff = async () => {
    setIsRefreshing(true);
    try {
      const res = await api.getStaff(targetBizId);
      if (res.success && res.data) {
        setStaff(res.data);
      }
    } catch (err) {
      console.error('Failed to load staff:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [business, targetBizId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.createStaff(targetBizId, {
        name,
        email,
        password,
        role: 'BUSINESS_STAFF',
        title: roleTitle,
      });

      if (res.success) {
        setShowAddModal(false);
        setName('');
        setEmail('');
        setPassword('staff123');
        setRoleTitle('Front Desk Marshall');
        setSuccessToast(`Staff login created for ${name}!`);
        setTimeout(() => setSuccessToast(null), 4000);
        await loadStaff();
      }
    } catch (err) {
      console.error('Failed to create staff:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (staffId: string) => {
    try {
      await api.toggleStaff(targetBizId, staffId);
      await loadStaff();
    } catch (err) {
      console.error('Failed to toggle staff status:', err);
    }
  };

  // Quick 1-click test login as this staff member
  const handleTestLogin = (staffMember: any) => {
    const sEmail = staffMember.email || staffMember.user?.email;
    const sName = staffMember.name || staffMember.user?.name || 'Staff Member';

    if (typeof window !== 'undefined') {
      const staffUser = {
        id: staffMember.userId || staffMember.id,
        name: sName,
        email: sEmail,
        role: 'BUSINESS_STAFF',
        status: staffMember.isActive ? 'ACTIVE' : 'SUSPENDED',
      };

      const token = `mock_jwt_staff_${Date.now()}`;
      localStorage.setItem('goldstamp_merchant_token', token);
      localStorage.setItem('goldstamp_merchant_user', JSON.stringify(staffUser));
      if (business) {
        localStorage.setItem('goldstamp_merchant_business', JSON.stringify(business));
      }

      setSuccessToast(`Logged in as Staff (${sName})! Redirecting to Counter Kiosk...`);
      setTimeout(() => {
        router.push('/client/qr');
      }, 700);
    }
  };

  const copyCredentials = (sEmail: string) => {
    navigator.clipboard.writeText(`Email: ${sEmail}\nPassword: staff123`);
    setCopiedId(sEmail);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const activeStaffCount = staff.filter((s) => s.isActive).length;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 text-xs underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Logins & RBAC</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage cashier & court marshall logins. Staff can verify visits and burn reward vouchers without access to business billing.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadStaff}
            disabled={isRefreshing}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition"
            title="Refresh Staff List"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Staff Logins</div>
          <div className="text-3xl font-black text-slate-900 mt-1">
            {activeStaffCount} <span className="text-xs font-semibold text-slate-400">/ {staff.length} Total</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for counter check-in
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Access Scope</div>
          <div className="text-base font-bold text-slate-800 mt-2">Counter Kiosk & Scanner</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-amber-500" /> Private billing protected
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Counter Terminals</div>
          <div className="text-base font-bold text-slate-800 mt-2">Dynamic QR & Vouchers</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Fast 1-click counter login
          </div>
        </div>
      </div>

      {/* Main Staff Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">Counter Staff & Cashiers</h2>
          <span className="text-xs text-slate-400">Terminal Access</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Staff Member</th>
                <th className="px-6 py-3.5">Login Email</th>
                <th className="px-6 py-3.5">Assigned Role</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-7 bg-slate-100 rounded-xl animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : staff.length > 0 ? (
                staff.map((s) => {
                  const staffName = s.name || s.user?.name || 'Staff Member';
                  const staffEmail = s.email || s.user?.email || 'staff@smashzone.com';
                  const initials = staffName.slice(0, 2).toUpperCase();

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                      {/* Name & Initials */}
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm leading-tight">{staffName}</div>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {s.id}</span>
                          </div>
                        </div>
                      </td>

                      {/* Login Email */}
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-700">{staffEmail}</span>
                          <button
                            onClick={() => copyCredentials(staffEmail)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                            title="Copy Email & Default Password"
                          >
                            {copiedId === staffEmail ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Role Pill */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                          <Shield className="w-3 h-3 text-indigo-500" />
                          <span>BUSINESS_STAFF</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            s.isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {s.isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" /> Disabled
                            </>
                          )}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* 1-Click Test Login as Staff Button */}
                          <button
                            onClick={() => handleTestLogin(s)}
                            disabled={!s.isActive}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition disabled:opacity-40"
                            title="Switch session to this staff member and open counter kiosk"
                          >
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Test Login</span>
                          </button>

                          {/* Toggle Active Status */}
                          <button
                            onClick={() => handleToggle(s.id)}
                            className="px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition border border-slate-200"
                          >
                            {s.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">No staff accounts registered yet</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click "Add Staff Member" above to create a login for front-desk cashiers.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide Banner for Physical Venues */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">How Staff Logins Work:</h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              • <strong>Role Permissions:</strong> Cashiers log in to scan dynamic customer QR codes and burn milestone reward vouchers.<br />
              • <strong>Protected Settings:</strong> Staff cannot edit venue billing, subscription plans, or delete campaigns.<br />
              • <strong>Fast Testing:</strong> Click <strong>"Test Login"</strong> on any row to instantly simulate counter operations as that staff member!
            </p>
          </div>
        </div>
        <Link
          href="/client/qr"
          className="shrink-0 px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition"
        >
          Open Counter Kiosk
        </Link>
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Add New Staff Member</h3>
                  <p className="text-[11px] text-slate-500">Create front-desk or cashier credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Staff Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Work Email (Login ID)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@smashzone.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assigned Designation</label>
                <select
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition bg-white"
                >
                  <option value="Front Desk Marshall">Front Desk Marshall</option>
                  <option value="Court Cashier">Court Cashier</option>
                  <option value="Floor Supervisor">Floor Supervisor</option>
                  <option value="Barista / Counter Attendant">Barista / Counter Attendant</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Temporary Password</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                    Default: staff123
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {saving ? 'Creating Account...' : 'Create Staff Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
