
import React, { ReactNode, useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, User, ShieldCheck, Wallet, X, LayoutDashboard, FileLock, ScrollText, Search, Bell, LogIn, Store, LogOut, Plus, Share2, Package, ShoppingBag, Download, Users, PlusCircle, ClipboardList } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { LEGAL_TEXTS } from '../features/profile/profileConstants';
import CloudflareBadge from './CloudflareBadge';
import { handleShareApp } from '../features/profile/profileConstants';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentUser, logout, searchQuery, setSearchQuery, notifications, markNotificationsRead } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<{title: string, content: string} | null>(null);
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  const isActive = (path: string) => location.pathname === path ? 'text-blue-600 font-bold' : 'text-gray-400 font-medium';
  const isDesktopActive = (path: string) => location.pathname === path ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white';

  const isSellerPage = location.pathname.startsWith('/seller/');
  const isLoginPage = location.pathname === '/login';
  const isMinimalLayout = isSellerPage || isLoginPage;

  const userNotifications = notifications.filter(n => n.userId === currentUser?.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const unreadCount = userNotifications.filter(n => !n.read).length;

  const userLang = currentUser?.language || 'ENGLISH';
  const legalContent = LEGAL_TEXTS[userLang] || LEGAL_TEXTS['ENGLISH'];

  const isAdmin = currentUser?.isAdmin === true;
  
  // Safe Avatar URL to prevent src="" errors
  const avatarUrl = currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id || 'guest'}`;

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    setIsMenuOpen(false);
  };

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

  const handleOpenNotifs = () => {
      setIsNotifOpen(!isNotifOpen);
      if (!isNotifOpen && unreadCount > 0) {
          markNotificationsRead();
      }
  };

  const desktopNavItems = [
      { label: 'Home', icon: Home, path: '/' },
  ];

  if (currentUser) {
      desktopNavItems.push({ label: 'My Orders', icon: Package, path: '/orders' });
      desktopNavItems.push({ label: 'Wallet', icon: Wallet, path: '/wallet' });
      desktopNavItems.push({ label: 'Profile', icon: User, path: '/profile' });
  }

  if (isAdmin) {
      desktopNavItems.push({ label: 'Inventory', icon: ClipboardList, path: '/inventory' });
      desktopNavItems.push({ label: 'Admin Panel', icon: LayoutDashboard, path: '/admin' });
      desktopNavItems.push({ label: 'Manage Store', icon: Store, path: '/shop' });
  }

  const baseItems = [
      { label: 'Home', icon: Home, path: '/' },
      { label: 'Orders', icon: Package, path: '/orders' },
  ];

  // ONLY SHOW INVENTORY BUTTON IF ADMIN
  const middleItem = isAdmin 
      ? { label: 'Log', icon: ClipboardList, path: '/inventory', highlight: true } 
      : { label: 'Wallet', icon: Wallet, path: '/wallet' }; // Normal user sees Wallet

  // ONLY SHOW STOCK IF ADMIN
  const endItems = isAdmin
      ? [{ label: 'Stock', icon: Store, path: '/shop' }, { label: 'Wallet', icon: Wallet, path: '/wallet' }]
      : [{ label: 'Profile', icon: User, path: '/profile' }];

  const mobileFooterItems = [...baseItems, middleItem, ...endItems];

  const NotificationDropdown = () => (
      <div className="absolute right-0 top-14 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-3 bg-gray-50 border-b flex justify-between items-center">
            <h4 className="font-bold text-xs uppercase text-gray-500">Notifications</h4>
            <button onClick={() => setIsNotifOpen(false)}><X size={16} className="text-gray-400"/></button>
        </div>
        <div className="max-h-80 overflow-y-auto">
            {userNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">No notifications</div>
            ) : (
                userNotifications.map(n => (
                    <div key={n.id} className={`p-4 border-b border-gray-50 ${!n.read ? 'bg-blue-50/50' : ''}`}>
                        <p className="text-sm font-bold text-gray-800 mb-0.5">{n.title}</p>
                        <p className="text-xs text-gray-500">{n.message}</p>
                        <p className="text-[9px] text-gray-400 mt-2 text-right">{new Date(n.date).toLocaleTimeString()}</p>
                    </div>
                ))
            )}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {activePolicy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                  <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                      <h3 className="font-bold flex items-center gap-2"><ShieldCheck size={18} className="text-blue-400"/> {activePolicy.title}</h3>
                      <button onClick={() => setActivePolicy(null)} className="p-1 hover:bg-white/10 rounded-lg"><X size={20}/></button>
                  </div>
                  <div className="p-6">
                      <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                          {activePolicy.content}
                      </div>
                      <button onClick={() => setActivePolicy(null)} className="w-full mt-6 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg">I Understand</button>
                  </div>
              </div>
          </div>
      )}

      {!isMinimalLayout && (
          <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col sticky top-0 h-screen overflow-y-auto shrink-0 z-50">
              <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                  <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                      <div className="bg-blue-600 p-1.5 rounded-lg"><ShieldCheck className="w-6 h-6 text-white" /></div>
                      <div>
                          <h1 className="text-xl font-bold tracking-tight">TrustSpares</h1>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{currentUser?.industry || 'Technician'} Market</p>
                      </div>
                  </Link>
              </div>

              <nav className="flex-1 p-4 space-y-2">
                  {desktopNavItems.map((item) => (
                      <Link key={item.label} to={item.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isDesktopActive(item.path)}`}>
                          <item.icon size={20} />
                          <span className="text-sm">{item.label}</span>
                      </Link>
                  ))}
                  {!currentUser && (
                      <Link to="/login" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                          <LogIn size={20} />
                          <span className="text-sm">Login / Signup</span>
                      </Link>
                  )}
              </nav>

              <div className="p-4 border-t border-slate-800 space-y-2">
                 <CloudflareBadge />
                 <p className="text-[10px] font-bold text-slate-500 uppercase px-2 mb-2">Compliance & Support</p>
                 <button onClick={() => setActivePolicy(legalContent.REFUND)} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded transition text-left"><FileLock size={14}/> Refund Policy</button>
                 <button onClick={() => setActivePolicy(legalContent.TERMS)} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded transition text-left"><ScrollText size={14}/> Terms of Service</button>
                 {currentUser && (
                     <button onClick={handleLogout} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-red-400 hover:text-white hover:bg-red-900/30 rounded transition text-left mt-2">
                        <LogOut size={14}/> Log Out
                     </button>
                 )}
              </div>
          </aside>
      )}

      <div className="flex-1 flex flex-col min-h-screen relative w-full">
        
        {!isMinimalLayout && (
            <header className="hidden md:flex justify-between items-center px-8 py-5 bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
                <div className="flex-1 max-w-lg relative">
                     <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                     <input
                        type="text"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
                     />
                </div>
                <div className="flex items-center gap-4">
                     {isAdmin && (
                         <Link 
                            to="/inventory" 
                            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-100 text-sm"
                         >
                            <ClipboardList size={18} /> Inventory
                         </Link>
                     )}

                     {currentUser && (
                        <div className="relative">
                            <button onClick={handleOpenNotifs} className="p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 border border-gray-200 relative transition">
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>
                            {isNotifOpen && <NotificationDropdown />}
                        </div>
                     )}

                     {currentUser ? (
                         <Link to="/profile" className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition">
                             <img src={avatarUrl} className="w-9 h-9 rounded-full border border-gray-200 object-cover" />
                             <div className="text-left">
                                 <p className="text-sm font-bold text-gray-900 leading-none">{currentUser.name}</p>
                                 <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{currentUser.industry}</p>
                             </div>
                         </Link>
                     ) : (
                        <Link to="/login" className="text-sm font-bold text-gray-600 hover:text-slate-900 border border-gray-200 px-4 py-2 rounded-xl">
                            Login / Signup
                        </Link>
                     )}
                </div>
            </header>
        )}

        {!isMinimalLayout && (
            <header 
                className="bg-white px-4 pb-4 shadow-sm sticky top-0 z-40 flex justify-between items-center md:hidden relative transition-all duration-200"
                style={{ paddingTop: 'max(1rem, calc(env(safe-area-inset-top) + 1rem))' }}
            >
                {isMenuOpen && (
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsMenuOpen(false)}
                    ></div>
                )}

                {isSearchOpen ? (
                    <div className="flex-1 flex items-center gap-2 w-full">
                        <div className="relative flex-1">
                            <input autoFocus type="text" placeholder="Search..." className="w-full pl-10 pr-3 py-3 bg-gray-100 rounded-full text-base outline-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                            <Search size={20} className="absolute left-3 top-3 text-gray-400" />
                        </div>
                        <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="p-2 bg-gray-100 rounded-full"><X size={20} /></button>
                    </div>
                ) : (
                    <>
                        <Link to="/" className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-lg"><ShieldCheck className="w-6 h-6 text-white" /></div>
                            <h1 className="text-xl font-bold text-gray-800">TrustSpares</h1>
                        </Link>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsSearchOpen(true)} className="p-2.5 text-gray-600 bg-gray-50 rounded-full border border-gray-100"><Search size={22} /></button>
                            
                            {currentUser ? (
                                <>
                                    <div className="relative">
                                        <button onClick={handleOpenNotifs} className="p-2.5 text-gray-600 bg-gray-50 rounded-full border border-gray-100 relative">
                                            <Bell size={22} />
                                            {unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </span>
                                            )}
                                        </button>
                                        {isNotifOpen && <NotificationDropdown />}
                                    </div>

                                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center bg-gray-50 border border-gray-200 rounded-full p-1 relative z-50">
                                        <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                                    </button>
                                    
                                    {isMenuOpen && (
                                        <div className="absolute right-4 top-20 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                            
                                            <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                                                <p className="text-sm font-bold text-gray-900 truncate">{currentUser.shopName || currentUser.name}</p>
                                                <p className="text-[10px] text-gray-500 uppercase font-bold">{currentUser.industry}</p>
                                            </div>

                                            <div className="p-2 space-y-1">
                                                <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                                    <Package size={18} /> My Orders
                                                </Link>
                                                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                                    <User size={18} /> Profile
                                                </Link>

                                                {/* NOTIFICATION OPTION IN DROPDOWN */}
                                                <button 
                                                    onClick={() => { setIsMenuOpen(false); handleOpenNotifs(); }} 
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors text-left"
                                                >
                                                    <Bell size={18} /> Notifications
                                                    {unreadCount > 0 && (
                                                        <span className="ml-auto bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                                            {unreadCount}
                                                        </span>
                                                    )}
                                                </button>

                                                {isAdmin && (
                                                    <>
                                                        <Link to="/inventory" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors">
                                                            <ClipboardList size={18} /> Inventory Log
                                                        </Link>
                                                        <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors">
                                                            <LayoutDashboard size={18} /> Admin Panel
                                                        </Link>
                                                        <Link to="/shop" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                                            <Store size={18} /> Manage Stock
                                                        </Link>
                                                    </>
                                                )}
                                                
                                                <div className="border-t border-gray-50 my-1"></div>
                                                
                                                {deferredPrompt && (
                                                  <button 
                                                      onClick={handleInstallClick}
                                                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-green-600 hover:bg-green-50 transition-colors"
                                                  >
                                                      <Download size={18} />
                                                      Install App
                                                  </button>
                                                )}

                                                <button 
                                                    onClick={() => { handleShareApp(); setIsMenuOpen(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-pink-600 hover:bg-pink-50 transition-colors"
                                                >
                                                    <Share2 size={18} />
                                                    Share App
                                                </button>
                                            </div>

                                            <div className="p-2 border-t border-gray-50">
                                                <button 
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut size={18} />
                                                    Logout
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                 <Link to="/login" className="bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                                     Login
                                 </Link>
                            )}
                        </div>
                    </>
                )}
            </header>
        )}

        <main className="flex-1 p-0 md:p-8">
            <div className={`mx-auto w-full ${isMinimalLayout ? '' : 'md:max-w-5xl p-4 md:p-0'}`}>
                {children}
            </div>
            
            {!isMinimalLayout && (
                <div className="md:hidden mt-12 mb-24 px-4 text-center space-y-4">
                    <CloudflareBadge />
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <button onClick={() => setActivePolicy(legalContent.REFUND)}>Refund Policy</button>
                        <span className="text-gray-200">•</span>
                        <button onClick={() => setActivePolicy(legalContent.TERMS)}>Terms of Use</button>
                    </div>
                </div>
            )}
        </main>

        {!isMinimalLayout && (
            <div className="fixed bottom-0 left-0 w-full z-30 md:hidden bg-white border-t border-gray-100 flex justify-around items-end px-2 py-2 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                {mobileFooterItems.map((item: any) => {
                    const currentPath = location.pathname;
                    let isTabActive = false;

                    if (item.path === '/') {
                        isTabActive = currentPath === '/';
                    } else {
                        if (currentPath.startsWith(item.path)) {
                            isTabActive = true;
                        }
                        else if (!currentUser && currentPath === '/login') {
                             const fromPath = (location.state as any)?.from?.pathname;
                             if (fromPath && fromPath.startsWith(item.path)) {
                                 isTabActive = true;
                             }
                        }
                    }
                    
                    return (
                        <Link 
                            key={item.label} 
                            to={!currentUser && item.path !== '/' ? '/login' : item.path} 
                            state={!currentUser && item.path !== '/' ? { from: { pathname: item.path } } : undefined}
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                            className={`flex flex-col items-center justify-center w-full gap-0.5 pb-1 transition-colors duration-200 focus:outline-none ${isTabActive ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <item.icon 
                                size={24} 
                                strokeWidth={isTabActive ? 2.5 : 2}
                                className={isTabActive ? "text-blue-600" : "text-gray-400"}
                                fill={isTabActive ? "#DBEAFE" : "none"} 
                            />
                            <span className={`text-[10px] ${isTabActive ? 'font-bold' : 'font-medium'}`}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
