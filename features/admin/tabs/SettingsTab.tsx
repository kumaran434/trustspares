
import React, { useState, useEffect } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Building2, Headset, Sparkles, Key, Save } from 'lucide-react';

const SettingsTab: React.FC = () => {
    const { platformSettings, updatePlatformSettings } = useApp();
    const [adminSettingsForm, setAdminSettingsForm] = useState(platformSettings);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => { setAdminSettingsForm(platformSettings); }, [platformSettings]);

    const handleSaveSettings = async () => {
        setIsProcessing(true);
        await updatePlatformSettings(adminSettingsForm);
        setIsProcessing(false);
        alert("Admin Settings Updated Successfully!");
    };

    return (
        <div className="space-y-6">
            
            {/* AI CONFIGURATION SECTION - MOVED TO TOP FOR VISIBILITY */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 rounded-2xl shadow-xl text-white">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Sparkles size={20} className="text-yellow-400"/> AI Configuration</h3>
                <p className="text-xs text-slate-300 mb-6 font-medium leading-relaxed">
                    Configure the Gemini AI Key for Studio Mode. This key allows users to remove backgrounds and create studio-quality product images automatically.
                </p>
                
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2 mb-2"><Key size={14} className="text-yellow-400"/> Google Gemini API Key</label>
                    <input 
                        type="password" 
                        value={adminSettingsForm.geminiApiKey || ''} 
                        onChange={e => setAdminSettingsForm({...adminSettingsForm, geminiApiKey: e.target.value})} 
                        className="w-full p-3 border border-slate-600 bg-slate-900 rounded-xl font-mono text-sm text-white placeholder-slate-600 focus:border-blue-500 outline-none transition-all"
                        placeholder="Paste your API Key here (starts with AIzaSy...)"
                    />
                    <div className="flex justify-between items-center mt-3">
                        <p className="text-[10px] text-slate-400">
                            Key is stored securely in Firestore.
                        </p>
                        {adminSettingsForm.geminiApiKey && (
                            <span className="text-[10px] text-green-400 font-bold bg-green-900/30 px-2 py-1 rounded">Key Set ✅</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2"><Building2 size={20}/> Admin Bank Account</h3>
                <p className="text-xs text-gray-500 mb-6">This account receives all buyer payments initially (Escrow).</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">UPI ID</label>
                        <input type="text" value={adminSettingsForm.adminUpiId} onChange={e => setAdminSettingsForm({...adminSettingsForm, adminUpiId: e.target.value})} className="w-full p-3 border rounded-xl font-bold mt-1"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Account Name</label>
                        <input type="text" value={adminSettingsForm.adminAccountName} onChange={e => setAdminSettingsForm({...adminSettingsForm, adminAccountName: e.target.value})} className="w-full p-3 border rounded-xl font-bold mt-1"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Account Number</label>
                        <input type="text" value={adminSettingsForm.adminAccountNumber} onChange={e => setAdminSettingsForm({...adminSettingsForm, adminAccountNumber: e.target.value})} className="w-full p-3 border rounded-xl font-bold mt-1"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">IFSC Code</label>
                        <input type="text" value={adminSettingsForm.adminIfsc} onChange={e => setAdminSettingsForm({...adminSettingsForm, adminIfsc: e.target.value})} className="w-full p-3 border rounded-xl font-bold mt-1"/>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2"><Headset size={20}/> Support Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Support Phone</label>
                        <input type="text" value={adminSettingsForm.supportPhone} onChange={e => setAdminSettingsForm({...adminSettingsForm, supportPhone: e.target.value})} className="w-full p-3 border rounded-xl font-bold mt-1"/>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase">Support Email</label>
                        <input type="text" value={adminSettingsForm.supportEmail} onChange={e => setAdminSettingsForm({...adminSettingsForm, supportEmail: e.target.value})} className="w-full p-3 border rounded-xl font-bold mt-1"/>
                    </div>
                </div>
            </div>

            <button onClick={handleSaveSettings} disabled={isProcessing} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-2">
                {isProcessing ? 'Saving Configuration...' : <><Save size={18}/> Save All Settings</>}
            </button>
        </div>
    );
};

export default SettingsTab;
