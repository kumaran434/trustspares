
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { CircleCheck, ArrowLeft, ChevronRight, LogOut, ShieldCheck, X, MessageSquare, Phone, Mail, MapPin, Globe, Pencil, Save, Building2, Store, CircleAlert, Smartphone, Camera, Loader2, Image as ImageIcon, Landmark, Moon, Bell, Settings, ArrowRight, QrCode, Download, BadgeCheck, Wrench, Crosshair, CheckCircle2 } from 'lucide-react';
import { PROFILE_MENU_ITEMS, PROFILE_TEXT, LEGAL_TEXTS, CONTACT_INFO } from './profileConstants';
import { AppLanguage, UserRole } from '../../types';
import { processImageForUpload, uploadImageToFirebase } from '../../services/imageService';
import SEO from '../../components/SEO';
import QRCode from 'react-qr-code';

import LocationPicker from '../../components/LocationPicker';

const Profile: React.FC = () => {
  const { currentUser, logout, setAppLanguage, updateUserProfile, toggleTheme, toggleNotifications, requestNotificationPermission, platformSettings } = useApp();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'MAIN' | 'SETTINGS' | 'HELP' | 'LANGUAGE' | 'BANK'>('MAIN');
  const [activePolicy, setActivePolicy] = useState<{title: string, content: string} | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showLoyaltyModal, setShowLoyaltyModal] = useState(false);

  // Input Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit States
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editShop, setEditShop] = useState(currentUser?.shopName || '');
  const [editMobile, setEditMobile] = useState(currentUser?.mobile || '');
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');
  const [editLat, setEditLat] = useState<number | undefined>(currentUser?.latitude);
  const [editLng, setEditLng] = useState<number | undefined>(currentUser?.longitude);
  const [editMapsLink, setEditMapsLink] = useState(currentUser?.googleMapsLink || '');
  const [locationStatus, setLocationStatus] = useState<'IDLE' | 'FETCHING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [showFullScreenMap, setShowFullScreenMap] = useState(false);
  
  const [editAvatarBase64, setEditAvatarBase64] = useState<string | null>(null);

  const userLang = currentUser?.language || 'ENGLISH';
  const legalContent = LEGAL_TEXTS[userLang] || LEGAL_TEXTS['ENGLISH'];
  
  // Safe Avatar
  const avatarUrl = currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id || 'guest'}`;

  const handleLogout = async () => {
      try {
          await logout();
      } catch (error) {
          console.error("Logout failed:", error);
      } finally {
          localStorage.clear();
          window.location.href = '/login';
      }
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      try {
          const compressed = await processImageForUpload(file);
          setEditAvatarBase64(compressed);
      } catch (error) { alert("Error processing image"); }
  };

  const detectLocation = () => {
      if (!navigator.geolocation) {
          alert("Geolocation is not supported by your browser");
          return;
      }
      setLocationStatus('FETCHING');
      navigator.geolocation.getCurrentPosition(
          (position) => {
              setEditLat(position.coords.latitude);
              setEditLng(position.coords.longitude);
              setLocationStatus('SUCCESS');
          },
          (error) => {
              console.error(error);
              setLocationStatus('ERROR');
              alert("Unable to retrieve your location. Please enable GPS.");
          },
          { enableHighAccuracy: true }
      );
  };

  const saveProfile = async () => {
      if (!currentUser) return;
      setIsProcessing(true);
      try {
          let avatarUrl = currentUser.avatar;
          if (editAvatarBase64) {
             avatarUrl = await uploadImageToFirebase(editAvatarBase64, `avatars/${currentUser.id}/profile_${Date.now()}.jpg`);
          }
          await updateUserProfile(currentUser.id, {
              name: editName,
              shopName: editShop,
              mobile: editMobile,
              address: editAddress,
              latitude: editLat,
              longitude: editLng,
              googleMapsLink: editMapsLink,
              avatar: avatarUrl
          });
          setIsEditing(false);
          setEditAvatarBase64(null);
      } catch (error) { alert("Failed to save profile."); } finally { setIsProcessing(false); }
  };

  if (!currentUser) return <div className="p-20 text-center font-bold">Loading...</div>;

  const isTechnician = currentUser.kycVerified || currentUser.isAdmin;

  // REMOVE 'QR' FROM MENU ITEMS FOR NORMAL USERS
  const displayMenuItems = PROFILE_MENU_ITEMS.filter(item => item.id !== 'qr');

  return (
    <div className="space-y-6 pb-24">
      <SEO title="My Profile" description="Manage your TrustSpares account settings." />
      
      {activePolicy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                  <div className="bg-slate-900 p-5 flex justify-between items-center text-white">
                      <h3 className="font-bold text-sm uppercase tracking-tight">{activePolicy.title}</h3>
                      <button onClick={() => setActivePolicy(null)} className="p-1 hover:bg-white/10 rounded-lg"><X size={20}/></button>
                  </div>
                  <div className="p-8 max-h-[60vh] overflow-y-auto bg-gray-50">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">{activePolicy.content}</p>
                  </div>
                  <div className="p-6 bg-white border-t">
                      <button onClick={() => setActivePolicy(null)} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl">I Understand</button>
                  </div>
              </div>
          </div>
      )}

      {isEditing && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white w-full max-w-md rounded-t-3xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] animate-in slide-in-from-bottom duration-500">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Edit Profile</h3>
                      <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="space-y-5">
                      <div className="flex flex-col items-center gap-2 mb-4">
                          <div className="relative group" onClick={() => fileInputRef.current?.click()}>
                              <div className="w-24 h-24 rounded-full border-4 border-blue-50 overflow-hidden shadow-md">
                                  <img src={editAvatarBase64 || avatarUrl} className="w-full h-full object-cover" />
                              </div>
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                  <Camera className="text-white" size={24} />
                              </div>
                          </div>
                          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Change Photo</span>
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarSelect} />
                      </div>
                      <div className="space-y-4">
                          <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Your Full Name</label>
                              <input type="text" className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 mt-1 font-bold text-gray-900 outline-none" value={editName} onChange={(e) => setEditName(e.target.value)} />
                          </div>
                          <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Shop Name (If Technician)</label>
                              <input type="text" className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 mt-1 font-bold text-gray-900 outline-none" value={editShop} onChange={(e) => setEditShop(e.target.value)} />
                          </div>
                          {/* NEW: ADDRESS & GPS INPUT */}
                          <div>
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Address</label>
                              <textarea 
                                rows={2}
                                className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 mt-1 font-bold text-gray-900 outline-none resize-none" 
                                value={editAddress} 
                                onChange={(e) => setEditAddress(e.target.value)} 
                                placeholder="Enter full address for delivery..."
                              />

                              <div className="mt-3">
                                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Google Maps Link (Recommended for Exact Location)</label>
                                  <input 
                                    type="text" 
                                    className="w-full bg-gray-50 p-3 rounded-xl border border-gray-200 mt-1 font-bold text-gray-900 outline-none text-xs" 
                                    value={editMapsLink} 
                                    onChange={(e) => setEditMapsLink(e.target.value)} 
                                    placeholder="Paste Google Maps URL (e.g. https://maps.app.goo.gl/...)" 
                                  />
                              </div>

                              <button 
                                onClick={detectLocation}
                                disabled={locationStatus === 'FETCHING'}
                                className={`mt-3 w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black border transition-colors ${locationStatus === 'SUCCESS' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'}`}
                              >
                                  {locationStatus === 'FETCHING' ? <Loader2 className="animate-spin" size={18}/> : (locationStatus === 'SUCCESS' ? <CheckCircle2 size={18}/> : <Crosshair size={18}/>)}
                                  {locationStatus === 'SUCCESS' ? 'Location Set Successfully' : '📍 Auto-Detect My Location (GPS)'}
                              </button>
                              
                              <div className="mt-3 text-center">
                                  <button 
                                    onClick={() => setShowFullScreenMap(true)}
                                    className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-center gap-1 w-full py-2"
                                  >
                                      <Globe size={14} /> Or pick location manually on map
                                  </button>
                              </div>

                              {editLat && editLng && (
                                  <p className="text-[10px] text-gray-500 font-mono text-center mt-2 bg-gray-100 py-1 rounded-md">
                                      Coords: {editLat.toFixed(5)}, {editLng.toFixed(5)}
                                  </p>
                              )}
                          </div>
                      </div>
                      <button onClick={saveProfile} disabled={isProcessing} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50">
                          {isProcessing ? <Loader2 className="animate-spin" /> : <><Save size={18}/> Save Changes</>}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Full Screen Map Modal */}
      {showFullScreenMap && (
          <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white shadow-sm z-10">
                  <h3 className="text-lg font-bold text-gray-900">Pick Location</h3>
                  <button onClick={() => setShowFullScreenMap(false)} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
              </div>
              <div className="flex-1 relative">
                  <LocationPicker 
                      latitude={editLat} 
                      longitude={editLng} 
                      onChange={(lat, lng) => {
                          setEditLat(lat);
                          setEditLng(lng);
                          setLocationStatus('SUCCESS');
                      }} 
                  />
              </div>
              <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-10">
                  <button 
                      onClick={() => setShowFullScreenMap(false)} 
                      className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95"
                  >
                      <CheckCircle2 size={18}/> Confirm Location
                  </button>
              </div>
          </div>
      )}

      <div className="flex items-center gap-3 mb-2 md:hidden">
            <button onClick={() => navigate('/')} className="p-2 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition">
                 <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">My Profile</h2>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Background Accent */}
        <div className={`absolute top-0 right-0 p-8 opacity-5 ${isTechnician ? 'text-blue-600' : 'text-slate-300'}`}>
            {isTechnician ? <Wrench size={120}/> : <Smartphone size={120}/>}
        </div>
        
        {/* FIX: Increased Z-Index to z-20 to ensure it is clickable above the profile info layer */}
        <button 
            onClick={() => setIsEditing(true)} 
            className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition z-20 shadow-sm border border-gray-200"
        >
            <Pencil size={18} />
        </button>
        
        <div className="flex items-center gap-5 relative z-10">
            <div className="w-20 h-20 rounded-full border-4 border-blue-50 overflow-hidden shadow-sm flex-shrink-0">
                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-black text-gray-900 truncate flex items-center gap-1">
                    {currentUser.shopName || currentUser.name}
                    {isTechnician && <BadgeCheck size={20} className="text-blue-600 fill-blue-50 shrink-0" />}
                </h2>
                {/* Display Address Snippet */}
                {currentUser.address && (
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-1 truncate">
                        <MapPin size={12} /> {currentUser.address}
                    </p>
                )}
                {currentUser.latitude && (
                    <p className="text-[9px] text-green-600 font-bold flex items-center gap-1 mt-0.5">
                        <Crosshair size={10}/> Live Location Set
                    </p>
                )}
                {currentUser.googleMapsLink && (
                    <p className="text-[9px] text-blue-600 font-bold flex items-center gap-1 mt-0.5">
                        <Globe size={10}/> Google Maps Link Set
                    </p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                    {isTechnician ? (
                        <span className="bg-blue-600 text-white text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider flex items-center gap-1 shadow-sm shadow-blue-100">
                             <ShieldCheck size={10}/> VERIFIED TECHNICIAN
                        </span>
                    ) : (
                        <span className="bg-slate-900 text-white text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider">
                            USER
                        </span>
                    )}
                    <span className="bg-slate-100 text-slate-500 text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-wider border border-slate-200">
                        {currentUser.industry || 'GENERAL'}
                    </span>
                </div>
            </div>
        </div>
      </div>

      {/* LOYALTY CARD BANNER */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-5 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-36 h-36 bg-white/10 rounded-full -mr-10 -mb-10 pointer-events-none"></div>
        <div className="absolute left-1/3 top-0 w-20 h-20 bg-white/5 rounded-full -mt-10 pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <span className="text-[9px] font-black tracking-widest uppercase bg-white/20 px-2 py-0.5 rounded-md inline-block">
              🎖️ போனஸ் லாயல்டி (Loyalty Bonus)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black">₹{currentUser.bonusPoints || 0}</span>
              <span className="text-[10px] font-bold opacity-90">போனஸ் பணம்</span>
            </div>
            <p className="text-[10px] opacity-90 font-medium max-w-[200px] leading-tight">
              ஒவ்வொரு பர்ச்சேஸுக்கும் ₹5 - ₹10 போனஸ் சேரும்! இதை நேரடி கடையில் கொடுத்து கழித்துக் கொள்ளலாம்.
            </p>
          </div>
          <button 
            onClick={() => setShowLoyaltyModal(true)}
            className="bg-white text-orange-600 hover:bg-orange-50 font-black text-[11px] px-3 py-2 rounded-xl transition flex items-center gap-1 shrink-0 shadow-sm active:scale-95 cursor-pointer"
          >
            <QrCode size={13} />
            கூப்பன் / QR
          </button>
        </div>
      </div>

      {/* LOYALTY CARD MODAL */}
      {showLoyaltyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-5 flex justify-between items-center text-white">
              <div className="flex items-center gap-2">
                <BadgeCheck size={18} />
                <h3 className="font-black text-sm uppercase tracking-wider">விற்பனை போனஸ் கணக்கு</h3>
              </div>
              <button onClick={() => setShowLoyaltyModal(false)} className="p-1 hover:bg-white/10 rounded-lg text-white cursor-pointer">
                <X size={20}/>
              </button>
            </div>
            
            <div className="p-6 text-center space-y-5 bg-white">
              <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-4 rounded-2xl border border-gray-200 flex flex-col items-center justify-center shadow-inner">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 mb-3 flex items-center justify-center">
                  <QRCode value={`TKLOYAL-${currentUser.id.toUpperCase()}`} size={140} />
                </div>
                <span className="text-[9px] font-bold text-gray-400">டிஜிட்டல் லாயல்டி ஐடி (Loyalty ID)</span>
                <span className="text-xs font-black text-slate-800 font-mono tracking-widest mt-0.5">
                  TK-LOYAL-{currentUser.id.substring(0, 8).toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between items-center bg-orange-50 p-4 rounded-2xl border border-orange-100">
                <div className="text-left">
                  <span className="text-[9px] text-orange-600 font-bold uppercase tracking-wider">சேமித்த போனஸ் மதிப்பு</span>
                  <p className="text-2xl font-black text-orange-700">₹{currentUser.bonusPoints || 0}</p>
                </div>
                <div className="bg-orange-500 text-white font-black text-[9px] uppercase tracking-wider px-2 py-1 rounded-lg">
                  ACTIVE
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl text-[10px] text-gray-600 leading-relaxed text-left border border-slate-100">
                <strong className="text-slate-800 block text-xs mb-1">💡 கடையை எவ்வாறு அணுகி மீட்கவேண்டும் (Shop Redeem):</strong>
                கடையில் நீங்கள் பொருட்களை வாங்கும்போது அல்லது டெம்பர் கிளாஸ் கம்பிகள் கம்பிகள் பொருத்தும்போது இந்த QR பார்கோடு காண்பித்தால், கடை ஊழியர்கள் உங்களது மொத்த பாயிண்ட் தொகையை கட்டணத்தில் இருந்து கழித்துக் கொள்வார்கள்!
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <button 
                onClick={() => setShowLoyaltyModal(false)} 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer active:scale-95"
              >
                சரி (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* NOTIFICATION TOGGLE */}
          <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 ${currentUser.notificationsEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} rounded-xl flex items-center justify-center`}>
                      <Bell size={20} />
                  </div>
                  <div className="text-left">
                      <h4 className="font-bold text-gray-900 text-sm">Notifications</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                          {currentUser.notificationsEnabled ? 'Active' : 'Enable to get updates'}
                      </p>
                  </div>
              </div>
              <button 
                onClick={toggleNotifications}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all ${currentUser.notificationsEnabled ? 'bg-green-100 text-green-700' : 'bg-slate-900 text-white shadow-lg'}`}
              >
                  {currentUser.notificationsEnabled ? 'ON' : 'Enable'}
              </button>
          </div>

          {displayMenuItems.map((item, index) => (
              <button 
                key={item.id} 
                onClick={() => {
                    if (item.action) item.action();
                    else if (item.id === 'bank') setActiveView('BANK');
                    else if (item.id === 'shipping-policy') setActivePolicy(legalContent.SHIPPING);
                    else if (item.id === 'refund-policy') setActivePolicy(legalContent.REFUND);
                    else if (item.id === 'terms') setActivePolicy(legalContent.TERMS);
                    else if (item.id === 'help') setActiveView('HELP');
                }}
                className={`w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${index !== displayMenuItems.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                  <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 ${item.iconBg} ${item.iconColor} rounded-xl flex items-center justify-center`}>
                          <item.icon size={20} />
                      </div>
                      <div className="text-left">
                          <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">{item.subtitle}</p>
                      </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300" />
              </button>
          ))}
      </div>

      <button onClick={handleLogout} className="w-full bg-white p-4 rounded-2xl shadow-sm border border-red-100 text-red-600 font-bold flex items-center justify-between hover:bg-red-50 transition mt-4">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><LogOut size={20}/></div>
              <span>Log Out</span>
          </div>
          <ArrowRight size={18} />
      </button>

      <div className="text-center pt-4 pb-4 opacity-50">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{PROFILE_TEXT.VERSION}</p>
      </div>
    </div>
  );
};

export default Profile;
