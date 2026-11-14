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
  Calendar,
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

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await api.getBusinessBySlug(slug);
        if (res.success && res.data) {
          setBusiness(res.data);

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
    if (!user) {
      window.location.href = '/login';
      return;
    }
    if (!business) return;

    setJoining(true);
    try {
      const res = await api.joinProgram(business.id);
      if (res.success) {
        setIsJoined(true);
        const loyaltyRes = await api.getMyLoyalty();
        if (loyaltyRes.success && loyaltyRes.data) {
          const match = loyaltyRes.data.find((m: any) => m.businessId === business.id);
          if (match) setMembership(match);
        }
      }
    } catch (err) {
      console.error('Failed to join:', err);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="h-64 rounded-3xl bg-slate-200 animate-pulse mb-8"></div>
        <div className="h-12 w-1/3 rounded-xl bg-slate-200 animate-pulse mb-4"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Business Not Found</h2>
        <p className="text-sm text-slate-500">The business you are looking for does not exist or has been removed.</p>
        <Link href="/discover" className="inline-block bg-slate-900 text-white font-semibold text-xs px-4 py-2.5 rounded-xl">
          Back to Directory
        </Link>
      </div>
    );
  }

  const primaryCampaign = business.campaigns?.[0];
  const primaryReward = primaryCampaign?.rewards?.[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link
        href="/discover"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Directory
      </Link>

      {/* Cover Image & Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="h-64 sm:h-80 relative bg-slate-900 overflow-hidden">
          {business.coverImage ? (
            <img
              src={business.coverImage}
              alt={business.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-slate-950 to-slate-800 flex items-center justify-center text-white text-3xl font-extrabold">
              {business.name}
            </div>
          )}
          <span className="absolute top-4 right-4 bg-white/95 backdrop-blur-md text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
            {business.industry?.name || 'Local Business'}
          </span>
        </div>

        <div className="p-6 sm:p-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden shrink-0">
                {business.logo ? (
                  <img
                    src={business.logo}
                    alt={business.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-600 text-white font-bold text-2xl">
                    {business.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                  {business.name}
                </h1>
                {business.city && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {business.address ? `${business.address}, ` : ''}
                      {business.city}, {business.state}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action CTA */}
            <div className="shrink-0 flex items-center gap-2">
              {isJoined ? (
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Program Active</span>
                  </div>
                  <Link
                    href="/loyalty"
                    className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition shadow-sm"
                  >
                    <span>View Card in Wallet</span>
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{joining ? 'Joining...' : 'Join Loyalty Program'}</span>
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            {business.description || 'Welcome to our loyalty program! Earn stamps on every visit to unlock exclusive rewards.'}
          </p>

          {/* Quick Contact Chips */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs text-slate-600">
            {business.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {business.phone}
              </span>
            )}
            {business.email && (
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {business.email}
              </span>
            )}
            {business.website && (
              <a
                href={business.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-emerald-600 hover:underline"
              >
                <Globe className="w-3.5 h-3.5" />
                Website
              </a>
            )}
            <span className="flex items-center gap-1.5 text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              Check-in cooldown: {business.cooldownMinutes} mins
            </span>
          </div>
        </div>
      </div>

      {/* If Joined: Show Current Active Digital Stamp Card */}
      {isJoined && membership && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Your Digital Stamp Card</h2>
          <StampCard
            businessName={membership.businessName || business.name}
            businessSlug={membership.businessSlug || business.slug}
            businessLogo={membership.businessLogo || business.logo}
            industry={membership.industry || business.industry?.name || 'Local Business'}
            campaignName={membership.activeCampaign?.name || business.campaigns?.[0]?.name || 'Loyalty Program'}
            rewardTitle={membership.activeCampaign?.rewardTitle || business.campaigns?.[0]?.rewards?.[0]?.title || 'Milestone Reward'}
            currentStamps={membership.currentStamps ?? membership.cycleStamps ?? 0}
            targetStamps={membership.targetVisits ?? membership.milestoneTarget ?? 10}
            totalVisits={membership.totalVisits || 0}
            totalPoints={membership.totalPoints || 0}
            lastVisitAt={membership.lastVisitAt}
          />
        </section>
      )}

      {/* Active Campaigns and Rewards */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Available Campaigns & Rewards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {business.campaigns?.map((camp: any) => {
            const reward = camp.rewards?.[0];
            const rule = camp.rules?.[0];

            return (
              <div
                key={camp.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                      {camp.type} Program
                    </span>
                    <span className="text-xs text-slate-400">Recurring: {camp.isRecurring ? 'Yes' : 'No'}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{camp.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{camp.description}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-emerald-600" />
                    <span className="font-semibold text-slate-800">
                      {reward ? reward.title : 'Milestone Reward'}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-600">
                    Target: {rule?.conditionValue || 10} {camp.type.toLowerCase()}s
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Branches if available */}
      {business.branches && business.branches.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Locations & Branches</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {business.branches.map((branch: any) => (
              <div key={branch.id} className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  {branch.name}
                </div>
                <div className="text-slate-500">{branch.address}, {branch.city}</div>
                {branch.phone && <div className="text-slate-500">Phone: {branch.phone}</div>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
