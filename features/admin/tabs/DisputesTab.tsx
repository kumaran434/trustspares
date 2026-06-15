
import React, { useState, useRef } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { ShieldCheck, AlertOctagon, ArrowDownLeft, Check, Camera } from 'lucide-react';
import { DealStatus } from '../../../types';
import { processEvidenceForUpload, uploadImageToFirebase } from '../../../services/imageService';

const DisputesTab: React.FC = () => {
    const { deals, users, resolveDispute } = useApp();
    const [disputeDecision, setDisputeDecision] = useState<'REFUND_BUYER' | 'PAY_SELLER' | null>(null);
    const [utrNumber, setUtrNumber] = useState('');
    const [disputeProofImage, setDisputeProofImage] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const disputedDeals = deals.filter(d => d.status === DealStatus.DISPUTED);
    const disputeFileRef = useRef<HTMLInputElement>(null);

    const handleDisputeProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const compressed = await processEvidenceForUpload(reader.result as string);
                setDisputeProofImage(compressed);
            } catch(e) { alert("Error processing image"); }
        };
        reader.readAsDataURL(file);
    };

    const handleResolveDispute = async (dealId: string) => {
        if (!disputeDecision) return;
        if (disputeDecision === 'REFUND_BUYER' && !utrNumber) return alert("Please enter UTR for Refund.");
        
        setIsProcessing(true);
        try {
            let proofUrl = undefined;
            if (disputeProofImage) {
                proofUrl = await uploadImageToFirebase(disputeProofImage, `refunds/${dealId}/proof.jpg`);
            }
            await resolveDispute(dealId, disputeDecision, utrNumber, proofUrl);
            setUtrNumber('');
            setDisputeDecision(null);
            setDisputeProofImage(null);
        } catch (e) { alert("Failed to resolve dispute."); } 
        finally { setIsProcessing(false); }
    };

    return (
        <div className="space-y-4">
            {disputedDeals.length === 0 ? (
                <div className="text-center p-10 bg-gray-50 rounded-xl border border-gray-100">
                    <ShieldCheck size={40} className="mx-auto text-green-500 mb-2"/>
                    <p className="text-gray-500 font-bold">No Active Disputes</p>
                </div>
            ) : (
                disputedDeals.map(deal => {
                    const buyer = users.find(u => u.id === deal.buyerId);
                    const seller = users.find(u => u.id === deal.sellerId);
                    return (
                        <div key={deal.id} className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-red-500">
                            <h3 className="font-bold text-lg text-red-600 mb-2 flex items-center gap-2"><AlertOctagon size={20}/> DISPUTE: {deal.title}</h3>
                            <p className="text-sm text-gray-800 bg-red-50 p-3 rounded-lg font-medium">"{deal.disputeReason}"</p>
                            
                            <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-gray-500">
                                <div>
                                    <span className="uppercase font-bold block mb-1">Buyer (Complainant)</span>
                                    <p className="font-bold text-gray-900 text-sm">{buyer?.name} ({buyer?.mobile})</p>
                                </div>
                                <div>
                                    <span className="uppercase font-bold block mb-1">Seller (Defendant)</span>
                                    <p className="font-bold text-gray-900 text-sm">{seller?.shopName} ({seller?.mobile})</p>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
                                <div className="flex-1 space-y-2">
                                    <button onClick={() => setDisputeDecision('REFUND_BUYER')} className={`w-full p-3 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-1 ${disputeDecision === 'REFUND_BUYER' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                        <ArrowDownLeft size={16}/> Refund Buyer
                                    </button>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <button onClick={() => setDisputeDecision('PAY_SELLER')} className={`w-full p-3 rounded-xl border-2 font-bold text-xs flex flex-col items-center gap-1 ${disputeDecision === 'PAY_SELLER' ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                                        <Check size={16}/> Release to Seller
                                    </button>
                                </div>
                            </div>

                            {disputeDecision && (
                                <div className="mt-4 bg-gray-50 p-4 rounded-xl animate-in slide-in-from-top">
                                    {disputeDecision === 'REFUND_BUYER' && (
                                        <div className="mb-3">
                                            <label className="text-xs font-bold text-gray-500">Manual Refund UTR</label>
                                            <input type="text" value={utrNumber} onChange={e => setUtrNumber(e.target.value)} className="w-full p-2 border rounded mt-1 text-sm font-bold"/>
                                        </div>
                                    )}
                                    <button onClick={() => handleResolveDispute(deal.id)} disabled={isProcessing} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl">
                                        {isProcessing ? 'Processing...' : 'Confirm Resolution'}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default DisputesTab;
