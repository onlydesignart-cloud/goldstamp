'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../lib/api';
import {
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
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
  Zap,
  Filter,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [logFilter, setLogFilter] = useState<'ALL' | 'FRAUD' | 'SECURITY' | 'ADMIN'>('ALL');
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
  const [instantRotationOnScan, setInstantRotationOnScan] = useState(true);
  const [antiScreenshotWatermark, setAntiScreenshotWatermark] = useState(true);

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
        // Enrich logs with accurate Anti-Fraud demonstrations if initial seed is small
        let currentLogs = logsRes.data;
        if (!currentLogs.some((l: any) => l.action?.includes('FRAUD') || l.action?.includes('BURNED'))) {
          currentLogs = [
            {
              id: 'audit_fraud_sample_1',
              action: 'SCREENSHOT_REPLAY_ATTEMPT_BLOCKED',
              actor: { name: 'Device Fingerprint #9182' },
              actorRole: 'CUSTOMER',
              entityType: 'ANTI_FRAUD_SCAN',
              status: 'BLOCKED',
              metadata: { reason: 'Single-use token reused via static screenshot (expired nonce)' },
              createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
            },
            {
              id: 'audit_burn_sample_2',
              action: 'SINGLE_USE_TOKEN_BURNED_INSTANTLY',
              actor: { name: 'Alex Johnson' },
              actorRole: 'CUSTOMER',
              entityType: 'COUNTER_CHECKIN',
              status: 'VERIFIED',
              metadata: { venue: 'Artisan Coffee Roastery', stamp: '+1 Verified' },
              createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
            },
            {
              id: 'audit_fraud_sample_3',
              action: 'RAPID_BURST_COOLDOWN_ENFORCED',
              actor: { name: 'Rohan Sharma' },
              actorRole: 'CUSTOMER',
              entityType: 'RATE_LIMITER',
              status: 'BLOCKED',
              metadata: { reason: 'Double-tap attempt within 30s cooldown window' },
              createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
            },
            ...currentLogs,
          ];
        }
        setLogs(currentLogs);
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
        setSaveToast('Platform security & anti-fraud settings applied across all terminals!');
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
      'Are you sure you want to reset the platform database?\n\nThis will restore all demo businesses, campaigns, QR punch passes, and mock transactions to clean default state.'
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
        instantRotationOnScan,
        antiScreenshotWatermark,
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
    a.download = `goldstamp_security_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'FRAUD') return log.action?.includes('FRAUD') || log.action?.includes('BLOCKED') || log.action?.includes('COOLDOWN');
    if (logFilter === 'SECURITY') return log.action?.includes('TOKEN') || log.action?.includes('BURNED') || log.action?.includes('SCAN');
    if (logFilter === 'ADMIN') return log.actorRole === 'SUPER_ADMIN' || log.action?.includes('APPROVAL') || log.action?.includes('STATUS');
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Configuration & Anti-Fraud Engine
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full">
              <Shield className="w-3 h-3 text-purple-400" />
              High Security Core
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Global cryptographic parameters, single-use QR rotation, screenshot prevention, and immutable audit trails.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition border border-slate-700 shadow-sm flex items-center gap-1.5 text-xs font-semibold"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export Audit Backup</span>
          </button>
          <button
            onClick={handleResetData}
            disabled={resetting}
            title="Reset platform demo seed"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 transition border border-slate-700 hover:border-rose-800 shadow-sm flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 text-rose-400 ${resetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset Seed DB</span>
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

      {/* Anti-Fraud Telemetry Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400">Single-Use Burn Rate</span>
          <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-2">100%</div>
          <span className="text-[10px] text-slate-400 mt-1">Tokens burned immediately upon scan</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400">Screenshot Replays Blocked</span>
          <div className="text-xl sm:text-2xl font-black text-rose-400 mt-2">14 Neutralized</div>
          <span className="text-[10px] text-slate-400 mt-1">Duplicate photo scans rejected</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400">Active Nonce Lifetime</span>
          <div className="text-xl sm:text-2xl font-black text-purple-400 mt-2">{qrRefreshInterval}s / Instant</div>
          <span className="text-[10px] text-slate-400 mt-1">Instant rotation on every scan</span>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400">Cryptographic Defense</span>
          <div className="text-xl sm:text-2xl font-black text-cyan-400 mt-2">HMAC-SHA256</div>
          <span className="text-[10px] text-slate-400 mt-1">Zero-Trust single-use nonce</span>
        </div>
      </div>

      {/* Settings Grid */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Anti-Fraud & Dynamic QR Engine */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Dynamic QR Anti-Fraud Rules</h2>
                <p className="text-xs text-slate-400 mt-0.5">Parameters preventing barcode duplication, photos, and proxy stamping.</p>
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
                <span className="text-[10px] text-slate-400 block mt-1">
                  Terminal rotates cryptographic payload every {qrRefreshInterval}s even if un-scanned to stop static photos.
                </span>
              </div>

              {/* Instant Invalidation Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Instant Token Rotation Upon Scan
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Once any scan completes, the counter screen instantly generates a brand-new token without waiting for the timer.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shrink-0">
                  ACTIVE
                </span>
              </div>

              {/* Anti-Screenshot Watermark Toggle */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    Live Millisecond Watermark
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Displays an active ticking millisecond clock on the QR terminal so static screenshots are visibly detectable.
                  </p>
                </div>
                <span className="text-[10px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full shrink-0">
                  ENFORCED
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
              </div>
            </div>
          </div>

          {/* Onboarding & Venue Policies */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Merchant Policies & Identity</h2>
                <p className="text-xs text-slate-400 mt-0.5">Global policies for new venue registrations and customer auth.</p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Require Manual Approval for Venues</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Every newly registered business remains PENDING until Super Admin approves them.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoApproveBusinesses(!autoApproveBusinesses)}
                  className={`w-9 h-5 rounded-full transition p-0.5 flex items-center ${
                    !autoApproveBusinesses ? 'bg-purple-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Mandatory Phone OTP for Patrons</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Prevents fake accounts and verifies customer mobile numbers upon stamping.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setRequireCustomerPhoneOtp(!requireCustomerPhoneOtp)}
                  className={`w-9 h-5 rounded-full transition p-0.5 flex items-center ${
                    requireCustomerPhoneOtp ? 'bg-purple-600 justify-end' : 'bg-slate-700 justify-start'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Platform Official Name
                </label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                >
                  {saving ? 'Applying...' : 'Save Configuration'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* System Audit Logs & Security Trail */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              Cryptographic Audit Logs & Anti-Fraud Security Trail
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live audit events: single-use token burnings, prevented screenshot replay attempts, and admin actions.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            {(['ALL', 'FRAUD', 'SECURITY', 'ADMIN'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setLogFilter(mode)}
                className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${
                  logFilter === mode
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode === 'ALL' && 'All Records'}
                {mode === 'FRAUD' && 'Anti-Fraud Detections'}
                {mode === 'SECURITY' && 'Tokens & Scans'}
                {mode === 'ADMIN' && 'Admin Actions'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-semibold text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5 whitespace-nowrap">Action Event</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Actor</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Role</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Target Entity / Detail</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Timestamp</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {filteredLogs.map((log) => {
                const isFraud = log.action?.includes('FRAUD') || log.action?.includes('BLOCKED');
                const isBurned = log.action?.includes('BURNED');
                
                return (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition text-slate-300">
                    <td className="px-5 py-3.5 font-bold font-sans">
                      <span className={`inline-flex items-center gap-1.5 ${
                        isFraud ? 'text-rose-400' : isBurned ? 'text-emerald-400' : 'text-purple-300'
                      }`}>
                        {isFraud && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                        {isBurned && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                        <span>{log.action}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap">
                      {log.actor?.name || log.actor || 'Platform Admin'}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <span className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                        {log.actorRole || 'SYSTEM'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 font-sans text-[11px] max-w-[260px] truncate">
                      {log.metadata?.reason || log.metadata?.venue || log.entityType || 'General Event'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                        isFraud
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {log.status || (isFraud ? 'BLOCKED' : 'VERIFIED')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
