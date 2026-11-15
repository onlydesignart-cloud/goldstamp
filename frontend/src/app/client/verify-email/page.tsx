'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import {
  CheckCircle2,
  AlertCircle,
  Mail,
  ArrowRight,
  RefreshCw,
  Building,
  Store,
  ShieldCheck,
} from 'lucide-react';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [merchantData, setMerchantData] = useState<{ email: string; businessName: string } | null>(null);

  // Resend state
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setVerifying(false);
        setError('No verification token provided in the link. Please open the confirmation link sent to your email.');
        return;
      }

      try {
        const res = await api.verifyMerchantEmail(token);
        if (res.success && res.data) {
          setSuccess(true);
          setMerchantData({
            email: res.data.user?.email || '',
            businessName: res.data.business?.name || 'Your Business',
          });
          // Auto redirect after 3.5 seconds
          setTimeout(() => {
            router.push(`/client/login?verified=true&email=${encodeURIComponent(res.data.user?.email || '')}`);
          }, 3500);
        } else {
          setError(res.error?.message || 'Verification link is invalid or has expired.');
        }
      } catch (err: any) {
        setError(err.message || 'Verification failed. Link may have expired.');
      } finally {
        setVerifying(false);
      }
    }

    verify();
  }, [token, router]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResending(true);
    setResendSuccess(null);
    setError(null);

    try {
      const res = await api.resendMerchantVerification(resendEmail);
      if (res.success && res.data) {
        setResendSuccess(`A fresh verification link has been sent to ${resendEmail}.`);
      } else {
        setError(res.error?.message || 'Failed to resend confirmation email.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative select-none">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-md w-full mx-auto relative z-10">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-95 transition-opacity">
            <img src="/images/logo-dark.png" alt="GoldStamp" className="h-8 w-auto object-contain mx-auto" />
          </Link>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl text-center">
          {verifying && (
            <div className="space-y-4 py-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-white">Authenticating Merchant Email</h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Validating cryptographic verification token and activating merchant credentials...
              </p>
            </div>
          )}

          {!verifying && success && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Email Verified & Authenticated
                </span>
                <h1 className="text-2xl font-black text-white tracking-tight">Merchant Account Activated!</h1>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Your credentials and loyalty console for{' '}
                  <strong className="text-white font-semibold">{merchantData?.businessName}</strong> are now fully
                  activated.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <span className="text-slate-400">Authenticated Email:</span>
                <span className="font-semibold text-emerald-300 truncate max-w-[200px]">{merchantData?.email}</span>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href={`/client/login?verified=true&email=${encodeURIComponent(merchantData?.email || '')}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
                >
                  <span>Proceed to Merchant Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <p className="text-[11px] text-slate-500">Redirecting automatically in a few seconds...</p>
              </div>
            </div>
          )}

          {!verifying && error && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-9 h-9" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-white">Confirmation Link Issue</h1>
                <p className="text-xs text-rose-400/90 mt-1.5 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
                  {error}
                </p>
              </div>

              {resendSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 text-left">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{resendSuccess}</span>
                </div>
              )}

              {/* Resend link form */}
              <form onSubmit={handleResend} className="space-y-3 pt-2 text-left">
                <label className="text-[11px] font-medium text-slate-300 block">
                  Request Fresh Confirmation Link
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter registered merchant email"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resending}
                  className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resending ? 'Sending Link...' : 'Resend Confirmation Email'}
                </button>
              </form>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <Link href="/client/register" className="text-emerald-400 hover:underline">
                  ← Register again
                </Link>
                <Link href="/client/login" className="hover:text-white transition">
                  Merchant Login →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
          Loading verification portal...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
