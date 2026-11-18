'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth-context';
import { api, isDisposableEmail } from '../../../lib/api';
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
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  RefreshCw,
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
  const { refreshProfile } = useAuth();

  const [step, setStep] = useState<'form' | 'verify'>('form');

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

  // OTP Verification State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Resend Cooldown Timer
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Form Validations
    if (!formData.businessName.trim() || formData.businessName.trim().length < 2) {
      setError('Please enter your business or venue name (minimum 2 characters).');
      return;
    }

    if (!formData.ownerName.trim() || formData.ownerName.trim().length < 2) {
      setError('Please enter the owner or manager full name.');
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

    // Strict validation: Reject disposable/temporary email domains
    if (isDisposableEmail(cleanEmail)) {
      setError('Temporary or disposable email addresses are not permitted. Please provide an active, permanent business or personal email address.');
      return;
    }

    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Password rules: 1 capital, 1 special character, minimum 8 characters
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
      const res = await api.sendMerchantOtp({
        businessName: formData.businessName.trim(),
        ownerName: formData.ownerName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        industry: formData.industry,
        city: formData.city.trim(),
        password: formData.password,
      });

      if (res.success && res.data) {
        setSessionId(res.data.sessionId);
        setStep('verify');
        setResendCooldown(60);
      } else {
        setError(res.error?.message || 'Failed to send verification code to your email.');
      }
    } catch (err: any) {
      setError(err?.message || 'Unable to connect to registration service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const cleanCode = otpCode.trim();
    if (cleanCode.length < 4) {
      setError('Please enter your verification code.');
      return;
    }

    if (!sessionId) {
      setError('Verification session expired. Please start over.');
      setStep('form');
      return;
    }

    setLoading(true);

    try {
      const res = await api.verifyMerchantOtp({
        sessionId,
        code: cleanCode,
      });

      if (res.success && res.data) {
        setVerificationSuccess(true);
        await refreshProfile();
        setTimeout(() => {
          router.push('/client/dashboard');
        }, 1200);
      } else {
        setError(res.error?.message || 'Incorrect verification code. Please check and try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!sessionId || resendCooldown > 0) return;
    setError(null);
    setResendSuccess(null);
    setLoading(true);

    try {
      const res = await api.resendMerchantOtp(sessionId);
      if (res.success && res.data) {
        setResendCooldown(60);
        setResendSuccess('A fresh verification code has been dispatched.');
      } else {
        setError(res.error?.message || 'Failed to resend verification code.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full mx-auto rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl bg-white p-8 sm:p-10 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-950 tracking-tight">
                {step === 'form' ? 'Register Your Business' : 'Verify Your Email Address'}
              </h1>
              <p className="text-xs text-slate-500">
                {step === 'form'
                  ? 'Launch your digital loyalty program with instant counter QR check-ins'
                  : `Enter the 4-digit verification code sent from GoldStamp Security`}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full uppercase tracking-wider">
            14-Day Free Trial
          </span>
        </div>

        {/* Global Error Banner */}
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

        {/* Success Banner */}
        {verificationSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Business account verified & activated!</p>
              <p className="text-emerald-700 mt-0.5">Redirecting to your merchant dashboard...</p>
            </div>
          </div>
        )}

        {/* Resend Notice */}
        {resendSuccess && (
          <div className="bg-sky-50 border border-sky-200 text-sky-800 p-3 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
            <span>{resendSuccess}</span>
          </div>
        )}

        {/* STEP 1: BUSINESS REGISTRATION FORM */}
        {step === 'form' && (
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Business / Venue Name
                </label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Industry Category
                </label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Owner / Manager Full Name
                </label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  City / Location
                </label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Email Address
                </label>
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
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Contact Phone / WhatsApp
                </label>
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
              {loading ? 'Validating Details...' : 'Register'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: VERIFICATION SCREEN */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>GoldStamp Security Dispatch</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                We've sent a verification code to{' '}
                <strong className="text-slate-900">{formData.email}</strong>. Enter the code below to activate your merchant account.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-2 text-center">
                Enter Verification Code (4 Digits)
              </label>
              <div className="relative max-w-sm mx-auto">
                <input
                  type="text"
                  maxLength={8}
                  required
                  autoFocus
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="0000"
                  className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-600/20 rounded-2xl py-3 text-center text-2xl font-mono font-extrabold tracking-[0.3em] text-slate-950 placeholder-slate-300 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length < 4 || verificationSuccess}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Code & Launch Console</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setError(null);
                }}
                className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={handleResendOtp}
                className="text-emerald-700 hover:underline font-bold disabled:opacity-50 disabled:no-underline"
              >
                {resendCooldown > 0 ? `Resend Code in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

        {/* Bottom Link to Login */}
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
