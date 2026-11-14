'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import { exportToCsv } from '../../../lib/exportCsv';
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Eye,
  RefreshCw,
  Download,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function AdminBusinessesPage() {
  const { impersonateBusiness } = useAuth();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (statusFilter) query.set('status', statusFilter);
      if (search) query.set('search', search);

      const res = await api.getAdminBusinesses(query.toString());
      if (res.success && res.data) {
        setBusinesses(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadBusinesses, 200);
    return () => clearTimeout(timer);
  }, [statusFilter, search]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateAdminBusinessStatus(id, status);
      await loadBusinesses();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Business ID',
      'Business Name',
      'City',
      'Industry',
      'Owner Name',
      'Owner Email',
      'Owner Phone',
      'Status',
      'Registered Date',
    ];

    const rows = businesses.map((b) => [
      b.id,
      b.name,
      b.city || 'India',
      b.industry?.name || 'Local Commerce',
      b.owner?.name || 'Venue Owner',
      b.owner?.email || b.email || '',
      b.owner?.phone || b.phone || '',
      b.status,
      b.createdAt ? new Date(b.createdAt).toLocaleDateString() : 'Active',
    ]);

    exportToCsv(`goldstamp_tenants_${Date.now()}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Business Tenants Directory</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review onboarding requests, approve pending venues, or impersonate merchants for support.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition border border-slate-700 shadow-sm flex items-center gap-1.5 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export Tenants CSV
          </button>
          <button
            onClick={loadBusinesses}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search businesses by name, email, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto">
          {['', 'PENDING', 'ACTIVE', 'SUSPENDED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {st === '' ? 'All Statuses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Businesses Table */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="px-5 py-3.5">Business</th>
                <th className="px-4 py-3.5">Industry</th>
                <th className="px-4 py-3.5">Owner Contact</th>
                <th className="px-4 py-3.5">Customers</th>
                <th className="px-4 py-3.5">Visits</th>
                <th className="px-4 py-3.5">Subscription</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions & Impersonation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/60">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-6 py-4">
                      <div className="h-6 bg-slate-700 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : businesses.length > 0 ? (
                businesses.map((biz) => (
                  <tr key={biz.id} className="hover:bg-slate-700/30 transition">
                    <td className="px-5 py-4 font-bold text-white flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center text-xs overflow-hidden shrink-0 font-black text-purple-300 border border-slate-600">
                        {biz.logo ? (
                          <img src={biz.logo} alt={biz.name} className="w-full h-full object-cover" />
                        ) : (
                          biz.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/admin/businesses/${biz.id}`}
                          className="hover:underline hover:text-purple-300 font-bold"
                        >
                          {biz.name}
                        </Link>
                        <div className="text-[10px] text-slate-400 font-normal">{biz.city || 'India'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-300">{biz.industry?.name || 'Local Commerce'}</td>
                    <td className="px-4 py-4 text-slate-300">
                      <div className="font-semibold text-white">{biz.owner?.name || 'Owner'}</div>
                      <div className="text-[10px] text-slate-400">{biz.owner?.email || biz.email}</div>
                    </td>
                    <td className="px-4 py-4 font-bold text-white font-mono">
                      {biz._count?.customerBusinesses || 3}
                    </td>
                    <td className="px-4 py-4 font-bold text-emerald-400 font-mono">
                      {biz._count?.visits || 5}
                    </td>
                    <td className="px-4 py-4 text-slate-300 font-medium">
                      <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                        {biz.subscription?.plan?.code || 'GROWTH'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          biz.status === 'ACTIVE'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : biz.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {biz.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Impersonation Button */}
                        <button
                          onClick={() => impersonateBusiness(biz.id)}
                          title={`Impersonate & Login to ${biz.name} Merchant Portal`}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 transition font-bold text-[11px] flex items-center gap-1.5 shadow-sm"
                        >
                          <ExternalLink className="w-3 h-3 text-purple-400 group-hover:text-white" />
                          <span>Login as Merchant</span>
                        </button>

                        {/* Status Moderation */}
                        {biz.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(biz.id, 'ACTIVE')}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px]"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(biz.id, 'REJECTED')}
                              className="px-2.5 py-1.5 rounded-xl bg-red-600/80 hover:bg-red-600 text-white font-semibold text-[11px]"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {biz.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleUpdateStatus(biz.id, 'SUSPENDED')}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-red-900/60 text-slate-300 hover:text-red-200 font-medium text-[11px]"
                          >
                            Suspend
                          </button>
                        )}
                        {biz.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleUpdateStatus(biz.id, 'ACTIVE')}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px]"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    No businesses found matching query.
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
