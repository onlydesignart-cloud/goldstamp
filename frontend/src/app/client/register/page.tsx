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
  Eye,
  EyeOff,
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

function getMailboxUrl(email: string): string {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  if (domain.includes('gmail.com')) return 'https://mail.google.com';
  if (domain.includes('outlook.com') || domain.includes('hotmail.com') || domain.includes('live.com'))
    return 'https://outlook.live.com';
  if (domain.includes('yahoo.com')) return 'https://mail.yahoo.com';
  if (domain.includes('icloud.com')) return 'https://www.icloud.com/mail';
  return `mailto:${email}`;
}

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
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email Confirmation Pending State
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    email: string;
    businessName: string;
  } | null>(null);

  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.businessName.trim() || formData.businessName.trim().length < 2) {
      setError('Please enter your business or venue name.');
      return;
    }

    if (!formData.ownerName.trim() || formData.ownerName.trim().length < 2) {
      setError('Please enter the owner or manager name.');
      return;
    }

    if (!formData.city.trim()) {
      setError('Please enter your city / location.');
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Password validation: 1 capital, 1 special character, min 8 chars
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError('Password must contain at least 1 uppercase letter (A-Z).');
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      setError('Password must contain at least 1 special character (e.g. !@#$%^&*).');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify both password fields.');
      return;
    }

    setLoading(true);

    try {
      // Register merchant with confirmation email dispatch
      const res: any = await register({
        name: formData.ownerName.trim(),
        email: cleanEmail,
        phone: formData.phone.trim(),
        password: formData.password,
        role: 'BUSINESS_OWNER',
        businessName: formData.businessName.trim(),
        industry: formData.industry,
        city: formData.city.trim(),
      });

      if (!res.success) {
        setError(res.error || 'Failed to submit merchant registration');
        setLoading(false);
        return;
      }

      if (res.pending) {
        // Confirmation link dispatched to merchant email
        setPendingConfirmation({
          email: res.email || cleanEmail,
          businessName: res.businessName || formData.businessName.trim(),
        });
        setLoading(false);
        return;
      }

      // If already verified or standard flow
      router.push('/client/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details and try again.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!pendingConfirmation?.email) return;
    setResending(true);
    setResendMsg(null);
    try {
      const res = await api.resendMerchantVerification(pendingConfirmation.email);
      if (res.success) {
        setResendMsg('A new verification email has been dispatched to your inbox.');
      } else {
        setError(res.error?.message || 'Failed to resend confirmation email.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend confirmation email.');
    } finally {
      setResending(false);
    }
  };

  // Screen 1: Email Confirmation Notice (White / Light Theme)
  if (pendingConfirmation) {
    const mailboxUrl = getMailboxUrl(pendingConfirmation.email);

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative select-none">
        <div className="max-w-md w-full mx-auto relative z-10">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 hover:opacity-95 transition-opacity">
              <img src="/images/logo.png" alt="GoldStamp" className="h-8 w-auto object-contain mx-auto" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl text-center space-y-6">
            <div className="relative inline-flex">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
                <Mail className="w-8 h-8" />
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5" /> Verification Required
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Sent a verification link to your mail
              </h1>
              <p className="text-xs text-slate-500 mt-2">
                We have sent an authentication verification link to:
              </p>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold text-emerald-700 my-2 break-all">
                {pendingConfirmation.email}
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Go to your mail and verify it to activate your merchant account.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 text-left space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-1.5 text-slate-900 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero-Trust Credential Security</span>
              </div>
              <p>
                Your merchant credentials and console access will be activated once you click the confirmation link in your email.
              </p>
            </div>

            {/* Direct action to open email app / webmail */}
            <div className="space-y-3 pt-2">
              <a
                href={mailboxUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Go to Mail & Open Inbox</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <Link
                href="/client/login"
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center justify-center gap-2"
              >
                <span>Back to Merchant Login</span>
              </Link>
            </div>

            {resendMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                {resendMsg}
              </div>
            )}

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px]">Didn't get the email?</span>
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-emerald-700 hover:underline font-semibold disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend verification link'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Screen 2: Standard Merchant Registration Form (White / Light Theme)
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-white p-8 sm:p-10 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-950 tracking-tight">Register Your Business</h1>
              <p className="text-xs text-slate-500">Launch your digital loyalty program with instant counter QR check-ins</p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
            14-Day Free Trial
          </span>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-2xl text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <p>{error}</p>
              {(error.includes('already registered') || error.includes('already exists')) && (
                <Link
                  href="/client/login"
                  className="inline-flex items-center gap-1 font-bold text-rose-900 underline underline-offset-2 mt-1 hover:text-rose-950"
                >
                  <span>Sign in to your Merchant Console</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Business / Venue Name</label>
              <div className="relative">
                <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="e.g. Apex Sports Arena"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Industry Category</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 transition"
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind} className="bg-white text-slate-900">
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Owner / Manager Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="e.g. Rohan Mehta"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">City / Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Mumbai, Bengaluru"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="owner@yourvenue.com"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Contact Phone / WhatsApp</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition"
                />
              </div>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create secure password"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-tight">
                Must be at least 8 characters with 1 capital and 1 special character.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Re-enter password"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {loading ? 'Creating Account...' : 'Register'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 text-center text-xs text-slate-600">
          Already registered ?{' '}
          <Link href="/client/login" className="text-emerald-700 hover:underline font-bold">
            Signin to your Merchant Console
          </Link>
        </div>
      </div>
    </div>
  );
}
