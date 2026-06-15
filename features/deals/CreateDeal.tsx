
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { DealStatus, IndustryType, UserRole } from '../../types';
import { ArrowRight, Camera, X, Loader2, ArrowLeft, Image as ImageIcon, Wand2, DollarSign, CheckSquare, Square, Layers, Smartphone, Wrench, ShieldCheck, Zap, AlertTriangle, Copy, Check, Sparkles, MapPin } from 'lucide-react';
import { processImageForUpload, uploadImageToFirebase } from '../../services/imageService';
import { removeBackgroundWithAI } from '../../services/geminiService';
import { CATEGORIES, BRANDS, POPULAR_MODELS } from '../dashboard/dashboardConstants';

const CreateDeal: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); 
  const { currentUser, addDeal, deals, updateDeal } = useApp();
  
  // Selection States
  const [industry, setIndustry] = useState<IndustryType>('MOBILE'); 
  const [category, setCategory] = useState(''); 
  const [customCategory, setCustomCategory] = useState('');
  
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  
  const [quality, setQuality] = useState<'ORIGINAL' | 'OLED' | 'COPY' | 'REFURB'>('ORIGINAL');

  const [title, setTitle] = useState(''); 
  
  const [amount, setAmount] = useState(''); 
  const [dealerPrice, setDealerPrice] = useState(''); 
  const [fixingCharge, setFixingCharge] = useState('0'); 
  const [stockQuantity, setStockQuantity] = useState('1'); 
  
  const [description, setDescription] = useState('');
  const [locationBranch, setLocationBranch] = useState('Temper King Store');
  
  const [selectedImages, setSelectedImages] = useState<string[]>([]); 
  const [imageError, setImageError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');
  
  // AI Modes: Simple Boolean for "Studio Look"
  const [useStudioEffect, setUseStudioEffect] = useState(true); // Default to TRUE as per user request
  
  const [hasWarranty, setHasWarranty] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false); // Visual feedback
  const [formError, setFormError] = useState<string | null>(null); // Global form error near button
  
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      if (currentUser?.industry) setIndustry(currentUser.industry);
  }, [currentUser]);

  useEffect(() => {
      if (id && deals.length > 0) {
          const dealToEdit = deals.find(d => d.id === id);
          if (dealToEdit) {
              // Admin can edit any deal
              fillFormWithDeal(dealToEdit, false);
          }
      }
  }, [id, deals, currentUser, navigate]);

  const fillFormWithDeal = (dealData: any, isCopyMode: boolean) => {
      setTitle(dealData.title); 
      const brandObj = BRANDS.find(b => b.id === dealData.brand);
      setBrand(brandObj ? brandObj.label : (dealData.brand || ''));
      setModel(dealData.model || '');
      if (dealData.quality) setQuality(dealData.quality);
      setAmount(dealData.amount.toString());
      if (dealData.dealerPrice) setDealerPrice(dealData.dealerPrice.toString());
      const fixChg = dealData.fixingCharge || 0;
      setFixingCharge(fixChg.toString());
      setHasWarranty(fixChg > 0);
      setStockQuantity(isCopyMode ? '1' : (dealData.stockQuantity?.toString() || '1'));
      setDescription(dealData.description);
      setLocationBranch(dealData.location || 'Temper King Store');
      const existingCat = CATEGORIES.find(c => c.id === dealData.category);
      if (existingCat) {
          setCategory(dealData.category);
      } else {
          setCategory('other');
          setCustomCategory(dealData.category);
      }
      if (dealData.industry) setIndustry(dealData.industry);
      if (dealData.listingImages && dealData.listingImages.length > 0) {
          setSelectedImages(dealData.listingImages);
      } else if (dealData.listingImage) {
          setSelectedImages([dealData.listingImage]);
      }
  };

  const myPastDeals = useMemo(() => {
      if (!currentUser) return [];
      // Admin sees ALL deals to copy from
      return deals
          .filter(d => d.status !== 'DRAFT')
          .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 20);
  }, [deals, currentUser]);

  const handleCopyProduct = (dealToCopy: any) => {
      fillFormWithDeal(dealToCopy, true);
      setShowCopyModal(false);
      setImageError(null);
      if(id) navigate('/create'); 
  };

  const handleCategorySelect = (catId: string) => {
      setCategory(catId);
      if (!title.trim()) {
          const catLabel = CATEGORIES.find(c => c.id === catId)?.label || '';
          let qualText = '';
          if (quality === 'ORIGINAL') qualText = 'Original';
          else if (quality === 'OLED') qualText = 'OLED';
          else if (quality === 'COPY') qualText = 'Market Copy';
          const suggestion = `${model} ${catLabel} (${qualText})`.trim();
          setTitle(suggestion);
      }
  };

  const handleQualitySelect = (q: 'ORIGINAL' | 'OLED' | 'COPY' | 'REFURB') => {
      setQuality(q);
      if (title.includes('Original') || title.includes('OLED') || title.includes('Copy')) {
          let newTitle = title;
          if (q === 'ORIGINAL') newTitle = title.replace(/OLED|Copy|Market Copy/g, 'Original');
          if (q === 'OLED') newTitle = title.replace(/Original|Copy|Market Copy/g, 'OLED');
          if (q === 'COPY') newTitle = title.replace(/Original|OLED/g, 'Market Copy');
          setTitle(newTitle);
      }
  };

  const toggleWarranty = () => {
      const newState = !hasWarranty;
      setHasWarranty(newState);
      setFixingCharge(newState ? '350' : '0'); 
  };

  // --- IMAGE PROCESSING HANDLER ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    sessionStorage.removeItem('camera_opened');
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    setImageError(null);
    
    let isTimedOut = false;
    
    try {
        // 1. Always optimize/resize first locally to avoid huge uploads
        setProcessingMsg('Optimizing Photo...');
        
        // Safety timeout
        const processTimeout = setTimeout(() => {
            isTimedOut = true;
            setIsProcessing(false);
            setImageError("Processing took too long. Try a smaller photo or check your connection.");
        }, 90000); // 90 seconds timeout

        const optimizedBase64 = await processImageForUpload(file);

        let finalImage = optimizedBase64;
        let aiFailed = false;

        if (useStudioEffect && !isTimedOut) {
            setProcessingMsg('✨ Removing BG & Adding Studio Light...');
            try {
                // Use Gemini AI to remove background
                finalImage = await removeBackgroundWithAI(optimizedBase64, (msg) => {
                    if (!isTimedOut) setProcessingMsg(msg);
                }); 
            } catch (studioErr: any) {
                console.warn("Studio Gen failed, falling back to original", studioErr);
                aiFailed = true;
                const errMsg = studioErr?.message || String(studioErr);
                if (!isTimedOut) {
                    setImageError(`AI Background Removal Failed: ${errMsg}. Using original photo.`);
                    setProcessingMsg('');
                }
                finalImage = optimizedBase64; 
            }
        }

        clearTimeout(processTimeout);
        
        if (!isTimedOut) {
            setSelectedImages(prev => [...prev, finalImage]);
            if (!aiFailed) {
                setImageError(null);
            }
        }
    } catch (err: any) { 
        console.error(err);
        if (!isTimedOut) {
            setImageError("Failed to process image. Try a simpler photo."); 
        }
    } finally { 
        if (!isTimedOut) {
            setIsProcessing(false); 
            setProcessingMsg(''); 
        }
    }
  };

  const removeImage = (index: number) => {
      setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

    // --- FORM PERSISTENCE (Fix for Camera/Browser Reloads) ---
  const STORAGE_KEY = 'create_deal_draft';

  // 1. Load Draft on Mount
  useEffect(() => {
      // Check if the app was restarted by the OS while taking a photo
      if (sessionStorage.getItem('camera_opened') === 'true') {
          sessionStorage.removeItem('camera_opened');
          setImageError("Your phone restarted the app to save memory while taking the photo. Please use the 'Gallery' option instead.");
      }

      try {
          const savedDraft = localStorage.getItem(STORAGE_KEY);
          if (savedDraft && !id) { // Only load draft for NEW deals, not edits
              const parsed = JSON.parse(savedDraft);
              if (parsed.title) setTitle(parsed.title);
              if (parsed.brand) setBrand(parsed.brand);
              if (parsed.model) setModel(parsed.model);
              if (parsed.price) setAmount(parsed.price);
              if (parsed.dealerPrice) setDealerPrice(parsed.dealerPrice);
              if (parsed.stock) setStockQuantity(parsed.stock);
              if (parsed.description) setDescription(parsed.description);
              if (parsed.category) setCategory(parsed.category);
              if (parsed.quality) setQuality(parsed.quality);
              if (parsed.location) setLocationBranch(parsed.location);
              // DO NOT load images from draft (too heavy/unreliable)
              if (parsed.industry) setIndustry(parsed.industry);
              setDraftSaved(true);
          }
      } catch (e) {
          console.error("Failed to load draft:", e);
          localStorage.removeItem(STORAGE_KEY); // Auto-clear corrupt draft
      }
  }, [id]);

  // 2. Save Draft on Change
  useEffect(() => {
      if (id) return; // Don't save drafts when editing existing deals
      
      // EXCLUDE IMAGES from draft to prevent Quota Exceeded and Crashes
      const draftData = {
          title, brand, model, price: amount, dealerPrice, stock: stockQuantity, 
          description, category, quality, industry, location: locationBranch
      };
      
      const saveTimeout = setTimeout(() => {
          try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
              setDraftSaved(true);
              setTimeout(() => setDraftSaved(false), 2000); // Flash "Saved"
          } catch (e) {
              console.warn("Draft storage full, skipping save", e);
          }
      }, 1000); // Debounce save

      return () => clearTimeout(saveTimeout);
  }, [title, brand, model, amount, dealerPrice, stockQuantity, description, category, quality, industry, locationBranch, id]);

  // 3. Clear Draft on Submit
  const clearDraft = () => {
      localStorage.removeItem(STORAGE_KEY);
      // Reset local state
      setTitle(''); setBrand(''); setModel(''); setAmount(''); setDealerPrice('');
      setStockQuantity('1'); setDescription(''); setCategory(''); setSelectedImages([]);
      setLocationBranch('Temper King Store');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null); // Clear previous errors

    if (!currentUser) {
        setFormError("Session expired. Please reload the page.");
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        return;
    }

    if (selectedImages.length === 0) {
        setImageError("At least 1 photo required.");
        setFormError("Please upload at least 1 photo.");
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top to see image error
        return;
    }
    
    if (!brand.trim()) {
        setFormError("Please select a Brand Name.");
        return;
    }
    if (!model.trim()) {
        setFormError("Please enter a Model Name.");
        return;
    }
    if (!category) {
        setFormError("Please select a Spare Part Category.");
        return;
    }
    if (!title.trim()) {
        setFormError("Please enter a Title for the listing.");
        return;
    }

    // Prevent Duplicate Listings (Same Title for Same Seller)
    const isDuplicate = deals.some(d => 
        d.sellerId === currentUser.id && 
        d.title.toLowerCase().trim() === title.trim().toLowerCase() &&
        d.id !== id // Allow updating the same deal
    );

    if (isDuplicate) {
        setFormError("Duplicate Product! You already have a listing with this name.");
        return;
    }

    setIsProcessing(true);
    setProcessingMsg('Publishing...');
    try {
        // ... (upload logic)
        const uploadedUrls = await Promise.all(selectedImages.map(async (img, idx) => {
            if (img.startsWith('http')) return img; 
            return await uploadImageToFirebase(img, `deals/${currentUser.id}/${Date.now()}_${idx}.jpg`);
        }));
        
        const finalCategory = category === 'other' ? customCategory : category;
        const selectedBrandObj = BRANDS.find(b => b.label.toLowerCase() === brand.trim().toLowerCase());
        const brandIdToSave = selectedBrandObj ? selectedBrandObj.id : brand.trim().toLowerCase();

        const dealData: any = {
            title: title.trim(), 
            brand: brandIdToSave, 
            model: model.trim(),
            quality: quality, 
            amount: Number(amount), 
            dealerPrice: dealerPrice ? Number(dealerPrice) : Number(amount),
            fixingCharge: Number(fixingCharge), 
            stockQuantity: Number(stockQuantity) || 1, 
            description, 
            category: finalCategory, 
            industry, 
            listingImage: uploadedUrls[0], 
            listingImages: uploadedUrls,
            status: DealStatus.AVAILABLE,
            sellerId: currentUser.id,
            createdAt: new Date().toISOString(),
            location: locationBranch
        };

        if (id) { await updateDeal(id, dealData); navigate(`/deal/${id}`); }
        else { await addDeal(dealData); clearDraft(); navigate('/'); } // Clear draft on success
    } catch (error: any) { 
        console.error("Failed to publish deal:", error);
        setFormError(`Failed to publish: ${error.message}`);
    } finally { 
        setIsProcessing(false); 
    }
  };

  const filteredModels = POPULAR_MODELS.filter(m => m.brand === brand.toLowerCase() || BRANDS.find(b => b.label === brand)?.id === m.brand);

  return (
    <div className="relative pb-24">
      {showCopyModal && (
          <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl relative max-h-[80vh] flex flex-col animate-in zoom-in-95">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="font-black text-xl text-slate-900 flex items-center gap-2"><Copy size={20} className="text-blue-600"/> Copy Product</h3>
                      <button onClick={() => setShowCopyModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
                  </div>
                  {myPastDeals.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-10 text-gray-400">
                          <Copy size={40} className="mb-2 opacity-50"/>
                          <p className="text-sm font-bold">No previous products found.</p>
                      </div>
                  ) : (
                      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                          {myPastDeals.map((d) => (
                              <button 
                                key={d.id} 
                                onClick={() => handleCopyProduct(d)}
                                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-white hover:border-blue-500 hover:shadow-md transition-all text-left group"
                              >
                                  <div className="w-14 h-14 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                      <img src={d.listingImage || d.listingImages?.[0] || 'https://placehold.co/100x100?text=No+Image'} className="w-full h-full object-cover mix-blend-multiply" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                      <h4 className="text-xs font-black text-slate-900 truncate group-hover:text-blue-600">{d.title}</h4>
                                      <p className="text-[10px] text-gray-500 font-bold">₹{d.amount}</p>
                                  </div>
                              </button>
                          ))}
                      </div>
                  )}
              </div>
          </div>
      )}

      <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 space-y-8">
        
        <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
            <button onClick={() => navigate(-1)} className="p-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"><ArrowLeft size={20}/></button>
            <div className="flex-1">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-slate-900">Add Stock (Admin)</h2>
                    <div className="flex items-center gap-2">
                        {draftSaved && (
                            <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg flex items-center gap-1 animate-pulse">
                                <Check size={10} /> Auto-Saved
                            </span>
                        )}
                        {!id && (
                            <button 
                                onClick={() => setShowResetModal(true)}
                                className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg hover:bg-red-100 transition-colors"
                            >
                                Reset Form
                            </button>
                        )}
                    </div>
                </div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">TrustSpares Central Store</p>
            </div>
        </div>

        {/* Reset Confirmation Modal */}
        {showResetModal && (
            <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                        <AlertTriangle className="text-red-600" size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Reset Form?</h3>
                    <p className="text-sm text-center text-gray-500 mb-6">
                        Are you sure you want to clear the draft and reset the form? All entered data will be lost.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => setShowResetModal(false)}
                            className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => {
                                clearDraft();
                                window.location.reload();
                            }}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* 1. Photos Section */}
            <div className="space-y-4">
                  <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <ImageIcon size={14}/> 1. Add Photos
                          </h4>
                      </div>
                      
                      {/* SIMPLIFIED AI TOGGLE */}
                      <div 
                        onClick={() => setUseStudioEffect(!useStudioEffect)}
                        className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 ${useStudioEffect ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 bg-white'}`}
                      >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${useStudioEffect ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                              <Sparkles size={16}/>
                          </div>
                          <div className="flex-1">
                              <p className={`text-xs font-black uppercase ${useStudioEffect ? 'text-indigo-900' : 'text-gray-500'}`}>
                                  Studio Finish (Auto-Remove BG)
                              </p>
                              <p className="text-[10px] text-gray-400 font-medium">
                                  Automatically removes background & adds studio lighting.
                              </p>
                          </div>
                          <div className={`w-10 h-6 rounded-full p-1 transition-colors ${useStudioEffect ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${useStudioEffect ? 'translate-x-4' : ''}`}></div>
                          </div>
                      </div>
                  </div>

                  {imageError && (
                      <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold flex items-start gap-2">
                          <AlertTriangle size={16} className="shrink-0 mt-0.5"/>
                          <span>{imageError}</span>
                      </div>
                  )}
                  
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl text-xs text-yellow-800 font-medium flex items-start gap-2">
                      <AlertTriangle size={16} className="shrink-0 mt-0.5 text-yellow-600"/>
                      <p>If the app logs out when taking a photo, your phone is running out of memory. Try selecting an existing photo from the <b>Gallery</b> instead.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                      <button type="button" onClick={() => {
                          sessionStorage.setItem('camera_opened', 'true');
                          cameraInputRef.current?.click();
                      }} className="p-4 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-all bg-gray-50/50 h-28">
                          <Camera size={24}/> <span className="text-[9px] font-black uppercase">Camera</span>
                      </button>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="p-4 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-all bg-gray-50/50 h-28">
                          <ImageIcon size={24}/> <span className="text-[9px] font-black uppercase">Gallery</span>
                      </button>
                      <button type="button" onClick={() => setShowCopyModal(true)} className="p-4 border-2 border-dashed border-blue-200 rounded-3xl flex flex-col items-center justify-center gap-2 text-blue-600 hover:border-blue-500 hover:bg-blue-50 transition-all bg-blue-50/30 h-28 shadow-sm">
                          <Copy size={24}/> <span className="text-[9px] font-black uppercase text-center">Copy<br/>Product</span>
                      </button>
                  </div>
                  
                  <input type="file" ref={cameraInputRef} className="hidden" accept="image/*" capture="environment" onChange={handleImageUpload} />
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

                  {isProcessing && (
                      <div className="flex flex-col items-center justify-center p-6 bg-blue-50 text-blue-600 rounded-2xl font-bold text-xs gap-3 animate-pulse border border-blue-100">
                          <Loader2 className="animate-spin" size={24}/> 
                          <span>{processingMsg || 'Processing...'}</span>
                      </div>
                  )}

                  {selectedImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-3 animate-in fade-in zoom-in duration-300">
                          {selectedImages.map((img, idx) => (
                              <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border-2 border-gray-100 shadow-sm group bg-white p-1">
                                  <img src={img} className="w-full h-full object-contain mix-blend-multiply" />
                                  <button 
                                    type="button"
                                    onClick={() => removeImage(idx)} 
                                    className="absolute top-1 right-1 bg-slate-900/80 text-white rounded-full p-1 hover:bg-red-600 transition-colors backdrop-blur-sm shadow-lg"
                                  >
                                      <X size={12}/>
                                  </button>
                              </div>
                          ))}
                      </div>
                  )}
            </div>

            {/* 2. Brand & Model Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-3xl border border-gray-100">
                 <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2 block flex items-center gap-2"><Smartphone size={14}/> 2. Brand Name</label>
                     <div className="relative">
                        <input 
                            list="brand-list"
                            type="text" 
                            className="w-full p-4 rounded-2xl border-2 border-white shadow-sm text-sm font-black focus:border-blue-500 outline-none transition-all uppercase" 
                            value={brand} 
                            onChange={e => setBrand(e.target.value)} 
                            placeholder="Select Brand"
                        />
                        <datalist id="brand-list">
                            {BRANDS.map(b => <option key={b.id} value={b.label} />)}
                        </datalist>
                     </div>
                 </div>
                 <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2 block">3. Model Name</label>
                     <div className="relative">
                        <input 
                            list="model-list"
                            type="text" 
                            className="w-full p-4 rounded-2xl border-2 border-white shadow-sm text-sm font-black focus:border-blue-500 outline-none transition-all uppercase" 
                            value={model} 
                            onChange={e => setModel(e.target.value)} 
                            placeholder="Type Model (e.g. Note 10)"
                        />
                        <datalist id="model-list">
                            {filteredModels.map(m => <option key={m.id} value={m.name} />)}
                        </datalist>
                     </div>
                 </div>
            </div>

            {/* 3. Category Section */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14}/> 4. Select Spare Name
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleCategorySelect(cat.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2 ${category === cat.id ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}
                        >
                            {cat.icon}
                            <span className="text-[9px] font-black uppercase tracking-tight text-center leading-tight">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 5. QUALITY GRADE SELECTOR */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck size={14}/> 5. Select Quality / Grade
                </h4>
                <div className="grid grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => handleQualitySelect('ORIGINAL')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${quality === 'ORIGINAL' ? 'bg-yellow-50 border-yellow-500 text-yellow-700 shadow-md' : 'bg-white border-gray-100 text-gray-400'}`}
                    >
                        <ShieldCheck size={20} className={quality === 'ORIGINAL' ? 'fill-yellow-500 text-white' : ''}/>
                        <span className="text-[10px] font-black uppercase">Original 100%</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleQualitySelect('OLED')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${quality === 'OLED' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-md' : 'bg-white border-gray-100 text-gray-400'}`}
                    >
                        <Zap size={20} className={quality === 'OLED' ? 'fill-blue-500 text-white' : ''}/>
                        <span className="text-[10px] font-black uppercase">OLED / OG</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => handleQualitySelect('COPY')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${quality === 'COPY' ? 'bg-gray-100 border-gray-400 text-gray-700 shadow-md' : 'bg-white border-gray-100 text-gray-400'}`}
                    >
                        <AlertTriangle size={20} className={quality === 'COPY' ? 'fill-gray-500 text-white' : ''}/>
                        <span className="text-[10px] font-black uppercase">First Copy</span>
                    </button>
                </div>
            </div>

            {/* Store/Branch Location Selector (கடை அமைவிடம்) */}
            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={14} className="text-blue-500"/> Select Store / Branch Placement (கடை அமைவிடம்)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setLocationBranch('Temper King Store')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${locationBranch === 'Temper King Store' ? 'bg-amber-50 border-[#f2ca50] text-[#3c2f00] shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                    >
                        <span className="text-xl">👑</span>
                        <div>
                            <span className="text-[10px] font-black uppercase block">Temper King Store</span>
                            <span className="text-[8px] font-bold text-gray-400 block mt-0.5">டெம்பர் கண்ணாடி கடை (Branch 1 - Specialized Glass Shop)</span>
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => setLocationBranch('TrustSpares Central')}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${locationBranch === 'TrustSpares Central' ? 'bg-blue-50/70 border-blue-500 text-blue-700 shadow-md' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                    >
                        <span className="text-xl">🔧</span>
                        <div>
                            <span className="text-[10px] font-black uppercase block">TrustSpares Central</span>
                            <span className="text-[8px] font-bold text-gray-400 block mt-0.5">பைக்கின் ஸ்பேர் மற்றும் சர்வீஸ் பார்ட்ஸ் (Branch 2 - Spares Shop)</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* 6. Item Title */}
            <div className="bg-yellow-50 p-4 rounded-3xl border border-yellow-200">
                 <label className="text-[10px] font-black text-yellow-800 uppercase tracking-[2px] mb-2 block flex items-center gap-2">
                    <Wrench size={14}/> 6. Listing Title (Verify)
                 </label>
                 <input 
                    type="text" 
                    className="w-full p-4 rounded-2xl border-2 border-white shadow-sm text-base font-black text-slate-900 focus:border-blue-500 outline-none" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="e.g. Note 10 Display (Original)" 
                 />
            </div>

            {/* 7. Pricing */}
            <div className="bg-slate-900 text-white rounded-[32px] p-8 space-y-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10"><DollarSign size={100}/></div>
                
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Retail Price (Customer)</label>
                        <div className="relative">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-600">₹</span>
                            <input type="number" className="w-full bg-transparent border-b-2 border-slate-700 pl-8 pb-3 text-4xl font-black focus:border-blue-500 outline-none transition-all" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"/>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 block">Wholesale Price (Tech)</label>
                        <div className="relative">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-black text-blue-800">₹</span>
                            <input type="number" className="w-full bg-transparent border-b-2 border-blue-900/50 pl-8 pb-3 text-4xl font-black text-blue-400 focus:border-blue-400 outline-none transition-all" value={dealerPrice} onChange={e => setDealerPrice(e.target.value)} placeholder="0"/>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Available Stock (Pcs)</label>
                        <input type="number" className="w-full bg-slate-800 p-4 rounded-2xl border border-slate-700 font-black text-xl outline-none focus:border-blue-500" value={stockQuantity} onChange={e => setStockQuantity(e.target.value)} placeholder="1"/>
                    </div>
                    
                    {industry === 'MOBILE' && (
                        <div 
                            onClick={toggleWarranty}
                            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-4 ${hasWarranty ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800/50 text-slate-500'}`}
                        >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${hasWarranty ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-500'}`}>
                                {hasWarranty ? <CheckSquare size={16}/> : <Square size={16}/>}
                            </div>
                            <div className="flex-1">
                                <p className={`text-[11px] font-black uppercase tracking-wider ${hasWarranty ? 'text-blue-400' : 'text-slate-500'}`}>Enable Fixing & Warranty</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Description */}
            <div>
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-2 block">Description & Notes</label>
                 <textarea 
                    rows={4}
                    className="w-full p-4 rounded-2xl border-2 border-gray-100 text-sm font-medium focus:border-slate-900 outline-none bg-gray-50/50" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Mention specific condition or compatibility notes..." 
                 />
            </div>

            <div className="pt-4 space-y-4">
                {formError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl flex items-start gap-3 animate-pulse">
                        <AlertTriangle className="text-red-500 shrink-0" size={20} />
                        <div>
                            <h4 className="text-red-800 font-black text-xs uppercase tracking-wider">Action Required</h4>
                            <p className="text-red-600 text-sm font-bold">{formError}</p>
                        </div>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isProcessing} 
                    className="w-full bg-slate-900 text-white font-black py-6 rounded-3xl shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 transition-all active:scale-95 text-xl hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isProcessing ? (
                        <>
                            <Loader2 className="animate-spin" size={24} />
                            <span>Processing...</span>
                        </>
                    ) : (
                        <>
                            <span>{id ? 'Update Listing' : 'Publish Product'}</span>
                            <ArrowRight size={24} />
                        </>
                    )}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDeal;
