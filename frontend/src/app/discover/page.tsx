'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import {
  Compass,
  Search,
  Gift,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MessageSquare,
  X,
  BadgeCheck,
} from 'lucide-react';

export default function DiscoverPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [industries, setIndustries] = useState<any[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({});
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  useEffect(() => {
    async function loadIndustries() {
      const res = await api.getIndustries();
      if (res.success && res.data) {
        setIndustries(res.data);
      }
    }
    loadIndustries();
  }, []);

  useEffect(() => {
    async function loadBusinesses() {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedIndustry) queryParams.set('industry', selectedIndustry);
        if (searchQuery) queryParams.set('search', searchQuery);

        const res = await api.getPublicBusinesses(queryParams.toString());
        if (res.success && res.data) {
          setBusinesses(res.data);
        }

        // Check customer's joined status
        if (user) {
          const loyaltyRes = await api.getMyLoyalty();
          if (loyaltyRes.success && loyaltyRes.data) {
            const map: Record<string, boolean> = {};
            loyaltyRes.data.forEach((p: any) => {
              map[p.businessId] = true;
            });
            setJoinedMap(map);
          }
        }
      } catch (err) {
        console.error('Failed to load businesses:', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      loadBusinesses();
    }, 200);

    return () => clearTimeout(timer);
  }, [selectedIndustry, searchQuery, user]);

  const handleJoin = async (businessId: string, slug?: string) => {
    setDownloadModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-10 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full mb-2">
          <Compass className="w-3.5 h-3.5 text-amber-600" />
          <span>Local Loyalty Discovery</span>
        </div>
        <h1 className="text-3xl font-black text-slate-950 tracking-tight">
          Discover Loyalty Programs & Passes
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Explore participating arenas, cafés, turfs, and spas. Join multi-campaign passes with your single customer account.
        </p>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search venues by name, city, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>

        {/* Category Pills Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedIndustry('')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
              selectedIndustry === ''
                ? 'bg-slate-950 text-amber-400 shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {industries.map((ind) => (
            <button
              key={ind.id}
              onClick={() => setSelectedIndustry(ind.slug)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedIndustry === ind.slug
                  ? 'bg-slate-950 text-amber-400 shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {ind.name}
            </button>
          ))}
        </div>
      </div>

      {/* Business Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 rounded-3xl bg-slate-100 animate-pulse border border-slate-200/60"></div>
          ))}
        </div>
      ) : businesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((biz) => {
            const isJoined = joinedMap[biz.id];
            const campaigns = biz.campaigns || [];
            const activeCampaign = campaigns[0];
            const reward = activeCampaign?.rewards?.[0];
            const stampTarget = Number(activeCampaign?.rules?.[0]?.conditionValue || activeCampaign?.targetStamps || activeCampaign?.targetVisits || 10);
            const rewardTitle = reward?.title || reward?.value || activeCampaign?.rewardTitle || `${stampTarget} Visits → Milestone Perk`;
            const industryLabel = typeof biz.industry === 'string'
              ? (biz.industry !== 'Local Venue' && biz.industry !== 'Local Commerce' ? biz.industry : '')
              : (biz.industry?.name && biz.industry.name !== 'Local Venue' ? biz.industry.name : '');

            return (
              <div
                key={biz.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-400/80 transition-all duration-300 overflow-hidden flex flex-col justify-between group transform hover:-translate-y-1"
              >
                <div>
                  <div className="h-44 relative bg-slate-950 overflow-hidden">
                    {biz.coverImage ? (
                      <img
                        src={biz.coverImage}
                        alt={biz.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/40 flex items-center justify-center text-amber-400 font-black text-2xl">
                        {biz.name}
                      </div>
                    )}
                    {industryLabel && (
                      <span className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md text-amber-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-500/30">
                        {industryLabel}
                      </span>
                    )}
                    {campaigns.length > 1 && (
                      <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
                        {campaigns.length} Active Passes
                      </span>
                    )}
                  </div>

                  <div className="p-5 space-y-3.5">
                    <div className="flex items-start gap-3">
                      <div className="w-13 h-13 rounded-2xl bg-white border-2 border-white shadow-md overflow-hidden -mt-10 relative z-10 shrink-0">
                        {biz.logo ? (
                          <img
                            src={biz.logo}
                            alt={biz.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-slate-950 text-amber-400 font-black text-base">
                            {biz.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <Link
                          href={`/business/${biz.slug}`}
                          className="font-black text-slate-950 text-lg leading-tight hover:text-amber-600 transition block truncate"
                        >
                          {biz.name}
                        </Link>
                        {biz.city && (
                          <span className="flex items-center gap-1 text-xs font-medium text-slate-500 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{biz.city}, {biz.state || biz.country || 'India'}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 min-h-[32px] leading-relaxed">
                      {biz.description || 'Collect digital stamps at our counter kiosk on every visit and unlock milestone reward perks.'}
                    </p>

                    {/* Milestone Reward Strip */}
                    <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-300/80 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                        <Gift className="w-4 h-4 text-slate-950" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-black text-slate-950 text-xs truncate">
                          {rewardTitle}
                        </div>
                        <div className="text-[10px] font-semibold text-amber-800 truncate mt-0.5">
                          {activeCampaign?.name || 'Milestone Pass'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-5 pt-0 flex gap-2">
                  <Link
                    href={`/business/${biz.slug}`}
                    className="flex-1 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs py-2.5 rounded-xl text-center border border-slate-200 transition"
                  >
                    Pass Details
                  </Link>

                  {isJoined ? (
                    <Link
                      href="/loyalty"
                      className="flex-1 bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition text-center"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      <span>Joined</span>
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleJoin(biz.id, biz.slug)}
                      disabled={joiningId === biz.id}
                      className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5 text-slate-950" />
                      <span>{joiningId === biz.id ? 'Joining...' : 'Join Program'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No venues match your criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or picking another category.
          </p>
        </div>
      )}

      {/* WhatsApp Number Required Modal */}
      {whatsappModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl relative border border-slate-100 space-y-4">
            <button
              onClick={() => setWhatsappModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto shadow-md shadow-amber-500/10">
              <MessageSquare className="w-7 h-7 text-amber-600" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-300">
                Action Required to Join
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                WhatsApp Number Required
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                You signed in with Gmail (<strong>{user?.email}</strong>). To join loyalty programs and receive real-time stamp updates and free vouchers, please link your WhatsApp number in your profile!
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/profile?missing_whatsapp=true"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-3 rounded-xl transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5"
              >
                <span>Link WhatsApp Number in Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setWhatsappModalOpen(false)}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
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
                Join Venue Loyalty Passes
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Customer stamp passes, counter QR scanning, and voucher rewards live inside the free <strong>GoldStamp Mobile App</strong> on iOS and Android!
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <div className="p-3.5 rounded-2xl bg-slate-950 text-white flex items-center justify-between text-xs font-bold shadow-md">
                <span className="text-amber-400 font-semibold">iOS & Android App</span>
                <span className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">Free Download</span>
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
