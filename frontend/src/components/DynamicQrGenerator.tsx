'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { createClient } from '../utils/supabase/client';
import {
  playCounterSoundbox,
  testSoundbox,
  getSoundboxSettings,
  saveSoundboxSettings,
} from '../lib/soundbox';
import {
  RefreshCw,
  Maximize2,
  Minimize2,
  ShieldCheck,
  Zap,
  Sparkles,
  CheckCircle2,
  Volume2,
  VolumeX,
  Gift,
  Award,
  Play,
  Check,
  X,
  Radio,
} from 'lucide-react';

interface DynamicQrGeneratorProps {
  businessId: string;
  businessName: string;
  branchId?: string | null;
  campaignId?: string | null;
}

interface CelebrationState {
  customerName: string;
  cycleStamps: number;
  milestoneTarget: number;
  rewardTitle?: string;
  isMilestone: boolean;
  token?: string;
  timestamp?: string;
}

export const DynamicQrGenerator: React.FC<DynamicQrGeneratorProps> = ({
  businessId,
  businessName,
  branchId,
  campaignId,
}) => {
  const [qrData, setQrData] = useState<any>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(60);
  const [loading, setLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [liveTimestamp, setLiveTimestamp] = useState<string>('');

  // Soundbox audio & voice settings
  const [soundboxEnabled, setSoundboxEnabled] = useState(true);
  const [soundboxVolume, setSoundboxVolume] = useState(1);
  const [testingSoundbox, setTestingSoundbox] = useState(false);

  // Real-time Celebration takeover state
  const [celebration, setCelebration] = useState<CelebrationState | null>(null);

  // Live milliseconds ticker to visually prove screen freshness (anti-screenshot watermark)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLiveTimestamp(now.toISOString().substring(11, 23));
    }, 60);
    return () => clearInterval(interval);
  }, []);

  // Initialize Soundbox preferences
  useEffect(() => {
    const s = getSoundboxSettings();
    setSoundboxEnabled(s.enabled);
    setSoundboxVolume(s.volume);
  }, []);

  const handleToggleSoundbox = () => {
    const next = !soundboxEnabled;
    setSoundboxEnabled(next);
    saveSoundboxSettings({
      enabled: next,
      voiceEnabled: next,
      chimeEnabled: next,
      volume: soundboxVolume,
    });
  };

  const handleTestSoundbox = async () => {
    setTestingSoundbox(true);
    await testSoundbox();
    setTestingSoundbox(false);
  };

  const triggerCelebration = (data: CelebrationState) => {
    setCelebration(data);

    // Announce via Web Audio API + Speech Synthesis
    playCounterSoundbox({
      customerName: data.customerName,
      businessName,
      cycleStamps: data.cycleStamps,
      milestoneTarget: data.milestoneTarget,
      rewardTitle: data.rewardTitle,
      isMilestone: data.isMilestone,
    });

    // Auto-dismiss after 6.5s
    setTimeout(() => {
      setCelebration((curr) => (curr?.token === data.token ? null : curr));
    }, 6500);
  };

  const fetchNewQr = async () => {
    if (!businessId) return;
    setLoading(true);
    try {
      const res = await api.generateDynamicQr(businessId, {
        branchId,
        campaignId,
        expirySeconds: 60,
      });
      if (res.success && res.data) {
        setQrData(res.data);
        setSecondsRemaining(60);
      }
    } catch (err) {
      console.error('Failed to generate dynamic QR:', err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Real-time Supabase poller: checks if current token is consumed by an external phone scan
  useEffect(() => {
    if (!qrData?.token) return;
    const currentToken = qrData.token;
    let isDisposed = false;

    const interval = setInterval(async () => {
      if (isDisposed) return;
      try {
        const supabase = createClient();
        const { data: qRecord } = await supabase
          .from('QRCode')
          .select('id, isUsed, campaignId')
          .eq('token', currentToken)
          .maybeSingle();

        if (qRecord?.isUsed && !isDisposed) {
          isDisposed = true;

          // Token scanned by phone! Retrieve visit details to announce patron
          const { data: latestVisit } = await supabase
            .from('Visit')
            .select('*, user:User(*), campaign:Campaign(*, rewards:Reward(*), rules:CampaignRule(*))')
            .eq('businessId', businessId)
            .order('createdAt', { ascending: false })
            .limit(1)
            .maybeSingle();

          const custName = latestVisit?.user?.name || 'Customer';
          const target = latestVisit?.campaign?.rules?.[0]?.conditionValue || 5;

          const { count } = await supabase
            .from('Visit')
            .select('*', { count: 'exact', head: true })
            .eq('userId', latestVisit?.userId)
            .eq('businessId', businessId);

          const totalVisits = count || 1;
          const cycleStamps = ((totalVisits - 1) % target) + 1;
          const isMilestone = cycleStamps === target;
          const rewardTitle = latestVisit?.campaign?.rewards?.[0]?.title || 'Milestone Perk';

          triggerCelebration({
            customerName: custName,
            cycleStamps,
            milestoneTarget: target,
            rewardTitle,
            isMilestone,
            token: currentToken,
            timestamp: new Date().toLocaleTimeString(),
          });

          // Rotate to brand-new QR immediately
          await fetchNewQr();
        }
      } catch {
        // Polling gracefully handled
      }
    }, 2200);

    return () => {
      isDisposed = true;
      clearInterval(interval);
    };
  }, [qrData?.token, businessId]);

  // 2. Real-time local event listener: for simulation or in-app scan
  useEffect(() => {
    const handleScanEvent = (e: any) => {
      const d = e.detail;
      if (!d) return;
      if (d.businessId && d.businessId !== businessId) return;

      triggerCelebration({
        customerName: d.customerName || 'Customer Member',
        cycleStamps: d.cycleStamps || 1,
        milestoneTarget: d.milestoneTarget || 5,
        rewardTitle: d.rewardTitle || 'Milestone Reward',
        isMilestone: !!d.isMilestone,
        token: d.token,
        timestamp: new Date().toLocaleTimeString(),
      });

      fetchNewQr();
    };

    window.addEventListener('goldstamp:counter_scan', handleScanEvent);
    return () => window.removeEventListener('goldstamp:counter_scan', handleScanEvent);
  }, [businessId]);

  useEffect(() => {
    fetchNewQr();
  }, [businessId, branchId, campaignId]);

  // Automatic 60s rotation countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          fetchNewQr();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [businessId]);

  return (
    <div
      className={`bg-white rounded-3xl border border-slate-200 transition-all relative overflow-hidden ${
        isFullScreen
          ? 'fixed inset-0 z-50 p-6 sm:p-10 flex flex-col items-center justify-center bg-slate-950 text-white'
          : 'p-6 shadow-sm w-full max-w-lg'
      }`}
    >
      {/* ===================== CURIOSITY CELEBRATION TAKEOVER OVERLAY ===================== */}
      {celebration && (
        <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200 text-white">
          {/* Confetti & Sparkles Ambient Burst */}
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Dismiss button */}
          <button
            onClick={() => setCelebration(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition cursor-pointer"
            title="Dismiss celebration"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Soundbox Voice Wave Indicator */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-extrabold text-[11px] px-3.5 py-1 rounded-full uppercase tracking-widest mb-4 animate-pulse">
            <Radio className="w-3.5 h-3.5 animate-spin" />
            <span>Soundbox Voice Alert Broadcasting</span>
          </div>

          {/* Dynamic Celebration Icon */}
          <div className="relative mb-3">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-emerald-400 p-0.5 shadow-xl shadow-emerald-500/20 animate-bounce">
              <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
                {celebration.isMilestone ? (
                  <Award className="w-10 h-10 text-amber-400 animate-pulse" />
                ) : (
                  <Sparkles className="w-10 h-10 text-emerald-400" />
                )}
              </div>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {celebration.isMilestone ? '🎉 MILESTONE UNLOCKED!' : '⚡ STAMP VERIFIED & CREDITED!'}
          </h2>

          <p className="text-emerald-400 text-sm font-bold mt-1">
            {celebration.customerName} earned +1 Gold Stamp
          </p>

          {/* Progress Tracker Card */}
          <div className="w-full max-w-xs bg-white/5 border border-white/10 rounded-2xl p-4 my-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="text-slate-300">Milestone Progression</span>
              <span className="font-mono text-emerald-400">
                {celebration.cycleStamps} of {celebration.milestoneTarget} Stamps
              </span>
            </div>

            {/* Stamp Slots Visual Grid */}
            <div className="grid grid-cols-5 gap-1.5 mb-3">
              {Array.from({ length: celebration.milestoneTarget }).map((_, i) => {
                const filled = i < celebration.cycleStamps;
                const isTarget = i + 1 === celebration.milestoneTarget;
                return (
                  <div
                    key={i}
                    className={`h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      filled
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                        : isTarget
                        ? 'border border-dashed border-amber-400/60 text-amber-400'
                        : 'bg-white/5 border border-white/10 text-slate-500'
                    }`}
                  >
                    {filled ? (
                      <Check className="w-4 h-4 stroke-[3]" />
                    ) : isTarget ? (
                      <Gift className="w-4 h-4" />
                    ) : (
                      <span>{i + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Milestone Unlocked Highlight */}
            {celebration.isMilestone ? (
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 rounded-xl p-2.5 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md">
                <Gift className="w-4 h-4 shrink-0" />
                <span className="truncate">Reward Ready: {celebration.rewardTitle}</span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400">
                {celebration.milestoneTarget - celebration.cycleStamps === 1
                  ? '🔥 Just 1 more visit to unlock the free reward!'
                  : `${celebration.milestoneTarget - celebration.cycleStamps} more stamps to claim reward.`}
              </div>
            )}
          </div>

          {/* Security Rotation Notice */}
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Token burned in real-time · Next fresh QR loaded</span>
          </div>

          <button
            onClick={() => setCelebration(null)}
            className="mt-4 px-6 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-slate-200 transition shadow-lg cursor-pointer"
          >
            Ready for Next Customer →
          </button>
        </div>
      )}

      {/* ===================== TOP SOUNDBOX BAR ===================== */}
      <div className="w-full mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleToggleSoundbox}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition shadow-xs cursor-pointer ${
              soundboxEnabled
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-500/30'
                : 'bg-slate-200 text-slate-500'
            }`}
            title={soundboxEnabled ? 'Mute Counter Soundbox' : 'Enable Counter Soundbox'}
          >
            {soundboxEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900 tracking-tight">Counter Soundbox</span>
              <span
                className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  soundboxEnabled
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {soundboxEnabled ? 'ON · VOICE ACTIVE' : 'MUTED'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              Speaks verified customer name & audio chime on each scan.
            </p>
          </div>
        </div>

        <button
          onClick={handleTestSoundbox}
          disabled={testingSoundbox || !soundboxEnabled}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 disabled:opacity-50 border border-slate-200 text-slate-700 font-bold text-[11px] px-3 py-1.5 rounded-xl transition shadow-2xs cursor-pointer shrink-0"
          title="Play sample soundbox chime and announcement"
        >
          <Play className={`w-3 h-3 text-emerald-600 fill-emerald-600 ${testingSoundbox ? 'animate-spin' : ''}`} />
          <span>{testingSoundbox ? 'Playing...' : 'Audio Preview'}</span>
        </button>
      </div>

      {/* Header bar */}
      <div className="flex items-center justify-between w-full mb-3">
        <div>
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Dynamic Single-Use Anti-Fraud QR
          </div>
          <h3 className={`text-lg font-extrabold mt-0.5 ${isFullScreen ? 'text-white' : 'text-slate-900'}`}>
            {businessName}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchNewQr}
            disabled={loading}
            className={`p-2 rounded-xl border transition disabled:opacity-50 cursor-pointer ${
              isFullScreen
                ? 'border-slate-800 hover:bg-slate-900 text-slate-300'
                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
            title="Refresh QR manually"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              isFullScreen
                ? 'border-slate-800 hover:bg-slate-900 text-slate-300'
                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
            title={isFullScreen ? 'Exit Kiosk Mode' : 'Kiosk Full Screen Mode'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Dynamic Anti-Screenshot Live Security Watermark Banner */}
      <div className="w-full mb-3 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-300 font-bold">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          <span>LIVE NONCE:</span>
        </div>
        <span className="font-black text-purple-700 dark:text-purple-300 tracking-wider">
          {liveTimestamp || 'SYNCING...'}
        </span>
      </div>

      {/* QR Code Canvas / Image Display */}
      <div
        className={`p-6 rounded-2xl border flex flex-col items-center justify-center relative w-full overflow-hidden ${
          isFullScreen ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/80'
        }`}
      >
        {/* Subtle holographic scanning effect */}
        <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse top-1/2 -translate-y-1/2 opacity-70 pointer-events-none" />

        {qrData?.qrDataUrl ? (
          <div className="relative group">
            <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200/60">
              <img
                src={qrData.qrDataUrl}
                alt="Dynamic Counter QR"
                className="w-64 h-64 object-contain rounded-lg"
              />
            </div>
            {loading && (
              <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-64 h-64 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
            <span className="text-xs">Generating single-use QR token...</span>
          </div>
        )}

        {/* Counter Check-In Code Display */}
        {qrData?.token && (
          <div className="mt-3 text-center">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">
              6-Digit Counter Code:
            </span>
            <span className="font-mono text-base font-extrabold tracking-widest text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-4 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 inline-block mt-1 select-all shadow-sm">
              {qrData.token}
            </span>
          </div>
        )}

        {/* Security rotation badge */}
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Single-Use Protected
          </span>
          <span className="text-slate-400 text-[11px]">
            Rotates every <strong className="text-emerald-600 font-mono">{secondsRemaining}s</strong> or{' '}
            <strong className="text-emerald-500">instantly on scan</strong>
          </span>
        </div>

        {/* Anti-Screenshot Anti-Replay Disclaimer */}
        <div className="mt-3 text-center text-[10px] text-slate-400 max-w-xs leading-tight">
          Photos & screenshots cannot be reused. Once scanned, token is immediately burned and replaced.
        </div>
      </div>
    </div>
  );
};
