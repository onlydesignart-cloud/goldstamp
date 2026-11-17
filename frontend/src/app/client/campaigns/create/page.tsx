'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../lib/auth-context';
import { api } from '../../../../lib/api';
import {
  Megaphone,
  ArrowLeft,
  Gift,
  Stamp,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Store,
  Check,
  Zap,
  Coffee,
  Activity,
  Scissors,
  Dumbbell,
  Gamepad2,
  Star,
  Layers,
} from 'lucide-react';

const CATEGORIES = [
  {
    id: 'SPORTS',
    name: 'Sports & Turf',
    icon: Activity,
    defaultName: 'Court Milestone Pass',
    defaultReward: '1 Hour Free Court Session',
    defaultStamps: 10,
    desc: 'Collect 1 stamp per court session booking.',
    color: 'emerald',
  },
  {
    id: 'CAFE',
    name: 'Café & Bakery',
    icon: Coffee,
    defaultName: 'Artisan Coffee Club',
    defaultReward: '1 Free Artisanal Cappuccino & Pastry',
    defaultStamps: 5,
    desc: 'Collect 1 stamp per beverage or bakery order.',
    color: 'amber',
  },
  {
    id: 'SALON',
    name: 'Salon & Spa',
    icon: Scissors,
    defaultName: 'VIP Grooming Rewards',
    defaultReward: 'Free Hair Spa / Facial Service',
    defaultStamps: 5,
    desc: 'Collect 1 stamp per salon or wellness visit.',
    color: 'rose',
  },
  {
    id: 'GYM',
    name: 'Gym & Fitness',
    icon: Dumbbell,
    defaultName: 'Workout Streak Pass',
    defaultReward: 'Free Whey Protein Shake / 1 PT Session',
    defaultStamps: 12,
    desc: 'Collect 1 stamp per workout check-in.',
    color: 'cyan',
  },
  {
    id: 'GAMING',
    name: 'Gaming & Esports',
    icon: Gamepad2,
    defaultName: 'Esports Hours Pass',
    defaultReward: '2 Free Hours PS5 / PC Slot',
    defaultStamps: 8,
    desc: 'Collect 1 stamp per gaming hour booked.',
    color: 'indigo',
  },
  {
    id: 'GENERAL',
    name: 'Custom / VIP',
    icon: Star,
    defaultName: 'VIP Loyalty Milestone',
    defaultReward: 'Complimentary VIP Experience Voucher',
    defaultStamps: 10,
    desc: 'Collect stamps to unlock special perks.',
    color: 'purple',
  },
];

export default function CreateCampaignSimplePage() {
  const router = useRouter();
  const { business } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<string>('SPORTS');
  const [targetStamps, setTargetStamps] = useState<number>(10);
  const [rewardTitle, setRewardTitle] = useState('1 Hour Free Court Session');
  const [campaignName, setCampaignName] = useState('Court Milestone Pass');
  const [description, setDescription] = useState('Collect 1 stamp per court booking. Complete the card to unlock your reward!');

  const quickStamps = [5, 8, 10, 12];

  const handleCategorySelect = (cat: typeof CATEGORIES[0]) => {
    setSelectedCategory(cat.id);
    setCampaignName(cat.defaultName);
    setRewardTitle(cat.defaultReward);
    setTargetStamps(cat.defaultStamps);
    setDescription(cat.desc);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    let targetBizId = business?.id;
    if (!targetBizId && typeof window !== 'undefined') {
      try {
        const storedBiz = localStorage.getItem('goldstamp_merchant_business');
        if (storedBiz) targetBizId = JSON.parse(storedBiz).id;
      } catch {}
    }
    if (!targetBizId) targetBizId = 'biz_test';
    setLoading(true);
    setError(null);

    try {
      const res = await api.createCampaign(targetBizId, {
        name: campaignName || `${targetStamps} Stamps Loyalty Program`,
        description,
        type: 'STAMP',
        category: selectedCategory,
        conditionType: 'STAMP_COUNT',
        conditionValue: Number(targetStamps),
        rewardTitle: rewardTitle || 'Free Reward',
        rewardType: 'FREE_PRODUCT',
        rewardValue: rewardTitle,
        isRecurring: true,
      });

      if (res.success) {
        router.push('/client/campaigns');
      } else {
        setError(res.error?.message || 'Failed to create campaign');
      }
    } catch (err: any) {
      setError(err.message || 'Error publishing campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Top Header */}
      <div>
        <Link
          href="/client/campaigns"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Campaigns
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Create Loyalty Campaign
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Launch dedicated stamp programs for specific departments (e.g. Pickleball Court vs Rooftop Café).
            </p>
          </div>
          <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <Layers className="w-3 h-3 text-emerald-600" />
            <span>Multi-Program Support</span>
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-200">
          {error}
        </div>
      )}

      {/* Category / Department Switcher */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 block">
          Select Department / Offering Category
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  )}
                </div>
                <div>
                  <div className="text-[11px] font-bold leading-tight">{cat.name}</div>
                  <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>
                    {cat.defaultStamps} visits target
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Clean Inputs */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
          <form onSubmit={handlePublish} className="space-y-5">
            {/* 1. Target Stamps */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                1. Target Stamps Needed for Free Reward
              </label>
              <div className="flex items-center gap-2 mb-2">
                {quickStamps.map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setTargetStamps(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                      targetStamps === num
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {num} Stamps
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Or custom:</span>
                <input
                  type="number"
                  min={2}
                  max={50}
                  value={targetStamps}
                  onChange={(e) => setTargetStamps(Number(e.target.value))}
                  className="w-24 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                />
                <span className="text-xs text-slate-500">visits</span>
              </div>
            </div>

            {/* 2. Reward Title */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                2. Free Reward Title
              </label>
              <div className="relative">
                <Gift className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  placeholder="e.g. 1 Free Cappuccino or 1 Hour Free Court"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 transition"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                This item will be granted as a single-use digital voucher once {targetStamps} stamps are collected.
              </p>
            </div>

            {/* 3. Program Name & Description */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  3. Program Name (Department / Pass Name)
                </label>
                <input
                  type="text"
                  required
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Court Milestone Pass or Rooftop Café Club"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 font-medium transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Customer Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short note for customers..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl px-3.5 py-2 text-xs text-slate-900 font-normal transition"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Launching...' : 'Launch Loyalty Program Now'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Column: Live Interactive Card Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Live Customer Preview</span>
          </div>

          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-sm">
                  <Stamp className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-white leading-tight">
                    {business?.name || 'CRICK PICK'}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-medium">
                    {campaignName || 'Active Loyalty Pass'}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold bg-white/10 text-white px-2.5 py-0.5 rounded-full">
                {targetStamps} Stamps
              </span>
            </div>

            <div>
              <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                Milestone Reward
              </div>
              <div className="text-lg font-black text-white mt-0.5">
                {rewardTitle || 'Your Free Reward'}
              </div>
              <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                {description}
              </div>
            </div>

            {/* Stamp Grid Simulation */}
            <div className="pt-2">
              <div className="text-[10px] font-bold text-slate-400 mb-2">
                Stamp Card Layout:
              </div>
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: Math.min(10, targetStamps) }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-9 rounded-xl flex items-center justify-center border font-mono text-xs font-bold ${
                      i < 3
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                        : 'bg-white/5 border-white/10 text-slate-500'
                    }`}
                  >
                    {i < 3 ? <Check className="w-3.5 h-3.5 text-slate-950 stroke-[2.5]" /> : i + 1}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Automatic QR check-in</span>
              <span className="text-emerald-400 font-semibold">Instant Confetti & Digital Voucher</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
