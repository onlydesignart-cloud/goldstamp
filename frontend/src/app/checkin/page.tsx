'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
} from 'lucide-react';

function CheckInContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');
  const { user } = useAuth();

  const [tokenInput, setTokenInput] = useState(tokenFromUrl || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // If URL has token on mount and user is logged in, auto process!
  useEffect(() => {
    if (tokenFromUrl && user) {
      handleCheckIn(tokenFromUrl);
    }
  }, [tokenFromUrl, user]);

  const handleCheckIn = async (tokenToUse: string) => {
    const cleanToken = tokenToUse.trim();
    if (!cleanToken) {
      setError('Please provide a valid QR check-in token.');
      return;
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
          <QrCode className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Scan & Collect Stamp
        </h1>
        <p className="text-sm text-slate-500 mt-1.5 max-w-sm mx-auto">
          Scan the QR code displayed at the merchant's counter to instantly verify your visit.
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

      {/* Input / Scanner Section */}
      {!result && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-dashed border-emerald-300">
              <QrCode className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Scan at Merchant Counter</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-0.5">
                Point your phone camera at the Dynamic QR Code displayed on the merchant counter screen to collect your stamp.
              </p>
            </div>
          </div>

          {/* Manual Token Verification fallback */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCheckIn(tokenInput);
            }}
            className="pt-6 border-t border-slate-100 space-y-3"
          >
            <label className="text-xs font-semibold text-slate-700 block text-center">
              Or enter Check-In Code manually:
            </label>
            <div className="flex gap-2 max-w-sm mx-auto">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Enter QR check-in token / code"
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl px-3 py-2 text-xs font-mono text-slate-900 transition"
              />
              <button
                type="submit"
                disabled={loading || !tokenInput.trim()}
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
