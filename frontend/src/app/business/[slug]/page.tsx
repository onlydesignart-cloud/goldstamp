'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { useAuth } from '../../../lib/auth-context';
import { StampCard } from '../../../components/StampCard';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Gift,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Clock,
  Building2,
  QrCode,
  Tag,
  BadgeCheck,
  X,
} from 'lucide-react';

export default function BusinessProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user } = useAuth();
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [membership, setMembership] = useState<any>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await api.getBusinessBySlug(slug);
        if (res.success && res.data) {
          const bizData = res.data;
          setBusiness(bizData);

          // Select first active campaign by default
          if (bizData.campaigns && bizData.campaigns.length > 0) {
            setSelectedCampaignId(bizData.campaigns[0].id);
          }

          // Check if current user is member
          if (user) {
            const loyaltyRes = await api.getMyLoyalty();
            if (loyaltyRes.success && loyaltyRes.data) {
              const match = loyaltyRes.data.find((m: any) => m.businessId === res.data.id);
              if (match) {
                setIsJoined(true);
                setMembership(match);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to load business profile:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug, user]);

  const handleJoin = async () => {
    setDownloadModalOpen(true);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <div className="h-64 rounded-3xl bg-slate-100 animate-pulse"></div>
        <div className="h-10 w-1/3 rounded-xl bg-slate-100 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 rounded-2xl bg-slate-100 animate-pulse"></div>
          <div className="h-44 rounded-2xl bg-slate-100 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Business Not Found</h2>
        <p className="text-xs text-slate-500">The business you are looking for does not exist or has been removed.</p>
        <Link href="/discover" className="inline-block bg-slate-950 text-amber-400 font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-slate-900 transition">
          Back to Directory
        </Link>
      </div>
    );
  }

  const campaignsList: any[] = business.campaigns && business.campaigns.length > 0 ? business.campaigns : [
    {
      id: 'default_campaign',
      name: 'Central Loyalty Milestone Club',
      description: 'Visit the counter to collect stamps and unlock milestone reward perks.',
      rules: [{ conditionValue: 10 }],
      rewards: [{ title: 'Complimentary Milestone Perk' }],
    }
  ];

  const activeCampaign = campaignsList.find((c: any) => c.id === selectedCampaignId) || campaignsList[0];
  const activeRule = activeCampaign?.rules?.[0];
  const activeReward = activeCampaign?.rewards?.[0];
  const campaignTargetStamps = Number(activeRule?.conditionValue || activeCampaign?.targetStamps || activeCampaign?.targetVisits || 10);
  const rewardTitle = activeReward?.title || activeReward?.value || activeCampaign?.rewardTitle || 'Milestone Reward Perk';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-12 space-y-6 sm:space-y-8">
      {/* Back Link */}
      <Link
        href="/#venues"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-950 transition"
      >
        <ArrowLeft className="w-4 h-4 text-slate-400" />
        <span>Back to Participating Venues</span>
      </Link>

      {/* Cover Image & Header Banner (Clean White Card with Subtle Gold Accents) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm">
        <div className="h-48 sm:h-72 relative bg-slate-950 overflow-hidden">
          {business.coverImage ? (
            <img
              src={business.coverImage}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/40 flex items-center justify-center text-amber-400 text-3xl font-black">
              {business.name}
            </div>
          )}
          {((typeof business.industry === 'string' && business.industry !== 'Local Venue' && business.industry !== 'Local Commerce') || (business.industry?.name && business.industry.name !== 'Local Venue')) && (
            <span className="absolute top-4 right-4 bg-slate-950/85 backdrop-blur-md text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
              {typeof business.industry === 'string' ? business.industry : business.industry?.name}
            </span>
          )}
        </div>

        <div className="p-5 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-20 mb-6">
            <div className="flex items-end gap-3.5 sm:gap-4">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden shrink-0">
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950 text-amber-400 font-black text-2xl sm:text-3xl">
                    {business.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="pb-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-3xl font-black text-slate-950 leading-tight truncate">
                    {business.name}
                  </h1>
                  <BadgeCheck className="w-5 h-5 text-amber-500 shrink-0" />
                </div>
                {business.city && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {business.address ? `${business.address}, ` : ''}
                      {business.city}, {business.state || business.country || 'India'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action CTA */}
            <div className="shrink-0 w-full sm:w-auto">
              {isJoined ? (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="inline-flex items-center justify-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex-1 sm:flex-initial">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Member Active</span>
                  </div>
                  <Link
                    href="/loyalty"
                    className="inline-flex items-center justify-center gap-1.5 bg-slate-950 hover:bg-slate-900 text-amber-400 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-sm flex-1 sm:flex-initial"
                  >
                    <span>My Stamp Cards</span>
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{joining ? 'Joining Venue...' : 'Join Venue Loyalty'}</span>
                </button>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
            {business.description || 'Welcome to our digital loyalty program! Check in at our counter kiosk on every visit to collect stamps and unlock milestone reward vouchers.'}
          </p>

          {/* Quick Contact Chips */}
          <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3 sm:gap-5 text-xs text-slate-600">
            {business.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{business.phone}</span>
              </span>
            )}
            {business.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{business.email}</span>
              </span>
            )}
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-amber-700 hover:text-amber-800 font-semibold underline underline-offset-2"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Website</span>
              </a>
            )}
            <span className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Visit Cooldown: {business.cooldownMinutes || 30} mins</span>
            </span>
          </div>
        </div>
      </div>

      {/* MULTIPLE CAMPAIGNS SELECTOR & SHOWCASE */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded-full">
                {campaignsList.length} Active {campaignsList.length === 1 ? 'Campaign' : 'Campaigns'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight mt-1.5">
              Available Loyalty Programs & Passes
            </h2>
            <p className="text-xs text-slate-500">
              This venue offers {campaignsList.length > 1 ? 'multiple specialized campaign passes. Select any pass below to view its digital stamp card.' : 'a central loyalty pass with milestone perks.'}
            </p>
          </div>
        </div>

        {/* Campaign Passes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaignsList.map((camp: any, idx: number) => {
            const isSelected = (camp.id || `idx_${idx}`) === (selectedCampaignId || campaignsList[0]?.id);
            const rule = camp.rules?.[0];
            const reward = camp.rewards?.[0];
            const target = Number(rule?.conditionValue || camp.targetStamps || camp.targetVisits || 10);
            const rTitle = reward?.title || reward?.value || camp.rewardTitle || 'Milestone Reward Perk';

            return (
              <div
                key={camp.id || idx}
                onClick={() => setSelectedCampaignId(camp.id || `idx_${idx}`)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-50/60 border-amber-400 shadow-sm ring-1 ring-amber-400/50'
                    : 'bg-white border-slate-200/90 hover:border-amber-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      isSelected
                        ? 'bg-amber-200/70 text-amber-950'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {camp.type || 'STAMP'} Pass
                    </span>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-md">
                      {target} Stamps Target
                    </span>
                  </div>

                  <h3 className="font-black text-slate-950 text-base leading-snug">
                    {camp.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {camp.description || 'Collect digital stamps on every counter check-in to unlock this milestone perk.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                    <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold text-slate-900 truncate">
                      {rTitle}
                    </span>
                  </div>
                  <span className={`text-[11px] font-bold shrink-0 ${isSelected ? 'text-amber-800' : 'text-slate-400'}`}>
                    {isSelected ? '✓ Selected' : 'Click to View'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Selected Campaign's Interactive Digital Stamp Card */}
      <section className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-300 px-2 py-0.5 rounded-md">
                {isJoined ? 'Your Active Member Card' : 'Program Card Preview'}
              </span>
              <span className="text-xs font-bold text-slate-700">
                {activeCampaign?.name}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 tracking-tight mt-1">
              Digital Stamp Card
            </h2>
            <p className="text-xs text-slate-500">
              {isJoined
                ? 'Your visits are recorded instantly upon scanning counter QR codes at the register.'
                : 'Join this venue program to start collecting stamps toward this voucher.'}
            </p>
          </div>

          {isJoined && (
            <div className="shrink-0">
              <Link
                href="/checkin"
                className="bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>Scan Counter QR</span>
              </Link>
            </div>
          )}
        </div>

        {/* Card Component */}
        <div className="max-w-md mx-auto w-full pt-1">
          <StampCard
            compact
            previewMode={!isJoined}
            businessName={business.name}
            businessSlug={business.slug}
            businessLogo={business.logo}
            industry={business.industry?.name || 'Local Venue'}
            campaignName={activeCampaign?.name || 'Central Loyalty Club'}
            rewardTitle={rewardTitle}
            currentStamps={isJoined ? (membership?.currentStamps ?? membership?.cycleStamps ?? 0) : 0}
            targetStamps={campaignTargetStamps}
            totalVisits={membership?.totalVisits || 0}
            totalPoints={membership?.totalPoints || 0}
            lastVisitAt={membership?.lastVisitAt}
          />
        </div>
      </section>

      {/* Branches if available */}
      {business.branches && business.branches.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-950 tracking-tight">Participating Branches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {business.branches.map((branch: any) => (
              <div key={branch.id} className="bg-white p-4 rounded-2xl border border-slate-200 text-xs space-y-1 shadow-xs">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>{branch.name}</span>
                </div>
                <div className="text-slate-500">{branch.address}, {branch.city}</div>
                {branch.phone && <div className="text-slate-500">Phone: {branch.phone}</div>}
              </div>
            ))}
          </div>
        </section>
      )}
      {/* Customer Mobile App Download Modal */}
      {downloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl relative border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setDownloadModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border-2 border-amber-400/50 text-amber-600 flex items-center justify-center mx-auto shadow-md shadow-amber-500/20">
              <Gift className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-widest bg-amber-50 border border-amber-200 px-3 py-1 rounded-full inline-block">
                GoldStamp Mobile App
              </span>
              <h3 className="text-xl font-black text-slate-950">
                Join {business.name} Loyalty Pass
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                All customer loyalty cards, QR scanning, and reward redemptions live inside the <strong>GoldStamp Customer Mobile App</strong> on iOS and Android!
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <div className="p-3.5 rounded-2xl bg-slate-950 text-white flex items-center justify-between text-xs font-bold shadow-md">
                <span className="text-amber-400">📱 iOS & Android App</span>
                <span className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">Free Pass</span>
              </div>
              <button
                type="button"
                onClick={() => setDownloadModalOpen(false)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
