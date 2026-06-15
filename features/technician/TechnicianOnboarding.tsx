
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { ShieldCheck, CircleCheck, ArrowRight, Camera, Loader2, ArrowLeft, CircleAlert, Store, BadgeCheck, XCircle, RefreshCw, TrendingDown, ShoppingBag } from 'lucide-react';
import { uploadImageToFirebase, processImageForUpload } from '../../services/imageService';

const TechnicianOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, submitKYC } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false); // NEW: To handle Re-submit without page reload

  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    mobile: '',
    shopImage: null as string | null,
  });

  // Load initial data when user is ready
  useEffect(() => {
      if (currentUser) {
          setFormData(prev => ({
              ...prev,
              ownerName: currentUser.name || '',
              mobile: currentUser.mobile || ''
          }));
      }
  }, [currentUser]);

  // Handle Loading State
  if (!currentUser) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <Loader2 className="animate-spin text-slate-900" size={32} />
          </div>
      );
  }

  // --- 1. ALREADY VERIFIED ---
  if (currentUser.kycVerified) {
      return (
          <div className="pb-24 bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
               <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white">
                   <BadgeCheck size={48} className="text-blue-600 fill-white" />
               </div>
               <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Verified Technician</h2>
               <p className="text-gray-600 text-sm mb-8 leading-relaxed font-medium">
                   Verification Successful! <br/>
                   You have unlocked <b className="text-blue-600">Dealer / Wholesale Prices</b>.
               </p>
               <button onClick={() => navigate('/')} className="w-full max-w-sm bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2">
                   <ShoppingBag size={20}/> Start Buying
               </button>
          </div>
      );
  }

  // --- 2. PENDING STATUS (Wait View) ---
  // Show this ONLY if not success (success view is handled below) AND not retrying
  if (currentUser.kycStatus === 'PENDING' && !isSuccess && !isRetrying) {
       return (
           <div className="pb-24 bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
               <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white">
                   <ShieldCheck size={48} className="text-amber-600" />
               </div>
               <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Verification In Progress</h2>
               <p className="text-gray-600 text-sm mb-8 leading-relaxed font-medium">
                   We are checking your shop details.<br/>
                   Once approved, you will see <b>Wholesale Rates</b> automatically.
               </p>
               <button onClick={() => navigate('/')} className="w-full max-w-sm bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                   Back to Home
               </button>
           </div>
       );
  }

  // --- 3. REJECTED STATUS (Failed View) ---
  // Only show if user is NOT trying to re-submit
  if (currentUser.kycStatus === 'REJECTED' && !isSuccess && !isRetrying) {
      return (
          <div className="pb-24 bg-gray-50 min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
               <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-sm border-4 border-white">
                   <XCircle size={48} className="text-red-600" />
               </div>
               <h2 className="text-2xl font-extrabold text-red-600 mb-2">Verification Failed</h2>
               <div className="bg-red-50 p-4 rounded-2xl border border-red-100 max-w-sm w-full mb-8 text-left">
                   <p className="text-xs font-bold text-red-800 uppercase mb-2">Reason:</p>
                   <p className="text-sm text-gray-800 font-medium">"{currentUser.rejectionReason || 'Please enter valid shop details.'}"</p>
               </div>
               
               {/* FIX: This button now sets isRetrying to true instead of reloading page */}
               <button 
                    onClick={() => { setIsRetrying(true); setErrorMsg(''); }} 
                    className="w-full max-w-sm bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                   <RefreshCw size={18}/> Re-Submit Details
               </button>
           </div>
      );
  }

  // --- HANDLERS ---

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setErrorMsg('');
      try {
          const compressed = await processImageForUpload(file);
          setFormData(prev => ({ ...prev, shopImage: compressed }));
      } catch (error) {
          setErrorMsg("Image processing failed. Try a smaller image.");
      } finally {
          setIsProcessing(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    if (!formData.shopName || !formData.mobile) {
        setErrorMsg("Shop Name and Mobile Number are required.");
        return;
    }
    
    setIsProcessing(true);
    try {
        let shopImageUrl = undefined;

        // Upload Shop Image if provided (and it's a base64 string, implies new upload)
        if (formData.shopImage && formData.shopImage.startsWith('data:')) {
            try {
                shopImageUrl = await uploadImageToFirebase(formData.shopImage, `kyc/${currentUser.id}/shop.jpg`);
            } catch (err) {
                console.error("Image upload failed, proceeding without it.");
            }
        } else {
            // Keep existing image if not changed
            shopImageUrl = currentUser.shopImage; 
        }

        const payload: Partial<any> = {
            shopName: formData.shopName,
            name: formData.ownerName,
            mobile: formData.mobile,
            shopImage: shopImageUrl,
            kycStatus: 'PENDING' 
        };

        await submitKYC(payload);
        setIsSuccess(true);
        setIsRetrying(false);
    } catch (error: any) {
        setErrorMsg(error.message || "Submission failed. Please check internet.");
    } finally {
        setIsProcessing(false);
    }
  };

  // --- 4. SUCCESS VIEW (After Submit) ---
  if (isSuccess) {
      return (
           <div className="p-10 bg-gray-50 min-h-screen flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
               <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner animate-bounce">
                   <CircleCheck size={48} className="text-green-600" />
               </div>
               <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Request Sent!</h2>
               <p className="text-gray-600 text-sm mb-8 leading-relaxed font-medium">
                   Admin will verify your shop.<br/>
                   Once approved, you can <b>Buy at Wholesale Prices</b>.
               </p>
               <button onClick={() => navigate('/')} className="w-full max-w-sm bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                   Continue Shopping
               </button>
           </div>
      );
  }

  // --- 5. REGISTRATION FORM (Default View) ---
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
       {errorMsg && (
           <div className="fixed top-4 left-4 right-4 z-50 bg-red-100 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-2 shadow-lg animate-in slide-in-from-top duration-300">
               <CircleAlert size={20} />
               <p className="text-xs font-bold">{errorMsg}</p>
               <button onClick={() => setErrorMsg('')} className="ml-auto"><ArrowLeft className="rotate-180" size={16}/></button>
           </div>
       )}

       <div className="p-6 max-w-md mx-auto animate-in fade-in slide-in-from-bottom duration-500">
            <button onClick={() => navigate(-1)} className="mb-6 p-2 bg-white rounded-full shadow-sm border border-gray-100 text-gray-500">
                <ArrowLeft size={20} />
            </button>

            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
                    {isRetrying ? 'Re-Submit Verification' : 'Technician Access'}
                </h1>
                <p className="text-gray-500 font-medium leading-relaxed text-sm">
                    Upload your Shop details to verify you are a technician. <br/>
                    <span className="text-slate-900 font-bold">Benefit:</span> Unlock Wholesale (Dealer) Prices.
                </p>
                <div className="mt-4 inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-200">
                    <TrendingDown size={14} className="fill-green-600 text-white"/> Get Low B2B Rates
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                
                {/* Shop Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Shop Name <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                        <Store size={20} className="text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="e.g. Siva Mobiles"
                            className="bg-transparent w-full font-bold text-gray-900 outline-none placeholder-gray-300"
                            value={formData.shopName}
                            onChange={(e) => handleInputChange('shopName', e.target.value)}
                        />
                    </div>
                </div>

                {/* Owner Name */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Your Name</label>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                        <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-white">
                            {formData.ownerName.charAt(0) || 'U'}
                        </div>
                        <input 
                            type="text" 
                            className="bg-transparent w-full font-bold text-gray-900 outline-none placeholder-gray-300"
                            value={formData.ownerName}
                            onChange={(e) => handleInputChange('ownerName', e.target.value)}
                        />
                    </div>
                </div>

                {/* Mobile */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">WhatsApp Number <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                        <span className="text-gray-400 font-bold text-sm">+91</span>
                        <input 
                            type="tel" 
                            placeholder="98765 43210"
                            className="bg-transparent w-full font-bold text-gray-900 outline-none placeholder-gray-300"
                            value={formData.mobile}
                            onChange={(e) => handleInputChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        />
                    </div>
                </div>

                {/* Shop Photo (Optional) */}
                <div>
                    <label className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                        <span>Shop Board / Card</span>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[9px]">Proof</span>
                    </label>
                    
                    <div className={`h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition relative overflow-hidden cursor-pointer bg-gray-50
                        ${formData.shopImage ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                       {isProcessing ? (
                           <div className="flex flex-col items-center gap-2">
                               <Loader2 className="animate-spin text-blue-600" size={24} />
                           </div>
                       ) : formData.shopImage ? (
                           <>
                               <img src={formData.shopImage} className="absolute inset-0 w-full h-full object-cover" />
                               <button onClick={() => setFormData({...formData, shopImage: null})} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full"><ArrowLeft className="rotate-45" size={16}/></button>
                           </>
                       ) : (
                           <div className="flex flex-col items-center gap-2 w-full h-full justify-center" onClick={() => document.getElementById('shop_img_input')?.click()}>
                               <div className="p-3 bg-white rounded-full shadow-sm border border-gray-200">
                                   <Camera size={20} className="text-blue-600" />
                               </div>
                               <span className="text-[10px] font-bold text-gray-400">Tap to Upload Photo</span>
                           </div>
                       )}
                       <input type="file" id="shop_img_input" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </div>
                </div>

            </div>

            <button 
                onClick={handleSubmit}
                disabled={isProcessing || !formData.shopName || !formData.mobile}
                className="mt-8 w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
            >
                {isProcessing ? 'Verifying...' : 'Submit & Unlock Wholesale'} <ArrowRight size={18} />
            </button>
       </div>
    </div>
  );
};

export default TechnicianOnboarding;
