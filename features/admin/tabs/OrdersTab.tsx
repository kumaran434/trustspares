
import React, { useState, useMemo } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Truck, Store, MapPin, User, Package, CheckCircle2, Clock, Send, Phone, Smartphone, IndianRupee, BellRing } from 'lucide-react';
import { DealStatus, DeliveryType } from '../../../types';

const OrdersTab: React.FC = () => {
    const { deals, users, markOrderShipped, verifyPickup, currentUser, sendRepairQuote, cancelOrder } = useApp();
    const [filter, setFilter] = useState<'ALL' | 'COURIER' | 'VISIT' | 'COMPLETED'>('ALL');
    
    // Shipping Modal State
    const [shippingDeal, setShippingDeal] = useState<string | null>(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [courierName, setCourierName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Verify OTP Modal State
    const [verifyingDeal, setVerifyingDeal] = useState<string | null>(null);
    const [otpInput, setOtpInput] = useState('');

    // Quote Modal State
    const [quoteDeal, setQuoteDeal] = useState<string | null>(null);
    const [repairCost, setRepairCost] = useState('');

    // Cancel Modal State
    const [cancelDealId, setCancelDealId] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState('');

    const orders = useMemo(() => {
        // Show orders where the seller is the current admin user (or show all if you want centralized)
        // Assuming Admin wants to see orders for THEIR stock:
        return deals.filter(d => 
            (currentUser?.isAdmin ? true : d.sellerId === currentUser?.id) && 
            d.status !== DealStatus.DRAFT && 
            d.status !== DealStatus.AVAILABLE &&
            d.status !== DealStatus.CANCELLED
        ).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [deals, currentUser]);

    const filteredOrders = useMemo(() => {
        if (filter === 'COMPLETED') return orders.filter(d => d.status === DealStatus.SHIPPED || d.status === DealStatus.COMPLETED);
        if (filter === 'COURIER') return orders.filter(d => d.deliveryType === DeliveryType.COURIER && d.status === DealStatus.PAID);
        if (filter === 'VISIT') return orders.filter(d => d.deliveryType === DeliveryType.SHOP_VISIT && d.status === DealStatus.APPOINTMENT_BOOKED);
        return orders; // ALL
    }, [orders, filter]);

    const handleMarkShipped = async () => {
        if (!shippingDeal || !trackingNumber || !courierName) return;
        setIsSubmitting(true);
        try {
            await markOrderShipped(shippingDeal, trackingNumber, courierName);
            setShippingDeal(null);
            setTrackingNumber('');
            setCourierName('');
            alert("Order marked as Shipped!");
        } catch (e) {
            alert("Failed to update status.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!verifyingDeal) return;
        const success = await verifyPickup(verifyingDeal, otpInput);
        if (success) {
            setVerifyingDeal(null);
            setOtpInput('');
            alert("Pickup Verified!");
        } else {
            alert("Invalid OTP");
        }
    };

    const handleSendQuote = async () => {
        if (!quoteDeal || !repairCost) return;
        const amount = parseFloat(repairCost);
        if (isNaN(amount) || amount <= 0) return alert("Invalid amount");

        setIsSubmitting(true);
        try {
            await sendRepairQuote(quoteDeal, amount);
            setQuoteDeal(null);
            setRepairCost('');
            alert("Quote Sent! User notified to pay.");
        } catch (e) {
            alert("Failed to send quote.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            
            {/* --- SHIPPING MODAL --- */}
            {shippingDeal && (
                <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl animate-in zoom-in-95">
                        <h3 className="text-xl font-black mb-4">Ship Order</h3>
                        <input type="text" placeholder="Courier Name (e.g. DTDC)" className="w-full p-3 border rounded-xl mb-3 font-bold text-sm outline-none" value={courierName} onChange={e => setCourierName(e.target.value)} />
                        <input type="text" placeholder="Tracking Number / AWB" className="w-full p-3 border rounded-xl mb-6 font-bold text-sm outline-none" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
                        <div className="flex gap-3">
                            <button onClick={() => setShippingDeal(null)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-sm">Cancel</button>
                            <button onClick={handleMarkShipped} disabled={isSubmitting} className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm">
                                {isSubmitting ? 'Saving...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- OTP MODAL --- */}
            {verifyingDeal && (
                <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl animate-in zoom-in-95">
                        <h3 className="text-xl font-black mb-4">Verify Pickup OTP</h3>
                        <p className="text-xs text-gray-500 mb-4">Ask customer for code shown in their app.</p>
                        <input type="text" placeholder="0 0 0 0" className="w-full p-4 border-2 border-slate-200 rounded-xl mb-6 font-black text-center text-3xl tracking-[10px] outline-none focus:border-blue-500" value={otpInput} onChange={e => setOtpInput(e.target.value)} maxLength={4} />
                        <div className="flex gap-3">
                            <button onClick={() => setVerifyingDeal(null)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-sm">Cancel</button>
                            <button onClick={handleVerifyOtp} className="flex-1 bg-green-600 text-white font-bold py-3 rounded-xl text-sm">Verify</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- REPAIR QUOTE MODAL --- */}
            {quoteDeal && (
                <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl animate-in zoom-in-95">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-orange-100 p-2 rounded-full text-orange-600"><Smartphone size={24}/></div>
                            <div>
                                <h3 className="text-lg font-black">Set Repair Cost</h3>
                                <p className="text-[10px] text-gray-500">Enter final amount after checking device.</p>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
                            <label className="text-[10px] font-bold text-gray-400 uppercase">Total Amount to Pay</label>
                            <div className="flex items-center gap-2 mt-1">
                                <IndianRupee size={20} className="text-slate-400"/>
                                <input 
                                    type="number" 
                                    placeholder="2500" 
                                    className="bg-transparent w-full text-2xl font-black text-slate-900 outline-none" 
                                    value={repairCost} 
                                    onChange={e => setRepairCost(e.target.value)}
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setQuoteDeal(null)} className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-sm">Cancel</button>
                            <button onClick={handleSendQuote} disabled={isSubmitting} className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
                                {isSubmitting ? 'Sending...' : <><BellRing size={16}/> Request Pay</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- CANCEL MODAL --- */}
            {cancelDealId && (
                <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-xl animate-in zoom-in-95">
                        <h3 className="text-xl font-black mb-2 text-red-600">Cancel Order</h3>
                        <p className="text-xs text-gray-500 mb-4">Are you sure you want to cancel this order? Please provide a reason.</p>
                        <input 
                            type="text" 
                            placeholder="Reason (e.g., Out of stock)" 
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

            {/* FILTERS */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: 'ALL', label: 'All Orders' },
                    { id: 'COURIER', label: 'To Ship (Courier)' },
                    { id: 'VISIT', label: 'Shop Visits' },
                    { id: 'COMPLETED', label: 'History' }
                ].map(f => (
                    <button 
                        key={f.id} 
                        onClick={() => setFilter(f.id as any)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${filter === f.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-100'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* ORDERS LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.length === 0 ? (
                    <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <Package size={40} className="mx-auto text-gray-300 mb-3"/>
                        <p className="text-gray-400 font-bold text-sm">No orders found in this category.</p>
                    </div>
                ) : (
                    filteredOrders.map(deal => {
                        const buyer = users.find(u => u.id === deal.buyerId);
                        const isCourier = deal.deliveryType === DeliveryType.COURIER;
                        const isRepairCourier = deal.deliveryType === DeliveryType.REPAIR_COURIER;
                        const isCompleted = deal.status === DealStatus.COMPLETED || deal.status === DealStatus.SHIPPED;
                        const isPaymentPending = deal.status === DealStatus.PAYMENT_PENDING;

                        return (
                            <div key={deal.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden group">
                                {/* BADGE */}
                                <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[10px] font-black uppercase tracking-wider ${isRepairCourier ? 'bg-blue-100 text-blue-700' : isCourier ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                    {isRepairCourier ? <span className="flex items-center gap-1"><Smartphone size={10}/> Repair Job</span> : isCourier ? <span className="flex items-center gap-1"><Truck size={10}/> Courier</span> : <span className="flex items-center gap-1"><Store size={10}/> Shop Visit</span>}
                                </div>

                                {/* HEADER */}
                                <div className="flex gap-4 mb-4">
                                    <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                        <img src={deal.listingImage || deal.listingImages?.[0] || 'https://placehold.co/100x100?text=No+Image'} className="w-full h-full object-cover mix-blend-multiply" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{deal.title}</h4>
                                        <p className="text-xs font-bold text-gray-500 mt-0.5">Qty: {deal.soldQuantity || 1} • ₹{deal.amount}</p>
                                        <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                            <Clock size={10}/> {new Date(deal.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* CUSTOMER INFO */}
                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1"><User size={12}/> {buyer?.name || 'Unknown'}</p>
                                        {buyer?.mobile && (
                                            <button onClick={() => window.open(`tel:${buyer.mobile}`)} className="bg-white p-1 rounded-full text-blue-600 border border-blue-100"><Phone size={12}/></button>
                                        )}
                                    </div>
                                    {isCourier || isRepairCourier ? (
                                        <>
                                            <p className="text-[10px] text-gray-500 leading-tight flex items-start gap-1">
                                                <MapPin size={10} className="mt-0.5 shrink-0"/> {buyer?.address || 'No Address Provided'}
                                            </p>
                                            {/* SHOW USER TRACKING IF AVAILABLE */}
                                            {deal.customerTrackingNumber && (
                                                <div className="mt-2 bg-blue-50 border border-blue-100 p-2 rounded-lg text-[10px] text-blue-700 font-bold flex items-center gap-1">
                                                    <Truck size={10}/> Customer Sent: {deal.customerTrackingNumber}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-[10px] text-green-600 font-bold bg-green-50 w-fit px-2 py-0.5 rounded">
                                            Customer will come to shop
                                        </p>
                                    )}
                                </div>

                                {/* ACTIONS */}
                                <div className="flex gap-2">
                                    {isCompleted ? (
                                        <div className="w-full bg-green-50 text-green-700 py-2 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2 border border-green-100">
                                            <CheckCircle2 size={16}/> {deal.status === DealStatus.SHIPPED ? 'Shipped' : 'Completed'}
                                        </div>
                                    ) : (
                                        <>
                                            {isRepairCourier && deal.status === DealStatus.APPOINTMENT_BOOKED && (
                                                <button 
                                                    onClick={() => setQuoteDeal(deal.id)}
                                                    className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold text-xs hover:bg-orange-600 flex items-center justify-center gap-2 shadow-lg shadow-orange-200 active:scale-95"
                                                >
                                                    <Smartphone size={16}/> Set Cost & Ask Pay
                                                </button>
                                            )}

                                            {isRepairCourier && isPaymentPending && (
                                                <div className="w-full bg-orange-50 text-orange-700 py-2 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2 border border-orange-100 animate-pulse">
                                                    <Clock size={16}/> Waiting Payment (₹{deal.amount})
                                                </div>
                                            )}

                                            {/* SHOW SHIP BUTTON ONLY IF PAID OR IF ITS A PAID COURIER ORDER */}
                                            {((isRepairCourier && deal.status === DealStatus.PAID) || (isCourier && deal.status === DealStatus.PAID)) && (
                                                <button 
                                                    onClick={() => setShippingDeal(deal.id)}
                                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-xs hover:bg-blue-700 flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95"
                                                >
                                                    <Send size={16}/> Mark Shipped
                                                </button>
                                            )}

                                            {deal.deliveryType === DeliveryType.SHOP_VISIT && (
                                                <button 
                                                    onClick={() => setVerifyingDeal(deal.id)}
                                                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-xs hover:bg-slate-800 flex items-center justify-center gap-2 shadow-lg active:scale-95"
                                                >
                                                    <CheckCircle2 size={16}/> Verify OTP
                                                </button>
                                            )}

                                            <button 
                                                onClick={() => setCancelDealId(deal.id)}
                                                className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-bold text-xs hover:bg-red-100 flex items-center justify-center gap-2 border border-red-100 active:scale-95"
                                            >
                                                Cancel Order
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default OrdersTab;
