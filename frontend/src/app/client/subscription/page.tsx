'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../lib/auth-context';
import { api } from '../../../lib/api';
import {
  CreditCard,
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
  Building,
  Users,
  CheckCircle2,
  Download,
  Receipt,
  ArrowRight,
  RefreshCw,
  Lock,
  QrCode,
  Smartphone,
  ExternalLink,
} from 'lucide-react';

export default function ClientSubscriptionPage() {
  const { business } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [checkoutPlan, setCheckoutPlan] = useState<any | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const targetBizId = business?.id || 'biz_smashzone';

  const loadData = async () => {
    setIsRefreshing(true);
    try {
      const [plansRes, subRes, invRes] = await Promise.all([
        api.getPlans(),
        api.getSubscription(targetBizId),
        api.getInvoices(targetBizId),
      ]);

      if (plansRes.success && plansRes.data) setPlans(plansRes.data);
      if (subRes.success && subRes.data) setCurrentSub(subRes.data);
      if (invRes.success && invRes.data) setInvoices(invRes.data);
    } catch (err) {
      console.error('Failed to load subscription data:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [business, targetBizId]);

  const handleOpenCheckout = (plan: any) => {
    setCheckoutPlan(plan);
  };

  const handleCompletePayment = async () => {
    if (!checkoutPlan) return;
    setProcessing(true);
    try {
      // 1. Create checkout order
      const checkoutRes = await api.createCheckout(targetBizId, checkoutPlan.id);
      const orderId = checkoutRes.data?.orderId || `order_${Date.now()}`;

      // 2. Verify and activate subscription
      const res = await api.verifyPayment({
        businessId: targetBizId,
        planId: checkoutPlan.id,
        billingCycle,
        orderId,
        paymentId: `pay_${Math.random().toString(36).substring(2, 9)}`,
        signature: 'mock_goldstamp_signature_verified',
      });

      if (res.success) {
        setSuccessToast(`Success! Your venue is now on the ${checkoutPlan.name} Plan!`);
        setCheckoutPlan(null);
        await loadData();
        setTimeout(() => setSuccessToast(null), 5000);
      }
    } catch (err) {
      console.error('Payment activation error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const activePlanId = currentSub?.planId || currentSub?.plan?.id || 'plan_growth';
  const activePlan = plans.find((p) => p.id === activePlanId) || currentSub?.plan;

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-2">
      {/* Toast Banner */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 underline text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SaaS Subscription & Billing</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage your Gold Stamp venue plan, scale counter terminal quotas, and download tax invoices.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={isRefreshing}
            className="p-2 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition"
            title="Refresh Subscription Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs shadow-inner">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                billingCycle === 'MONTHLY' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('ANNUAL')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 ${
                billingCycle === 'ANNUAL' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Subscription Overview Card */}
      {currentSub && (
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                    CURRENT PLAN
                  </span>
                  <span className="text-xs text-slate-400">
                    Auto-Renews: {new Date(currentSub.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-2xl font-black text-white mt-1">
                  {activePlan?.name || 'Growth'} Plan
                  <span className="text-sm font-medium text-slate-400 ml-2">
                    (₹{currentSub.amount || activePlan?.price} / {currentSub.billingCycle?.toLowerCase() || 'month'})
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  {activePlan?.description || 'Premier digital loyalty pass engine with multi-terminal support.'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap lg:flex-col items-start lg:items-end gap-2 border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-800">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                STATUS: {currentSub.status || 'ACTIVE'}
              </span>
              <span className="text-xs text-slate-400">
                Payment: <strong className="text-slate-200">{currentSub.paymentMethod || 'UPI AutoPay'}</strong>
              </span>
            </div>
          </div>

          {/* Quotas & Capacity Usage Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800/80 text-xs">
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-slate-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-400" /> Branches Quota
                </span>
                <span className="font-bold text-white">1 of {activePlan?.maxBranches >= 999 ? '∞' : activePlan?.maxBranches || 3}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-emerald-500 rounded-full" />
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-slate-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-400" /> Staff Logins
                </span>
                <span className="font-bold text-white">2 of {activePlan?.maxStaff >= 999 ? '∞' : activePlan?.maxStaff || 10}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-1/5 h-full bg-indigo-500 rounded-full" />
              </div>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
              <div className="flex justify-between text-slate-400 mb-1">
                <span className="flex items-center gap-1.5">
                  <QrColorIcon /> Customer Scans
                </span>
                <span className="font-bold text-emerald-400">Unlimited (Fair Use)</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-full h-full bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Matrix */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-6">
          <h2 className="text-xl font-bold text-slate-900">Choose the Right Tier for Your Venue</h2>
          <p className="text-xs text-slate-500 mt-1">
            Seamlessly switch plans anytime. Changes take effect instantly with automated pro-rata billing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isCurrent = activePlanId === p.id;
            const isPopular = p.code === 'GROWTH';
            const price = billingCycle === 'ANNUAL' ? p.annualPrice || p.price : p.price;

            return (
              <div
                key={p.id}
                className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all relative ${
                  isCurrent
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : isPopular
                    ? 'border-emerald-400 shadow-lg ring-1 ring-emerald-400/30'
                    : 'border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[10px] font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Most Popular
                  </span>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900">{p.name}</span>
                    {isCurrent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 mt-1 min-h-[32px]">{p.description}</p>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">₹{price}</span>
                    <span className="text-xs text-slate-400 font-semibold">
                      /{billingCycle === 'ANNUAL' ? 'mo (billed annually)' : 'month'}
                    </span>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                    {p.features?.map((f: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full bg-slate-100 text-slate-400 font-bold text-xs py-2.5 rounded-xl cursor-default flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Current Active Plan
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenCheckout(p)}
                      className={`w-full font-bold text-xs py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 ${
                        isPopular
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <span>Switch to {p.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoices & Billing History Section */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-slate-900 text-base">Invoices & Payment History</h3>
          </div>
          <span className="text-xs text-slate-400">GST-compliant Tax Receipts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Invoice #</th>
                <th className="px-6 py-3.5">Billed Plan</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-900">{inv.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{inv.planName}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(inv.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{inv.amount}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          alert(`Downloading official tax receipt for ${inv.id} (₹${inv.amount})...`);
                        }}
                        className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                      >
                        <Download className="w-3.5 h-3.5" /> Receipt
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No billing transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Razorpay Checkout Modal */}
      {checkoutPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Confirm Plan Upgrade</h3>
                  <p className="text-[11px] text-slate-500">Instant activation via Razorpay Gateway</p>
                </div>
              </div>
              <button
                onClick={() => setCheckoutPlan(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Order Summary Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Selected Plan</span>
                <strong className="text-slate-900">{checkoutPlan.name}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Billing Frequency</span>
                <span className="font-semibold text-slate-800">
                  {billingCycle === 'ANNUAL' ? 'Annual (12 Months)' : 'Monthly'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax (GST 18% included)</span>
                <span>Included</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
                <span>Total Payable</span>
                <span className="text-emerald-600 text-base">
                  ₹{billingCycle === 'ANNUAL' ? (checkoutPlan.annualPrice || checkoutPlan.price) * 12 : checkoutPlan.price}
                </span>
              </div>
            </div>

            {/* Simulated Payment Method Selector */}
            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-700 block">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2 transition ${
                    paymentMethod === 'upi'
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="leading-tight">UPI AutoPay</div>
                    <div className="text-[10px] text-slate-400 font-normal">GPay, PhonePe, Paytm</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2 transition ${
                    paymentMethod === 'card'
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="leading-tight">Credit/Debit Card</div>
                    <div className="text-[10px] text-slate-400 font-normal">Visa, Mastercard</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCheckoutPlan(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompletePayment}
                disabled={processing}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {processing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing Gateway...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay & Activate Instantly</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QrColorIcon() {
  return <QrCode className="w-3.5 h-3.5 text-emerald-400" />;
}
