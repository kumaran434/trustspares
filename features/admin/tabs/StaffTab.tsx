import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, Users, Shield, Award, PlusCircle, Database } from 'lucide-react';

const getDefaultShops = () => {
  try {
    const saved = localStorage.getItem('temperking_shops');
    return saved ? JSON.parse(saved) : [
      {
        id: 'shop-1',
        name: 'Arakkonam Junction Branch',
        displayName: 'TemperKing (அரக்கோணம் ரயில்வே ஜங்ஷன் கிளை)',
        address: 'அரக்கோணம் ரயில்வே ஜங்ஷன் ரவுண்டானா அருகில், டெம்பர் கிங் பிரத்யேக ஷோரூம்.',
        gps: '12.9249° N, 79.6688° E',
        domain: 'temperking.in'
      },
      {
        id: 'shop-2',
        name: 'Gandhi Road Electronics',
        displayName: 'TemperKing (காந்தி ரோடு கிளை - மொபைல் & டிவி)',
        address: 'காந்தி ரோடு முதன்மை சந்திப்பு, ஆஞ்சநேயர் கோவில் அருகில், TrustSpares எலக்ட்ரானிக்ஸ்.',
        gps: '12.9261° N, 79.6698° E',
        domain: 'gandhiroadspares.in'
      },
      {
        id: 'shop-3',
        name: 'Old Town Auto Garage',
        displayName: 'TrustSpares Auto (பழைய நகராட்சி அருகில் - பைக் ஸ்பேர்ஸ்)',
        address: 'பழைய நகராட்சி ரோட்டரி அருகில், ஸ்ரீ விநாயகா ஆட்டோ ஒர்க்ஸ் பாடி ஷாப்.',
        gps: '12.9285° N, 79.6620° E',
        domain: 'oldtownspares.in'
      }
    ];
  } catch (e) {
    return [];
  }
};

const StaffTab: React.FC = () => {
    // Dynamic available shops
    const [availableShops, setAvailableShops] = useState<any[]>(getDefaultShops());
    // Staff logic matching TemperKing custom staff storage
    const [customStaffList, setCustomStaffList] = useState<any[]>([]);
    const [newStaffName, setNewStaffName] = useState<string>('');
    const [newStaffRole, setNewStaffRole] = useState<string>('Sales & Fitting Expert');
    const [newStaffShopId, setNewStaffShopId] = useState<string>('shop-1');
    const [newStaffAvatar, setNewStaffAvatar] = useState<string>('👦');

    useEffect(() => {
        try {
            const saved = localStorage.getItem('temperking_custom_staff');
            if (saved) {
                setCustomStaffList(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load custom staff list", e);
        }

        // Keep shops updated dynamically
        const handleStorageChange = () => {
            setAvailableShops(getDefaultShops());
        };
        window.addEventListener('storage', handleStorageChange);
        const timer = setInterval(handleStorageChange, 2000);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(timer);
        };
    }, []);
    const saveStaffList = (list: any[]) => {
        setCustomStaffList(list);
        localStorage.setItem('temperking_custom_staff', JSON.stringify(list));
    };

    const handleAddCustomerStaff = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newStaffName.trim()) {
            alert("தயவுசெய்து ஊழியரின் பெயரை உள்ளிடவும்! (Please enter staff name)");
            return;
        }
        const newStaff = {
            id: 'staff-' + Date.now(),
            name: newStaffName,
            role: newStaffRole,
            shopId: newStaffShopId,
            avatar: newStaffAvatar
        };
        const updated = [...customStaffList, newStaff];
        saveStaffList(updated);
        setNewStaffName('');
        alert(`வெற்றி! புதிய ஊழியர் "${newStaffName}" வெற்றிகரமாக சேர்க்கப்பட்டார்! 🎉`);
    };

    const handleDeleteCustomStaff = (staffId: string) => {
        if (confirm("இந்த ஊழியர் கணக்கை நிரந்தரமாக நீக்க விரும்புகிறீர்களா? (Delete this staff account?)")) {
            const updated = customStaffList.filter(s => s.id !== staffId);
            saveStaffList(updated);
            alert("ஊழியர் கணக்கு வெற்றிகரமாக நீக்கப்பட்டது!");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-4 text-left">
                <div className="flex items-center gap-2 mb-1">
                    <Shield className="text-slate-900" size={20} />
                    <h3 className="text-base font-black text-slate-900 uppercase">
                        கிளை கடை ஊழியர்கள் மேலாண்மை (Branch Staff Management)
                    </h3>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-bold">
                    நிறுவனத்தின் பல்வேறு TemperKing கிளைகளுக்கான பிரத்தியேக ஊழியர்களை இங்கே சேர்க்கலாம், ஒதுக்கீடு செய்யலாம் மற்றும் நீக்கலாம்.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
                {/* Left: Staff Addition Form */}
                <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <div className="space-y-1 mb-4">
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">CENTRAL ACTION DESK</span>
                            <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-1.5">
                                <PlusCircle size={14} className="text-slate-900 animate-pulse" />
                                <span>புதிய ஊழியர் சேர்க்கை (Hiring & Branches)</span>
                            </h3>
                        </div>

                        <form onSubmit={handleAddCustomerStaff} className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">ஊழியர் பெயர் (Staff Name):</label>
                                <input 
                                    type="text"
                                    placeholder="எ.கா: சரவணன் குமார் (Saravanan Kumar)"
                                    value={newStaffName}
                                    onChange={(e) => setNewStaffName(e.target.value)}
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 outline-none focus:border-slate-800 font-bold font-sans"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">பணி / பதவி (Role):</label>
                                    <select 
                                        value={newStaffRole}
                                        onChange={(e) => setNewStaffRole(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2.5 text-xs text-gray-800 font-bold outline-none focus:border-slate-800 text-[11px]"
                                    >
                                        <option value="Senior Shop Manager">Senior Shop Manager</option>
                                        <option value="Sales & Fitting Expert">Sales & Fitting Expert</option>
                                        <option value="Billing Executive & Cashier">Billing Executive & Cashier</option>
                                        <option value="Junior Glass Fitter">Junior Fitter</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">படம் / சின்னம் (Avatar):</label>
                                    <select 
                                        value={newStaffAvatar}
                                        onChange={(e) => setNewStaffAvatar(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-2.5 text-xs text-gray-800 font-bold outline-none focus:border-slate-800 text-[11px]"
                                    >
                                        <option value="👦">👦 Boy Face</option>
                                        <option value="👧">👧 Girl Face</option>
                                        <option value="🧔">🧔 Bearded Man</option>
                                        <option value="🛡️">🛡️ Shield Fitter</option>
                                        <option value="💼">💼 Store Executive</option>
                                        <option value="🌟">🌟 Star Agent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">நியமிக்கப்படும் கிளை (Assign to Branch):</label>
                                <select
                                    value={newStaffShopId}
                                    onChange={(e) => setNewStaffShopId(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-800 text-[11px] font-bold"
                                >
                                    {availableShops.map((sh) => (
                                        <option key={sh.id} value={sh.id} className="text-gray-800">
                                            {sh.displayName.split(' (')[0]}
                                        </option>
                                    ))}
                                </select>
                                <span className="text-[10px] text-gray-400 mt-2 block leading-normal">
                                    💡 <b>குறிப்பு:</b> இந்த ஊழியர் லாகின் செய்த உடன் அவருக்கு நியமிக்கப்பட்ட கடை மட்டுமே வாடிக்கையாளர் பக்கத்தில் திறக்கப்படும்!
                                </span>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow active:scale-95 transition-all text-center"
                            >
                                <Plus size={13} />
                                <span>புதிய ஊழியரை நியமி (Hire Staff)</span>
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right: Staff Directory List */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                        <div className="space-y-1 mb-4 flex items-center justify-between">
                            <div>
                                <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">TRUSTSPARES EMPLOYEE NETWORK</span>
                                <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-1.5">
                                    <Database size={14} className="text-slate-900" />
                                    <span>தற்போது பணிபுரியும் ஊழியர்கள் பட்டியல் ({customStaffList.length})</span>
                                </h3>
                            </div>
                        </div>

                        <div className="bg-gray-50/50 rounded-2xl overflow-hidden border border-gray-100">
                            {customStaffList.length === 0 ? (
                                <div className="p-10 text-center text-gray-500 space-y-2">
                                    <span className="text-3xl block">📋</span>
                                    <p className="text-[11px] font-bold leading-relaxed">
                                        தற்போது கூடுதல் ஊழியர்கள் யாரும் பதிவு செய்யப்படவில்லை!<br/>
                                        இடது பக்கத்தில் உள்ள படிவத்தைப் பயன்படுத்தி புதிய ஊழியரைச் சேர்க்கவும்.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {customStaffList.map((cst) => {
                                        const associatedShop = availableShops.find(sh => sh.id === cst.shopId);
                                        return (
                                            <div key={cst.id} className="p-4 flex items-center justify-between gap-3 text-left hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                                                        {cst.avatar || '👦'}
                                                    </span>
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <h4 className="text-xs font-black text-slate-850 font-sans">{cst.name}</h4>
                                                            <span className="text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-[#a855f7]/10 text-purple-700 border border-purple-500/10 shrink-0 font-sans">Custom</span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 mt-0.5 font-sans">
                                                            <Award size={10} className="text-gray-405" />
                                                            <span>{cst.role}</span>
                                                            <span className="text-gray-300">•</span>
                                                            <span className="text-slate-650">{associatedShop ? associatedShop.displayName.split(' (')[0] : 'Unknown shop'}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteCustomStaff(cst.id)}
                                                    className="p-2 border border-red-100 hover:border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                                                    title="விற்பனையாளரை நீக்கு"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffTab;
