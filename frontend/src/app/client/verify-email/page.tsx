'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '../../../lib/api';
import { createClient } from '../../../utils/supabase/client';
import { mockStore } from '../../../lib/mockStore';
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

  useEffect(() => {
    async function verify() {
      let activeToken = token;

      if (!activeToken && typeof window !== 'undefined') {
        try {
          const supabase = createClient();
          const { data } = await supabase.auth.getUser();
          if (data?.user?.email) {
            const pending = mockStore.getPendingVerificationByEmail(data.user.email);
            if (pending) {
              activeToken = pending.verificationToken;
            }
          }
        } catch {}
      }

      if (!activeToken) {
        setVerifying(false);
        setError('Verification code authentication is now active. Please register or sign in to your Merchant Console.');
        return;
      }

      try {
        const res = await api.verifyMerchantEmail(activeToken);
        if (res.success && res.data) {
          setSuccess(true);
          setMerchantData({
            email: res.data.user?.email || '',
            businessName: res.data.business?.name || 'Your Business',
          });
          setTimeout(() => {
            router.push(`/client/login?verified=true&email=${encodeURIComponent(res.data.user?.email || '')}`);
          }, 2500);
        } else {
          setError(res.error?.message || 'Verification link is invalid or has expired.');
        }
      } catch (err: any) {
        setError('Verification code authentication is now active. Please register or sign in.');
      } finally {
        setVerifying(false);
      }
    }

    verify();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative select-none">
      <div className="max-w-md w-full mx-auto relative z-10">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-95 transition-opacity">
            <img src="/images/logo.png" alt="GoldStamp" className="h-8 w-auto object-contain mx-auto" />
          </Link>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6">
          {verifying && (
            <div className="space-y-4 py-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto animate-pulse">
                <RefreshCw className="w-8 h-8 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Authenticating Merchant Email</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Validating verification credentials...
              </p>
            </div>
          )}

          {!verifying && success && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> Email Verified
                </span>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Merchant Account Activated!</h1>
                <p className="text-xs text-slate-500 mt-2">
                  Welcome aboard, <strong className="text-slate-800">{merchantData?.businessName}</strong>.
                </p>
              </div>

              <Link
                href="/client/login"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Continue to Merchant Login</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {!verifying && !success && (
            <div className="space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900">Direct Verification Active</h1>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  GoldStamp now uses instant 6-digit authentication codes directly during registration instead of confirmation links.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href="/client/register"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>Register Your Business</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/client/login"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center justify-center gap-2"
                >
                  <span>Merchant Login</span>
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
          Loading verification portal...
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
