
import React, { useMemo, useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ShoppingBag, ArrowLeft, Store, Truck, Calendar, CheckCircle2, Clock, MapPin, Receipt, RefreshCw, Smartphone, ChevronRight, User, Package, Copy, Send, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO';
import { DealStatus, DeliveryType, ServiceType } from '../../types';
import PaymentGateway from '../wallet/PaymentGateway';

const MyOrders: React.FC = () => {
  const { currentUser, deals, users, updateCustomerTracking, processEscrowPayment, cancelOrder } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL');
  
  // State for Tracking Input
  const [trackingDealId, setTrackingDealId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  // State for Delayed Payment (Repair Courier)
  const [paymentDeal, setPaymentDeal] = useState<{id: string, amount: number} | null>(null);

  // Cancel Modal State
  const [cancelDealId, setCancelDealId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const myPurchases = useMemo(() => {
      if (!currentUser) return [];
      let list = deals.filter(d => d.buyerId === currentUser.id);
      
      if (filter === 'ACTIVE') return list.filter(d => d.status !== DealStatus.COMPLETED && d.status !== DealStatus.CANCELLED);
      if (filter === 'COMPLETED') return list.filter(d => d.status === DealStatus.COMPLETED);
      
      return list;
  }, [deals, currentUser, filter]);

  const stats = useMemo(() => {
      const list = deals.filter(d => d.buyerId === currentUser?.id && d.status === DealStatus.COMPLETED);
      return {
          totalSpent: list.reduce((sum, d) => sum + d.amount, 0),
          itemsCount: list.length,
          exchanges: list.filter(d => d.serviceType === ServiceType.EXCHANGE).length
      };
  }, [deals, currentUser]);

  const handleUpdateTracking = async () => {
      if (!trackingDealId || !trackingInput.trim()) return;
      await updateCustomerTracking(trackingDealId, trackingInput.trim());
      setTrackingDealId(null);
      setTrackingInput('');
      alert("Tracking Updated! Shop notified.");
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      alert("Address copied!");
  };

  const handleLatePayment = (dealId: string, amount: number) => {
      setPaymentDeal({ id: dealId, amount });
  };

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <SEO title="Service Record Book" description="Detailed history of your purchases and visits." />

      {/* Delayed Payment Gateway */}
      {paymentDeal && (
          <PaymentGateway 
              amount={paymentDeal.amount}
              isOpen={true}
              onClose={() => setPaymentDeal(null)}
              onSuccess={(pid) => processEscrowPayment(paymentDeal.id, pid, DeliveryType.REPAIR_COURIER)}
          />
      )}

      <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-6">
               <button onClick={() => navigate(-1)} className="p-2 bg-white border border-gray-200 rounded-full md:hidden">
                   <ArrowLeft size={20} className="text-gray-600" />
               </button>
               <div>
                   <h1 className="text-2xl font-black text-gray-900 leading-none">SERVICE BOOK</h1>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">History & Repairs</p>
               </div>
          </div>

          {/* --- CANCEL MODAL --- */}
          {cancelDealId && (
              <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl animate-in zoom-in-95">
                      <h3 className="text-xl font-black mb-2 text-red-600">Cancel Order</h3>
                      <p className="text-xs text-gray-500 mb-4">Are you sure you want to cancel this order? Please provide a reason.</p>
                      <input 
                          type="text" 
                          placeholder="Reason (e.g., Changed my mind)" 
                          className="w-full p-4 border-2 border-slate-200 rounded-xl mb-6 font-bold outline-none focus:border-red-500" 
                          value={cancelReason} 
                          onChange={e => setCancelReason(e.target.value)} 
                      />
                      <div className="flex gap-3">
                          <button onClick={() => { setCancelDealId(null); setCancelReason(''); }} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-sm">Close</button>
                          <button 
                              onClick={() => {
                                  if (cancelReason.trim()) {
                                      cancelOrder(cancelDealId, cancelReason);
                                      setCancelDealId(null);
                                      setCancelReason('');
                                  }
                              }} 
                              disabled={!cancelReason.trim()}
                              className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
                          >
                              Confirm Cancel
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {/* SUMMARY CARD */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl mb-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Receipt size={80}/></div>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Total Items</p>
                      <h3 className="text-2xl font-black">{stats.itemsCount}</h3>
                  </div>
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Total Spent</p>
                      <h3 className="text-2xl font-black text-blue-400">₹{stats.totalSpent.toLocaleString()}</h3>
                  </div>
              </div>
          </div>

          {/* FILTERS */}
          <div className="flex gap-2 mb-6">
              {['ALL', 'ACTIVE', 'COMPLETED'].map((f: any) => (
                  <button 
                    key={f} 
                    onClick={() => setFilter(f)}
                    className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${filter === f ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-400 border-gray-100'}`}
                  >
                      {f}
                  </button>
              ))}
          </div>

          {myPurchases.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                  <ShoppingBag size={40} className="mx-auto text-gray-200 mb-3"/>
                  <p className="text-gray-400 font-bold text-sm">No records found.</p>
              </div>
          ) : (
              <div className="space-y-4">
                  {myPurchases.map(deal => {
                      const seller = users.find(u => u.id === deal.sellerId);
                      const isShopVisit = deal.deliveryType === DeliveryType.SHOP_VISIT;
                      const isRepairCourier = deal.deliveryType === DeliveryType.REPAIR_COURIER;
                      const isDone = deal.status === DealStatus.COMPLETED;
                      const isPaymentPending = deal.status === DealStatus.PAYMENT_PENDING;

                      return (
                          <div 
                            key={deal.id} 
                            onClick={() => navigate(`/deal/${deal.id}`)}
                            className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all group cursor-pointer"
                          >
                              <div className="flex gap-4">
                                  {/* Item Image */}
                                  <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border">
                                      <img src={deal.listingImages?.[0] || deal.listingImage || 'https://placehold.co/100x100?text=No+Image'} className="w-full h-full object-cover" />
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start mb-1">
                                          <h4 className="text-sm font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">{deal.title}</h4>
                                          <span className="text-xs font-black text-slate-900">₹{deal.amount}</span>
                                      </div>
                                      
                                      <div className="flex items-center gap-2 mb-3">
                                          {isRepairCourier ? (
                                              <span className="bg-orange-100 text-orange-700 text-[9px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                                  <Smartphone size={10}/> Repair Courier
                                              </span>
                                          ) : isShopVisit ? (
                                              <span className="bg-slate-100 text-slate-600 text-[9px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                                  <Store size={10}/> Visit Shop
                                              </span>
                                          ) : (
                                              <span className="bg-blue-100 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">
                                                  <Truck size={10}/> Courier
                                              </span>
                                          )}
                                      </div>
                                  </div>
                              </div>

                              {/* REPAIR COURIER ACTION SECTION */}
                              {isRepairCourier && !isDone && (
                                  <div className="mt-4 bg-orange-50 rounded-2xl p-4 border border-orange-100" onClick={(e) => e.stopPropagation()}>
                                      {/* STEP 1: PAYMENT (If Pending) */}
                                      {isPaymentPending ? (
                                          <div className="text-center">
                                              <div className="bg-white p-4 rounded-xl border border-orange-200 mb-3">
                                                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Final Repair Cost</p>
                                                  <p className="text-3xl font-black text-slate-900">₹{deal.amount.toLocaleString()}</p>
                                                  <p className="text-[10px] text-gray-400 mt-2">Admin checked your device and set this price.</p>
                                              </div>
                                              <button 
                                                onClick={() => handleLatePayment(deal.id, deal.amount)}
                                                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 transition active:scale-95 animate-pulse"
                                              >
                                                  <DollarSign size={18}/> PAY NOW
                                              </button>
                                          </div>
                                      ) : (
                                          <>
                                              <div className="flex justify-between items-center mb-2">
                                                  <h4 className="text-xs font-bold text-orange-800">Step 1: Ship Phone To Shop</h4>
                                              </div>
                                              
                                              <div className="bg-white p-3 rounded-xl border border-orange-100 text-xs text-gray-600 mb-3 relative">
                                                  <p className="font-bold text-slate-900 mb-1">{seller?.shopName}</p>
                                                  <p className="leading-tight">{seller?.address || "Address unavailable"}</p>
                                                  <button 
                                                    onClick={() => copyToClipboard(seller?.address || '')}
                                                    className="absolute top-2 right-2 text-blue-600 p-1"
                                                  >
                                                      <Copy size={14}/>
                                                  </button>
                                              </div>

                                              {deal.customerTrackingNumber ? (
                                                  <div className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-2 rounded-xl text-xs font-bold">
                                                      <CheckCircle2 size={16}/> Tracking Sent: {deal.customerTrackingNumber}
                                                  </div>
                                              ) : (
                                                  <div className="space-y-2">
                                                      <label className="text-[10px] font-bold text-orange-600 uppercase">Step 2: Enter Your Courier Details</label>
                                                      <div className="flex gap-2">
                                                          <input 
                                                            type="text" 
                                                            placeholder="Courier Name & Tracking No" 
                                                            className="flex-1 p-2 rounded-lg border border-orange-200 text-xs font-bold focus:outline-none focus:border-orange-500"
                                                            value={trackingDealId === deal.id ? trackingInput : ''}
                                                            onChange={(e) => {
                                                                setTrackingDealId(deal.id);
                                                                setTrackingInput(e.target.value);
                                                            }}
                                                          />
                                                          <button 
                                                            onClick={handleUpdateTracking}
                                                            className="bg-orange-600 text-white p-2 rounded-lg"
                                                          >
                                                              <Send size={16}/>
                                                          </button>
                                                      </div>
                                                  </div>
                                              )}
                                          </>
                                      )}
                                  </div>
                              )}

                              {/* TIMELINE / STATUS */}
                              <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
                                  <div className="flex justify-between items-center">
                                      <div>
                                          <p className={`text-[10px] font-black uppercase ${isDone ? 'text-slate-900' : isPaymentPending ? 'text-orange-500' : 'text-gray-300'}`}>
                                              {isDone ? 'Completed' : isPaymentPending ? 'Waiting for Payment' : 'Processing'}
                                          </p>
                                          <p className="text-[9px] text-gray-400 font-bold">
                                              Order ID: #{deal.id.substring(0,8).toUpperCase()}
                                          </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          {!isDone && deal.status !== DealStatus.SHIPPED && deal.status !== DealStatus.CANCELLED && (
                                              <button 
                                                  onClick={(e) => {
                                                      e.stopPropagation();
                                                      setCancelDealId(deal.id);
                                                  }}
                                                  className="text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                                              >
                                                  Cancel
                                              </button>
                                          )}
                                          {isDone ? <CheckCircle2 size={18} className="text-green-500"/> : <Clock size={18} className="text-blue-500"/>}
                                      </div>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
              </div>
          )}
      </div>
    </div>
  );
};

export default MyOrders;
