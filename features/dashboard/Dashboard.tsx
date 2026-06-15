
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import DealCard from '../deals/DealCard';
import { ShoppingBag, Search, ArrowRight, X, ChevronRight, Home, ChevronLeft, Smartphone, Filter, ShieldCheck, Zap, Layers, User, MessageCircle, PlusCircle } from 'lucide-react';
import { DealStatus, IndustryType } from '../../types';
import { POPULAR_MODELS, BRANDS } from './dashboardConstants';
import { useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO';

const Dashboard: React.FC = () => {
  const { currentUser, deals, users, searchQuery, setSearchQuery, platformSettings } = useApp();
  const navigate = useNavigate();
  
  // NAVIGATION STATE: 'BRAND_LIST' -> 'MODEL_LIST' -> 'PRODUCT_LIST'
  const [navState, setNavState] = useState<'BRAND_LIST' | 'MODEL_LIST' | 'PRODUCT_LIST'>('BRAND_LIST');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [viewIndustry, setViewIndustry] = useState<IndustryType>('MOBILE');

  // Load Industry Preference
  useEffect(() => {
      if (currentUser?.industry) {
          setViewIndustry(currentUser.industry);
      }
  }, [currentUser]);

  // Handle Search Query Updates
  useEffect(() => {
      if (searchQuery) {
          setNavState('PRODUCT_LIST');
      } else if (navState === 'PRODUCT_LIST' && !selectedModel) {
          setNavState('BRAND_LIST');
      }
  }, [searchQuery]);

  // --- FILTER LOGIC ---
  const filteredDeals = useMemo(() => {
      const query = searchQuery.toLowerCase();
      const targetIndustry = currentUser?.industry || viewIndustry;
      
      return deals.filter(d => {
          if (d.status !== DealStatus.AVAILABLE) return false;
          const itemIndustry = d.industry || 'MOBILE';
          if (itemIndustry !== targetIndustry) return false;

          // Search Logic (Global Search Bar)
          if (query) {
             return d.title.toLowerCase().includes(query) || 
                    d.description.toLowerCase().includes(query) || 
                    d.tags?.some(t => t.toLowerCase().includes(query));
          }

          // Brand Logic
          const cleanStr = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

          if (selectedBrand && selectedBrand !== 'other') {
              const currentBrandLower = (d.brand || '').toLowerCase();
              const selectedBrandLower = selectedBrand.toLowerCase();
              
              // 1. Check ID Match (e.g. 'xiaomi' === 'xiaomi')
              const idMatch = currentBrandLower === selectedBrandLower;

              // 2. Check Label Match (e.g. 'Xiaomi' === 'Xiaomi')
              // Find the label for the selected ID
              const selectedBrandLabel = BRANDS.find(b => b.id === selectedBrand)?.label.toLowerCase();
              const labelMatch = selectedBrandLabel && currentBrandLower === selectedBrandLabel;

              // 3. Fallback to Title text check for legacy items
              const legacyMatch = d.title.toLowerCase().includes(selectedBrandLabel || 'impossible_string');

              let isBrandMatch = idMatch || labelMatch || legacyMatch;

              const dealModelClean = cleanStr(d.model);
              const dealTitleClean = cleanStr(d.title);

              // 4. RESILIENCE: If seller made a mistake in the Brand field, check if the model belongs to this brand
              if (!isBrandMatch) {
                  const knownModel = POPULAR_MODELS.find(m => 
                      m.brand === selectedBrand && 
                      (dealModelClean.includes(cleanStr(m.id)) || dealTitleClean.includes(cleanStr(m.id)))
                  );
                  if (knownModel) {
                      isBrandMatch = true;
                  }
              }

              // 5. RESILIENCE: If they are inside a specific Model folder, and the deal's model matches that folder, force it to show.
              if (!isBrandMatch && selectedModel) {
                  const modelQuery = cleanStr(selectedModel); 
                  if (dealModelClean.includes(modelQuery) || modelQuery.includes(dealModelClean) || dealTitleClean.includes(modelQuery) || modelQuery.includes(dealTitleClean)) {
                      isBrandMatch = true;
                  }
              }

              if (!isBrandMatch) return false;
          }

          // Model Logic (Folder Selection)
          if (selectedModel) {
              const modelQuery = cleanStr(selectedModel); 
              const brandLabelClean = cleanStr(BRANDS.find(b => b.id === selectedBrand)?.label || '');
              
              // Remove brand name from query to get the core model (e.g. "vivoy71" -> "y71")
              let coreModelQuery = modelQuery;
              if (brandLabelClean && coreModelQuery.startsWith(brandLabelClean)) {
                  coreModelQuery = coreModelQuery.replace(brandLabelClean, '');
              }
              if (coreModelQuery.length < 2) coreModelQuery = modelQuery;

              const dealModelClean = cleanStr(d.model);
              const dealTitleClean = cleanStr(d.title);
              const dealTagsClean = d.tags?.map(t => cleanStr(t)) || [];
              
              // Check if the core model query matches the deal's model, title, or tags
              const modelMatch = dealModelClean && (dealModelClean.includes(coreModelQuery) || coreModelQuery.includes(dealModelClean));
              const titleMatch = dealTitleClean.includes(coreModelQuery);
              const tagMatch = dealTagsClean.some(t => t.includes(coreModelQuery));
              
              if (!modelMatch && !titleMatch && !tagMatch) return false;
          }

          return true;
      });
  }, [deals, searchQuery, viewIndustry, currentUser, selectedModel, selectedBrand]);

  // --- PERSONALIZED DEALS (BASED ON DEVICE MODEL) ---
  const myDeviceDeals = useMemo(() => {
      if (!currentUser?.deviceModel) return [];
      
      const myModel = currentUser.deviceModel.toLowerCase().replace(/\s/g, ''); // remove spaces for better match
      
      return deals.filter(d => {
          if (d.status !== DealStatus.AVAILABLE) return false;
          
          const dealModel = (d.model || '').toLowerCase().replace(/\s/g, '');
          const dealTitle = d.title.toLowerCase().replace(/\s/g, '');
          
          // Check if user's model name is inside deal model or title
          // e.g. User: "A50", Deal: "Samsung A50 Display" -> Match
          return (dealModel.includes(myModel) || dealTitle.includes(myModel));
      }).slice(0, 10);
  }, [deals, currentUser]);

  // --- LATEST ARRIVALS (For Home Screen) ---
  const latestDeals = useMemo(() => {
      const targetIndustry = currentUser?.industry || viewIndustry;
      return deals
          .filter(d => d.status === DealStatus.AVAILABLE && (d.industry || 'MOBILE') === targetIndustry)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);
  }, [deals, currentUser, viewIndustry]);

  // --- DRAFT COUNT (For Admin) ---
  const draftCount = useMemo(() => {
      if (!currentUser?.isAdmin) return 0;
      return deals.filter(d => d.status === DealStatus.DRAFT).length;
  }, [deals, currentUser]);

  // --- DYNAMIC MODEL LIST (ONLY SHOW MODELS WITH STOCK) ---
  const availableModels = useMemo(() => {
      if (!selectedBrand || selectedBrand === 'other') return [];

      const dynamicModels = new Set<string>();
      const cleanStr = (s?: string) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const selectedBrandLabel = BRANDS.find(b => b.id === selectedBrand)?.label.toLowerCase();
      const brandLabelClean = cleanStr(selectedBrandLabel || '');
      const knownBrandModels = POPULAR_MODELS.filter(m => m.brand === selectedBrand);

      deals.forEach(d => {
          // ONLY consider Available items. Hidden items (Drafts) should not show model.
          if (d.status === DealStatus.AVAILABLE) {
              const dealBrandLower = (d.brand || '').toLowerCase();
              
              let isBrandMatch = dealBrandLower === selectedBrand || (selectedBrandLabel && dealBrandLower === selectedBrandLabel);
              
              const dealModelClean = cleanStr(d.model);
              const dealTitleClean = cleanStr(d.title);

              // Try to map to a known model
              let matchedKnownModel = knownBrandModels.find(km => {
                  let kmCore = cleanStr(km.name);
                  if (brandLabelClean && kmCore.startsWith(brandLabelClean)) {
                      kmCore = kmCore.replace(brandLabelClean, '');
                  }
                  if (kmCore.length < 2) kmCore = cleanStr(km.name);

                  return dealModelClean.includes(kmCore) || dealTitleClean.includes(kmCore);
              });

              if (matchedKnownModel) {
                  isBrandMatch = true;
                  dynamicModels.add(matchedKnownModel.name.toUpperCase());
              } else if (isBrandMatch && d.model) {
                  // Clean up the model name to group similar ones
                  let cleaned = d.model.toUpperCase()
                      .replace(/DISPLAY/g, '')
                      .replace(/FRAME/g, '')
                      .replace(/BATTERY/g, '')
                      .replace(/MOTHERBOARD/g, '')
                      .replace(/ORIGINAL/g, '')
                      .replace(/COPY/g, '')
                      .trim();
                  
                  if (cleaned.length < 2) cleaned = d.model.trim().toUpperCase();
                  dynamicModels.add(cleaned);
              }
          }
      });

      return Array.from(dynamicModels).sort();
  }, [deals, selectedBrand]);

  const currentViewTitle = () => {
      switch(viewIndustry) {
          case 'MOBILE': return "Mobile Spares";
          case 'TV_ELECTRONICS': return "Electronics";
          case 'AUTOMOBILE': return "Auto Spares";
          case 'COMPUTER_LAPTOP': return "Computer Parts";
          default: return "Technician Market";
      }
  };

  // --- NAVIGATION ACTIONS ---
  const goHome = () => {
      setNavState('BRAND_LIST');
      setSelectedBrand(null);
      setSelectedModel(null);
      setSearchQuery('');
  };

  const selectBrand = (brandId: string) => {
      if (brandId === 'other') {
          setNavState('PRODUCT_LIST');
          setSelectedBrand('other');
          setSelectedModel(null);
      } else {
          setSelectedBrand(brandId);
          setNavState('MODEL_LIST');
      }
  };

  const selectModel = (modelName: string) => {
      setSelectedModel(modelName);
      setNavState('PRODUCT_LIST');
  };

  const goBack = () => {
      if (navState === 'PRODUCT_LIST') {
          if (selectedModel) {
              setNavState('MODEL_LIST');
              setSelectedModel(null);
          } else {
              goHome();
          }
      } else if (navState === 'MODEL_LIST') {
          goHome();
      }
  };

  const handleRequestPart = () => {
      const brandName = BRANDS.find(b => b.id === selectedBrand)?.label || selectedBrand;
      const msg = `Hello Admin, I am looking for a spare part for *${brandName}* which is not listed in the app. Can you check stock?`;
      
      // Use dynamic Support Phone from Admin Settings
      const adminPhone = platformSettings?.supportPhone 
          ? platformSettings.supportPhone.replace('+91', '').replace(/\s/g, '') 
          : '9876543210';

      window.open(`https://wa.me/91${adminPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24 font-sans text-slate-900">
      <SEO title={currentViewTitle()} description="Buy and sell spares securely." />

      <div className="max-w-lg md:max-w-7xl mx-auto px-4 mt-6">
          
          {/* --- PERSONALIZED FOR YOUR DEVICE (TOP ROW AS REQUESTED) --- */}
          {myDeviceDeals.length > 0 && navState === 'BRAND_LIST' && !searchQuery && (
              <div className="mb-10 animate-in fade-in slide-in-from-top-10 duration-700">
                  <div className="flex items-center justify-between mb-4 px-1">
                      <div>
                          <h3 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                              <div className="bg-blue-600 p-1.5 rounded-lg">
                                  <Smartphone size={18} className="text-white" />
                              </div>
                              For Your {currentUser?.deviceModel}
                          </h3>
                          <p className="text-[10px] md:text-xs text-blue-600 font-black uppercase tracking-widest mt-1">Directly Compatible Spares</p>
                      </div>
                      <button 
                        onClick={() => {
                            setSearchQuery(currentUser?.deviceModel || '');
                            setNavState('PRODUCT_LIST');
                        }}
                        className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors uppercase tracking-wider"
                      >
                          View All
                      </button>
                  </div>
                  
                  <div className="flex gap-4 overflow-x-auto pb-6 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                      {myDeviceDeals.map(deal => (
                          <div key={deal.id} className="w-44 md:w-60 flex-shrink-0 snap-center">
                              <DealCard 
                                  deal={deal} 
                                  currentUserId={currentUser?.id || ''} 
                                  sellerName={users.find(u => u.id === deal.sellerId)?.shopName || users.find(u => u.id === deal.sellerId)?.name || 'Seller'}
                                  sellerVerified={users.find(u => u.id === deal.sellerId)?.kycVerified}
                                  isOfficialStore={users.find(u => u.id === deal.sellerId)?.role === 'ADMIN'}
                                  minimal={true} 
                              />
                          </div>
                      ))}
                      
                      {/* LAST CARD: "VIEW MORE" */}
                      <button 
                        onClick={() => {
                            setSearchQuery(currentUser?.deviceModel || '');
                            setNavState('PRODUCT_LIST');
                        }}
                        className="w-44 md:w-60 flex-shrink-0 snap-center bg-white rounded-2xl border-2 border-dashed border-blue-100 flex flex-col items-center justify-center p-6 gap-3 group hover:border-blue-300 transition-all"
                      >
                          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <ArrowRight className="text-blue-600" size={24} />
                          </div>
                          <p className="text-xs font-black text-blue-600 uppercase">View All Results</p>
                      </button>
                  </div>
                  <div className="h-px bg-gray-200 mt-2 opacity-50"></div>
              </div>
          )}

          {/* --- NEW: TEMPER KING PROMOTIONAL AD BANNER --- */}
          <div 
            onClick={() => navigate('/temper-king')}
            className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl md:rounded-[32px] p-4 md:p-6 text-white shadow-xl mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer relative overflow-hidden group border border-blue-500/30"
          >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[90px] opacity-20"></div>
              <div className="flex items-center gap-4 relative z-10">
                  <div className="bg-blue-500/10 p-3 rounded-2xl border border-blue-500/25 shrink-0 group-hover:scale-110 transition-transform">
                      <span className="text-3xl">👑</span>
                  </div>
                  <div>
                      <div className="flex items-center gap-2">
                          <span className="bg-yellow-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">இலவச சலுகை</span>
                          <h4 className="font-extrabold text-[#FFC915] text-[10px] uppercase tracking-widest">TEMPER KING</h4>
                      </div>
                      <h3 className="font-black text-sm md:text-xl text-white mt-1 leading-tight">
                          டெம்பர் கிங் ஷோரூம் - இப்பொழுதே திறக்கப்பட்டுள்ளது! 📱
                      </h3>
                      <p className="text-[10px] md:text-xs text-slate-400 font-medium mt-1 leading-relaxed max-w-xl">
                          உங்களது மொபைல் மாடலைத் தேர்ந்தெடுத்து 11D, மேட் அல்லது பிரைவசி உலகத்தரம் வாய்ந்த டெம்பர்களை "1 வாங்கினால் 1 இலவசம்" திறப்பு விழா சலுகையுடன் பெறுங்கள்!
                      </p>
                  </div>
              </div>
              <div className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black px-5 py-3 rounded-xl text-xs uppercase tracking-widest relative z-10 shrink-0 w-full sm:w-auto text-center justify-center">
                  <span>இணக்கத்தன்மை சரிபார்க்கவும்</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
              </div>
          </div>

          {/* --- ADMIN: PENDING DRAFTS NOTIFICATION --- */}
          {currentUser?.isAdmin && draftCount > 0 && (
              <div 
                onClick={() => navigate('/shop')}
                className="bg-purple-600 text-white rounded-2xl p-4 mb-6 shadow-xl shadow-purple-200 flex items-center justify-between cursor-pointer border border-purple-500 group"
              >
                  <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform">
                          <Layers size={24} className="text-white"/>
                      </div>
                      <div>
                          <h3 className="font-black text-lg leading-none">{draftCount} Pending Drafts</h3>
                          <p className="text-xs text-purple-200 font-medium mt-1">Tap to add Prices & Photos</p>
                      </div>
                  </div>
                  <div className="bg-white text-purple-700 px-4 py-2 rounded-xl text-xs font-black shadow-sm group-hover:bg-purple-50 transition-colors">
                      Manage Stock
                  </div>
              </div>
          )}

          {/* --- WHOLESALE BANNER --- */}
          {(!currentUser || (!currentUser.kycVerified && !currentUser.isAdmin)) && (
              <div 
                onClick={() => navigate(currentUser ? '/technician-verification' : '/login')}
                className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl md:rounded-[32px] p-4 md:p-6 text-white shadow-xl mb-6 md:mb-8 flex items-center gap-3 md:gap-6 cursor-pointer relative overflow-hidden group border-2 border-yellow-500/20"
              >
                  <div className="bg-white/10 p-3 md:p-5 rounded-2xl md:rounded-3xl group-hover:scale-110 transition-transform shadow-inner shrink-0">
                      <ShieldCheck className="w-5 h-5 md:w-8 md:h-8 text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                      <h3 className="font-black text-sm md:text-xl text-yellow-400 uppercase tracking-widest leading-tight truncate">Are you a Technician?</h3>
                      <p className="text-[10px] md:text-sm text-slate-300 font-medium mt-0.5 md:mt-1 leading-relaxed">
                          Verify shop documents & unlock <span className="text-white font-black underline decoration-yellow-400 decoration-2 underline-offset-4">Wholesale Prices</span>.
                      </p>
                  </div>
                  <ArrowRight size={24} className="text-yellow-400 hidden md:block group-hover:translate-x-2 transition-transform"/>
                  <div className="absolute right-0 top-0 bottom-0 w-1.5 md:w-3 bg-yellow-400"></div>
              </div>
          )}

          {/* --- BREADCRUMBS --- */}
          {navState !== 'BRAND_LIST' && !searchQuery && (
              <div className="flex items-center gap-2 mb-8 bg-white w-fit px-5 py-2.5 rounded-full border border-gray-100 shadow-sm animate-in slide-in-from-left-4">
                  <button onClick={goHome} className="text-blue-600 hover:scale-110 transition-transform">
                      <Home size={18}/>
                  </button>
                  {selectedBrand && (
                      <>
                          <ChevronRight size={16} className="text-gray-300"/>
                          <button onClick={() => { setNavState('MODEL_LIST'); setSelectedModel(null); }} className={`text-xs font-black uppercase tracking-widest ${navState === 'MODEL_LIST' ? 'text-slate-900' : 'text-gray-400 hover:text-slate-600'}`}>
                              {BRANDS.find(b => b.id === selectedBrand)?.label}
                          </button>
                      </>
                  )}
                  {selectedModel && (
                      <>
                          <ChevronRight size={16} className="text-gray-300"/>
                          <span className="text-xs font-black text-slate-900 uppercase tracking-widest truncate max-w-[200px]">
                              {selectedModel}
                          </span>
                      </>
                  )}
              </div>
          )}

          {/* VIEW 1: BRAND GRID */}
          {navState === 'BRAND_LIST' && !searchQuery && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                  <div className="flex items-center justify-between mb-6">
                      <div>
                          <h2 className="text-xl md:text-2xl font-black text-slate-900">Select Brand</h2>
                          <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Trusted Manufacturer Parts</p>
                      </div>
                      
                      {!currentUser && (
                          <div className="relative inline-block">
                              <select 
                                value={viewIndustry}
                                onChange={(e) => setViewIndustry(e.target.value as IndustryType)}
                                className="appearance-none bg-white text-gray-500 text-[11px] font-black py-2.5 pl-4 pr-10 rounded-2xl border border-gray-200 shadow-sm outline-none uppercase tracking-widest cursor-pointer hover:bg-gray-50 transition-colors"
                              >
                                  <option value="MOBILE">Mobile Spares</option>
                                  <option value="TV_ELECTRONICS">Electronics</option>
                                  <option value="COMPUTER_LAPTOP">Computer</option>
                              </select>
                              <Filter size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                          </div>
                      )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                      {BRANDS.map(brand => (
                          <button
                              key={brand.id}
                              onClick={() => selectBrand(brand.id)}
                              className={`
                                group relative p-4 md:p-8 rounded-2xl md:rounded-[32px] bg-white border border-gray-100 shadow-sm 
                                hover:shadow-2xl hover:border-transparent hover:-translate-y-2 transition-all duration-500
                                flex flex-col items-start justify-between h-32 md:h-40 overflow-hidden
                                ${brand.border}
                              `}
                          >
                              <div className={`absolute -right-6 -bottom-6 w-24 h-24 md:w-32 md:h-32 rounded-full ${brand.bg} blur-3xl opacity-40 group-hover:opacity-100 transition-opacity`}></div>
                              
                              <span className={`text-lg md:text-2xl font-black tracking-tight ${brand.color} z-10 uppercase truncate w-full text-left`}>
                                  {brand.label}
                              </span>
                              
                              <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[2px] text-gray-400 group-hover:text-slate-900 transition-colors z-10 mt-auto">
                                  View Models <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform hidden md:block"/>
                              </div>
                          </button>
                      ))}
                  </div>

                  {/* --- LATEST ARRIVALS SECTION --- */}
                  {latestDeals.length > 0 ? (
                      <div className="mt-8 md:mt-12 animate-in fade-in slide-in-from-bottom-10 delay-100">
                          <div className="flex items-center justify-between mb-4">
                              <div>
                                  <h3 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                                      <Zap size={20} className="text-yellow-500 fill-yellow-500" /> Just Arrived
                                  </h3>
                                  <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Fresh Stock Updates</p>
                              </div>
                              <button onClick={() => selectBrand('other')} className="text-[10px] md:text-xs font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors uppercase tracking-wider">
                                  View All
                              </button>
                          </div>
                          
                          <div className="flex gap-4 overflow-x-auto pb-6 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                              {latestDeals.map(deal => (
                                  <div key={deal.id} className="w-44 md:w-56 flex-shrink-0 snap-center">
                                      <DealCard 
                                          deal={deal} 
                                          currentUserId={currentUser?.id || ''} 
                                          sellerName={users.find(u => u.id === deal.sellerId)?.shopName || users.find(u => u.id === deal.sellerId)?.name || 'Seller'}
                                          sellerVerified={users.find(u => u.id === deal.sellerId)?.kycVerified}
                                          isOfficialStore={users.find(u => u.id === deal.sellerId)?.role === 'ADMIN'}
                                          minimal={true} 
                                      />
                                  </div>
                              ))}
                          </div>
                      </div>
                  ) : (
                      currentUser?.isAdmin ? (
                          <div className="mt-8 p-6 bg-yellow-50 rounded-2xl border border-yellow-100 text-center animate-pulse">
                              <p className="text-sm font-bold text-yellow-800 mb-2">Market is Empty</p>
                              <p className="text-xs text-yellow-700 mb-4">You have no active listings. Add stock or publish drafts.</p>
                              <button onClick={() => navigate('/shop')} className="bg-yellow-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md">
                                  + Manage Stock
                              </button>
                          </div>
                      ) : (
                          // CUSTOMER EMPTY STATE GUIDE
                          <div className="mt-8 p-8 bg-white rounded-3xl border border-dashed border-gray-200 text-center">
                              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <ShoppingBag size={24} className="text-gray-300"/>
                              </div>
                              <h3 className="text-lg font-bold text-gray-900">Marketplace Ready</h3>
                              <p className="text-sm text-gray-500 mt-1 mb-4">Select a brand above to browse specific parts.</p>
                          </div>
                      )
                  )}

                  {/* PROMO CARD */}
                  <div className="mt-4 md:mt-8 p-5 md:p-8 bg-slate-900 rounded-3xl md:rounded-[40px] text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
                      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
                      <div className="relative z-10 flex items-start gap-4 md:gap-6">
                          <div className="bg-blue-500/20 p-3 md:p-4 rounded-2xl md:rounded-3xl border border-blue-500/30 shrink-0">
                            <ShoppingBag className="w-6 h-6 md:w-10 md:h-10 text-blue-400"/>
                          </div>
                          <div>
                              <h3 className="text-lg md:text-2xl font-black mb-1 md:mb-2">Full Inventory Access</h3>
                              <p className="text-slate-400 text-xs md:text-sm font-medium max-w-md leading-relaxed">Browse thousands of spare parts, accessories, and tools from verified sellers.</p>
                          </div>
                      </div>
                      <button onClick={() => selectBrand('other')} className="relative z-10 bg-white text-slate-900 font-black px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl hover:scale-105 transition-transform shadow-lg whitespace-nowrap text-[10px] md:text-sm uppercase tracking-widest w-full md:w-auto">
                          Browse All Items
                      </button>
                  </div>
              </div>
          )}

          {/* VIEW 2: MODEL LIST */}
          {navState === 'MODEL_LIST' && !searchQuery && selectedBrand && (
              <div className="animate-in fade-in slide-in-from-right-8 duration-300">
                  <div className="flex items-center gap-4 mb-8">
                      <button onClick={goBack} className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 transition-colors">
                          <ChevronLeft size={24} className="text-slate-900"/>
                      </button>
                      <div>
                          <h2 className="text-2xl font-black text-slate-900">Choose Model</h2>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Available parts for {BRANDS.find(b => b.id === selectedBrand)?.label}</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {/* DYNAMIC MODELS (That have stock) */}
                      {availableModels.map(modelName => (
                          <button
                              key={modelName}
                              onClick={() => selectModel(modelName)}
                              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-blue-400 hover:shadow-xl transition-all text-left group h-32 flex flex-col justify-between"
                          >
                              <Smartphone size={24} className="text-gray-300 group-hover:text-blue-500 group-hover:scale-110 transition-all"/>
                              <span className="text-xs font-black text-slate-800 leading-tight group-hover:text-blue-600 uppercase tracking-wider">
                                  {modelName}
                              </span>
                          </button>
                      ))}

                      {/* REQUEST CARD (Always show at end) */}
                      <button
                          onClick={handleRequestPart}
                          className="bg-purple-50 p-6 rounded-3xl border border-purple-100 shadow-sm hover:shadow-lg transition-all text-left group h-32 flex flex-col justify-between"
                      >
                          <div className="flex justify-between items-start">
                              <PlusCircle size={24} className="text-purple-400 group-hover:text-purple-600 group-hover:scale-110 transition-all"/>
                              <MessageCircle size={16} className="text-purple-300" />
                          </div>
                          <div>
                              <span className="text-xs font-black text-purple-900 leading-tight block">
                                  Can't find your model?
                              </span>
                              <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider mt-1 block group-hover:underline">
                                  Request via WhatsApp
                              </span>
                          </div>
                      </button>
                  </div>
              </div>
          )}

          {/* VIEW 3: PRODUCT GRID */}
          {navState === 'PRODUCT_LIST' && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-300">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                      <div className="flex items-center gap-4">
                          {!searchQuery && (
                              <button onClick={goBack} className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 transition-colors">
                                  <ChevronLeft size={24} className="text-slate-900"/>
                              </button>
                          )}
                          <div>
                              <h2 className="text-2xl md:text-3xl font-black text-slate-900">
                                  {selectedModel || (searchQuery ? 'Search Results' : 'All Listings')}
                              </h2>
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Available components and parts</p>
                          </div>
                      </div>
                      <div className="bg-slate-900 text-white px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-[2px] shadow-xl w-fit">
                          {filteredDeals.length} Items Found
                      </div>
                  </div>

                  {filteredDeals.length === 0 ? (
                      <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-gray-200">
                          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Search size={48} className="text-gray-200"/>
                          </div>
                          <h3 className="text-xl font-black text-slate-900">No matching spares found.</h3>
                          <p className="text-gray-400 text-sm mt-2 font-medium">Try broadening your search or choosing a different model.</p>
                          <div className="flex justify-center gap-4 mt-8">
                              <button onClick={goHome} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">
                                  Back to Home
                              </button>
                              <button onClick={handleRequestPart} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition shadow-lg">
                                  Request Part
                              </button>
                          </div>
                      </div>
                  ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                          {filteredDeals.map(deal => (
                                <DealCard 
                                    key={deal.id} 
                                    deal={deal} 
                                    currentUserId={currentUser?.id || ''} 
                                    sellerName={users.find(u => u.id === deal.sellerId)?.shopName || users.find(u => u.id === deal.sellerId)?.name || 'Seller'}
                                    sellerVerified={users.find(u => u.id === deal.sellerId)?.kycVerified || true}
                                    sellerTrustScore={users.find(u => u.id === deal.sellerId)?.trustScore}
                                    isOfficialStore={users.find(u => u.id === deal.sellerId)?.role === 'ADMIN'}
                                    minimal={true}
                                />
                          ))}
                      </div>
                  )}
              </div>
          )}

      </div>
    </div>
  );
};

export default Dashboard;
