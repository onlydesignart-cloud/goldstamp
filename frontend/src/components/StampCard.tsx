'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Gift, ChevronRight, Clock, CheckCircle2, QrCode } from 'lucide-react';

interface StampCardProps {
  businessName: string;
  businessSlug: string;
  businessLogo?: string | null;
  industry?: string;
  campaignName: string;
  rewardTitle: string;
  currentStamps: number;
  targetStamps: number;
  totalVisits?: number;
  totalPoints?: number;
  lastVisitAt?: string | Date | null;
  onRedeem?: () => void;
  hasUnlockedReward?: boolean;
  compact?: boolean;
  previewMode?: boolean;
}

export const StampCard: React.FC<StampCardProps> = ({
  businessName = 'Local Venue',
  businessSlug = 'venue',
  businessLogo,
  industry = 'Local Business',
  campaignName = 'Loyalty Rewards',
  rewardTitle = 'Milestone Reward',
  currentStamps = 0,
  targetStamps = 10,
  totalVisits = 0,
  totalPoints = 0,
  lastVisitAt,
  onRedeem,
  hasUnlockedReward,
  compact = false,
  previewMode = false,
}) => {
  const safeCurrent = typeof currentStamps === 'number' && !isNaN(currentStamps) ? currentStamps : 0;
  const safeTarget = typeof targetStamps === 'number' && !isNaN(targetStamps) && targetStamps > 0 ? targetStamps : 10;
  const isCompleted = safeCurrent >= safeTarget || hasUnlockedReward;
  const progressPercent = Math.min(100, Math.round((safeCurrent / safeTarget) * 100));
  const remaining = Math.max(0, safeTarget - safeCurrent);

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all overflow-hidden ${
        compact ? 'max-w-md mx-auto w-full' : 'w-full'
      }`}
    >
      {/* Card Header: Editorial Slate with GoldStamp Badge */}
      <div className={`bg-slate-950 text-white relative ${compact ? 'p-4 pb-3.5' : 'p-5 pb-4'}`}>
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800 overflow-hidden shrink-0 shadow-inner ${
                compact ? 'w-10 h-10' : 'w-12 h-12'
              }`}
            >
              {businessLogo ? (
                <img
                  src={businessLogo}
                  alt={businessName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-black tracking-wider text-emerald-400">
                  {businessName.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <Link
                href={`/business/${businessSlug}`}
                className="font-bold text-sm sm:text-base text-slate-100 hover:text-white transition flex items-center gap-1 group truncate"
              >
                <span className="truncate">{businessName}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 shrink-0 transition" />
              </Link>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 flex-wrap">
                {industry && (
                  <span className="bg-slate-900 px-2 py-0.5 rounded text-[10px] font-semibold text-slate-300 border border-slate-800">
                    {industry}
                  </span>
                )}
                {lastVisitAt && !previewMode && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Clock className="w-2.5 h-2.5 text-slate-500" />
                    {new Date(lastVisitAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-900 text-emerald-400 border border-slate-800 tabular-nums">
              {safeCurrent}/{safeTarget} Stamps
            </span>
          </div>
        </div>

        {/* Campaign Reward Banner */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs gap-2">
          <div className="text-slate-300 flex items-center gap-1.5 min-w-0 flex-1 truncate">
            <Gift className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400 font-medium">Reward:</span>
            <span className="font-bold text-slate-100 truncate">{rewardTitle}</span>
          </div>
          <div className="shrink-0 text-right">
            {previewMode ? (
              <span className="text-slate-400 text-[11px] font-medium">
                {safeTarget} stamps target
              </span>
            ) : isCompleted ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Unlocked
              </span>
            ) : (
              <span className="text-slate-400 text-[11px] font-medium">
                {remaining} more to go
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Visual Digital Stamp Slots Grid */}
      <div className={compact ? 'p-4 sm:p-5' : 'p-5'}>
        <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
          {Array.from({ length: safeTarget }).map((_, index) => {
            const slotNumber = index + 1;
            const isStamped = slotNumber <= safeCurrent;
            const isNext = slotNumber === safeCurrent + 1 && !previewMode;
            const isMilestone = slotNumber === safeTarget;

            return (
              <div
                key={index}
                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center p-1 text-center transition-all ${
                  isStamped
                    ? 'bg-slate-950 text-white font-bold shadow-sm ring-1 ring-emerald-500/30'
                    : isNext
                    ? 'bg-emerald-50 border-2 border-dashed border-emerald-500 text-emerald-800 animate-pulse'
                    : isMilestone
                    ? 'bg-amber-50/80 border border-amber-300 text-amber-900'
                    : 'bg-slate-50 border border-slate-200/80 text-slate-400'
                }`}
              >
                {isStamped ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                    <span className="text-[9px] mt-0.5 font-bold text-slate-300 tracking-tight">
                      #{slotNumber}
                    </span>
                  </>
                ) : isMilestone ? (
                  <>
                    <Gift className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isCompleted ? 'text-emerald-600' : 'text-amber-600'}`} />
                    <span className="text-[9px] mt-0.5 font-bold text-amber-800 truncate max-w-full px-0.5">
                      Perk
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-bold text-slate-500">{slotNumber}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar & Actions */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <span>Card progress</span>
              <span className="font-bold text-slate-900 tabular-nums">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {previewMode ? (
              <span className="text-xs text-slate-400 font-medium italic">
                Join program to earn stamps
              </span>
            ) : isCompleted ? (
              <button
                onClick={onRedeem}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Gift className="w-3.5 h-3.5" />
                Redeem Voucher
              </button>
            ) : (
              <Link
                href="/checkin"
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                Scan Check-In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
