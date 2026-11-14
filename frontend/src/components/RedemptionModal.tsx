'use client';

import React from 'react';
import { Gift, X, Copy, Check, Sparkles } from 'lucide-react';

interface RedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  redemption: any;
}

export const RedemptionModal: React.FC<RedemptionModalProps> = ({
  isOpen,
  onClose,
  redemption,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !redemption) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(redemption.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative border border-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 mb-4">
          <Gift className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full">
          Reward Ready to Redeem
        </span>

        <h3 className="text-xl font-bold text-slate-900 mt-2">
          {redemption.reward?.title || 'Exclusive Reward'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Present this redemption code to the cashier or court staff when checking out.
        </p>

        <div className="mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 py-1 px-3 rounded-full inline-flex items-center gap-1.5 mx-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>Synced to WhatsApp & Gmail Inbox Simultaneously</span>
        </div>

        {/* Voucher Code Box */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border-2 border-dashed border-emerald-300 relative group">
          <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
            Voucher Code
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-wider font-mono my-1 select-all">
            {redemption.code}
          </div>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 mt-1"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Gold Stamp Loyalty Voucher: ${redemption.code}\nReward: ${redemption.reward?.title || 'Reward'}\nShow this voucher code at the counter to redeem.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-xs flex items-center justify-center gap-2"
          >
            <span>Send Voucher to WhatsApp</span>
          </a>

          <button
            onClick={onClose}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
