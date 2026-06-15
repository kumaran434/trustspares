
import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, X, ArrowRight, CircleCheck, Smartphone, Pencil, Lock } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

interface PaymentGatewayProps {
  amount: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId?: string) => void;
}

// Razorpay Type Definition
declare global {
    interface Window {
        Razorpay: any;
    }
}

const PaymentGateway: React.FC<PaymentGatewayProps> = ({ amount, isOpen, onClose, onSuccess }) => {
  const { currentUser, updateUserProfile } = useApp();
  const [step, setStep] = useState<'ADDRESS' | 'SUMMARY' | 'SUCCESS'>('ADDRESS');
  const [error, setError] = useState<string | null>(null);
  
  // Address State
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(true);

  useEffect(() => {
    if (isOpen && currentUser) {
        setStep('ADDRESS');
        setAddress(currentUser.address || '');
        setMobile(currentUser.mobile || '');
        setError(null);
        
        if (currentUser.address && currentUser.mobile) {
            setIsEditingAddress(false);
        } else {
            setIsEditingAddress(true);
        }
    }
  }, [isOpen, currentUser]);

  const confirmAddress = async () => {
      if (!address || !mobile) {
          setError("Delivery Address and Mobile Number are required.");
          return;
      }
      if (currentUser) {
          await updateUserProfile(currentUser.id, { address, mobile });
      }
      setStep('SUMMARY');
  };

  const handleRazorpayPayment = () => {
      const options = {
          key: "rzp_test_1DP5mmOlF5G5ag", // REPLACE WITH YOUR LIVE KEY IN PRODUCTION
          amount: amount * 100, // Amount in paise
          currency: "INR",
          name: "TrustSpares Payment",
          description: "Secure Payment for Order",
          image: "https://cdn-icons-png.flaticon.com/512/2438/2438078.png",
          handler: function (response: any) {
              // On Success
              setStep('SUCCESS');
              setTimeout(() => {
                  onSuccess(response.razorpay_payment_id);
                  onClose();
              }, 2000);
          },
          prefill: {
              name: currentUser?.name || "User",
              email: currentUser?.email || "user@example.com",
              contact: mobile || "9999999999"
          },
          theme: {
              color: "#2563EB"
          }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
          setError(`Payment Failed: ${response.error.description}`);
      });
      rzp1.open();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-green-400" />
                <h3 className="text-sm font-bold">Secure Checkout</h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg"><X size={20}/></button>
        </div>

        {step === 'ADDRESS' && (
            <div className="p-6 space-y-5">
                <div className="text-center">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MapPin size={24} className="text-blue-600" />
                    </div>
                    <h4 className="font-bold text-gray-900">Delivery Details</h4>
                    <p className="text-xs text-gray-500">Where should we ship this item?</p>
                </div>
                
                {!isEditingAddress ? (
                    <div className="space-y-4 animate-in fade-in">
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 relative">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Ship To</p>
                            <p className="text-sm font-bold text-gray-900 leading-relaxed pr-8">{address}</p>
                            <div className="mt-2 flex items-center gap-2 text-xs font-medium text-gray-600">
                                <Smartphone size={14} className="text-blue-600"/> {mobile}
                            </div>
                            
                            <button 
                                onClick={() => setIsEditingAddress(true)}
                                className="absolute top-3 right-3 p-1.5 bg-white border border-gray-200 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                title="Change Address"
                            >
                                <Pencil size={14} />
                            </button>
                        </div>

                        <button 
                            onClick={confirmAddress}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 transition active:scale-95"
                        >
                            Proceed to Payment <ArrowRight size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in">
                        {error && <p className="text-xs text-red-600 font-bold bg-red-50 p-2 rounded">{error}</p>}
                        
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Shipping Address</label>
                            <textarea 
                                rows={3}
                                className="w-full border border-gray-300 rounded-xl p-3 text-sm font-bold mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="House No, Street, City, Pincode"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Contact Mobile</label>
                            <input 
                                type="text" 
                                className="w-full border border-gray-300 rounded-xl p-3 text-sm font-bold mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="10-digit mobile number"
                            />
                        </div>

                        <div className="flex gap-3">
                             {currentUser?.address && (
                                 <button 
                                    onClick={() => {
                                        setAddress(currentUser.address || '');
                                        setMobile(currentUser.mobile || '');
                                        setIsEditingAddress(false);
                                    }}
                                    className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50"
                                 >
                                     Cancel
                                 </button>
                             )}
                             <button 
                                onClick={confirmAddress}
                                className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-slate-800 transition active:scale-95"
                            >
                                Save & Proceed <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        )}

        {step === 'SUMMARY' && (
            <div className="p-6 space-y-5">
                <div className="text-center">
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Total Payable</p>
                    <p className="text-4xl font-extrabold text-slate-900">₹{amount.toLocaleString()}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Item Price</span>
                        <span className="font-bold text-gray-900">₹{amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Platform Fee</span>
                        <span className="font-bold text-green-600">FREE</span>
                    </div>
                    <div className="border-t border-blue-200 pt-2 flex justify-between items-center text-sm">
                        <span className="font-bold text-blue-800">Final Total</span>
                        <span className="font-black text-blue-800">₹{amount.toLocaleString()}</span>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-xs font-bold text-center">
                        {error}
                    </div>
                )}

                <button 
                    onClick={handleRazorpayPayment}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                    Pay with Razorpay <Lock size={16}/>
                </button>
                
                <p className="text-[10px] text-center text-gray-400">
                    Cards, UPI, NetBanking & Wallet accepted.
                </p>
            </div>
        )}

        {step === 'SUCCESS' && (
             <div className="p-10 flex flex-col items-center justify-center text-center space-y-4 animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
                    <CircleCheck size={40} className="text-green-600" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Payment Successful!</h4>
                <p className="text-sm text-gray-500">Payment received by Admin. Processing order...</p>
             </div>
        )}

      </div>
    </div>
  );
};

export default PaymentGateway;
