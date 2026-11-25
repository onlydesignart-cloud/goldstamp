'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { api, isDisposableEmail } from '../lib/api';
import {
  Store,
  UserPlus,
  Mail,
  Lock,
  User,
  Phone,
  Building,
  MapPin,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  ArrowLeft,
  RefreshCw,
  X,
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

interface MerchantAuthViewProps {
  initialMode?: 'login' | 'register';
}

export const MerchantAuthView: React.FC<MerchantAuthViewProps> = ({ initialMode = 'login' }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, refreshProfile } = useAuth();

  // Active Toggle: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Sync mode with URL or initialMode
  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', newMode === 'login' ? '/client/login' : '/client/register');
    }
  };

  // ----------------------------------------------------
  // LOGIN STATE
  // ----------------------------------------------------
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Verified Banner
  const [verifiedBanner, setVerifiedBanner] = useState(false);

  // Forgot Password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Resend verification state if unverified
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [resendVerificationMsg, setResendVerificationMsg] = useState<string | null>(null);

  // ----------------------------------------------------
  // REGISTER STATE
  // ----------------------------------------------------
  const [registerStep, setRegisterStep] = useState<'form' | 'verify'>('form');
  const [regData, setRegData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    industry: 'Pickleball Arena',
    city: '',
    password: '',
    confirmPassword: '',
  });

  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // OTP Verification State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // Read search params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (searchParams.get('verified') === 'true') {
        setVerifiedBanner(true);
        const emailParam = searchParams.get('email');
        if (emailParam) {
          setLoginEmail(emailParam);
        }
      }
      const remembered = localStorage.getItem('goldstamp_remember_merchant_email');
      if (remembered) {
        setLoginEmail(remembered);
        setRememberMe(true);
      }
    }
  }, [searchParams]);

  // Resend Cooldown Timer
  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // ----------------------------------------------------
  // LOGIN SUBMIT
  // ----------------------------------------------------
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    setUnverifiedEmail(null);
    setResendVerificationMsg(null);

    if (rememberMe) {
      localStorage.setItem('goldstamp_remember_merchant_email', loginEmail);
    } else {
      localStorage.removeItem('goldstamp_remember_merchant_email');
    }

    const res = await login(loginEmail, loginPassword);
    if (res.success) {
      router.push('/client/dashboard');
    } else {
      const errMsg = res.error || 'Invalid merchant credentials. Please verify your email and password.';
      setLoginError(errMsg);

      if (errMsg.includes('EMAIL_NOT_VERIFIED') || errMsg.includes('pending email confirmation')) {
        setUnverifiedEmail(loginEmail);
      }
      setLoginLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;
    setResendingVerification(true);
    setResendVerificationMsg(null);

    try {
      const res = await api.resendMerchantVerification(unverifiedEmail);
      if (res.success) {
        setResendVerificationMsg(`Verification link sent to ${unverifiedEmail}. Check your inbox.`);
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
      if (res.success) {
        setForgotSuccess('Password reset link has been dispatched to your email address.');
      } else {
        setForgotError(res.error?.message || 'Failed to send password reset link.');
      }
    } catch (err: any) {
      setForgotError(err?.message || 'An error occurred. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  // ----------------------------------------------------
  // REGISTER SUBMIT (Step 1)
  // ----------------------------------------------------
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regData.businessName.trim() || regData.businessName.trim().length < 2) {
      setRegError('Please enter your business or venue name (minimum 2 characters).');
      return;
    }

    if (!regData.ownerName.trim() || regData.ownerName.trim().length < 2) {
      setRegError('Please enter the owner or manager full name.');
      return;
    }

    if (!regData.city.trim()) {
      setRegError('Please enter your city / location.');
      return;
    }

    const cleanEmail = regData.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setRegError('Please enter a valid email address.');
      return;
    }

    if (isDisposableEmail(cleanEmail)) {
      setRegError('Temporary or disposable email addresses are not permitted. Please provide an active, permanent business email.');
      return;
    }

    const cleanPhone = regData.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setRegError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (regData.password.length < 8) {
      setRegError('Password must be at least 8 characters long.');
      return;
    }

    if (!/[A-Z]/.test(regData.password)) {
      setRegError('Password must contain at least 1 uppercase letter (A-Z).');
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(regData.password)) {
      setRegError('Password must contain at least 1 special character (e.g. !@#$%^&*).');
      return;
    }

    if (regData.password !== regData.confirmPassword) {
      setRegError('Passwords do not match. Please verify both password fields.');
      return;
    }

    setRegLoading(true);

    try {
      const res = await api.sendMerchantOtp({
        businessName: regData.businessName.trim(),
        ownerName: regData.ownerName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        industry: regData.industry,
        city: regData.city.trim(),
        password: regData.password,
      });

      if (res.success && res.data) {
        setSessionId(res.data.sessionId);
        setRegisterStep('verify');
        setResendCooldown(60);
      } else {
        setRegError(res.error?.message || 'Failed to send verification code to your email.');
      }
    } catch (err: any) {
      setRegError(err?.message || 'Unable to connect to registration service. Please try again.');
    } finally {
      setRegLoading(false);
    }
  };

  // ----------------------------------------------------
  // VERIFY OTP (Step 2)
  // ----------------------------------------------------
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setRegError(null);

    const cleanCode = otpCode.trim();
    if (cleanCode.length !== 4) {
      setRegError('Please enter the 4-digit verification code.');
      return;
    }

    if (!sessionId) {
      setRegError('Verification session expired. Please start over.');
      setRegisterStep('form');
      return;
    }

    setRegLoading(true);

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
        setRegError(res.error?.message || 'Incorrect verification code. Please check your inbox and try again.');
      }
    } catch (err: any) {
      setRegError(err?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setRegLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!sessionId || resendCooldown > 0) return;
    setRegError(null);
    setResendSuccess(null);
    setRegLoading(true);

    try {
      const res = await api.resendMerchantOtp(sessionId);
      if (res.success) {
        setResendCooldown(60);
        setResendSuccess('A fresh verification code has been dispatched.');
      } else {
        setRegError(res.error?.message || 'Failed to resend verification code.');
      }
    } catch (err: any) {
      setRegError(err?.message || 'Failed to resend code.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-stretch bg-white text-slate-900 selection:bg-amber-500 selection:text-slate-950">
      {/* 2-Column Split: Left = Forms & Toggle, Right = Clean 3D Cartoon Showcase */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-4rem)]">
        
        {/* ========================================================= */}
        {/* LEFT COLUMN: AUTH FORMS & TOGGLE (Clean White Theme) */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 bg-white border-r border-slate-200/80 relative z-10">
          <div className="space-y-6 max-w-md mx-auto w-full">
            
            {/* Top Header Badge (Logo removed since Navbar already has it) */}
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">
                Merchant Portal
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Venue Access
              </span>
            </div>

            {/* TWO TOGGLE BUTTONS: [ LOGIN ] <-> [ REGISTER ] */}
            <div className="p-1.5 rounded-2xl bg-slate-100 border border-slate-200 grid grid-cols-2 gap-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'login'
                    ? 'bg-white text-slate-950 shadow-sm border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-slate-900" />
                <span>Merchant Login</span>
              </button>

              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mode === 'register'
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 text-slate-900" />
                <span>Register Merchant</span>
              </button>
            </div>

            {/* Verified Email Banner */}
            {verifiedBanner && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Email address verified successfully. You may now sign in.</span>
              </div>
            )}

            {/* ===================================================== */}
            {/* TAB 1: LOGIN FORM */}
            {/* ===================================================== */}
            {mode === 'login' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                    Welcome Back, Partner
                  </h1>
                  <p className="text-xs text-slate-500">
                    Sign in to manage your counter kiosk, visit logs, and reward redemptions.
                  </p>
                </div>

                {/* Error Banner */}
                {loginError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold">{loginError}</p>
                      {unverifiedEmail && (
                        <div className="mt-2 pt-2 border-t border-red-200">
                          <button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={resendingVerification}
                            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 underline"
                          >
                            {resendingVerification ? 'Resending Link...' : 'Resend Email Verification Link'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Resend Verification Message */}
                {resendVerificationMsg && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    {resendVerificationMsg}
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Business Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="owner@yourvenue.com"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-700">Password</label>
                      <button
                        type="button"
                        onClick={() => setShowForgotModal(true)}
                        className="text-xs text-amber-600 hover:text-amber-700 font-semibold"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 transition outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 bg-white text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-slate-600 select-none cursor-pointer">
                      Remember this merchant device
                    </label>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    {loginLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                        <span>Logging In...</span>
                      </>
                    ) : (
                      <>
                        <span>Login</span>
                        <ArrowRight className="w-4 h-4 text-amber-400" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ===================================================== */}
            {/* TAB 2: REGISTER FORM */}
            {/* ===================================================== */}
            {mode === 'register' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <h1 className="text-2xl font-black text-slate-950 tracking-tight">
                    Start Your 2-Month Free Trial
                  </h1>
                  <p className="text-xs text-slate-500">
                    Set up your venue loyalty pass & dynamic counter QR in under 3 minutes.
                  </p>
                </div>

                {/* Error Banner */}
                {regError && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{regError}</span>
                  </div>
                )}

                {/* Step 1: Registration Form */}
                {registerStep === 'form' && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    {/* Business Name & City */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Business / Venue Name *
                        </label>
                        <div className="relative">
                          <Store className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={regData.businessName}
                            onChange={(e) => setRegData({ ...regData, businessName: e.target.value })}
                            placeholder="SmashZone Arena"
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 transition outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          City / Location *
                        </label>
                        <div className="relative">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={regData.city}
                            onChange={(e) => setRegData({ ...regData, city: e.target.value })}
                            placeholder="Mumbai / Delhi"
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 transition outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Owner Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Owner / Manager Name *
                        </label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={regData.ownerName}
                            onChange={(e) => setRegData({ ...regData, ownerName: e.target.value })}
                            placeholder="Rohit Sharma"
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 transition outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          WhatsApp / Phone *
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            value={regData.phone}
                            onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                            placeholder="9876543210"
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 transition outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Industry Category */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Industry Category *
                      </label>
                      <div className="relative">
                        <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          value={regData.industry}
                          onChange={(e) => setRegData({ ...regData, industry: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 transition outline-none cursor-pointer"
                        >
                          {INDUSTRIES.map((ind) => (
                            <option key={ind} value={ind} className="bg-white text-slate-900">
                              {ind}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Business Email */}
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">
                        Business Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={regData.email}
                          onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                          placeholder="owner@yourvenue.com"
                          className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 transition outline-none"
                        />
                      </div>
                    </div>

                    {/* Passwords */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Password *
                        </label>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            value={regData.password}
                            onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                            placeholder="Min 8 chars"
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 transition outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type={showRegConfirmPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            value={regData.confirmPassword}
                            onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                            placeholder="Repeat password"
                            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 transition outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showRegConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Submit Registration */}
                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full mt-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                      {regLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Registering...</span>
                        </>
                      ) : (
                        <>
                          <span>Register</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Step 2: OTP Verification Form */}
                {registerStep === 'verify' && (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                      <p className="font-bold">4-Digit Security Code Sent</p>
                      <p className="text-[11px] text-slate-600">
                        We sent a verification code to <strong>{regData.email}</strong>. Enter it below to activate your venue.
                      </p>
                    </div>

                    {resendSuccess && (
                      <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                        {resendSuccess}
                      </div>
                    )}

                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                          Verification Code
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={4}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="••••"
                          className="w-full text-center tracking-[1em] text-2xl font-black font-mono bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 rounded-xl py-3 text-slate-950 outline-none"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <button
                          type="button"
                          onClick={() => setRegisterStep('form')}
                          className="hover:text-slate-900 flex items-center gap-1 font-semibold"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>Edit Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={resendCooldown > 0 || regLoading}
                          className="text-amber-600 hover:text-amber-700 font-semibold disabled:opacity-50"
                        >
                          {resendCooldown > 0 ? `Resend Code (${resendCooldown}s)` : 'Resend Code'}
                        </button>
                      </div>

                      <button
                        type="submit"
                        disabled={regLoading || otpCode.length !== 4}
                        className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {regLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Verifying Code...</span>
                          </>
                        ) : verificationSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Account Activated! Loading...</span>
                          </>
                        ) : (
                          <>
                            <span>Verify & Launch Merchant Console</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Switch Note */}
          <div className="pt-6 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-center max-w-md mx-auto w-full">
            <Link href="/" className="hover:text-slate-900 transition flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: 3D CARTOON ILLUSTRATION & CONCISE DESCRIPTION */}
        {/* ========================================================= */}
        <div className="hidden lg:col-span-6 xl:col-span-7 lg:flex flex-col items-center justify-center p-10 xl:p-14 bg-gradient-to-br from-amber-50/50 via-white to-amber-100/40 border-l border-slate-200/80 relative overflow-hidden">
          {/* Subtle background radial glows */}
          <div className="absolute top-10 right-10 w-80 h-80 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-md mx-auto text-center space-y-6 relative z-10">
            {/* 3D Cartoon Storefront / Counter Illustration (Clean Vector SVG with 3D Depth) */}
            <div className="relative mx-auto w-64 h-64 flex items-center justify-center">
              {/* Soft Ground Contact Shadow */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-amber-950/10 blur-xl rounded-[100%]" />

              {/* 3D Isometric Cartoon Shopfront SVG */}
              <svg
                viewBox="0 0 240 240"
                className="w-full h-full drop-shadow-xl transform hover:scale-105 transition-transform duration-500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* 3D Base Platform */}
                <path
                  d="M120 200L200 155L120 110L40 155L120 200Z"
                  fill="#FDE68A"
                  fillOpacity="0.8"
                />
                <path
                  d="M40 155L120 200V208L40 163V155Z"
                  fill="#F59E0B"
                />
                <path
                  d="M120 200L200 155V163L120 208V200Z"
                  fill="#D97706"
                />

                {/* 3D Store Building Body */}
                <path
                  d="M70 142V85L120 58V115L70 142Z"
                  fill="#FFFFFF"
                  stroke="#E2E8F0"
                  strokeWidth="2"
                />
                <path
                  d="M120 115V58L170 85V142L120 115Z"
                  fill="#F8FAFC"
                  stroke="#E2E8F0"
                  strokeWidth="2"
                />

                {/* 3D Store Roof Canopy / Awning (Striped Gold & White) */}
                <path
                  d="M60 90L120 54L180 90L120 120L60 90Z"
                  fill="#F59E0B"
                />
                <path
                  d="M60 90L75 97L100 83L85 75L60 90Z"
                  fill="#FEF3C7"
                />
                <path
                  d="M100 83L115 90L135 77L120 70L100 83Z"
                  fill="#FEF3C7"
                />
                <path
                  d="M140 77L155 84L180 90L165 83L140 77Z"
                  fill="#FEF3C7"
                />

                {/* 3D Store Entrance Door */}
                <path
                  d="M132 122V95L158 109V136L132 122Z"
                  fill="#0F172A"
                />
                <path
                  d="M136 120V99L154 110V131L136 120Z"
                  fill="#1E293B"
                />

                {/* 3D Floating Gold Gift Stamp Badge with Depth */}
                <g className="animate-bounce" style={{ animationDuration: '3s' }}>
                  {/* Floating Cube Base */}
                  <path
                    d="M120 40L145 26L120 12L95 26L120 40Z"
                    fill="#FBBF24"
                  />
                  <path
                    d="M95 26L120 40V62L95 48V26Z"
                    fill="#F59E0B"
                  />
                  <path
                    d="M120 40L145 26V48L120 62V40Z"
                    fill="#D97706"
                  />
                  {/* Stamp Star Emboss on Front */}
                  <polygon
                    points="107,35 110,41 116,42 112,46 113,52 107,49 102,52 103,46 99,42 105,41"
                    fill="#FFFFFF"
                  />
                </g>

                {/* 3D Store Window Display */}
                <path
                  d="M82 132V108L108 94V118L82 132Z"
                  fill="#E0F2FE"
                  stroke="#BAE6FD"
                  strokeWidth="1.5"
                />
                <path
                  d="M86 127V112L104 100V115L86 127Z"
                  fill="#38BDF8"
                  fillOpacity="0.25"
                />
              </svg>
            </div>

            {/* Concise, Professional Description */}
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-950 tracking-tight">
                Delight your regulars
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
                Simple, frictionless visit rewards that bring customers back every week. Launch your counter QR in minutes with 2 full months completely free.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 text-slate-900 relative shadow-2xl space-y-5">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotSuccess(null);
                setForgotError(null);
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-950">Reset Merchant Password</h3>
              <p className="text-xs text-slate-500">
                Enter your registered business email and we'll dispatch a secure recovery link.
              </p>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {forgotError}
              </div>
            )}

            {forgotSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center space-y-3">
                <p>{forgotSuccess}</p>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 rounded-xl font-bold text-white text-xs transition"
                >
                  Close & Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Business Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="owner@yourvenue.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition active:scale-95 disabled:opacity-50"
                >
                  {forgotLoading ? 'Dispatching Reset Link...' : 'Send Recovery Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
