'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { RefreshCw, Maximize2, Minimize2, ShieldCheck, Clock, ExternalLink, Zap } from 'lucide-react';

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
        setScanResult(`Visit verified: +1 stamp credited to ${custName} (${stamps}/${target} visits)`);
        setTimeout(() => setScanResult(null), 5000);
      } else {
        setScanResult(res.error?.message || 'Check-in failed');
        setTimeout(() => setScanResult(null), 5000);
      }
    } catch (e: any) {
      setScanResult(e.message || 'Error simulating check-in');
      setTimeout(() => setScanResult(null), 4000);
    }
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

  useEffect(() => {
    fetchNewQr();
  }, [businessId, branchId, campaignId]);

  // Countdown timer: when it hits 0, auto-regenerate fresh short-lived QR code!
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
      className={`bg-white rounded-2xl border border-slate-200 transition-all ${
        isFullScreen
          ? 'fixed inset-0 z-50 p-8 flex flex-col items-center justify-center bg-white/95 backdrop-blur-xl'
          : 'p-6 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between w-full max-w-md mb-4">
        <div>
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Dynamic Anti-Fraud QR
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-0.5">{businessName}</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchNewQr}
            disabled={loading}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition disabled:opacity-50"
            title="Refresh QR manually"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsFullScreen(!isFullScreen)}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title={isFullScreen ? 'Exit Kiosk Mode' : 'Kiosk Full Screen Mode'}
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* QR Code Canvas / Image Display */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 flex flex-col items-center justify-center relative w-full max-w-md">
        {qrData?.qrDataUrl ? (
          <div className="relative group">
            <img
              src={qrData.qrDataUrl}
              alt="Check-In QR"
              className="w-64 h-64 sm:w-72 sm:h-72 rounded-xl shadow-md border-4 border-white bg-white"
            />
            {/* Center Logo watermarking effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-xl bg-slate-950/90 text-white flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white">
                STAMP
              </div>
            </div>
          </div>
        ) : (
          <div className="w-64 h-64 flex items-center justify-center text-slate-400 text-sm">
            Generating Secure Token...
          </div>
        )}

        {/* Live Expiration Countdown Indicator */}
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-200/70 text-slate-700">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>
            Refreshes in: <strong className="text-emerald-700 font-mono">{secondsRemaining}s</strong>
          </span>
        </div>
      </div>

      <div className="mt-4 text-center max-w-sm">
        <p className="text-xs text-slate-500">
          Customers scan with their phone camera to automatically verify their visit, record stamps, and progress toward rewards.
        </p>

        {/* 1-Click Scan Simulator for easy developer & owner testing */}
        <div className="mt-3 space-y-2">
          {qrData?.token && (
            <button
              onClick={handleSimulateScan}
              className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition active:scale-[0.99] flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Scan for {activeCustomerName} (+1 Stamp)</span>
            </button>
          )}

          {scanResult && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 animate-in fade-in">
              {scanResult}
            </div>
          )}

          {qrData?.checkInUrl && (
            <div>
              <a
                href={qrData.checkInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-600 font-medium underline"
              >
                Open Customer Check-In Link <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>Cryptographically signed with 60-second HMAC expiry</span>
      </div>
    </div>
  );
};
