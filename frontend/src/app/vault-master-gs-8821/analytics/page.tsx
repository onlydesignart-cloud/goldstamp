'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { exportToCsv } from '../../../lib/exportCsv';
import { ADMIN_ROUTE_PREFIX } from '../../../config/adminRoute';
import {
  BarChart2,
  TrendingUp,
  Users,
  Building2,
  Footprints,
  Stamp,
  Gift,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Clock,
  Calendar,
  Layers,
  ArrowRight,
  Activity,
  Flame,
  Award,
  Filter,
  Download,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'30D' | '90D' | 'ALL'>('ALL');
  const [chartView, setChartView] = useState<'visits_stamps' | 'redemptions'>('visits_stamps');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminPlatformAnalytics();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load platform analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = data?.summary || {
    totalVisits: 0,
    totalStamps: 0,
    totalCustomers: 0,
    totalBusinesses: 0,
    totalRewards: 0,
    totalRedemptions: 0,
    redemptionRate: 0,
    repeatRate: 0,
    avgVisitsPerCustomer: '0.0',
    avgStampsPerVisit: '1.0',
  };

  const monthlyVolume = data?.monthlyVolume || [];
  const industryStats: any[] = data?.industryStats || [];
  const weekdays: any[] = data?.weekdays || [];
  const timeSlots: any[] = data?.timeSlots || [];
  const funnel: any[] = data?.funnel || [];
  const topLoyalCustomers: any[] = data?.topLoyalCustomers || [];

  const handleExportVisitsCsv = async () => {
    try {
      const res = await api.getAdminVisitsEnriched();
      const visits = res.success && res.data ? res.data : [];
      const headers = [
        'Visit ID',
        'Customer Name',
        'Customer Email',
        'Business Venue',
        'Campaign Name',
        'Stamps Awarded',
        'Timestamp',
      ];
      const rows = visits.map((v: any) => [
        v.id,
        v.user?.name || 'Customer',
        v.user?.email || '',
        v.business?.name || 'Venue',
        v.campaign?.name || 'Standard Check-In',
        1,
        v.createdAt ? new Date(v.createdAt).toLocaleString() : 'Recent',
      ]);
      exportToCsv(`goldstamp_visits_telemetry_${Date.now()}`, headers, rows);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform-Wide Telemetry & Performance
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2.5 py-0.5 rounded-full">
              <Activity className="w-3 h-3 text-sky-400" />
              Live Ingestion
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Macro telemetry across all industry verticals, footfall velocity, digital stamp circulation, and voucher conversions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportVisitsCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition border border-slate-700 shadow-sm flex items-center gap-1.5 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export Visits CSV</span>
          </button>

          {/* Time range pills */}
          <div className="inline-flex p-1 bg-slate-800/80 border border-slate-700 rounded-xl text-xs">
            <button
              onClick={() => setTimeRange('30D')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                timeRange === '30D' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('90D')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                timeRange === '90D' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              90 Days
            </button>
            <button
              onClick={() => setTimeRange('ALL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                timeRange === 'ALL' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>

          <button
            onClick={loadData}
            title="Refresh Telemetry"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* 5 Core Telemetry KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Visits */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Total Check-Ins</span>
              <div className="p-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <Footprints className="w-3.5 h-3.5 text-indigo-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
              {loading ? '...' : summary.totalVisits}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Avg / Customer</span>
            <span className="font-bold text-indigo-400">{summary.avgVisitsPerCustomer} visits</span>
          </div>
        </div>

        {/* Stamps Circulation */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Stamps Issued</span>
              <div className="p-1.5 rounded-xl bg-teal-500/10 border border-teal-500/20">
                <Stamp className="w-3.5 h-3.5 text-teal-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
              {loading ? '...' : summary.totalStamps}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Stamping Velocity</span>
            <span className="font-bold text-teal-400">{summary.avgStampsPerVisit}x / check-in</span>
          </div>
        </div>

        {/* Voucher Redemption Rate */}
        <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-2xl flex flex-col justify-between shadow-sm bg-gradient-to-br from-slate-900/90 to-emerald-950/20">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-300">Voucher Burn Rate</span>
              <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-2 tracking-tight">
              {loading ? '...' : `${summary.redemptionRate}%`}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Redeemed / Unlocked</span>
            <span className="font-bold text-emerald-400">{summary.totalRedemptions} of {summary.totalRewards}</span>
          </div>
        </div>

        {/* Customer Repeat Rate */}
        <div className="bg-slate-900/90 border border-purple-500/30 p-4 rounded-2xl flex flex-col justify-between shadow-sm bg-gradient-to-br from-slate-900/90 to-purple-950/20">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-purple-300">Repeat Patron Rate</span>
              <div className="p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Flame className="w-3.5 h-3.5 text-purple-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
              {loading ? '...' : `${summary.repeatRate}%`}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Cohort Retention</span>
            <span className="font-bold text-purple-400">2+ Visits</span>
          </div>
        </div>

        {/* Registered Patrons */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Total Patrons</span>
              <div className="p-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Users className="w-3.5 h-3.5 text-blue-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
              {loading ? '...' : summary.totalCustomers}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Across Venues</span>
            <span className="font-bold text-blue-400">{summary.totalBusinesses} venues</span>
          </div>
        </div>
      </div>

      {/* Main Multi-Metric Ingestion Chart */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-400" />
              Footfall Check-Ins & Digital Stamp Trajectory
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Monthly ingestion scaling across all tenant arenas, cafes, and salons.
            </p>
          </div>

          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setChartView('visits_stamps')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                chartView === 'visits_stamps' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Visits & Stamps
            </button>
            <button
              onClick={() => setChartView('redemptions')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                chartView === 'redemptions' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Voucher Burn Rate
            </button>
          </div>
        </div>

        <div className="h-80 w-full pt-2">
          {mounted && monthlyVolume && monthlyVolume.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'visits_stamps' ? (
                /* BarChart with cursor={false} - Zero white background on hover! */
                <BarChart data={monthlyVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '14px',
                      color: '#ffffff',
                      border: '1px solid #334155',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
                    }}
                    itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                    labelStyle={{ color: '#c084fc', fontWeight: 700, marginBottom: '4px' }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }} />
                  <Bar dataKey="visits" name="Verified Check-Ins" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="stamps" name="Digital Stamps Stamped" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                /* Perfect Voucher Burn Rate Chart with Issued vs Burned */
                <AreaChart data={monthlyVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="redemptionsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="rewardsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={false}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '14px',
                      color: '#ffffff',
                      border: '1px solid #334155',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
                    }}
                    itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                    labelStyle={{ color: '#10b981', fontWeight: 700, marginBottom: '4px' }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '12px', fontSize: '11px' }} />
                  <Area
                    type="monotone"
                    dataKey="rewards"
                    name="Vouchers Issued / Unlocked"
                    stroke="#a855f7"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    fillOpacity={1}
                    fill="url(#rewardsGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="redemptions"
                    name="Single-Use Vouchers Burned"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#redemptionsGrad)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Loading platform telemetry charts...
            </div>
          )}
        </div>
      </div>

      {/* 2-Column: Industry Footfall Breakdown & Peak Hours Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Footfall Share */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Industry Vertical Footfall Share
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Check-in distribution across sports, cafes, and wellness verticals.
              </p>
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            {industryStats.map((ind: any) => (
              <div key={ind.id} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{ind.name}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      {ind.businessCount} venues
                    </span>
                  </div>
                  <span className="text-xs font-black text-purple-400">
                    {ind.percentage}% Share
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${ind.percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                  <span>{ind.visits} Check-ins · {ind.stamps} Stamps</span>
                  <span className="font-semibold text-emerald-400">
                    {ind.redemptions} Vouchers Burned
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours & Day of Week Footfall Heatmap */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              Peak Activity Hours & Weekday Velocity
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Time slot distribution showing morning coffee rushes and weekend sports peaks.
            </p>

            <div className="mt-4 space-y-3">
              {timeSlots.map((slot: any, idx: number) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{slot.slot}</span>
                    <span className="text-xs font-black text-amber-400">{slot.share}% Traffic</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full"
                      style={{ width: `${slot.share}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{slot.visits} Active Check-Ins</span>
                    <span className="text-slate-300 font-medium">{slot.focus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Weekday quick pills */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 block mb-2">Weekday Ingestion Volume:</span>
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {weekdays.map((w: any) => (
                <div key={w.day} className="p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-bold">{w.day}</span>
                  <span className={`text-xs font-black block mt-0.5 ${w.visits >= 5 ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {w.visits}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loyalty Conversion Funnel */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Customer Loyalty & Retention Funnel
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Macro conversion from patron registration to verified milestone reward burning.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {funnel.map((step: any, idx: number) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-black text-slate-500 uppercase">
                  Stage 0{idx + 1}
                </span>
                <p className="text-xs font-bold text-white mt-1 leading-snug">
                  {step.stage}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-baseline justify-between">
                <span className="text-xl font-black text-white">
                  {step.count}
                </span>
                <span
                  className="text-xs font-black px-2 py-0.5 rounded-full"
                  style={{ color: step.color, backgroundColor: `${step.color}15` }}
                >
                  {step.rate}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Loyal Patrons Leaderboard across Platform */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-400" />
              Top Active Platform Patrons Leaderboard
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Highest-frequency loyalty patrons across all venues and industries.
            </p>
          </div>
          <Link
            href={`${ADMIN_ROUTE_PREFIX}/users`}
            className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
          >
            All Users <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Patron</th>
                <th className="px-4 py-3.5">Phone / Contact</th>
                <th className="px-4 py-3.5">Verified Check-Ins</th>
                <th className="px-4 py-3.5">Stamps In Cards</th>
                <th className="px-4 py-3.5">Rewards Burned</th>
                <th className="px-4 py-3.5 text-right">Favorite Home Turf</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-sans">
              {topLoyalCustomers.map((c, i) => (
                <tr key={c.id || i} className="hover:bg-slate-800/40 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold text-[10px]">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">{c.name}</p>
                        <p className="text-[10px] text-slate-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-300 font-mono text-[11px]">
                    {c.phone}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-white">
                    {c.totalVisits} visits
                  </td>
                  <td className="px-4 py-3.5 font-bold text-teal-400">
                    {c.totalStamps} stamps
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-400">
                    {c.redemptionsCount} redeemed
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-block px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-semibold">
                      {c.favoriteVenue}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
