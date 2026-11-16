'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';
import {
  User,
  QrCode,
  Mail,
  Phone,
  ShieldCheck,
  LogOut,
  Sparkles,
  AlertTriangle,
  Save,
  CheckCircle2,
  Pencil,
  X,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [passData, setPassData] = useState<any>(null);
  const [loadingPass, setLoadingPass] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Profile Editing State (Full Name & WhatsApp Phone)
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setNameInput(user.name || '');
      setPhoneInput(user.phone || '');
    }
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('prompt') === 'whatsapp' || params.get('missing_whatsapp') === 'true') {
        setIsEditingProfile(true);
      }
    }
  }, []);

  useEffect(() => {
    async function loadCustomerPass() {
      if (!user) return;
      try {
        const res = await api.getCustomerPass();
        if (res.success && res.data) {
          setPassData(res.data);
        }
      } catch (err) {
        console.error('Failed to load customer pass:', err);
      } finally {
        setLoadingPass(false);
      }
    }
    loadCustomerPass();
  }, [user]);

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nameInput.trim() || nameInput.trim().length < 2) {
      setErrorMsg('Please enter a valid full name (minimum 2 characters).');
      return;
    }

    const clean = phoneInput.replace(/[^0-9]/g, '');
    if (clean && clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setSaveLoading(true);
    setErrorMsg(null);

    const fullPhone = clean
      ? (phoneInput.startsWith('+') ? phoneInput : `+91 ${clean.slice(-10)}`)
      : '';

    const res = await updateProfile({
      name: nameInput.trim(),
      phone: fullPhone,
    });

    if (res.success) {
      setSaveSuccess('Profile details updated successfully!');
      setIsEditingProfile(false);
      setTimeout(() => setSaveSuccess(null), 4000);
    } else {
      setErrorMsg(res.error || 'Failed to update profile.');
    }
    setSaveLoading(false);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-sm text-slate-500">Please sign in to view your profile.</p>
        <Link
          href="/login"
          className="mt-4 inline-block px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const hasPhone = Boolean(user.phone && user.phone.replace(/[^0-9]/g, '').length >= 10);

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Missing WhatsApp Required Warning Banner */}
      {!hasPhone && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-sm text-left space-y-3 animate-in zoom-in-95">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-amber-950">
                WhatsApp Number Required to Receive Real-Time Alerts
              </h3>
              <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                You are currently signed in with Gmail (<strong>{user.email}</strong>). To join loyalty
                programs and receive instant stamp updates and reward vouchers on WhatsApp, please link your number.
              </p>
            </div>
          </div>

          {!isEditingProfile && (
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Link WhatsApp Number Now</span>
            </button>
          )}
        </div>
      )}

      {/* Success Notification */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{saveSuccess}</span>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-black text-2xl uppercase mx-auto shadow-md mb-4">
          {user.name.charAt(0)}
        </div>

        <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mt-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Customer Member</span>
        </div>

        {/* View / Edit Mode */}
        {!isEditingProfile ? (
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3.5 text-xs text-slate-600 max-w-sm mx-auto text-left">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name
              </span>
              <span className="font-semibold text-slate-800">{user.name}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Gmail / Email
              </span>
              <span className="font-medium text-slate-800">{user.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> WhatsApp Phone
              </span>
              {hasPhone ? (
                <span className="font-semibold text-slate-800">{user.phone}</span>
              ) : (
                <span className="text-amber-700 bg-amber-50 font-bold px-2 py-0.5 rounded-lg border border-amber-200 text-[11px]">
                  Missing
                </span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Customer ID
              </span>
              <span className="font-mono text-slate-600 text-[11px] truncate max-w-[130px]">
                {user.id}
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setNameInput(user.name);
                  setPhoneInput(user.phone || '');
                  setIsEditingProfile(true);
                  setErrorMsg(null);
                }}
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Profile Info</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-slate-100 space-y-4 max-w-sm mx-auto text-left">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your Name"
                className="w-full bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                WhatsApp Phone Number
              </label>
              <div className="flex gap-2">
                <div className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 flex items-center shrink-0">
                  🇮🇳 +91
                </div>
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="98765 43210"
                  className="flex-1 bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 font-medium"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-[11px] text-rose-600 font-medium">{errorMsg}</p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                disabled={saveLoading}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saveLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNameInput(user.name);
                  setPhoneInput(user.phone || '');
                  setIsEditingProfile(false);
                  setErrorMsg(null);
                }}
                className="py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* How to Collect Stamps Helper */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-xs text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <QrCode className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Point your phone at the Merchant Counter QR code to earn stamps.</span>
        </div>
        <Link href="/checkin" className="text-emerald-700 font-bold hover:underline shrink-0 ml-2">
          Scan Counter QR →
        </Link>
      </div>

      {/* Dedicated Sign Out of Account Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-900">Sign Out of Account</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Safely terminate your current session on this device.</p>
        </div>
        <button
          type="button"
          disabled={loggingOut}
          onClick={async () => {
            setLoggingOut(true);
            await logout();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition active:scale-95 disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          <span>{loggingOut ? 'Signing Out...' : 'Sign Out'}</span>
        </button>
      </div>
    </div>
  );
}
