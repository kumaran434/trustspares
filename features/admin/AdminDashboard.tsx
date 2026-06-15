
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { User } from '../../types';
import { ArrowLeft, X, User as UserIcon, Phone, MessageCircle, MapPin, Trash2, Eye, Search, Store, ImageIcon, ShieldCheck, BarChart3, Megaphone, Pencil, Save, RotateCcw, Settings, Package } from 'lucide-react';

// Import Tabs
import DashboardTab from './tabs/DashboardTab';
import FinanceTab from './tabs/FinanceTab';
import UsersTab from './tabs/UsersTab';
import DisputesTab from './tabs/DisputesTab';
import SettingsTab from './tabs/SettingsTab';
import KycTab from './tabs/KycTab';
import BulkGeneratorTab from './tabs/BulkGeneratorTab';
import BroadcastTab from './tabs/BroadcastTab';
import OrdersTab from './tabs/OrdersTab'; // NEW IMPORT
import StaffTab from './tabs/StaffTab';
import StoreBuilderTab from './tabs/StoreBuilderTab';

interface AdminDashboardProps {
    initialTab?: 'DASHBOARD' | 'PAYMENTS' | 'ORDERS' | 'USERS' | 'DISPUTES' | 'SETTINGS' | 'KYC' | 'AUTO_STOCK' | 'BROADCAST' | 'STAFF' | 'MULTI_STORE';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'DASHBOARD' }) => {
  const { deleteUser, updateUserProfile } = useApp();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Custom Modal State for User Deletion
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Edit User State
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editFormData, setEditFormData] = useState({
      name: '',
      shopName: '',
      mobile: '',
      address: ''
  });

  useEffect(() => { setActiveTab(initialTab); }, [initialTab]);
  useEffect(() => { window.scrollTo(0, 0); }, [activeTab]);

  // Reset edit state when user changes
  useEffect(() => {
      if (selectedUser) {
          setIsEditingUser(false);
          setEditFormData({
              name: selectedUser.name || '',
              shopName: selectedUser.shopName || '',
              mobile: selectedUser.mobile || '',
              address: selectedUser.address || ''
          });
      }
  }, [selectedUser]);

  const openWhatsApp = (mobile: string | undefined, msg: string) => {
      if (!mobile) return alert("No mobile number available");
      window.open(`https://wa.me/91${mobile}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleDeleteUser = async () => {
      if (!userToDelete) return;
      setIsDeletingUser(true);
      try {
          await deleteUser(userToDelete);
          alert("User Deleted");
          setSelectedUser(null);
          setUserToDelete(null);
      } catch (error) {
          alert("Failed to delete user.");
      } finally {
          setIsDeletingUser(false);
      }
  };

  const handleSaveUser = async () => {
      if (!selectedUser) return;
      try {
          await updateUserProfile(selectedUser.id, editFormData);
          // Update local state to reflect changes immediately in UI
          setSelectedUser({ ...selectedUser, ...editFormData });
          setIsEditingUser(false);
          alert("User profile updated successfully!");
      } catch (error) {
          alert("Failed to update user.");
      }
  };

  const userMobileRaw = isEditingUser ? editFormData.mobile : (selectedUser?.mobile || '');
  const displayUserMobile = userMobileRaw;

  return (
    <div className="space-y-6 pb-20">
      
      {previewImage && (
          <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setPreviewImage(null)}>
              <img src={previewImage} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in duration-300" alt="Preview"/>
              <button className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={24}/></button>
          </div>
      )}

      {selectedUser && (
          <div className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8 relative">
                  <div className="bg-slate-900 text-white p-6 flex justify-between items-start">
                      <div className="flex items-center gap-4">
                          <img src={selectedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.id}`} className="w-12 h-12 rounded-full border-2 border-slate-700 object-cover" />
                          <div>
                              <h3 className="text-xl font-black">{selectedUser.shopName || selectedUser.name || 'User Profile'}</h3>
                              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                  ID: {selectedUser.id ? selectedUser.id.substring(0,8) : 'N/A'}
                              </p>
                          </div>
                      </div>
                      <div className="flex gap-2">
                          {!isEditingUser ? (
                              <button onClick={() => setIsEditingUser(true)} className="p-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition shadow-lg shadow-blue-900/50">
                                  <Pencil size={18} className="text-white"/>
                              </button>
                          ) : (
                              <button onClick={() => setIsEditingUser(false)} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
                                  <RotateCcw size={18} className="text-white"/>
                              </button>
                          )}
                          <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-white/10 rounded-lg"><X size={18}/></button>
                      </div>
                  </div>

                  <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto bg-white">
                      
                      {selectedUser.shopImage && (
                          <div className="space-y-3">
                              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                  <ShieldCheck size={14} className="text-blue-600"/> Shop Proof Image
                              </h4>
                              <div 
                                onClick={() => setPreviewImage(selectedUser.shopImage!)}
                                className="w-full h-56 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-inner relative group cursor-zoom-in"
                              >
                                  <img src={selectedUser.shopImage || 'https://placehold.co/600x400?text=No+Shop+Image'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                                      <Eye size={32} />
                                      <span className="text-xs font-bold uppercase tracking-wider">Click for Full View</span>
                                  </div>
                              </div>
                          </div>
                      )}

                      <div className="space-y-3">
                          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><UserIcon size={14}/> Contact Details</h4>
                          
                          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 space-y-4">
                              {/* NAME */}
                              <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500 font-bold">Owner Name</span>
                                  {isEditingUser ? (
                                      <input 
                                        type="text" 
                                        className="bg-white border border-gray-200 rounded px-2 py-1 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 w-40"
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                                      />
                                  ) : (
                                      <span className="text-sm font-black text-slate-900">{selectedUser.name || 'Unknown'}</span>
                                  )}
                              </div>

                              {/* SHOP NAME */}
                              <div className="flex justify-between items-center border-t border-gray-200 pt-3">
                                  <span className="text-xs text-gray-500 font-bold">Shop Name</span>
                                  {isEditingUser ? (
                                      <input 
                                        type="text" 
                                        className="bg-white border border-gray-200 rounded px-2 py-1 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 w-40"
                                        value={editFormData.shopName}
                                        onChange={(e) => setEditFormData({...editFormData, shopName: e.target.value})}
                                      />
                                  ) : (
                                      <span className="text-sm font-black text-slate-900">{selectedUser.shopName || '-'}</span>
                                  )}
                              </div>

                              <div className="border-t border-gray-200"></div>
                              
                              {/* MOBILE */}
                              <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-500 font-bold">WhatsApp No</span>
                                  {isEditingUser ? (
                                      <input 
                                        type="text" 
                                        className="bg-white border border-gray-200 rounded px-2 py-1 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 w-40"
                                        value={editFormData.mobile}
                                        onChange={(e) => setEditFormData({...editFormData, mobile: e.target.value})}
                                      />
                                  ) : (
                                      displayUserMobile ? (
                                          <div className="flex items-center gap-2">
                                              <a href={`tel:${displayUserMobile}`} className="bg-white border border-gray-200 px-3 py-1.5 rounded-xl text-sm font-bold text-gray-900 font-mono tracking-wider shadow-sm hover:border-blue-400 flex items-center gap-2"><Phone size={14} className="text-blue-600"/>{displayUserMobile}</a>
                                              <button onClick={() => openWhatsApp(displayUserMobile, "Hello from Admin")} className="p-2.5 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition"><MessageCircle size={20}/></button>
                                          </div>
                                      ) : <span className="text-[10px] font-bold text-gray-400 italic bg-white px-2 py-1 rounded border border-gray-100">Not Provided</span>
                                  )}
                              </div>

                              {/* ADDRESS */}
                              <div className="border-t border-gray-200 pt-3">
                                  <span className="text-xs text-gray-500 font-bold block mb-2 uppercase tracking-tight">Full Address</span>
                                  {isEditingUser ? (
                                      <textarea 
                                        rows={3}
                                        className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                                        value={editFormData.address}
                                        onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                                      />
                                  ) : (
                                      selectedUser.address ? (
                                          <p className="text-xs font-bold text-slate-700 bg-white p-4 rounded-xl border border-gray-200 leading-relaxed shadow-sm"><MapPin size={12} className="inline mr-1 text-red-500"/>{selectedUser.address}</p>
                                      ) : <p className="text-xs italic text-gray-400">No address set</p>
                                  )}
                              </div>
                          </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t">
                          {isEditingUser ? (
                              <button onClick={handleSaveUser} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 hover:bg-green-700 transition active:scale-95">
                                  <Save size={18}/> Save Changes
                              </button>
                          ) : (
                              <button onClick={() => setUserToDelete(selectedUser.id)} className="text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-xl transition ml-auto">
                                  <Trash2 size={16}/> Delete User
                              </button>
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Custom Confirmation Modal for User Deletion */}
      {userToDelete && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4 mx-auto">
                      <Trash2 className="text-red-600" size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-center text-gray-900 mb-2">Delete User?</h3>
                  <p className="text-sm text-center text-gray-500 mb-6">
                      Are you sure you want to permanently delete this user? This action cannot be undone.
                  </p>
                  <div className="flex gap-3">
                      <button 
                          onClick={() => setUserToDelete(null)}
                          disabled={isDeletingUser}
                          className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleDeleteUser}
                          disabled={isDeletingUser}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                          {isDeletingUser ? 'Deleting...' : 'Delete'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
               <button onClick={() => navigate('/')} className="p-2.5 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition"><ArrowLeft size={20}/></button>
               <div>
                   <h2 className="text-2xl font-black text-slate-900 tracking-tight">Admin Control</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Platform Management</p>
               </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide md:pb-0">
              {[
                  { id: 'DASHBOARD', label: 'Overview' },
                  { id: 'MULTI_STORE', label: '🏪 Multi-Store Hub (கடை)' },
                  { id: 'STAFF', label: '👥 Branch Staff (ஊழியர்கள் சேர்க்கை)' },
                  { id: 'ORDERS', label: 'My Orders' }, // NEW TAB
                  { id: 'SETTINGS', label: 'Settings' }, 
                  { id: 'PAYMENTS', label: 'Payments' },
                  { id: 'BROADCAST', label: 'Broadcast' },
                  { id: 'KYC', label: 'Verifications' },
                  { id: 'USERS', label: 'Technicians' },
                  { id: 'AUTO_STOCK', label: 'Auto Stock' }, 
                  { id: 'DISPUTES', label: 'Disputes' },
              ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-5 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-gray-500 shadow-sm border border-gray-100 hover:bg-gray-50'}`}>
                      {tab.label}
                  </button>
              ))}
          </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'DASHBOARD' && <DashboardTab setActiveTab={setActiveTab} />}
          {activeTab === 'MULTI_STORE' && <StoreBuilderTab />}
          {activeTab === 'ORDERS' && <OrdersTab />} {/* NEW TAB COMPONENT */}
          {activeTab === 'PAYMENTS' && <FinanceTab setSelectedUser={setSelectedUser} setPreviewImage={setPreviewImage} />}
          {activeTab === 'BROADCAST' && <BroadcastTab />}
          {activeTab === 'KYC' && <KycTab setSelectedUser={setSelectedUser} setPreviewImage={setPreviewImage} />}
          {activeTab === 'USERS' && <UsersTab setSelectedUser={setSelectedUser} />}
          {activeTab === 'STAFF' && <StaffTab />}
          {activeTab === 'AUTO_STOCK' && <BulkGeneratorTab />}
          {activeTab === 'DISPUTES' && <DisputesTab />}
          {activeTab === 'SETTINGS' && <SettingsTab />}
      </div>

    </div>
  );
};

export default AdminDashboard;
