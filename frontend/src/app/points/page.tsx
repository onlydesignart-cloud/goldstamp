'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { Coins, TrendingUp, ArrowDownLeft, ArrowUpRight, Clock, ShieldCheck } from 'lucide-react';

export default function PointsPage() {
  const { user } = useAuth();
  const [pointsData, setPointsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getMyPoints();
        if (res.success && res.data) {
          setPointsData(res.data);
        }
      } catch (err) {
        console.error('Failed to load points:', err);
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mb-2">
          <Coins className="w-3.5 h-3.5" />
          <span>Loyalty Points</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Points Wallet & Ledger
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Earn points alongside stamps on verified visits and special promotions.
        </p>
      </div>

      {/* Points Overview Card */}
      <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Total Accumulated Balance
          </span>
          <div className="text-4xl sm:text-5xl font-black mt-1 flex items-baseline gap-2">
            <span>{pointsData?.totalPoints || 0}</span>
            <span className="text-xl text-emerald-400 font-bold">PTS</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Earned automatically across verified business check-ins.
          </p>
        </div>

        {/* Breakdown by business */}
        {pointsData?.pointsByBusiness && pointsData.pointsByBusiness.length > 0 && (
          <div className="bg-white/10 rounded-2xl p-4 sm:min-w-[260px] border border-white/10 text-xs space-y-2">
            <div className="font-semibold text-slate-300 pb-1 border-b border-white/10">
              Points by Merchant:
            </div>
            {pointsData.pointsByBusiness.map((b: any) => (
              <div key={b.businessId} className="flex justify-between items-center">
                <span className="text-slate-300 truncate max-w-[160px]">{b.business.name}</span>
                <span className="font-bold text-emerald-400 font-mono">{b.totalPoints} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Points Transaction Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="font-bold text-slate-900 text-base">Transaction Ledger</h2>
          <span className="text-xs text-slate-500">Immutable Ledger</span>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            <div className="h-8 bg-slate-100 rounded-lg animate-pulse"></div>
            <div className="h-8 bg-slate-100 rounded-lg animate-pulse"></div>
          </div>
        ) : pointsData?.transactions && pointsData.transactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {pointsData.transactions.map((tx: any) => (
              <div key={tx.id} className="p-4 sm:px-6 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <ArrowDownLeft className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{tx.description}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span>{tx.business?.name}</span>
                      <span>•</span>
                      <span>{new Date(tx.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-emerald-600 font-mono text-base">
                    +{tx.amount} pts
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{tx.type}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500">
            No points transactions recorded yet. Scan a check-in QR to earn your first points!
          </div>
        )}
      </div>
    </div>
  );
}
