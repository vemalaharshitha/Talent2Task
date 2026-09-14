import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  Smartphone, 
  Building, 
  Wallet, 
  CheckCircle2, 
  Loader2,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Job, PaymentTransaction } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizeContent } from '../../i18n/translations';
import { sqliteManager } from '../../db/sqliteManager';

interface PayNowModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (paymentMethod: 'UPI' | 'Card' | 'Net Banking' | 'Wallet') => Promise<PaymentTransaction | null>;
}

export const PayNowModal: React.FC<PayNowModalProps> = ({
  job,
  isOpen,
  onClose,
  onConfirmPayment
}) => {
  const { language } = useLanguage();

  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'Net Banking' | 'Wallet'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedTxn, setCompletedTxn] = useState<PaymentTransaction | null>(() => {
    return sqliteManager.getTransactionByJobId(job.id);
  });

  if (!isOpen || !job) return null;

  const isAlreadyPaid = job.payment_status === 'PAID' || Boolean(job.payment_transaction_id) || sqliteManager.isJobPaid(job.id);
  const seekerName = job.claimed_by_name || 'Assigned Seeker';
  const localizedGigTitle = localizeContent(job.title, language);
  const amount = job.payout_amount;

  const handlePayNow = async () => {
    if (isAlreadyPaid) {
      const existing = sqliteManager.getTransactionByJobId(job.id);
      if (existing) {
        setCompletedTxn(existing);
        return;
      }
    }
    setIsProcessing(true);
    try {
      // Simulate real-world network gateway handoff
      await new Promise(resolve => setTimeout(resolve, 1000));
      const txn = await onConfirmPayment(paymentMethod);
      if (txn) {
        setCompletedTxn(txn);
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
        } catch {}
      } else {
        alert('Payment could not be processed at this time. Please try again.');
      }
    } catch (e: any) {
      alert('Payment could not be completed: ' + (e.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsProcessing(false);
    setCompletedTxn(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl animate-scaleUp overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {completedTxn ? 'Payment Successful' : 'Pay Now'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {completedTxn ? 'Transaction completed successfully' : 'Instant & secure verified payout'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {completedTxn ? (
            /* Success View */
            <div className="text-center space-y-4 py-2 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  Payment Successful
                </span>
                <div className="text-3xl font-black text-slate-900 mt-2">
                  ₹{completedTxn.amount.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Paid to <span className="font-bold text-slate-800">{completedTxn.seeker_name}</span>
                </div>
              </div>

              {/* Receipt Box */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                    <Receipt className="w-3.5 h-3.5 text-slate-400" />
                    <span>Transaction ID:</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800">{completedTxn.id}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Gig:</span>
                  <span className="font-semibold text-slate-800 max-w-[200px] truncate text-right">{completedTxn.job_title}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Payment Method:</span>
                  <span className="font-semibold text-slate-800">{completedTxn.payment_method}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Status:</span>
                  <span className="font-bold text-emerald-600">Payment Successful</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition shadow-sm cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : isProcessing ? (
            /* Processing Loader View */
            <div className="text-center py-10 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900">
                  Processing Payment...
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Transferring ₹{amount} to {seekerName}...
                </p>
              </div>
            </div>
          ) : (
            /* Payment Details & Method Selection */
            <>
              {/* Gig & Seeker Info Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Gig:</span>
                  <span className="font-bold text-slate-900 text-sm">{localizedGigTitle}</span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
                  <div>
                    <span className="text-slate-500 font-medium block">Seeker:</span>
                    <span className="font-bold text-slate-800">{seekerName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 font-medium block">Amount:</span>
                    <span className="font-black text-sky-600 text-lg">₹{amount}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Payment Method:</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI', desc: 'Google Pay, PhonePe, Paytm', icon: Smartphone },
                    { id: 'Card', label: 'Card', desc: 'Debit / Credit Card', icon: CreditCard },
                    { id: 'Net Banking', label: 'Net Banking', desc: 'All Indian Banks', icon: Building },
                    { id: 'Wallet', label: 'Wallet', desc: 'Amazon Pay, Mobikwik', icon: Wallet }
                  ].map(method => {
                    const isSelected = paymentMethod === method.id;
                    const Icon = method.icon;
                    return (
                      <button
                        type="button"
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50/80 border-sky-400 ring-2 ring-sky-500/20 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 flex items-center gap-1">
                            <span>{method.label}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">{method.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons: [ Cancel ] [ Pay Now ] */}
              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handlePayNow}
                  disabled={isProcessing}
                  className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/30 flex items-center justify-center gap-2 transition cursor-pointer active:scale-[0.99] disabled:opacity-60"
                  style={{ backgroundColor: '#0284c7', color: '#ffffff' }}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isProcessing ? 'Processing...' : 'Pay Now'}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
