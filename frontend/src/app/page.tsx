'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../lib/auth-context';
import {
  Award,
  QrCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Coffee,
  Activity,
  Layers,
  Zap,
  Clock,
  Lock,
  ChevronRight,
  Users,
  Store,
  RefreshCw,
  Gift,
  Check,
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  // Interactive Live Stamp Sandbox State
  const [sandboxStamps, setSandboxStamps] = useState(8);
  const [sandboxRedeemed, setSandboxRedeemed] = useState(false);
  const [showSandboxReward, setShowSandboxReward] = useState(false);

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
    setSandboxRedeemed(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 selection:bg-emerald-500 selection:text-white">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Headline and Call-to-Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Production Multi-Tenant Loyalty Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.12]">
                Replace paper stamp cards with{' '}
                <span className="text-emerald-600 underline decoration-emerald-200 decoration-wavy underline-offset-8">
                  fraud-proof
                </span>{' '}
                digital rewards.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Empower sports arenas, pickleball courts, specialty cafés, box cricket turfs, salons, and gyms with 60-second dynamic counter QR check-ins. One universal account for customers across all venues.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/register"
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition flex items-center gap-2 active:scale-95"
                >
                  <Award className="w-4 h-4 text-emerald-200" />
                  <span>Join as Customer (Free)</span>
                </Link>

                <Link
                  href="/client/register"
                  className="px-6 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition flex items-center gap-2 active:scale-95"
                >
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span>Register Your Business</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/discover"
                  className="px-5 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition flex items-center gap-2 active:scale-95"
                >
                  <QrCode className="w-4 h-4 text-slate-600" />
                  <span>Explore Places</span>
                </Link>
              </div>

              {/* Quick Sign In Helper Links */}
              <div className="text-xs text-slate-500 pt-1">
                Already registered?{' '}
                <Link href="/login" className="text-emerald-700 hover:underline font-semibold">
                  Customer Login
                </Link>
                {' '}&bull;{' '}
                <Link href="/client/login" className="text-slate-900 hover:underline font-semibold">
                  Business Login
                </Link>
              </div>

              {/* Trust Metric Badges */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-100 max-w-lg">
                <div>
                  <div className="text-2xl font-bold text-slate-950">60s</div>
                  <div className="text-xs text-slate-500 font-medium">Rotating Dynamic QR</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-950">1 Tap</div>
                  <div className="text-xs text-slate-500 font-medium">Customer Check-In</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-950">0 Hardware</div>
                  <div className="text-xs text-slate-500 font-medium">Works on any tablet</div>
                </div>
              </div>
            </div>

            {/* Right Column: Real Venue Photography & Interactive Card Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900 group">
                <div className="relative h-80 sm:h-96 w-full">
                  <Image
                    src="/images/hero-counter.jpg"
                    alt="Customer scanning dynamic loyalty QR at counter"
                    fill
                    priority
                    className="object-cover group-hover:scale-105 transition duration-700 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                </div>

                {/* Floating Real-Time Stamp Card Overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-white/60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        SZ
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 leading-tight">SmashZone Pickleball</div>
                        <div className="text-[10px] text-slate-500">Play 10 Sessions → 1 Hour FREE</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      8 / 10 Visits
                    </span>
                  </div>

                  {/* 10-Slot Micro Progress Grid */}
                  <div className="grid grid-cols-10 gap-1 mb-2">
                    {[...Array(10)].map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-all ${
                          idx < 8
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {idx < 8 ? <Check className="w-3 h-3 text-white stroke-[2.5]" /> : idx + 1}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Active Digital Card</span>
                    <span className="font-semibold text-emerald-600">Only 2 more visits to unlock!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Live Sandbox Section */}
      <section className="py-16 bg-slate-900 text-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block mb-2">
              Interactive Product Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Experience the Central Loyalty Loop Live
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Simulate customer QR check-ins and watch how milestone rewards unlock automatically with anti-fraud verification codes.
            </p>
          </div>

          {/* Sandbox Terminal */}
          <div className="max-w-xl mx-auto bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  SZ
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">SmashZone Pickleball Arena</h3>
                  <p className="text-[11px] text-slate-400">Campaign: 10 Visits → 1 Hour FREE Court</p>
                </div>
              </div>
              <button
                onClick={handleResetSandbox}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
                title="Reset simulation"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Stamp Slots */}
            <div>
              <div className="flex items-center justify-between text-xs mb-3">
                <span className="text-slate-400">Customer Progress:</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {sandboxStamps} / 10 Stamps Collected
                </span>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-11 rounded-xl flex flex-col items-center justify-center text-xs font-bold transition-all duration-300 ${
                      i < sandboxStamps
                        ? 'bg-emerald-500 text-slate-950 scale-100 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-900 text-slate-600 border border-slate-800'
                    }`}
                  >
                    {i < sandboxStamps ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <span className="font-mono">{i + 1}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Milestone Reward Unlock Alert */}
            {showSandboxReward && (
              <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 animate-in fade-in zoom-in-95 duration-300 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <Gift className="w-4 h-4" />
                  <span>Milestone Reached! Reward Unlocked:</span>
                </div>
                <div className="flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-emerald-500/20">
                  <div>
                    <div className="text-xs font-bold text-white">1 Hour FREE Court Session</div>
                    <div className="text-[10px] text-slate-400">SmashZone Pickleball Arena</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Redemption Code:</span>
                    <span className="font-mono font-bold text-emerald-400 text-xs">SMASH-83E7AC</span>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-300/80">
                  Staff verifies this code in the Merchant Console. Once used, the code cannot be redeemed twice.
                </p>
              </div>
            )}

            {/* Sandbox Action Button */}
            <div className="pt-2">
              {sandboxStamps < 10 ? (
                <button
                  onClick={handleSimulateScan}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Simulate Visit QR Scan ({sandboxStamps}/10)</span>
                </button>
              ) : (
                <button
                  onClick={handleResetSandbox}
                  className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Simulation Complete! Restart Test Loop</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Multi-Industry Photography Showcase */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Tailored For Modern Venues
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Built for high-frequency lifestyle businesses
            </h2>
            <p className="text-sm text-slate-600">
              Each industry has unique visit frequencies and reward structures. Gold Stamp handles them out-of-the-box.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Pickleball */}
            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition group flex flex-col justify-between">
              <div>
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src="/images/pickleball-arena.jpg"
                    alt="Indoor Pickleball Arena"
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    Pickleball & Padel
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-slate-900">SmashZone Arena</h3>
                  <div className="text-xs font-semibold text-emerald-700">10 Visits → 1 Hour FREE Court</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Drives repeat league court bookings during weekday morning and off-peak hours.
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Repeat Rate: +44%</span>
                <Link href="/business/smashzone-pickleball" className="font-semibold text-slate-900 hover:text-emerald-700 flex items-center gap-1">
                  <span>View</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2: Specialty Café */}
            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition group flex flex-col justify-between">
              <div>
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src="/images/coffee-shop.jpg"
                    alt="Artisan Roastery and Coffee Shop"
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    Cafés & Bakeries
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-slate-900">Artisan Roastery</h3>
                  <div className="text-xs font-semibold text-amber-700">5 Visits → Free Pour-Over</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Turns daily commuter morning coffee buyers into habitual regular customers.
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Daily Retention: 78%</span>
                <Link href="/business/artisan-roastery-cafe" className="font-semibold text-slate-900 hover:text-emerald-700 flex items-center gap-1">
                  <span>View</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3: Box Cricket */}
            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition group flex flex-col justify-between">
              <div>
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src="/images/box-cricket.jpg"
                    alt="Box Cricket Turf Arena"
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    Box Cricket & Turf
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-slate-900">PowerBox Arena</h3>
                  <div className="text-xs font-semibold text-indigo-700">5 Matches → ₹500 Arena Credit</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Incentivizes teams to keep coming back for weekend tournaments and late-night slots.
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Team Loyalty: 3.2x</span>
                <Link href="/business/powerbox-cricket-arena" className="font-semibold text-slate-900 hover:text-emerald-700 flex items-center gap-1">
                  <span>View</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 4: Boutique Salon */}
            <div className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition group flex flex-col justify-between">
              <div>
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src="/images/boutique-salon.jpg"
                    alt="Luxury Boutique Salon and Spa"
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    Salons & Spas
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="text-base font-bold text-slate-900">Aurora Boutique Spa</h3>
                  <div className="text-xs font-semibold text-rose-700">4 Visits → Deluxe Treatment</div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Builds high-ticket recurring client habits for styling, coloring, and wellness.
                  </p>
                </div>
              </div>
              <div className="px-5 pb-5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Average LTV: +62%</span>
                <Link href="/discover" className="font-semibold text-slate-900 hover:text-emerald-700 flex items-center gap-1">
                  <span>Explore</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Anti-Fraud & Enterprise Architecture */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
            <span className="text-xs font-semibold text-slate-700 bg-slate-200/60 px-3 py-1 rounded-full uppercase tracking-wider">
              Bank-Grade Integrity
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Engineered to prevent fraud out of the box
            </h2>
            <p className="text-sm text-slate-600">
              Unlike static printed QR stickers that customers photograph and scan from home, Gold Stamp protects every transaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">60-Second Short-Lived QR</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tokens are signed with HMAC-SHA256 and expire strictly after 60 seconds. Photographs and shared screenshots become invalid almost immediately.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Configurable Cooldown Filters</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prevent rapid multiple check-ins. If a customer attempts to scan twice within 30 or 60 minutes, the second check-in is instantly rejected.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Atomic Postgres Redemptions</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Reward codes can only be redeemed once. Staff verifies the human-readable code via the Merchant Terminal, instantly burning the reward in an ACID transaction.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Transparent SaaS Pricing */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-3 mb-14">
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
              Transparent Pricing
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
              Simple, predictable subscription plans
            </h2>
            <p className="text-sm text-slate-600">
              No hidden transaction cuts. Unlimited customer registrations on every plan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Starter</h3>
                  <p className="text-xs text-slate-500 mt-1">For single cafés & boutique venues</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-950">₹499</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>1 Store Location / Branch</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Up to 2 Active Campaigns</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Dynamic Counter QR Kiosk</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>2 Staff Accounts</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/client/register"
                className="w-full py-2.5 text-center rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 font-semibold text-xs transition"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Growth Plan (Featured) */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 border-2 border-emerald-500 shadow-xl flex flex-col justify-between space-y-6 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full tracking-wider">
                Most Popular
              </span>
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-white">Growth</h3>
                  <p className="text-xs text-slate-400 mt-1">For busy arenas, courts, and busy dining</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">₹999</span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Up to 3 Store Branches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Unlimited Loyalty Campaigns</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Point Ledgers + Stamp Cards</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Customer Analytics & Cohorts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>10 Staff Accounts</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/client/register"
                className="w-full py-2.5 text-center rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
              >
                Launch Growth Plan
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Pro & Multi-Location</h3>
                  <p className="text-xs text-slate-500 mt-1">For multi-court complexes & franchises</p>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-950">₹1,999</span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Unlimited Store Locations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Custom Rewards & Points Engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Unlimited Staff Accounts</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>WhatsApp Notification Integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Dedicated Support & SLA</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/client/register"
                className="w-full py-2.5 text-center rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-900 font-semibold text-xs transition"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Clean Developer-Grade Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
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
              <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>All Systems Operational</span>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/discover" className="hover:text-white transition">Venue Directory</Link></li>
                <li><Link href="/client/register" className="hover:text-white transition">Merchant Registration</Link></li>
                <li><Link href="/client/login" className="hover:text-white transition">Merchant Console</Link></li>
                <li><Link href="/login" className="hover:text-white transition">Customer Loyalty Pass</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Industries</h4>
              <ul className="space-y-2">
                <li><Link href="/discover" className="hover:text-white transition">Pickleball & Padel</Link></li>
                <li><Link href="/discover" className="hover:text-white transition">Box Cricket Turfs</Link></li>
                <li><Link href="/discover" className="hover:text-white transition">Specialty Coffee</Link></li>
                <li><Link href="/discover" className="hover:text-white transition">Salons & Luxury Spas</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3">Developers & Security</h4>
              <ul className="space-y-2">
                <li className="text-slate-400">REST API v1 (/api/v1)</li>
                <li className="text-slate-400">HMAC-SHA256 Token Auth</li>
                <li className="text-slate-400">PostgreSQL ACID Isolation</li>
                <li><Link href="/admin/dashboard" className="text-slate-400 hover:text-white transition">SaaS Owner Console</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © {new Date().getFullYear()} Gold Stamp Inc. Built for real commercial venues.
            </div>
            <div className="flex items-center gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Security Whitepaper</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
