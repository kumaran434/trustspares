
import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { CheckCircle2, Loader2, MessageCircle, XCircle, Share2, X, Eye, ImageIcon } from 'lucide-react';
import { User } from '../../../types';

interface KycTabProps {
    setSelectedUser: (user: User | null) => void;
    setPreviewImage: (url: string | null) => void;
}

const KycTab: React.FC<KycTabProps> = ({ setSelectedUser, setPreviewImage }) => {
    const { users, verifySeller, currentUser } = useApp();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectingId, setRejectingId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    
    // State for Success Modal (To handle mobile WhatsApp redirection)
    const [successData, setSuccessData] = useState<{ name: string, mobile: string, message: string } | null>(null);

    const pendingKYC = users.filter(u => u.kycStatus === 'PENDING');

    const handleVerifySeller = async (userId: string, status: 'VERIFIED' | 'REJECTED') => {
        if (!currentUser?.isAdmin) {
            alert("Permission Denied.");
            return;
        }

        // If Rejecting, validate reason
        if (status === 'REJECTED' && !rejectReason.trim()) {
            alert("Please enter a reason for rejection.");
            return;
        }

        const targetUser = users.find(u => u.id === userId);

        setProcessingId(userId); 
        try {
            await verifySeller(userId, status, rejectReason);
            
            if (status === 'VERIFIED' && targetUser && targetUser.mobile) {
                const msg = `✅ *Technician Approved!*\n\nHello ${targetUser.name},\nCongratulations! Your shop *"${targetUser.shopName || 'Shop'}"* is now Verified on TrustSpares.\n\n🚀 *Wholesale Prices Unlocked.*\nYou can now buy spares at dealer rates.\n\n👇 *Start Ordering:*\nhttps://trustspares.in`;
                setSuccessData({
                    name: targetUser.name,
                    mobile: targetUser.mobile,
                    message: msg
                });
            }

            setSelectedUser(null);
            setRejectingId(null);
            setRejectReason('');
        } catch (error: any) {
            alert(`Action Failed: ${error.message}`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleSendWhatsApp = () => {
        if (!successData) return;
        const url = `https://wa.me/91${successData.mobile}?text=${encodeURIComponent(successData.message)}`;
        window.open(url, '_blank');
        setSuccessData(null); 
    };

    return (
        <div className="space-y-4 relative">
            
            {successData && (
                <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center relative">
                        <button 
                            onClick={() => setSuccessData(null)} 
                            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                        >
                            <X size={20} />
                        </button>

                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                            <CheckCircle2 size={40} className="text-green-600" />
                        </div>
                        
                        <h3 className="text-xl font-black text-gray-900 mb-1">Technician Approved!</h3>
                        <p className="text-sm text-gray-500 mb-6">{successData.name} can now access wholesale rates.</p>

                        <button 
                            onClick={handleSendWhatsApp}
                            className="w-full bg-[#25D366] hover:brightness-105 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-95 text-lg"
                        >
                            <MessageCircle size={24} /> Notify on WhatsApp
                        </button>
                    </div>
                </div>
            )}

            {pendingKYC.length === 0 ? (
                <div className="text-center p-10 bg-gray-50 rounded-xl border border-gray-100">
                    <CheckCircle2 size={40} className="mx-auto text-green-500 mb-2"/>
                    <p className="text-gray-500 font-bold">No Pending Verifications</p>
                </div>
            ) : (
                pendingKYC.map(user => (
                    <div key={user.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-5">
                        <div className="flex flex-col md:flex-row gap-5">
                            {/* SHOP IMAGE PREVIEW - LARGER & RECTANGULAR */}
                            <div 
                                onClick={() => user.shopImage && setPreviewImage(user.shopImage)}
                                className="w-full md:w-48 h-32 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative group cursor-zoom-in"
                            >
                                {user.shopImage ? (
                                    <>
                                        <img src={user.shopImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Shop Proof"/>
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Eye className="text-white" size={24}/>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <ImageIcon size={32}/>
                                        <p className="text-[10px] font-bold mt-1">NO PHOTO</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-black text-xl text-gray-900">{user.shopName || 'Shop Name Pending'}</h4>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-gray-700 flex items-center gap-2"><UserIcon size={14}/> {user.name}</p>
                                    <p className="text-sm font-bold text-gray-500 flex items-center gap-2 font-mono"><MessageCircle size={14} className="text-green-500"/> {user.mobile}</p>
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                     <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full border border-orange-200">
                                        VERIFICATION PENDING
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-50">
                            <button 
                                onClick={() => setSelectedUser(user)} 
                                className="flex-1 bg-gray-100 text-gray-700 font-bold py-3 rounded-xl text-sm hover:bg-gray-200 transition active:scale-95"
                            >
                                View All Details
                            </button>
                            
                            {rejectingId === user.id ? (
                                <button onClick={() => {setRejectingId(null); setRejectReason('');}} className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl text-sm">
                                    Cancel
                                </button>
                            ) : (
                                <>
                                    <button 
                                        disabled={processingId === user.id} 
                                        onClick={() => handleVerifySeller(user.id, 'VERIFIED')} 
                                        className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2 transition active:scale-95"
                                    >
                                        {processingId === user.id ? <Loader2 className="animate-spin" size={18}/> : <><CheckCircle2 size={18}/> Approve Shop</>}
                                    </button>
                                    <button 
                                        disabled={processingId === user.id} 
                                        onClick={() => setRejectingId(user.id)} 
                                        className="flex-1 bg-red-50 text-red-600 font-bold py-3 rounded-xl text-sm hover:bg-red-100 border border-red-100 transition active:scale-95"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                        </div>

                        {rejectingId === user.id && (
                            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 animate-in slide-in-from-top mt-2">
                                <label className="text-xs font-bold text-red-800 mb-2 block uppercase tracking-wider">Reason for Rejection (Required)</label>
                                <textarea 
                                    className="w-full p-3 border border-red-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 mb-3 bg-white font-medium"
                                    placeholder="E.g. Shop board photo is blurry, Name mismatch..."
                                    rows={3}
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                />
                                <button 
                                    onClick={() => handleVerifySeller(user.id, 'REJECTED')}
                                    disabled={processingId === user.id}
                                    className="w-full bg-red-600 text-white font-bold py-4 rounded-xl text-sm hover:bg-red-700 flex items-center justify-center gap-2 shadow-lg"
                                >
                                    {processingId === user.id ? <Loader2 className="animate-spin" size={18}/> : <><XCircle size={18}/> Confirm Rejection</>}
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

// Internal icon shim
const UserIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

export default KycTab;
