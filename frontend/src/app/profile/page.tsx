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
  CheckCircle,
  MessageSquare,
  Sparkles,
  Send,
  ExternalLink,
  AlertTriangle,
  Save,
  CheckCircle2,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [passData, setPassData] = useState<any>(null);
  const [loadingPass, setLoadingPass] = useState(true);
  const [testSent, setTestSent] = useState<string | null>(null);

  // WhatsApp Profile Editing State
  const [phoneInput, setPhoneInput] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (user?.phone) {
      setPhoneInput(user.phone);
    }
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('prompt') === 'whatsapp' || params.get('missing_whatsapp') === 'true') {
        setIsEditingPhone(true);
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

  const handleSavePhone = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = phoneInput.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }

    setSaveLoading(true);
    setErrorMsg(null);

    const fullPhone = phoneInput.startsWith('+') ? phoneInput : `+91 ${clean.slice(-10)}`;
    const res = await updateProfile({ phone: fullPhone });

    if (res.success) {
      setSaveSuccess('WhatsApp number saved! Dual Sync (WhatsApp + Gmail) is now active.');
      setIsEditingPhone(false);
      setTimeout(() => setSaveSuccess(null), 5000);
    } else {
      setErrorMsg(res.error || 'Failed to update phone number');
    }
    setSaveLoading(false);
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-sm text-slate-500">Please sign in to view your profile.</p>
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
                WhatsApp Number Required to Join Loyalty Programs
              </h3>
              <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
                You are currently signed in with Gmail (<strong>{user.email}</strong>). To join loyalty
                programs and receive real-time stamp updates and free vouchers simultaneously on both
                channels, please add your WhatsApp number below.
              </p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-amber-200/90 space-y-2">
            <label className="text-[11px] font-bold text-slate-700 block">
              Enter 10-Digit WhatsApp Mobile Number:
            </label>
            <div className="flex gap-2">
              <div className="bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-2 text-xs font-bold text-slate-700 flex items-center">
                🇮🇳 +91
              </div>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="98765 43210"
                className="flex-1 bg-slate-50 border border-slate-200 focus:border-emerald-600 focus:bg-white rounded-xl px-3 py-2 text-xs text-slate-900 font-semibold"
              />
              <button
                type="button"
                onClick={() => handleSavePhone()}
                disabled={saveLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs disabled:opacity-50 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saveLoading ? 'Saving...' : 'Link WhatsApp'}</span>
              </button>
            </div>
            {errorMsg && <p className="text-[11px] text-rose-600 font-medium">{errorMsg}</p>}
          </div>
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
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Active Customer Member</span>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-xs text-slate-600 max-w-sm mx-auto text-left">
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
            {hasPhone && !isEditingPhone ? (
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">{user.phone}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingPhone(true)}
                  className="text-[11px] text-emerald-700 hover:underline font-semibold"
                >
                  Edit
                </button>
              </div>
            ) : isEditingPhone ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-32 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-xs"
                />
                <button
                  type="button"
                  onClick={() => handleSavePhone()}
                  className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-lg"
                >
                  Save
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingPhone(true)}
                className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200"
              >
                + Add WhatsApp Number
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Customer ID
            </span>
            <span className="font-mono text-slate-600 text-[11px] truncate max-w-[120px]">
              {user.id}
            </span>
          </div>
        </div>
      </div>

      {/* WhatsApp & Gmail Simultaneous Notification Channels Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Simultaneous Dual-Sync Channels
              </h2>
              <p className="text-[11px] text-slate-500">
                Every stamp and voucher is dispatched to both channels simultaneously
              </p>
            </div>
          </div>
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              hasPhone
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {hasPhone ? 'Dual-Sync Active' : 'WhatsApp Pending'}
          </span>
        </div>

        {testSent && (
          <div className="bg-emerald-950 text-emerald-200 text-xs p-3 rounded-2xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{testSent}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* WhatsApp Channel */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${hasPhone ? 'bg-emerald-500' : 'bg-amber-400'}`}
                ></span>
                WhatsApp Channel
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  hasPhone
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-amber-700 bg-amber-50 font-bold'
                }`}
              >
                {hasPhone ? 'Active' : 'Missing'}
              </span>
            </div>
            <div className="font-mono text-slate-600 text-[11px]">
              {user.phone || 'No WhatsApp phone linked'}
            </div>
            {hasPhone ? (
              <a
                href={`https://wa.me/${user.phone!.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  `Gold Stamp Loyalty Alert: Hello ${user.name}, your WhatsApp notification channel is connected. Verified stamp alerts and reward vouchers will be delivered directly here.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setTestSent(`Test notification triggered for ${user.phone}.`);
                  setTimeout(() => setTestSent(null), 4000);
                }}
                className="w-full py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] transition flex items-center justify-center gap-1.5"
              >
                <span>Test WhatsApp Alert</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingPhone(true)}
                className="w-full py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] transition"
              >
                Link WhatsApp Number
              </button>
            )}
          </div>

          {/* Gmail Channel */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                Gmail / Email
              </span>
              <span className="text-[10px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>
            <div className="font-mono text-slate-600 text-[11px] truncate">{user.email}</div>
            <button
              type="button"
              onClick={() => {
                setTestSent(`Test reward email receipt dispatched to ${user.email}.`);
                setTimeout(() => setTestSent(null), 4000);
              }}
              className="w-full py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-3 h-3" />
              <span>Test Email Alert</span>
            </button>
          </div>
        </div>
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

      {/* Logout button */}
      <div className="text-center pt-2">
        <button
          onClick={logout}
          className="text-xs font-semibold text-red-600 hover:text-red-700 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-red-50 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out of Account</span>
        </button>
      </div>
    </div>
  );
}
