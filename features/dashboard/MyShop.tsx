
import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import DealCard from '../deals/DealCard';
import { Plus, Pencil, Trash2, KeyRound, X, CheckCircle2, ShoppingBag, PenLine, ImagePlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO';
import { DealStatus } from '../../types';

const MyShop: React.FC = () => {
  const { currentUser, deals, deleteDeal, verifyPickup } = useApp();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'DRAFT' | 'ACTIVE' | 'PENDING' | 'SOLD'>('ACTIVE');
  
  // OTP Verification Modal State
  const [verifyingDeal, setVerifyingDeal] = useState<string | null>(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Delete All Drafts Modal State
  const [showDeleteAllDraftsModal, setShowDeleteAllDraftsModal] = useState(false);
  const [isDeletingAllDrafts, setIsDeletingAllDrafts] = useState(false);

  if (!currentUser?.isAdmin) {
      return (
          <div className="p-10 text-center">
              <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
              <p className="text-gray-500">Only Admin can sell products.</p>
              <button onClick={() => navigate('/')} className="mt-4 text-blue-600 font-bold underline">Go Home</button>
          </div>
      );
  }

  // Admin sees ALL deals (Single Seller Platform)
  const myDeals = deals;
  
  const displayedDeals = filter === 'ACTIVE' 
      ? myDeals.filter(d => d.status === DealStatus.AVAILABLE)
      : filter === 'PENDING'
      ? myDeals.filter(d => d.status === DealStatus.APPOINTMENT_BOOKED || d.status === DealStatus.PAID)
      : filter === 'DRAFT'
      ? myDeals.filter(d => d.status === DealStatus.DRAFT)
      : myDeals.filter(d => d.status === DealStatus.COMPLETED);

  const handleVerifyOtp = async () => {
      if (!verifyingDeal) return;
      setIsVerifying(true);
      setOtpError(false);
      
      const success = await verifyPickup(verifyingDeal, otpInput);
      if (success) {
          setVerifyingDeal(null);
          setOtpInput('');
          alert("Delivery Verified Successfully!");
      } else {
          setOtpError(true);
      }
      setIsVerifying(false);
  };

  const handleDeleteAllDrafts = async () => {
      setIsDeletingAllDrafts(true);
      try {
          const draftIds = displayedDeals.map(d => d.id);
          for (const id of draftIds) {
              await deleteDeal(id);
          }
          setShowDeleteAllDraftsModal(false);
      } catch (error) {
          console.error("Failed to delete all drafts", error);
      } finally {
          setIsDeletingAllDrafts(false);
      }
  };

  return (
    <div className="pb-24">
      <SEO title="Admin Stock" description="Manage your inventory." />

      {/* Delete All Drafts Modal */}
      {showDeleteAllDraftsModal && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                      <Trash2 className="text-red-600" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete All Drafts?</h3>
                  <p className="text-sm text-center text-gray-500 mb-6">
                      Are you sure you want to permanently delete ALL {displayedDeals.length} drafts? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                      <button 
                          onClick={() => setShowDeleteAllDraftsModal(false)}
                          disabled={isDeletingAllDrafts}
                          className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleDeleteAllDrafts}
                          disabled={isDeletingAllDrafts}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                          {isDeletingAllDrafts ? 'Deleting...' : <><Trash2 size={16} /> Delete All</>}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* OTP Verification Modal */}
      {verifyingDeal && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in-95">
                   <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-slate-900">Verify Pickup</h3>
                        <button onClick={() => setVerifyingDeal(null)} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
                   </div>
                   <p className="text-sm text-gray-500 mb-6">Ask the customer for the 4-digit Pickup Code shown in their order page.</p>
                   
                   <div className="space-y-4">
                        <input 
                            type="text" 
                            maxLength={4}
                            placeholder="0 0 0 0"
                            className={`w-full text-center text-4xl font-black tracking-[15px] p-5 rounded-2xl border-2 outline-none transition-all ${otpError ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-blue-500 bg-gray-50'}`}
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        />
                        {otpError && <p className="text-xs text-red-600 font-bold text-center">Invalid OTP Code. Please try again.</p>}
                        
                        <button 
                            onClick={handleVerifyOtp}
                            disabled={otpInput.length < 4 || isVerifying}
                            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            {isVerifying ? 'Verifying...' : <><CheckCircle2 size={20}/> Complete Delivery</>}
                        </button>
                   </div>
              </div>
          </div>
      )}

      <div className="p-6 rounded-3xl shadow-sm border border-slate-200 mb-6 bg-white relative overflow-hidden">
          <div className="relative z-10">
              <h1 className="text-3xl font-black text-slate-900 leading-none mb-4">ADMIN STOCK</h1>
              <button onClick={() => navigate('/create')} className="w-full bg-slate-900 hover:bg-slate-850 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition">
                  <Plus size={18} /> Add Product
              </button>
          </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          <button 
            onClick={() => setFilter('DRAFT')}
            className={`px-6 py-3 rounded-2xl border text-xs font-black whitespace-nowrap transition-all ${filter === 'DRAFT' ? 'bg-purple-600 text-white border-purple-600 shadow-lg' : 'bg-white text-gray-500'}`}
          >
              DRAFTS ({myDeals.filter(d => d.status === DealStatus.DRAFT).length})
          </button>
          <button 
            onClick={() => setFilter('ACTIVE')}
            className={`px-6 py-3 rounded-2xl border text-xs font-black whitespace-nowrap transition-all ${filter === 'ACTIVE' ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-gray-500'}`}
          >
              ACTIVE ({myDeals.filter(d => d.status === DealStatus.AVAILABLE).length})
          </button>
          <button 
            onClick={() => setFilter('PENDING')}
            className={`px-6 py-3 rounded-2xl border text-xs font-black whitespace-nowrap transition-all ${filter === 'PENDING' ? 'bg-orange-500 text-white border-orange-500 shadow-lg' : 'bg-white text-gray-500'}`}
          >
              BOOKED ({myDeals.filter(d => d.status === DealStatus.APPOINTMENT_BOOKED || d.status === DealStatus.PAID).length})
          </button>
          <button 
            onClick={() => setFilter('SOLD')}
            className={`px-6 py-3 rounded-2xl border text-xs font-black whitespace-nowrap transition-all ${filter === 'SOLD' ? 'bg-green-600 text-white border-green-600 shadow-lg' : 'bg-white text-gray-500'}`}
          >
              SOLD ({myDeals.filter(d => d.status === DealStatus.COMPLETED).length})
          </button>
      </div>

      {filter === 'DRAFT' && displayedDeals.length > 0 && (
        <div className="mb-4 flex justify-end">
            <button 
                onClick={() => setShowDeleteAllDraftsModal(true)}
                className="bg-red-100 text-red-600 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-sm"
            >
                <Trash2 size={16} /> DELETE ALL DRAFTS
            </button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {displayedDeals.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                  <ShoppingBag size={40} className="mx-auto text-slate-300 mb-3"/>
                  <p className="text-slate-400 font-bold text-sm">No items in this section.</p>
              </div>
          ) : (
              displayedDeals.map(deal => (
                <div key={deal.id} className="relative group">
                    <DealCard deal={deal} currentUserId={currentUser?.id || ''} sellerName="Admin" isOfficialStore={true} />
                    
                    {/* NEW: VISIBLE PRODUCT TITLE BADGE FOR DRAFTS */}
                    {deal.status === DealStatus.DRAFT && (
                        <div className="absolute top-2 left-2 right-2 bg-slate-900/95 backdrop-blur-md text-white px-2 py-3 rounded-xl z-30 text-center border border-white/10 shadow-xl pointer-events-none">
                             <p className="text-[10px] font-black text-yellow-400 uppercase leading-tight line-clamp-2">
                                 {deal.title}
                             </p>
                        </div>
                    )}
                    
                    {/* OTP VERIFY BUTTON FOR PENDING DEALS */}
                    {deal.status === DealStatus.APPOINTMENT_BOOKED && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center z-10 rounded-3xl">
                            <button 
                                onClick={() => setVerifyingDeal(deal.id)}
                                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-xl flex items-center gap-1 active:scale-95"
                            >
                                <KeyRound size={14}/> VERIFY PICKUP
                            </button>
                        </div>
                    )}

                    {/* EDIT DRAFT BUTTON */}
                    {deal.status === DealStatus.DRAFT && (
                        <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-end p-4 pb-4 text-center z-20 rounded-3xl border-2 border-purple-500 border-dashed">
                            <button 
                                onClick={() => navigate(`/edit-deal/${deal.id}`)}
                                className="bg-purple-600 text-white px-4 py-3 rounded-xl text-[10px] font-black shadow-xl flex flex-col items-center gap-1 active:scale-95 hover:bg-purple-700 w-full"
                            >
                                <ImagePlus size={20}/>
                                ADD PHOTO & PRICE
                            </button>
                        </div>
                    )}
                </div>
              ))
          )}
       </div>
    </div>
  );
};

export default MyShop;
