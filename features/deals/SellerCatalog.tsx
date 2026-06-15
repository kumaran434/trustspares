
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import DealCard from './DealCard';
import { ArrowLeft, ShieldCheck, Star, MapPin, Store, Share2, MessageSquare, PackageCheck, Zap, Search, X, BadgeCheck, Lock, Wrench } from 'lucide-react';
import { DealStatus } from '../../types';
import { CATALOG_TEXT } from './dealsConstants';
import SEO from '../../components/SEO';

const SellerCatalog: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { users, deals, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'REVIEWS'>('INVENTORY');
  const [searchQuery, setSearchQuery] = useState('');

  const seller = users.find(u => u.id === userId);
  const isOfficialStore = seller?.role === 'ADMIN';
  const isTechnician = seller?.kycVerified || seller?.isAdmin;

  const viewerIndustry = currentUser?.industry || 'MOBILE';

  const sellerItems = useMemo(() => {
      return deals.filter(d => {
          const itemIndustry = d.industry || 'MOBILE';
          return d.sellerId === userId && 
                 d.status === DealStatus.AVAILABLE &&
                 itemIndustry === viewerIndustry;
      });
  }, [deals, userId, viewerIndustry]);

  const soldItemsCount = deals.filter(d => d.sellerId === userId && d.status === DealStatus.COMPLETED).length;

  const filteredItems = useMemo(() => {
      if (!searchQuery.trim()) return sellerItems;
      const q = searchQuery.toLowerCase();
      return sellerItems.filter(item => 
          item.title.toLowerCase().includes(q) || 
          item.category?.toLowerCase().includes(q) ||
          item.tags?.some(t => t.toLowerCase().includes(q))
      );
  }, [sellerItems, searchQuery]);

  const reviews = useMemo(() => {
      return deals
        .filter(d => d.sellerId === userId && d.rating && d.rating > 0)
        .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [deals, userId]);

  const ratingStats = useMemo(() => {
      const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      reviews.forEach(r => {
          if (r.rating && r.rating >= 1 && r.rating <= 5) {
              const rRounded = Math.round(r.rating) as 1|2|3|4|5;
              counts[rRounded] = (counts[rRounded] || 0) + 1;
          }
      });
      return counts;
  }, [reviews]);

  if (!seller) return <div className="p-10 text-center">Seller not found</div>;

  const handleShareShop = async () => {
      const url = `https://trustspares.in/#/seller/${seller.id}`;
      const location = seller.address ? seller.address.split(',')[0] : 'India';
      const text = `🏢 *${seller.shopName?.toUpperCase() || seller.name.toUpperCase()}*\n⚡ _Powered by TrustSpares_\n\n✅ *Verified Technician*\n⭐ Trust Score: ${seller.trustScore}/5.0\n📍 Location: ${location}\n\n👇 *View Stock:* ${url}`;

      if (navigator.share) {
          try { await navigator.share({ title: seller.shopName || 'Shop', text, url }); return; } catch (error) {}
      } 
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <SEO title={`${seller.shopName || "Seller"} - Shop Catalog`} description={`Buy spares from ${seller.shopName}. Rated ${seller.trustScore}/5.`} />
      
      <div className="bg-white sticky top-0 z-50 shadow-md border-b border-gray-100">
          <div className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                  <button onClick={() => navigate('/')} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
                      <ArrowLeft size={22} />
                  </button>
                  <div>
                      <h1 className="text-lg font-black text-gray-900 leading-tight line-clamp-1 flex items-center gap-1">
                          {seller.shopName?.toUpperCase() || seller.name.toUpperCase()}
                          {isTechnician && <BadgeCheck size={16} className="text-blue-600 fill-blue-50" />}
                      </h1>
                      <div className="flex items-center gap-1 mt-0.5">
                          <Zap size={10} className="text-orange-500 fill-orange-500"/>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Powered by TrustSpares</p>
                      </div>
                  </div>
              </div>
              <button onClick={handleShareShop} className="p-2 bg-gray-100 rounded-full text-gray-700">
                  <Share2 size={20} />
              </button>
          </div>
          <div className="px-4 pb-3">
              <div className="relative">
                  <Search size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input type="text" placeholder={`Search in ${seller.shopName || 'this shop'}...`} className="w-full bg-gray-100 border-none rounded-xl pl-10 pr-10 py-2.5 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
          </div>
      </div>

      <div className="p-4 md:max-w-5xl md:mx-auto">
        <div className={`rounded-3xl p-5 shadow-sm border border-gray-200 mb-6 relative overflow-hidden ${isOfficialStore ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-white'}`}>
            <div className="absolute top-0 right-0 p-6 opacity-5">
                <Wrench size={100} />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-blue-50 rounded-full border-4 border-white shadow-sm overflow-hidden flex-shrink-0">
                        <img src={seller.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${seller.id}`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            {isOfficialStore ? (
                                <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                    <BadgeCheck size={10}/> Official Store
                                </span>
                            ) : seller.kycVerified && (
                                <span className="bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                                    <ShieldCheck size={10}/> VERIFIED TECHNICIAN
                                </span>
                            )}
                            <div className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-0.5 rounded border border-orange-100 font-bold text-[10px]">
                                <Star size={10} fill="currentColor" /> {seller.trustScore || 'New'}
                            </div>
                        </div>
                        <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                            <MapPin size={12} /> {seller.address ? seller.address.split(',')[0] : 'India'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => window.open(`https://wa.me/91${seller.mobile}`)} className="flex-1 bg-[#25D366] text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm">
                        Chat with Tech
                    </button>
                    <div className="bg-gray-100 rounded-xl px-4 py-2 text-center flex-1">
                        <p className="text-xs font-bold text-gray-900">{sellerItems.length}</p>
                        <p className="text-[9px] text-gray-500 font-bold uppercase">Stock</p>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2 text-center flex-1">
                        <p className="text-xs font-bold text-green-700">{soldItemsCount}</p>
                        <p className="text-[9px] text-green-600 font-bold uppercase">Solved</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="flex gap-4 border-b border-gray-200 mb-6 px-2">
            <button onClick={() => setActiveTab('INVENTORY')} className={`pb-3 text-sm font-bold flex items-center gap-2 transition relative ${activeTab === 'INVENTORY' ? 'text-blue-600' : 'text-gray-500'}`}>
                <Store size={18} /> Inventory
                {activeTab === 'INVENTORY' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
            </button>
            <button onClick={() => setActiveTab('REVIEWS')} className={`pb-3 text-sm font-bold flex items-center gap-2 transition relative ${activeTab === 'REVIEWS' ? 'text-blue-600' : 'text-gray-500'}`}>
                <MessageSquare size={18} /> Reviews ({reviews.length})
                {activeTab === 'REVIEWS' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
            </button>
        </div>

        {activeTab === 'INVENTORY' && (
            filteredItems.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200 animate-in fade-in">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Store size={32} className="text-gray-300" />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">No {viewerIndustry.toLowerCase()} items available.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in">
                    {filteredItems.map(deal => (
                        <DealCard key={deal.id} deal={deal} currentUserId={currentUser?.id || ''} sellerName={seller.shopName || seller.name} sellerVerified={seller.kycVerified} isOfficialStore={isOfficialStore} />
                    ))}
                </div>
            )
        )}

        {activeTab === 'REVIEWS' && (
            <div className="space-y-3">
                {reviews.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                        <p className="text-gray-400 text-sm">No reviews yet.</p>
                    </div>
                ) : (
                    reviews.map(reviewDeal => (
                        <div key={reviewDeal.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <p className="text-sm font-bold text-gray-900">Verified Buyer</p>
                                <div className="flex items-center gap-0.5 bg-orange-50 px-2 py-1 rounded-lg">
                                    <Star size={12} className="text-orange-500 fill-orange-500" />
                                    <span className="text-xs font-black text-orange-600">{reviewDeal.rating}</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-700 font-medium italic">"{reviewDeal.review || 'Excellent service.'}"</p>
                        </div>
                    ))
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default SellerCatalog;
