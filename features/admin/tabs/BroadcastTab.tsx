
import React, { useState, useMemo } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Send, Users, ShieldCheck, User, Megaphone, Loader2, Bell, CheckCircle2 } from 'lucide-react';
import { writeBatch, collection, doc } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

const BroadcastTab: React.FC = () => {
    const { users } = useApp();
    const [targetGroup, setTargetGroup] = useState<'ALL' | 'TECHNICIANS' | 'CUSTOMERS'>('ALL');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    
    // Custom Modal State for Broadcast Confirmation
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // --- FILTER LOGIC ---
    const targetUsers = useMemo(() => {
        return users.filter(u => {
            if (targetGroup === 'ALL') return true;
            if (targetGroup === 'TECHNICIANS') return u.kycVerified === true; // Verified Shops
            if (targetGroup === 'CUSTOMERS') return !u.kycVerified && !u.isAdmin; // Regular Buyers
            return false;
        });
    }, [users, targetGroup]);

    const handleSendBroadcast = async () => {
        setIsSending(true);
        setShowConfirmModal(false);
        try {
            // Firestore Batch Limit is 500. We must chunk if users > 500.
            const chunkSize = 400; 
            for (let i = 0; i < targetUsers.length; i += chunkSize) {
                const chunk = targetUsers.slice(i, i + chunkSize);
                const batch = writeBatch(db);

                chunk.forEach(user => {
                    const ref = doc(collection(db, 'notifications'));
                    batch.set(ref, {
                        userId: user.id,
                        title: title,
                        message: message,
                        read: false,
                        date: new Date().toISOString(),
                        type: 'INFO'
                    });
                });

                await batch.commit();
            }

            setSuccessMsg(`Successfully sent to ${targetUsers.length} users!`);
            setTitle('');
            setMessage('');
            setTimeout(() => setSuccessMsg(''), 5000);

        } catch (error) {
            console.error("Broadcast failed:", error);
            alert("Failed to send broadcast.");
        } finally {
            setIsSending(false);
        }
    };

    const confirmBroadcast = () => {
        if (!title.trim() || !message.trim()) return alert("Please enter Title and Message");
        if (targetUsers.length === 0) return alert("No users found in selected group.");
        setShowConfirmModal(true);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            
            {/* Custom Confirmation Modal for Broadcast */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-4 mx-auto">
                            <Send className="text-purple-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Send Broadcast?</h3>
                        <p className="text-sm text-center text-gray-500 mb-6">
                            Are you sure you want to send this message to <strong>{targetUsers.length}</strong> users?
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowConfirmModal(false)}
                                disabled={isSending}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSendBroadcast}
                                disabled={isSending}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSending ? 'Sending...' : <><Send size={16} /> Send</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-purple-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 p-6 opacity-10"><Megaphone size={120}/></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-black flex items-center gap-2"><Megaphone size={24}/> Broadcast Center</h2>
                    <p className="text-purple-100 text-sm mt-1 font-medium">Send push notifications & alerts to all app users.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                
                {/* LEFT: COMPOSE */}
                <div className="space-y-6">
                    {/* Target Selector */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">1. Select Audience</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button 
                                onClick={() => setTargetGroup('ALL')}
                                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${targetGroup === 'ALL' ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Users size={20}/>
                                <span className="text-[10px] font-black uppercase">All Users</span>
                            </button>
                            <button 
                                onClick={() => setTargetGroup('TECHNICIANS')}
                                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${targetGroup === 'TECHNICIANS' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                            >
                                <ShieldCheck size={20}/>
                                <span className="text-[10px] font-black uppercase">Technicians</span>
                            </button>
                            <button 
                                onClick={() => setTargetGroup('CUSTOMERS')}
                                className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${targetGroup === 'CUSTOMERS' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                            >
                                <User size={20}/>
                                <span className="text-[10px] font-black uppercase">Customers</span>
                            </button>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 mt-3 text-right">
                            Selected: <span className="text-slate-900">{targetUsers.length} Users</span>
                        </p>
                    </div>

                    {/* Input Fields */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">2. Compose Message</label>
                        
                        <input 
                            type="text" 
                            placeholder="Notification Title (e.g. Diwali Offer!)"
                            className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 font-bold text-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        
                        <textarea 
                            rows={4}
                            placeholder="Type your message here..."
                            className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 font-medium text-slate-900 outline-none focus:ring-2 focus:ring-purple-500"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    <button 
                        onClick={confirmBroadcast}
                        disabled={isSending || targetUsers.length === 0}
                        className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSending ? <Loader2 className="animate-spin" size={20}/> : <><Send size={20}/> Send Broadcast</>}
                    </button>

                    {successMsg && (
                        <div className="bg-green-100 text-green-800 p-4 rounded-xl flex items-center gap-2 font-bold animate-in slide-in-from-bottom">
                            <CheckCircle2 size={20}/> {successMsg}
                        </div>
                    )}
                </div>

                {/* RIGHT: PREVIEW */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block pl-2">Live Preview</label>
                    
                    <div className="bg-gray-100 rounded-[30px] p-6 border-4 border-gray-200 shadow-inner min-h-[400px] relative">
                        {/* Fake Phone UI */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-200 rounded-b-xl"></div>
                        
                        <div className="mt-8 space-y-3">
                            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-sm border border-white/50 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                        <Bell size={20}/>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 text-sm">{title || "Notification Title"}</h4>
                                        <p className="text-xs text-gray-500 line-clamp-2">{message || "Your message content will appear here..."}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-bold">Now</span>
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-6 left-0 right-0 text-center">
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Preview on User Device</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default BroadcastTab;
