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
}) => {
  const safeCurrent = typeof currentStamps === 'number' && !isNaN(currentStamps) ? currentStamps : 0;
  const safeTarget = typeof targetStamps === 'number' && !isNaN(targetStamps) && targetStamps > 0 ? targetStamps : 10;
  const isCompleted = safeCurrent >= safeTarget || hasUnlockedReward;
  const progressPercent = Math.min(100, Math.round((safeCurrent / safeTarget) * 100));
  const remaining = Math.max(0, safeTarget - safeCurrent);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm hover:border-zinc-300 transition-all overflow-hidden">
      {/* Card Header: Editorial Slate */}
      <div className="p-5 pb-4 bg-zinc-900 text-white relative">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-zinc-800 p-1 flex items-center justify-center border border-zinc-700/80 overflow-hidden shrink-0">
              {businessLogo ? (
                <img
                  src={businessLogo}
                  alt={businessName}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <span className="text-sm font-semibold tracking-wide text-zinc-200">
                  {businessName.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0">
              <Link
                href={`/business/${businessSlug}`}
                className="font-semibold text-base text-zinc-100 hover:text-white transition flex items-center gap-1 group truncate"
              >
                <span className="truncate">{businessName}</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-200 shrink-0 transition" />
              </Link>
              <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5 flex-wrap">
                {industry && (
                  <span className="bg-zinc-800 px-2 py-0.5 rounded text-[11px] font-medium text-zinc-300 border border-zinc-700/50">
                    {industry}
                  </span>
                )}
                {lastVisitAt && (
                  <span className="flex items-center gap-1 text-[11px] text-zinc-400">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    {new Date(lastVisitAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-800 text-zinc-200 border border-zinc-700 tabular-nums">
              {currentStamps}/{targetStamps} Stamps
            </span>
          </div>
        </div>

        {/* Campaign Reward Banner */}
        <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
          <div className="text-zinc-300 flex items-center gap-1.5 min-w-0 pr-2">
            <Gift className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-zinc-400">Reward:</span>
            <span className="font-medium text-zinc-100 truncate">{rewardTitle}</span>
          </div>
          <div className="shrink-0">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Unlocked
              </span>
            ) : (
              <span className="text-zinc-400 text-xs font-medium">
                {remaining} more to go
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Visual Digital Stamp Slots Grid */}
      <div className="p-5">
        <div className="grid grid-cols-5 gap-2.5">
          {Array.from({ length: safeTarget }).map((_, index) => {
            const slotNumber = index + 1;
            const isStamped = slotNumber <= safeCurrent;
            const isNext = slotNumber === safeCurrent + 1;
            const isMilestone = slotNumber === safeTarget;

            return (
              <div
                key={index}
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center p-2 text-center transition-all ${
                  isStamped
                    ? 'bg-zinc-900 text-white font-medium shadow-sm'
                    : isNext
                    ? 'bg-emerald-50/60 border border-emerald-400 text-emerald-800'
                    : 'bg-zinc-50 border border-zinc-200/80 text-zinc-400'
                }`}
              >
                {isStamped ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" />
                    <span className="text-[10px] mt-0.5 font-medium text-zinc-300 tracking-tight">
                      #{slotNumber}
                    </span>
                  </>
                ) : isMilestone ? (
                  <>
                    <Gift className={`w-4 h-4 ${isCompleted ? 'text-emerald-600' : 'text-zinc-400'}`} />
                    <span className="text-[10px] mt-0.5 font-medium text-zinc-500">Reward</span>
                  </>
                ) : (
                  <>
                    <span className="text-xs font-medium text-zinc-500">{slotNumber}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress Bar & Actions */}
        <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
              <span>Card progress</span>
              <span className="font-medium text-zinc-900 tabular-nums">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-900 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCompleted ? (
              <button
                onClick={onRedeem}
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3.5 py-2 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition active:scale-[0.99]"
              >
                <Gift className="w-3.5 h-3.5" />
                Redeem Voucher
              </button>
            ) : (
              <Link
                href="/checkin"
                className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center justify-center gap-1.5 transition active:scale-[0.99]"
              >
                <QrCode className="w-3.5 h-3.5 text-zinc-300" />
                Scan Check-In
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
