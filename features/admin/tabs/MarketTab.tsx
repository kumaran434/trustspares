
import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { ShoppingBag, Trash2, AlertTriangle, Loader2, X } from 'lucide-react';
import { DealStatus } from '../../../types';

const MarketTab: React.FC = () => {
    const { deals, users, deleteDeal } = useApp();
    // Track processing state for specific deal IDs
    const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
    
    // State for custom confirmation modal
    const [dealToDelete, setDealToDelete] = useState<string | null>(null);

    const confirmDelete = (dealId: string) => {
        setDealToDelete(dealId);
    };

    const cancelDelete = () => {
        setDealToDelete(null);
    };

    const handleDeleteDeal = async () => {
        if (!dealToDelete) return;
        
        const dealId = dealToDelete;
        setDealToDelete(null); // Close modal immediately
        
        // Add to processing set
        setProcessingIds(prev => new Set(prev).add(dealId));

        try {
            await deleteDeal(dealId);
            // Success - item will automatically vanish due to realtime listener
        } catch (e: any) {
            console.error("Delete failed:", e);
            // Show exact permission error from Firebase
            alert(`DELETE FAILED: ${e.message}\n\nCheck if your User Role is 'ADMIN' in Firestore Database.`);
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(dealId);
                return newSet;
            });
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex gap-3">
                <AlertTriangle className="text-red-600" size={24} />
                <div>
                    <h4 className="font-bold text-red-900 text-sm">Marketplace Control</h4>
                    <p className="text-xs text-red-700">Admins can remove any listing immediately.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deals.map(deal => {
                    const seller = users.find(u => u.id === deal.sellerId);
                    const image = deal.listingImages && deal.listingImages.length > 0 ? deal.listingImages[0] : deal.listingImage;
                    const isDeleting = processingIds.has(deal.id);

                    return (
                        <div key={deal.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm relative group hover:shadow-md transition-all">
                            <div className="flex gap-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                                    {image ? (
                                        <img src={image} className="w-full h-full object-cover" />
                                    ) : (
                                        <ShoppingBag className="w-full h-full p-4 text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate text-sm">{deal.title}</h4>
                                    <p className="text-xs text-gray-500 font-bold mt-1">₹{deal.amount}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5 truncate">Seller: {seller?.shopName || seller?.name || 'Unknown'}</p>
                                    <div className="mt-2 flex items-center gap-1">
                                         <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${deal.status === DealStatus.AVAILABLE ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                             {deal.status}
                                         </span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 border-t border-gray-100 pt-3 flex justify-end">
                                <button 
                                    onClick={() => confirmDelete(deal.id)} 
                                    disabled={isDeleting}
                                    className="bg-red-50 border border-red-100 text-red-600 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" /> Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={14} /> Delete Now
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Custom Confirmation Modal */}
            {dealToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                            <AlertTriangle className="text-red-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete Product?</h3>
                        <p className="text-sm text-center text-gray-500 mb-6">
                            Are you sure you want to permanently delete this product? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={cancelDelete}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteDeal}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketTab;
