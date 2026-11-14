'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import {
  Users,
  Search,
  Megaphone,
  Mail,
  Phone,
  Calendar,
  Clock,
  Award,
  Sparkles,
  Gift,
} from 'lucide-react';

export default function ClientCustomersPage() {
  const { business } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'recent'>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const targetBizId = business?.id || 'biz_smashzone';

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (search) query.set('search', search);
        if (filter !== 'all') query.set('filter', filter);

        const res = await api.getBusinessCustomers(targetBizId, query.toString());
        if (res.success && res.data) {
          setCustomers(res.data);
        }
      } catch (err) {
        console.error('Failed to load customers:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [business, targetBizId, search, filter]);

  // Extract unique campaigns for quick filter pill
  const campaignOptions = Array.from(
    new Set(
      customers
        .map((c) => c.campaign?.name)
        .filter(Boolean)
    )
  );

  const filteredCustomers = customers.filter((c) => {
    if (selectedCampaign === 'all') return true;
    return c.campaign?.name === selectedCampaign;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Directory</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage registered patrons, track their active campaigns, and monitor stamp progression.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-medium shadow-sm">
            Total Members: <span className="font-bold text-slate-900">{customers.length}</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, email, phone, or campaign..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
          />
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Quick Filter: All vs Recent */}
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition shadow-sm ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Patrons
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition shadow-sm ${
              filter === 'recent'
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Recent (7d)
          </button>

          {/* Campaign Filter Pill if multiple campaigns */}
          {campaignOptions.length > 1 && (
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
            >
              <option value="all">All Campaigns</option>
              {campaignOptions.map((cmp) => (
                <option key={cmp} value={cmp}>
                  {cmp}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Customers Table with Campaign Column */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Enrolled Campaign</th>
                <th className="px-6 py-3.5">Email & Phone</th>
                <th className="px-6 py-3.5 text-center">Visits</th>
                <th className="px-6 py-3.5 text-center">Stamps</th>
                <th className="px-6 py-3.5 text-center">Points</th>
                <th className="px-6 py-3.5">Last Visit</th>
                <th className="px-6 py-3.5">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={8} className="px-6 py-4">
                      <div className="h-7 bg-slate-100 rounded-xl animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => {
                  const custName = c.user?.name || 'Customer';
                  const initials = custName.slice(0, 2).toUpperCase();
                  const campaignName = c.campaign?.name || 'Standard Loyalty';
                  const rewardTitle = c.campaign?.rewardTitle;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      {/* Customer Profile */}
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-[11px] shadow-sm shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm leading-tight">{custName}</div>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {c.id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>

                      {/* ENROLLED CAMPAIGN COLUMN */}
                      <td className="px-6 py-4">
                        <div className="inline-flex flex-col gap-0.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                            <Megaphone className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span className="truncate max-w-[200px]" title={campaignName}>
                              {campaignName}
                            </span>
                          </span>
                          {rewardTitle && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-1 pl-1">
                              <Gift className="w-3 h-3 text-amber-500" />
                              <span className="truncate max-w-[200px]">{rewardTitle}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center gap-1 text-slate-700">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{c.user?.email || '—'}</span>
                        </div>
                        {c.user?.phone && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{c.user.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Visits */}
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-slate-800 text-xs px-2.5 py-1 rounded-lg bg-slate-100">
                          {c.totalVisits}
                        </span>
                      </td>

                      {/* Stamps */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 text-xs px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/50">
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          {c.totalStamps}
                        </span>
                      </td>

                      {/* Points */}
                      <td className="px-6 py-4 text-center font-mono font-semibold text-slate-700">
                        {c.totalPoints} pts
                      </td>

                      {/* Last Visit */}
                      <td className="px-6 py-4 text-slate-500">
                        {c.lastVisitAt ? (
                          <div>
                            <div className="font-semibold text-slate-700 text-xs">
                              {new Date(c.lastVisitAt).toLocaleDateString()}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {new Date(c.lastVisitAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Never</span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4 text-slate-500">
                        <div className="text-xs">
                          {c.joinedAt ? new Date(c.joinedAt).toLocaleDateString() : '—'}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700 text-sm">No customers found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {search || selectedCampaign !== 'all'
                        ? 'Try clearing your search or campaign filters.'
                        : 'No customers have joined this venue yet.'}
                    </p>
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
