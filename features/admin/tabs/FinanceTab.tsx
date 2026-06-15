
import React, { useState, useMemo } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { ArrowDownLeft, History, ImageIcon, Eye, Filter, X } from 'lucide-react';
import { User } from '../../../types';

interface FinanceTabProps {
    setSelectedUser: (user: User | null) => void;
    setPreviewImage: (url: string | null) => void;
}

const FinanceTab: React.FC<FinanceTabProps> = ({ setSelectedUser, setPreviewImage }) => {
    const { transactions, deals, users, approvePayment } = useApp();
    const [isProcessing, setIsProcessing] = useState(false);
    
    // Custom Modal State for Payment Verification
    const [txToVerify, setTxToVerify] = useState<string | null>(null);
    
    // Filter State for History
    const [filterUserId, setFilterUserId] = useState<string | null>(null);

    // --- 1. FILTER LISTS ---
    const pendingDeposits = transactions.filter(t => t.status === 'PENDING' && t.type === 'ESCROW_LOCK').sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // History Filter Logic
    const transactionHistory = useMemo(() => {
        let txs = transactions.filter(t => t.status === 'COMPLETED' || t.status === 'FAILED');
        if (filterUserId) {
            txs = txs.filter(t => t.userId === filterUserId);
        }
        return txs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, filterUserId]);

    const handleApproveTx = async () => {
        if (!txToVerify) return;
        setIsProcessing(true);
        try {
            await approvePayment(txToVerify);
            alert("Payment Verified. Order marked as PAID.");
            setTxToVerify(null);
        } catch(e) {
            alert("Error approving payment.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-8">
            
            {/* Custom Confirmation Modal for Payment Verification */}
            {txToVerify && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-4 mx-auto">
                            <Eye className="text-blue-600" size={24} />
                        </div>
                        <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Verify Payment?</h3>
                        <p className="text-sm text-center text-gray-500 mb-6">
                            Have you verified the payment screenshot in your Bank App?
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setTxToVerify(null)}
                                disabled={isProcessing}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleApproveTx}
                                disabled={isProcessing}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isProcessing ? 'Verifying...' : 'Yes, Verified'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. PENDING REQUESTS (Action Items) */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-4"><ArrowDownLeft size={20}/> Incoming Payments (Verify Screenshots)</h3>
                {pendingDeposits.length === 0 ? <p className="text-sm text-blue-400 font-bold opacity-70">No pending payments.</p> : (
                    <div className="space-y-3">
                        {pendingDeposits.map(tx => (
                            <div key={tx.id} className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden cursor-pointer border border-gray-200 flex-shrink-0" onClick={() => tx.proofImage && setPreviewImage(tx.proofImage)}>
                                        {tx.proofImage ? <img src={tx.proofImage} className="w-full h-full object-cover"/> : <ImageIcon size={16} className="text-gray-400 m-2"/>}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-sm">₹{tx.amount.toLocaleString()}</p>
                                        <p className="text-[10px] text-gray-500 truncate max-w-[120px]">{tx.description}</p>
                                    </div>
                                </div>
                                <button onClick={() => setTxToVerify(tx.id)} disabled={isProcessing} className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-[10px] hover:bg-blue-700 disabled:opacity-50">
                                    {isProcessing && txToVerify === tx.id ? 'Saving...' : 'Verify'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 2. TRANSACTION HISTORY */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2"><History size={20}/> Payment History</h3>
                        {filterUserId && (
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                                <Filter size={10} /> Filtered User
                                <button onClick={() => setFilterUserId(null)} className="ml-1 hover:text-blue-900"><X size={12}/></button>
                            </span>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="text-gray-400 font-bold uppercase border-b border-gray-100 bg-gray-50">
                            <tr>
                                <th className="p-3 rounded-tl-lg">Date</th>
                                <th className="p-3">User</th>
                                <th className="p-3">Description</th>
                                <th className="p-3 text-center">Receipt</th>
                                <th className="p-3 text-right rounded-tr-lg">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactionHistory.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-400 font-bold">No payments found.</td></tr>
                            ) : (
                                transactionHistory.map(tx => {
                                    const user = users.find(u => u.id === tx.userId);
                                    let isIncome = tx.type === 'ESCROW_LOCK'; // Money IN

                                    return (
                                        <tr key={tx.id} className="group hover:bg-gray-50 transition-colors">
                                            <td className="p-3 text-gray-500 font-medium whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                                            <td className="p-3 font-bold text-gray-900 cursor-pointer hover:text-blue-600" onClick={() => user && setFilterUserId(user.id)}>{user?.name || 'Unknown'}</td>
                                            <td className="p-3 text-gray-600">{tx.description}</td>
                                            <td className="p-3 text-center">
                                                {tx.proofImage ? (
                                                    <button 
                                                        onClick={() => setPreviewImage(tx.proofImage!)}
                                                        className="inline-flex items-center gap-1 bg-gray-100 hover:bg-blue-100 text-blue-600 px-3 py-1.5 rounded-lg font-bold transition-colors"
                                                    >
                                                        <Eye size={14}/> View
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                            <td className={`p-3 text-right font-mono font-bold ${isIncome ? 'text-green-600' : 'text-slate-900'}`}>
                                                {isIncome ? '+' : '-'}₹{tx.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinanceTab;
