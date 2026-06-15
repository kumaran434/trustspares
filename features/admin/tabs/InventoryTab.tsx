
import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Package, TrendingUp, AlertTriangle, IndianRupee, Search, Plus, X, Check, Loader2, History, ArrowDownLeft, ArrowUpRight, RotateCcw, Building2, Store, FileText, BadgeCent, Wallet, User as UserIcon, Calendar, Clock } from 'lucide-react';
import { Deal, MovementType, InventoryLog } from '../../../types';

const InventoryTab: React.FC = () => {
    const { deals, currentUser, updateDeal, inventoryLogs, logStockMovement } = useApp();
    const [search, setSearch] = useState('');
    const [view, setView] = useState<'STOCK' | 'HISTORY'>('STOCK');
    const [historyFilter, setHistoryFilter] = useState<'ALL' | 'UDHAAR' | 'CLEARED'>('ALL');
    const [filter, setFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
    
    // Ledger Entry Modal State
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [partyName, setPartyName] = useState('');
    const [entryQty, setEntryQty] = useState('1');
    const [entryPrice, setEntryPrice] = useState('');
    const [paidAmount, setPaidAmount] = useState(''); // NEW: Track payment
    const [entryType, setEntryType] = useState<MovementType>(MovementType.SALE);
    const [isProcessing, setIsProcessing] = useState(false);

    // Auto-fill price and paid amount when deal is selected
    useEffect(() => {
        if (selectedDeal) {
            setEntryPrice(selectedDeal.amount.toString());
            setPaidAmount(selectedDeal.amount.toString()); // Default to full pay
        } else {
            setEntryPrice('');
            setPaidAmount('');
        }
    }, [selectedDeal]);

    const inventoryData = useMemo(() => {
        // ADMIN sees ALL deals. Sellers see only their own.
        const myDeals = currentUser?.isAdmin 
            ? deals 
            : deals.filter(d => d.sellerId === currentUser?.id);
        
        const totalItems = myDeals.length;
        const totalStock = myDeals.reduce((sum, d) => sum + (d.stockQuantity || 0), 0);
        const totalSold = myDeals.reduce((sum, d) => sum + (d.soldQuantity || 0), 0);
        const stockValue = myDeals.reduce((sum, d) => sum + ((d.stockQuantity || 0) * d.amount), 0);
        const lowStockCount = myDeals.filter(d => (d.stockQuantity || 0) > 0 && (d.stockQuantity || 0) < 3).length;
        const outOfStockCount = myDeals.filter(d => (d.stockQuantity || 0) === 0).length;

        let list = myDeals;
        if (search) {
            list = list.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));
        }
        if (filter === 'LOW') list = list.filter(d => (d.stockQuantity || 0) > 0 && (d.stockQuantity || 0) < 3);
        if (filter === 'OUT') list = list.filter(d => (d.stockQuantity || 0) === 0);

        return { list, totalItems, totalStock, totalSold, stockValue, lowStockCount, outOfStockCount };
    }, [deals, currentUser, search, filter]);

    const filteredLogs = useMemo(() => {
        let list = [...inventoryLogs];
        if (historyFilter === 'UDHAAR') list = list.filter(l => l.balanceAmount > 0);
        if (historyFilter === 'CLEARED') list = list.filter(l => l.balanceAmount === 0);
        return list;
    }, [inventoryLogs, historyFilter]);

    const totalUdhaar = useMemo(() => {
        return inventoryLogs.reduce((sum, l) => sum + l.balanceAmount, 0);
    }, [inventoryLogs]);

    const handleLogSubmit = async () => {
        if (!selectedDeal || !partyName.trim()) return;
        const qty = parseInt(entryQty);
        const price = parseFloat(entryPrice);
        const paid = parseFloat(paidAmount || '0');
        
        if (isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) return;

        const total = price * qty;
        const balance = Math.max(0, total - paid);

        setIsProcessing(true);
        try {
            await logStockMovement({
                dealId: selectedDeal.id,
                productName: selectedDeal.title,
                partyName: partyName,
                type: entryType,
                quantity: qty,
                pricePerUnit: price,
                totalAmount: total,
                paidAmount: paid,
                balanceAmount: balance,
                date: new Date().toISOString()
            });
            setIsEntryModalOpen(false);
            setPartyName('');
            setEntryQty('1');
            setEntryPrice('');
            setPaidAmount('');
            setSelectedDeal(null);
        } catch (error) {
            alert("Failed to update ledger.");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* LEDGER ENTRY MODAL */}
            {isEntryModalOpen && (
                <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-2">
                            <h3 className="text-xl font-black text-slate-900">Vyapar Billing</h3>
                            <button onClick={() => setIsEntryModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"><X size={18}/></button>
                        </div>
                        
                        <div className="space-y-5">
                            {/* Transaction Type */}
                            <div className="flex p-1 bg-gray-100 rounded-2xl">
                                {(['SALE', 'PURCHASE'] as const).map(t => (
                                    <button 
                                        key={t}
                                        onClick={() => setEntryType(t as any)}
                                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all ${entryType === t ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>

                            {/* Party Name */}
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Party / Customer Name</label>
                                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200 mt-1">
                                    <UserIcon size={18} className="text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="E.g. Raja Mobiles or Retail Customer"
                                        className="bg-transparent w-full font-bold text-gray-900 outline-none"
                                        value={partyName}
                                        onChange={(e) => setPartyName(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Product Selection */}
                            {!selectedDeal ? (
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Choose Item</label>
                                    <select 
                                        className="w-full mt-1 p-4 rounded-xl border border-gray-200 bg-gray-50 font-bold text-sm outline-none"
                                        onChange={(e) => setSelectedDeal(inventoryData.list.find(d => d.id === e.target.value) || null)}
                                    >
                                        <option value="">-- Select Product --</option>
                                        {inventoryData.list.map(d => <option key={d.id} value={d.id}>{d.title} ({d.stockQuantity} in stock)</option>)}
                                    </select>
                                </div>
                            ) : (
                                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-blue-100">
                                            <img src={selectedDeal.listingImage || 'https://placehold.co/100x100?text=No+Image'} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-800 line-clamp-1">{selectedDeal.title}</p>
                                            <p className="text-[10px] text-blue-600 font-bold">Qty: {selectedDeal.stockQuantity} available</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelectedDeal(null)} className="text-gray-400 p-1 hover:bg-white rounded-full transition"><X size={16}/></button>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Quantity</label>
                                    <div className="flex items-center gap-2 mt-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                        <Package size={16} className="text-gray-400" />
                                        <input 
                                            type="number" 
                                            className="bg-transparent w-full font-black text-gray-900 outline-none"
                                            value={entryQty}
                                            onChange={(e) => setEntryQty(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Rate (₹)</label>
                                    <div className="flex items-center gap-2 mt-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                        <BadgeCent size={16} className="text-gray-400" />
                                        <input 
                                            type="number" 
                                            className="bg-transparent w-full font-black text-gray-900 outline-none"
                                            value={entryPrice}
                                            onChange={(e) => setEntryPrice(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* PAYMENT SECTION */}
                            <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-[10px] font-black text-orange-700 uppercase tracking-widest">Payment Received (₹)</label>
                                    <button 
                                        onClick={() => setPaidAmount((parseFloat(entryPrice || '0') * parseInt(entryQty || '0')).toString())}
                                        className="text-[9px] font-black text-orange-600 bg-white px-2 py-1 rounded shadow-sm hover:bg-orange-500 hover:text-white transition"
                                    >
                                        FULL PAY
                                    </button>
                                </div>
                                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-orange-200">
                                    <IndianRupee size={18} className="text-orange-500" />
                                    <input 
                                        type="number" 
                                        placeholder="Enter amount received"
                                        className="bg-transparent w-full font-black text-gray-900 outline-none text-xl"
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(e.target.value)}
                                    />
                                </div>
                                
                                {parseFloat(paidAmount || '0') < (parseFloat(entryPrice || '0') * parseInt(entryQty || '0')) && (
                                    <div className="mt-3 flex justify-between items-center px-1">
                                        <span className="text-[10px] font-bold text-orange-600">Balance (Udhaar):</span>
                                        <span className="text-sm font-black text-red-600">
                                            ₹{((parseFloat(entryPrice || '0') * parseInt(entryQty || '0')) - parseFloat(paidAmount || '0')).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleLogSubmit}
                                disabled={isProcessing || !partyName || !selectedDeal || !entryPrice}
                                className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={20}/> : <><Check size={20}/> Create Bill & Log</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Stock Value</p>
                        <IndianRupee size={14} className="text-green-500"/>
                    </div>
                    <h3 className="text-xl font-black text-slate-900">₹{inventoryData.stockValue.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:bg-red-50 transition" onClick={() => { setView('HISTORY'); setHistoryFilter('UDHAAR'); }}>
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Udhaar (Dues)</p>
                        <Wallet size={14} className="text-red-500"/>
                    </div>
                    <h3 className={`text-xl font-black ${totalUdhaar > 0 ? 'text-red-600' : 'text-slate-900'}`}>₹{totalUdhaar.toLocaleString()}</h3>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:bg-orange-50 transition" onClick={() => { setView('STOCK'); setFilter('LOW'); }}>
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase">Low Stock</p>
                        <AlertTriangle size={14} className="text-orange-500"/>
                    </div>
                    <h3 className={`text-xl font-black ${inventoryData.lowStockCount > 0 ? 'text-orange-600' : 'text-slate-900'}`}>{inventoryData.lowStockCount}</h3>
                </div>
                <button 
                    onClick={() => setIsEntryModalOpen(true)}
                    className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-1 active:scale-95 transition-all"
                >
                    <Plus size={24}/>
                    <span className="text-[10px] font-black uppercase tracking-wider">Quick Billing</span>
                </button>
            </div>

            {/* TAB TOGGLE */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl w-fit">
                <button onClick={() => setView('STOCK')} className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${view === 'STOCK' ? 'bg-white shadow-sm text-slate-900' : 'text-gray-400'}`}>Current Stock</button>
                <button onClick={() => setView('HISTORY')} className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition-all ${view === 'HISTORY' ? 'bg-white shadow-sm text-slate-900' : 'text-gray-400'}`}>Ledger & Dues</button>
            </div>

            {view === 'STOCK' ? (
                <>
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18}/>
                            <input 
                                type="text" 
                                placeholder="Search inventory..."
                                className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-100 overflow-x-auto scrollbar-hide">
                            {(['ALL', 'LOW', 'OUT'] as const).map(f => (
                                <button 
                                    key={f} 
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filter === f ? 'bg-slate-900 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 text-gray-400 font-bold uppercase border-b border-gray-100">
                                    <tr>
                                        <th className="p-4">Product Name</th>
                                        <th className="p-4 text-center">In Stock</th>
                                        <th className="p-4 text-center">Action</th>
                                        <th className="p-4 text-right">Price</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 font-bold">
                                    {inventoryData.list.length === 0 ? (
                                        <tr><td colSpan={4} className="p-10 text-center text-gray-400">No items matching filters.</td></tr>
                                    ) : (
                                        inventoryData.list.map(item => {
                                            const isLow = (item.stockQuantity || 0) < 3 && (item.stockQuantity || 0) > 0;
                                            const isOut = (item.stockQuantity || 0) === 0;

                                            return (
                                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center shrink-0">
                                                                <img src={item.listingImage || 'https://placehold.co/100x100?text=No+Image'} className="max-w-full max-h-full object-contain mix-blend-multiply" />
                                                            </div>
                                                            <span className="text-slate-900 line-clamp-1">{item.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] ${isOut ? 'bg-red-100 text-red-700' : isLow ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                                            {item.stockQuantity || 0}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button 
                                                            onClick={() => { setSelectedDeal(item); setIsEntryModalOpen(true); }}
                                                            className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-blue-600 hover:text-white transition-all"
                                                        >
                                                            Bill Now
                                                        </button>
                                                    </td>
                                                    <td className="p-4 text-right text-slate-900">₹{item.amount.toLocaleString()}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                /* HISTORY / UDHAAR VIEW */
                <div className="space-y-4">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                        {[
                            { id: 'ALL', label: 'Full Ledger' },
                            { id: 'UDHAAR', label: 'Only Dues (Udhaar)' },
                            { id: 'CLEARED', label: 'Fully Paid' }
                        ].map(f => (
                            <button 
                                key={f.id} 
                                onClick={() => setHistoryFilter(f.id as any)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap ${historyFilter === f.id ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in duration-300">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-gray-50 text-gray-400 font-bold uppercase border-b border-gray-100">
                                    <tr>
                                        <th className="p-4">Party & Date</th>
                                        <th className="p-4">Product</th>
                                        <th className="p-4 text-center">Amount</th>
                                        <th className="p-4 text-center">Payment Status</th>
                                        <th className="p-4 text-right">Balance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredLogs.length === 0 ? (
                                        <tr><td colSpan={5} className="p-10 text-center text-gray-400 font-bold uppercase tracking-widest">No matching entries.</td></tr>
                                    ) : (
                                        filteredLogs.map(log => {
                                            const isUdhaar = log.balanceAmount > 0;
                                            return (
                                                <tr key={log.id} className="hover:bg-gray-50 font-bold">
                                                    <td className="p-4">
                                                        <p className="text-slate-900 uppercase truncate max-w-[120px]">{log.partyName}</p>
                                                        <div className="flex items-center gap-1 text-[9px] text-gray-400 mt-0.5">
                                                            <Calendar size={10}/>
                                                            <span>{new Date(log.date).toLocaleDateString()}</span>
                                                            <Clock size={10} className="ml-1"/>
                                                            <span>{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className="text-gray-600 line-clamp-1">{log.productName}</span>
                                                        <p className="text-[9px] text-gray-400 font-normal">{log.quantity} pcs @ ₹{log.pricePerUnit}</p>
                                                    </td>
                                                    <td className="p-4 text-center text-slate-900">
                                                        ₹{log.totalAmount.toLocaleString()}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] ${isUdhaar ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                                                            {isUdhaar ? (
                                                                <>Paid: ₹{log.paidAmount.toLocaleString()}</>
                                                            ) : (
                                                                <><Check size={10}/> FULLY PAID</>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className={`p-4 text-right font-black ${isUdhaar ? 'text-red-600' : 'text-gray-300'}`}>
                                                        {isUdhaar ? `₹${log.balanceAmount.toLocaleString()}` : '-'}
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
            )}
        </div>
    );
};

export default InventoryTab;
