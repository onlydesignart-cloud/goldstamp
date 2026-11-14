'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import {
  Building2,
  Users,
  Footprints,
  Stamp,
  Gift,
  CheckCircle2,
  DollarSign,
  CreditCard,
  Clock,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  ExternalLink,
  Store,
  MapPin,
  Sparkles,
  ShieldAlert,
  BarChart3,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

type ChartMetric = 'audience' | 'activity' | 'revenue';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('audience');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminAnalytics();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveBusiness = async (id: string, name: string) => {
    try {
      setUpdatingId(id);
      await api.updateAdminBusinessStatus(id, 'ACTIVE');
      setActionMessage(`"${name}" has been approved and activated!`);
      await loadData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to approve business:', err);
      setActionMessage(`Error updating status: ${err?.message || 'Failed'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRejectBusiness = async (id: string, name: string) => {
    try {
      setUpdatingId(id);
      await api.updateAdminBusinessStatus(id, 'SUSPENDED');
      setActionMessage(`"${name}" has been suspended.`);
      await loadData();
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to suspend business:', err);
      setActionMessage(`Error updating status: ${err?.message || 'Failed'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const summary = data?.summary || {
    totalBusinesses: data?.totalBusinesses ?? 0,
    activeBusinesses: data?.activeBusinesses ?? 0,
    pendingBusinesses: data?.pendingBusinesses ?? 0,
    totalCustomers: data?.totalCustomers ?? 0,
    totalVisits: data?.totalVisits ?? 0,
    totalStamps: data?.totalStamps ?? 0,
    totalRewards: data?.totalRewards ?? 0,
    totalRedemptions: data?.totalRedemptions ?? 0,
    mrr: data?.mrr ?? 0,
    arr: data?.arr ?? 0,
    activeSubscriptions: data?.activeSubscriptions ?? 0,
  };

  const growthData = data?.growthData || [];
  const topVenues = data?.topVenues || [];
  const recentActivities = data?.recentActivities || [];
  const pendingList = data?.pendingList || (data?.businesses || []).filter((b: any) => b.status === 'PENDING');

  const cards = [
    {
      label: 'Total Businesses',
      val: summary.totalBusinesses,
      sub: `${summary.activeBusinesses} active · ${summary.pendingBusinesses} pending`,
      icon: Building2,
      link: '/admin/businesses',
    },
    {
      label: 'Active Venues',
      val: summary.activeBusinesses,
      sub: `${summary.totalBusinesses > 0 ? Math.round((summary.activeBusinesses / summary.totalBusinesses) * 100) : 100}% operational`,
      icon: CheckCircle2,
      link: '/admin/businesses?status=ACTIVE',
    },
    {
      label: 'Pending Approval',
      val: summary.pendingBusinesses,
      sub: summary.pendingBusinesses > 0 ? 'Review required' : 'All approved',
      icon: Clock,
      link: '/admin/businesses?status=PENDING',
      urgent: summary.pendingBusinesses > 0,
    },
    {
      label: 'Total Patrons',
      val: summary.totalCustomers,
      sub: 'Registered accounts',
      icon: Users,
      link: '/admin/users',
    },
    {
      label: 'Platform Visits',
      val: summary.totalVisits,
      sub: 'Verified check-ins',
      icon: Footprints,
      link: '/admin/analytics',
    },
    {
      label: 'Stamps Issued',
      val: summary.totalStamps,
      sub: 'Active balance',
      icon: Stamp,
      link: '/admin/analytics',
    },
    {
      label: 'Reward Incentives',
      val: summary.totalRewards,
      sub: 'Across campaigns',
      icon: Gift,
      link: '/admin/analytics',
    },
    {
      label: 'Vouchers Redeemed',
      val: summary.totalRedemptions,
      sub: 'Burned rewards',
      icon: Sparkles,
      link: '/admin/analytics',
    },
    {
      label: 'Monthly Recurring (MRR)',
      val: `₹${Number(summary.mrr || 0).toLocaleString()}`,
      sub: `ARR: ₹${Number(summary.arr || (summary.mrr * 12) || 0).toLocaleString()}`,
      icon: DollarSign,
      link: '/admin/subscriptions',
    },
    {
      label: 'Active Subscriptions',
      val: summary.activeSubscriptions,
      sub: 'Paid tenant tiers',
      icon: CreditCard,
      link: '/admin/subscriptions',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Master Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/25 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              Live Pulse
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global operational oversight across all registered business tenants, patron visits, and recurring SaaS billing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Refresh Metrics"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 shadow-sm flex items-center gap-1.5 text-xs font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            href="/admin/businesses"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            Manage Businesses
          </Link>
          <Link
            href="/admin/subscriptions"
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-2.5 rounded-xl transition border border-slate-700 flex items-center gap-1.5"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
            Subscriptions
          </Link>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold">{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Urgent Pending Business Approvals Banner / Card */}
      {pendingList.length > 0 && (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/25 text-amber-200 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{pendingList.length} Business Tenant{pendingList.length > 1 ? 's' : ''} Awaiting Review & Activation</span>
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase">
                    Pending
                  </span>
                </h3>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  New business registration submitted. Verify venue information before granting active check-in capabilities.
                </p>
              </div>
            </div>

            <Link
              href="/admin/businesses?status=PENDING"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 px-3.5 py-2 rounded-xl transition shrink-0"
            >
              Review in Directory <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-amber-500/20">
            {pendingList.map((biz: any) => (
              <div
                key={biz.id}
                className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white truncate">{biz.name}</p>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md shrink-0">
                      {biz.city || 'India'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {biz.email || 'business@goldstamp.io'} · {biz.industry?.name || 'Local Commerce'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    disabled={updatingId === biz.id}
                    onClick={() => handleApproveBusiness(biz.id, biz.name)}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition shadow-sm disabled:opacity-50"
                  >
                    <Check className="w-3 h-3" />
                    Approve
                  </button>
                  <button
                    disabled={updatingId === biz.id}
                    onClick={() => handleRejectBusiness(biz.id, biz.name)}
                    className="px-2 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-xs font-semibold flex items-center gap-1 transition disabled:opacity-50"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10 Precision Metrics Counters */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            Core Platform Indicators
          </h2>
          <span className="text-[11px] text-slate-500">Updated in real-time</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <Link
                key={i}
                href={c.link}
                className={`group relative p-4 rounded-xl border transition flex flex-col justify-between ${
                  c.urgent
                    ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-400'
                    : 'bg-zinc-900 border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-900/90'
                } shadow-sm`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-200 truncate">
                      {c.label}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center border border-zinc-700/60">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-semibold text-white mt-2 tracking-tight tabular-nums">
                    {loading ? (
                      <span className="inline-block w-12 h-6 bg-zinc-800 rounded animate-pulse" />
                    ) : (
                      c.val
                    )}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-zinc-800/70 flex items-center justify-between">
                  <span className={`text-[10px] font-normal truncate ${c.urgent ? 'text-amber-400 font-medium' : 'text-zinc-400'}`}>
                    {c.sub}
                  </span>
                  <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition shrink-0 ml-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Dynamic Growth Chart with Switchable Views */}
      <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Platform Trajectory & Growth Curves
              </h2>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +28% MoM
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select metric dimension to analyze volume across tenants, visits, or recurring platform revenue.
            </p>
          </div>

          {/* Metric Selector Pills */}
          <div className="flex items-center p-1 bg-slate-900/90 border border-slate-700 rounded-2xl">
            <button
              onClick={() => setActiveMetric('audience')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeMetric === 'audience'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Audience & Tenants
            </button>
            <button
              onClick={() => setActiveMetric('activity')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeMetric === 'activity'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Visits & Stamps
            </button>
            <button
              onClick={() => setActiveMetric('revenue')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeMetric === 'revenue'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              MRR Revenue
            </button>
          </div>
        </div>

        {/* Chart View */}
        <div className="h-80 w-full pt-2">
          {mounted && growthData && growthData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.6} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                  tickFormatter={(val) => (activeMetric === 'revenue' ? `₹${val}` : `${val}`)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '14px',
                    color: '#ffffff',
                    border: '1px solid #334155',
                    fontSize: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                  formatter={(value: any, name: any) => [
                    activeMetric === 'revenue' ? `₹${Number(value).toLocaleString()}` : value,
                    name,
                  ]}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '16px', fontSize: '11px' }}
                />

                {activeMetric === 'audience' && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="customers"
                      name="Registered Patrons"
                      stroke="#a855f7"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#purpleGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="businesses"
                      name="Business Tenants"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#blueGrad)"
                    />
                  </>
                )}

                {activeMetric === 'activity' && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="visits"
                      name="Check-in Visits"
                      stroke="#6366f1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#indigoGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="stamps"
                      name="Loyalty Stamps"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#tealGrad)"
                    />
                  </>
                )}

                {activeMetric === 'revenue' && (
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="MRR Revenue (₹)"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#emeraldGrad)"
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              {loading ? 'Synthesizing platform trajectory data...' : 'No historical data recorded yet.'}
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout: Top Performing Venues + Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Venues Leaderboard (2 cols) */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Store className="w-4 h-4 text-purple-400" />
                Top Performing Business Venues
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Ranked by footfall check-ins, customer affinity, and stamp issuances.
              </p>
            </div>
            <Link
              href="/admin/businesses"
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1"
            >
              View All ({summary.totalBusinesses}) <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-700/60">
            {topVenues.map((venue: any, idx: number) => (
              <div
                key={venue.id || idx}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover:bg-slate-700/20 px-2 rounded-xl transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-slate-700/60 border border-slate-600/60 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-white group-hover:text-purple-300 transition">
                        {venue.name}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          venue.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {venue.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        {venue.city || 'India'}
                      </span>
                      <span>•</span>
                      <span className="text-purple-400/90 font-medium">{venue.industry}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right pl-10 sm:pl-0">
                  <div>
                    <p className="text-xs font-bold text-white">{venue.totalVisits} visits</p>
                    <p className="text-[10px] text-slate-400">{venue.totalCustomers} patrons</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-700/40 text-teal-400 border border-slate-700">
                    <Stamp className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Live Stream (1 col) */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Live Platform Audit
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Verified actions across tenants</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-3">
              {recentActivities.map((act: any) => (
                <div
                  key={act.id}
                  className="p-3 rounded-2xl bg-slate-900/70 border border-slate-700/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                        act.type === 'VISIT'
                          ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {act.type}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {act.time ? new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-white leading-tight mt-1">
                    {act.title}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {act.subtitle}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/60 text-center">
            <Link
              href="/admin/analytics"
              className="text-xs font-semibold text-slate-400 hover:text-white transition inline-flex items-center gap-1"
            >
              Full Platform Telemetry <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
