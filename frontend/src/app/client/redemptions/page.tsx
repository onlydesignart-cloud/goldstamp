'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import { CheckCircle2, Gift, Search, AlertCircle, Sparkles, Check, Clock, ArrowRight } from 'lucide-react';

export default function ClientRedemptionsPage() {
  const { business } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentRedemptions, setRecentRedemptions] = useState<any[]>([]);

  const resolveBizId = () => {
    let targetBizId = business?.id;
    if (!targetBizId && typeof window !== 'undefined') {
      try {
        const storedBiz = localStorage.getItem('goldstamp_merchant_business');
        if (storedBiz) targetBizId = JSON.parse(storedBiz).id;
      } catch {}
    }
    return targetBizId || 'biz_test';
  };

  const loadRecent = async () => {
    const targetBizId = resolveBizId();
    try {
      const res = await api.getBusinessRedemptions(targetBizId);
      if (res.success && res.data) {
        setRecentRedemptions(res.data);
      }
    } catch (err) {
      console.error('Failed to load redemptions:', err);
    }
  };

  useEffect(() => {
    loadRecent();
  }, [business]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    const targetBizId = resolveBizId();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.verifyRedemption(targetBizId, code.trim());
      if (res.success && res.data) {
        setSuccessMsg(`Voucher redeemed: ${res.data.rewardTitle || 'Reward'} credited to ${res.data.customerName || 'Customer'}.`);
        setCode('');
        await loadRecent();
      } else {
        setErrorMsg(res.error?.message || 'Invalid or expired redemption code');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRedeem = async (voucherCode: string) => {
    const targetBizId = resolveBizId();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await api.verifyRedemption(targetBizId, voucherCode.trim());
      if (res.success && res.data) {
        setSuccessMsg(`Voucher redeemed: ${res.data.rewardTitle || 'Reward'} credited to ${res.data.customerName || 'Customer'}.`);
        setCode('');
        await loadRecent();
      } else {
        setErrorMsg(res.error?.message || 'Invalid or expired redemption code');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const pendingVouchers = recentRedemptions.filter(
    (r) => r.status === 'CLAIMED' || r.status === 'AVAILABLE'
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-2">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verify & Redeem Rewards</h1>
        <p className="text-xs text-slate-500 mt-1">
          Cashier & Staff counter station: Enter customer voucher code or 1-click verify pending rewards.
        </p>
      </div>

      {/* Code Verification Input Station */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm max-w-xl space-y-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1 uppercase tracking-wider">
              Voucher Redemption Code
            </label>
            <div className="relative">
              <Gift className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. REWARD-SMASH-7F92K"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-lg font-bold font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 uppercase"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Ask customer to show their voucher code from their "My Rewards" screen.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3.5 rounded-xl shadow-md shadow-emerald-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{loading ? 'Verifying...' : 'Verify & Mark as REDEEMED'}</span>
          </button>
        </form>

        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1-Click Pending Vouchers Waiting at Counter */}
        {pendingVouchers.length > 0 && (
          <div className="pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Active Customer Vouchers Waiting at Counter ({pendingVouchers.length}):
              </span>
            </div>
            <div className="space-y-2">
              {pendingVouchers.map((v) => (
                <div
                  key={v.id}
                  className="p-3 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-xs font-mono font-black text-slate-900 tracking-wider">
                      {v.code}
                    </div>
                    <div className="text-[11px] text-emerald-900 font-medium mt-0.5">
                      {v.customer?.name || v.user?.name || 'Customer'} • {v.rewardTitle || v.reward?.title || 'Reward'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCode(v.code)}
                      className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-white text-[11px] font-medium transition"
                      title="Paste code into form"
                    >
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickRedeem(v.code)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition active:scale-95"
                    >
                      Redeem
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Redemptions Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">Redemptions Ledger</h2>
          <span className="text-xs text-slate-400 font-mono">Real-time status</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Reward Title</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentRedemptions.length > 0 ? (
                recentRedemptions.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-3.5 font-bold font-mono text-slate-900">{r.code}</td>
                    <td className="px-6 py-3.5 font-medium text-slate-800">{r.rewardTitle || r.reward?.title}</td>
                    <td className="px-6 py-3.5 text-slate-600">{r.customer?.name || r.user?.name || 'Customer'}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          r.status === 'REDEEMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {new Date(r.redeemedAt || r.claimedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No redemption requests yet.
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
