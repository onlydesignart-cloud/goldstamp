'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import {
  Footprints,
  ShieldCheck,
  QrCode,
  Search,
  RefreshCw,
  Users,
  Award,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function ClientVisitsPage() {
  const { business } = useAuth();
  const [visits, setVisits] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  let targetBizId = business?.id;
  if (!targetBizId && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('goldstamp_merchant_business');
      if (stored) targetBizId = JSON.parse(stored).id;
    } catch {}
  }

  const loadData = async () => {
    if (!targetBizId) {
      setLoading(false);
      return;
    }
    try {
      setIsRefreshing(true);
      const [visitsRes, analyticsRes] = await Promise.all([
        api.getBusinessVisits(targetBizId),
        api.getBusinessAnalytics(targetBizId),
      ]);

      if (visitsRes.success && visitsRes.data) {
        setVisits(visitsRes.data);
      }
      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      }
    } catch (err) {
      console.error('Failed to load visits ledger:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [business]);

  const filteredVisits = visits.filter((v) => {
    const name = v.user?.name || v.customerName || '';
    const email = v.user?.email || '';
    const q = searchTerm.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || v.id.toLowerCase().includes(q);
  });

  const uniqueCustomers = new Set(visits.map((v) => v.userId)).size;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visits & Check-Ins Ledger</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time cryptographic audit trail of customer attendance & verified stamp issuances.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Ledger
          </button>
          <Link
            href="/client/qr"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            Open Counter QR Kiosk
          </Link>
        </div>
      </div>

      {/* Metrics Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Recorded Visits</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{visits.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Immutable ledger
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unique Customers</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{uniqueCustomers}</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Active members
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stamps Issued</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{analytics?.summary?.totalStamps ?? visits.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> +1 stamp per scan
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Security Integrity</div>
          <div className="text-2xl font-black text-emerald-600 mt-1">100%</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> HMAC Replay-Proof
          </div>
        </div>
      </div>

      {/* Main Ledger Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Verified Visit History</h2>
            <p className="text-xs text-slate-400 mt-0.5">Chronological record of counter check-ins</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search customer or visit ID..."
                className="pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-56 sm:w-64 transition"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent mb-2" />
            <p>Loading visits ledger...</p>
          </div>
        ) : filteredVisits.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredVisits.map((v, i) => {
              const custName = v.user?.name || 'Customer';
              const custEmail = v.user?.email || 'customer@gmail.com';
              const initials = custName.slice(0, 2).toUpperCase();
              const dateObj = new Date(v.createdAt);

              return (
                <div
                  key={v.id || i}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{custName}</span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <ShieldCheck className="w-3 h-3" /> VERIFIED
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs mt-0.5">
                        <span>{custEmail}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px] text-slate-500">ID: {v.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        +1 Stamp Issued
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        Method: {v.verificationMethod || 'DYNAMIC_QR'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-slate-700 text-xs">
                        {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-end gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Footprints className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">No Visits Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm
                ? `No visits matched "${searchTerm}". Try clearing your search.`
                : 'No customer visits recorded yet. Visits will appear here live as patrons check in at your counter.'}
            </p>
            <div className="mt-4">
              <Link
                href="/client/qr"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition"
              >
                Go to Counter QR Kiosk <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Guide Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">How Counter Visits Work:</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              1. Display your <Link href="/client/qr" className="underline font-semibold text-emerald-700">Counter QR Kiosk</Link> on a tablet or counter standee.<br />
              2. Patrons point their phone camera at the dynamic QR code to check in.<br />
              3. Stamp increments and verified visits are logged here in real-time.
            </p>
          </div>
        </div>
        <Link
          href="/client/qr"
          className="shrink-0 px-3.5 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition"
        >
          Open Counter Kiosk
        </Link>
      </div>
    </div>
  );
}
