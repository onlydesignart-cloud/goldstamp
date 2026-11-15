'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { exportToCsv } from '../../../lib/exportCsv';
import { ADMIN_ROUTE_PREFIX } from '../../../config/adminRoute';
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

  const filteredSubscribers = subscribers.filter((s) => {
    const matchesSearch =
      s.businessName.toLowerCase().includes(search.toLowerCase()) ||
      s.businessOwner.toLowerCase().includes(search.toLowerCase()) ||
      s.planName.toLowerCase().includes(search.toLowerCase()) ||
      s.businessCity.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (cadenceFilter === 'ANNUAL') return s.isAnnual;
    if (cadenceFilter === 'MONTHLY') return !s.isAnnual && s.status !== 'TRIAL';
    if (cadenceFilter === 'TRIAL') return s.status === 'TRIAL';
    return true;
  });

  const handleExportCsv = () => {
    const headers = [
      'Business Name',
      'Owner',
      'City',
      'Plan Tier',
      'Billing Cadence',
      'Discount Applied',
      'Monthly Equivalent (INR)',
      'Annual Total (INR)',
      'Savings Granted (INR)',
      'Payment Method',
      'Status',
    ];

    const rows = filteredSubscribers.map((s) => [
      s.businessName,
      s.businessOwner,
      s.businessCity,
      s.planName,
      s.isAnnual ? 'Annual (20% OFF)' : s.status === 'TRIAL' ? '14-Day Trial' : 'Monthly Standard',
      s.isAnnual ? '20% Ongoing' : 'None',
      s.effectiveMonthlyPrice,
      s.isAnnual ? s.billedAmount : s.effectiveMonthlyPrice * 12,
      s.annualSavings,
      s.paymentMethod,
      s.status,
    ]);

    exportToCsv(`goldstamp_subscribers_${Date.now()}`, headers, rows);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Subscriptions & Billing Economics
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
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition border border-slate-700 shadow-sm flex items-center gap-1.5 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export Subscribers CSV</span>
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
            href={`${ADMIN_ROUTE_PREFIX}/businesses`}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5"
          >
            <Building2 className="w-3.5 h-3.5" />
            Tenants Directory
          </Link>
        </div>
      </div>

      {/* Top 5 Precision KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
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
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>Annual Run-Rate</span>
            <span className="font-bold text-emerald-400">₹{summary.totalARR.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Active Subscribers</span>
              <div className="p-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <CreditCard className="w-3.5 h-3.5 text-purple-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
              {loading ? '...' : summary.activeSubscribers}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>Paid Tenants</span>
            <span className="font-bold text-purple-400">{summary.totalSubscribers} total</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-2xl flex flex-col justify-between shadow-sm bg-gradient-to-br from-slate-900/90 to-emerald-950/20">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-emerald-300">Annual Adoption Rate</span>
              <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Percent className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-2 tracking-tight">
              {loading ? '...' : `${summary.annualAdoptionRate}%`}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>Chose 20% OFF</span>
            <span className="font-bold text-emerald-400">{summary.annualSubscribers} of {summary.activeSubscribers} venues</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-amber-500/30 p-4 rounded-2xl flex flex-col justify-between shadow-sm bg-gradient-to-br from-slate-900/90 to-amber-950/20">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-amber-300">Annual Savings Given</span>
              <div className="p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 mt-2 tracking-tight">
              {loading ? '...' : `₹${summary.totalAnnualSavingsGranted.toLocaleString()}`}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>20% Discount Given</span>
            <span className="font-bold text-amber-400">Rewarded upfront</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Avg Revenue / Account</span>
              <div className="p-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-white mt-2 tracking-tight">
              {loading ? '...' : `₹${summary.arpu.toLocaleString()}`}
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>Blended ARPU</span>
            <span className="font-bold text-blue-400">Per subscriber</span>
          </div>
        </div>
      </div>

      {/* Cadence Revenue Trend & Plan Tier Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
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
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.4} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val}`}
                  />
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
                Synthesizing cadence telemetry...
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              SaaS Pricing Tier Distribution
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Active subscriber allocation across SaaS pricing tiers.
            </p>

            <div className="mt-4 space-y-3">
              {planBreakdown.map((p) => {
                const totalActive = summary.activeSubscribers || 1;
                const percent = Math.round((p.subscribersCount / totalActive) * 100);
                return (
                  <div key={p.id} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
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
            <span>Growth Tier is the most popular choice among venues.</span>
          </div>
        </div>
      </div>

      {/* Detailed Subscribers Directory Table - With Non-wrapping columns */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-4 p-6">
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

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-2xl">
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
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        {/* Subscribers Table with min-width to prevent word cutting */}
        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full min-w-[1050px] text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 min-w-[200px] whitespace-nowrap">Business Venue</th>
                <th className="px-4 py-3.5 min-w-[120px] whitespace-nowrap">Pricing Tier</th>
                <th className="px-4 py-3.5 min-w-[180px] whitespace-nowrap">Billing Cadence & Discount</th>
                <th className="px-4 py-3.5 min-w-[130px] whitespace-nowrap">Effective Rate</th>
                <th className="px-4 py-3.5 min-w-[180px] whitespace-nowrap">Annual Billed Total & Savings</th>
                <th className="px-4 py-3.5 min-w-[130px] whitespace-nowrap">Next Renewal</th>
                <th className="px-4 py-3.5 min-w-[130px] whitespace-nowrap">Payment Method</th>
                <th className="px-4 py-3.5 min-w-[100px] text-right whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                    No subscribers matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-5 py-4 whitespace-nowrap">
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

                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="font-semibold text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 inline-block text-[11px]">
                        {sub.planName}
                      </span>
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
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
                        <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                          Monthly Standard
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 whitespace-nowrap">
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

                    <td className="px-4 py-4 whitespace-nowrap">
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

                    <td className="px-4 py-4 whitespace-nowrap text-slate-300">
                      <div>
                        <p className="font-medium">
                          {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : 'Ongoing'}
                        </p>
                        <span className="text-[10px] text-slate-500">Auto-renews</span>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {sub.paymentMethod}
                    </td>

                    <td className="px-4 py-4 text-right whitespace-nowrap">
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
    </div>
  );
}
