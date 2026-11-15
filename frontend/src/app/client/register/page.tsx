'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import {
  Store,
  Mail,
  Lock,
  User,
  Phone,
  Building,
  MapPin,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Send,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';

const INDUSTRIES = [
  'Pickleball Arena',
  'Specialty Café & Bakery',
  'Box Cricket Arena',
  'Salon & Luxury Spa',
  'Boutique Gym & Fitness',
  'Gaming Zone & Esports',
  'Car Wash & Detailing',
  'Restaurant & Bistro',
  'Entertainment Venue',
  'Other Local Commerce',
];

export default function MerchantRegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    industry: 'Pickleball Arena',
    city: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email Confirmation Pending State
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    email: string;
    verificationToken: string;
    businessName: string;
  } | null>(null);

  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Register merchant with strict email confirmation requirement
      const res: any = await register({
        name: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'BUSINESS_OWNER',
        businessName: formData.businessName,
        industry: formData.industry,
        city: formData.city,
      });

      if (!res.success) {
        setError(res.error || 'Failed to submit merchant registration');
        setLoading(false);
        return;
      }

      if (res.pending) {
        // Zero credentials stored until email confirmation
        setPendingConfirmation({
          email: res.email || formData.email,
          verificationToken: res.verificationToken,
          businessName: res.businessName || formData.businessName,
        });
        setLoading(false);
        return;
      }

      // If already verified or standard flow
      router.push('/client/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingConfirmation?.email) return;
    setResending(true);
    setResendMsg(null);
    try {
      const res = await api.resendMerchantVerification(pendingConfirmation.email);
      if (res.success && res.data) {
        setPendingConfirmation((prev) =>
          prev ? { ...prev, verificationToken: res.data.verificationToken } : null
        );
        setResendMsg('A new confirmation email has been dispatched to your inbox.');
      } else {
        setError(res.error?.message || 'Failed to resend confirmation email.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation email.');
    } finally {
      setResending(false);
    }
  };

  const handleCopyLink = () => {
    if (!pendingConfirmation?.verificationToken) return;
    const url = `${window.location.origin}/client/verify-email?token=${pendingConfirmation.verificationToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Screen 1: Email Confirmation Pending Screen
  if (pendingConfirmation) {
    const verifyUrl = `/client/verify-email?token=${pendingConfirmation.verificationToken}`;

    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative select-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-md w-full mx-auto relative z-10">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 hover:opacity-95 transition-opacity">
              <img src="/images/logo-dark.png" alt="GoldStamp" className="h-8 w-auto object-contain mx-auto" />
            </Link>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl backdrop-blur-xl text-center space-y-6">
            <div className="relative inline-flex">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <Mail className="w-8 h-8" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                ✓
              </span>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Authentication Pending
              </span>
              <h1 className="text-2xl font-black text-white tracking-tight">Confirm Your Work Email</h1>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                We have sent an authentication verification link to:
                <strong className="block text-emerald-300 font-semibold text-sm mt-1">
                  {pendingConfirmation.email}
                </strong>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 text-left space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero-Trust Credential Security</span>
              </div>
              <p>
                To protect store data and prevent unauthorized accounts, your merchant credentials and dashboard access
                remain locked until your email is confirmed.
              </p>
            </div>

            {/* Quick action: Open confirmation link */}
            <div className="space-y-3 pt-2">
              <Link
                href={verifyUrl}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
              >
                <span>Click Here to Verify Email</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 text-xs font-medium border border-slate-700/60 transition flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Verification URL'}</span>
              </button>
            </div>

            {resendMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                {resendMsg}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-emerald-400 hover:underline disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend Email'}
              </button>
              <Link href="/client/login" className="hover:text-white transition">
                Return to Login →
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Screen 2: Standard Merchant Registration Form
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900/70 backdrop-blur-xl p-8 sm:p-10 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Register Your Business</h1>
              <p className="text-xs text-slate-400">Launch your digital loyalty program with authenticated email confirmation</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider">
            14-Day Free Trial
          </span>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Business / Venue Name</label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g. SmashZone Sports Arena"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Industry Category</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white transition"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind} className="bg-slate-900 text-white">
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Owner / Manager Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="e.g. Rohan Mehta"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">City / Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Mumbai, Bengaluru"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Work Email <span className="text-emerald-400 font-normal">(Confirmation required)</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="owner@yourvenue.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">Contact Phone / WhatsApp</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">Create Secure Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 6 characters"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 transition"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Email Confirmation Process:</span>
            </div>
            <p>
              After submission, we will send an authentication confirmation link to your email. Your account credentials
              will be activated only after email verification.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Creating Pending Registration...' : 'Register & Send Confirmation Email'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
          Already registered and verified?{' '}
          <Link href="/client/login" className="text-emerald-400 hover:underline font-medium">
            Sign in to your merchant console
          </Link>
        </div>
      </div>
    </div>
  );
}
