
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db, messaging } from '../firebaseConfig'; // Import messaging
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where 
} from 'firebase/firestore';
import { getToken } from 'firebase/messaging'; // Import getToken
import { 
  User, 
  Deal, 
  Transaction, 
  AppNotification, 
  PlatformSettings, 
  UserRole, 
  DealStatus,
  AppLanguage,
  IndustryType,
  ProductReview,
  DeliveryType,
  ServiceType,
  InventoryLog,
  MovementType
} from '../types';
import { MOCK_REVIEWS_LIST } from '../features/deals/dealsConstants';
import { FIREBASE_VAPID_KEY } from '../constants'; // Import VAPID Key

const DEFAULT_SETTINGS: PlatformSettings = {
    adminUpiId: "admin@upi",
    adminAccountName: "TrustSpares Admin",
    adminAccountNumber: "1234567890",
    adminIfsc: "HDFC0001234",
    adminBankName: "HDFC Bank",
    geminiApiKey: "" // Default empty string to prevent controlled/uncontrolled errors
};

interface AppContextType {
  currentUser: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  authMessage: string | null; // NEW
  users: User[];
  deals: Deal[];
  transactions: Transaction[];
  notifications: AppNotification[];
  inventoryLogs: InventoryLog[];
  platformSettings: PlatformSettings;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  
  loginWithEmail: (identifier: string, p: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  signupWithEmail: (identifier: string, p: string, n: string, ind: IndustryType, deviceModel?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>; // NEW
  logout: () => Promise<void>;
  
  updateUserProfile: (uid: string, data: Partial<User>) => Promise<void>;
  toggleTheme: () => void;
  toggleNotifications: () => Promise<void>; // Updated return type
  setAppLanguage: (lang: AppLanguage) => void;
  submitKYC: (data: Partial<User>) => Promise<void>;
  
  addDeal: (deal: any) => Promise<string>;
  updateDeal: (id: string, data: any) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  rateSeller: (dealId: string, rating: number, review: string) => Promise<void>;
  updateDealStatus: (id: string, status: DealStatus) => Promise<void>;
  raiseDispute: (dealId: string, reason: string) => Promise<void>;
  
  withdrawFunds: (amount: number) => Promise<void>;
  processEscrowPayment: (dealId: string, paymentId?: string, deliveryType?: DeliveryType) => Promise<void>;
  bookShopVisit: (dealId: string, serviceType?: ServiceType) => Promise<void>;
  bookRepairOrder: (dealId: string) => Promise<void>; // NEW: Book without payment
  sendRepairQuote: (dealId: string, amount: number) => Promise<void>; // NEW: Admin requests payment
  verifyPickup: (dealId: string, otp: string) => Promise<boolean>;
  markOrderShipped: (dealId: string, trackingNumber: string, courierName: string) => Promise<void>; 
  updateCustomerTracking: (dealId: string, trackingNumber: string) => Promise<void>; 
  cancelOrder: (dealId: string, reason: string) => Promise<void>; // NEW
  releaseEscrowFunds: (dealId: string) => Promise<void>;
  logStockMovement: (log: Omit<InventoryLog, 'id'>) => Promise<void>;
  
  verifySeller: (userId: string, status: 'VERIFIED' | 'REJECTED', reason?: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updatePlatformSettings: (settings: PlatformSettings) => Promise<void>;
  approvePayment: (txId: string, utr?: string, proof?: string) => Promise<void>;
  resolveDispute: (dealId: string, decision: 'REFUND_BUYER' | 'PAY_SELLER', utr?: string, proof?: string) => Promise<void>;
  
  markNotificationsRead: () => Promise<void>;
  subscribeToPro: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<void>; // New method
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [authMessage, setAuthMessage] = useState<string | null>(() => {
        return localStorage.getItem('auth_error_reason');
    });
    const isLoggingOut = React.useRef(false); // Track intentional logouts

    const [users, setUsers] = useState<User[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
    const [platformSettings, setPlatformSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
    const [searchQuery, setSearchQuery] = useState('');

    const userProfileUnsub = React.useRef<any>(null);

    useEffect(() => {
        let mounted = true;

        // Fallback timeout in case Firebase hangs completely
        const loadingTimeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn("Firebase Auth initialization timed out. Forcing UI to load.");
                setLoading(false);
                if (!currentUser) {
                    setAuthMessage("Connection to server timed out. Please check your internet connection.");
                }
            }
        }, 10000);

        // OPTIMISTIC AUTH: Load from cache immediately
        const cachedUserStr = localStorage.getItem('user_cache');
        if (cachedUserStr) {
            try {
                const cachedUser = JSON.parse(cachedUserStr);
                setCurrentUser(cachedUser);
                setLoading(false); // Show UI immediately
                clearTimeout(loadingTimeout);
            } catch (e) {
                console.error("Cache Parse Error", e);
                localStorage.removeItem('user_cache');
            }
        }
        
        const fetchUserProfile = (uid: string) => {
            if (userProfileUnsub.current) {
                userProfileUnsub.current();
            }

            const userDocRef = doc(db, 'users', uid);
            
            userProfileUnsub.current = onSnapshot(userDocRef, (snapshot) => {
                if (snapshot.exists()) {
                    if (mounted) {
                        const userData = snapshot.data() as User;
                        
                        // FORCE ADMIN FOR OWNER (Safety Override & DB Repair)
                        if (userData.email === 'mechkumaran45@gmail.com') {
                            userData.isAdmin = true;
                            userData.role = UserRole.ADMIN;
                            
                            if (!snapshot.data().isAdmin || snapshot.data().role !== UserRole.ADMIN) {
                                updateDoc(userDocRef, { 
                                    isAdmin: true, 
                                    role: UserRole.ADMIN,
                                    kycVerified: true,
                                    kycStatus: 'VERIFIED'
                                }).catch(e => console.error("Auto-repair failed:", e));
                            }
                        }

                        setCurrentUser(userData);
                        
                        // UPDATE CACHE
                        try {
                            localStorage.setItem('user_cache', JSON.stringify(userData));
                            if (userData.email) {
                                localStorage.setItem('last_user_email', userData.email);
                                localStorage.setItem('last_user_name', userData.name || 'User');
                                if (userData.avatar) localStorage.setItem('last_user_avatar', userData.avatar);
                            }
                        } catch (cacheError) {
                            console.warn("Failed to update local cache (storage might be full). Clearing draft and retrying...", cacheError);
                            localStorage.removeItem('create_deal_draft');
                            try {
                                localStorage.setItem('user_cache', JSON.stringify(userData));
                            } catch (e) {
                                console.error("Still failed to save user_cache after clearing draft", e);
                            }
                        }
                        
                        setAuthMessage(null); // Clear error on success
                        clearTimeout(loadingTimeout);
                        setLoading(false);
                    }
                } else {
                    console.error("User authenticated but no Firestore doc found.");
                    
                    const cachedUserStr = localStorage.getItem('user_cache');
                    if (cachedUserStr) {
                        try {
                            const cachedUser = JSON.parse(cachedUserStr);
                            if (cachedUser.id === uid) {
                                console.warn("Using cached profile to prevent overwrite.");
                                setCurrentUser(cachedUser);
                                clearTimeout(loadingTimeout);
                                setLoading(false);
                                return;
                            }
                        } catch (e) {
                            console.error("Cache check failed", e);
                        }
                    }

                    console.error("Account missing from database. Logging out.");
                    setAuthMessage("Your account data could not be found. It may have been deleted. Please contact support.");
                    setCurrentUser(null);
                    localStorage.removeItem('user_cache');
                    clearTimeout(loadingTimeout);
                    setLoading(false);
                    signOut(auth);
                }
            }, (error: any) => {
                console.error(`Error fetching user profile snapshot`, error);
                if (mounted) {
                    const errorMessage = error?.message || "Unknown error";
                    
                    // Fallback to cache if available
                    try {
                        const cachedUserStr = localStorage.getItem('user_cache');
                        if (cachedUserStr) {
                            const cachedUser = JSON.parse(cachedUserStr);
                            if (cachedUser.id === uid) {
                                console.log("Using cached user profile due to network error.");
                                setCurrentUser(cachedUser);
                                clearTimeout(loadingTimeout);
                                setLoading(false);
                                return;
                            }
                        }
                    } catch (parseError) {
                        console.error("Failed to parse cache during network error fallback", parseError);
                    }
                    
                    if (!localStorage.getItem('user_cache')) {
                        setAuthMessage(`Failed to load profile: ${errorMessage}. Please check your connection and reload.`);
                        clearTimeout(loadingTimeout);
                        setLoading(false);
                    }
                }
            });
            
            // Update last login once per session
            updateDoc(userDocRef, { lastLogin: new Date().toISOString() }).catch(console.error);
        };

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!mounted) return;
            if (firebaseUser) {
                // User is authenticated, fetch profile
                localStorage.removeItem('auth_error_reason'); // Clear error on successful login
                setAuthMessage(null);
                await fetchUserProfile(firebaseUser.uid);
            } else {
                // User is logged out
                clearTimeout(loadingTimeout);
                setCurrentUser(null);
                localStorage.removeItem('user_cache'); // Clear cache on logout
                setLoading(false);
                isLoggingOut.current = false; // Reset flag
            }
        }, (error) => {
             console.error("Auth Error:", error);
             clearTimeout(loadingTimeout);
             const reason = `Session Error: ${error.message}`;
             setAuthMessage(reason);
             localStorage.setItem('auth_error_reason', reason);
             setLoading(false);
        });

        return () => { 
            mounted = false;
            clearTimeout(loadingTimeout);
            unsubscribe(); 
        };
    }, []);

    useEffect(() => {
        const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
            setUsers(snap.docs.map(d => d.data() as User));
        });
        const unsubDeals = onSnapshot(query(collection(db, 'deals'), orderBy('createdAt', 'desc')), (snap) => {
            setDeals(snap.docs.map(d => ({ id: d.id, ...d.data() } as Deal)));
        });
        
        const unsubSettings = onSnapshot(doc(db, 'settings', 'platform'), (doc) => {
            if (doc.exists()) {
                setPlatformSettings(doc.data() as PlatformSettings);
            }
        });
        
        return () => { unsubUsers(); unsubDeals(); unsubSettings(); };
    }, []);

    // Securely handle inventory logs listener only when signed in as admin
    useEffect(() => {
        if (!currentUser || (!currentUser.isAdmin && currentUser.role !== UserRole.ADMIN)) {
            setInventoryLogs([]);
            return;
        }

        const unsubLogs = onSnapshot(query(collection(db, 'inventory_logs'), orderBy('date', 'desc')), (snap) => {
            setInventoryLogs(snap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryLog)));
        }, (error) => {
            console.error("Inventory Logs Listener Error:", error);
        });

        return () => unsubLogs();
    }, [currentUser]);

    // --- PUSH NOTIFICATION LOGIC ---
    const requestNotificationPermission = async () => {
        if (!messaging || !currentUser) return;
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                const token = await getToken(messaging, { vapidKey: FIREBASE_VAPID_KEY });
                if (token) {
                    console.log("FCM Token Generated:", token);
                    await updateDoc(doc(db, 'users', currentUser.id), { 
                        fcmToken: token,
                        notificationsEnabled: true
                    });
                    // Update local state to reflect change immediately
                    setCurrentUser(prev => prev ? ({ ...prev, fcmToken: token, notificationsEnabled: true }) : null);
                }
            } else {
                console.warn("Notification permission denied");
            }
        } catch (error) {
            console.error("Error getting notification token:", error);
        }
    };

    const formatAuthIdentifier = (input: string) => {
        const cleanInput = input.trim();
        const isPhone = /^\d{10}$/.test(cleanInput);
        if (isPhone) {
            return `${cleanInput}@trustspares.local`;
        }
        return cleanInput;
    };

    const loginWithEmail = async (identifier: string, p: string) => { 
        const email = formatAuthIdentifier(identifier);
        await signInWithEmailAndPassword(auth, email, p); 
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            const newUser: User = {
                id: user.uid,
                name: user.displayName || 'User',
                email: user.email || '',
                role: UserRole.BUYER,
                industry: 'MOBILE', 
                avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
                walletBalance: 0, escrowBalance: 0, trustScore: 0, kycVerified: false, kycStatus: 'NOT_SUBMITTED',
                createdAt: new Date().toISOString(), lastLogin: new Date().toISOString()
            };
            await setDoc(doc(db, 'users', user.uid), newUser);
        } else {
            await updateDoc(doc(db, 'users', user.uid), { lastLogin: new Date().toISOString() });
        }
    };

    const signupWithEmail = async (identifier: string, p: string, name: string, industry: IndustryType, deviceModel?: string) => {
        const firebaseEmail = formatAuthIdentifier(identifier);
        const isPhone = /^\d{10}$/.test(identifier.trim());
        const result = await createUserWithEmailAndPassword(auth, firebaseEmail, p);
        const user = result.user;
        const newUser: User = {
            id: user.uid,
            name: name,
            email: !isPhone ? identifier : '',
            mobile: isPhone ? identifier : '',
            role: UserRole.BUYER,
            industry: industry || 'MOBILE',
            deviceModel: deviceModel || '',
            shopName: '', 
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
            walletBalance: 0, escrowBalance: 0, trustScore: 0, kycVerified: false, kycStatus: 'NOT_SUBMITTED',
            createdAt: new Date().toISOString(), lastLogin: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', user.uid), newUser);
    };

    const resetPassword = async (identifier: string) => {
        const email = formatAuthIdentifier(identifier);
        await sendPasswordResetEmail(auth, email);
    };

    const logout = async () => { 
        try {
            isLoggingOut.current = true; // Mark as intentional
            localStorage.removeItem('auth_error_reason'); // Clear any previous errors
            localStorage.removeItem('user_cache');
            setAuthMessage(null);
            await signOut(auth); 
        } catch (error) {
            console.error("Firebase signOut error:", error);
            setCurrentUser(null);
        }
    };
    const updateUserProfile = async (uid: string, data: Partial<User>) => { await updateDoc(doc(db, 'users', uid), data); };
    const toggleTheme = () => { if (!currentUser) return; updateUserProfile(currentUser.id, { theme: currentUser.theme === 'DARK' ? 'LIGHT' : 'DARK' }); };
    
    const toggleNotifications = async () => { 
        if (!currentUser) return; 
        if (!currentUser.notificationsEnabled) {
            // Enable
            await requestNotificationPermission();
        } else {
            // Disable (Just update DB, cannot revoke browser perm programmatically)
            await updateUserProfile(currentUser.id, { notificationsEnabled: false });
        }
    };
    
    const setAppLanguage = (lang: AppLanguage) => { if (!currentUser) return; updateUserProfile(currentUser.id, { language: lang }); };
    const submitKYC = async (data: Partial<User>) => { if (!currentUser) return; await updateDoc(doc(db, 'users', currentUser.id), { ...data, kycStatus: 'PENDING', rejectionReason: null }); };
    
    const addDeal = async (dealData: any) => { 
        try {
            if (!currentUser) throw new Error("You must be logged in to add a deal.");
            
            const finalDealData = {
                ...dealData,
                sellerId: currentUser.id, // Ensure sellerId is correct
                productReviews: [],
                rating: 5.0,
                soldQuantity: 0,
                stockQuantity: Number(dealData.stockQuantity) || 0,
                createdAt: new Date().toISOString()
            };
            const docRef = await addDoc(collection(db, 'deals'), finalDealData); 
            return docRef.id; 
        } catch (error: any) {
            console.error("Error adding deal:", error);
            throw error; // Re-throw to be caught by UI
        }
    };

    const updateDeal = async (id: string, data: any) => { 
        try {
            await updateDoc(doc(db, 'deals', id), data); 
        } catch (error) {
            console.error("Error updating deal:", error);
            throw error;
        }
    };
    
    const deleteDeal = async (id: string) => { 
        try {
            await deleteDoc(doc(db, 'deals', id)); 
        } catch (error) {
            console.error("Error deleting deal:", error);
            throw error;
        }
    };
    const updateDealStatus = async (id: string, status: DealStatus) => { await updateDoc(doc(db, 'deals', id), { status }); };

    const logStockMovement = async (log: Omit<InventoryLog, 'id'>) => {
        const deal = deals.find(d => d.id === log.dealId);
        if (!deal) return;

        let newStock = deal.stockQuantity || 0;
        let newSold = deal.soldQuantity || 0;

        switch (log.type) {
            case MovementType.PURCHASE: 
                newStock += log.quantity;
                break;
            case MovementType.SALE: 
                newStock = Math.max(0, newStock - log.quantity);
                newSold += log.quantity;
                break;
            case MovementType.RETURN_IN: 
                newStock += log.quantity;
                newSold = Math.max(0, newSold - log.quantity);
                break;
            case MovementType.RETURN_OUT: 
                newStock = Math.max(0, newStock - log.quantity);
                break;
        }

        await updateDoc(doc(db, 'deals', log.dealId), { 
            stockQuantity: newStock,
            soldQuantity: newSold 
        });

        const logData = {
            ...log,
            sellerId: deal.sellerId
        };

        await addDoc(collection(db, 'inventory_logs'), logData);
    };

    const verifyPickup = async (dealId: string, otp: string) => {
        const deal = deals.find(d => d.id === dealId);
        if (!deal || deal.visitOtp !== otp) return false;
        
        await logStockMovement({
            dealId: deal.id,
            productName: deal.title,
            partyName: users.find(u => u.id === deal.buyerId)?.shopName || 'Market Customer',
            type: MovementType.SALE,
            quantity: 1,
            pricePerUnit: deal.amount,
            totalAmount: deal.amount,
            paidAmount: deal.amount,
            balanceAmount: 0,
            date: new Date().toISOString(),
            note: 'Platform OTP Verified Sale'
        });

        await updateDoc(doc(db, 'deals', dealId), { 
            status: DealStatus.COMPLETED,
            completedAt: new Date().toISOString(), 
            visitOtp: null
        });
        
        // Notify Buyer
        if (deal.buyerId) {
            await addDoc(collection(db, 'notifications'), {
                userId: deal.buyerId,
                title: "Pickup Successful! ✅",
                message: `Thanks for collecting ${deal.title}. Transaction Complete.`,
                date: new Date().toISOString(),
                read: false,
                type: 'SUCCESS'
            });
        }

        return true;
    };

    const markOrderShipped = async (dealId: string, trackingNumber: string, courierName: string) => {
        const deal = deals.find(d => d.id === dealId);
        if (!deal || !deal.buyerId) return;

        // 1. Update Deal Status
        await updateDoc(doc(db, 'deals', dealId), {
            status: DealStatus.SHIPPED,
            trackingNumber: trackingNumber,
            shippingReceipt: courierName // Using this field to store courier name for now
        });

        // 2. Log Inventory Movement
        await logStockMovement({
            dealId: deal.id,
            productName: deal.title,
            partyName: users.find(u => u.id === deal.buyerId)?.shopName || 'Online Order',
            type: MovementType.SALE,
            quantity: 1,
            pricePerUnit: deal.amount,
            totalAmount: deal.amount,
            paidAmount: deal.amount,
            balanceAmount: 0,
            date: new Date().toISOString(),
            note: `Shipped via ${courierName} (Trk: ${trackingNumber})`
        });

        // 3. Notify Buyer
        await addDoc(collection(db, 'notifications'), {
            userId: deal.buyerId,
            title: "Order Shipped! 🚚",
            message: `Your order ${deal.title} has been shipped via ${courierName}. Tracking: ${trackingNumber}`,
            date: new Date().toISOString(),
            read: false,
            type: 'SUCCESS'
        });
    };

    // NEW: For user to update tracking when sending phone for repair
    const updateCustomerTracking = async (dealId: string, trackingNumber: string) => {
        await updateDoc(doc(db, 'deals', dealId), {
            customerTrackingNumber: trackingNumber
        });
    };

    const cancelOrder = async (dealId: string, reason: string) => {
        const deal = deals.find(d => d.id === dealId);
        if (!deal) return;

        // If the order was PAID, we should refund the amount to the buyer's wallet
        if (deal.status === DealStatus.PAID && deal.buyerId) {
            const buyer = users.find(u => u.id === deal.buyerId);
            if (buyer) {
                await updateDoc(doc(db, 'users', buyer.id), { walletBalance: (buyer.walletBalance || 0) + deal.amount });
                await addDoc(collection(db, 'transactions'), { 
                    userId: buyer.id, 
                    dealId, 
                    amount: deal.amount, 
                    type: 'REFUND', 
                    status: 'COMPLETED', 
                    date: new Date().toISOString(), 
                    description: `Refund for Cancelled Order: ${deal.title}` 
                });
            }
        }

        await updateDoc(doc(db, 'deals', dealId), { 
            status: DealStatus.CANCELLED,
            cancelReason: reason
        });

        // Notify Buyer
        if (deal.buyerId) {
            await addDoc(collection(db, 'notifications'), {
                userId: deal.buyerId,
                title: "Order Cancelled ❌",
                message: `Your order for ${deal.title} has been cancelled. Reason: ${reason}`,
                date: new Date().toISOString(),
                read: false,
                type: 'INFO'
            });
        }
        
        // Notify Seller/Admin
        if (deal.sellerId && deal.sellerId !== deal.buyerId) {
            await addDoc(collection(db, 'notifications'), {
                userId: deal.sellerId,
                title: "Order Cancelled ❌",
                message: `Order for ${deal.title} was cancelled. Reason: ${reason}`,
                date: new Date().toISOString(),
                read: false,
                type: 'INFO'
            });
        }
    };

    const rateSeller = async (dealId: string, rating: number, review: string) => {
        const deal = deals.find(d => d.id === dealId); if(!deal) return;
        
        const newUserReview: ProductReview = {
            id: `user-${Date.now()}`,
            userName: currentUser?.shopName || currentUser?.name || 'Verified Buyer',
            rating: rating,
            comment: review,
            date: new Date().toISOString(),
            isVerified: currentUser?.kycVerified || false
        };
        
        const existingReviews = deal.productReviews || [];
        const updatedReviews = [...existingReviews, newUserReview];
        const newAvgRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length;
        
        await updateDoc(doc(db, 'deals', dealId), { 
            rating: parseFloat(newAvgRating.toFixed(1)), 
            productReviews: updatedReviews,
            status: DealStatus.COMPLETED 
        });
        
        const seller = users.find(u => u.id === deal.sellerId);
        if(seller) {
            const oldScore = seller.trustScore || 0; const totalDeals = seller.totalDeals || 1; 
            const newScore = ((oldScore * totalDeals) + rating) / (totalDeals + 1);
            await updateDoc(doc(db, 'users', seller.id), { trustScore: parseFloat(newScore.toFixed(1)), totalDeals: totalDeals + 1 });
        }
    };

    const raiseDispute = async (dealId: string, reason: string) => { await updateDoc(doc(db, 'deals', dealId), { status: DealStatus.DISPUTED, disputeReason: reason }); };
    
    const withdrawFunds = async (amount: number) => {
        if (!currentUser) return;
        await addDoc(collection(db, 'transactions'), { userId: currentUser.id, amount, type: 'WITHDRAWAL', status: 'PENDING', date: new Date().toISOString(), description: 'Withdrawal Request' });
        await updateDoc(doc(db, 'users', currentUser.id), { walletBalance: (currentUser.walletBalance || 0) - amount });
    };

    // BOOK REPAIR (NO PAYMENT YET)
    const bookRepairOrder = async (dealId: string) => {
        if (!currentUser) return;
        const deal = deals.find(d => d.id === dealId);
        if (!deal) return;

        await updateDoc(doc(db, 'deals', dealId), { 
            status: DealStatus.APPOINTMENT_BOOKED, // Represents "Order Placed"
            buyerId: currentUser.id,
            deliveryType: DeliveryType.REPAIR_COURIER,
            serviceType: ServiceType.REPAIR,
            createdAt: new Date().toISOString() // Refresh date
        });

        // CREDIT LOYALTY BONUS POINTS: ₹5 - ₹10
        const bonusAmount = Math.floor(Math.random() * 6) + 5;
        await updateDoc(doc(db, 'users', currentUser.id), {
            bonusPoints: (currentUser.bonusPoints || 0) + bonusAmount
        });

        // Notify Buyer
        await addDoc(collection(db, 'notifications'), {
            userId: currentUser.id,
            title: "போனஸ் புள்ளிகள் சேர்ந்தது! 🎖️",
            message: `தாங்கள் செய்த முன்பதிவிற்காக உங்களது கணக்கில் ₹${bonusAmount} போனஸ் பாயின்ட்ஸாகச் சேர்ந்துள்ளது.`,
            date: new Date().toISOString(),
            read: false,
            type: 'SUCCESS'
        });

        // Notify Admin (Assume Admin is Seller for now)
        if (deal.sellerId) {
             // Real implementation would notify seller
        }
    };

    // ADMIN SENDS PAYMENT REQUEST
    const sendRepairQuote = async (dealId: string, amount: number) => {
        const deal = deals.find(d => d.id === dealId);
        if (!deal || !deal.buyerId) return;

        await updateDoc(doc(db, 'deals', dealId), {
            status: DealStatus.PAYMENT_PENDING,
            amount: amount, // Update the final cost
            dealerPrice: amount // Sync pricing
        });

        // Notify Buyer
        await addDoc(collection(db, 'notifications'), {
            userId: deal.buyerId,
            title: "Payment Request 🔔",
            message: `Repair estimate ready: ₹${amount}. Please pay to proceed.`,
            date: new Date().toISOString(),
            read: false,
            type: 'INFO'
        });
    };

    const processEscrowPayment = async (dealId: string, paymentId?: string, deliveryType: DeliveryType = DeliveryType.COURIER) => {
        if (!currentUser) return;
        const deal = deals.find(d => d.id === dealId); if(!deal) return;
        
        await updateDoc(doc(db, 'deals', dealId), { 
            status: DealStatus.PAID, 
            buyerId: currentUser.id,
            deliveryType: deliveryType // Save delivery type (Courier, Shop Visit, Repair Courier)
        });
        
        // CREDIT LOYALTY BONUS POINTS: ₹5 - ₹10
        const bonusAmount = Math.floor(Math.random() * 6) + 5;
        await updateDoc(doc(db, 'users', currentUser.id), {
            bonusPoints: (currentUser.bonusPoints || 0) + bonusAmount
        });

        // NOTE: Keeping type='ESCROW_LOCK' for internal consistency, but changing description for UI
        await addDoc(collection(db, 'transactions'), { userId: currentUser.id, dealId, amount: deal.amount, type: 'ESCROW_LOCK', status: 'COMPLETED', paymentId: paymentId || 'MANUAL', date: new Date().toISOString(), description: `Payment to Admin for ${deal.title}` });
        
        // NOTIFICATION: ORDER PLACED
        await addDoc(collection(db, 'notifications'), {
            userId: currentUser.id,
            title: "Payment Successful! ✅",
            message: `Payment for ${deal.title} received. Repair/Shipping will start.`,
            date: new Date().toISOString(),
            read: false,
            type: 'SUCCESS'
        });

        // Tamil Bonus Notification
        await addDoc(collection(db, 'notifications'), {
            userId: currentUser.id,
            title: "போனஸ் புள்ளிகள் சேர்ந்தது! 🎖️",
            message: `இந்த கொள்முதலில் தாங்கள் ₹${bonusAmount} போனஸ் பாயின்ட்ஸாகச் பெற்றுள்ளீர்கள்.`,
            date: new Date().toISOString(),
            read: false,
            type: 'SUCCESS'
        });
    };

    const bookShopVisit = async (dealId: string, serviceType: ServiceType = ServiceType.PURCHASE) => {
        if (!currentUser) return;
        const deal = deals.find(d => d.id === dealId);
        const otp = Math.floor(1000 + Math.random() * 9000).toString(); 
        
        await updateDoc(doc(db, 'deals', dealId), { 
            status: DealStatus.APPOINTMENT_BOOKED, 
            buyerId: currentUser.id,
            deliveryType: DeliveryType.SHOP_VISIT,
            serviceType: serviceType,
            visitOtp: otp 
        });

        // CREDIT LOYALTY BONUS POINTS: ₹5 - ₹10
        const bonusAmount = Math.floor(Math.random() * 6) + 5;
        await updateDoc(doc(db, 'users', currentUser.id), {
            bonusPoints: (currentUser.bonusPoints || 0) + bonusAmount
        });

        // NOTIFICATION: BOOKING CONFIRMED
        await addDoc(collection(db, 'notifications'), {
            userId: currentUser.id,
            title: "Booking Confirmed! 🎫",
            message: `Visit booked for ${deal?.title || 'Item'}. Your Secret OTP is ${otp}.`,
            date: new Date().toISOString(),
            read: false,
            type: 'INFO'
        });

        // Tamil Bonus Notification
        await addDoc(collection(db, 'notifications'), {
            userId: currentUser.id,
            title: "போனஸ் புள்ளிகள் சேர்ந்தது! 🎖️",
            message: `இந்த கடை முன்பதிவிற்காக தாங்கள் ₹${bonusAmount} போனஸ் பாயின்ட்ஸாகச் பெற்றுள்ளீர்கள்.`,
            date: new Date().toISOString(),
            read: false,
            type: 'SUCCESS'
        });
    };

    const releaseEscrowFunds = async (dealId: string) => {
        const deal = deals.find(d => d.id === dealId); if(!deal) return;
        const seller = users.find(u => u.id === deal.sellerId);
        if(seller) {
            await updateDoc(doc(db, 'users', seller.id), { walletBalance: (seller.walletBalance || 0) + deal.amount });
            // Changing description to "Order Payout" instead of "Sale Income"
            await addDoc(collection(db, 'transactions'), { userId: seller.id, dealId, amount: deal.amount, type: 'ESCROW_RELEASE', status: 'COMPLETED', date: new Date().toISOString(), description: `Order Payout for ${deal.title}` });
        }
    };

    const verifySeller = async (userId: string, status: 'VERIFIED' | 'REJECTED', reason?: string) => {
      const userRef = doc(db, "users", userId);
      if (status === 'VERIFIED') { 
          await updateDoc(userRef, { 
              kycStatus: 'VERIFIED', 
              kycVerified: true, 
              trustScore: 5.0, 
              rejectionReason: null, 
              approvedAt: new Date().toISOString() 
          }); 
      } else { 
          await updateDoc(userRef, { 
              kycStatus: 'REJECTED', 
              rejectionReason: reason || "Documents invalid or unclear." 
          }); 
      }
    };

    const deleteUser = async (userId: string) => { await deleteDoc(doc(db, 'users', userId)); };
    const updatePlatformSettings = async (settings: PlatformSettings) => { await setDoc(doc(db, 'settings', 'platform'), settings); };
    
    const approvePayment = async (txId: string, utr?: string, proof?: string) => {
        const tx = transactions.find(t => t.id === txId); if(!tx) return;
        await updateDoc(doc(db, 'transactions', txId), { status: 'COMPLETED', proofImage: proof, description: utr ? `${tx.description} (UTR: ${utr})` : tx.description });
        if (tx.type === 'ESCROW_LOCK' && tx.dealId) { 
            await updateDoc(doc(db, 'deals', tx.dealId), { status: DealStatus.PAID }); 
            
            // Notify Buyer Payment Verified
            await addDoc(collection(db, 'notifications'), {
                userId: tx.userId,
                title: "Payment Verified ✅",
                message: "Admin has verified your payment. Order is now processing.",
                date: new Date().toISOString(),
                read: false,
                type: 'SUCCESS'
            });
        }
    };

    const resolveDispute = async (dealId: string, decision: 'REFUND_BUYER' | 'PAY_SELLER', utr?: string, proof?: string) => {
        const deal = deals.find(d => d.id === dealId); if(!deal || !deal.buyerId) return;
        if (decision === 'REFUND_BUYER') {
             await updateDoc(doc(db, 'deals', dealId), { status: DealStatus.CANCELLED });
             await addDoc(collection(db, 'transactions'), { userId: deal.buyerId, dealId, amount: deal.amount, type: 'REFUND', status: 'COMPLETED', proofImage: proof, date: new Date().toISOString(), description: `Refund for ${deal.title} (UTR: ${utr})` });
             
             // Notify Buyer Refund
             await addDoc(collection(db, 'notifications'), {
                userId: deal.buyerId,
                title: "Refund Processed 💰",
                message: `Dispute resolved. Refund of ₹${deal.amount} processed.`,
                date: new Date().toISOString(),
                read: false,
                type: 'INFO'
            });

        } else {
             await releaseEscrowFunds(dealId);
             await updateDoc(doc(db, 'deals', dealId), { status: DealStatus.COMPLETED });
        }
    };

    const markNotificationsRead = async () => { if(!currentUser) return; const myNotifs = notifications.filter(n => n.userId === currentUser.id && !n.read); for(const n of myNotifs) { await updateDoc(doc(db, 'notifications', n.id), { read: true }); } };
    const subscribeToPro = async () => { if(!currentUser) return false; if(currentUser.walletBalance < 149) return false; await updateDoc(doc(db, 'users', currentUser.id), { walletBalance: currentUser.walletBalance - 149, isProMember: true }); return true; };

    return (
        <AppContext.Provider value={{
            currentUser, loading, isAuthenticated: !!currentUser, authMessage, users, deals, transactions, notifications, inventoryLogs, platformSettings, searchQuery, setSearchQuery,
            loginWithEmail, loginWithGoogle, signupWithEmail, logout,
            updateUserProfile, toggleTheme, toggleNotifications, setAppLanguage, submitKYC,
            addDeal, updateDeal, deleteDeal, rateSeller, updateDealStatus, raiseDispute,
            withdrawFunds, processEscrowPayment, bookShopVisit, bookRepairOrder, sendRepairQuote, verifyPickup, markOrderShipped, updateCustomerTracking, cancelOrder, releaseEscrowFunds,
            verifySeller, deleteUser, updatePlatformSettings, approvePayment, resolveDispute,
            markNotificationsRead, subscribeToPro, requestNotificationPermission, logStockMovement, resetPassword
        }}>
            {children}
        </AppContext.Provider>
    );
};
