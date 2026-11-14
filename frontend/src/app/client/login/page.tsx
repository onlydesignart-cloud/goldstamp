'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import {
  Store,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Users,
  TrendingUp,
  AlertCircle,
  Building
} from 'lucide-react';

export default function MerchantLoginPage() {
  const router = useRouter();
  const { login, switchDemoRole } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('registered') === 'true') {
        setJustRegistered(true);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(email, password);
    if (res.success) {
      router.push('/client/dashboard');
    } else {
      setError(res.error || 'Invalid merchant credentials');
      setLoading(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/60 backdrop-blur-xl">
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

            {justRegistered && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Business registered! Please sign in with your email and password.</span>
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
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
                <label className="text-xs font-medium text-slate-300 block mb-1.5">Password</label>
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

            {/* Quick Demo Fill Buttons for Testing */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-2 font-medium">Quick Demo Merchant & Staff Login:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleFillDemo('owner@smashzone.com', 'owner123')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-[11px] text-left border border-slate-700/50 transition truncate"
                >
                  <strong className="block text-white font-medium truncate">SmashZone Owner</strong>
                  <span className="text-[10px] text-slate-400">Venue Owner</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('staff@smashzone.com', 'staff123')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-[11px] text-left border border-emerald-500/30 transition truncate"
                >
                  <strong className="block text-emerald-200 font-medium truncate">Karan (Staff)</strong>
                  <span className="text-[10px] text-emerald-400/80">Counter Cashier</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFillDemo('owner@cafeartisan.com', 'owner123')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-[11px] text-left border border-slate-700/50 transition truncate"
                >
                  <strong className="block text-white font-medium truncate">Artisan Café</strong>
                  <span className="text-[10px] text-slate-400">Café Owner</span>
                </button>
              </div>
            </div>
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
                    HMAC-SHA256 signed tokens prevent photo copying and fraudulent remote check-ins.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Flexible Milestone Engines</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Configure visit-based stamps, points per spend, or referral bonuses in 6 simple steps.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Multi-Branch Architecture</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Connect multiple venues, arenas, or cafés under a single unified merchant dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 pt-6">
            © {new Date().getFullYear()} Gold Stamp SaaS Platform. High-security tenant isolation.
          </div>
        </div>
      </div>
    </div>
  );
}
