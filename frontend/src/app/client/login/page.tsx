'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import {
  Store,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  QrCode,
  TrendingUp,
  AlertCircle,
  Building,
  KeyRound,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';

function MerchantLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Status banners from URL
  const [verifiedBanner, setVerifiedBanner] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Reset password step (optional in-modal quick reset)
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  // Resend verification state if unverified
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [resendVerificationMsg, setResendVerificationMsg] = useState<string | null>(null);

  useEffect(() => {
    // Purge legacy test credentials on load to ensure clean production testing
    if (typeof window !== 'undefined') {
      if (searchParams.get('verified') === 'true') {
        setVerifiedBanner(true);
        const emailParam = searchParams.get('email');
        if (emailParam) {
          setEmail(emailParam);
          setVerifiedEmail(emailParam);
        }
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setUnverifiedEmail(null);
    setResendVerificationMsg(null);

    const res = await login(email, password);
    if (res.success) {
      router.push('/client/dashboard');
    } else {
      const errMsg = res.error || 'Invalid merchant credentials';
      setError(errMsg);

      // Check if blocked due to unverified email
      if (errMsg.includes('EMAIL_NOT_VERIFIED') || errMsg.includes('pending email confirmation')) {
        setUnverifiedEmail(email);
      }
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResendingVerification(true);
    setResendVerificationMsg(null);

    try {
      const res = await api.resendMerchantVerification(unverifiedEmail);
      if (res.success) {
        setResendVerificationMsg(`Fresh verification link dispatched to ${unverifiedEmail}. Please check your inbox.`);
      } else {
        setResendVerificationMsg(res.error?.message || 'Failed to resend confirmation email.');
      }
    } catch (err: any) {
      setResendVerificationMsg(err.message || 'Failed to resend email.');
    } finally {
      setResendingVerification(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError(null);
    setForgotSuccess(null);

    try {
      const res = await api.requestPasswordReset(forgotEmail);
      if (res.success && res.data) {
        setForgotSuccess(`Password reset instructions have been sent to ${forgotEmail}.`);
        setResetToken(res.data.resetToken);
      } else {
        setForgotError(res.error?.message || 'Failed to request password reset.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'Failed to send reset instructions.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters.');
      return;
    }

    setResetLoading(true);
    setForgotError(null);

    try {
      const res = await api.resetPassword(resetToken!, newPassword);
      if (res.success) {
        setResetComplete(true);
        setTimeout(() => {
          setShowForgotModal(false);
          setResetComplete(false);
          setResetToken(null);
          setPassword(newPassword);
          setEmail(forgotEmail);
        }, 2000);
      } else {
        setForgotError(res.error?.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setForgotError(err.message || 'Failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative select-none">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/60 backdrop-blur-xl relative z-10">
        {/* Left Side: Merchant Login Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="inline-flex items-center gap-2 hover:opacity-95 transition-opacity">
                <img src="/images/logo-dark.png" alt="GoldStamp" className="h-8 w-auto object-contain" />
              </Link>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                B2B Portal
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Business Console Login</h1>
              <p className="text-xs text-slate-400 mt-1">
                Sign in to manage your digital stamp campaigns, counter QR terminals, and customer retention.
              </p>
            </div>

            {/* Email Verified Banner */}
            {verifiedBanner && (
              <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-3.5 rounded-2xl text-xs flex items-start gap-2.5 shadow-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <div className="leading-tight">
                  <span className="font-bold text-white block">Email Verified Successfully!</span>
                  <span className="text-emerald-300/90 text-[11px]">
                    Your merchant credentials are now active. Sign in below to enter your dashboard.
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                {unverifiedEmail && (
                  <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between">
                    <span className="text-[11px] text-slate-300">Need confirmation email?</span>
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendingVerification}
                      className="text-[11px] font-bold text-emerald-400 hover:underline disabled:opacity-50"
                    >
                      {resendingVerification ? 'Sending...' : 'Resend Link'}
                    </button>
                  </div>
                )}
                {resendVerificationMsg && (
                  <p className="text-[11px] text-emerald-400 mt-1">{resendVerificationMsg}</p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Business Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@yourbusiness.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotError(null);
                      setForgotSuccess(null);
                      setResetToken(null);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:underline transition"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In to Merchant Hub'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              New business?{' '}
              <Link href="/client/register" className="text-emerald-400 hover:underline font-medium">
                Register store
              </Link>
            </div>
            <div>
              <Link href="/login" className="text-slate-400 hover:text-white transition">
                Customer login →
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side: Visual Feature Showcase */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-950 p-8 sm:p-10 border-l border-slate-800 relative">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-Tenant Enterprise Security</span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                Turn occasional visitors into loyal weekly regulars.
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Replace discarded paper loyalty cards with fraud-proof dynamic QR codes, instant milestone rewards, and customer visit analytics.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">60-Second Rotating Dynamic QR</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Live millisecond anti-screenshot nonces prevent token reuse and remote fraud.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Automated Milestone Rewards</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Trigger free hours, discounts, or vouchers as soon as customers reach target stamps.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Enterprise Branch Isolation</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Connect multiple venues, arenas, or café outlets under isolated tenant security.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-6">
            © {new Date().getFullYear()} Gold Stamp Loyalty Cloud. Enterprise production ready.
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative space-y-5">
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset Account Password</h3>
                <p className="text-xs text-slate-400">Receive instructions to recover your merchant login</p>
              </div>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {resetComplete && (
              <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold block">Password Successfully Updated!</span>
                  <span>Signing you into the login form...</span>
                </div>
              </div>
            )}

            {!resetToken && !resetComplete && (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Registered Work Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="owner@yourbusiness.com"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {forgotLoading ? 'Sending...' : 'Send Password Reset Link'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {resetToken && !resetComplete && (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                  {forgotSuccess}
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {resetLoading ? 'Updating Password...' : 'Save New Password & Continue'}
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MerchantLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 text-xs">
          Loading merchant login...
        </div>
      }
    >
      <MerchantLoginContent />
    </Suspense>
  );
}
