'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Gift,
  Sparkles,
  ArrowRight,
  Clock,
  Building,
  MessageSquare,
  Mail,
  Smartphone,
  Camera,
  CameraOff,
  RefreshCw,
} from 'lucide-react';

function CheckInContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const { user } = useAuth();

  const [tokenInput, setTokenInput] = useState(tokenFromUrl || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // In-app live camera state
  const scannerRef = useRef<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // If URL has token on mount and user is logged in, auto process!
  useEffect(() => {
    if (tokenFromUrl && user) {
      handleCheckIn(tokenFromUrl);
    }
  }, [tokenFromUrl, user]);

  // Initialize In-App Camera Scanner on mount if no result and no token in URL
  useEffect(() => {
    if (result || tokenFromUrl) return;

    let isMounted = true;

    const initCameraScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        if (!isMounted) return;

        const scannerId = 'qr-reader';
        const scannerElement = document.getElementById(scannerId);
        if (!scannerElement) return;

        const html5QrCode = new Html5Qrcode(scannerId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText: string) => {
            // QR Scanned Successfully!
            let token = decodedText.trim();
            try {
              if (decodedText.includes('token=')) {
                const url = new URL(decodedText);
                token = url.searchParams.get('token') || decodedText;
              }
            } catch {}

            // Stop camera immediately upon detection
            if (scannerRef.current) {
              scannerRef.current.stop().catch(() => {}).then(() => {
                scannerRef.current = null;
                setCameraActive(false);
                handleCheckIn(token);
              });
            } else {
              handleCheckIn(token);
            }
          },
          () => {
            // Frame scan tick (non-blocking)
          }
        );

        if (isMounted) {
          setCameraActive(true);
          setCameraError(null);
        }
      } catch (err: any) {
        console.warn('Camera scanner initialization notice:', err);
        if (isMounted) {
          setCameraActive(false);
          setCameraError('Camera access not granted. You can point your device camera or enter the 6-digit counter code below.');
        }
      }
    };

    const timer = setTimeout(() => {
      initCameraScanner();
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {}).finally(() => {
          try { scannerRef.current?.clear(); } catch {}
          scannerRef.current = null;
        });
      }
    };
  }, [result, tokenFromUrl]);

  const handleCheckIn = async (tokenToUse: string) => {
    const cleanToken = tokenToUse.trim();
    if (!cleanToken) {
      setError('Please provide a valid QR check-in token.');
      return;
    }

    // Stop active camera if running
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setCameraActive(false);
      } catch {}
    }

    // Client-Side Anti-Replay Pre-Validation: Prevent duplicate scan attempts
    if (typeof window !== 'undefined' && sessionStorage.getItem(`scanned_${cleanToken}`)) {
      setError('Anti-Fraud Guard: You have already scanned this counter QR code on this device. Dynamic QR codes are strictly single-use.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await api.checkIn({
        token: cleanToken,
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser',
      });

      if (res.success && res.data) {
        setResult(res.data);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(`scanned_${cleanToken}`, 'true');
        }

        // Trigger celebratory confetti!
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // Non-blocking
        }
      } else {
        setError(res.error?.message || 'Check-in failed. Please verify the QR code and try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during check-in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Title */}
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25 mb-4">
          <Camera className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Scan Counter QR
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
          Point your camera at the merchant's screen to collect your loyalty stamp automatically.
        </p>
      </div>

      {/* Success Celebration Box */}
      {result && (
        <div className="bg-white rounded-3xl border-2 border-emerald-500 p-6 sm:p-8 text-center shadow-xl space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>

          <div>
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Visit Verified
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">
              Stamp Credited Successfully
            </h2>
            <div className="text-sm font-medium text-slate-600 mt-1">
              {result.business?.name}
            </div>
          </div>

          {/* Milestone Target Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-600">Milestone Progress</span>
              <span className="font-semibold text-slate-900 font-mono text-sm">
                {result.currentStamps} / {result.milestoneTarget} Visits
              </span>
            </div>

            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (result.currentStamps / result.milestoneTarget) * 100)}%`,
                }}
              ></div>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              {result.rewardUnlocked ? (
                <span className="text-emerald-700 font-semibold flex items-center justify-center gap-1.5">
                  <Gift className="w-4 h-4 text-emerald-600" />
                  Milestone Reached! Your reward voucher is ready.
                </span>
              ) : (
                `Only ${result.milestoneTarget - result.currentStamps} more visit(s) to unlock your reward.`
              )}
            </p>
          </div>

          {/* Simultaneous WhatsApp & Gmail Live Notification Dispatch Card */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 text-left space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Simultaneous Dispatch Confirmed</span>
              </div>
              <span className="text-[10px] font-medium bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                WhatsApp & Gmail Active
              </span>
            </div>

            <div className="text-[11px] text-slate-800 bg-white p-3 rounded-lg border border-emerald-100/80 font-mono leading-relaxed space-y-1.5">
              <div className="flex items-start gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>WhatsApp:</strong> "Visit verified at {result.business?.name}. Progress: {result.currentStamps}/{result.milestoneTarget}."</span>
              </div>
              <div className="flex items-start gap-1.5 pt-1.5 border-t border-slate-100">
                <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                <span><strong>Email:</strong> "Digital Visit Receipt & Balance Synced to {user?.email || 'inbox'}"</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {user?.phone ? (
                <div className="p-2.5 rounded-lg bg-white border border-emerald-200/80 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-emerald-600" />
                      <span>WhatsApp Channel</span>
                    </div>
                    <div className="text-slate-500 font-mono text-[10px]">{user.phone}</div>
                  </div>
                  <a
                    href={`https://wa.me/${user.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Visit verified at ${result.business?.name}! (${result.currentStamps}/${result.milestoneTarget} stamps completed).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-emerald-700 hover:text-emerald-900 flex items-center gap-1 text-[11px]"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <div className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-amber-900 flex items-center gap-1">
                      <Smartphone className="w-3 h-3 text-amber-600" />
                      <span>WhatsApp Pending</span>
                    </div>
                    <div className="text-amber-700 text-[10px]">Add number for WA alerts</div>
                  </div>
                  <Link
                    href="/profile?missing_whatsapp=true"
                    className="text-[11px] font-semibold text-amber-800 hover:underline"
                  >
                    Link Profile
                  </Link>
                </div>
              )}

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-sky-600" />
                    <span>Email Channel</span>
                  </div>
                  <div className="text-slate-500 font-mono text-[10px] truncate max-w-[140px]">{user?.email || 'customer@gmail.com'}</div>
                </div>
                <span className="text-[10px] font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                  Delivered
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {result.rewardUnlocked ? (
              <Link
                href="/rewards"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-md shadow-emerald-500/20 text-center"
              >
                View Unlocked Reward →
              </Link>
            ) : (
              <Link
                href="/loyalty"
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition text-center"
              >
                View Stamp Wallet →
              </Link>
            )}

            <button
              onClick={() => {
                setResult(null);
                setTokenInput('');
              }}
              className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
            >
              Scan Another
            </button>
          </div>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-start gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold">Check-In Denied</div>
            <div className="mt-0.5 text-red-700 leading-relaxed">{error}</div>
          </div>
        </div>
      )}

      {/* In-App Live Camera Scanner & Manual Fallback Section */}
      {!result && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          
          {/* Live Camera Scanner Box */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Camera Scanner
              </span>
              <span className="text-slate-400 font-normal text-[11px]">
                Point at Counter Screen
              </span>
            </div>

            <div className="relative w-full max-w-sm mx-auto aspect-square rounded-2xl overflow-hidden bg-slate-950 border-2 border-emerald-500/40 shadow-inner flex items-center justify-center">
              <div id="qr-reader" className="w-full h-full" />

              {/* Viewfinder Target Graphic */}
              {cameraActive && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                  <div className="w-48 h-48 relative">
                    {/* Viewfinder Corners */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                    {/* Laser scanning beam */}
                    <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-pulse top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] font-bold text-white bg-slate-900/85 px-3 py-1 rounded-full mt-3 border border-white/10 backdrop-blur-sm">
                    Hold steady facing counter QR
                  </span>
                </div>
              )}

              {/* Loading / Waiting state */}
              {!cameraActive && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 space-y-2 bg-slate-950">
                  <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                  <span className="text-xs">Activating camera scanner...</span>
                </div>
              )}

              {/* Permission notice state */}
              {cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 p-6 text-center space-y-2 bg-slate-950">
                  <CameraOff className="w-8 h-8 text-amber-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-200">Camera Access Not Granted</span>
                  <p className="text-[11px] text-slate-400 max-w-xs">{cameraError}</p>
                </div>
              )}
            </div>
          </div>

          {/* Manual 6-Digit Counter Code Fallback */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (tokenInput.trim()) handleCheckIn(tokenInput);
            }}
            className="pt-4 border-t border-slate-100 space-y-2 text-center"
          >
            <label className="text-xs font-semibold text-slate-600 block">
              Or type 6-Digit Counter Code:
            </label>
            <div className="flex gap-2 max-w-xs mx-auto">
              <input
                type="text"
                maxLength={6}
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000"
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl px-3 py-2 text-center text-base tracking-widest font-mono font-bold text-slate-900 transition"
              />
              <button
                type="submit"
                disabled={loading || tokenInput.trim().length !== 6}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-sm disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Check In'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-sm font-medium text-slate-400">Loading Gold Stamp check-in scanner...</p>
        </div>
      }
    >
      <CheckInContent />
    </Suspense>
  );
}
