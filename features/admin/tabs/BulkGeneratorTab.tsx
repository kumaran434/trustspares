
import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { POPULAR_MODELS, BRANDS } from '../../dashboard/dashboardConstants';
import { DealStatus } from '../../../types';
import { Layers, CheckCircle2, Loader2, AlertTriangle, Database, X, Smartphone, Package, Plus, Search } from 'lucide-react';
import { writeBatch, doc, collection } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';

const SPARE_TYPES = [
    { suffix: 'Display Combo', category: 'display', tags: ['Display', 'Screen', 'Touch', 'Folder'] },
    { suffix: 'Charging CC Board', category: 'charging', tags: ['CC Board', 'Charging Port', 'Sub Board'] },
    { suffix: 'Battery', category: 'battery', tags: ['Battery', 'Power'] },
    { suffix: 'Main Flex Cable', category: 'other', tags: ['Flex', 'Main Strip', 'Motherboard Flex'] },
    { suffix: 'Inner Buttons Strip', category: 'other', tags: ['Volume Flex', 'Power Flex', 'Inner Button'] },
    { suffix: 'Camera Glass', category: 'body', tags: ['Camera Glass', 'Lens'] },
    { suffix: 'Ringer Buzzer', category: 'other', tags: ['Speaker', 'Ringer', 'Sound'] },
    { suffix: 'Back Panel', category: 'body', tags: ['Back Door', 'Panel', 'Housing'] },
    { suffix: 'Middle Frame', category: 'body', tags: ['Frame', 'Chassis', 'Bezel', 'Body'] },
    
    // NEW ADDITIONS
    { suffix: 'Fingerprint Sensor', category: 'other', tags: ['Fingerprint', 'Biometric', 'Sensor', 'Home Button'] },
    { suffix: 'SIM Tray Holder', category: 'body', tags: ['Sim Tray', 'Sim Slot', 'Holder', 'Sim Door'] },
    { suffix: 'Network Antenna Wire', category: 'other', tags: ['RF Cable', 'Signal Wire', 'Antenna', 'Coaxial'] },
    { suffix: 'Ear Speaker Receiver', category: 'other', tags: ['Receiver', 'Earpiece', 'Sound', 'Top Speaker'] }
];

const BulkGeneratorTab: React.FC = () => {
    const { currentUser, deals } = useApp();
    const [selectedBrand, setSelectedBrand] = useState<string>('');
    const [customBrand, setCustomBrand] = useState<string>('');
    const [customModelName, setCustomModelName] = useState<string>('');
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [isCustomGenerating, setIsCustomGenerating] = useState(false);
    const [progress, setProgress] = useState('');
    
    // Modal State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingStats, setPendingStats] = useState<{brand: string, models: number, items: number} | null>(null);

    // --- BULK LOGIC ---
    const handlePreCheck = () => {
        if (!currentUser) {
            alert("Error: Admin session not active. Please refresh page.");
            return;
        }

        if (!selectedBrand) {
            alert("Please select a brand first.");
            return;
        }
        
        // 1. Filter models for selected brand
        const models = POPULAR_MODELS.filter(m => m.brand === selectedBrand);
        
        if (models.length === 0) {
            alert(`No models found for brand: ${selectedBrand} in database.`);
            return;
        }

        const brandLabel = BRANDS.find(b => b.id === selectedBrand)?.label || selectedBrand;
        const totalItemsToCreate = models.length * SPARE_TYPES.length;

        // Set stats and show modal
        setPendingStats({
            brand: brandLabel,
            models: models.length,
            items: totalItemsToCreate
        });
        setShowConfirmModal(true);
    };

    const executeGeneration = async () => {
        setShowConfirmModal(false); // Close modal
        setIsGenerating(true);
        setProgress('Initializing batch...');

        try {
            const models = POPULAR_MODELS.filter(m => m.brand === selectedBrand);
            const brandLabel = BRANDS.find(b => b.id === selectedBrand)?.label || selectedBrand;

            // Pre-fetch existing titles to prevent duplicates
            const existingTitles = new Set(
                deals
                    .filter(d => d.sellerId === currentUser?.id)
                    .map(d => d.title.toLowerCase().trim())
            );

            // Firestore limits batches to 500 operations. We need to chunk it.
            let batch = writeBatch(db);
            let operationCount = 0;
            let totalCreated = 0;
            let totalSkipped = 0;

            for (const model of models) {
                for (const spare of SPARE_TYPES) {
                    const title = `${model.name} ${spare.suffix}`;
                    
                    // DUPLICATE CHECK
                    if (existingTitles.has(title.toLowerCase().trim())) {
                        totalSkipped++;
                        continue;
                    }

                    const newDocRef = doc(collection(db, "deals"));
                    
                    const dealData = {
                        title: title,
                        description: `Original quality ${spare.suffix} for ${model.name}. Tested and verified.`,
                        amount: 0, // Zero price indicates draft/unpriced
                        dealerPrice: 0,
                        stockQuantity: 0, // Out of stock until updated
                        category: spare.category,
                        industry: 'MOBILE',
                        brand: selectedBrand,
                        model: model.name,
                        tags: [...spare.tags, model.name, brandLabel],
                        sellerId: currentUser?.id,
                        status: DealStatus.DRAFT, // IMPORTANT: Set as DRAFT
                        listingImage: '', // No image yet
                        createdAt: new Date().toISOString(),
                        rating: 5.0,
                        soldQuantity: 0,
                        quality: 'ORIGINAL'
                    };

                    batch.set(newDocRef, dealData);
                    operationCount++;
                    totalCreated++;

                    // Commit batch every 400 items to be safe (limit is 500)
                    if (operationCount >= 400) {
                        console.log(`Committing batch of ${operationCount}...`);
                        await batch.commit();
                        batch = writeBatch(db); // Reset batch
                        operationCount = 0;
                        setProgress(`Generated ${totalCreated} items...`);
                    }
                }
            }

            // Commit remaining
            if (operationCount > 0) {
                console.log(`Committing final batch of ${operationCount}...`);
                await batch.commit();
            }

            alert(`Success! ${totalCreated} Draft Items created. ${totalSkipped} duplicates skipped.`);
            setSelectedBrand('');

        } catch (error: any) {
            console.error("Bulk Gen Error:", error);
            alert(`Error generating stock: ${error.message}`);
        } finally {
            setIsGenerating(false);
            setProgress('');
        }
    };

    // --- CUSTOM SINGLE MODEL LOGIC ---
    const handleCustomGenerate = async () => {
        if (!currentUser) return;
        if (!customBrand) return alert("Select a Brand");
        if (!customModelName.trim()) return alert("Enter Model Name");

        setIsCustomGenerating(true);
        try {
            const brandLabel = BRANDS.find(b => b.id === customBrand)?.label || customBrand;
            
            // Pre-fetch existing titles
            const existingTitles = new Set(
                deals
                    .filter(d => d.sellerId === currentUser.id)
                    .map(d => d.title.toLowerCase().trim())
            );

            const batch = writeBatch(db);
            let count = 0;
            let skipped = 0;

            for (const spare of SPARE_TYPES) {
                const title = `${brandLabel} ${customModelName} ${spare.suffix}`; // E.g. Samsung S25 Ultra Display Combo
                
                if (existingTitles.has(title.toLowerCase().trim())) {
                    skipped++;
                    continue;
                }

                const newDocRef = doc(collection(db, "deals"));
                
                const dealData = {
                    title: title,
                    description: `Original quality ${spare.suffix} for ${customModelName}. Tested and verified.`,
                    amount: 0,
                    dealerPrice: 0,
                    stockQuantity: 0,
                    category: spare.category,
                    industry: 'MOBILE',
                    brand: customBrand,
                    model: customModelName,
                    tags: [...spare.tags, customModelName, brandLabel, 'New Arrival'],
                    sellerId: currentUser.id,
                    status: DealStatus.DRAFT,
                    listingImage: '',
                    createdAt: new Date().toISOString(),
                    rating: 5.0,
                    soldQuantity: 0,
                    quality: 'ORIGINAL'
                };

                batch.set(newDocRef, dealData);
                count++;
            }

            if (count > 0) {
                await batch.commit();
                alert(`Success! Generated ${count} items for ${customModelName}. ${skipped} duplicates skipped.`);
            } else {
                alert(`All items for ${customModelName} already exist! (${skipped} skipped)`);
            }
            
            setCustomModelName('');
            setCustomBrand('');

        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setIsCustomGenerating(false);
        }
    };

    return (
        <div className="space-y-8 relative">
            
            {/* CONFIRMATION POPUP MODAL */}
            {showConfirmModal && pendingStats && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95">
                        <button 
                            onClick={() => setShowConfirmModal(false)}
                            className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
                        >
                            <X size={20}/>
                        </button>

                        <div className="flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-blue-600">
                                <Database size={32} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">Confirm Generation</h3>
                            <p className="text-sm text-gray-500 mb-6 font-medium">You are about to create bulk drafts.</p>

                            <div className="bg-gray-50 rounded-2xl p-4 w-full space-y-3 mb-6 border border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Brand</span>
                                    <span className="text-sm font-black text-slate-900">{pendingStats.brand}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Models</span>
                                    <span className="text-sm font-black text-slate-900">{pendingStats.models}</span>
                                </div>
                                <div className="border-t border-gray-200"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-gray-400 uppercase">Total Items</span>
                                    <span className="text-lg font-black text-blue-600">{pendingStats.items}</span>
                                </div>
                            </div>

                            <button 
                                onClick={executeGeneration}
                                className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 size={20} /> Yes, Start Generation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 1. BULK GENERATOR */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 p-6 opacity-10"><Database size={120} /></div>
                <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><Layers size={24}/> Auto Stock Generator</h2>
                <p className="text-slate-300 text-sm max-w-lg mb-6">
                    Automatically create empty product listings for all popular models of a selected brand. 
                </p>

                <div className="flex flex-col md:flex-row gap-4 relative z-10">
                    <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-2 border border-white/20">
                        <select 
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                            className="w-full bg-transparent text-white font-bold p-3 outline-none option:text-black cursor-pointer"
                        >
                            <option value="" className="text-slate-900">Select Mobile Brand</option>
                            {BRANDS.filter(b => b.id !== 'other').map(b => (
                                <option key={b.id} value={b.id} className="text-slate-900">{b.label}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={handlePreCheck}
                        disabled={!selectedBrand || isGenerating}
                        className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={20}/> : <CheckCircle2 size={20}/>}
                        {isGenerating ? 'Generating...' : 'Generate All Products'}
                    </button>
                </div>
                {progress && <p className="mt-4 text-xs font-mono text-green-300 animate-pulse">{progress}</p>}
            </div>

            {/* 2. CUSTOM SINGLE MODEL GENERATOR */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
                <div className="absolute right-0 top-0 p-6 opacity-5"><Smartphone size={100} /></div>
                
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <Plus size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900">Add Missing / New Model</h3>
                        <p className="text-xs text-gray-500 font-bold">If a model is not in the auto-list, add it here.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 relative z-10">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">1. Select Brand</label>
                        <select 
                            value={customBrand}
                            onChange={(e) => setCustomBrand(e.target.value)}
                            className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 font-bold text-sm outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">-- Choose Brand --</option>
                            {BRANDS.filter(b => b.id !== 'other').map(b => (
                                <option key={b.id} value={b.id}>{b.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">2. Type Model Name</label>
                        <div className="flex gap-2">
                            <input 
                                type="text"
                                value={customModelName}
                                onChange={(e) => setCustomModelName(e.target.value)}
                                placeholder="e.g. S25 Ultra or Note 50"
                                className="flex-1 bg-gray-50 p-3 rounded-xl border border-gray-200 font-bold text-sm outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                            />
                            <button 
                                onClick={handleCustomGenerate}
                                disabled={isCustomGenerating || !customBrand || !customModelName}
                                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 active:scale-95 transition-all"
                            >
                                {isCustomGenerating ? <Loader2 className="animate-spin" size={18}/> : <Plus size={18}/>}
                                Generate
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* INFO BOX */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-xl">
                <div className="flex gap-3">
                    <AlertTriangle className="text-yellow-600 flex-shrink-0" size={24} />
                    <div>
                        <h4 className="font-bold text-yellow-800 text-sm">How this works:</h4>
                        <ul className="text-xs text-yellow-700 mt-1 space-y-1 list-disc pl-4 font-medium">
                            <li>It creates 13 items (Display, Battery, CC, Frame, Fingerprint, SIM Tray, etc.) for the model.</li>
                            <li>Example: "Samsung M30 Fingerprint Sensor", "Samsung M30 SIM Tray"...</li>
                            <li>Items are created as <b>DRAFTS</b> (Hidden). Go to 'Manage Stock' &rarr; 'Drafts' to set price and photo.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulkGeneratorTab;
