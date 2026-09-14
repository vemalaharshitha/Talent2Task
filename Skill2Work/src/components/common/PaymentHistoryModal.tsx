import React from 'react';
import { 
  X, 
  CreditCard, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Receipt, 
  Calendar, 
  ShieldCheck, 
  Building2, 
  Smartphone, 
  Wallet 
} from 'lucide-react';
import type { PaymentTransaction, User } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { localizeContent } from '../../i18n/translations';

interface PaymentHistoryModalProps {
  user: User;
  transactions: PaymentTransaction[];
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  user,
  transactions,
  isOpen,
  onClose
}) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const isRecruiter = user.role === 'recruiter';
  const userTransactions = transactions.filter(
    tx => tx.recruiter_id === user.id || tx.seeker_id === user.id
  );

  const totalAmount = userTransactions.reduce((acc, tx) => acc + (tx.amount || 0), 0);

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'UPI':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'Card':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'Net Banking':
        return <Building2 className="w-3.5 h-3.5" />;
      default:
        return <Wallet className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl max-h-[85vh] shadow-2xl animate-scaleUp overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Payment History
              </h3>
              <p className="text-xs text-slate-500">
                {isRecruiter 
                  ? `Verified payouts to candidates (${userTransactions.length})` 
                  : `Verified payments received for completed gigs (${userTransactions.length})`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Summary Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
              {isRecruiter ? 'Total Disbursed' : 'Total Earnings Received'}
            </div>
            <div className="text-2xl font-black mt-0.5 text-white">
              ₹{totalAmount.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold backdrop-blur-xs text-sky-300 border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Verified Transactions</span>
          </div>
        </div>

        {/* Transactions List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {userTransactions.length > 0 ? (
            userTransactions.map((txn) => {
              const localizedTitle = localizeContent(txn.job_title, language);

              return (
                <div
                  key={txn.id}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs transition-all space-y-3"
                >
                  {/* Top row: Status, Amount, Direction */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isRecruiter ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {isRecruiter ? (
                          <ArrowUpRight className="w-5 h-5" />
                        ) : (
                          <ArrowDownLeft className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        {/* Requirement 6: Recruiter: "Payment Successful", Seeker: "Payment Received" */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isRecruiter 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isRecruiter ? 'Payment Successful' : 'Payment Received'}</span>
                        </span>

                        {/* Recipient / Sender Name as per Requirement 6 */}
                        <div className="text-xs text-slate-600 mt-1 font-medium">
                          {isRecruiter ? (
                            <>To: <span className="font-bold text-slate-900">{txn.seeker_name}</span></>
                          ) : (
                            <>From: <span className="font-bold text-slate-900">{txn.recruiter_name}</span></>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      {/* Amount */}
                      <div className="text-lg font-black text-slate-900">
                        ₹{txn.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        / {localizeContent(txn.payout_unit || 'per task', language)}
                      </div>
                    </div>
                  </div>

                  {/* Gig Title & Meta Details */}
                  <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100">
                    <div className="font-semibold text-slate-800 line-clamp-1">
                      {localizedTitle}
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 gap-2">
                      <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-600">
                        <Receipt className="w-3 h-3 text-slate-400" />
                        <span>{txn.id}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {getMethodIcon(txn.payment_method)}
                          <span>{txn.payment_method}</span>
                        </div>

                        <div className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{txn.created_at}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">No Payment Transactions Yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {isRecruiter 
                  ? 'When you complete and pay for candidate gigs via "Pay Now", your transaction receipts will appear here.'
                  : 'When recruiters process payouts for your accepted gigs, your receipts will be recorded here.'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
