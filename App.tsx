
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import { ShieldCheck } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './features/dashboard/Dashboard';
import CreateDeal from './features/deals/CreateDeal';
import DealDetails from './features/deals/DealDetails';
import Profile from './features/profile/Profile';
import Wallet from './features/wallet/Wallet';
import SellerCatalog from './features/deals/SellerCatalog';
import AdminDashboard from './features/admin/AdminDashboard';
import Auth from './features/auth/Auth';
import MyShop from './features/dashboard/MyShop';
import MyOrders from './features/dashboard/MyOrders';
import TechnicianOnboarding from './features/technician/TechnicianOnboarding'; // CHANGED IMPORT
import PostMaker from './features/tools/PostMaker';
import MagicStudio from './features/studio/MagicStudio';
import TemperKing from './features/dashboard/TemperKing';
import ScrollToTop from './components/ScrollToTop'; 
import InventoryTab from './features/admin/tabs/InventoryTab'; 
import { UserRole, DealStatus } from './types';

// Guard Component: Ensures User is Logged In
const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { currentUser, isAuthenticated, loading, authMessage } = useApp();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-50">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border border-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-6"></div>
                    {authMessage ? (
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-red-500">{authMessage}</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700"
                            >
                                Reload App
                            </button>
                            <button 
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.href = '/login';
                                }} 
                                className="w-full bg-white text-red-500 border border-red-100 font-bold py-3 rounded-xl text-sm hover:bg-red-50"
                            >
                                Force Logout
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 animate-pulse font-medium">Loading TrustSpares...</p>
                    )}
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !currentUser) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
};

// Guard Component: Ensures User is Admin (Or future Employee)
const RequireAdmin: React.FC<{ children: React.ReactElement }> = ({ children }) => {
    const { currentUser, logout, loading, authMessage } = useApp();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-50">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border border-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-6"></div>
                    {authMessage ? (
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-red-500">{authMessage}</p>
                            <button 
                                onClick={() => window.location.reload()} 
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl text-sm hover:bg-blue-700"
                            >
                                Reload App
                            </button>
                            <button 
                                onClick={() => {
                                    localStorage.clear();
                                    window.location.href = '/login';
                                }} 
                                className="w-full bg-white text-red-500 border border-red-100 font-bold py-3 rounded-xl text-sm hover:bg-red-50"
                            >
                                Force Logout
                            </button>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 animate-pulse font-medium">Loading Admin...</p>
                    )}
                </div>
            </div>
        );
    }
    
    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    // CHECK BOTH isAdmin AND role FOR ROBUSTNESS
    const hasAdminAccess = currentUser.isAdmin === true || currentUser.role === UserRole.ADMIN;

    if (!hasAdminAccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-gray-50">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full border border-gray-100">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck size={32} className="text-red-500" />
                    </div>
                    <h1 className="text-xl font-black text-slate-900 mb-2">Access Restricted</h1>
                    <p className="text-sm text-gray-500 mb-6 font-medium">
                        You are logged in as <span className="font-bold text-slate-900">{currentUser.email || currentUser.mobile || currentUser.name}</span>, but this account does not have Admin permissions.
                    </p>
                    <div className="space-y-3">
                        <button 
                            onClick={() => window.location.href = '/'} 
                            className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl text-sm"
                        >
                            Go to Homepage
                        </button>
                        <button 
                            onClick={async () => { 
                                try { await logout(); } catch (e) {} 
                                localStorage.clear(); 
                                window.location.href = '/login'; 
                            }}
                            className="w-full bg-white text-red-500 border border-red-100 font-bold py-3 rounded-xl text-sm hover:bg-red-50"
                        >
                            Logout & Try Different Account
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    return children;
};

import ErrorBoundary from './components/ErrorBoundary';

const AppContent: React.FC = () => {
    const { currentUser, deals, deleteDeal } = useApp();

    useEffect(() => {
        const deleteDrafts = async () => {
            if (currentUser?.isAdmin && deals.length > 0 && !localStorage.getItem('drafts_auto_deleted_v2')) {
                const drafts = deals.filter(d => d.status === DealStatus.DRAFT);
                if (drafts.length > 0) {
                    console.log(`Auto-deleting ${drafts.length} drafts...`);
                    for (const draft of drafts) {
                        try {
                            await deleteDeal(draft.id);
                        } catch (e) {
                            console.error("Failed to delete draft", draft.id, e);
                        }
                    }
                    console.log("All drafts deleted.");
                }
                localStorage.setItem('drafts_auto_deleted_v2', 'true');
            }
        };
        deleteDrafts();
    }, [currentUser, deals, deleteDeal]);

    return (
        <ErrorBoundary>
            <Layout>
              <ScrollToTop />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Dashboard />} />
                <Route path="/deal/:id" element={<DealDetails />} />
                <Route path="/seller/:userId" element={<SellerCatalog />} />
                <Route path="/login" element={<Auth />} />
                
                {/* Standard User Routes (Buying/Profile) */}
                <Route path="/orders" element={
                    <RequireAuth><MyOrders /></RequireAuth>
                } />
                <Route path="/wallet" element={
                    <RequireAuth><Wallet /></RequireAuth>
                } />
                <Route path="/profile" element={
                    <RequireAuth><Profile /></RequireAuth>
                } />
                
                {/* UPDATED ROUTE: Technician Verification */}
                <Route path="/technician-verification" element={
                    <RequireAuth><TechnicianOnboarding /></RequireAuth>
                } />
                {/* BACKWARD COMPAT: Redirect old onboarding route */}
                <Route path="/onboarding" element={<Navigate to="/technician-verification" replace />} />
                
                {/* ADMIN & INVENTORY ROUTES */}
                <Route path="/inventory" element={
                    <RequireAdmin>
                        <div className="p-4 md:p-0"><InventoryTab /></div>
                    </RequireAdmin>
                } />
                <Route path="/shop" element={
                    <RequireAdmin><MyShop /></RequireAdmin>
                } />
                
                {/* STRICT ADMIN-ONLY: Creating/Editing Deals */}
                <Route path="/create" element={
                    <RequireAdmin><CreateDeal /></RequireAdmin>
                } />
                <Route path="/edit-deal/:id" element={
                    <RequireAdmin><CreateDeal /></RequireAdmin>
                } />
                
                <Route path="/admin" element={
                    <RequireAdmin><AdminDashboard initialTab="DASHBOARD" /></RequireAdmin>
                } />
                <Route path="/admin/kyc" element={
                    <RequireAdmin><AdminDashboard initialTab="KYC" /></RequireAdmin>
                } />
                <Route path="/admin/disputes" element={
                    <RequireAdmin><AdminDashboard initialTab="DISPUTES" /></RequireAdmin>
                } />

                {/* Post Maker (Tools) - Accessible to everyone for sharing */}
                <Route path="/post-maker" element={<PostMaker />} />
                <Route path="/magic-studio" element={<MagicStudio />} />
                <Route path="/temper-king" element={<TemperKing />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
        </ErrorBoundary>
    );
};

const App: React.FC = () => {
  useEffect(() => {
    // Cleanup old huge drafts that might be breaking localStorage
    try {
      const draft = localStorage.getItem('create_deal_draft');
      if (draft && draft.length > 100000) { // If draft is > 100KB, it probably contains base64 images
        console.warn("Clearing huge draft from localStorage to prevent quota errors");
        localStorage.removeItem('create_deal_draft');
      }
    } catch (e) {
      console.error("Failed to cleanup localStorage", e);
    }
  }, []);

  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
};

export default App;
