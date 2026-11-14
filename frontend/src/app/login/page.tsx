'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import {
  Award,
  Mail,
  Lock,
  Phone,
  AlertCircle,
  ArrowRight,
  Store,
  CheckCircle2,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Send,
  Zap,
} from 'lucide-react';

export default function CustomerLoginPage() {
  const router = useRouter();
  const { login, loginWithWhatsApp, loginWithGoogle } = useAuth();

  // Mode: 'whatsapp' | 'google' | 'email'
  const [authMode, setAuthMode] = useState<'whatsapp' | 'google' | 'email'>('whatsapp');

  // WhatsApp Flow State
  const [phone, setPhone] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('4820');
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>(null);

  // Google Flow State
  const [googleEmail, setGoogleEmail] = useState('alex.morgan@gmail.com');
  const [googleName, setGoogleName] = useState('Alex Morgan');

  // Email Flow State
  const [email, setEmail] = useState('alex@example.com');
  const [password, setPassword] = useState('customer123');

  // General State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);
  const [whatsappToast, setWhatsappToast] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('registered') === 'true') {
        setJustRegistered(true);
      }
      const mode = params.get('mode');
      if (mode === 'google') setAuthMode('google');
      if (mode === 'email') setAuthMode('email');
    }
  }, []);

  // 1. WhatsApp Handler
  const handleSendWhatsAppOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setOtp('4820');
      setDemoCodeHint('4820');
      setLoading(false);
      setWhatsappToast(`Verification code 4820 sent to WhatsApp (+91 ${clean})`);
      setTimeout(() => setWhatsappToast(null), 5000);
    }, 400);
  };

  const handleVerifyWhatsApp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter the 4-digit code sent to your WhatsApp');
      return;
    }
    setLoading(true);
    setError(null);

    const fullPhone = phone.startsWith('+') ? phone : `+91 ${phone}`;
    const res = await loginWithWhatsApp(fullPhone, otp);
    if (res.success) {
      router.push('/loyalty');
    } else {
      setError(res.error || 'Failed to verify WhatsApp code');
      setLoading(false);
    }
  };

  // 2. Google / Gmail Handler
  const handleGoogleSignIn = async (customEmail?: string) => {
    setLoading(true);
    setError(null);
    const targetEmail = customEmail || googleEmail;
    const res = await loginWithGoogle({
      email: targetEmail,
      name: googleName || 'Google User',
    });
    if (res.success) {
      router.push('/profile?missing_whatsapp=true');
    } else {
      setError(res.error || 'Google Sign-In failed');
      setLoading(false);
    }
  };

  // 3. Classic Email Handler
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password);
    if (res.success) {
      router.push('/loyalty');
    } else {
      setError(res.error || 'Invalid customer credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full mx-auto space-y-5">
        {/* Merchant Redirect Banner */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Are you a business owner?</span>
          </div>
          <Link
            href="/client/login"
            className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
          >
            <span>Merchant Portal</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
            <img
              src="/images/logo.png"
              alt="GoldStamp"
              className="h-11 w-auto mx-auto object-contain"
            />
          </Link>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Customer Quick Sign In</h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Zero friction! Sign in with your WhatsApp number or Gmail to receive instant stamp updates & discount vouchers.
          </p>
        </div>

        {/* Live Notification Floating Toast */}
        {whatsappToast && (
          <div className="bg-emerald-950 text-emerald-200 p-3 rounded-2xl text-xs flex items-center gap-2 border border-emerald-800 shadow-lg animate-in slide-in-from-top-2">
            <MessageSquare className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{whatsappToast}</span>
          </div>
        )}

        {/* Main Auth Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
          {/* Auth Method Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setAuthMode('whatsapp');
                setError(null);
              }}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authMode === 'whatsapp'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('google');
                setError(null);
              }}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authMode === 'google'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('email');
                setError(null);
              }}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authMode === 'email'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Password</span>
            </button>
          </div>

          {justRegistered && (
            <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-2xl text-xs flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Account created! Sign in below to access your card.</span>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 text-rose-700 p-3 rounded-2xl text-xs flex items-center gap-2 border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: WHATSAPP INSTANT LOGIN */}
          {authMode === 'whatsapp' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-[11px] text-emerald-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-950">Fastest Sign In (No password required)</span>
                  <p className="text-emerald-800/90 mt-0.5">
                    We will send stamp confirmations and reward vouchers directly to your WhatsApp!
                  </p>
                </div>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendWhatsAppOtp} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      WhatsApp Mobile Number
                    </label>
                    <div className="relative flex">
                      <div className="bg-slate-100 border border-slate-200 border-r-0 rounded-l-xl px-3 py-2.5 text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span>🇮🇳 +91</span>
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="98765 43210"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded-r-xl px-3.5 py-2.5 text-xs text-slate-900 font-medium placeholder-slate-400 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Sending Code...' : 'Get Instant WhatsApp Code'}
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  {/* 1-Tap Quick Fill Demo */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPhone('9876543210');
                        handleSendWhatsAppOtp();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>One-Tap Demo: Auto-Fill + Send Code (+91 98765 43210)</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyWhatsApp} className="space-y-3.5 animate-in fade-in duration-200">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-slate-700">Enter 4-Digit Code</label>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[11px] text-emerald-700 hover:underline font-semibold"
                      >
                        Change Number
                      </button>
                    </div>
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="e.g. 4820"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded-xl pl-10 pr-4 py-2.5 text-sm tracking-widest font-mono text-slate-900 transition"
                      />
                    </div>
                    {demoCodeHint && (
                      <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Demo OTP received: <strong>{demoCodeHint}</strong></span>
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Open Loyalty Wallet'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtp('4820');
                      handleVerifyWhatsApp();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-medium border border-emerald-200 transition inline-flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto-Fill Demo Code (4820)</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: 1-CLICK GOOGLE / GMAIL SIGN IN */}
          {authMode === 'google' && (
            <div className="space-y-4">
              <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3 text-[11px] text-sky-950 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sky-950">1-Click Gmail Authentication</span>
                  <p className="text-sky-800/90 mt-0.5">
                    Your loyalty stamps and coupon vouchers will automatically be linked to your Gmail inbox.
                  </p>
                </div>
              </div>

              {/* Big Google Button */}
              <button
                type="button"
                onClick={() => handleGoogleSignIn()}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white text-slate-800 font-bold text-xs shadow-xs transition flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google (Alex Morgan)</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-slate-400">
                  Or test with another Gmail
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="space-y-2">
                <input
                  type="email"
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-sky-600 focus:bg-white focus:ring-1 focus:ring-sky-600 rounded-xl px-3.5 py-2 text-xs text-slate-900 transition"
                />
                <button
                  type="button"
                  onClick={() => handleGoogleSignIn(googleEmail)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5"
                >
                  <span>Sign In with this Gmail</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: TRADITIONAL EMAIL & PASSWORD */}
          {authMode === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In with Password'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail('alex@example.com');
                  setPassword('customer123');
                  setError(null);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition"
              >
                Fill Demo Patron Credentials (Alex Rivera)
              </button>
            </form>
          )}

          {/* Footer Highlights */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              New patron?{' '}
              <Link href="/register" className="text-emerald-700 hover:underline font-bold">
                1-Click Register
              </Link>
            </div>
            <div>
              <Link href="/discover" className="text-slate-500 hover:text-slate-900 font-medium">
                Browse venues
              </Link>
            </div>
          </div>
        </div>

        {/* Feature badge */}
        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>No password required with WhatsApp & Gmail single sign-on</span>
        </div>
      </div>
    </div>
  );
}
