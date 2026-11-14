'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { StampCard } from '../../components/StampCard';
import { RedemptionModal } from '../../components/RedemptionModal';
import { Stamp, Sparkles, Compass, QrCode, MessageSquare, ArrowRight, AlertTriangle } from 'lucide-react';

export default function LoyaltyPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRedemption, setSelectedRedemption] = useState<any>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await api.getMyLoyalty();
        if (res.success && res.data) {
          setPrograms(res.data);
        }
      } catch (err) {
        console.error('Failed to load loyalty cards:', err);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mb-2">
            <Stamp className="w-3.5 h-3.5" />
            <span>Digital Loyalty Wallet</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Digital Stamp Cards
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track your stamp progress across all joined businesses. One unified customer wallet.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/checkin"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-1.5 transition"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan to Collect Stamp</span>
          </Link>

          <Link
            href="/discover"
            className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span>Discover More</span>
          </Link>
        </div>
      </div>

      {/* WhatsApp Linking Required Banner */}
      {user && (!user.phone || user.phone.replace(/[^0-9]/g, '').length < 10) && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-emerald-50 border-2 border-amber-300 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <MessageSquare className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                  WhatsApp Number Required for Dual Live Alerts
                </span>
                <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                You are signed in with Gmail (<strong>{user.email}</strong>). To join programs and receive instant stamp updates & vouchers on both WhatsApp and Gmail simultaneously, please link your WhatsApp number.
              </p>
            </div>
          </div>
          <Link
            href="/profile?prompt=whatsapp"
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 self-start md:self-auto"
          >
            <span>Link WhatsApp in Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Stamp Cards Grid */}
      {!user ? (
        <div className="bg-slate-900 text-white rounded-3xl p-10 text-center space-y-4 border border-slate-800 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
            <Stamp className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-white">Sign in to view your stamp cards</h3>
            <p className="text-xs text-slate-400">
              Join loyalty programs, collect digital stamps, and unlock rewards across all local venues.
            </p>
          </div>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/login"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs px-6 py-2.5 rounded-xl shadow-md transition"
            >
              Customer Login
            </Link>
            <Link
              href="/register"
              className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-6 py-2.5 rounded-xl border border-white/10 transition"
            >
              Customer Sign Up
            </Link>
          </div>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-72 rounded-2xl bg-slate-200 animate-pulse"></div>
          <div className="h-72 rounded-2xl bg-slate-200 animate-pulse"></div>
        </div>
      ) : programs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programs.map((prog) => (
            <StampCard
              key={prog.id}
              businessName={prog.businessName || prog.business?.name || 'Local Venue'}
              businessSlug={prog.businessSlug || prog.business?.slug || 'venue'}
              businessLogo={prog.businessLogo || prog.business?.logo}
              industry={prog.industry || prog.business?.industry?.name || 'Local Business'}
              campaignName={prog.activeCampaign?.name || prog.campaign?.name || 'Loyalty Program'}
              rewardTitle={prog.activeCampaign?.rewardTitle || prog.campaign?.rewards?.[0]?.title || 'Milestone Reward'}
              currentStamps={prog.currentStamps ?? prog.cycleStamps ?? 0}
              targetStamps={prog.targetVisits ?? prog.milestoneTarget ?? 10}
              totalVisits={prog.totalVisits || 0}
              totalPoints={prog.totalPoints || 0}
              lastVisitAt={prog.lastVisitAt}
              onRedeem={async () => {
                try {
                  const res = await api.claimReward(
                    prog.activeCampaign?.rewardId || prog.campaign?.rewards?.[0]?.id || 'rwd_smash_free_hour'
                  );
                  if (res.success && res.data) {
                    setSelectedRedemption({
                      code: res.data.code,
                      reward: { title: res.data.rewardTitle || prog.activeCampaign?.rewardTitle || '1 Hour FREE Pickleball Court' },
                    });
                  }
                } catch (err) {
                  console.error('Error claiming reward:', err);
                }
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">No stamp cards in your wallet yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Explore participating businesses and join their digital stamp program to start earning rewards today.
            </p>
          </div>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-sm"
          >
            <Compass className="w-4 h-4" />
            Discover Programs
          </Link>
        </div>
      )}

      {/* Voucher Modal */}
      <RedemptionModal
        isOpen={!!selectedRedemption}
        onClose={() => setSelectedRedemption(null)}
        redemption={selectedRedemption}
      />
    </div>
  );
}
