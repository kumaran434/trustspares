
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { DealStatus, DeliveryType, ServiceType } from '../../types';
import { ShieldCheck, ArrowRight, Star, Truck, ArrowLeft, Share2, MapPin, BadgeCheck, Store, Zap, Minus, Plus, Wrench, CheckCircle2, Navigation, MessageSquare, UserCheck, QrCode, X, Download, KeyRound, Ticket, RefreshCw, ShoppingBag, Receipt, Users, Crosshair, Calendar, Clock, Smartphone, Globe } from 'lucide-react';
import PaymentGateway from '../wallet/PaymentGateway';
import { handleShareProduct } from './dealsConstants';
import SEO from '../../components/SEO';
import QRCode from 'react-qr-code';
import { Helmet } from 'react-helmet-async'; // Import Helmet for JSON-LD
import ShopMapPreview from '../../components/ShopMapPreview';

const DealDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deals, users, currentUser, processEscrowPayment, bookShopVisit, bookRepairOrder, cancelOrder } = useApp();
  
  const deal = deals.find(d => d.id === id);
  
  // Fallback seller if user profile is missing (Deleted user or data sync issue)
  const foundSeller = users.find(u => u.id === deal?.sellerId);
  const seller = foundSeller || {
      id: deal?.sellerId || 'unknown',
      name: 'TrustSpares Seller',
      shopName: 'Verified Seller',
      mobile: '9876543210',
      address: 'Location shared after booking',
      latitude: 0,
      longitude: 0,
      kycVerified: true,
      role: 'SELLER',
      email: '',
      industry: 'MOBILE',
      avatar: '',
      walletBalance: 0,
      escrowBalance: 0,
      trustScore: 5.0,
      kycStatus: 'VERIFIED',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
  } as any;

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedQty, setSelectedQty] = useState(1);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryType>(DeliveryType.SHOP_VISIT);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'REVIEWS'>('DETAILS');

  // Cancel Modal State
  const [cancelDealId, setCancelDealId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  if (!deal) return <div className="p-8 text-center text-lg font-bold text-gray-500">Loading Product...</div>;

  const isTemperKing = deal?.location === 'Temper King Store';

  // Check if the VIEWING USER is a verified technician
  const isBuyerVerifiedTech = currentUser?.kycVerified === true;
  
  const isMobileItem = deal.industry === 'MOBILE';
  
  // Logic: Check if fixing/warranty is included (Admin ticked box)
  const hasFixingIncluded = isMobileItem && (deal.fixingCharge || 0) > 0;
  
  const isMyOrder = deal.buyerId === currentUser?.id;
  const isBooked = (deal.status === DealStatus.APPOINTMENT_BOOKED || deal.status === DealStatus.PAYMENT_PENDING) && isMyOrder;
  const isDone = deal.status === DealStatus.COMPLETED && isMyOrder;

  const retailSparePrice = deal.amount;
  const technicianSparePrice = deal.dealerPrice || retailSparePrice;
  
  // PRICE CALCULATION: Strictly admin price. No extras.
  const unitPrice = isBuyerVerifiedTech ? technicianSparePrice : retailSparePrice;
  const totalAmount = unitPrice * selectedQty;

  const productImages = (deal.listingImages && deal.listingImages.length > 0) 
      ? deal.listingImages 
      : (deal.listingImage ? [deal.listingImage] : ["https://placehold.co/600x600?text=No+Image"]);
  const productReviews = deal.productReviews || [];

  // --- WARRANTY CALCULATION ---
  const getWarrantyDate = () => {
      if (!deal.completedAt) return null;
      const completedDate = new Date(deal.completedAt);
      // Add 90 Days (3 Months)
      completedDate.setDate(completedDate.getDate() + 90);
      return completedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleAction = async () => {
      if (!currentUser) { navigate('/login'); return; }
      
      setIsBooking(true);
      try {
          if (selectedDelivery === DeliveryType.SHOP_VISIT) {
              await bookShopVisit(deal.id, ServiceType.PURCHASE);
          } else if (selectedDelivery === DeliveryType.REPAIR_COURIER) {
              // FOR REPAIR: Book without payment initially
              await bookRepairOrder(deal.id);
              alert("Order Placed! Please send your device to the shop address shown in My Orders.");
              navigate('/orders');
          } else {
              // FOR COURIER: Immediate Payment
              setIsPaymentModalOpen(true);
          }
      } catch (e) {
          alert("Booking failed.");
      } finally {
          if (selectedDelivery !== DeliveryType.COURIER) {
              setIsBooking(false);
          }
      }
  };

  const onShare = () => {
    handleShareProduct(deal, seller.shopName || seller.name);
  };

  // --- GOOGLE MAPS LOGIC ---
  const openMaps = () => {
      if (seller.googleMapsLink) {
          // Precise Seller Google Maps Link
          window.open(seller.googleMapsLink, '_blank');
      } else if (seller.latitude && seller.longitude) {
          // Accurate GPS Navigation
          window.open(`https://www.google.com/maps/search/?api=1&query=${seller.latitude},${seller.longitude}`, '_blank');
      } else {
          // Fallback to Address Text Search
          window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(seller.address || '')}`, '_blank');
      }
  };

  const productLink = `https://trustspares.in/#/deal/${deal.id}`;
  const displayImage = productImages.length > 0 ? productImages[0] : "https://cdn-icons-png.flaticon.com/512/2438/2438078.png";

  // --- GOOGLE STRUCTURED DATA (JSON-LD) ---
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": deal.title,
    "image": productImages,
    "description": deal.description,
    "sku": deal.id,
    "brand": {
      "@type": "Brand",
      "name": deal.brand || "Generic"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://trustspares.in/deal/${deal.id}`,
      "priceCurrency": "INR",
      "price": deal.amount,
      "priceValidUntil": "2025-12-31",
      "availability": deal.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": seller.shopName || "TrustSpares"
      }
    }
  };

  // Generate SEO Keywords dynamically
  const seoKeywords = [
      deal.title,
      `${deal.brand} ${deal.model} Display`,
      `${deal.brand} Original Spares`,
      deal.category,
      "Mobile Spare Parts India",
      "TrustSpares"
  ];

  return (
    <div className={`pb-40 min-h-screen ${isTemperKing ? 'bg-[#101010] text-[#eaeaea]' : 'bg-white text-slate-800'}`}>
      {/* 1. Standard Meta Tags */}
      <SEO 
        title={deal.title} 
        description={`Buy ${deal.title} for ₹${deal.amount}. ${deal.description.substring(0, 80)}...`} 
        image={displayImage}
        keywords={seoKeywords}
      />

      {/* 2. Structured Data for Google Rich Results */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      </Helmet>

      {currentUser && (
        <PaymentGateway 
            amount={totalAmount} 
            isOpen={isPaymentModalOpen} 
            onClose={() => { setIsPaymentModalOpen(false); setIsBooking(false); }} 
            onSuccess={(pid) => processEscrowPayment(deal.id, pid, selectedDelivery)} 
        />
      )}

      {/* QR Code Modal */}
      {showQrModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className={`${isTemperKing ? 'bg-[#1c1b1b] border border-white/10 text-white' : 'bg-white text-slate-900'} w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center relative animate-in zoom-in-95`}>
                  <button onClick={() => setShowQrModal(false)} className={`absolute top-4 right-4 p-2 ${isTemperKing ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-100'} rounded-full`}><X size={20}/></button>
                  <h3 className={`text-xl font-black ${isTemperKing ? 'text-white' : 'text-slate-900'} mb-2`}>Product QR Code</h3>
                  <p className="text-xs text-gray-500 mb-6 uppercase font-bold tracking-widest">Scan to View Item</p>
                  
                  <div className="bg-white p-4 rounded-3xl border-4 border-slate-900 shadow-xl inline-block mb-6">
                      <QRCode value={productLink} size={200} viewBox={`0 0 256 256`} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                  </div>

                  <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-400">Scan this code using any QR scanner to see product details instantly.</p>
                      <button 
                        onClick={() => window.print()}
                        className={`w-full ${isTemperKing ? 'bg-[#f2ca50] text-[#3c2f00]' : 'bg-slate-900 text-white'} font-bold py-3 rounded-xl flex items-center justify-center gap-2`}
                      >
                          <Download size={18}/> Save or Print QR
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Header */}
      <div className={`px-4 py-3 flex justify-between items-center border-b ${isTemperKing ? 'border-white/5 bg-[#101010]' : 'border-gray-50 bg-white'} sticky top-0 z-30`}>
          <button onClick={() => navigate(-1)} className={`p-2 ${isTemperKing ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'} rounded-full transition-colors`}><ArrowLeft size={20}/></button>
          <div className="flex gap-2">
               <button onClick={() => setShowQrModal(true)} className={`p-2 ${isTemperKing ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-gray-50 text-slate-900 hover:bg-slate-100'} rounded-full transition-colors`}>
                 <QrCode size={20}/>
               </button>
               <button onClick={onShare} className={`p-2 ${isTemperKing ? 'bg-[#f2ca50]/10 text-[#f2ca50] hover:bg-[#f2ca50]/20' : 'bg-gray-50 text-blue-600 hover:bg-blue-50'} rounded-full transition-colors`}>
                 <Share2 size={20}/>
               </button>
          </div>
      </div>

      <div className="max-w-6xl mx-auto md:flex md:gap-12 md:p-10">
          {/* Images Section - Made Larger and Sticky on Desktop */}
          <div className="md:w-3/5 lg:w-1/2">
               <div className="md:sticky md:top-24">
                   <div className="flex overflow-x-auto snap-x scrollbar-hide h-[350px] md:h-[500px] lg:h-[600px] md:rounded-[40px] border ${isTemperKing ? 'border-white/10 bg-[#1c1b1b]/50 shadow-inner' : 'border-gray-100 bg-gray-50/50 shadow-inner'}">
                       {productImages.map((img, i) => (
                           <div key={i} className="flex-shrink-0 w-full h-full flex items-center justify-center snap-center p-6">
                               <img src={img} className="max-w-full max-h-full object-contain ${isTemperKing ? 'brightness-110 contrast-105' : 'mix-blend-multiply'} hover:scale-105 transition-transform duration-700" />
                           </div>
                       ))}
                   </div>
                   {/* Thumbnail dots for multi-image */}
                   {productImages.length > 1 && (
                       <div className="flex justify-center gap-2 mt-4">
                           {productImages.map((_, i) => (
                               <div key={i} className={`w-1.5 h-1.5 rounded-full ${isTemperKing ? 'bg-[#f2ca50]/50' : 'bg-gray-200'}`}></div>
                           ))}
                       </div>
                   )}
               </div>
          </div>

          <div className="px-4 mt-6 md:mt-0 md:px-0 md:w-2/5 lg:w-1/2 space-y-6">
              <div>
                  <div className="flex items-center gap-2 mb-2">
                      <div className={`flex items-center gap-0.5 ${isTemperKing ? 'bg-[#f2ca50]/15 text-[#f2ca50]' : 'bg-orange-50 text-orange-600'} px-2.5 py-1 rounded-full`}>
                          <Star size={14} fill="currentColor" />
                          <span className="text-sm font-black">{deal.rating || '5.0'}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">• {productReviews.length} Reviews</span>
                  </div>
                  <h1 className={`text-2xl md:text-4xl font-black ${isTemperKing ? 'text-white' : 'text-slate-900'} leading-tight mb-4`}>{deal.title}</h1>

                  {/* --- NEW: DIGITAL WARRANTY CARD (SHOWN ONLY WHEN COMPLETED) --- */}
                  {isDone && hasFixingIncluded && (
                       <div className="relative bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-3xl p-6 mb-6 shadow-xl shadow-yellow-100/50 overflow-hidden animate-in zoom-in duration-500">
                           {/* Decorative BG */}
                           <div className="absolute -right-4 -top-4 text-yellow-200 opacity-50"><ShieldCheck size={100} /></div>
                           
                           <div className="relative z-10">
                               <div className="flex justify-between items-start mb-4">
                                   <div>
                                       <h3 className="text-yellow-700 font-black text-xs uppercase tracking-widest flex items-center gap-1">
                                           <BadgeCheck size={14} className="fill-yellow-600 text-white"/> Official Warranty
                                       </h3>
                                       <p className="text-xl font-black text-slate-900 mt-1">3 Month Warranty</p>
                                   </div>
                               </div>
                               
                               <div className="space-y-3">
                                   <div className="flex justify-between items-center bg-white/60 p-3 rounded-xl backdrop-blur-sm border border-yellow-100">
                                       <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                           <Calendar size={14}/> Valid Until
                                       </div>
                                       <span className="text-sm font-black text-slate-900">{getWarrantyDate()}</span>
                                   </div>
                                   
                                   <div className="flex justify-between items-center bg-white/60 p-3 rounded-xl backdrop-blur-sm border border-yellow-100">
                                       <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                           <Store size={14}/> Shop
                                       </div>
                                       <span className="text-sm font-black text-slate-900">{seller.shopName || seller.name}</span>
                                   </div>
                               </div>

                               <div className="mt-4 pt-4 border-t border-yellow-200/50 text-[10px] font-medium text-yellow-800 leading-tight text-center">
                                   Show this digital card at the shop for any display or touch issues within the valid period. Physical damage not covered.
                               </div>
                           </div>
                       </div>
                  )}

                  {/* SUCCESS RECEIPT (NON-WARRANTY OR STANDARD) */}
                  {isDone && !hasFixingIncluded && (
                       <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-6 mb-6 shadow-sm animate-in fade-in zoom-in duration-500">
                           <div className="flex justify-between items-start mb-4">
                               <div>
                                   <h3 className="text-green-700 font-black text-xs uppercase tracking-widest">Service Completed</h3>
                                   <p className="text-xl font-bold text-green-800">Order Delivered!</p>
                               </div>
                               <Receipt className="text-green-600" size={32} />
                           </div>
                           <div className="bg-white rounded-2xl p-4 border border-green-100">
                                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                                    <span>Date</span>
                                    <span>Order ID</span>
                                </div>
                                <div className="flex justify-between text-xs font-black text-slate-700 mt-1">
                                    <span>{new Date(deal.completedAt || deal.createdAt).toLocaleDateString()}</span>
                                    <span>#{deal.id.substring(0,8).toUpperCase()}</span>
                                </div>
                           </div>
                       </div>
                  )}

                  {/* PICKUP OTP CARD */}
                  {isBooked && deal.visitOtp && deal.status !== DealStatus.PAYMENT_PENDING && (
                      <div className={`text-white p-8 rounded-[32px] mb-6 shadow-2xl border-4 ${isTemperKing ? 'bg-[#1c1b1b] border-[#f2ca50]' : 'bg-slate-900 border-blue-500'} animate-in zoom-in duration-500`}>
                          <div className="flex justify-between items-start mb-6">
                              <div>
                                  <h3 className={`font-black text-xs uppercase tracking-widest ${isTemperKing ? 'text-[#f2ca50]' : 'text-blue-400'}`}>Pickup Token</h3>
                                  <p className="text-2xl font-bold">Show this at Shop</p>
                              </div>
                              <Ticket className={isTemperKing ? 'text-[#f2ca50]' : 'text-blue-500'} size={40} />
                          </div>
                          <div className="bg-white/10 rounded-3xl p-6 text-center border border-white/20">
                                <p className="text-gray-400 text-xs font-bold uppercase mb-2">Secret OTP Code</p>
                                <p className={`text-6xl font-black tracking-[12px] ${isTemperKing ? 'text-[#f2ca50]' : 'text-blue-400'}`}>{deal.visitOtp}</p>
                          </div>
                          <p className="text-xs text-gray-400 mt-6 text-center leading-relaxed font-medium">
                              Visit the shop, verify the item, pay the seller directly, and share this code to complete your order.
                          </p>
                          
                          {/* NEW: GET DIRECTIONS BUTTON DIRECTLY ON OTP CARD */}
                          {seller.address && seller.address !== "Location shared after booking" && (
                              <button 
                                  onClick={openMaps} 
                                  className={`w-full mt-6 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg ${
                                      isTemperKing 
                                          ? 'bg-[#f2ca50] text-[#3c2f00] hover:bg-[#ebd074] shadow-yellow-905/20' 
                                          : 'bg-blue-600 text-white hover:bg-blue-505 shadow-blue-900/50'
                                  }`}
                              >
                                  <Navigation size={20} /> Get Directions to Shop
                              </button>
                          )}
                      </div>
                  )}
                  
                  {/* Delivery Mode Selection */}
                  {!isBooked && !isDone && deal.status === DealStatus.AVAILABLE && (
                      <div className="space-y-4 mb-6">
                        <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 p-1.5 ${isTemperKing ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-gray-100 border border-gray-200'} rounded-3xl border`}>
                            <button 
                                onClick={() => setSelectedDelivery(DeliveryType.SHOP_VISIT)}
                                className={`flex flex-col items-center gap-2 py-4 rounded-2xl transition-all ${selectedDelivery === DeliveryType.SHOP_VISIT ? (isTemperKing ? 'bg-[#f2ca50] text-[#3c2f00] shadow-lg font-black' : 'bg-white shadow-md text-blue-600') : (isTemperKing ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600')}`}
                            >
                                <Store size={22}/>
                                <span className="text-[10px] font-black uppercase tracking-wider text-center">Visit Shop</span>
                            </button>
                            <button 
                                onClick={() => setSelectedDelivery(DeliveryType.COURIER)}
                                className={`flex flex-col items-center gap-2 py-4 rounded-2xl transition-all ${selectedDelivery === DeliveryType.COURIER ? (isTemperKing ? 'bg-[#f2ca50] text-[#3c2f00] shadow-lg font-black' : 'bg-white shadow-md text-blue-600') : (isTemperKing ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600')}`}
                            >
                                <Truck size={22}/>
                                <span className="text-[10px] font-black uppercase tracking-wider text-center">Courier Home</span>
                            </button>
                            
                            {/* NEW OPTION: SEND DEVICE FOR REPAIR */}
                            <button 
                                onClick={() => setSelectedDelivery(DeliveryType.REPAIR_COURIER)}
                                className={`flex flex-col items-center gap-2 py-4 rounded-2xl transition-all ${selectedDelivery === DeliveryType.REPAIR_COURIER ? (isTemperKing ? 'bg-[#f2ca50] text-[#3c2f00] shadow-lg font-black' : 'bg-white shadow-md text-orange-600') : (isTemperKing ? 'text-slate-400 hover:text-slate-200' : 'text-gray-400 hover:text-gray-600')}`}
                            >
                                <Smartphone size={22}/>
                                <span className="text-[10px] font-black uppercase tracking-wider text-center">Send Device</span>
                            </button>
                        </div>

                        {/* HELPER TEXT FOR REPAIR COURIER */}
                        {selectedDelivery === DeliveryType.REPAIR_COURIER && (
                            <div className={`rounded-2xl p-4 flex gap-3 animate-in fade-in slide-in-from-top-2 ${isTemperKing ? 'bg-[#f2ca50]/5 border border-[#f2ca50]/15' : 'bg-orange-50 border border-orange-100'}`}>
                                <Truck size={24} className={`${isTemperKing ? 'text-[#f2ca50]' : 'text-orange-500'} shrink-0 mt-1`}/>
                                <div>
                                    <h4 className={`text-xs font-bold uppercase ${isTemperKing ? 'text-white' : 'text-orange-900'}`}>Book Repair (Pay Later)</h4>
                                    <ul className={`text-[11px] mt-2 space-y-1 list-disc pl-3 font-medium ${isTemperKing ? 'text-slate-400' : 'text-orange-850'}`}>
                                        <li>Book without paying now.</li>
                                        <li>Courier your phone to the shop.</li>
                                        <li>Admin checks device & updates price.</li>
                                        <li>You pay securely through app afterwards.</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                        {selectedDelivery === DeliveryType.SHOP_VISIT && (
                            <div className={`rounded-2xl p-4 flex gap-3 animate-in fade-in slide-in-from-top-2 ${isTemperKing ? 'bg-[#f2ca50]/5 border border-[#f2ca50]/15' : 'bg-blue-50 border border-blue-100'}`}>
                                <MapPin size={24} className={`${isTemperKing ? 'text-[#f2ca50]' : 'text-blue-500'} shrink-0 mt-1`}/>
                                <div>
                                    <h4 className={`text-xs font-bold uppercase ${isTemperKing ? 'text-white' : 'text-blue-900'}`}>Direct Shop Visit</h4>
                                    <p className={`text-[11px] mt-1 ${isTemperKing ? 'text-slate-400' : 'text-blue-800'}`}>
                                        Book now to reserve this item. Visit our shop at <b>{seller.address ? seller.address.split(',')[0] : 'Location'}</b> to get it fixed instantly.
                                    </p>
                                </div>
                            </div>
                        )}
                      </div>
                  )}

                  {/* PRICE DISPLAY */}
                  <div className={`text-white rounded-[32px] p-8 shadow-2xl relative overflow-hidden mb-8 ${isTemperKing ? 'bg-gradient-to-br from-[#1d1d1d] via-[#121212] to-[#0a0a0a] border border-[#f2ca50]/15' : 'bg-slate-900'}`}>
                      <div className="absolute top-0 right-0 p-4 opacity-10"><Zap size={100}/></div>
                      <div className="relative z-10">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] mb-2">
                              {isBuyerVerifiedTech ? "Technician Wholesale Price" : "Total Product Price"}
                          </p>
                          <div className="flex items-baseline gap-3">
                              <h2 className="text-5xl font-black">₹{totalAmount.toLocaleString()}</h2>
                              {isBuyerVerifiedTech && technicianSparePrice < retailSparePrice && (
                                  <span className="text-lg font-bold text-slate-400 line-through decoration-red-500/50">₹{(retailSparePrice * selectedQty).toLocaleString()}</span>
                              )}
                          </div>
                          
                          {/* INCLUDED FIXING BADGE - Only show to non-techs if fixing is included */}
                          {!isBuyerVerifiedTech && hasFixingIncluded && (
                              <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border shadow-lg ${isTemperKing ? 'bg-[#f2ca50]/10 border-[#f2ca50]/20 text-[#f2ca50]' : 'bg-green-500 border-green-400 text-white shadow-green-900/50'}`}>
                                  <ShieldCheck size={18} className={isTemperKing ? 'fill-transparent' : 'text-white fill-green-700'}/>
                                  <p className="text-xs font-black uppercase tracking-wider">
                                      Free Fixing + 3 Month Warranty Included
                                  </p>
                              </div>
                          )}
                          
                          {/* TRUSTSPARES ASSURANCE BANNER */}
                          <div className={`mt-6 pt-6 border-t flex items-center gap-3 ${isTemperKing ? 'border-white/5' : 'border-slate-800'}`}>
                              <div className={`p-2 rounded-full shadow-lg ${isTemperKing ? 'bg-[#f2ca50]/10 text-[#f2ca50]' : 'bg-blue-600 text-white shadow-blue-500/30'}`}>
                                  <BadgeCheck size={20} className={isTemperKing ? 'fill-transparent' : 'fill-white text-blue-600'}/>
                              </div>
                              <div>
                                  <p className="text-sm font-black text-white leading-none">{isTemperKing ? '👑 Temper King ASSURED' : 'TrustSpares ASSURED'}</p>
                                  <p className="text-[10px] text-slate-400 font-bold mt-1">Quality Checked & Verified by Platform</p>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* TABS */}
              <div className={`flex border-b ${isTemperKing ? 'border-white/5' : 'border-gray-100'}`}>
                  <button onClick={() => setActiveTab('DETAILS')} className={`flex-1 py-4 text-sm font-black uppercase tracking-widest relative transition-colors ${activeTab === 'DETAILS' ? (isTemperKing ? 'text-[#f2ca50]' : 'text-blue-600') : 'text-gray-400 hover:text-gray-200'}`}>
                      Specifications
                      {activeTab === 'DETAILS' && <div className={`absolute bottom-0 left-0 w-full h-1 ${isTemperKing ? 'bg-[#f2ca50]' : 'bg-blue-600'} rounded-full`} />}
                  </button>
                  <button onClick={() => setActiveTab('REVIEWS')} className={`flex-1 py-4 text-sm font-black uppercase tracking-widest relative transition-colors ${activeTab === 'REVIEWS' ? (isTemperKing ? 'text-[#f2ca50]' : 'text-blue-600') : 'text-gray-400 hover:text-gray-200'}`}>
                      User Reviews ({productReviews.length})
                      {activeTab === 'REVIEWS' && <div className={`absolute bottom-0 left-0 w-full h-1 ${isTemperKing ? 'bg-[#f2ca50]' : 'bg-blue-600'} rounded-full`} />}
                  </button>
              </div>

              <div className="py-4">
                  {activeTab === 'DETAILS' ? (
                      <div className="space-y-8 animate-in fade-in duration-300">
                          {/* Shop Visit Info - SHOWN TO ALL BUYERS who select Visit Shop OR Repair Courier */}
                          {((isBooked || isDone ? deal.deliveryType : selectedDelivery) === DeliveryType.SHOP_VISIT || 
                            (isBooked || isDone ? deal.deliveryType : selectedDelivery) === DeliveryType.REPAIR_COURIER) && (
                              <div className="bg-blue-50 p-4 md:p-6 rounded-3xl border border-blue-100 flex flex-col md:flex-row gap-4 md:gap-6">
                                  <div className="hidden md:flex w-14 h-14 bg-white rounded-2xl shadow-sm items-center justify-center text-blue-600 border border-blue-100 shrink-0">
                                      <MapPin size={28}/>
                                  </div>
                                  <div className="flex-1">
                                      <div className="flex justify-between items-start mb-2">
                                          <div className="flex items-center gap-2">
                                              <MapPin size={18} className="text-blue-600 md:hidden"/>
                                              <h4 className="text-sm md:text-base font-black text-slate-900">
                                                  {(isBooked || isDone ? deal.deliveryType : selectedDelivery) === DeliveryType.REPAIR_COURIER ? 'Ship Phone To:' : 'Visit Shop Address'}
                                              </h4>
                                          </div>
                                          {(seller.googleMapsLink || (seller.latitude && seller.longitude)) && (
                                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 border ${seller.googleMapsLink ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                                                  {seller.googleMapsLink ? <><Globe size={10}/> Maps Link Verified</> : <><Crosshair size={10}/> GPS Exact</>}
                                              </span>
                                          )}
                                      </div>
                                      
                                      <button 
                                          onClick={openMaps}
                                          className="w-full text-left text-xs md:text-sm text-gray-700 font-bold mb-2 bg-white p-3 md:p-4 rounded-xl border border-blue-200 shadow-sm leading-relaxed hover:bg-blue-50 hover:border-blue-300 transition-all active:scale-[0.98] flex justify-between items-center group"
                                      >
                                          <span className="flex-1 pr-3">{seller.address || "Address will be shared after booking."}</span>
                                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                                              <Navigation size={14} />
                                          </div>
                                      </button>

                                      {seller.latitude && seller.longitude && (
                                          <div onClick={openMaps} className="cursor-pointer hover:opacity-90 transition-opacity">
                                              <ShopMapPreview 
                                                  latitude={seller.latitude} 
                                                  longitude={seller.longitude} 
                                                  shopName={seller.shopName || seller.name} 
                                              />
                                          </div>
                                      )}
                                      
                                      {seller.address && seller.address !== "Location shared after booking" && (
                                          <button 
                                              onClick={openMaps} 
                                              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md text-xs md:text-sm"
                                          >
                                              <Navigation size={16}/> {seller.googleMapsLink ? 'Navigate with Google Maps' : seller.latitude ? 'Navigate with GPS' : 'Open in Google Maps'}
                                          </button>
                                      )}
                                  </div>
                              </div>
                          )}

                          <div className="flex items-center justify-between bg-gray-50 p-6 rounded-3xl border border-gray-100">
                              <div className="flex items-center gap-3">
                                  <ShoppingBag size={20} className="text-slate-400"/>
                                  <span className="text-base font-bold text-slate-700">Stock Quantity</span>
                              </div>
                              <div className="flex items-center gap-5">
                                  <button onClick={() => selectedQty > 1 && setSelectedQty(q => q-1)} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl border border-gray-200 text-gray-600 shadow-sm hover:border-blue-300 transition-colors"><Minus size={20}/></button>
                                  <span className="text-2xl font-black w-10 text-center text-slate-900">{selectedQty}</span>
                                  <button onClick={() => selectedQty < (deal.stockQuantity || 1) && setSelectedQty(q => q+1)} className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl border border-gray-200 text-gray-600 shadow-sm hover:border-blue-300 transition-colors"><Plus size={20}/></button>
                              </div>
                          </div>

                          {/* STORE PLACEMENT INFO (கடை பிரிவு) */}
                          <div className={`${isTemperKing ? 'bg-white/5 border border-white/5' : 'bg-gray-50 border border-gray-100'} p-6 rounded-3xl flex items-center justify-between shadow-inner`}>
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-lg shadow-sm">
                                      {deal.location === 'Temper King Store' ? '👑' : '🔧'}
                                  </div>
                                  <div>
                                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Physical Store / Shop Branch</span>
                                      <span className="text-sm font-black text-slate-800 block mt-0.5">
                                          {deal.location === 'Temper King Store' ? 'Temper King Store (Glass Shop)' : 'TrustSpares Central (Main Shop)'}
                                      </span>
                                  </div>
                              </div>
                              <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-lg ${
                                  deal.location === 'Temper King Store' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}>
                                  {deal.location === 'Temper King Store' ? 'Glass Division' : 'Spares Division'}
                              </span>
                          </div>

                          <div className="space-y-4">
                              <h3 className="font-black text-slate-900 uppercase text-xs tracking-[2px]">Description</h3>
                              <div className="text-base text-gray-600 leading-relaxed bg-gray-50 p-6 rounded-3xl border border-gray-50 font-medium whitespace-pre-wrap">
                                  {deal.description}
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="space-y-5 animate-in fade-in duration-300">
                          <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex items-center gap-4">
                              <div className="p-2.5 bg-white rounded-xl text-blue-600 shadow-sm">
                                  <Users size={24}/>
                              </div>
                              <p className="text-sm font-bold text-blue-800">Reviews from trusted buyers & technicians.</p>
                          </div>

                          {productReviews.length === 0 ? (
                              <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center text-gray-400 text-sm font-bold uppercase tracking-widest">No reviews for this product yet.</div>
                          ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {productReviews.map(r => (
                                      <div key={r.id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                          <div className="flex justify-between items-start mb-4">
                                              <div className="flex items-center gap-3">
                                                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-sm uppercase">
                                                      {r.userName.charAt(0)}
                                                  </div>
                                                  <div>
                                                      <div className="flex items-center gap-1.5">
                                                          <p className="text-sm font-black text-slate-900">{r.userName}</p>
                                                          {r.isVerified && <BadgeCheck size={14} className="text-blue-500 fill-blue-50" />}
                                                      </div>
                                                      <p className="text-[10px] text-gray-400 font-bold uppercase">{new Date(r.date).toLocaleDateString()}</p>
                                                  </div>
                                              </div>
                                              <div className="flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-lg text-orange-600 font-black text-xs">
                                                  <Star size={12} fill="currentColor" /> {r.rating}
                                              </div>
                                          </div>
                                          <p className="text-sm text-gray-600 leading-relaxed font-medium italic">"{r.comment}"</p>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  )}
              </div>
          </div>
      </div>

      {/* Fixed Bottom Action */}
      {!isBooked && !isDone && deal.status === DealStatus.AVAILABLE && (
          <div className={`fixed bottom-0 left-0 right-0 p-6 backdrop-blur-xl border-t z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] ${isTemperKing ? 'bg-[#131313]/90 border-white/5' : 'bg-white/80 border-slate-100'}`}>
              <div className="max-w-6xl mx-auto flex gap-4">
                  <button 
                    onClick={() => window.open(`https://wa.me/91${seller.mobile || '9876543210'}`)} 
                    className={`p-5 rounded-[20px] transition-all flex items-center justify-center ${
                      isTemperKing 
                        ? 'bg-white/5 border border-white/10 hover:border-[#f2ca50]/55 hover:bg-[#f2ca50]/10 text-[#f2ca50]' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm'
                    }`}
                  >
                      <MessageSquare size={28}/>
                  </button>
                  <button 
                    onClick={handleAction} 
                    disabled={isBooking} 
                    className={`flex-1 font-black py-5 rounded-[24px] flex items-center justify-center gap-3 transition-all active:scale-95 text-xl ${
                      isTemperKing 
                        ? 'bg-[#f2ca50] hover:bg-[#ebd074] text-[#3c2f00] shadow-lg shadow-[#f2ca50]/10' 
                        : 'bg-slate-900 text-white hover:bg-slate-800 shadow-2xl shadow-slate-200'
                    }`}
                  >
                      {isBooking ? 'Processing...' : (
                          currentUser ? (
                              selectedDelivery === DeliveryType.SHOP_VISIT ? 'Confirm Booking' : 
                              selectedDelivery === DeliveryType.REPAIR_COURIER ? 'Book Repair (Pay Later)' :
                              'Proceed to Checkout'
                          ) : 'Login to Continue'
                      )} <ArrowRight size={24}/>
                  </button>
              </div>
          </div>
      )}

      {/* Cancel Order Action for My Orders */}
      {isMyOrder && !isDone && deal.status !== DealStatus.SHIPPED && deal.status !== DealStatus.CANCELLED && (
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
              <div className="max-w-6xl mx-auto">
                  <button 
                    onClick={() => setCancelDealId(deal.id)}
                    className="w-full bg-red-50 text-red-600 font-black py-5 rounded-[24px] border border-red-100 flex items-center justify-center gap-3 transition-all active:scale-95 hover:bg-red-100 text-xl"
                  >
                      Cancel Order
                  </button>
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
                                  navigate('/orders');
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
    </div>
  );
};

export default DealDetails;
