'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { RedemptionModal } from '../../components/RedemptionModal';
import { Gift, Sparkles, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RewardsPage() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'redeemed'>('available');
  const [loading, setLoading] = useState(true);
  const [selectedRedemption, setSelectedRedemption] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getMyRewards(true);
        if (res.success && res.data) {
          setRewards(res.data);
        }
      } catch (err) {
        console.error('Failed to load rewards:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      load();
    } else {
      setLoading(false);
    }
  }, [user]);

  const availableRewards = rewards.filter((r) => r.status === 'CLAIMED' || r.status === 'AVAILABLE');
  const redeemedRewards = rewards.filter((r) => r.status === 'REDEEMED');

  const displayedList = activeTab === 'available' ? availableRewards : redeemedRewards;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mb-2">
          <Gift className="w-3.5 h-3.5" />
          <span>Voucher Wallet</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Your Rewards & Vouchers
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Rewards unlocked through your completed digital stamp cards. Tap redeem to show your voucher code.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('available')}
          className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'available'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Available to Redeem</span>
          <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
            {availableRewards.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('redeemed')}
          className={`pb-3 text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'redeemed'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Redeemed History</span>
          <span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded-full font-medium">
            {redeemedRewards.length}
          </span>
        </button>
      </div>

      {/* Rewards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : displayedList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedList.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                    <Gift className="w-6 h-6" />
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      item.status === 'CLAIMED' || item.status === 'AVAILABLE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.status === 'REDEEMED'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-xs font-semibold text-slate-500">
                    {item.business?.name || 'Local Business'}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5 leading-snug">
                    {item.reward?.title || 'Reward'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {item.reward?.description || 'Unlocked through verified stamps.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                {item.status === 'CLAIMED' || item.status === 'AVAILABLE' ? (
                  <button
                    onClick={() => setSelectedRedemption(item)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>View Voucher Code: {item.code}</span>
                  </button>
                ) : item.status === 'REDEEMED' ? (
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Redeemed
                    </span>
                    <span>{new Date(item.redeemedAt || item.claimedAt).toLocaleDateString()}</span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Expired
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Gift className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No {activeTab} rewards found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Complete visits and collect all stamps on your card to automatically unlock rewards!
          </p>
          <Link
            href="/loyalty"
            className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold hover:underline mt-2"
          >
            Check your Stamp Cards <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Redemption Code Modal */}
      <RedemptionModal
        isOpen={!!selectedRedemption}
        onClose={() => setSelectedRedemption(null)}
        redemption={selectedRedemption}
      />
    </div>
  );
}
