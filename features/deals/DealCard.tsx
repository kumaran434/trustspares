
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Deal, DealStatus } from '../../types';
import { ShoppingBag, Share2, ShieldCheck, Star, Wrench, Pencil, Trash2, Zap, BadgeCheck, AlertTriangle } from 'lucide-react';
import { getImageUrl } from '../../services/imageService';
import { useApp } from '../../contexts/AppContext';
import { handleShareProduct } from './dealsConstants';

interface DealCardProps {
  deal: Deal;
  currentUserId: string; 
  sellerName?: string; // Kept for interface compat but unused
  sellerVerified?: boolean;
  sellerTrustScore?: number;
  isOfficialStore?: boolean;
  forceAccess?: boolean; 
  minimal?: boolean; 
}

const DealCard: React.FC<DealCardProps> = ({ deal, currentUserId, minimal }) => {
  const navigate = useNavigate();
  const { currentUser, deleteDeal } = useApp(); 
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const isAvailable = deal.status === DealStatus.AVAILABLE;
  const isVerifiedUser = currentUser?.kycVerified === true;
  const isAdmin = currentUser?.isAdmin === true;
  
  // --- PRICE LOGIC ---
  const retailPrice = deal.amount;
  const technicianPrice = deal.dealerPrice || retailPrice;
  
  // Display strictly the Admin set price.
  const displayPrice = isVerifiedUser ? technicianPrice : retailPrice;
  
  // Check if fixing is enabled by admin
  const showFixingTag = !isVerifiedUser && deal.industry === 'MOBILE' && (deal.fixingCharge || 0) > 0;

  const displayImage = deal.listingImages && deal.listingImages.length > 0 ? deal.listingImages[0] : deal.listingImage;

  // --- QUALITY BADGE LOGIC ---
  const renderQualityBadge = () => {
      if (!deal.quality) return null;
      
      let bg = 'bg-gray-100 text-gray-600';
      let text = 'STANDARD';
      
      if (deal.quality === 'ORIGINAL') {
          bg = 'bg-yellow-100 text-yellow-800 border border-yellow-200';
          text = 'ORIGINAL 100%';
      } else if (deal.quality === 'OLED') {
          bg = 'bg-blue-100 text-blue-800 border border-blue-200';
          text = 'OLED / OG';
      } else if (deal.quality === 'COPY') {
          bg = 'bg-gray-100 text-gray-500 border border-gray-200';
          text = 'FIRST COPY';
      }

      return (
          <span className={`absolute bottom-2 right-2 text-[8px] font-black px-2 py-1 rounded-md shadow-sm ${bg}`}>
              {text}
          </span>
      );
  };

  const onShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleShareProduct(deal, "TrustSpares Official");
  };

  const onEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-deal/${deal.id}`);
  };

  const onDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const confirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      await deleteDeal(deal.id);
      setShowDeleteModal(false);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(false);
  };

  return (
    <>
      <div 
          onClick={() => navigate(`/deal/${deal.id}`)}
          className="group bg-white rounded-3xl overflow-hidden relative shadow-sm border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-500 cursor-pointer h-full flex flex-col"
      >
          {/* Image Area */}
          <div className="relative aspect-square bg-white flex items-center justify-center p-3">
              {displayImage ? (
                  <img src={getImageUrl(displayImage)} alt={deal.title} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105" />
              ) : (
                  <div className="text-gray-100"><ShoppingBag size={40} /></div>
              )}

              {/* BRAND / STORE LOCATION BADGE */}
              <div className="absolute bottom-2 left-2 z-10">
                  {deal.location === 'Temper King Store' ? (
                      <span className="bg-gradient-to-r from-neutral-900 to-neutral-800 text-amber-400 text-[8.5px] font-black px-2 py-1 rounded-md shadow-md shadow-amber-950/40 flex items-center gap-1 border border-amber-500/30">
                          👑 TEMPER KING
                      </span>
                  ) : (
                      <span className="bg-blue-600 text-white text-[8px] font-black px-1.5 py-1 rounded-md shadow-md shadow-blue-200 flex items-center gap-1 border border-blue-500">
                          <BadgeCheck size={10} className="fill-white text-blue-600" /> TrustSpares
                      </span>
                  )}
              </div>

              {/* Tags Overlay */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {showFixingTag && (
                      <span className="bg-green-600 text-white text-[8px] font-black px-2 py-1 rounded-lg flex items-center gap-1 shadow-md shadow-green-100">
                          <ShieldCheck size={8} className="text-white" /> 3 MONTH WARRANTY
                      </span>
                  )}
              </div>
              
              {/* QUALITY BADGE */}
              {renderQualityBadge()}

              {/* Admin Management Buttons */}
              {isAdmin && (
                  <div className="absolute top-2 right-10 flex gap-1">
                      <button 
                        onClick={onEdit}
                        className="p-2 bg-white/90 backdrop-blur-md rounded-full text-blue-600 shadow-sm border border-blue-50 hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                      >
                          <Pencil size={12} />
                      </button>
                      <button 
                        onClick={onDeleteClick}
                        className="p-2 bg-white/90 backdrop-blur-md rounded-full text-red-600 shadow-sm border border-red-50 hover:bg-red-600 hover:text-white transition-all active:scale-90"
                      >
                          <Trash2 size={12} />
                      </button>
                  </div>
              )}

              {/* Share Button Overlay */}
              <div className="absolute top-2 right-2">
                  <button 
                    onClick={onShare}
                    className="p-2 bg-white/80 backdrop-blur-md rounded-full text-slate-600 shadow-sm border border-slate-100 hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                  >
                      <Share2 size={14} />
                  </button>
              </div>
              
              {!isAvailable && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-20">
                      <span className="bg-slate-900 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase">Sold Out</span>
                  </div>
              )}
          </div>

          {/* Info Area */}
          <div className="p-4 pt-0 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{deal.industry}</span>
                  <div className="flex items-center gap-0.5">
                      <Star size={10} className="text-orange-400 fill-orange-400" />
                      <span className="text-[10px] font-bold text-slate-500">5.0</span>
                  </div>
              </div>

              <h3 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2 min-h-[2.4em] mb-2">
                  {deal.title}
              </h3>

              <div className="mt-auto">
                  <div className="flex items-baseline gap-1">
                      <span className="text-xs font-bold text-slate-400">₹</span>
                      <span className="text-lg font-black text-slate-900">
                          {displayPrice.toLocaleString()}
                      </span>
                      {isVerifiedUser && technicianPrice < retailPrice && (
                          <span className="text-[10px] text-gray-400 line-through font-bold">₹{retailPrice}</span>
                      )}
                  </div>
                  
                  {showFixingTag && (
                      <p className="text-[9px] text-green-700 font-bold mt-1 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md border border-green-100 w-fit">
                          <Wrench size={10}/> Free Fixing + 3 Month Warranty
                      </p>
                  )}
              </div>
          </div>
      </div>

      {/* Custom Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={cancelDelete}>
            <div 
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200"
              onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                    <AlertTriangle className="text-red-600" size={24} />
                </div>
                <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete Product?</h3>
                <p className="text-sm text-center text-gray-500 mb-6">
                    Are you sure you want to permanently delete "{deal.title}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button 
                        onClick={cancelDelete}
                        disabled={isDeleting}
                        className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={confirmDelete}
                        disabled={isDeleting}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isDeleting ? "Deleting..." : <><Trash2 size={16} /> Delete</>}
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default DealCard;
