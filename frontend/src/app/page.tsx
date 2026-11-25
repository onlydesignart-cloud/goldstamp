'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth-context';
import {
  Award,
  QrCode,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Lock,
  ChevronRight,
  ChevronDown,
  Store,
  RefreshCw,
  Gift,
  Check,
  Smartphone,
  MapPin,
  X,
  Compass,
} from 'lucide-react';

// Lightweight, human-grade scroll reveal component (fast, clean, zero lag)
function RevealOnScroll({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();

  // Interactive Live Stamp Sandbox State
  const [sandboxStamps, setSandboxStamps] = useState(8);
  const [showSandboxReward, setShowSandboxReward] = useState(false);

  // Pricing Billing Cycle Toggle: Monthly vs Yearly (25% off)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Accordion FAQ State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Live Database Venues & Campaigns State
  const [liveVenues, setLiveVenues] = useState<any[]>([]);
  const [venuesLoading, setVenuesLoading] = useState(true);
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({});
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedVenueForAuth, setSelectedVenueForAuth] = useState<any>(null);

  useEffect(() => {
    async function loadRegisteredVenues() {
      setVenuesLoading(true);
      try {
        const res = await api.getPublicBusinesses();
        if (res.success && res.data && res.data.length > 0) {
          setLiveVenues(res.data);
        }
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
        console.error('Failed to load registered venues:', err);
      } finally {
        setVenuesLoading(false);
      }
    }
    loadRegisteredVenues();
  }, [user]);

  const handleJoinVenue = async (venue: any) => {
    // Validation: Customer MUST be logged in or registered first
    if (!user) {
      setSelectedVenueForAuth(venue);
      setAuthModalOpen(true);
      return;
    }

    if (user.role !== 'CUSTOMER') {
      alert('Only customers can collect loyalty stamps. Please sign in or register with a Customer account.');
      return;
    }

    setJoiningId(venue.id);
    try {
      const res = await api.joinProgram(venue.id);
      if (res.success) {
        setJoinedMap((prev) => ({ ...prev, [venue.id]: true }));
      }
    } catch (err) {
      console.error('Failed to join:', err);
    } finally {
      setJoiningId(null);
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSimulateScan = () => {
    if (sandboxStamps < 10) {
      const next = sandboxStamps + 1;
      setSandboxStamps(next);
      if (next === 10) {
        setShowSandboxReward(true);
      }
    }
  };

  const handleResetSandbox = () => {
    setSandboxStamps(8);
    setShowSandboxReward(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Hero Section (#hero) */}
      <section id="hero" className="relative overflow-hidden pt-4 sm:pt-6 md:pt-8 pb-8 md:pb-12 bg-white border-b border-slate-200/80">
        {/* Subtle Ambient Gold Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-6 left-10 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left Column: Headline and Call-to-Actions */}
            <div className="lg:col-span-7 space-y-5">
              <RevealOnScroll delay={50}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.12]">
                  Replace paper stamp cards with{' '}
                  <span className="text-amber-500 underline decoration-amber-400 decoration-wavy underline-offset-8">
                    fraud-proof
                  </span>{' '}
                  digital rewards.
                </h1>
              </RevealOnScroll>

              <RevealOnScroll delay={150}>
                <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                  Empower sports arenas, pickleball courts, specialty cafés, box cricket turfs, salons, and gyms with rotating dynamic counter QR check-ins. One universal account for customers across all venues.
                </p>
              </RevealOnScroll>

              {/* Action Buttons */}
              <RevealOnScroll delay={250}>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/register"
                    className="px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition flex items-center gap-2 active:scale-95"
                  >
                    <Award className="w-4 h-4 text-slate-950" />
                    <span>Join as Customer (Free)</span>
                  </Link>

                  <Link
                    href="/client/register"
                    className="px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 border border-amber-500/30 font-bold text-sm shadow-md transition flex items-center gap-2 active:scale-95"
                  >
                    <Store className="w-4 h-4 text-amber-400" />
                    <span>Register Your Business</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </Link>

                  <Link
                    href="/discover"
                    className="px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition flex items-center gap-2 active:scale-95"
                  >
                    <QrCode className="w-4 h-4 text-slate-600" />
                    <span>Explore Places</span>
                  </Link>
                </div>
              </RevealOnScroll>
            </div>

            {/* Right Column: 3D Tilted Video Card (Clean, No Overlay Text) */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center pt-4 lg:pt-0">
              <RevealOnScroll delay={200} className="w-full">
                <div className="relative w-full [perspective:1400px]">
                  {/* 3D Tilted Card */}
                  <div className="relative rounded-3xl overflow-hidden border-2 border-amber-400/40 bg-slate-950 shadow-2xl transition-all duration-700 ease-out [transform:rotateY(-8deg)_rotateX(6deg)_scale(0.98)] hover:[transform:rotateY(0deg)_rotateX(0deg)_scale(1)] group">
                    {/* HTML5 Video Element */}
                    <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-slate-950">
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster="/images/hero-counter.jpg"
                        className="w-full h-full object-cover opacity-95 group-hover:opacity-100 transition duration-700"
                      >
                        <source src="/videos/hero-stamp-loop.mp4" type="video/mp4" />
                        <source src="/videos/video.mp4" type="video/mp4" />
                      </video>
                      {/* Subtle metallic sheen */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-white/10 pointer-events-none" />
                    </div>
                  </div>

                  {/* 3D Ground Contact Shadow */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[85%] h-8 bg-slate-950/50 blur-2xl rounded-[100%] pointer-events-none -z-10" />
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[70%] h-5 bg-amber-500/20 blur-xl rounded-[100%] pointer-events-none -z-10" />
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Experience the Central Loyalty Loop Live (#how-it-works) */}
      <section id="how-it-works" className="py-12 md:py-16 bg-gradient-to-b from-white via-amber-50/20 to-white text-slate-900 relative border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold text-amber-700 bg-amber-100/80 border border-amber-300/60 px-3.5 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
                Frictionless In-Store Experience
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
                Experience the Central Loyalty Loop Live
              </h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Replace fragile paper punch cards with instant digital check-ins. A quick counter scan records customer visits securely, protects against fraud, and unlocks milestone rewards.
              </p>
            </div>
          </RevealOnScroll>

          {/* 2-Column Layout: Left = 3D Perspective Loyalty Pass Card, Right = Clean Professional Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: 3D Visual Digital Stamp Card Mockup */}
            <div className="lg:col-span-6 flex justify-center">
              <RevealOnScroll delay={150} className="w-full max-w-md">
                <div className="w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-amber-500/40 transform lg:perspective-1000 lg:-rotate-y-2 lg:rotate-x-1 hover:rotate-0 transition duration-500 space-y-6">
                  {/* 3D Card Header with Embossed Gold Seal */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center font-black text-sm shadow-md shadow-amber-500/20">
                        SZ
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white">
                          SmashZone Pickleball Arena
                        </h3>
                        <p className="text-[11px] text-amber-300/80 font-medium">Card Goal: 10 Visits → 1 Hour FREE Court</p>
                      </div>
                    </div>
                    <button
                      onClick={handleResetSandbox}
                      className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1 transition p-1 rounded-md hover:bg-slate-800"
                      title="Reset simulation"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* Stamp Slots Grid (Interactive 10-slot layout) */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-slate-400 font-medium">Customer Pass Progress:</span>
                      <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        {sandboxStamps} / 10 Collected
                      </span>
                    </div>

                    <div className="grid grid-cols-5 gap-2.5">
                      {[...Array(10)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-12 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 ${
                            i < sandboxStamps
                              ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-slate-950 scale-100 shadow-md shadow-amber-500/25 font-black'
                              : 'bg-slate-900/90 text-slate-600 border border-slate-800'
                          }`}
                        >
                          {i < sandboxStamps ? (
                            <CheckCircle2 className="w-5 h-5 text-slate-950" />
                          ) : (
                            <span className="font-mono text-slate-500">{i + 1}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Milestone Reward Unlock Alert */}
                  {showSandboxReward && (
                    <div className="p-4 rounded-2xl bg-amber-950/80 border-2 border-amber-400/60 text-amber-200 animate-in fade-in zoom-in-95 duration-300 space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                        <Gift className="w-4 h-4 text-amber-400" />
                        <span>Milestone Reached! Single-Use Reward Voucher:</span>
                      </div>
                      <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-amber-500/30">
                        <div>
                          <div className="text-xs font-bold text-white">1 Hour FREE Court Session</div>
                          <div className="text-[10px] text-slate-400">SmashZone Arena</div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block">Verification Code:</span>
                          <span className="font-mono font-bold text-amber-400 text-sm tracking-wider">SMASH-83E7AC</span>
                        </div>
                      </div>
                      <p className="text-[11px] text-amber-300/80 leading-tight">
                        Staff enters code in the Counter Terminal. Once validated, the single-use voucher is securely marked as redeemed.
                      </p>
                    </div>
                  )}

                  {/* Interactive Simulation Action Button */}
                  <div className="pt-1">
                    {sandboxStamps < 10 ? (
                      <button
                        onClick={handleSimulateScan}
                        className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                      >
                        <QrCode className="w-4 h-4 text-slate-950" />
                        <span>Test Customer Check-In ({sandboxStamps}/10)</span>
                      </button>
                    ) : (
                      <button
                        onClick={handleResetSandbox}
                        className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-amber-500/30"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Card Completed! Reset Simulation</span>
                      </button>
                    )}
                  </div>
                </div>
              </RevealOnScroll>
            </div>

            {/* Right Column: Clean Professional Breakdown of the Central Loyalty Loop */}
            <div className="lg:col-span-6 space-y-6">
              <RevealOnScroll delay={200}>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 transition">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-700 flex items-center justify-center font-black shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Dynamic Counter QR Kiosk</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Display your venue's live QR on any tablet, iPad, or counter monitor. The QR code automatically refreshes periodically with synchronized security tokens to prevent screenshot misuse.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 transition">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-700 flex items-center justify-center font-black shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">1-Tap Scan & Instant Stamp</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Customers scan the counter screen with their smartphone. One tap records their visit in milliseconds. Built-in cooldown protection prevents accidental duplicate scans.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 transition">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-300 text-amber-700 flex items-center justify-center font-black shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Single-Use Milestone Rewards</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        When customers complete their required visits (5, 8, or 10 stamps), an exclusive redemption voucher unlocks instantly. Staff verifies it at the counter, immediately claiming the reward.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Core Platform Highlights */}
                <div className="pt-4 grid grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Instant customer checkout flow</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Works on any tablet or smartphone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Universal wallet for all venues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Real-time customer visit analytics</span>
                  </div>
                </div>
              </RevealOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Multi-Industry Photography & Live Registered Venues Showcase (#venues) */}
      <section id="venues" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
              <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-300 px-3.5 py-1 rounded-full uppercase tracking-wider">
                Live Registered Venues
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Built for high-frequency lifestyle businesses
              </h2>
              <p className="text-sm text-slate-600">
                Explore real participating arenas, cafés, turfs, and studios. Join loyalty programs with one universal customer account.
              </p>
            </div>
          </RevealOnScroll>

          {/* Dynamic Grid: Fetched from Database */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(liveVenues.length > 0 ? liveVenues.slice(0, 4) : [
              {
                id: 'venue-1',
                slug: 'smashzone-pickleball',
                name: 'SmashZone Arena',
                industry: { name: 'Pickleball & Padel' },
                coverImage: '/images/pickleball-arena.jpg',
                city: 'Sports Complex',
                campaigns: [
                  {
                    name: 'SmashZone Loyalty Loop',
                    rules: [{ conditionValue: 10 }],
                    rewards: [{ title: '1 Hour FREE Court Session' }],
                  },
                  {
                    name: 'Weekend Rally Pass',
                    rules: [{ conditionValue: 5 }],
                    rewards: [{ title: 'Free Pro Grip & Energy Drink' }],
                  },
                ],
              },
              {
                id: 'venue-2',
                slug: 'artisan-roastery-cafe',
                name: 'Artisan Roastery',
                industry: { name: 'Cafés & Bakeries' },
                coverImage: '/images/coffee-shop.jpg',
                city: 'Central Market',
                campaigns: [
                  {
                    name: 'Daily Brew Pass',
                    rules: [{ conditionValue: 5 }],
                    rewards: [{ title: 'Free Pour-Over Coffee' }],
                  },
                  {
                    name: 'Bakery Treat Pass',
                    rules: [{ conditionValue: 4 }],
                    rewards: [{ title: 'Free Warm Almond Croissant' }],
                  },
                ],
              },
              {
                id: 'venue-3',
                slug: 'powerbox-cricket-arena',
                name: 'PowerBox Arena',
                industry: { name: 'Box Cricket & Turf' },
                coverImage: '/images/box-cricket.jpg',
                city: 'Arena Turf Road',
                campaigns: [
                  {
                    name: 'Championship Turf Pass',
                    rules: [{ conditionValue: 5 }],
                    rewards: [{ title: '₹500 Arena Credit Voucher' }],
                  },
                  {
                    name: 'Night Blitz Pass',
                    rules: [{ conditionValue: 3 }],
                    rewards: [{ title: 'Free Pro Leather Ball' }],
                  },
                ],
              },
              {
                id: 'venue-4',
                slug: 'aurora-boutique-spa',
                name: 'Aurora Boutique Spa',
                industry: { name: 'Salons & Spas' },
                coverImage: '/images/boutique-salon.jpg',
                city: 'Wellness Arcade',
                campaigns: [
                  {
                    name: 'VIP Wellness Club',
                    rules: [{ conditionValue: 4 }],
                    rewards: [{ title: 'Deluxe Styling & Treatment' }],
                  },
                  {
                    name: 'Express Manicure Pass',
                    rules: [{ conditionValue: 3 }],
                    rewards: [{ title: 'Complimentary Nail Art' }],
                  },
                ],
              },
            ]).map((biz, idx) => {
              const isJoined = joinedMap[biz.id];
              const campaigns = biz.campaigns || [];
              const activeCampaign = campaigns[0];
              const reward = activeCampaign?.rewards?.[0];
              const stampTarget = Number(activeCampaign?.rules?.[0]?.conditionValue || activeCampaign?.targetStamps || activeCampaign?.targetVisits || 10);
              const rewardTitle = reward?.title || reward?.value || activeCampaign?.rewardTitle || `${stampTarget} Visits → Milestone Perk`;

              return (
                <RevealOnScroll key={biz.id || idx} delay={(idx + 1) * 100} className="h-full">
                  <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-400 transition-all duration-300 group flex flex-col justify-between h-full transform hover:-translate-y-1">
                    <div>
                      {/* Venue Cover Image with Dynamic Category Pill & Campaign Count */}
                      <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                        {biz.coverImage ? (
                          <img
                            src={biz.coverImage}
                            alt={biz.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-slate-950 via-slate-900 to-amber-950/40 flex items-center justify-center text-amber-400 font-black text-xl">
                            {biz.name}
                          </div>
                        )}
                        {(typeof biz.industry === 'string' ? (biz.industry !== 'Local Venue' && biz.industry !== 'Local Commerce' ? biz.industry : '') : (biz.industry?.name && biz.industry.name !== 'Local Venue' ? biz.industry.name : '')) && (
                          <span className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md text-amber-400 text-[11px] font-bold px-2.5 py-1 rounded-full border border-amber-500/30">
                            {typeof biz.industry === 'string' ? biz.industry : biz.industry?.name}
                          </span>
                        )}
                        {campaigns.length > 1 && (
                          <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-slate-900 text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">
                            {campaigns.length} Passes
                          </span>
                        )}
                      </div>

                      {/* Content Body */}
                      <div className="p-5 space-y-3.5">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-base font-black text-slate-950 group-hover:text-amber-600 transition truncate">
                              {biz.name}
                            </h3>
                          </div>

                          {biz.city && (
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{biz.city}</span>
                            </div>
                          )}
                        </div>

                        {/* Creative Milestone Reward Strip */}
                        <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-300/80 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-xs">
                            <Gift className="w-4 h-4 text-slate-950" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-black text-slate-950 text-xs truncate">
                              {rewardTitle}
                            </div>
                            <div className="text-[10px] font-semibold text-amber-800 truncate mt-0.5">
                              {activeCampaign?.name || 'Milestone Loyalty'}
                            </div>
                          </div>
                        </div>

                        {/* Creative Miniature Stamp Tracker Preview */}
                        <div className="space-y-1.5 pt-0.5">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                            <span className="flex items-center gap-1 text-slate-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>Stamp Card Track</span>
                            </span>
                            <span className="text-amber-800 font-bold">{stampTarget} Stamps Goal</span>
                          </div>
                          <div className="flex items-center gap-1 p-1.5 rounded-xl bg-slate-50 border border-slate-200/70">
                            {Array.from({ length: Math.min(stampTarget, 5) }).map((_, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex-1 h-6 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:border-amber-400/60 transition"
                              >
                                {sIdx + 1}
                              </div>
                            ))}
                            {stampTarget > 5 && (
                              <div className="px-0.5 text-[10px] font-bold text-slate-400 tracking-tighter">•••</div>
                            )}
                            <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center shadow-xs shrink-0">
                              <Gift className="w-3.5 h-3.5 text-slate-950" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: View Details & Join Program (with customer login validation) */}
                    <div className="p-5 pt-0 flex items-center gap-2">
                      <Link
                        href={`/business/${biz.slug}`}
                        className="flex-1 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs py-2.5 rounded-xl text-center border border-slate-200 transition"
                      >
                        Pass Details
                      </Link>

                      {isJoined ? (
                        <Link
                          href="/loyalty"
                          className="flex-1 bg-amber-50 border border-amber-300 text-amber-900 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1 transition text-center"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                          <span>Joined</span>
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleJoinVenue(biz)}
                          disabled={joiningId === biz.id}
                          className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1 transition shadow-sm shadow-amber-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          <Gift className="w-3.5 h-3.5 text-slate-950" />
                          <span>{joiningId === biz.id ? 'Joining...' : 'Join Program'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>

          {/* Bottom Link to Full Directory */}
          <div className="mt-12 text-center">
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 border border-amber-500/30 font-bold text-xs shadow-md transition active:scale-95"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Explore All Registered Places on Directory</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Anti-Fraud & Security Architecture (#security) */}
      <section id="security" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
              <span className="text-xs font-bold text-amber-900 bg-amber-100/80 border border-amber-300 px-3.5 py-1 rounded-full uppercase tracking-wider">
                Bank-Grade Security
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Engineered to prevent fraud out of the box
              </h2>
              <p className="text-sm text-slate-600">
                Unlike static printed QR stickers that customers photograph and scan from home, GoldStamp protects every visit with time-synchronized rotation.
              </p>
            </div>
          </RevealOnScroll>

          {/* Interactive Hover-Up Animated Security Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Security Pillar 1: Time-Synchronized Dynamic QR */}
            <RevealOnScroll delay={100} className="h-full">
              <div className="group bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/15 hover:-translate-y-2.5 transition-all duration-300 flex flex-col justify-between h-full cursor-default">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition duration-300">
                    <Clock className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-950 group-hover:text-amber-600 transition">
                      Time-Synchronized Dynamic QR
                    </h3>
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md inline-block">
                      Rotating Token Security
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-800 transition">
                    Counter QR codes rotate automatically on the merchant screen. Any photograph, recorded video, or shared screenshot becomes permanently invalid almost immediately.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="group-hover:text-slate-900 transition">Active In-Store Verification</span>
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                </div>
              </div>
            </RevealOnScroll>

            {/* Security Pillar 2: Configurable Cooldown Filters */}
            <RevealOnScroll delay={200} className="h-full">
              <div className="group bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/15 hover:-translate-y-2.5 transition-all duration-300 flex flex-col justify-between h-full cursor-default">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition duration-300">
                    <Lock className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-950 group-hover:text-amber-600 transition">
                      Configurable Cooldown Filters
                    </h3>
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md inline-block">
                      Rate-Limiting Defense
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-800 transition">
                    Prevent repeated multi-scans in a single visit. If a customer attempts to scan twice within 30 or 60 minutes, the second check-in is instantly rejected and flagged.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="group-hover:text-slate-900 transition">Zero Rapid Multi-Stamping</span>
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                </div>
              </div>
            </RevealOnScroll>

            {/* Security Pillar 3: Single-Use Tamper-Proof Vouchers */}
            <RevealOnScroll delay={300} className="h-full">
              <div className="group bg-white p-7 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/15 hover:-translate-y-2.5 transition-all duration-300 flex flex-col justify-between h-full cursor-default">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition duration-300">
                    <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-950 group-hover:text-amber-600 transition">
                      Single-Use Tamper-Proof Vouchers
                    </h3>
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md inline-block">
                      Double-Spend Prevention
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed group-hover:text-slate-800 transition">
                    Reward vouchers can only be redeemed once. Staff verifies the human-readable code via the Merchant Terminal, instantly recording the redemption and preventing reuse.
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span className="group-hover:text-slate-900 transition">Zero Double-Spend Risk</span>
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                </div>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* 5. Simple, Predictable Subscription Plans (#pricing) */}
      <section id="pricing" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="max-w-3xl mx-auto text-center space-y-4 mb-12">
              <span className="text-xs font-bold text-amber-900 bg-amber-100/80 border border-amber-300 px-3.5 py-1 rounded-full uppercase tracking-wider inline-block">
                Transparent Pricing
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Simple, predictable subscription plans
              </h2>
              <p className="text-sm text-slate-600">
                No hidden fees. Unlimited customer registrations on every plan. Enjoy your first 2 months completely free.
              </p>

              {/* Monthly / Yearly Toggle (25% OFF on Yearly) */}
              <div className="pt-4 flex items-center justify-center">
                <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-slate-950 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Monthly Billing
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingCycle('yearly')}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      billingCycle === 'yearly'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Yearly Billing</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      billingCycle === 'yearly' ? 'bg-slate-950 text-amber-300' : 'bg-amber-100 text-amber-800'
                    }`}>
                      Save 25%
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </RevealOnScroll>

          {/* EXACTLY 2 SUBSCRIPTION PLANS: STARTER (₹499) & PRO (₹999) WITH FIRST 2 MONTHS FREE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plan 1: Starter Venue Plan */}
            <RevealOnScroll delay={100} className="h-full">
              <div className="bg-slate-50 rounded-3xl p-8 border-2 border-slate-200/90 hover:border-amber-400 transition-all duration-300 shadow-sm flex flex-col justify-between h-full space-y-6 relative">
                <div className="space-y-5">
                  {/* 2-Month Free Trial Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/50 text-amber-800 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>First 2 Months 100% Free Trial</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-950">Starter Venue</h3>
                    <p className="text-xs text-slate-500 mt-1">For single cafés, turf courts, and boutique studios</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-slate-950">
                        {billingCycle === 'yearly' ? '₹374' : '₹499'}
                      </span>
                      <span className="text-xs text-slate-500">/ month after trial</span>
                    </div>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-700 pt-2 border-t border-slate-200">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span><strong>1 Venue Location</strong> (Court / Café / Turf)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span><strong>Unlimited</strong> Customer Registrations</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span><strong>Dynamic Counter QR</strong> Kiosk Display</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Up to 2 Active Loyalty Stamp Campaigns</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>3 Staff Terminal PIN Accounts</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>Real-time Stamp & Redemption Logs</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/client/register"
                  className="w-full py-3.5 text-center rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-xs transition border border-amber-500/30 shadow-md active:scale-95"
                >
                  Claim 2 Months Free (Starter)
                </Link>
              </div>
            </RevealOnScroll>

            {/* Plan 2: Pro Scale Plan (Featured / Recommended) */}
            <RevealOnScroll delay={200} className="h-full">
              <div className="bg-slate-950 text-white rounded-3xl p-8 border-2 border-amber-400 shadow-2xl shadow-amber-500/10 flex flex-col justify-between h-full space-y-6 relative">
                {/* Popular Tag */}
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 text-[10px] font-black uppercase px-4 py-1 rounded-full tracking-wider shadow-md">
                  Recommended For Growth
                </span>

                <div className="space-y-5">
                  {/* 2-Month Free Trial Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/60 text-amber-300 text-xs font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>First 2 Months 100% Free Trial</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white">Pro Scale</h3>
                    <p className="text-xs text-slate-400 mt-1">For multi-court arenas, busy restaurants & franchise branches</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-amber-400">
                        {billingCycle === 'yearly' ? '₹749' : '₹999'}
                      </span>
                      <span className="text-xs text-slate-400">/ month after trial</span>
                    </div>
                  </div>

                  <ul className="space-y-3 text-xs text-slate-300 pt-2 border-t border-slate-800">
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span><strong>Unlimited Venue Locations</strong> & Branches</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span><strong>Unlimited Active Campaigns</strong> (Stamps + Points)</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span><strong>Unlimited Staff PINs</strong> & Manager Roles</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span><strong>WhatsApp Notification</strong> Integration</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Customer Retention Analytics & <strong>CSV Export</strong></span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Dedicated 24/7 Priority SLA & Onboarding</span>
                    </li>
                  </ul>
                </div>

                <Link
                  href="/client/register"
                  className="w-full py-3.5 text-center rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs transition shadow-lg shadow-amber-500/25 active:scale-95"
                >
                  Claim 2 Months Free (Pro Scale)
                </Link>
              </div>
            </RevealOnScroll>
          </div>

          {/* Reassurance Banner */}
          <div className="mt-12 text-center text-xs text-slate-500 max-w-xl mx-auto">
            <span>All plans include 60 days of unconditional 100% free access. Cancel anytime with a single click in your merchant dashboard.</span>
          </div>
        </div>
      </section>

      {/* 6. Comprehensive Interactive Accordion FAQ (#faq) - Tailored for both Customers & Merchants */}
      <section id="faq" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealOnScroll>
            <div className="text-center space-y-3 mb-14">
              <span className="text-xs font-bold text-amber-900 bg-amber-100/80 border border-amber-300 px-3.5 py-1 rounded-full uppercase tracking-wider inline-block">
                Got Questions?
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-slate-600">
                Clear answers for both business owners and loyalty members.
              </p>
            </div>
          </RevealOnScroll>

          {/* Accordion Items: Satisfies both Customer & Merchant without exposing internal mechanics */}
          <div className="space-y-4">
            {[
              {
                question: 'How does the 2-Month Free Trial work for venues?',
                answer:
                  'Every new business receives a full 60-day (2 whole months) free trial with complete access to all features, live counter QR displays, staff accounts, and analytics. No upfront payment or commitment is required. You can experience measurable customer return visits before paying a single rupee.',
              },
              {
                question: 'How do customers collect stamps during a visit?',
                answer:
                  'Collecting stamps is seamless. Customers simply scan the venue’s counter screen with their smartphone camera or open their GoldStamp loyalty card. The visit is logged instantly in seconds, adding a stamp directly into their digital wallet with instant visual confirmation.',
              },
              {
                question: 'Can venues customize their stamp requirements and rewards?',
                answer:
                  'Yes! Venue owners have complete flexibility to configure their loyalty campaigns. You can set the target visits (e.g. 5 visits for a café, 8 matches for a box cricket turf, or 10 sessions for a pickleball court) and define the reward of your choice (such as a complimentary beverage, court discount, or free treatment).',
              },
              {
                question: 'How does reward redemption work at checkout?',
                answer:
                  'When a customer completes their required visits, an exclusive, single-use reward voucher unlocks in their wallet. At checkout, the customer displays this voucher, and your staff verifies it directly on the counter kiosk or staff portal. Once verified, the reward is claimed immediately and cannot be reused.',
              },
              {
                question: 'Does the business need special POS hardware or devices?',
                answer:
                  'No specialized hardware is required. The GoldStamp Counter Kiosk and Merchant Dashboard run effortlessly in any standard web browser on your existing iPad, Android tablet, smartphone, or counter computer.',
              },
              {
                question: 'Can customers track all their loyalty cards across different places in one account?',
                answer:
                  'Yes! Customers have a single, unified GoldStamp wallet. Whether visiting their favorite specialty coffee shop, local pickleball arena, salon, or sports turf, all their active stamp cards, earned vouchers, and rewards are accessible in one convenient place.',
              },
            ].map((item, index) => {
              const isOpen = openFaq === index;
              return (
                <RevealOnScroll key={index} delay={index * 50}>
                  <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs transition">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition cursor-pointer"
                    >
                      <span className="text-sm sm:text-base font-bold text-slate-900">
                        {item.question}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-200 ${
                          isOpen ? 'bg-amber-500 text-slate-950 rotate-180' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-amber-50/20">
                        {item.answer}
                      </div>
                    )}
                  </div>
                </RevealOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Clean Developer-Grade Obsidian & Gold Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 sm:py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <img
                  src="/images/logo-dark.png"
                  alt="GoldStamp"
                  className="h-8 w-auto object-contain"
                />
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Production-grade multi-tenant digital loyalty platform powering repeat local commerce.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/discover" className="hover:text-amber-400 transition">Venue Directory</Link></li>
                <li><Link href="/client/register" className="hover:text-amber-400 transition">Merchant Registration</Link></li>
                <li><Link href="/client/login" className="hover:text-amber-400 transition">Merchant Console</Link></li>
                <li><span className="text-slate-400 text-xs font-medium">Customer App (iOS & Android)</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Industries</h4>
              <ul className="space-y-2">
                <li><Link href="/discover" className="hover:text-amber-400 transition">Pickleball & Padel</Link></li>
                <li><Link href="/discover" className="hover:text-amber-400 transition">Box Cricket Turfs</Link></li>
                <li><Link href="/discover" className="hover:text-amber-400 transition">Specialty Coffee</Link></li>
                <li><Link href="/discover" className="hover:text-amber-400 transition">Salons & Luxury Spas</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Security & Reliability</h4>
              <ul className="space-y-2">
                <li className="text-slate-400">Time-Rotating Counter QR</li>
                <li className="text-slate-400">Single-Use Voucher Verification</li>
                <li className="text-slate-400">Multi-Scan Frequency Defense</li>
                <li className="text-slate-400">99.9% High-Availability Cloud</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} GoldStamp Inc. Built for real commercial venues.
            </div>
            <div className="flex items-center gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Security Standards</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Customer Mobile App Download Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl relative border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border-2 border-amber-400/50 text-amber-600 flex items-center justify-center mx-auto shadow-md shadow-amber-500/20">
              <Gift className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-widest bg-amber-50 border border-amber-200 px-3 py-1 rounded-full inline-block">
                Customer Mobile App
              </span>
              <h3 className="text-xl font-black text-slate-950">
                Join {selectedVenueForAuth?.name || 'Loyalty Pass'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Download the free <strong>GoldStamp Customer App</strong> on your iPhone or Android to collect stamps at counter kiosks and unlock exclusive milestone rewards!
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <div className="p-3.5 rounded-2xl bg-slate-950 text-white flex items-center justify-between text-xs font-bold shadow-md">
                <span className="text-amber-400 font-semibold">iOS & Android App</span>
                <span className="bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">Free Download</span>
              </div>
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
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
