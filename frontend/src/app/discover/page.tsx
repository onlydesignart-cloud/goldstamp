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
  Filter,
  ArrowRight,
  Sparkles,
  MessageSquare,
  X,
  AlertTriangle,
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

  const handleJoin = async (businessId: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    const hasPhone = Boolean(user.phone && user.phone.replace(/[^0-9]/g, '').length >= 10);
    if (!hasPhone) {
      setWhatsappModalOpen(true);
      return;
    }

    setJoiningId(businessId);
    try {
      const res = await api.joinProgram(businessId);
      if (res.success) {
        setJoinedMap((prev) => ({ ...prev, [businessId]: true }));
      }
    } catch (err) {
      console.error('Failed to join:', err);
    } finally {
      setJoiningId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 md:pb-10 space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Local Loyalty Discovery</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Discover Loyalty Programs Near You
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Join digital stamp programs at cafés, pickleball clubs, turf arenas, and salons with one single account.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search businesses by name, city, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        {/* Category Pills Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedIndustry('')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedIndustry === ''
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {industries.map((ind) => (
            <button
              key={ind.id}
              onClick={() => setSelectedIndustry(ind.slug)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedIndustry === ind.slug
                  ? 'bg-emerald-600 text-white shadow-sm'
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
            <div key={i} className="h-72 rounded-2xl bg-slate-200 animate-pulse"></div>
          ))}
        </div>
      ) : businesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((biz) => {
            const isJoined = joinedMap[biz.id];
            const activeCampaign = biz.campaigns?.[0];
            const reward = activeCampaign?.rewards?.[0];

            return (
              <div
                key={biz.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="h-44 relative bg-slate-100 overflow-hidden">
                    {biz.coverImage ? (
                      <img
                        src={biz.coverImage}
                        alt={biz.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-slate-900 to-slate-800 flex items-center justify-center text-white font-bold text-2xl">
                        {biz.name}
                      </div>
                    )}
                    <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-slate-800 text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
                      {biz.industry?.name || 'Local'}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-white border-2 border-white shadow-md overflow-hidden -mt-11 relative z-10 shrink-0">
                        {biz.logo ? (
                          <img
                            src={biz.logo}
                            alt={biz.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-700 font-extrabold text-lg">
                            {biz.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <Link
                          href={`/business/${biz.slug}`}
                          className="font-extrabold text-slate-950 text-lg sm:text-xl leading-tight hover:text-emerald-600 transition block truncate"
                        >
                          {biz.name}
                        </Link>
                        {biz.city && (
                          <span className="flex items-center gap-1 text-xs font-medium text-slate-500 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{biz.city}, {biz.state || biz.country}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 min-h-[32px] leading-relaxed">
                      {biz.description || 'Join our digital loyalty program to earn stamps on every visit and unlock exclusive milestone rewards.'}
                    </p>

                    {/* Accurate & Prominent Campaign Badge */}
                    <div className="mt-3.5 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center gap-3 text-xs">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                        <Gift className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-emerald-950 truncate text-[13px]">
                          {activeCampaign?.name || 'Loyalty Milestone Club'}
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-700 truncate mt-0.5">
                          {reward?.value || reward?.title || activeCampaign?.rewardTitle || `Reward: Free Milestone Perk on ${activeCampaign?.rules?.[0]?.conditionValue || activeCampaign?.targetStamps || activeCampaign?.targetVisits || 10} Stamps`}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <Link
                    href={`/business/${biz.slug}`}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 rounded-xl text-center transition"
                  >
                    View Details
                  </Link>

                  {isJoined ? (
                    <Link
                      href="/loyalty"
                      className="flex-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Joined (View Card)
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleJoin(biz.id)}
                      disabled={joiningId === biz.id}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {joiningId === biz.id ? 'Joining...' : 'Join Program'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Compass className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No businesses match your criteria</h3>
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

            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-md shadow-amber-500/20">
              <MessageSquare className="w-7 h-7 text-amber-600" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Action Required to Join
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                WhatsApp Number Required
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                You signed in with Gmail (<strong>{user?.email}</strong>). To join loyalty programs and receive real-time stamp updates and free vouchers simultaneously on both WhatsApp and Gmail, please link your WhatsApp number in your profile!
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/profile?missing_whatsapp=true"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <span>Go to Profile to Add WhatsApp Number</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setWhatsappModalOpen(false)}
                className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
