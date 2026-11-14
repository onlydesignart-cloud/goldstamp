'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import {
  Award,
  Mail,
  Lock,
  User,
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

export default function CustomerRegisterPage() {
  const router = useRouter();
  const { register, loginWithWhatsApp, loginWithGoogle } = useAuth();

  // Mode: 'whatsapp' | 'google' | 'form'
  const [authMode, setAuthMode] = useState<'whatsapp' | 'google' | 'form'>('whatsapp');

  // WhatsApp Onboarding
  const [phone, setPhone] = useState('9876543210');
  const [name, setName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('4820');

  // Google Onboarding
  const [googleEmail, setGoogleEmail] = useState('newcustomer@gmail.com');
  const [googleName, setGoogleName] = useState('Loyal Patron');

  // Full Form Onboarding
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. WhatsApp Instant Onboarding
  const handleSendWhatsApp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = phone.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setError('Please enter a valid 10-digit WhatsApp number');
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setOtp('4820');
      setLoading(false);
    }, 400);
  };

  const handleVerifyWhatsApp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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

  // 2. Google Instant Onboarding
  const handleGoogleSignUp = async () => {
    setLoading(true);
    setError(null);
    const res = await loginWithGoogle({
      email: googleEmail,
      name: googleName || 'Google Patron',
    });
    if (res.success) {
      router.push('/profile?missing_whatsapp=true');
    } else {
      setError(res.error || 'Google enrollment failed');
      setLoading(false);
    }
  };

  // 3. Full Traditional Form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      password: formData.password,
      role: 'CUSTOMER',
    });

    if (res.success) {
      router.push('/login?registered=true');
    } else {
      setError(res.error || 'Failed to create customer account');
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
            <span>Own a café, arena, or salon?</span>
          </div>
          <Link
            href="/client/register"
            className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
          >
            <span>Register Store</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Card Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/20">
            <Award className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Instant Customer Signup</h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Collect stamps and get discount vouchers sent straight to your WhatsApp or Gmail!
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
          {/* Method Tabs */}
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
                setAuthMode('form');
                setError(null);
              }}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                authMode === 'form'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Full Form</span>
            </button>
          </div>

          {error && (
            <div className="bg-rose-50 text-rose-700 p-3 rounded-2xl text-xs flex items-center gap-2 border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: WHATSAPP INSTANT ENROLLMENT */}
          {authMode === 'whatsapp' && (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 text-[11px] text-emerald-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-950">Zero Typing, Instant Loyalty Card</span>
                  <p className="text-emerald-800/90 mt-0.5">
                    Enter your WhatsApp number to immediately start earning stamps and receiving free vouchers!
                  </p>
                </div>
              </div>

              {!otpSent ? (
                <form onSubmit={handleSendWhatsApp} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Your WhatsApp Number
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
                    {loading ? 'Creating Wallet...' : 'Continue with WhatsApp'}
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPhone('9876543210');
                      handleSendWhatsApp();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium transition inline-flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-3.5 h-3.5 text-slate-500" />
                    <span>Demo Phone: (+91 98765 43210)</span>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyWhatsApp} className="space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Enter 4-Digit Code Sent to WhatsApp
                    </label>
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="4820"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded-xl pl-10 pr-4 py-2.5 text-sm tracking-widest font-mono text-slate-900 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Creating Profile...' : 'Complete & Open Wallet'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: GOOGLE 1-CLICK */}
          {authMode === 'google' && (
            <div className="space-y-4">
              <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-3 text-[11px] text-sky-950 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-sky-950">1-Tap Registration via Gmail</span>
                  <p className="text-sky-800/90 mt-0.5">
                    Automatic profile creation. Your digital stamps and rewards will be linked to your Gmail account.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignUp}
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
                <span>{loading ? 'Connecting...' : 'Sign up with Google'}</span>
              </button>
            </div>
          )}

          {/* TAB 3: FULL FORM */}
          {authMode === 'form' && (
            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Your Name"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile Phone (WhatsApp)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
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
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* Footer Highlights */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-700 hover:underline font-bold">
                Sign in
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
          <span>One single pass works at all sports arenas, cafes & salons</span>
        </div>
      </div>
    </div>
  );
}
