import React, { useState, useEffect } from 'react';
import { 
  Plus, Store, Trash2, Globe, ShieldCheck, MapPin, Layers, 
  Map, Layout, Rocket, Settings, CheckCircle, Smartphone, 
  Tv, Eye, ShoppingCart, Award, ArrowUpRight, Users, PlusCircle, Database
} from 'lucide-react';

const INITIAL_SHOPS = [
  {
    id: 'shop-1',
    name: 'Arakkonam Junction Branch',
    displayName: 'TemperKing (அரக்கோணம் ரயில்வே ஜங்ஷன் கிளை)',
    address: 'அரக்கோணம் ரயில்வே ஜங்ஷன் ரவுண்டானா அருகில், டெம்பர் கிங் பிரத்யேக ஷோரூம்.',
    gps: '12.9249° N, 79.6688° E',
    domain: 'temperking.in',
    isEcommerce: true,
    isPosEnabled: true,
    isInventorySynced: true,
    themeColor: '#a855f7',
    layoutStyle: 'grid-modern'
  },
  {
    id: 'shop-2',
    name: 'Gandhi Road Electronics',
    displayName: 'TemperKing (காந்தி ரோடு கிளை - மொபைல் & டிவி)',
    address: 'காந்தி ரோடு முதன்மை சந்திப்பு, ஆஞ்சநேயர் கோவில் அருகில், TrustSpares எலக்ட்ரானிக்ஸ்.',
    gps: '12.9261° N, 79.6698° E',
    domain: 'gandhiroadspares.in',
    isEcommerce: true,
    isPosEnabled: true,
    isInventorySynced: true,
    themeColor: '#3b82f6',
    layoutStyle: 'bento-fluid'
  },
  {
    id: 'shop-3',
    name: 'Old Town Auto Garage',
    displayName: 'TrustSpares Auto (பழைய நகராட்சி அருகில் - பைக் ஸ்பேர்ஸ்)',
    address: 'பழைய நகராட்சி ரோட்டரி அருகில், ஸ்ரீ விநாயகா ஆட்டோ ஒர்க்ஸ் பாடி ஷாப்.',
    gps: '12.9285° N, 79.6620° E',
    domain: 'oldtownspares.in',
    isEcommerce: false,
    isPosEnabled: true,
    isInventorySynced: true,
    themeColor: '#ef4444',
    layoutStyle: 'list-compact'
  }
];

const StoreBuilderTab: React.FC = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [newShopName, setNewShopName] = useState<string>('');
  const [newShopAddress, setNewShopAddress] = useState<string>('');
  const [newShopGps, setNewShopGps] = useState<string>('12.9249° N, 79.6688° E');
  const [newShopDomain, setNewShopDomain] = useState<string>('');
  const [isEcommerce, setIsEcommerce] = useState<boolean>(true);
  const [isPosEnabled, setIsPosEnabled] = useState<boolean>(true);
  const [isInventorySynced, setIsInventorySynced] = useState<boolean>(true);
  const [themeColor, setThemeColor] = useState<string>('#a855f7');
  const [layoutStyle, setLayoutStyle] = useState<string>('grid-modern');
  const [activeStepTab, setActiveStepTab] = useState<'create' | 'overview' | 'roadmap' | 'staff'>('overview');

  // Staff Sub-tab Sync Logic matching Centralized Storage
  const [customStaffList, setCustomStaffList] = useState<any[]>([]);
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffRole, setNewStaffRole] = useState<string>('Sales & Fitting Expert');
  const [newStaffShopId, setNewStaffShopId] = useState<string>('shop-1');
  const [newStaffAvatar, setNewStaffAvatar] = useState<string>('👦');

  // Load is synced automatically
  useEffect(() => {
    try {
      const saved = localStorage.getItem('temperking_shops');
      if (saved) {
        setShops(JSON.parse(saved));
      } else {
        setShops(INITIAL_SHOPS);
        localStorage.setItem('temperking_shops', JSON.stringify(INITIAL_SHOPS));
      }

      // Also load custom staff
      const savedStaff = localStorage.getItem('temperking_custom_staff');
      if (savedStaff) {
        setCustomStaffList(JSON.parse(savedStaff));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveStaffList = (list: any[]) => {
    setCustomStaffList(list);
    localStorage.setItem('temperking_custom_staff', JSON.stringify(list));
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddCustomStaff = (e: React.FormEvent) => {
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

  const saveShops = (updated: any[]) => {
    setShops(updated);
    localStorage.setItem('temperking_shops', JSON.stringify(updated));
    // Trigger storage event so target components keep in sync
    window.dispatchEvent(new Event('storage'));
  };

  const handleCreateNewShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim()) {
      alert("தயவுசெய்து கடையின் பெயரை உள்ளிடவும்! (Please enter shop name)");
      return;
    }

    const cleanId = 'shop-' + Date.now();
    const cleanName = newShopName.replace(/\s+/g, '') + 'Branch';
    
    // Domain fallback mapping based on user choices
    const finalDomain = newShopDomain.trim() 
      ? newShopDomain.toLowerCase() 
      : `${newShopName.toLowerCase().replace(/\s+/g, '')}.in`;

    const newShop = {
      id: cleanId,
      name: cleanName,
      displayName: newShopName,
      address: newShopAddress || '📍 அரக்கோணம், தமிழ்நாடு.',
      gps: newShopGps || '12.9249° N, 79.6688° E',
      domain: finalDomain,
      isEcommerce,
      isPosEnabled,
      isInventorySynced,
      themeColor,
      layoutStyle
    };

    const updated = [...shops, newShop];
    saveShops(updated);

    // Reset Form
    setNewShopName('');
    setNewShopAddress('');
    setNewShopDomain('');
    setIsEcommerce(true);
    setIsPosEnabled(true);
    setIsInventorySynced(true);
    alert(`🎉 பிரம்மாண்ட வெற்றி! புதிய கிளை கவின்புற உருவாக்கப்பட்டு TrustSpares பேரமைப்பில் இணைக்கப்பட்டது!\n\nStore Name: ${newShopName}\nAccess Point: ${finalDomain}`);
    setActiveStepTab('overview');
  };

  const handleDeleteShop = (id: string, name: string) => {
    if (id === 'shop-1') {
      alert("தலைமை கடையான 'அரக்கோணம் ரயில்வே ஜங்ஷன்' கிளையை நீக்க முடியாது!");
      return;
    }
    if (confirm(`கடை "${name}" கிளையை நீக்க விரும்புகிறீர்களா? இதன் மூலம் இந்த கடையின் நேரடி சேவைகள் தற்காலிகமாக நிறுத்தப்படும்.`)) {
      const updated = shops.filter(sh => sh.id !== id);
      saveShops(updated);
      alert("கடை வெற்றிகரமாக நீக்கப்பட்டது!");
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Central Hub Title and Visual Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-10">
          <Layers size={140} className="text-white animate-pulse" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck size={12} />
            <span>TrustSpares Sovereign Cloud (விண்மீன் கட்டமைப்பு)</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            TRUSTSPARES MULTI-STORE CENTRAL CONTROL HUB
          </h2>
          <p className="text-xs text-gray-400 font-medium max-w-3xl leading-relaxed">
            அனைத்து கிளைக் கடைகளும் தங்களின் சொந்த மின்-வணிகம் (E-Commerce), நேரடி பில்லிங் பாயிண்ட் (Physical POS), மற்றும் இருப்புக் கணக்கு (Inventory Sales) அமைப்புகளுடன் தனித்தனியாக இயங்கும். ஆனால் அனைத்தும் <b>TrustSpares Admin Central Hub</b> மூலமாகத்தான் உருவாக்கப்படும், புதுப்பிக்கப்படும் மற்றும் மேலாண்மை செய்யப்படும்!
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex gap-2 mt-6 border-t border-white/5 pt-4">
          <button
            onClick={() => setActiveStepTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeStepTab === 'overview' ? 'bg-indigo-600 text-white shadow' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            🕹️ Network Engine Overview
          </button>
          <button
            onClick={() => setActiveStepTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeStepTab === 'create' ? 'bg-indigo-600 text-white shadow' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            🏪 Create Franchise Branch
          </button>
          <button
            onClick={() => setActiveStepTab('roadmap')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeStepTab === 'roadmap' ? 'bg-indigo-600 text-white shadow' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            🗺️ Multi-Branch Roadmap & design
          </button>
          <button
            onClick={() => setActiveStepTab('staff')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${activeStepTab === 'staff' ? 'bg-indigo-600 text-white shadow' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
          >
            👥 Branch Staff (ஊழியர்கள் சேர்க்கை)
          </button>
        </div>
      </div>

      {/* CORE DISPLAY SWITCH */}
      {activeStepTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Visual Interactive Diagram of Hub-And-Spoke */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Diagram Panel */}
            <div className="xl:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center flex flex-col justify-between shadow">
              <div className="space-y-1 text-left">
                <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase">System Topology</span>
                <h3 className="text-sm font-bold text-white uppercase">Sovereign Architecture Mode</h3>
                <p className="text-[10px] text-gray-400 font-bold leading-normal">
                  மத்திய தரவுத்தளம் (Central Unified DB) அனைத்து கிளைகளையும் உடனடியாக இணைத்துத் தருகிறது.
                </p>
              </div>

              {/* Graphic Topology */}
              <div className="my-8 relative select-none">
                <div className="mx-auto w-24 h-24 rounded-3xl bg-indigo-600 flex flex-col items-center justify-center border border-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.5)] outline outline-outline text-white p-2">
                  <span className="text-xs font-black tracking-widest font-sans">HUB</span>
                  <span className="text-[10px] uppercase font-bold text-indigo-200 mt-1">TrustSpares</span>
                  <span className="text-[9px] font-mono text-indigo-300 font-bold bg-indigo-950 px-1 py-0.5 rounded mt-2">Active Master</span>
                </div>

                {/* Connecting Spoke Lines */}
                <div className="flex justify-around items-center mt-8 relative">
                  <div className="w-px h-10 bg-gradient-to-b from-indigo-500 to-amber-500 absolute -top-8 left-1/4"></div>
                  <div className="w-px h-10 bg-gradient-to-b from-indigo-500 to-blue-500 absolute -top-8 left-1/2"></div>
                  <div className="w-px h-10 bg-gradient-to-b from-indigo-500 to-emerald-500 absolute -top-8 left-3/4"></div>

                  <div className="w-1/4 bg-amber-950/40 border border-amber-500/30 text-amber-300 p-2 rounded-xl text-center">
                    <span className="text-[10px] font-black uppercase font-sans">Branch 1</span>
                    <p className="text-[8px] font-bold text-gray-400 truncate">TemperKing</p>
                  </div>
                  <div className="w-1/4 bg-blue-950/40 border border-blue-500/30 text-blue-300 p-2 rounded-xl text-center">
                    <span className="text-[10px] font-black uppercase font-sans">Branch 2</span>
                    <p className="text-[8px] font-bold text-gray-400 truncate">Gandhi Rd</p>
                  </div>
                  <div className="w-1/4 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 p-2 rounded-xl text-center">
                    <span className="text-[10px] font-black uppercase font-sans">Branch 3</span>
                    <p className="text-[8px] font-bold text-gray-400 truncate">Old Town</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-left space-y-1">
                <span className="text-[8.5px] font-black text-[#a855f7] tracking-widest uppercase">Central Status</span>
                <p className="text-[9.5px] text-gray-300 font-bold leading-normal">
                  🚀 <b>உங்களுடைய அறிவுரை ஏற்கப்பட்டது:</b> தற்போதைய செயலில் உள்ள அனைத்து கிளைகளும் <b>Arakkonam</b> வட்டாரத்தை மையமாகக் கொண்டு அமைக்கப்பட்டுள்ளது. இனி நீங்கள் புதிய கிளைகள் உருவாக்கும்போது அவை இதே தரவுத்தளத்தில் சேகரிக்கப்பட்டு ஒவ்வொரு கிளைக்கும் தனித்தனி கடையாகவும் உலகிற்கு காட்சியளிக்கும்!
                </p>
              </div>
            </div>

            {/* Right List of Current Shops */}
            <div className="xl:col-span-8 space-y-4">
              <div className="flex justify-between items-center bg-white border border-gray-100 p-4 rounded-3xl shadow-sm">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">
                    செயலில் உள்ள கிளைகள் பட்டியல் (Active Franchise Outlets)
                  </h3>
                  <p className="text-[10px] text-gray-400 font-bold font-sans mt-0.5">
                    Total: {shops.length} live endpoints controlled by TrustSpares Admin
                  </p>
                </div>
                <button
                  onClick={() => setActiveStepTab('create')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-md"
                >
                  <Plus size={13} />
                  <span>கடை உருவாக்கு (Add Shop)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shops.map((sh) => (
                  <div 
                    key={sh.id}
                    className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4 hover:border-slate-350 transition relative overflow-hidden"
                    style={{ borderTop: `4px solid ${sh.themeColor || '#a855f7'}` }}
                  >
                    {/* Top Section */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-black text-slate-900 font-sans">{sh.displayName}</h4>
                          <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                            {sh.id}
                          </span>
                        </div>
                        <p className="text-[9px] text-[#2563eb] font-bold font-mono flex items-center gap-1">
                          <Globe size={11} />
                          <span>{sh.domain}</span>
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteShop(sh.id, sh.displayName)}
                        className="p-1.5 border border-red-50 hover:border-red-100 hover:bg-red-50 text-red-500 rounded-lg transition"
                        title="Delete this branch outlet"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {/* Features Matrix */}
                    <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-50 grid grid-cols-3 gap-2 text-center">
                      <div className="space-y-0.5">
                        <span className="text-[7.5px] font-black text-gray-400 uppercase tracking-widest block">Ecommerce</span>
                        <span className={`text-[9px] font-bold ${sh.isEcommerce !== false ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {sh.isEcommerce !== false ? '✅ Active' : '❌ Disabled'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[7.5px] font-black text-gray-400 uppercase tracking-widest block">Physical POS</span>
                        <span className={`text-[9px] font-bold ${sh.isPosEnabled !== false ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {sh.isPosEnabled !== false ? '✅ Active' : '❌ Disabled'}
                        </span>
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[7.5px] font-black text-gray-400 uppercase tracking-widest block">Inventory Sync</span>
                        <span className={`text-[9px] font-bold ${sh.isInventorySynced !== false ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {sh.isInventorySynced !== false ? '⚡ Automatic' : '❌ Manual'}
                        </span>
                      </div>
                    </div>

                    {/* Physical Details */}
                    <div className="space-y-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500 font-bold">
                      <p className="flex items-start gap-1.5 leading-relaxed">
                        <MapPin size={12} className="text-gray-400 shrink-0 mt-0.5" />
                        <span>Address: {sh.address}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Map size={12} className="text-gray-400 shrink-0" />
                        <span>GPS Hub Location: <b className="text-gray-700">{sh.gps}</b></span>
                      </p>
                    </div>

                    {/* Design theme color swatch visualizer */}
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        🎨 Theme Accent: 
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: sh.themeColor || '#a855f7' }}></span>
                        <span className="font-mono text-gray-600 text-[9px]">{sh.themeColor || '#a855f7'}</span>
                      </span>

                      <span className="uppercase text-[8.5px] text-slate-500 bg-slate-100 rounded px-1.5 py-0.5 font-bold">
                        Style: <b>{sh.layoutStyle || 'grid-modern'}</b>
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CREATE NEW FRANCHISE STEP */}
      {activeStepTab === 'create' && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm max-w-4xl mx-auto animate-in fade-in duration-300">
          <div className="space-y-1 mb-6">
            <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Franchise Builder</span>
            <h3 className="text-sm font-black text-slate-900 uppercase">
              புதிய கிளை கடை பதிவு படிவம் (New Branch Provisioning Protocol)
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed font-bold">
              புதிய கடைகளை உருவாக்கி அதற்குரிய தனிப்பட்ட நவீனம், பில்லிங் பாயிண்ட் மற்றும் மின்வழிவணிக முறைகளை உடனடியாக செயல்படுத்தவும்.
            </p>
          </div>

          <form onSubmit={handleCreateNewShop} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Field 1: Display Name */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">விற்பனையக பெயர் (Shop Branch Name):</label>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                  <Store size={18} className="text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: TrustSpares Madurai Smart Glass"
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    className="bg-transparent w-full outline-none text-xs font-bold text-gray-800 placeholder-gray-300"
                  />
                </div>
              </div>

              {/* Field 2: Custom Mapping Domain */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">சொந்த டொமைன் (Domain Mapping - Optional):</label>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                  <Globe size={18} className="text-gray-400" />
                  <input
                    type="text"
                    placeholder="எ.கா: maduraispares.in"
                    value={newShopDomain}
                    onChange={(e) => setNewShopDomain(e.target.value)}
                    className="bg-transparent w-full outline-none text-xs font-bold text-gray-800 placeholder-gray-300 font-mono"
                  />
                </div>
                <span className="text-[9px] text-gray-400 block font-medium leading-normal">
                  * விடப்படும் பட்சத்தில் தானாகவே <code>[shopname].in</code> என உருவாக்கப்படும்.
                </span>
              </div>

              {/* Field 3: GPS Coordinates */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">நிலவரைபடம் (GPS Coordinates):</label>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                  <MapPin size={18} className="text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: 12.9249° N, 79.6688° E"
                    value={newShopGps}
                    onChange={(e) => setNewShopGps(e.target.value)}
                    className="bg-transparent w-full outline-none text-xs font-bold text-gray-800 placeholder-gray-300 font-sans"
                  />
                </div>
              </div>

              {/* Field 4: Physical Address */}
              <div className="space-y-1.5">
                <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">முகவரி (Branch Physical Address):</label>
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: காந்தி சிலை ரவுண்டானா, மதுரை மெயின் ரோடு."
                    value={newShopAddress}
                    onChange={(e) => setNewShopAddress(e.target.value)}
                    className="bg-transparent w-full outline-none text-xs font-bold text-gray-800 placeholder-gray-300"
                  />
                </div>
              </div>

            </div>

            {/* Design Presets & Features Toggle */}
            <div className="border-t border-gray-100 pt-6">
              <span className="text-[10px] font-black text-indigo-600 block mb-4 uppercase tracking-wider">அமைப்பு & அம்சங்கள் மேலாண்மை (Structure & Features Switch)</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Ecommerce checkbox toggle */}
                <div 
                  onClick={() => setIsEcommerce(!isEcommerce)}
                  className={`p-4 border-2 rounded-2xl cursor-pointer transition flex items-start gap-3 select-none ${isEcommerce ? 'border-amber-400 bg-amber-50/10' : 'border-gray-200 bg-gray-50/30'}`}
                >
                  <ShoppingCart size={20} className={isEcommerce ? "text-amber-500 shrink-0 mt-0.5" : "text-gray-400 shrink-0 mt-0.5"} />
                  <div className="space-y-0.5">
                    <h5 className="text-[11px] font-black text-slate-800">E-Commerce Website</h5>
                    <p className="text-[9px] text-gray-400 font-bold leading-normal">
                      கிளையின் மின்-வணிக தளம் வாடிக்கையாளர் பார்வையிட ஆன்லைனில் வர வேண்டுமா.
                    </p>
                  </div>
                </div>

                {/* POS billing toggle */}
                <div 
                  onClick={() => setIsPosEnabled(!isPosEnabled)}
                  className={`p-4 border-2 rounded-2xl cursor-pointer transition flex items-start gap-3 select-none ${isPosEnabled ? 'border-blue-400 bg-blue-50/10' : 'border-gray-200 bg-gray-50/30'}`}
                >
                  <Smartphone size={20} className={isPosEnabled ? "text-blue-500 shrink-0 mt-0.5" : "text-gray-400 shrink-0 mt-0.5"} />
                  <div className="space-y-0.5">
                    <h5 className="text-[11px] font-black text-slate-800">Physical Store POS</h5>
                    <p className="text-[9px] text-gray-400 font-bold leading-normal">
                      கடை ஊழியர்களுக்கு நேரடி பில்லிங் செய்வதற்கான POS போர்டல் தேவைப்படுகிறதா.
                    </p>
                  </div>
                </div>

                {/* Inventory automatic sync toggle */}
                <div 
                  onClick={() => setIsInventorySynced(!isInventorySynced)}
                  className={`p-4 border-2 rounded-2xl cursor-pointer transition flex items-start gap-3 select-none ${isInventorySynced ? 'border-emerald-400 bg-emerald-50/10' : 'border-gray-200 bg-gray-50/30'}`}
                >
                  <Layers size={20} className={isInventorySynced ? "text-emerald-500 shrink-0 mt-0.5" : "text-gray-400 shrink-0 mt-0.5"} />
                  <div className="space-y-0.5">
                    <h5 className="text-[11px] font-black text-slate-800">Central Inventory Sync</h5>
                    <p className="text-[9px] text-gray-400 font-bold leading-normal">
                      விருப்ப தயாரிப்புகள் அனைத்தும் TrustSpares உடன் தானாகவே சமநிலையாக வேண்டுமா.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Accent Theme configuration */}
            <div className="border-t border-gray-100 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Theme Selection */}
                <div className="space-y-2">
                  <span className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">வண்ணத் தீம் தேர்வு (Homepage Color Accent):</span>
                  <div className="flex gap-3">
                    {[
                      { hex: '#a855f7', label: 'Indigo Purple' },
                      { hex: '#3b82f6', label: 'Ecom Blue' },
                      { hex: '#ef4444', label: 'Auto Red' },
                      { hex: '#10b981', label: 'Spares Green' },
                      { hex: '#f59e0b', label: 'Warm Orange' }
                    ].map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setThemeColor(col.hex)}
                        className={`w-10 h-10 rounded-full border-2 transition-all relative ${themeColor === col.hex ? 'border-slate-900 scale-110 shadow-md ring-2 ring-indigo-200' : 'border-gray-200 hover:scale-105'}`}
                        style={{ backgroundColor: col.hex }}
                        title={col.label}
                      >
                        {themeColor === col.hex && <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Homepage Layout Selector */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider">முகப்புப் பக்க வடிவமைப்பு (Homepage Custom Preset):</label>
                  <select
                    value={layoutStyle}
                    onChange={(e) => setLayoutStyle(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-slate-800 font-bold"
                  >
                    <option value="grid-modern">👑 Grid Modern (ஆடம்ஸன் மினિમலிஸ்ட் கிரிட்)</option>
                    <option value="bento-fluid">🍱 Bento Fluid Layout (பாக்ஸ் பில்ட்)</option>
                    <option value="list-compact">📋 List Compact (லைட் வெயிட் லிஸ்ட்)</option>
                  </select>
                </div>

              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow active:scale-95 transition-all text-center"
            >
              <Plus size={16} />
              <span>புதிய கிளையை உருவாக்கு & அட்மினில் இணை (Deploy New Franchise Branch)</span>
            </button>

          </form>
        </div>
      )}

      {/* DETAILED STRATEGIC ROADMAP FOR TRUSTSPARES EXPANSION */}
      {activeStepTab === 'roadmap' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl text-left space-y-8 animate-in zoom-in duration-300">
          
          <div className="border-b border-white/5 pb-4 space-y-1">
            <span className="text-[10px] font-black text-amber-400 tracking-widest uppercase">expansion blueprints</span>
            <h3 className="text-sm font-black text-white uppercase flex items-center gap-1.5">
              <Rocket size={15} className="text-amber-500 animate-bounce" />
              <span>TrustSpares Franchise Expansion Strategic Roadmap</span>
            </h3>
            <p className="text-xs text-gray-400 font-medium leading-relaxed">
              அரக்கோணத்தின் முதன்மை கிளை முதல் நாடு தழுவிய கிளைகள் வரை TrustSpares பிராண்டுடன் கைகோர்த்து இயங்கும் திட்டம்.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Phase 1 card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <span className="text-3xl">🎯</span>
              <div className="space-y-1">
                <span className="text-[8.5px] font-black text-amber-500 uppercase tracking-widest">Phase 1 (Completed)</span>
                <h4 className="text-xs font-bold text-white uppercase">The Founding Ground</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed font-bold">
                  <b>TrustSpares Admin</b> மையமாக உருவெடுப்பதுடன், முதல் கிளையாக <b>Arakkonam Junction Branch (TemperKing)</b> வெற்றிகரமாக நிறுவப்பட்டது.
                </p>
              </div>
              <div className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/20 inline-block">
                ✓ Live & Deployed
              </div>
            </div>

            {/* Phase 2 card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <span className="text-3xl">🏪</span>
              <div className="space-y-1">
                <span className="text-[8.5px] font-black text-[#a855f7] uppercase tracking-widest">Phase 2 (Active)</span>
                <h4 className="text-xs font-bold text-white uppercase">Local Domain mapping</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed font-bold">
                  தனித்தனி கடைகள் அல்லது பிற ஸ்பேர்ஸ் விற்பனையகங்களை எலக்ட்ரானிக்ஸ் மற்றும் ஆட்டோ கேரேஜாக இணைப்பதற்கான கட்டமைப்பு அமைவு.
                </p>
              </div>
              <div className="bg-purple-500/10 text-purple-400 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-purple-500/20 inline-block">
                ⚡ Scaling Now
              </div>
            </div>

            {/* Phase 3 card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <span className="text-3xl">👥</span>
              <div className="space-y-1">
                <span className="text-[8.5px] font-black text-blue-400 uppercase tracking-widest">Phase 3 (Next Up)</span>
                <h4 className="text-xs font-bold text-white uppercase">Staff Delegation Engine</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed font-bold">
                  அனைத்து கிளைகளுக்கும் பிரத்தியேக <b>Staff accounts</b> உருவாக்கி, பில்லிங் மற்றும் சில்லறை விற்பனையை அந்தந்த கிளைக்குள்ளேயே நெறிப்படுத்துவது.
                </p>
              </div>
              <div className="bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase px-2 py-0.5 rounded border border-blue-500/20 inline-block font-sans">
                ⚙️ In Production
              </div>
            </div>

            {/* Phase 4 card */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-3 relative overflow-hidden">
              <span className="text-3xl">📈</span>
              <div className="space-y-1">
                <span className="text-[8.5px] font-black text-emerald-500 uppercase tracking-widest">Phase 4 (Future Vision)</span>
                <h4 className="text-xs font-bold text-white uppercase">Omnichannel Enterprise</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed font-bold">
                  ஆயிரத்திற்கும் மேற்பட்ட சுயாதீன கிளைக் கடைகளை ஒரே அட்மின் கட்டுப்பாட்டின்கீழ் வைத்து, மெட்டீரியல் கொள்முதல் மற்றும் வர்த்தகத்தை ஒருங்கிணைத்தல்.
                </p>
              </div>
              <div className="bg-white/10 text-gray-300 text-[8px] font-black uppercase px-2 py-0.5 rounded inline-block font-sans">
                🔮 Long-term View
              </div>
            </div>

          </div>

          <div className="bg-gradient-to-r from-indigo-950 to-slate-900 border border-indigo-900/50 p-5 rounded-3xl space-y-3 text-left">
            <h4 className="text-xs font-black text-white uppercase flex items-center gap-1.5 font-sans">
              <CheckCircle size={14} className="text-indigo-400" />
              <span>அரக்கோணம் கிளைகளுக்கான பிரத்தியேக அட்மின் விதிகள் (Franchise Rules Check)</span>
            </h4>
            <ul className="space-y-2 text-[10.5px] text-gray-400 font-bold leading-relaxed list-disc list-inside">
              <li>விற்கப்படும் அனைத்து பொருட்களின் விபரமும் தானாகவே <b>TrustSpares</b> மைய சந்தை பகுதியில் உச்சிக்கு கொண்டு செல்லப்படும்.</li>
              <li>கிளையின் வாடிக்கையாளர் <b>TemperKing</b> வழியே பதிவு செய்யும்போது கடையின் GPS வரைபட லிங்க் துல்லியமாக அவர்களுக்கு அனுப்பப்படும்.</li>
              <li>பொருட்களைப் பதிவேற்றும் போதே குறிப்பிட்ட கிளையை மட்டுமே தேர்ந்தெடுக்க முடியும் இதனால் குழப்பங்கள் தவிர்க்கப்படுகிறது.</li>
            </ul>
          </div>
        </div>
      )}

      {activeStepTab === 'staff' && (
        <div className="space-y-6 animate-in fade-in duration-300 text-left">
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mb-4 text-left">
            <div className="flex items-center gap-2 mb-1">
              <Users className="text-slate-900" size={20} />
              <h3 className="text-base font-black text-slate-900 uppercase">
                கிளை கடை ஊழியர்கள் மேலாண்மை (Branch Staff Management Desk)
              </h3>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-bold">
              நிறுவனத்தின் பல்வேறு கிளைகளுக்கான பிரத்தியேக ஊழியர்களை இங்கே சேர்க்கலாம், குறிப்பிட்ட கடைக்கு ஒதுக்கீடு செய்யலாம் மற்றும் நீக்கலாம்.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            {/* Left: Staff Addition Form */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                <div className="space-y-1 mb-4">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#6366f1]">CENTRAL DESK</span>
                  <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-1.5 font-sans">
                    <PlusCircle size={14} className="text-slate-950 animate-pulse" />
                    <span>புதிய ஊழியர் சேர்க்கை (Hire Branch Staff)</span>
                  </h3>
                </div>

                <form onSubmit={handleAddCustomStaff} className="space-y-4">
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
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1">Avatar:</label>
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
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-indigo-600 mb-1">நியமிக்கப்படும் கிளை (Assign to Branch):</label>
                    <select
                      value={newStaffShopId}
                      onChange={(e) => setNewStaffShopId(e.target.value)}
                      className="w-full bg-gray-50 border border-indigo-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 outline-none focus:border-indigo-600 text-[11px] font-bold"
                    >
                      {shops.map((sh) => (
                        <option key={sh.id} value={sh.id} className="text-gray-800">
                          {sh.displayName.split(' (')[0]} ({sh.domain})
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-gray-400 mt-2 block leading-normal">
                      💡 <b>குறிப்பு:</b> புதிய கடைகளை "Create Franchise Branch" பகுதி வழியாக உடனுக்குடன் உருவாக்கலாம். அவை இங்கே தேர்வு செய்வதற்குத் தோன்றும்!
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow active:scale-95 transition-all text-center"
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
                    <span className="text-[10px] uppercase font-black tracking-widest text-[#6366f1]">TRUSTSPARES STAFF NETWORK</span>
                    <h3 className="text-sm font-bold text-slate-800 uppercase flex items-center gap-1.5 font-sans">
                      <Database size={14} className="text-indigo-600" />
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
                        const associatedShop = shops.find(sh => sh.id === cst.shopId);
                        return (
                          <div key={cst.id} className="p-4 flex items-center justify-between gap-3 text-left hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100 shrink-0 select-none">
                                {cst.avatar || '👦'}
                              </span>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <h4 className="text-xs font-black text-slate-850 font-sans">{cst.name}</h4>
                                  <span className="text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0 font-mono">Staff</span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 mt-0.5 font-sans">
                                  <Award size={10} className="text-indigo-400 shrink-0" />
                                  <span>{cst.role}</span>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-slate-650">{associatedShop ? associatedShop.displayName.split(' (')[0] : 'Unknown Branch'}</span>
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
      )}

    </div>
  );
};

export default StoreBuilderTab;
