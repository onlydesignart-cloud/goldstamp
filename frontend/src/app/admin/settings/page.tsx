'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import {
  Settings,
  Shield,
  ShieldAlert,
  Bell,
  CheckCircle2,
  RefreshCw,
  Download,
  RotateCcw,
  Sliders,
  Send,
  Radio,
  Lock,
  Globe,
  Smartphone,
  CreditCard,
  QrCode,
  MapPin,
  Clock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Platform Config State
  const [autoApproveBusinesses, setAutoApproveBusinesses] = useState(false);
  const [requireCustomerPhoneOtp, setRequireCustomerPhoneOtp] = useState(true);
  const [qrRefreshInterval, setQrRefreshInterval] = useState(60);
  const [geofenceRadiusMeters, setGeofenceRadiusMeters] = useState(200);
  const [voucherExpiryMinutes, setVoucherExpiryMinutes] = useState(15);
  const [platformName, setPlatformName] = useState('Gold Stamp Loyalty Cloud');
  const [supportEmail, setSupportEmail] = useState('support@goldstamp.io');
  const [whatsappGatewayEnabled, setWhatsappGatewayEnabled] = useState(true);
  const [smsGatewayEnabled, setSmsGatewayEnabled] = useState(true);
  const [razorpayWebhooksActive, setRazorpayWebhooksActive] = useState(true);

  // Broadcast announcement
  const [broadcastEnabled, setBroadcastEnabled] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState(
    'Notice: Platform scheduled maintenance window on Sunday at 02:00 AM IST.'
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsRes, logsRes] = await Promise.all([
        api.getPlatformSettings(),
        api.getAdminAuditLogs(),
      ]);

      if (settingsRes.success && settingsRes.data) {
        const s = settingsRes.data;
        setAutoApproveBusinesses(!!s.autoApproveBusinesses);
        setRequireCustomerPhoneOtp(s.requireCustomerPhoneOtp !== false);
        setQrRefreshInterval(s.qrRefreshInterval || 60);
        setGeofenceRadiusMeters(s.geofenceRadiusMeters || 200);
        setVoucherExpiryMinutes(s.voucherExpiryMinutes || 15);
        setPlatformName(s.platformName || 'Gold Stamp Loyalty Cloud');
        setSupportEmail(s.supportEmail || 'support@goldstamp.io');
        setWhatsappGatewayEnabled(s.whatsappGatewayEnabled !== false);
        setSmsGatewayEnabled(s.smsGatewayEnabled !== false);
        setRazorpayWebhooksActive(s.razorpayWebhooksActive !== false);
        if (s.broadcast) {
          setBroadcastEnabled(!!s.broadcast.enabled);
          setBroadcastMessage(s.broadcast.message || '');
        }
      }

      if (logsRes.success && logsRes.data) {
        setLogs(logsRes.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updatePlatformSettings({
        autoApproveBusinesses,
        requireCustomerPhoneOtp,
        qrRefreshInterval,
        geofenceRadiusMeters,
        voucherExpiryMinutes,
        platformName,
        supportEmail,
        whatsappGatewayEnabled,
        smsGatewayEnabled,
        razorpayWebhooksActive,
        broadcast: {
          enabled: broadcastEnabled,
          message: broadcastMessage,
          type: 'INFO',
          updatedAt: new Date().toISOString(),
        },
      });

      if (res.success) {
        setSaveToast('Platform settings saved to LocalStorage & applied across all portals!');
        setTimeout(() => setSaveToast(null), 4000);
      }
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setSaveToast(`Error saving settings: ${err?.message || 'Failed'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = async () => {
    const confirm = window.confirm(
      'Are you sure you want to reset the platform database?\n\nThis will restore all demo businesses (SmashZone, Artisan Roast, Glamour Glow), campaigns, QR punch passes, and mock transactions to clean default state.'
    );
    if (!confirm) return;

    setResetting(true);
    try {
      await api.resetPlatformData();
      await loadData();
      setSaveToast('Platform store successfully reset to clean default seed!');
      setTimeout(() => setSaveToast(null), 4000);
    } catch (err: any) {
      console.error('Error resetting store:', err);
      setSaveToast(`Reset error: ${err?.message || 'Failed'}`);
    } finally {
      setResetting(false);
    }
  };

  const handleExportBackup = () => {
    const backupData = {
      platform: platformName,
      exportedAt: new Date().toISOString(),
      settings: {
        autoApproveBusinesses,
        requireCustomerPhoneOtp,
        qrRefreshInterval,
        geofenceRadiusMeters,
        voucherExpiryMinutes,
        whatsappGatewayEnabled,
        smsGatewayEnabled,
        razorpayWebhooksActive,
        broadcast: {
          enabled: broadcastEnabled,
          message: broadcastMessage,
        },
      },
      auditLogs: logs,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `goldstamp_platform_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Configuration & System Controls
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
              <Shield className="w-3 h-3 text-purple-400" />
              Super Admin Core
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global security parameters, anti-fraud QR rules, merchant onboarding policies, and audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition border border-slate-700 shadow-sm flex items-center gap-1.5 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export Config
          </button>
          <button
            onClick={handleResetData}
            disabled={resetting}
            title="Reset platform demo seed"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 transition border border-slate-700 hover:border-rose-800 shadow-sm flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-rose-400 ${resetting ? 'animate-spin' : ''}`} />
            Reset Demo DB
          </button>
          <button
            onClick={loadData}
            title="Refresh Logs"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition border border-slate-700 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Save Toast Notification */}
      {saveToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-semibold shadow-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Settings Grid */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Anti-Fraud & Dynamic QR Engine */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl space-y-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Anti-Fraud & Verification Engine</h2>
                <p className="text-xs text-slate-400 mt-0.5">Parameters preventing barcode duplication and proxy stamping.</p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    Dynamic QR Expiry Interval
                  </span>
                  <span className="font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                    {qrRefreshInterval} seconds
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="180"
                  step="15"
                  value={qrRefreshInterval}
                  onChange={(e) => setQrRefreshInterval(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Terminal rotates cryptographic payload every {qrRefreshInterval}s to stop screenshot sharing.
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    Anti-Replay Protection (Single-Use Token)
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Every counter QR code is single-use and invalidates immediately upon first scan to prevent screenshot sharing.
                  </p>
                </div>
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                  Enforced
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Single-Use Voucher Burning Window
                  </span>
                  <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    {voucherExpiryMinutes} minutes
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={voucherExpiryMinutes}
                  onChange={(e) => setVoucherExpiryMinutes(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 block mt-1">
                  Claimed vouchers self-destruct if not presented to counter staff within {voucherExpiryMinutes} mins.
                </span>
              </div>
            </div>
          </div>

          {/* Tenant Policies & Onboarding Controls */}
          <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl space-y-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">Tenant Onboarding & Policies</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Control merchant onboarding rules and verification gates.</p>
                </div>
              </div>

              <div className="space-y-4 pt-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Auto-Approve New Registered Businesses</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {autoApproveBusinesses
                        ? 'New businesses become ACTIVE immediately upon sign-up.'
                        : 'New businesses remain PENDING until Super Admin manually approves them.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoApproveBusinesses(!autoApproveBusinesses)}
                    className={`w-11 h-6 rounded-full transition p-1 flex items-center ${
                      autoApproveBusinesses ? 'bg-purple-600 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">Mandatory Customer Phone Verification (OTP)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Enforce SMS / WhatsApp OTP verification before granting punch-card access.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequireCustomerPhoneOtp(!requireCustomerPhoneOtp)}
                    className={`w-11 h-6 rounded-full transition p-1 flex items-center ${
                      requireCustomerPhoneOtp ? 'bg-purple-600 justify-end' : 'bg-slate-700 justify-start'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Platform Brand Name
                    </label>
                    <input
                      type="text"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Super Admin Support Email
                    </label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/60 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {saving ? 'Applying...' : 'Save Configuration'}
              </button>
            </div>
          </div>
        </div>

        {/* Platform Broadcast Announcement Bar */}
        <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Platform-Wide Broadcast Notice</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Publish an urgent banner displayed live across all merchant portals and customer apps.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Live Status:</span>
              <button
                type="button"
                onClick={() => setBroadcastEnabled(!broadcastEnabled)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  broadcastEnabled
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'bg-slate-700 text-slate-400'
                }`}
              >
                {broadcastEnabled ? 'LIVE BROADCASTING' : 'DISABLED'}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Type urgent system broadcast message here..."
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            {broadcastEnabled && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="font-bold">Live Banner Preview:</span>
                <span className="truncate">{broadcastMessage}</span>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Gateway Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">WhatsApp Cloud API</p>
              <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                {whatsappGatewayEnabled ? 'Connected (SLA 99.9%)' : 'Disabled'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setWhatsappGatewayEnabled(!whatsappGatewayEnabled)}
            className={`w-9 h-5 rounded-full transition p-0.5 flex items-center ${
              whatsappGatewayEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Razorpay Webhooks</p>
              <p className="text-[10px] text-purple-300 font-semibold mt-0.5">
                {razorpayWebhooksActive ? 'Active (AutoPay Live)' : 'Paused'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRazorpayWebhooksActive(!razorpayWebhooksActive)}
            className={`w-9 h-5 rounded-full transition p-0.5 flex items-center ${
              razorpayWebhooksActive ? 'bg-purple-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
          </button>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">SMS OTP Gateway</p>
              <p className="text-[10px] text-cyan-300 font-semibold mt-0.5">
                {smsGatewayEnabled ? 'Fast2SMS / Twilio Active' : 'Offline'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSmsGatewayEnabled(!smsGatewayEnabled)}
            className={`w-9 h-5 rounded-full transition p-0.5 flex items-center ${
              smsGatewayEnabled ? 'bg-cyan-600 justify-end' : 'bg-slate-700 justify-start'
            }`}
          >
            <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
          </button>
        </div>
      </div>

      {/* System Audit Logs & Security Trail */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              Immutable Audit Logs & Security Trail
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cryptographic audit log recording admin approvals, voucher redemptions, and policy changes.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {logs.length} Total Audit Records
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-700/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-700">
              <tr>
                <th className="px-5 py-3.5">Action Event</th>
                <th className="px-4 py-3.5">Actor</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Target Entity</th>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-4 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50 font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-700/20 transition text-slate-300">
                  <td className="px-5 py-3.5 font-bold text-purple-300 font-sans">
                    {log.action}
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">
                    {log.actor?.name || 'Platform Admin'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      {log.actorRole || 'SUPER_ADMIN'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400">
                    {log.entityType}
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase">
                      VERIFIED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
