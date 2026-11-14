'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import {
  Users,
  Footprints,
  Calendar,
  Stamp,
  Coins,
  Gift,
  CheckCircle2,
  Megaphone,
  QrCode,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function ClientDashboardPage() {
  const { business } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      const targetBizId = business?.id || 'biz_smashzone';
      try {
        const res = await api.getBusinessAnalytics(targetBizId);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load business analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadMetrics();
  }, [business]);

  const summary = data?.summary || {
    totalCustomers: 0,
    todayVisits: 0,
    monthlyVisits: 0,
    totalStamps: 0,
    pointsIssued: 0,
    rewardsUnlocked: 0,
    rewardsRedeemed: 0,
    activeCampaigns: 0,
  };

  const cards = [
    { title: 'Total Customers', value: summary.totalCustomers, icon: Users, sub: 'Registered patrons' },
    { title: "Today's Visits", value: summary.todayVisits, icon: Footprints, sub: 'Check-ins logged' },
    { title: 'Monthly Visits', value: summary.monthlyVisits, icon: Calendar, sub: 'Past 30 days' },
    { title: 'Stamps Issued', value: summary.totalStamps, icon: Stamp, sub: 'Active balance' },
    { title: 'Points Issued', value: summary.pointsIssued, icon: Coins, sub: 'Calculated score' },
    { title: 'Rewards Unlocked', value: summary.rewardsUnlocked, icon: Gift, sub: 'Milestones hit' },
    { title: 'Rewards Redeemed', value: summary.rewardsRedeemed, icon: CheckCircle2, sub: 'Burned vouchers' },
    { title: 'Active Campaigns', value: summary.activeCampaigns, icon: Megaphone, sub: 'Live loyalty rules' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-950 tracking-tight">
            Business Console Overview
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Real-time multi-tenant analytics for {business?.name || 'your venue'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/client/qr"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-[0.99]"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Open Counter Kiosk</span>
          </Link>

          <Link
            href="/client/campaigns/create"
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition active:scale-[0.99]"
          >
            <Megaphone className="w-3.5 h-3.5 text-zinc-300" />
            <span>New Campaign</span>
          </Link>
        </div>
      </div>

      {/* 8 SaaS Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 hover:shadow-sm transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
                  {c.title}
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 flex items-center justify-center border border-slate-100 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4">
                <div className="text-3xl font-bold tracking-tight text-slate-900 tabular-nums leading-none">
                  {loading ? '—' : c.value}
                </div>
                <div className="flex items-center gap-1.5 mt-2.5 text-xs text-slate-500 font-medium">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${Number(c.value) > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className="truncate">{c.sub}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visits Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Verified Visits Over Time</h2>
              <p className="text-xs text-slate-500">Last 7 days customer check-in traffic</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real-Time Ingestion</span>
            </div>
          </div>

          <div className="h-64 w-full pt-4">
            {data?.visitsOverTime ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.visitsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="visits"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#visitGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Loading chart...
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Feed (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
              <span className="text-[11px] text-slate-400 font-mono">Live Feed</span>
            </div>

            <div className="space-y-3.5">
              {data?.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.map((act: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        act.type === 'VISIT'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-purple-50 text-purple-600'
                      }`}
                    >
                      {act.type === 'VISIT' ? (
                        <Footprints className="w-3.5 h-3.5" />
                      ) : (
                        <Gift className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 truncate">{act.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{act.subtitle}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 shrink-0">
                      {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 py-8 text-center">
                  No recent activity logged yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <Link
              href="/client/visits"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center justify-between"
            >
              <span>View Full Visits Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Top Loyal Customers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Top Loyal Patrons</h2>
            <p className="text-xs text-slate-500">Most frequent visitors at your business</p>
          </div>
          <Link
            href="/client/customers"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>All Customers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Contact</th>
                <th className="px-6 py-3">Total Visits</th>
                <th className="px-6 py-3">Total Stamps</th>
                <th className="px-6 py-3">Points</th>
                <th className="px-6 py-3">Last Visit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.topCustomers && data.topCustomers.length > 0 ? (
                data.topCustomers.map((cust: any) => (
                  <tr key={cust.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                        {cust.user.name.charAt(0)}
                      </div>
                      <span>{cust.user.name}</span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{cust.user.email}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-800">{cust.totalVisits}</td>
                    <td className="px-6 py-3.5 font-bold text-emerald-600">{cust.totalStamps}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-700">{cust.totalPoints} pts</td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {cust.lastVisitAt ? new Date(cust.lastVisitAt).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No customers registered yet.
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
