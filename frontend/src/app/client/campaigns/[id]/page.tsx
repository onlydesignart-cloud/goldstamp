'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../../lib/api';
import { useAuth } from '../../../../lib/auth-context';
import { exportToCsv } from '../../../../lib/exportCsv';
import { StampCard } from '../../../../components/StampCard';
import {
  ArrowLeft,
  Megaphone,
  Gift,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart3,
  QrCode,
  Search,
  Award,
  Calendar,
  Phone,
  Mail,
  Zap,
  ExternalLink,
  ShieldCheck,
  Check,
  RefreshCw,
  Ticket,
  Download,
} from 'lucide-react';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { business } = useAuth();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'customers' | 'scans' | 'redemptions'>('customers');
  const [customerSearch, setCustomerSearch] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadCampaign() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.getCampaignDetails(id);
        if (res.success && res.data) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load campaign details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCampaign();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 py-6 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded-lg"></div>
        <div className="h-28 bg-slate-200 rounded-3xl"></div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-96 bg-slate-200 rounded-3xl"></div>
      </div>
    );
  }

  if (!data || !data.campaign) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
          <Megaphone className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Campaign Not Found</h2>
        <p className="text-xs text-slate-500">The campaign you are looking for does not exist or has been removed.</p>
        <Link
          href="/client/campaigns"
          className="inline-flex items-center gap-1.5 bg-slate-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Campaigns
        </Link>
      </div>
    );
  }

  const { campaign, targetStamps, stats, customers, recentScans, redemptions } = data;
  const filteredCustomers = (customers || []).filter((c: any) => {
    if (!customerSearch) return true;
    const q = customerSearch.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  });

  const handleCopyKioskLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://goldstamp.vercel.app';
    const kioskUrl = `${origin}/client/qr`;
    navigator.clipboard.writeText(kioskUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleExportCustomers = () => {
    if (!customers || customers.length === 0) return;
    const sanitizedTitle = (campaign?.name || 'campaign').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `${sanitizedTitle}_patrons_${new Date().toISOString().split('T')[0]}`;
    const headers = [
      'Customer Name',
      'Email',
      'Phone',
      'Current Cycle Stamps',
      'Target Stamps',
      'Progress (%)',
      'Total Lifetime Stamps',
      'Total Visits',
      'Reward Status',
      'Last Visit Date',
    ];
    const rows = customers.map((c: any) => {
      const percent = Math.min(100, Math.round((c.cycleStamps / targetStamps) * 100));
      return [
        c.name || 'Anonymous',
        c.email || 'N/A',
        c.phone || 'N/A',
        c.cycleStamps ?? 0,
        targetStamps ?? 10,
        `${percent}%`,
        c.totalStamps ?? 0,
        c.totalVisits ?? 0,
        c.isRewardReady ? 'REWARD_READY' : 'IN_PROGRESS',
        c.lastVisitAt ? new Date(c.lastVisitAt).toLocaleDateString() : 'N/A',
      ];
    });
    exportToCsv(filename, headers, rows);
  };

  const handleExportScans = () => {
    if (!recentScans || recentScans.length === 0) return;
    const sanitizedTitle = (campaign?.name || 'campaign').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `${sanitizedTitle}_scans_${new Date().toISOString().split('T')[0]}`;
    const headers = [
      'Scan ID',
      'Customer Name',
      'Date & Time',
      'Verification Method',
      'Device / Channel',
      'Credit',
      'Status',
    ];
    const rows = recentScans.map((s: any) => [
      s.id || 'N/A',
      s.customerName || 'Customer',
      new Date(s.timestamp).toLocaleString(),
      'Counter QR',
      s.deviceInfo || 'Mobile Device',
      '+1 Stamp',
      'Verified',
    ]);
    exportToCsv(filename, headers, rows);
  };

  const handleExportRedemptions = () => {
    if (!redemptions || redemptions.length === 0) return;
    const sanitizedTitle = (campaign?.name || 'campaign').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const filename = `${sanitizedTitle}_redemptions_${new Date().toISOString().split('T')[0]}`;
    const headers = [
      'Voucher Code',
      'Customer Name',
      'Reward Title',
      'Date Granted',
      'Status',
    ];
    const rows = redemptions.map((r: any) => [
      r.voucherCode || 'N/A',
      r.customerName || 'Customer',
      r.rewardTitle || 'Milestone Reward',
      new Date(r.issuedAt).toLocaleDateString(),
      r.status || 'ACTIVE',
    ]);
    exportToCsv(filename, headers, rows);
  };

  const handleExportCurrentTab = () => {
    if (activeTab === 'customers') handleExportCustomers();
    else if (activeTab === 'scans') handleExportScans();
    else handleExportRedemptions();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2 pb-16">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/client/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Campaigns
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCurrentTab}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-2xs"
            title="Download CSV report for current view"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleCopyKioskLink}
            className="inline-flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-2xs"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-600" />
            <span>{copiedLink ? 'Kiosk Link Copied!' : 'Copy Kiosk Link'}</span>
          </button>
          <Link
            href="/client/qr"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open Dynamic Kiosk</span>
          </Link>
        </div>
      </div>

      {/* Campaign Banner Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-emerald-50 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                {campaign.type || 'STAMP'} Program
              </span>
              <span className="bg-slate-900 text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-800">
                🎯 {targetStamps} Stamps Milestone Target
              </span>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  campaign.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                ● {campaign.status || 'ACTIVE'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {campaign.name}
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              {campaign.description || 'Collect digital stamps per verified counter scan. Patrons unlock the reward once target stamps are reached.'}
            </p>
          </div>

          {/* Reward Highlight Badge */}
          <div className="shrink-0 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center gap-3.5 min-w-[260px]">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
              <Gift className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Free Milestone Reward
              </span>
              <div className="text-sm font-black text-slate-900 truncate mt-0.5">
                {campaign.rewardTitle || 'Milestone Perk'}
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 mt-0.5 block">
                Unlocks on #{targetStamps}th Stamp
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics KPI Board (6 Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">QR Scans</span>
            <QrCode className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats.totalVisits}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Verified visits</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Stamps Issued</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats.totalStampsIssued}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Total stamps credited</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Enrolled Patrons</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats.uniqueCustomers}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Unique active users</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Cards Completed</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats.completedRewardsCount}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{targetStamps}+ stamps reached</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Vouchers Claimed</span>
            <Ticket className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats.claimedVouchersCount}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Rewards issued</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Completion Rate</span>
            <BarChart3 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats.completionRate}%
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Patrons converted</span>
        </div>
      </div>

      {/* Stamp Card Visual Scale Validation (Merchant Verification) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Accurate Customer Card Layout ({targetStamps} Stamps)</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Patrons who join this campaign see exactly this {targetStamps}-slot grid in their wallet and on your venue page.
            </p>
          </div>
          <span className="text-xs font-mono font-bold bg-white/10 px-3 py-1 rounded-full text-emerald-300 self-start sm:self-auto">
            Configured: {targetStamps} Slots
          </span>
        </div>

        {/* Visual Slot Grid Preview */}
        <div
          className={`grid gap-2 ${
            targetStamps === 2
              ? 'grid-cols-2'
              : targetStamps === 3
              ? 'grid-cols-3'
              : targetStamps === 4
              ? 'grid-cols-4'
              : targetStamps === 5
              ? 'grid-cols-5'
              : targetStamps === 6
              ? 'grid-cols-3 sm:grid-cols-6'
              : targetStamps === 7
              ? 'grid-cols-4 sm:grid-cols-7'
              : targetStamps === 8
              ? 'grid-cols-4'
              : targetStamps === 9
              ? 'grid-cols-3 sm:grid-cols-5'
              : targetStamps === 10
              ? 'grid-cols-5'
              : targetStamps === 12
              ? 'grid-cols-4 sm:grid-cols-6'
              : 'grid-cols-5 sm:grid-cols-6'
          }`}
        >
          {Array.from({ length: targetStamps }).map((_, index) => {
            const slotNumber = index + 1;
            const isMilestone = slotNumber === targetStamps;
            return (
              <div
                key={index}
                className={`aspect-square sm:aspect-auto sm:h-12 rounded-xl flex items-center justify-center font-mono text-xs font-bold border transition ${
                  index < 2
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                    : isMilestone
                    ? 'bg-amber-400/20 border-amber-400/50 text-amber-300'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {index < 2 ? (
                  <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                ) : isMilestone ? (
                  <Gift className="w-4 h-4 text-amber-300" />
                ) : (
                  <span>#{slotNumber}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs Section: Customers, Scans, Redemptions */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 px-6 pt-4 flex gap-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('customers')}
            className={`pb-3.5 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'customers'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Enrolled Customers ({customers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('scans')}
            className={`pb-3.5 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'scans'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Live Scan Logs ({recentScans.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('redemptions')}
            className={`pb-3.5 text-xs font-bold transition border-b-2 flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'redemptions'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Vouchers & Redemptions ({redemptions.length})</span>
          </button>
        </div>

        {/* Tab 1: Enrolled Customers */}
        {activeTab === 'customers' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search patron by name, email, or phone..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-slate-500 font-medium">
                  Showing {filteredCustomers.length} enrolled patron(s)
                </span>
                <button
                  onClick={handleExportCustomers}
                  disabled={customers.length === 0}
                  className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-200 transition cursor-pointer"
                  title="Export patron list to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {filteredCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3">Customer Patron</th>
                      <th className="py-3 px-3">Contact</th>
                      <th className="py-3 px-3">Current Progress</th>
                      <th className="py-3 px-3 text-center">Total Stamps</th>
                      <th className="py-3 px-3 text-center">Visits</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Last Visit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredCustomers.map((cust: any) => {
                      const percent = Math.min(100, Math.round((cust.cycleStamps / targetStamps) * 100));
                      return (
                        <tr key={cust.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                                {cust.name ? cust.name.substring(0, 2).toUpperCase() : 'CU'}
                              </div>
                              <div className="font-bold text-slate-900">{cust.name}</div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-slate-500 text-[11px]">
                            {cust.email && <div className="truncate max-w-[150px]">{cust.email}</div>}
                            {cust.phone && <div className="font-mono text-slate-400">{cust.phone}</div>}
                          </td>

                          <td className="py-3.5 px-3 min-w-[160px]">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                                <span>{cust.cycleStamps} / {targetStamps} Stamps</span>
                                <span className="text-emerald-700 font-mono">{percent}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                  style={{ width: `${percent}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-800">
                            {cust.totalStamps}
                          </td>

                          <td className="py-3.5 px-3 text-center font-mono text-slate-600">
                            {cust.totalVisits}
                          </td>

                          <td className="py-3.5 px-3 text-center">
                            {cust.isRewardReady ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-200">
                                <Gift className="w-3 h-3 text-emerald-600" /> Reward Ready
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-600 font-medium text-[10px] px-2 py-0.5 rounded-full">
                                {targetStamps - cust.cycleStamps} more to go
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-3 text-right text-slate-500 text-[11px] whitespace-nowrap">
                            {cust.lastVisitAt ? new Date(cust.lastVisitAt).toLocaleDateString() : 'Active Member'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No patrons found</h4>
                <p className="text-xs text-slate-400">
                  {customerSearch ? 'No patrons matching your search term.' : 'Patrons will appear here as soon as they scan your counter QR code.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Live QR Scans Log */}
        {activeTab === 'scans' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Audit Trail of QR Token Check-Ins</span>
              <div className="flex items-center gap-2.5">
                <span>Total recorded: {recentScans.length} scan(s)</span>
                <button
                  onClick={handleExportScans}
                  disabled={recentScans.length === 0}
                  className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-200 transition cursor-pointer"
                  title="Export scan logs to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {recentScans.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3">Patron Name</th>
                      <th className="py-3 px-3">Date & Time</th>
                      <th className="py-3 px-3">Verification</th>
                      <th className="py-3 px-3">Device / Channel</th>
                      <th className="py-3 px-3 text-center">Credit</th>
                      <th className="py-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {recentScans.map((scan: any) => (
                      <tr key={scan.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-3 font-bold text-slate-900">
                          {scan.customerName}
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                          {new Date(scan.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100">
                            <QrCode className="w-3 h-3 text-emerald-600" />
                            Counter QR
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 text-[11px] truncate max-w-[180px]">
                          {scan.deviceInfo}
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            +1 Stamp
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center space-y-2">
                <QrCode className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No scan check-ins yet</h4>
                <p className="text-xs text-slate-400">
                  When customers point their phone camera at your dynamic kiosk QR, visits will appear here live in real-time.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Vouchers & Redemptions */}
        {activeTab === 'redemptions' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Completed Milestone Vouchers & Redemptions</span>
              <div className="flex items-center gap-2.5">
                <span>Total issued: {redemptions.length} voucher(s)</span>
                <button
                  onClick={handleExportRedemptions}
                  disabled={redemptions.length === 0}
                  className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-200 transition cursor-pointer"
                  title="Export vouchers to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {redemptions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-3">Customer Patron</th>
                      <th className="py-3 px-3">Reward Earned</th>
                      <th className="py-3 px-3">Voucher Code</th>
                      <th className="py-3 px-3">Date Granted</th>
                      <th className="py-3 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {redemptions.map((r: any) => (
                      <tr key={r.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-3 font-bold text-slate-900">
                          {r.customerName}
                        </td>
                        <td className="py-3.5 px-3 text-emerald-700 font-bold">
                          {r.rewardTitle}
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-slate-800">
                          <span className="bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                            {r.voucherCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-500 font-mono text-[11px]">
                          {new Date(r.issuedAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              r.status === 'REDEEMED'
                                ? 'bg-slate-100 text-slate-700 border border-slate-200'
                                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            ● {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center space-y-2">
                <Ticket className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">No vouchers granted yet</h4>
                <p className="text-xs text-slate-400">
                  As soon as a customer collects {targetStamps} stamps, their single-use reward voucher code will appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
