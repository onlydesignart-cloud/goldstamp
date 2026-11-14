'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { exportToCsv } from '../../../lib/exportCsv';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Percent,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Building2,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  Check,
  Receipt,
  Download,
  Calendar,
  Layers,
  Award,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cadenceFilter, setCadenceFilter] = useState<'ALL' | 'ANNUAL' | 'MONTHLY' | 'TRIAL'>('ALL');
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminSubscriptions();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load subscription analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const summary = data?.summary || {
    totalSubscribers: 0,
    activeSubscribers: 0,
    annualSubscribers: 0,
    monthlySubscribers: 0,
    trialSubscribers: 0,
    annualAdoptionRate: 0,
    totalMRR: 0,
    totalARR: 0,
    totalAnnualSavingsGranted: 0,
    arpu: 0,
  };

  const subscribers: any[] = data?.subscribers || [];
  const planBreakdown: any[] = data?.planBreakdown || [];
  const cadenceBreakdown = data?.cadenceBreakdown || {
    annual: { count: 0, percentage: 0, mrrContribution: 0, arrContribution: 0, totalSavingsGiven: 0 },
    monthly: { count: 0, percentage: 0, mrrContribution: 0, arrContribution: 0, totalSavingsGiven: 0 },
  };
  const cadenceTrend = data?.cadenceTrend || [];
  const invoices = data?.invoices || [];

  // Filter subscribers list
  const filteredSubscribers = subscribers.filter((s) => {
    const matchesSearch =
      s.businessName.toLowerCase().includes(search.toLowerCase()) ||
      s.businessOwner.toLowerCase().includes(search.toLowerCase()) ||
      s.planName.toLowerCase().includes(search.toLowerCase()) ||
      s.businessCity.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (cadenceFilter === 'ANNUAL') return s.isAnnual && s.status === 'ACTIVE';
    if (cadenceFilter === 'MONTHLY') return !s.isAnnual && s.status === 'ACTIVE';
    if (cadenceFilter === 'TRIAL') return s.status === 'TRIAL' || s.status === 'PENDING';
    return true;
  });

  const handleExportCsv = () => {
    const headers = [
      'Business Venue',
      'Owner',
      'City',
      'Plan Tier',
      'Billing Cadence',
      'Effective Rate (INR/mo)',
      'Billed Amount (INR/yr)',
      'Annual Savings (INR)',
      'Next Renewal',
      'Payment Method',
      'Status',
    ];

    const rows = filteredSubscribers.map((s) => [
      s.businessName,
      s.businessOwner,
      s.businessCity,
      s.planName,
      s.isAnnual ? 'ANNUAL (20% OFF)' : s.status === 'TRIAL' ? '14-DAY TRIAL' : 'Monthly Standard',
      s.effectiveMonthlyPrice,
      s.billedAmount,
      s.annualSavings,
      s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : 'Auto-renew',
      s.paymentMethod,
      s.status,
    ]);

    exportToCsv(`goldstamp_subscribers_report_${Date.now()}`, headers, rows);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              SaaS Subscription Analytics
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              20% Annual Discount Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Detailed recurring revenue metrics, annual billing adoption analysis, and merchant subscriber accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition border border-slate-700 shadow-sm flex items-center gap-1.5 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export Subscribers CSV
          </button>
          <button
            onClick={loadData}
            title="Refresh Subscription Data"
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
            Tenants Directory
          </Link>
        </div>
      </div>

      {/* Top 5 Precision KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* MRR Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Monthly Recurring (MRR)</span>
              <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
              {loading ? '...' : `₹${summary.totalMRR.toLocaleString()}`}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
            <span>Annual Run Rate (ARR)</span>
            <span className="font-bold text-emerald-400">₹{summary.totalARR.toLocaleString()}</span>
          </div>
        </div>

        {/* Annual Adoption Rate Card */}
        <div className="bg-slate-800/80 border border-purple-500/30 p-4 rounded-2xl flex flex-col justify-between shadow-sm bg-gradient-to-br from-slate-800/80 to-purple-950/20">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-purple-300">Annual 20% Off Adoption</span>
              <div className="p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/25">
                <Percent className="w-3.5 h-3.5 text-purple-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight flex items-baseline gap-2">
              <span>{loading ? '...' : `${summary.annualAdoptionRate}%`}</span>
              <span className="text-xs font-semibold text-purple-400">High LTV</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-300">
            <span>Annual vs Monthly</span>
            <span className="font-bold text-purple-300">{summary.annualSubscribers} of {summary.activeSubscribers} Active</span>
          </div>
        </div>

        {/* Total Annual Merchant Savings Card */}
        <div className="bg-slate-800/80 border border-amber-500/30 p-4 rounded-2xl flex flex-col justify-between shadow-sm bg-gradient-to-br from-slate-800/80 to-amber-950/20">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-300">Annual Savings Given</span>
              <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-2 tracking-tight">
              {loading ? '...' : `₹${summary.totalAnnualSavingsGranted.toLocaleString()}`}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
            <span>20% Discount Incentive</span>
            <span className="font-bold text-amber-400">Zero Churn Lock</span>
          </div>
        </div>

        {/* Active Paying Subscribers Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Active Paying Tenants</span>
              <div className="p-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <CreditCard className="w-3.5 h-3.5 text-blue-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
              {loading ? '...' : summary.activeSubscribers}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
            <span>In Free Trial</span>
            <span className="font-bold text-slate-300">{summary.trialSubscribers} Venue</span>
          </div>
        </div>

        {/* ARPU Card */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Blended ARPU</span>
              <div className="p-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
              {loading ? '...' : `₹${summary.arpu.toLocaleString()}`}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
            <span>Avg Yield / Tenant</span>
            <span className="font-bold text-cyan-400">Monthly</span>
          </div>
        </div>
      </div>

      {/* Cadence Breakdown: Annual (20% OFF) vs Monthly Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Annual Card */}
        <div className="bg-slate-800/90 border border-emerald-500/30 p-5 sm:p-6 rounded-3xl relative overflow-hidden shadow-lg bg-gradient-to-br from-slate-900 via-slate-800/90 to-emerald-950/20">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Annual Cadence (20% OFF)</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase">
                    Preferred
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Merchants commit annually to save 20% each month (billed upfront for 12 months).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 pt-4 border-t border-slate-700/60 text-center">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Subscribers</span>
              <span className="text-lg font-black text-white mt-1 block">
                {cadenceBreakdown.annual.count} ({cadenceBreakdown.annual.percentage}%)
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">MRR Contribution</span>
              <span className="text-lg font-black text-emerald-400 mt-1 block">
                ₹{cadenceBreakdown.annual.mrrContribution.toLocaleString()}/mo
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Annual Savings Passed</span>
              <span className="text-lg font-black text-amber-400 mt-1 block">
                ₹{cadenceBreakdown.annual.totalSavingsGiven.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              100% upfront capital collection & 0% annualized churn
            </span>
            <span className="font-bold">ARR: ₹{cadenceBreakdown.annual.arrContribution.toLocaleString()}</span>
          </div>
        </div>

        {/* Monthly Standard Card */}
        <div className="bg-slate-800/90 border border-slate-700 p-5 sm:p-6 rounded-3xl relative overflow-hidden shadow-lg bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-slate-700/60 text-slate-300 border border-slate-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">Monthly Cadence (Standard Rate)</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-300 uppercase">
                    Standard
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tenants billed regular monthly rate without discounts, renewed every 30 days.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3 pt-4 border-t border-slate-700/60 text-center">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Subscribers</span>
              <span className="text-lg font-black text-white mt-1 block">
                {cadenceBreakdown.monthly.count} ({cadenceBreakdown.monthly.percentage}%)
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">MRR Contribution</span>
              <span className="text-lg font-black text-slate-200 mt-1 block">
                ₹{cadenceBreakdown.monthly.mrrContribution.toLocaleString()}/mo
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-medium">Discount Given</span>
              <span className="text-lg font-black text-slate-400 mt-1 block">
                ₹0 (None)
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px] text-slate-400 bg-slate-900/80 border border-slate-700 px-3.5 py-2 rounded-xl">
            <span className="font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Flexible monthly commitment via recurring UPI AutoPay
            </span>
            <span className="font-bold text-slate-300">ARR: ₹{cadenceBreakdown.monthly.arrContribution.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Cadence Revenue Trend & Plan Tier Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recharts Area Chart: Revenue by Billing Cadence */}
        <div className="lg:col-span-2 bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                MRR Ingestion by Billing Cadence
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparison of revenue velocity from Annual (20% Off) vs Monthly subscribers.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Annual 20% Off
              </span>
              <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Monthly Standard
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            {mounted && cadenceTrend && cadenceTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cadenceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="annualGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="monthlyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.6} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '14px',
                      color: '#ffffff',
                      border: '1px solid #334155',
                      fontSize: '12px',
                    }}
                    formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString()}`, name]}
                  />
                  <Area
                    type="monotone"
                    dataKey="annualMrr"
                    name="Annual 20% Off MRR"
                    stroke="#a855f7"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#annualGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="monthlyMrr"
                    name="Monthly Standard MRR"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#monthlyGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Loading cadence telemetry...
              </div>
            )}
          </div>
        </div>

        {/* Tier Distribution breakdown */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Plan Tier Distribution
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Active subscriber allocation across SaaS pricing tiers.
            </p>

            <div className="mt-4 space-y-3">
              {planBreakdown.map((p) => {
                const totalActive = summary.activeSubscribers || 1;
                const percent = Math.round((p.subscribersCount / totalActive) * 100);
                return (
                  <div key={p.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-white">{p.name} Tier</span>
                        <span className="text-[10px] text-slate-400 ml-2">
                          (₹{p.price}/mo std · ₹{p.annualPrice}/mo ann)
                        </span>
                      </div>
                      <span className="text-xs font-black text-purple-300">
                        {p.subscribersCount} venues
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>{p.annualCount} Annual · {p.monthlyCount} Monthly</span>
                      <span className="font-semibold text-emerald-400">
                        ₹{p.mrrContribution.toLocaleString()}/mo MRR
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Growth Tier is the most popular choice among pickleball arenas & cafes.</span>
          </div>
        </div>
      </div>

      {/* Detailed Subscribers Directory Table with 20% Annual Highlights */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl overflow-hidden shadow-lg space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Tenant Subscribers Directory & Discount Analysis
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live roster showing which merchants chose the Annual 20% OFF option vs Standard Monthly.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-700 rounded-2xl">
            <button
              onClick={() => setCadenceFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                cadenceFilter === 'ALL'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({subscribers.length})
            </button>
            <button
              onClick={() => setCadenceFilter('ANNUAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                cadenceFilter === 'ANNUAL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Annual 20% OFF ({summary.annualSubscribers})
            </button>
            <button
              onClick={() => setCadenceFilter('MONTHLY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                cadenceFilter === 'MONTHLY'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Standard ({summary.monthlySubscribers})
            </button>
            <button
              onClick={() => setCadenceFilter('TRIAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                cadenceFilter === 'TRIAL'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400 hover:text-white'
              }`}
            >
              Trial ({summary.trialSubscribers})
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subscriber by business name, owner, city, or plan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-700 bg-slate-900/90 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        {/* Subscribers Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-700/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="px-5 py-3.5">Business Venue</th>
                <th className="px-4 py-3.5">Pricing Tier</th>
                <th className="px-4 py-3.5">Billing Cadence & Discount</th>
                <th className="px-4 py-3.5">Effective Rate</th>
                <th className="px-4 py-3.5">Annual Billed Total & Savings</th>
                <th className="px-4 py-3.5">Next Renewal</th>
                <th className="px-4 py-3.5">Payment Method</th>
                <th className="px-4 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    No subscribers matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-700/20 transition">
                    {/* Business Info */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-white text-xs">{sub.businessName}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {sub.businessOwner} · {sub.businessCity}
                        </p>
                        <span className="text-[10px] text-purple-400 font-medium">
                          {sub.industry}
                        </span>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-4 py-4">
                      <span className="font-semibold text-white px-2.5 py-1 rounded-lg bg-slate-700/60 border border-slate-600/60 inline-block text-[11px]">
                        {sub.planName}
                      </span>
                    </td>

                    {/* Billing Cadence with 20% OFF tag */}
                    <td className="px-4 py-4">
                      {sub.isAnnual ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          <span>ANNUAL — 20% OFF</span>
                        </div>
                      ) : sub.status === 'TRIAL' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
                          <Clock className="w-3 h-3" />
                          14-DAY TRIAL
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-slate-700/50 border border-slate-600 text-slate-300 font-medium">
                          Monthly Standard
                        </span>
                      )}
                    </td>

                    {/* Effective Rate */}
                    <td className="px-4 py-4">
                      {sub.isAnnual ? (
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-emerald-400">
                              ₹{sub.discountedMonthlyPrice}/mo
                            </span>
                            <span className="text-[10px] text-slate-500 line-through">
                              ₹{sub.baseMonthlyPrice}
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            20% off every month
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-bold text-white">
                          ₹{sub.effectiveMonthlyPrice}/mo
                        </span>
                      )}
                    </td>

                    {/* Annual Billed & Savings */}
                    <td className="px-4 py-4">
                      {sub.isAnnual ? (
                        <div>
                          <p className="font-bold text-white">
                            ₹{sub.billedAmount.toLocaleString()}/yr
                          </p>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[10px]">
                            Saved ₹{sub.annualSavings.toLocaleString()}/yr!
                          </span>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-slate-300">
                            ₹{(sub.effectiveMonthlyPrice * 12).toLocaleString()}/yr equiv
                          </p>
                          <span className="text-[10px] text-slate-500">No discount applied</span>
                        </div>
                      )}
                    </td>

                    {/* Renewal Date */}
                    <td className="px-4 py-4 text-slate-300">
                      <div>
                        <p className="font-medium">
                          {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : 'Ongoing'}
                        </p>
                        <span className="text-[10px] text-slate-500">Auto-renews</span>
                      </div>
                    </td>

                    {/* Payment Method */}
                    <td className="px-4 py-4 text-slate-400 font-mono text-[11px]">
                      {sub.paymentMethod}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          sub.status === 'ACTIVE'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Tax Invoices Audit Table */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-purple-400" />
              Recent SaaS Tax Invoices Generated
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated invoice records with GST & single-use reference IDs for active tenant payments.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {invoices.length} Total Invoices
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-700/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="px-5 py-3.5">Invoice ID</th>
                <th className="px-4 py-3.5">Plan Invoiced</th>
                <th className="px-4 py-3.5">Amount Billed</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-4 py-3.5">Payment Method</th>
                <th className="px-4 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-slate-700/20 transition">
                  <td className="px-5 py-3.5 font-mono font-bold text-white text-xs">
                    {inv.id}
                  </td>
                  <td className="px-4 py-3.5 text-slate-200 font-medium">
                    {inv.planName}
                  </td>
                  <td className="px-4 py-3.5 font-bold text-emerald-400">
                    ₹{Number(inv.amount).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">
                    {new Date(inv.date).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">
                    {inv.paymentMethod}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase">
                      {inv.status}
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
