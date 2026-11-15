'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { RefreshCw, Maximize2, Minimize2, ShieldCheck, Clock, ExternalLink, Zap, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface DynamicQrGeneratorProps {
  businessId: string;
  businessName: string;
  branchId?: string | null;
  campaignId?: string | null;
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
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [activeCustomerName, setActiveCustomerName] = useState<string>('Customer');
  const [liveTimestamp, setLiveTimestamp] = useState<string>('');

  // Live milliseconds ticker to visually prove screen freshness (anti-screenshot watermark)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLiveTimestamp(now.toISOString().substring(11, 23));
    }, 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('goldstamp_customer_user') || localStorage.getItem('goldstamp_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.name) setActiveCustomerName(parsed.name);
        } catch {}
      }
    }
  }, []);

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

  const handleSimulateScan = async () => {
    if (!qrData?.token) return;
    try {
      const res = await api.processCheckIn({
        qrToken: qrData.token,
        businessId,
        metadata: { client: 'Counter Kiosk Simulator' },
      });
      if (res.success && res.data) {
        const custName = res.data.customerName || 'Customer';
        const stamps = res.data.cycleStamps || res.data.totalStamps || 1;
        const target = res.data.milestoneTarget || 10;
        setScanResult(`Visit verified: +1 stamp credited to ${custName} (${stamps}/${target} visits) · Token burned & rotated!`);
        setTimeout(() => setScanResult(null), 5000);

        // INSTANT ROTATION UPON SCAN: Single-use QR is immediately regenerated with brand new token!
        await fetchNewQr();
      } else {
        setScanResult(res.error?.message || 'Check-in failed');
        setTimeout(() => setScanResult(null), 5000);
      }
    } catch (e: any) {
      setScanResult(e.message || 'Error simulating check-in');
      setTimeout(() => setScanResult(null), 4000);
    }
  };

  useEffect(() => {
    fetchNewQr();
  }, [businessId, branchId, campaignId]);

  // Countdown timer: auto-regenerates when reaching 0
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
      className={`bg-white rounded-3xl border border-slate-200 transition-all ${
        isFullScreen
          ? 'fixed inset-0 z-50 p-8 flex flex-col items-center justify-center bg-slate-950/95 text-white backdrop-blur-2xl'
          : 'p-6 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between w-full max-w-md mb-4">
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
            className={`p-2 rounded-xl border transition disabled:opacity-50 ${
              isFullScreen ? 'border-slate-800 hover:bg-slate-900 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
            title="Refresh QR manually"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-500' : ''}`} />
          </button>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className={`p-2 rounded-xl border transition ${
              isFullScreen ? 'border-slate-800 hover:bg-slate-900 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}
            title={isFullScreen ? 'Exit Kiosk Mode' : 'Kiosk Full Screen Mode'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Dynamic Anti-Screenshot Live Security Watermark Banner */}
      <div className="w-full max-w-md mb-3 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-between text-[11px] font-mono">
        <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-300 font-bold">
          <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
          <span>LIVE NONCE:</span>
        </div>
        <span className="font-black text-purple-700 dark:text-purple-300 tracking-wider">
          {liveTimestamp || 'SYNCING...'}
        </span>
      </div>

      {/* QR Code Canvas / Image Display */}
      <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center relative w-full max-w-md overflow-hidden ${
        isFullScreen ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200/80'
      }`}>
        {/* Subtle holographic scanning effect */}
        <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse top-1/2 -translate-y-1/2 opacity-70 pointer-events-none" />

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
                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="w-64 h-64 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-purple-500 mb-2" />
            <span className="text-xs">Generating single-use QR token...</span>
          </div>
        )}

        {/* Security rotation badge */}
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Single-Use Protected
          </span>
          <span className="text-slate-400 text-[11px]">
            Rotates every <strong className="text-purple-600 dark:text-purple-400 font-mono">{secondsRemaining}s</strong> or <strong className="text-emerald-500">instantly on scan</strong>
          </span>
        </div>

        {/* Anti-Screenshot Anti-Replay Disclaimer */}
        <div className="mt-3 text-center text-[10px] text-slate-400 max-w-xs leading-tight">
          Photos & screenshots cannot be reused. Once scanned, token is immediately burned and replaced.
        </div>
      </div>

      {/* Counter Simulation Actions */}
      <div className="w-full max-w-md mt-4 space-y-2">
        <button
          onClick={handleSimulateScan}
          disabled={loading || !qrData?.token}
          className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300" />
          <span>Simulate Customer Scan (Test Instant Rotation)</span>
        </button>

        {scanResult && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-300 text-xs font-semibold text-center animate-fade-in flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>{scanResult}</span>
          </div>
        )}
      </div>
    </div>
  );
};
