'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import {
  Settings,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Save,
  Lock,
  Smartphone,
  Bell,
  Sparkles,
  Volume2,
  VolumeX,
  MessageSquare,
  QrCode,
  Building,
  KeyRound,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function ClientSettingsPage() {
  const { business, refreshProfile } = useAuth();

  // Tab State
  const [activeTab, setActiveTab] = useState<'fraud' | 'terminal' | 'notifications' | 'venue'>('fraud');

  // Anti-Fraud Settings
  const [cooldownMinutes, setCooldownMinutes] = useState(60);
  const [qrRotationSeconds, setQrRotationSeconds] = useState(60);
  const [maxStampsPerDay, setMaxStampsPerDay] = useState(1);
  const [voucherExpiryDays, setVoucherExpiryDays] = useState(30);
  const [autoLockReplayTokens, setAutoLockReplayTokens] = useState(true);

  // Terminal & Kiosk Settings
  const [terminalPin, setTerminalPin] = useState('1234');
  const [requireStaffApproval, setRequireStaffApproval] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [kioskFullscreenMode, setKioskFullscreenMode] = useState(false);

  // Notifications & Automation
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [welcomeBonusStamp, setWelcomeBonusStamp] = useState(true);
  const [weeklyDigestEmail, setWeeklyDigestEmail] = useState(true);

  // Venue Operating Details
  const [operatingHours, setOperatingHours] = useState('06:00 AM - 11:00 PM');
  const [supportPhone, setSupportPhone] = useState('+919900112233');

  // Status & Feedback
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  const targetBizId = business?.id || 'biz_smashzone';

  useEffect(() => {
    if (business) {
      if (business.cooldownMinutes) setCooldownMinutes(business.cooldownMinutes);
      if (business.phone) setSupportPhone(business.phone);
      if (business.settings) {
        if (business.settings.qrRotationSeconds) setQrRotationSeconds(business.settings.qrRotationSeconds);
        if (business.settings.maxStampsPerDay) setMaxStampsPerDay(business.settings.maxStampsPerDay);
        if (business.settings.terminalPin) setTerminalPin(business.settings.terminalPin);
        if (business.settings.operatingHours) setOperatingHours(business.settings.operatingHours);
      }
    }
  }, [business]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage(null);

    try {
      const res = await api.updateBusiness(targetBizId, {
        cooldownMinutes: Number(cooldownMinutes),
        phone: supportPhone,
        settings: {
          qrRotationSeconds: Number(qrRotationSeconds),
          maxStampsPerDay: Number(maxStampsPerDay),
          voucherExpiryDays: Number(voucherExpiryDays),
          autoLockReplayTokens,
          terminalPin,
          requireStaffApproval,
          soundEffects,
          kioskFullscreenMode,
          whatsappAlerts,
          welcomeBonusStamp,
          weeklyDigestEmail,
          operatingHours,
        },
      });

      if (res.success) {
        setSavedMessage('Settings successfully saved & synced to all counter terminals!');
        if (refreshProfile) await refreshProfile();
        setTimeout(() => setSavedMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Venue Settings & Anti-Fraud</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure check-in cooldowns, terminal security, and automated WhatsApp engagement rules.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" />
            HMAC Anti-Fraud Active
          </span>
        </div>
      </div>

      {/* Toast Feedback */}
      {savedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{savedMessage}</span>
          </div>
          <button onClick={() => setSavedMessage(null)} className="text-emerald-700 underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('fraud')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'fraud'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Anti-Fraud & Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'terminal'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Counter Kiosk & Terminal</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Automation & WhatsApp</span>
        </button>

        <button
          onClick={() => setActiveTab('venue')}
          className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 ${
            activeTab === 'venue'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Venue & Hours</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: ANTI-FRAUD & RULES */}
        {activeTab === 'fraud' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Cryptographic Anti-Fraud Safeguards</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Protect your business from duplicate scans, QR screenshot sharing, and unauthorized reward claims.
              </p>
            </div>

            <div className="space-y-6 divide-y divide-slate-100 text-xs">
              {/* Check-In Cooldown Window */}
              <div className="pt-2 space-y-2">
                <label className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Check-In Cooldown Window (Minutes)</span>
                </label>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  Restricts a customer from scanning the QR code repeatedly in the same visit. If they scan again before the timer expires, their visit is safely blocked with a countdown.
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="number"
                    min={5}
                    max={1440}
                    value={cooldownMinutes}
                    onChange={(e) => setCooldownMinutes(parseInt(e.target.value, 10) || 5)}
                    className="w-32 px-4 py-2 rounded-xl border border-slate-200 font-bold font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <span className="text-xs text-slate-600 font-medium">Minutes cooldown</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-400">Presets:</span>
                  {[15, 30, 60, 120, 1440].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setCooldownMinutes(mins)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                        cooldownMinutes === mins
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {mins >= 1440 ? '24 Hours' : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic QR Refresh Interval */}
              <div className="pt-6 space-y-2">
                <label className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-indigo-600" />
                  <span>Dynamic QR Code Rotation Rate</span>
                </label>
                <p className="text-slate-500 leading-relaxed text-[11px]">
                  How frequently the counter screen generates a brand new cryptographic token hash. Prevents customers from sharing photo screenshots with friends.
                </p>

                <div className="flex gap-2 pt-1">
                  {[30, 60, 90].map((secs) => (
                    <button
                      key={secs}
                      type="button"
                      onClick={() => setQrRotationSeconds(secs)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        qrRotationSeconds === secs
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {secs} Seconds {secs === 60 ? '(Recommended)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Max Stamps Allowed Per Day */}
              <div className="pt-6 space-y-2">
                <label className="font-bold text-slate-900 block">Maximum Stamps Per Patron Per Day</label>
                <p className="text-slate-500 text-[11px]">
                  Enforces fair play across multiple sessions on the same date.
                </p>
                <div className="flex gap-2 pt-1">
                  {[1, 2, 99].map((max) => (
                    <button
                      key={max}
                      type="button"
                      onClick={() => setMaxStampsPerDay(max)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        maxStampsPerDay === max
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {max === 99 ? 'Unlimited Stamps' : `${max} Stamp / Day`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voucher Expiry Window */}
              <div className="pt-6 space-y-2">
                <label className="font-bold text-slate-900 block">Milestone Reward Voucher Validity</label>
                <p className="text-slate-500 text-[11px]">
                  Customer must redeem their unlocked free session or coffee voucher within this period before it expires.
                </p>
                <div className="flex gap-2 pt-1">
                  {[7, 14, 30, 60, 90].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setVoucherExpiryDays(days)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                        voucherExpiryDays === days
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {days} Days
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TERMINAL & KIOSK SETTINGS */}
        {activeTab === 'terminal' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Counter Kiosk & POS Terminal Settings</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Controls for counter tablets, iPads, and front-desk marshalls.
              </p>
            </div>

            <div className="space-y-5 text-xs divide-y divide-slate-100">
              {/* Terminal PIN */}
              <div className="pt-2 space-y-2">
                <label className="font-bold text-slate-900 block flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-600" />
                  <span>Counter Terminal Security PIN</span>
                </label>
                <p className="text-slate-500 text-[11px]">
                  4-digit passkey required to exit full-screen kiosk mode or access manual voucher overrides at the counter.
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={terminalPin}
                  onChange={(e) => setTerminalPin(e.target.value)}
                  className="w-32 font-mono tracking-widest text-center px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Sound Effects */}
              <div className="pt-5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    {soundEffects ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                    <span>Counter Audio Chime on Verified Scan</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Plays an audible celebratory chime when a player successfully checks in or redeems a reward.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={soundEffects}
                  onChange={(e) => setSoundEffects(e.target.checked)}
                  className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              {/* Require Staff Approval */}
              <div className="pt-5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-indigo-600" />
                    <span>Strict Counter Verification on Milestone Vouchers</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Requires staff to input voucher code in the merchant portal to burn tokens before handing out free courts or goods.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={requireStaffApproval}
                  onChange={(e) => setRequireStaffApproval(e.target.checked)}
                  className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: NOTIFICATIONS & AUTOMATION */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Patron Alerts & Automated Marketing</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Keep players coming back through automated WhatsApp notifications and loyalty rewards.
              </p>
            </div>

            <div className="space-y-5 text-xs divide-y divide-slate-100">
              {/* WhatsApp Milestone Alerts */}
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Instant WhatsApp Reward Notification</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Dispatches a congratulatory WhatsApp message to the customer with their single-use voucher code when they hit milestone stamps.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={whatsappAlerts}
                  onChange={(e) => setWhatsappAlerts(e.target.checked)}
                  className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              {/* First-Visit Bonus Stamp */}
              <div className="pt-5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Welcome Bonus (+1 Stamp on First Check-In)</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Awards an immediate bonus stamp when a new player registers and joins your venue's loyalty card.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={welcomeBonusStamp}
                  onChange={(e) => setWelcomeBonusStamp(e.target.checked)}
                  className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500"
                />
              </div>

              {/* Weekly Digest Email */}
              <div className="pt-5 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-indigo-600" />
                    <span>Monday Morning Business Digest</span>
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    Sends owner email with total weekly visits, new regulars enrolled, and top player attendance stats.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyDigestEmail}
                  onChange={(e) => setWeeklyDigestEmail(e.target.checked)}
                  className="w-5 h-5 rounded-lg text-emerald-600 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: VENUE & HOURS */}
        {activeTab === 'venue' && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Venue Operations & Support Details</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Information displayed to customers on their digital pass and receipts.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Operating Hours</label>
                <input
                  type="text"
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  placeholder="e.g. 06:00 AM - 11:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Support Contact Phone</label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="+919900112233"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Actions Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-slate-400">
            Auto-synced across all counter tablets & mobile passes
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md flex items-center gap-2 transition disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
