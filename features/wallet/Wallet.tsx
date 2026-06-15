
import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Lock, CreditCard, Landmark, Plus, X, ArrowLeft, Info, Hourglass, CheckCircle2, Smartphone, Receipt, Eye, ArrowDownLeft, XCircle, AlertCircle, ShoppingBag, User } from 'lucide-react';
import { WALLET_TEXT } from './walletConstants';

const Wallet: React.FC = () => {
  const { currentUser, transactions, withdrawFunds, deals, users } = useApp();
  const navigate = useNavigate();
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewProofUrl, setViewProofUrl] = useState<string | null>(null);

  if (!currentUser) return null;

  const myTransactions = transactions.filter(t => t.userId === currentUser.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleWithdraw = async () => {
    const amt = Number(withdrawAmount);
    if (!amt || amt > currentUser.walletBalance) return;
    
    // Check for either Bank Details OR UPI ID
    if (!currentUser.bankDetails && !currentUser.upiId) {
        // Direct redirect to Profile -> Bank Section
        navigate('/profile', { state: { initialView: 'BANK' } });
        return;
    }

    setLoading(true);
    await withdrawFunds(amt);
    setLoading(false);
    setShowWithdraw(false);
    setWithdrawAmount('');
  };

  const handleAddBank = () => {
      navigate('/profile', { state: { initialView: 'BANK' } });
  };

  // Helper to render transaction status nicely
  const getTransactionDetails = (tx: any) => {
      if (tx.type === 'WITHDRAWAL') {
          if (tx.status === 'PENDING') {
              return {
                  icon: <Hourglass size={18} />,
                  bg: 'bg-orange-100',
                  text: 'text-orange-700',
                  statusText: 'Waiting for Admin Approval',
                  amountColor: 'text-gray-500',
                  sign: '-'
              };
          } else if (tx.status === 'FAILED') {
              return {
                  icon: <XCircle size={18} />,
                  bg: 'bg-red-100',
                  text: 'text-red-700',
                  statusText: 'Withdrawal Rejected (Refunded)',
                  amountColor: 'text-gray-400 line-through', // Strike through amount if rejected
                  sign: ''
              };
          } else {
              return {
                  icon: <CheckCircle2 size={18} />,
                  bg: 'bg-green-100',
                  text: 'text-green-700',
                  statusText: 'Sent to Bank Successfully',
                  amountColor: 'text-red-600',
                  sign: '-'
              };
          }
      } else if (tx.type === 'ESCROW_LOCK') {
          return {
              icon: <Lock size={18} />,
              bg: 'bg-gray-100',
              text: 'text-gray-600',
              statusText: 'Paid to Admin',
              amountColor: 'text-gray-800',
              sign: ''
          };
      } else if (tx.type === 'REFUND') {
          return {
              icon: <ArrowDownLeft size={18} />,
              bg: 'bg-blue-100',
              text: 'text-blue-700',
              statusText: 'Refund Received',
              amountColor: 'text-green-600',
              sign: '+'
          };
      } else {
          // ESCROW_RELEASE (Sale Income) or Manual Add
          return {
              icon: <ArrowDownLeft size={18} />,
              bg: 'bg-green-50',
              text: 'text-green-600',
              statusText: 'Payout from Admin',
              amountColor: 'text-green-600',
              sign: '+'
          };
      }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Proof Modal */}
      {viewProofUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setViewProofUrl(null)}>
              <div className="relative max-w-full max-h-full">
                  <button onClick={() => setViewProofUrl(null)} className="absolute -top-10 right-0 text-white p-2 bg-white/10 rounded-full"><X/></button>
                  <img src={viewProofUrl} className="max-w-full max-h-[80vh] rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
              </div>
          </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
             <button onClick={() => navigate(-1)} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition md:hidden">
                 <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">{WALLET_TEXT.TITLE}</h2>
        </div>
        <div className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 border border-slate-700">
           <Lock size={12} className="text-blue-400" /> SECURE PAYMENTS
        </div>
      </div>

      {/* Balances Card */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
              <Landmark size={120} />
          </div>
          <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                  <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Available Balance</p>
                      <h3 className="text-4xl font-extrabold">₹{currentUser.walletBalance.toLocaleString()}</h3>
                  </div>
                  <div className="bg-blue-600/20 p-3 rounded-2xl border border-blue-500/30">
                      <CreditCard size={24} className="text-blue-400" />
                  </div>
              </div>

              <div className="flex gap-3">
                  <button 
                    onClick={() => setShowWithdraw(true)}
                    className="flex-1 bg-white text-slate-900 font-bold py-3.5 rounded-xl shadow-lg hover:bg-slate-100 transition active:scale-95 flex items-center justify-center gap-2"
                  >
                      <ArrowUpRight size={18} /> {WALLET_TEXT.WITHDRAW_BUTTON}
                  </button>
                  {/* Placeholder for Add Money if needed later */}
                  <div className="w-14"></div> 
              </div>
          </div>
      </div>

      {/* HELP BOX FOR NEW USERS */}
      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
          <Info className="text-blue-600 flex-shrink-0" size={24} />
          <div>
              <h4 className="text-sm font-bold text-blue-900">Payment Safety</h4>
              <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                  All payments are securely handled by <strong>TrustSpares Admin</strong>. 
                  Sellers receive money after the order is successfully delivered.
              </p>
          </div>
      </div>

      {/* Withdrawal Drawer */}
      {showWithdraw && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-white w-full max-md rounded-t-3xl p-8 animate-in slide-in-from-bottom duration-300">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Withdraw Funds</h3>
                      <button onClick={() => setShowWithdraw(false)} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="space-y-6">
                      {!currentUser.bankDetails && !currentUser.upiId ? (
                          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl text-center">
                              <p className="text-xs text-amber-800 font-bold mb-3">Payout Details Missing</p>
                              <button 
                                onClick={handleAddBank} 
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl text-sm transition"
                              >
                                  Add Bank / UPI Now
                              </button>
                          </div>
                      ) : (
                          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between text-sm font-bold">
                              <span>Payout To</span>
                              {currentUser.upiId ? (
                                  <span className="flex items-center gap-1 text-purple-700"><Smartphone size={16}/> {currentUser.upiId}</span>
                              ) : (
                                  <span className="flex items-center gap-1 text-slate-700"><Landmark size={16}/> {currentUser.bankDetails?.bankName}</span>
                              )}
                          </div>
                      )}
                      <div>
                          <input 
                            type="number" 
                            className="w-full bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 text-2xl font-bold focus:border-blue-500 outline-none"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="₹ 0"
                            disabled={!currentUser.bankDetails && !currentUser.upiId}
                          />
                      </div>
                      <button 
                        onClick={handleWithdraw}
                        disabled={!currentUser.bankDetails && !currentUser.upiId}
                        className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                          {loading ? "Processing..." : "Confirm Withdrawal"}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Transactions list */}
      <div className="space-y-4 pt-4">
        <h3 className="font-bold text-gray-900 text-lg">Transaction History</h3>
        <div className="space-y-3">
            {myTransactions.map(tx => {
                const style = getTransactionDetails(tx);
                
                // --- CUSTOM LOGIC TO FETCH BUYER DETAILS ---
                let description = tx.description;
                let subText = style.statusText;
                
                if (tx.type === 'ESCROW_RELEASE' && tx.dealId) {
                    const deal = deals.find(d => d.id === tx.dealId);
                    if (deal) {
                        const buyer = users.find(u => u.id === deal.buyerId);
                        
                        description = (
                            <span className="flex flex-col">
                                <span className="flex items-center gap-1">
                                    Sold: {deal.title}
                                </span>
                            </span>
                        ) as any;

                        if (buyer) {
                            subText = `From Buyer: ${buyer.name}`;
                        } else {
                            subText = 'Order Payout';
                        }
                    }
                } else if (tx.type === 'ESCROW_LOCK') {
                    // Update text for Payments sent to Admin
                    subText = 'Paid to Admin';
                }
                // -------------------------------------------

                return (
                    <div key={tx.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.bg} ${style.text}`}>
                                {style.icon}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">{description}</p>
                                <div className="flex flex-col">
                                    <span className={`text-[10px] font-bold mt-0.5 ${style.text} flex items-center gap-1`}>
                                        {tx.type === 'ESCROW_RELEASE' && <User size={10}/>} {subText}
                                    </span>
                                    <span className="text-[10px] text-gray-400">{new Date(tx.date).toLocaleDateString()}</span>
                                </div>
                                
                                {/* View Receipt Button for Approved Withdrawals */}
                                {tx.proofImage && tx.status === 'COMPLETED' && tx.type === 'WITHDRAWAL' && (
                                    <button 
                                        onClick={() => setViewProofUrl(tx.proofImage!)}
                                        className="mt-1 flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded-md font-bold hover:bg-blue-100 w-fit"
                                    >
                                        <Eye size={10} /> View Bank Proof
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className={`font-mono font-bold text-lg ${style.amountColor}`}>
                            {style.sign}₹{tx.amount.toLocaleString()}
                        </p>
                    </div>
                );
            })}
            {myTransactions.length === 0 && (
                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <AlertCircle className="mx-auto text-gray-300 mb-2" size={32}/>
                    <p className="text-gray-400 text-sm font-bold">No transaction history yet.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Wallet;
