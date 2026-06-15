import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../contexts/AppContext';
import QRCode from 'react-qr-code';
import { 
  Smartphone, MapPin, Share2, Award, Sparkles, CheckCircle2, 
  ChevronLeft, Star, MessageSquare, Clipboard, Compass, Info,
  Heart, ShieldCheck, Map, PhoneCall, Gift, Search, SlidersHorizontal,
  User, LogIn, LogOut, ShoppingCart, Menu, ChevronRight, Clock, Globe, ArrowRight, X, ClipboardList,
  Database, Plus, PlusCircle, RefreshCw, Store, Check, Truck, HelpCircle, Activity, Settings, Copy, QrCode
} from 'lucide-react';
import { BRANDS, POPULAR_MODELS } from './dashboardConstants';
import { useNavigate } from 'react-router-dom';
import SEO from '../../components/SEO';

// PREMIUM ROYAL ARMOR TEMPER TIERS
interface TemperProduct {
  id: string;
  name: string;
  englishName: string;
  description: string;
  price: number;
  originalPrice: number;
  rating: number;
  protectionScore: number;
  badge: string;
  features: string[];
  imageUrl: string;
  category: 'premium' | 'matte' | 'privacy' | 'uv';
}

const FALLBACK_TEMPER_PRODUCTS: TemperProduct[] = [
  {
    id: 'sapphire-pro',
    name: 'ஸஃபையர் ப்ரோ+ அல்ட்ரா கொரில்லா கிளாஸ்',
    englishName: 'Sapphire Pro+ (King\'s Choice Edition)',
    description: 'அதிநவீன கொரில்லா கிளாஸ் பாதுகாப்பு மற்றும் 95% அதிவேக எச்டி தெளிவு கொண்டது. மிக கடுமையான தாக்கங்களையும் தாங்கக்கூடியது.',
    price: 399,
    originalPrice: 799,
    rating: 4.9,
    protectionScore: 98,
    badge: '👑 Best Seller',
    features: ['9H Hardness', 'Dual Reinforced Edge', 'Crystal Clear Optics'],
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop',
    category: 'premium'
  },
  {
    id: 'royal-privacy',
    name: 'ராயல் பிரைவசி ஆன்டி-ஸ்பை ஷீல்டு',
    englishName: 'Royal Privacy Guard (Anti-Spy Screen)',
    description: 'பக்கத்து இருக்கையில் உள்ளவர்களின் பார்வையில் இருந்து உங்கள் தகவல்களை காக்கும் 28 டிகிரி பிரைவசி பாதுகாப்பு தொழில்நுட்பம்.',
    price: 449,
    originalPrice: 899,
    rating: 4.8,
    protectionScore: 88,
    badge: '🛡️ King\'s Choice',
    features: ['28-deg Anti-Spy', 'Nano-Adsorption', 'Smudge-Proof Coating'],
    imageUrl: 'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?q=80&w=600&auto=format&fit=crop',
    category: 'privacy'
  },
  {
    id: 'titan-guard',
    name: 'டைட்டன் கார்டு அல்ட்ரா மேட் டெம்பர்',
    englishName: 'Titan Guard (Super Matte Gaming Pro)',
    description: 'விளையாட்டு பிரியர்களுக்கான பிரத்யேக மேட் பூச்சு. திரையில் விரல் ரேசுகள் படியாது, மென்மையான அதிவேக தொடுதல் அனுபவம்.',
    price: 299,
    originalPrice: 599,
    rating: 4.7,
    protectionScore: 92,
    badge: '🎮 Pro Gaming',
    features: ['Anti-Glare Matte', 'Fingerprint Resistant', 'Sweat Proof Coating'],
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
    category: 'matte'
  },
  {
    id: 'glass-armor-uv',
    name: 'கிளாஸ் ஆர்மர் 3D வளைந்த யுவி லிக்விட்',
    englishName: 'UV Glass Armor (Premium Curved Edge)',
    description: 'வளைந்த விளிம்புகள் கொண்ட சூப்பர் AMOLED திரைகளுக்கு பிரத்யேகமாக விளிம்புகள் வரை துல்லியமாக ஒட்டப்படும் யுவி பசையற்ற தொழில்நுட்பம்.',
    price: 499,
    originalPrice: 999,
    rating: 4.9,
    protectionScore: 96,
    badge: '🧪 Tech Master',
    features: ['UV Liquid Bond', 'Zero Ghost Bubbles', 'Oleophobic Smoothness'],
    imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=600&auto=format&fit=crop',
    category: 'uv'
  }
];

const TemperKing: React.FC = () => {
  const { currentUser, platformSettings, deals, logout, updateUserProfile, loginWithEmail, signupWithEmail } = useApp();
  const navigate = useNavigate();

  // STATE MANAGEMENT
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [customModelText, setCustomModelText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const [isSearched, setIsSearched] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [appointmentName, setAppointmentName] = useState<string>(currentUser?.name || '');
  const [appointmentMobile, setAppointmentMobile] = useState<string>(currentUser?.mobile || '');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);
  const [cartItemsCount, setCartItemsCount] = useState<number>(0);
  const [cart, setCart] = useState<{product: TemperProduct; quantity: number}[]>([]);
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [addProductModalOpen, setAddProductModalOpen] = useState<boolean>(false);
  const [privateConsoleOpen, setPrivateConsoleOpen] = useState<boolean>(false);

  // REAL IN-APP E-COMMERCE ORDERS STATE
  const [ordersList, setOrdersList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('temperking_orders_list');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [activeEcomOrder, setActiveEcomOrder] = useState<any | null>(null);
  const [customerOrdersTabActive, setCustomerOrdersTabActive] = useState<boolean>(false);
  const [showLoyaltyModal, setShowLoyaltyModal] = useState<boolean>(false);
  const [showShareQrModal, setShowShareQrModal] = useState<boolean>(false);
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<TemperProduct | null>(null);

  // CUSTOM BOGO CAMPAIGN CONTROLLERS
  const [showBogoClaimModal, setShowBogoClaimModal] = useState<boolean>(false);
  const [bogoName, setBogoName] = useState<string>('');
  const [bogoPhone, setBogoPhone] = useState<string>('');
  const [bogoPassword, setBogoPassword] = useState<string>('');
  const [bogoDeviceModel, setBogoDeviceModel] = useState<string>('');
  const [bogoAuthMode, setBogoAuthMode] = useState<'register' | 'login'>('register');
  const [bogoError, setBogoError] = useState<string | null>(null);
  const [bogoLoading, setBogoLoading] = useState<boolean>(false);

  // HYBRID E-COMMERCE SHIP/PICKUP CUSTOMER SELECTIONS
  const [fulfillmentType, setFulfillmentType] = useState<'courier' | 'pickup'>('pickup');
  const [shippingName, setShippingName] = useState<string>(currentUser?.name || '');
  const [shippingPhone, setShippingPhone] = useState<string>(currentUser?.mobile || '');
  const [shippingAddress, setShippingAddress] = useState<string>('');
  const [shippingCity, setShippingCity] = useState<string>('Arakkonam');
  const [shippingPincode, setShippingPincode] = useState<string>('');
  const [selectedPickupShopId, setSelectedPickupShopId] = useState<string>('shop-1');
  const [selectedPickupTime, setSelectedPickupTime] = useState<string>('12:00 PM - 02:00 PM');

  // MODAL PRODUCT FORM STATES WITH PREMIUM E-COMMERCE ENHANCEMENTS
  const [modalProdName, setModalProdName] = useState<string>('');
  const [modalProdEngName, setModalProdEngName] = useState<string>('');
  const [modalProdPrice, setModalProdPrice] = useState<number>(399);
  const [modalProdOriginalPrice, setModalProdOriginalPrice] = useState<number>(799);
  const [modalProdCategory, setModalProdCategory] = useState<string>('MOBILE_GLASS');
  const [modalProdShop, setModalProdShop] = useState<string>('Arakkonam Junction Branch');
  const [modalProdImageUrl, setModalProdImageUrl] = useState<string>('');
  const [modalProdDescription, setModalProdDescription] = useState<string>('');
  const [modalProdStockCount, setModalProdStockCount] = useState<number>(20);
  const [modalProdRating, setModalProdRating] = useState<number>(4.9);
  const [modalProdProtectionScore, setModalProdProtectionScore] = useState<number>(95);
  const [modalProdBadge, setModalProdBadge] = useState<string>('');
  const [modalProdFeatures, setModalProdFeatures] = useState<string>('9H Hardness, Oleophobic Anti-Fingerprint, Premium Air-Bubble Free Fitting');
  const [modalProdIsBanner, setModalProdIsBanner] = useState<boolean>(false);
  const [activeBannerIdx, setActiveBannerIdx] = useState<number>(0);

  // DYNAMIC CUSTOM STAFF MANAGING STATES
  const [customStaffList, setCustomStaffList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('temperking_custom_staff');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffRole, setNewStaffRole] = useState<string>('Sales & Fitting Expert');
  const [newStaffShopId, setNewStaffShopId] = useState<string>('shop-1');
  const [newStaffAvatar, setNewStaffAvatar] = useState<string>('👦');

  // DRIVER STACK FOR TOP-LEVEL QUICK CATALOG DIRECTORY MANAGEMENT
  const [selectedShopFilter, setSelectedShopFilter] = useState<string>('all');
  const [topProdName, setTopProdName] = useState<string>('');
  const [topProdPrice, setTopProdPrice] = useState<number>(399);
  const [topProdCategory, setTopProdCategory] = useState<string>('MOBILE_GLASS');

  // UNIFIED MULTI-STORE SIMULATION ENGINE STATES
  const [availableShops, setAvailableShops] = useState<any[]>(() => {
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
  });

  useEffect(() => {
    try {
      localStorage.setItem('temperking_shops', JSON.stringify(availableShops));
    } catch (e) {
      console.error("Failed to save shops to local storage", e);
    }
  }, [availableShops]);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem('temperking_shops');
        if (saved) {
          setAvailableShops(JSON.parse(saved));
        }
        const savedOrders = localStorage.getItem('temperking_orders_list');
        if (savedOrders) {
          setOrdersList(JSON.parse(savedOrders));
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    // Also periodically poll local storage to keep the views in sync perfectly
    const timer = setInterval(handleStorageChange, 2000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(timer);
    };
  }, []);
  const [simShop, setSimShop] = useState<string>('Arakkonam Junction Branch');
  const [shippingCarrier, setShippingCarrier] = useState<string>('');
  const [shippingTrackId, setShippingTrackId] = useState<string>('');
  const [selectedShippingOrderId, setSelectedShippingOrderId] = useState<string | null>(null);
  const [pickupOtpChallenge, setPickupOtpChallenge] = useState<string>('');
  const [selectedOtpOrderId, setSelectedOtpOrderId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [simProdName, setSimProdName] = useState<string>('Premium Gorilla 11D Glass');
  const [simProdPrice, setSimProdPrice] = useState<number>(399);
  const [simProdCategory, setSimProdCategory] = useState<string>('MOBILE_GLASS');
  const [simulatedProducts, setSimulatedProducts] = useState<any[]>([
    {
      id: 'sim-1',
      name: 'iPhone 15 Pro Max 11D Full Curved Tempered Glass',
      category: 'MOBILE_GLASS',
      price: 399,
      shop: 'Arakkonam Junction Branch',
      timestamp: '2 mins ago',
      syncStatus: 'synced'
    },
    {
      id: 'sim-2',
      name: 'Yamaha R15 V4 Visor Scratch Proof Guard',
      category: 'BIKE_SPARE',
      price: 249,
      shop: 'Old Town Auto Garage',
      timestamp: '1 hour ago',
      syncStatus: 'synced'
    },
    {
      id: 'sim-3',
      name: 'Sony Bravia 55 inch Curved Panel Guard',
      category: 'TV_SPARE',
      price: 1499,
      shop: 'Gandhi Road Electronics',
      timestamp: 'Yesterday',
      syncStatus: 'synced'
    },
    {
      id: 'sim-4',
      name: 'OnePlus 12 Ultra Clear Glass Armor Shield',
      category: 'MOBILE_GLASS',
      price: 499,
      shop: 'Arakkonam Junction Branch',
      timestamp: 'Just now',
      syncStatus: 'synced'
    }
  ]);
  const [activeStepTab, setActiveStepTab] = useState<'add' | 'sync' | 'book' | 'profile'>('add');
  const [isSimulatingAdd, setIsSimulatingAdd] = useState<boolean>(false);
  const [selectedBookingSimItem, setSelectedBookingSimItem] = useState<any>(null);
  const [simBookingStatus, setSimBookingStatus] = useState<'idle' | 'booked'>('idle');

  const [selectedEditShopId, setSelectedEditShopId] = useState<string>('shop-1');

  // NEW MULTI-PAGE VIEW & POS BILLING STATES BY BRANCH
  const [currentView, setCurrentView] = useState<'store' | 'staff-login' | 'billing' | 'inventory' | 'add-stock' | 'trustspares-admin' | 'orders-live'>('store');

  // STAFF SECURITY CHECKER (Only trustspares ADMIN or SELLER or specific verified isAdmin are allowed)
  const isTrustSparesStaff = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.role === 'ADMIN' || currentUser.role === 'SELLER' || currentUser.isAdmin === true;
  }, [currentUser]);

  // SECURE CONSOLE ACCESS TO STAFF ONLY
  useEffect(() => {
    if (privateConsoleOpen && !isTrustSparesStaff) {
      setPrivateConsoleOpen(false);
      setCurrentView('store');
    }
  }, [privateConsoleOpen, isTrustSparesStaff]);
  const [billingCart, setBillingCart] = useState<{product: any; quantity: number}[]>([]);
  const [billingCustomerName, setBillingCustomerName] = useState<string>('');
  const [billingCustomerPhone, setBillingCustomerPhone] = useState<string>('');
  const [billingDiscount, setBillingDiscount] = useState<number>(0);
  const [billsList, setBillsList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('temperking_bills_list_v2');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [selectedCompletedBill, setSelectedCompletedBill] = useState<any>(null);
  const [activeBarcodeSearch, setActiveBarcodeSearch] = useState<string>('');

  // SIMULATED STAFF LOGIN STATES
  const [simLoggedStaffId, setSimLoggedStaffId] = useState<string>('ALL'); // 'ALL' or specific staff id etc.
  const [simLoggedStaffName, setSimLoggedStaffName] = useState<string>('மச்சான் குமரன் (Super Owner)');
  const [simLoggedStaffRole, setSimLoggedStaffRole] = useState<string>('Super Admin');

  // DYNAMIC STAFF COMPILATION MEMO
  const staffList = useMemo(() => {
    const list: any[] = [
      {
        id: 'ALL',
        name: 'மச்சான் குமரன் (Super Owner)',
        role: 'Super Admin',
        shopId: 'ALL',
        shopDisplayName: 'அனைத்து கிளைகளும் (Master Overlord)',
        avatar: '👑'
      }
    ];

    availableShops.forEach((shop) => {
      let managerName = '';
      let avatar = '👤';
      if (shop.id === 'shop-1') {
        managerName = 'கார்த்திக் ராஜ் (Senior Glass Aligner)';
        avatar = '🛡️';
      } else if (shop.id === 'shop-2') {
        managerName = 'விக்னேஷ் குமார் (TV Shield Expert)';
        avatar = '📺';
      } else if (shop.id === 'shop-3') {
        managerName = 'முத்துவேல் பாண்டியன் (Garage Head)';
        avatar = '🏍️';
      } else {
        const prefix = shop.displayName.split(' (')[0] || shop.displayName.substring(0, 10);
        managerName = `${prefix} கிளை மேலாளர் (Store Manager)`;
        avatar = '💼';
      }

      list.push({
        id: shop.id,
        name: managerName,
        role: 'Shop Manager & Worker',
        shopId: shop.id,
        shopDisplayName: shop.displayName,
        avatar: avatar
      });
    });

    // Append dynamically registered custom staff members
    customStaffList.forEach((cst) => {
      const associatedShop = availableShops.find(sh => sh.id === cst.shopId);
      list.push({
        id: cst.id,
        name: cst.name,
        role: cst.role || 'Sales & Fitting Expert',
        shopId: cst.shopId,
        shopDisplayName: associatedShop ? associatedShop.displayName : 'Unknown Shop Branch',
        avatar: cst.avatar || '👦',
        isCustom: true
      });
    });

    return list;
  }, [availableShops, customStaffList]);

  const handleSimulateStaffLogin = (staff: any) => {
    setSimLoggedStaffId(staff.id);
    setSimLoggedStaffName(staff.name);
    setSimLoggedStaffRole(staff.role);
    
    if (staff.shopId !== 'ALL') {
      const associatedShop = availableShops.find(sh => sh.id === staff.shopId);
      if (associatedShop) {
        setSimShop(associatedShop.name);
        setSelectedShopFilter(associatedShop.name); // Automatically focus the storefront to show this staff's shop!
      }
    } else {
      setSelectedShopFilter('all'); // Show all branches for administrative view
    }
    // Also update selectedEditShopId to match if they want to edit under Profile
    if (staff.shopId !== 'ALL') {
      setSelectedEditShopId(staff.shopId);
      // Auto pre-fill the profile form with the shop's details
      const shop = availableShops.find(sh => sh.id === staff.shopId);
      if (shop) {
        setProfileShopName(shop.displayName);
        setProfileDomain(shop.domain);
        setProfileGpsCoordinates(shop.gps);
        setProfileAddress(shop.address);
      }
    }
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
    setCustomStaffList(updated);
    localStorage.setItem('temperking_custom_staff', JSON.stringify(updated));
    setNewStaffName('');
    alert(`வெற்றி! புதிய ஊழியர் "${newStaffName}" வெற்றிகரமாக சேர்க்கப்பட்டார்! கீழே உள்ள லாகின் பட்டியலில் இப்பொழுது இவரைத் தேர்வு செய்து நேரடியாக லாகின் செய்யலாம்! 🎉`);
  };

  const handleDeleteCustomStaff = (staffId: string) => {
    if (confirm("இந்த ஊழியர் கணக்கை நிரந்தரமாக நீக்க விரும்புகிறீர்களா? (Delete this staff account?)")) {
      const updated = customStaffList.filter(s => s.id !== staffId);
      setCustomStaffList(updated);
      localStorage.setItem('temperking_custom_staff', JSON.stringify(updated));
      alert("ஊழியர் கணக்கு வெற்றிகரமாக நீக்கப்பட்டது!");
    }
  };

  // RETAIL POS BILLING ACTIONS
  const handleAddToPOSCart = (product: any) => {
    setBillingCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        const stock = product.stockCount || 25;
        if (existing.quantity >= stock) {
          alert(`கைவசம் இருப்பதை விட அதிகமாக விநியோகிக்க முடியாது! (Max Stock: ${stock})`);
          return prev;
        }
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdatePOSCartQty = (productId: any, delta: number, stock: number) => {
    setBillingCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > stock) {
            alert(`கைவசம் இருப்பதை விட அதிகமாக விநியோகிக்க முடியாது! (Max Stock: ${stock})`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter((item): item is {product: any; quantity: number} => item !== null);
    });
  };

  const handleRemoveFromPOSCart = (productId: any) => {
    setBillingCart(prev => prev.filter(item => item.product.id !== productId));
  };
  
  // COPY PRODUCT DUPLICATION SYSTEM
  const handleCopyProduct = (product: any) => {
    setModalProdName(product.name + " (Copy)");
    setModalProdEngName(product.englishName ? product.englishName + " (Copy)" : "");
    setModalProdCategory(product.category || 'premium');
    setModalProdPrice(product.price || 399);
    setModalProdOriginalPrice(product.originalPrice || (product.price ? product.price * 2 : 799));
    setModalProdImageUrl(product.imageUrl || "");
    setModalProdDescription(product.description || "");
    setModalProdStockCount(product.stockCount || 20);
    setModalProdRating(product.rating || 4.9);
    setModalProdProtectionScore(product.protectionScore || 95);
    setModalProdBadge(product.badge || "");
    setModalProdIsBanner(!!product.isBanner);
    
    // Set features as string
    setModalProdFeatures(Array.isArray(product.features) ? product.features.join(', ') : (product.features || '9H Hardness, Oleophobic Anti-Fingerprint, Premium Air-Bubble Free Fitting'));
    
    // Switch view to publisher tab
    setCurrentView('add-stock');
    
    // Smooth scroll to top of workspace
    setTimeout(() => {
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }, 150);
    
    alert(`வெற்றி! "${product.name}" தயாரிப்பின் அம்சங்கள் அனைத்தும் நகலெடுக்கப்பட்டுவிட்டன! திருத்தங்களைச் செய்து கீழே புதிய தயாரிப்பை வெளியிடவும்! ✨✍️`);
  };

  // BASE64 IMAGE FILE READER SIMULATED UPLOADER
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("படம் 2MB-க்கு குறைவாக இருக்க வேண்டும்!");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setModalProdImageUrl(reader.result as string);
        alert("படம் வெற்றிகரமாக பதிவேற்றப்பட்டது! (Image Uploaded Successfully) 📸");
      };
      reader.readAsDataURL(file);
    }
  };

  // CUSTOM STORE PROFILE MANAGER CONFIG
  const [profileShopName, setProfileShopName] = useState<string>('TemperKing (அரக்கோணம் ஜங்ஷன் கிளை)');
  const [profileDomain, setProfileDomain] = useState<string>('temperking.in');
  const [profileGpsCoordinates, setProfileGpsCoordinates] = useState<string>('12.9249° N, 79.6688° E');
  const [profileAddress, setProfileAddress] = useState<string>('அரக்கோணம் ரயில்வே ஜங்ஷன் ரவுண்டானா அருகில், டெம்பர் கிங் பிரத்யேக ஷோரூம்.');
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState<boolean>(false);

  // NEW SHOP CREATION BUFFER FOR ADMINS
  const [newShopName, setNewShopName] = useState<string>('');
  const [newShopAddress, setNewShopAddress] = useState<string>('');
  const [newShopGps, setNewShopGps] = useState<string>('12.9270° N, 79.6650° E');
  const [newShopDomain, setNewShopDomain] = useState<string>('');

  const getShopDisplayName = (shopName: string) => {
    const shop = availableShops.find(sh => sh.name === shopName || sh.displayName === shopName);
    return shop ? shop.displayName : shopName;
  };

  const getShopAddressAndDetails = (shopName: string) => {
    const shop = availableShops.find(sh => sh.name === shopName || sh.displayName === shopName);
    if (shop) {
      return {
        address: shop.address,
        gps: shop.gps,
        displayName: shop.displayName,
        domain: shop.domain
      };
    }
    return {
      address: '📍 அரக்கோணம் வட்டாரம், தமிழ்நாடு.',
      gps: '12.9249° N, 79.6688° E',
      displayName: shopName,
      domain: 'temperking.in'
    };
  };

  const handleCreateNewShop = () => {
    if (!newShopName.trim()) {
      alert('தயவுசெய்து கடையின் பெயரை உள்ளிடவும்!');
      return;
    }
    const cleanId = 'shop-' + Date.now();
    const cleanName = newShopName.replace(/\s+/g, '') + 'Branch';
    const newShop = {
      id: cleanId,
      name: cleanName,
      displayName: newShopName,
      address: newShopAddress || '📍 அரக்கோணம் வட்டாரம், தமிழ்நாடு.',
      gps: newShopGps || '12.9249° N, 79.6688° E',
      domain: newShopDomain ? newShopDomain.toLowerCase() : `${newShopName.toLowerCase().replace(/\s+/g, '')}.in`
    };
    setAvailableShops(prev => [...prev, newShop]);
    setSimShop(cleanName);
    setNewShopName('');
    setNewShopAddress('');
    setNewShopDomain('');
    alert(`வெற்றி! புதிய கிளை வெற்றிகரமாக உருவாக்கப்பட்டு TrustSpares நெட்வொர்க்கில் இணைக்கப்பட்டது!\n\nகிளை: ${newShopName}\nஇப்போது நீங்கள் 'ஸ்டெப் 1' பகுதிக்குச் சென்று, இந்த புதிய கிளையைத் தேர்வு செய்து பொருட்களை உடனடியாகப் பதிவேற்றலாம்!`);
  };

  const handleSimulateAddProduct = () => {
    if (!simProdName.trim()) return;
    setIsSimulatingAdd(true);
    setTimeout(() => {
      const newProd = {
        id: 'sim-' + Date.now(),
        name: simProdName,
        category: simProdCategory,
        price: simProdPrice,
        shop: simShop,
        timestamp: 'Just now',
        syncStatus: 'synced'
      };
      setSimulatedProducts(prev => [newProd, ...prev]);
      setIsSimulatingAdd(false);
      // Automatically switch to step 2 to show sync
      setActiveStepTab('sync');
    }, 1200);
  };

  const handleSimulateBooking = (product: any) => {
    setSelectedBookingSimItem(product);
    setSimBookingStatus('booked');
    setActiveStepTab('book');
  };

  const handleDeleteProduct = (productId: string) => {
    setSimulatedProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleEditProductPrice = (productId: string, newPrice: number) => {
    setSimulatedProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, price: newPrice };
      }
      return p;
    }));
  };

  const handleEditProductOriginalPrice = (productId: string, newPrice: number) => {
    setSimulatedProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, originalPrice: newPrice };
      }
      return p;
    }));
  };

  const handleEditProductStock = (productId: string, newStockCount: number) => {
    setSimulatedProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, stockCount: Math.max(0, newStockCount) };
      }
      return p;
    }));
  };

  const handleTopAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topProdName.trim()) {
      alert("தயவுசெய்து தயாரிப்பின் பெயரை உள்ளிடவும்!");
      return;
    }
    
    let targetShop = simShop;
    if (simLoggedStaffId !== 'ALL') {
      const shopObj = availableShops.find(sh => sh.id === simLoggedStaffId);
      if (shopObj) {
        targetShop = shopObj.name;
      }
    }

    const newProd = {
      id: 'sim-' + Date.now(),
      name: topProdName,
      category: topProdCategory,
      price: Number(topProdPrice) || 299,
      shop: targetShop,
      timestamp: 'Just now',
      syncStatus: 'synced'
    };

    setSimulatedProducts(prev => [newProd, ...prev]);
    setTopProdName('');
    alert(`வெற்றி! "${topProdName}" தயாரிப்பு ${getShopDisplayName(targetShop).split(' (')[0]} கிளையில் வெற்றிகரமாக சேர்க்கப்பட்டது! அது கீழே உள்ள பொதுத் தயாரிப்புப் பட்டியலிலும் தானாகவே இணைக்கப்பட்டுவிட்டது! ✨`);
  };

  const handleModalAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalProdName.trim()) {
      alert("தயவுசெய்து தயாரிப்பின் பெயரை உள்ளிடவும்!");
      return;
    }

    const defaultImg = modalProdImageUrl.trim() || (
      modalProdCategory === 'BIKE_SPARE'
        ? 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop'
        : modalProdCategory === 'TV_SPARE'
          ? 'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=600&auto=format&fit=crop'
          : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop'
    );

    const featureArray = modalProdFeatures
      ? modalProdFeatures.split(',').map(f => f.trim()).filter(Boolean)
      : ['Instant Booking', 'Direct Shop Pickup', '5 Min Fitting Available'];

    const newProd = {
      id: 'sim-' + Date.now(),
      name: modalProdName,
      englishName: modalProdEngName || `${modalProdName.split(' ')[0]} Premium Armor`,
      category: modalProdCategory,
      price: Number(modalProdPrice) || 299,
      originalPrice: Number(modalProdOriginalPrice) || (Number(modalProdPrice) * 2),
      shop: modalProdShop,
      imageUrl: defaultImg,
      description: modalProdDescription.trim() || `பிரீமியம் தர ${modalProdName} உங்கள் சாதனத்தை மிகக் கடுமையான தாக்கத்திலிருந்தும் பாதுகாக்கும் கவசம்.`,
      stockCount: Number(modalProdStockCount) || 20,
      rating: Number(modalProdRating) || 4.9,
      protectionScore: Number(modalProdProtectionScore) || 95,
      badge: modalProdBadge.trim() || `📍 ${getShopDisplayName(modalProdShop).split(' (')[0]}`,
      features: featureArray,
      timestamp: 'Just now',
      syncStatus: 'synced',
      isBanner: modalProdIsBanner
    };

    setSimulatedProducts(prev => [newProd, ...prev]);
    
    // Clear form states
    setModalProdName('');
    setModalProdEngName('');
    setModalProdPrice(399);
    setModalProdOriginalPrice(799);
    setModalProdImageUrl('');
    setModalProdDescription('');
    setModalProdStockCount(20);
    setModalProdRating(4.9);
    setModalProdProtectionScore(95);
    setModalProdBadge('');
    setModalProdFeatures('9H Hardness, Oleophobic Anti-Fingerprint, Premium Air-Bubble Free Fitting');
    setModalProdIsBanner(false);
    
    setAddProductModalOpen(false);
    alert(`வெற்றி! "${modalProdName}" தற்போது நேரலையில் சேர்க்கப்பட்டது! அது கடைப் பக்கத்தில் மற்றும் TrustSpares பொது இருப்புப் பட்டியலிலும் உடனடியாகக் காட்சியளிக்கும்! ✨🛒`);
  };

  // VIRAL REFERRAL & APP ENGAGEMENT STATES
  const [hasShared, setHasShared] = useState<boolean>(() => {
    return localStorage.getItem('temperking_shared_viral') === 'true';
  });
  const [sharingCount, setSharingCount] = useState<number>(() => {
    return parseInt(localStorage.getItem('temperking_share_count') || '0', 10);
  });

  const handleTriggerShare = () => {
    const userId = currentUser ? currentUser.id : 'guest';
    const referralUrl = `${window.location.origin}/#/temper-king?ref=${userId}`;
    const shareText = `🔥 மச்சான்! அரக்கோணம் ஜங்ஷன் பக்கத்துல 'டெம்பர் கிங் (temperking.in)' கடையில் "Buy 1 Get 1 Free" (1 வாங்குனா 1 டெம்பர் இலவசம்) ஆபர் தராங்க! 👑\n\nஅமேசான் தரத்துல லேசர் பொருத்தம் செய்ய இந்த லிங்க் கிளிக் பண்ணி உங்களோட பிரீமியம் கூப்பனை அன்லாக் செய்யுங்க:\n👉 ${referralUrl}\n\nநம்ம TrustSpares ஆப்பை டவுன்லோடு செஞ்சு உடனே இந்த ஆபர் பாஸை எடுத்துக்கோங்க!`;

    setSharingCount(prev => {
      const next = prev + 1;
      localStorage.setItem('temperking_share_count', next.toString());
      return next;
    });
    setHasShared(true);
    localStorage.setItem('temperking_shared_viral', 'true');

    if (navigator.share) {
      navigator.share({
        title: 'TemperKing.in | Buy 1 Get 1 Free Arakkonam',
        text: shareText,
        url: referralUrl,
      }).catch(() => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
      });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const addToCart = (product: TemperProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
    setCartItemsCount(prev => prev + 1);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const item = prev.find(i => i.product.id === productId);
      if (!item) return prev;
      setCartItemsCount(c => Math.max(0, c - item.quantity));
      return prev.filter(i => i.product.id !== productId);
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) {
            setCartItemsCount(c => Math.max(0, c - 1));
            return null;
          }
          setCartItemsCount(c => Math.max(0, c + delta));
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter((item): item is {product: TemperProduct; quantity: number} => item !== null);
    });
  };

  const handleProceedToCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutError(null);

    if (!shippingName.trim()) {
      setCheckoutError("தயவுசெய்து உங்களின் பெயரை முழுமையாக உள்ளிடவும்! (Name is required)");
      return;
    }
    if (!shippingPhone.trim()) {
      setCheckoutError("தயவுசெய்து உங்களின் 10-இலக்க கைபேசி எண்ணை உள்ளிடவும்! (Mobile number is required)");
      return;
    }
    if (shippingPhone.trim().length < 8) {
      setCheckoutError("தயவுசெய்து சரியான கைபேசி எண்ணை உள்ளிடவும்! (Enter a valid mobile phone number)");
      return;
    }

    if (fulfillmentType === 'courier') {
      if (!shippingAddress.trim()) {
        setCheckoutError("தயவுசெய்து உங்களது முழு விநியோக கொரியர் முகவரியை உள்ளிடவும்! (Courier address is required)");
        return;
      }
      if (!shippingPincode.trim() || shippingPincode.trim().length < 6) {
        setCheckoutError("தயவுசெய்து சரியான 6-இலக்க பின்கோடு எண்ணை உள்ளிடவும்! (6-digit Pincode is required)");
        return;
      }
    }

    let itemsText = cart.map(item => `• *${item.product.name}* (Qty: ${item.quantity}) - ₹${item.product.price * item.quantity}`).join('\n');
    const total = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

    const selectedShopObj = availableShops.find(sh => sh.id === selectedPickupShopId) || availableShops[0];
    const shopDisplayNameOnly = selectedShopObj ? selectedShopObj.displayName.split(' (')[0] : 'அரக்கோணம் கிளை';

    let msg = '';
    if (fulfillmentType === 'courier') {
      msg = `வணக்கம் டெம்பர் கிங் 👑! எனது "கார்ட்டில் உள்ள ஆர்டர் விவரங்கள்" (கொரியர் டெலிவரி):\n\n${itemsText}\n\n*மொத்த தொகை: ₹${total}*\n\n*விருப்பு வகை (Fulfillment)*: 🚚 வீட்டு வாசலில் கொரியர் டெலிவரி (Courier Delivery)\n*பெயர் (Name)*: ${shippingName}\n*கைபேசி (Phone)*: ${shippingPhone}\n*முகவரி (Address)*: ${shippingAddress}, ${shippingCity} - ${shippingPincode}\n\nஎன்னுடைய முகவரிக்கு பார்சலை கச்சிதமாக பேக் செய்து, கொரியர் டிராக்கிங் ஐடி அனுப்பி வைக்குமாறு கேட்டுக்கொள்கிறேன்!`;
    } else {
      msg = `வணக்கம் டெம்பர் கிங் 👑! எனது "கார்ட்டில் உள்ள ஆர்டர் விவரங்கள்" (நேரடி வருகை முன்பதிவு):\n\n${itemsText}\n\n*மொத்த தொகை: ₹${total}*\n\n*விருப்பு வகை (Fulfillment)*: 🏪 கடையில் வந்து பொருத்தி வாங்குதல் (Store Pickup)\n*தேர்வு செய்த கிளை (Branch)*: ${shopDisplayNameOnly}\n*வருகை நேரம் (Time Slot)*: ${selectedPickupTime}\n*முன்பதிவாளர் பெயர் (Name)*: ${shippingName}\n*கைபேசி (Phone)*: ${shippingPhone}\n\nகடைக்கு நேரடியாக வந்து 5 நிமிடத்தில் இலவசமாகப் பொருத்திப் பெற்றுக் கொள்கிறேன்!`;
    }

    // REAL IN-APP ORDER PLACEMENT FLOW with automatic stock deduction & tracking
    const orderId = 'TK-ORD-' + Math.floor(100000 + Math.random() * 900000);
    const orderOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const bonusEarned = Math.floor(Math.random() * 6) + 5; // ₹5 to ₹10 Random

    const newOrder = {
      id: orderId,
      customerName: shippingName.trim(),
      customerPhone: shippingPhone.trim(),
      fulfillmentType: fulfillmentType,
      items: cart.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        englishName: item.product.englishName || item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
        shopName: (item.product as any).shopName || 'Arakkonam Junction Branch',
        category: item.product.category
      })),
      total: total,
      bonusPointsEarned: bonusEarned,
      status: 'PENDING', // PENDING -> PREPARING -> READY_FOR_PICKUP / SHIPPED -> COMPLETED
      shippingAddress: fulfillmentType === 'courier' ? shippingAddress.trim() : '',
      shippingCity: fulfillmentType === 'courier' ? shippingCity : 'Arakkonam',
      shippingPincode: fulfillmentType === 'courier' ? shippingPincode.trim() : '',
      pickupShopId: fulfillmentType === 'pickup' ? selectedPickupShopId : '',
      pickupShopName: fulfillmentType === 'pickup' ? shopDisplayNameOnly : '',
      pickupTimeSlot: fulfillmentType === 'pickup' ? selectedPickupTime : '',
      pickupOtp: orderOtp,
      trackingNumber: '',
      courierName: '',
      createdAt: new Date().toLocaleString('ta-IN', { timeZone: 'Asia/Kolkata' }),
      whatsappMessage: msg
    };

    // Credit Loyalty Bonus Points
    if (currentUser) {
      updateUserProfile(currentUser.id, {
        bonusPoints: (currentUser.bonusPoints || 0) + bonusEarned
      }).catch(err => console.error("Error updating user loyalty bonus:", err));
    } else {
      try {
        const guestPts = Number(localStorage.getItem('temperking_guest_bonus')) || 0;
        localStorage.setItem('temperking_guest_bonus', String(guestPts + bonusEarned));
      } catch (e) {
        console.error("Error updating guest loyalty bonus:", e);
      }
    }

    // 1. Deduct Stock from Simulated Products
    setSimulatedProducts(prev => prev.map(p => {
      const match = cart.find(item => item.product.id === p.id);
      if (match) {
        return { ...p, stockCount: Math.max(0, (p.stockCount || 25) - match.quantity) };
      }
      return p;
    }));

    // 2. Persist Order in Orders List
    setOrdersList(prev => {
      const updated = [newOrder, ...prev];
      localStorage.setItem('temperking_orders_list', JSON.stringify(updated));
      return updated;
    });

    // 3. Clear Cart
    setCart([]);
    setCartItemsCount(0);
    setCartOpen(false);

    // 4. Trigger Storage Event
    window.dispatchEvent(new Event('storage'));

    // 5. Open Elegant Order Success Dialog
    setActiveEcomOrder(newOrder);
  };

  // Dynamic mobile models matching selected brand
  const filteredModels = useMemo(() => {
    if (!selectedBrand) return [];
    return POPULAR_MODELS.filter(m => m.brand === selectedBrand);
  }, [selectedBrand]);

  // Filter deals added by admin from backend that match accessories/temper glass
  const dbTemperProducts = useMemo(() => {
    return deals.filter(deal => {
      const isAvailable = deal.status === 'AVAILABLE';
      const title = (deal.title || '').toLowerCase();
      const cat = (deal.category || '').toLowerCase();
      const desc = (deal.description || '').toLowerCase();
      
      const isTemperMatch = 
        deal.location === 'Temper King Store' ||
        cat === 'accessories' ||
        cat.includes('temper') ||
        cat.includes('glass') ||
        cat.includes('screen') ||
        title.includes('temper') ||
        title.includes('glass') ||
        title.includes('screen') ||
        desc.includes('temper') ||
        desc.includes('glass') ||
        desc.includes('screen');
        
      return isAvailable && isTemperMatch;
    });
  }, [deals]);

  // Unified products list - Prefer dynamic database listings, fallback to polished sample templates if empty
  const displayProducts = useMemo<any[]>(() => {
    let list: any[] = [];

    // 1. Add database products
    if (dbTemperProducts.length > 0) {
      const dbList = dbTemperProducts.map(deal => {
        const brandObj = BRANDS.find(b => b.id === deal.brand);
        const brandLabel = brandObj ? brandObj.label : (deal.brand?.toUpperCase() || '');
        const modelLabel = deal.model || '';
        
        let mappedCat: 'premium' | 'matte' | 'privacy' | 'uv' = 'premium';
        const titleLower = deal.title.toLowerCase();
        if (titleLower.includes('privacy') || titleLower.includes('spy')) mappedCat = 'privacy';
        else if (titleLower.includes('matte') || titleLower.includes('gaming')) mappedCat = 'matte';
        else if (titleLower.includes('uv') || titleLower.includes('curve')) mappedCat = 'uv';

        return {
          id: deal.id,
          name: deal.title,
          englishName: modelLabel ? `${brandLabel} ${modelLabel}` : `${brandLabel} Screen Guard`,
          description: deal.description || 'அரச உன்னத பாதுகாப்பு மொபைல் டெம்பர் கிளாஸ் கச்சிதமான பொருத்தம்.',
          price: deal.amount,
          originalPrice: deal.dealerPrice ? Math.max(deal.amount, deal.dealerPrice) * 2 : deal.amount * 2,
          rating: deal.rating || 4.9,
          protectionScore: deal.quality === 'ORIGINAL' ? 99 : (deal.quality === 'OLED' ? 95 : 88),
          badge: deal.quality === 'ORIGINAL' ? '👑 ORIGINAL 100%' : (deal.quality === 'OLED' ? '⚡ OLED OG' : '🛡️ KING GUARD'),
          features: deal.tags && deal.tags.length > 0 ? deal.tags : ['9H Hardness', 'Touch Glider', 'Anti-Breakage Edge'],
          imageUrl: deal.listingImage || deal.listingImages?.[0] || 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop',
          category: mappedCat,
          shopName: deal.location || 'Arakkonam Junction Branch'
        };
      });
      list = [...list, ...dbList];
    }
    
    // 2. Add simulatedProducts
    if (simulatedProducts.length > 0) {
      const simMapped = simulatedProducts.map(p => {
        let mappedCat: 'premium' | 'matte' | 'privacy' | 'uv' = 'premium';
        if (p.category === 'premium' || p.category === 'matte' || p.category === 'privacy' || p.category === 'uv') {
          mappedCat = p.category as any;
        } else if (p.category === 'BIKE_SPARE') {
          mappedCat = 'matte';
        } else if (p.category === 'TV_SPARE') {
          mappedCat = 'uv';
        } else if (p.name.toLowerCase().includes('privacy') || p.name.toLowerCase().includes('spy')) {
          mappedCat = 'privacy';
        } else if (p.name.toLowerCase().includes('matte') || p.name.toLowerCase().includes('gaming')) {
          mappedCat = 'matte';
        } else if (p.name.toLowerCase().includes('uv') || p.name.toLowerCase().includes('curve')) {
          mappedCat = 'uv';
        }

        return {
          id: p.id,
          name: p.name,
          englishName: p.englishName || `${getShopDisplayName(p.shop).split(' (')[0]} Stock`,
          description: p.description || `லைவ் ஸ்டாக் கிளை வாரியாக பதிவேற்றப்பட்டது: ${getShopDisplayName(p.shop).split(' (')[0]}.`,
          price: p.price,
          originalPrice: p.originalPrice || (p.price * 2),
          rating: p.rating || 4.9,
          protectionScore: p.protectionScore || (p.category === 'BIKE_SPARE' ? 92 : (p.category === 'TV_SPARE' ? 97 : 95)),
          badge: p.badge || `📍 ${getShopDisplayName(p.shop).split(' (')[0]}`,
          features: p.features || ['Instant Booking', 'Direct Shop Pickup', '5 Min Fitting Available'],
          imageUrl: p.imageUrl || (p.category === 'BIKE_SPARE'
            ? 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=600&auto=format&fit=crop'
            : p.category === 'TV_SPARE'
              ? 'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=600&auto=format&fit=crop'
              : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop'),
          category: mappedCat,
          shopName: p.shop,
          isSimulated: true,
          stockCount: p.stockCount || 25,
          isBanner: !!p.isBanner
        };
      });
      list = [...list, ...simMapped];
    }

    // Combine with Fallback items, marking them as available at shop-1
    const fallbackMapped = FALLBACK_TEMPER_PRODUCTS.map(f => ({
      ...f,
      shopName: 'Arakkonam Junction Branch'
    }));

    return [...list, ...fallbackMapped];
  }, [dbTemperProducts, simulatedProducts, availableShops]);

  // Dynamic products marked for advertising sliders
  const bannerProducts = useMemo(() => {
    return displayProducts.filter(p => !!p.isBanner);
  }, [displayProducts]);

  // Filtered products based on category selector, shop filter, and search query
  const filteredProducts = useMemo(() => {
    return displayProducts.filter(product => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Shop/Branch filter
      if (selectedShopFilter !== 'all') {
        const prodShop = product.shopName || 'Arakkonam Junction Branch';
        if (prodShop !== selectedShopFilter) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          product.englishName.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [displayProducts, selectedCategory, selectedShopFilter, searchQuery]);

  // Compatibility finder form submit
  const handleSearchCompat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrand) return;
    setIsSearched(true);
    // Smooth scroll down to results
    setTimeout(() => {
      document.getElementById('compat-results-anchor')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  // Copy referral link logic
  const handleCopyReferral = () => {
    const userId = currentUser?.id || 'visitor';
    const referralUrl = `${window.location.origin}/#/temper-king?ref=${userId}`;
    
    try {
      navigator.clipboard.writeText(referralUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = referralUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  // Contact on WhatsApp
  const handleWhatsAppOrder = (temperName: string) => {
    const modelName = selectedModel === 'other' ? customModelText : (selectedModel || 'அனைத்து மொபைல்');
    const brandName = BRANDS.find(b => b.id === selectedBrand)?.label || selectedBrand || 'அனைத்து பிராண்ட்';
    const msg = `வணக்கம் டெம்பர் கிங் 👑! எனக்கு *${brandName} ${modelName}* மொபைலுக்கான *${temperName}* தேவைப்படுகிறது. திறப்பு விழா Buy 1 Get 1 இலவச சலுகை எனக்கு கிடைக்குமா?`;
    
    const adminPhone = platformSettings?.supportPhone 
        ? platformSettings.supportPhone.replace('+91', '').replace(/\s/g, '') 
        : '9876543210';

    window.open(`https://wa.me/91${adminPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Appointment reservation handler
  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentName || !appointmentMobile) return;
    setBookingSuccess(true);
  };

  const handleLogout = async () => {
    try {
        if (logout) {
            await logout();
        }
    } catch (error) {
        console.error("Logout failed:", error);
    } finally {
        localStorage.clear();
        setProfileDropdownOpen(false);
        window.location.reload();
    }
  };

  const avatarUrl = currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.id || 'guest'}`;

  return (
    <div className="bg-[#0a0b0d] min-h-screen pb-24 text-gray-100 font-sans overflow-x-hidden selection:bg-amber-400 selection:text-black">
      <SEO 
        title="TemperKing.in | அமேசான் தரம் சிறந்த மொபைல் டெம்பர் கிளாஸ்" 
        description="உங்கள் போனுக்கான ராயல் டெம்பர் கிளாஸ் - Buy 1 Get 1 Free (1 வாங்குனா 1 இலவசம்) சலுகையுடன் அரக்கோணம் ஜங்ஷனில்!" 
      />

      {/* LUXURY TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-black text-[11px] font-extrabold py-1.5 px-4 sticky top-0 z-[60] shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
            <span className="inline-block w-2 bg-black h-2 rounded-full animate-ping"></span>
            <span className="uppercase tracking-wider">அரக்கோணம் ஸ்பெஷல் Buy 1 Get 1 இலவச சலுகை நேரலை 👑</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-xs opacity-90">
            <span>அமேசான் தரம்</span>
            <span>•</span>
            <span>5 நிமிட கச்சித பொருத்தம்</span>
          </div>
        </div>
      </div>

      {/* STICKY LUXURY GLASS NAV BAR */}
      <header className="sticky top-8 z-50 bg-[#0c0d10]/90 backdrop-blur-md border-b border-white/[0.06] py-3.5 px-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="cursor-pointer" onClick={() => navigate('/temper-king')}>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-baseline select-none">
                temperking<span className="text-amber-400 font-extrabold">.in</span>
                <span className="text-amber-400 text-xs ml-0.5">👑</span>
              </h1>
            </div>
          </div>

          {/* Search bar Area - Mobile responsive optimized */}
          <div className="hidden md:block flex-1 max-w-md group">
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none group-focus-within:text-amber-400">
                <Search size={14} />
              </span>
              <input 
                type="text" 
                placeholder="உங்களது போன் மாடலை தேடுங்கள்... (எ.கா: Vivo, iPhone)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-gray-200 outline-none focus:border-amber-400/60 focus:bg-white/[0.08] transition placeholder:text-gray-500"
              />
            </div>
          </div>

          {/* Action Hub - Profile & Cart Drawer Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* User Profile Dropdown Menu */}
            <div className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1.5 hover:bg-white/5 p-1.5 rounded-full transition text-left cursor-pointer border border-white/10 bg-white/[0.02]"
              >
                {currentUser ? (
                  <img src={avatarUrl} alt="Avatar" className="w-6 h-6 rounded-full border border-amber-400 object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-white/10 text-amber-400 flex items-center justify-center">
                    <User size={13} />
                  </div>
                )}
                <span className="hidden sm:inline text-[10px] font-bold text-gray-300 pr-1 truncate max-w-[80px]">
                  {currentUser ? currentUser.name : 'விருந்தினர்'}
                </span>
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileDropdownOpen(false)}></div>
                  <div className="absolute right-0 top-10 w-56 bg-[#121316] border border-white/10 rounded-xl shadow-2xl z-20 text-gray-200 p-2 text-xs">
                    {currentUser ? (
                      <div className="p-2.5 border-b border-white/[0.06] font-bold bg-amber-400/5 rounded-lg mb-1">
                        <p className="text-amber-400 uppercase font-black text-[9px] tracking-widest">அங்கீகரிக்கப்பட்டவர்</p>
                        <p className="text-white font-extrabold mt-0.5 truncate">{currentUser.shopName || currentUser.name}</p>
                        <p className="text-gray-400 font-medium text-[10px] mt-0.5">{currentUser.mobile}</p>
                      </div>
                    ) : (
                      <div className="p-2.5 border-b border-white/[0.06] font-bold bg-white/5 rounded-lg mb-1">
                        <p className="text-gray-400 uppercase font-black text-[9px] tracking-widest">வரவேற்கிறோம்</p>
                        <p className="text-white font-extrabold mt-0.5">விருந்தினர் கணக்கு (Guest)</p>
                      </div>
                    )}

                    {/* MINI LOYALTY CARD IN DROPDOWN */}
                    <div className="mx-1 mb-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-2 rounded-lg flex items-center justify-between">
                      <div className="text-left">
                        <span className="text-[8px] font-black tracking-wider text-amber-400 uppercase">போனஸ் லாயல்டி (Loyalty Bonus)</span>
                        <p className="text-base font-black text-white font-mono mt-0.5">
                          ₹{currentUser ? (currentUser.bonusPoints || 0) : (Number(localStorage.getItem('temperking_guest_bonus')) || 0)}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[8px] bg-amber-400/20 text-amber-400 border border-amber-400/10 px-1 py-0.5 rounded font-black uppercase">ACTIVE</span>
                      </div>
                    </div>
                    
                    <div className="py-1 space-y-0.5">
                      <button 
                        onClick={() => { 
                          setProfileDropdownOpen(false); 
                          setPrivateConsoleOpen(false);
                          setCurrentView('store');
                          setCustomerOrdersTabActive(true);
                        }}
                        className="w-full text-left px-3 py-2 text-amber-400 hover:bg-amber-400/10 rounded-lg font-bold flex items-center justify-between transition border-b border-white/[0.04] pb-2 mb-1"
                      >
                        <div className="flex items-center gap-2">
                          <ClipboardList size={13} className="text-amber-400" />
                          <span className="font-extrabold text-[11px]">எனது ஆர்டர்கள் (My Orders)</span>
                        </div>
                        <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-md font-extrabold font-mono">
                          {ordersList.length}
                        </span>
                      </button>

                      {isTrustSparesStaff && (
                        <button 
                          onClick={() => { 
                            setProfileDropdownOpen(false); 
                            setAddProductModalOpen(true); 
                          }}
                          className="w-full text-left px-3 py-2 text-amber-400 hover:bg-amber-400/10 rounded-lg font-bold flex items-center gap-2 transition"
                        >
                          <PlusCircle size={13} className="text-amber-400" />
                          <span>தயாரிப்பு சேர்க்கவும் (Add Stock)</span>
                        </button>
                      )}

                      <button 
                        onClick={() => { setProfileDropdownOpen(false); navigate('/'); }}
                        className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg font-bold flex items-center gap-2 transition"
                      >
                        <Compass size={13} className="text-amber-400" />
                        <span>TrustSpares முகப்பு</span>
                      </button>

                      {isTrustSparesStaff && (
                        <button 
                          onClick={() => { 
                            setProfileDropdownOpen(false); 
                            const newConsoleState = !privateConsoleOpen;
                            setPrivateConsoleOpen(newConsoleState);
                            if (newConsoleState) {
                              setCurrentView('staff-login');
                            } else {
                              setCurrentView('store');
                            }
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg font-bold flex items-center justify-between transition ${
                            privateConsoleOpen 
                              ? 'bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20' 
                              : 'text-indigo-400 hover:text-white hover:bg-indigo-500/10'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Settings size={13} className={privateConsoleOpen ? 'text-indigo-350 animate-spin-slow' : 'text-indigo-400'} />
                            <span>கிளை நேரடி பலகை (Console)</span>
                          </div>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black font-mono ${
                            privateConsoleOpen ? 'bg-indigo-500 text-white animate-pulse' : 'bg-white/10 text-gray-400'
                          }`}>
                            {privateConsoleOpen ? 'LIVE' : 'OFF'}
                          </span>
                        </button>
                      )}

                      {currentUser ? (
                        <>
                          <button 
                            onClick={handleLogout}
                            className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg font-bold flex items-center gap-2 transition"
                          >
                            <LogOut size={13} />
                            <span>வெளியேறு (Log Out)</span>
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => { setProfileDropdownOpen(false); navigate('/login?brand=temper-king', { state: { from: { pathname: '/temper-king' } } }); }}
                          className="w-full text-left px-3 py-2 text-amber-400 hover:bg-amber-500/10 rounded-lg font-bold flex items-center gap-2 transition"
                        >
                          <LogIn size={13} />
                          <span>உள்நுழைக (Sign In)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Scan Page QR Code Button */}
            <button 
              onClick={() => setShowShareQrModal(true)}
              className="flex items-center gap-1 p-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-amber-400 hover:text-white rounded-full transition cursor-pointer"
              title="QR குறியீடு - மொபைலில் திறக்க"
            >
              <QrCode size={15} />
            </button>

            {/* Premium Shopping Cart icon Trigger */}
            <button 
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-1.5 p-2 bg-amber-400 hover:bg-amber-500 rounded-full text-black font-extrabold relative cursor-pointer shadow-lg hover:shadow-amber-400/10 transition"
            >
              <ShoppingCart size={15} />
              <span className="bg-black text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-4 text-center leading-none">
                {cartItemsCount}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE SEARCH BAR */}
      <div className="px-4 mt-3 md:hidden">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <Search size={14} />
          </span>
          <input 
            type="text" 
            placeholder="உங்களது போன் மாடலை தேடுங்கள்..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-gray-200 outline-none focus:border-amber-400/60 focus:bg-white/[0.08]"
          />
        </div>
      </div>

      {/* PROFESSIONAL MULTI-PAGE WORKSPACE SWITCHER - ONLY VISIBLE WHEN PRIVATE CONSOLE IS ACTIVATED */}
      {privateConsoleOpen && (
        <div className="max-w-7xl mx-auto px-4 mt-6 mb-2 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-indigo-950/20 border border-indigo-500/10 rounded-2xl p-4 sm:p-5 mb-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/[0.04] rounded-full blur-[50px] pointer-events-none"></div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.06] pb-3 mb-3">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-widest font-mono">
                  <span className="inline-block w-2 bg-indigo-400 h-2 rounded-full animate-pulse"></span>
                  <span>TEMPERKING PRIVATE WORKSTATION & STAFF HUB (கன்சோல்)</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">ஊழியர்கள் மற்றும் கிளை நிர்வாகத்திற்கான பிரத்தியேக தனிப்பயன் கட்டுப்பாட்டு பலகை.</p>
              </div>
              <button
                onClick={() => {
                  setPrivateConsoleOpen(false);
                  setCurrentView('store');
                }}
                className="bg-indigo-505 hover:bg-indigo-600 active:scale-95 text-white font-black text-[10px] uppercase tracking-wider py-1.5 px-3.5 rounded-xl border border-indigo-400/30 hover:border-indigo-400/50 transition cursor-pointer flex items-center gap-1.5"
              >
                <X size={11} className="text-white" />
                <span>கன்சோலை மூடு (Exit Console)</span>
              </button>
            </div>

            <div className="bg-[#0e1014] border border-white/10 rounded-2xl p-1.5 flex flex-wrap gap-1.5 justify-center md:justify-start">
              <button
                onClick={() => setCurrentView('store')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition duration-200 cursor-pointer ${
                  currentView === 'store'
                    ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20'
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Store size={14} />
                <span>🛒 வாடிக்கையாளர் கடை (Storefront)</span>
              </button>

              <button
                onClick={() => setCurrentView('staff-login')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition duration-200 cursor-pointer ${
                  currentView === 'staff-login'
                    ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <User size={14} />
                <span>👥 ஊழியர் லாகின் {simLoggedStaffId !== 'ALL' && '🟢'} (Staff Login)</span>
              </button>

              <button
                onClick={() => {
                  setCurrentView('trustspares-admin');
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition duration-200 cursor-pointer ${
                  currentView === 'trustspares-admin'
                    ? 'bg-[#a855f7] text-white shadow-lg shadow-[#a855f7]/25'
                    : 'bg-transparent text-purple-300 hover:text-white hover:bg-[#a855f7]/10'
                }`}
              >
                <ShieldCheck size={14} className="text-purple-400" />
                <span>🛡️ TRUSTSPARES அட்மின் (Central Admin Panel)</span>
              </button>

              <button
                onClick={() => setCurrentView('billing')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition duration-200 cursor-pointer ${
                  currentView === 'billing'
                    ? 'bg-emerald-500 text-black font-extrabold shadow-lg shadow-emerald-500/20'
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Clipboard size={14} />
                <span>📋 பில்லிங் சிஸ்டம் (Walk-In Billing)</span>
              </button>

              <button
                onClick={() => setCurrentView('inventory')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition duration-200 cursor-pointer ${
                  currentView === 'inventory'
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Database size={14} />
                <span>📦 இருப்பு மேலாண்மை (Inventory Control)</span>
              </button>

              <button
                onClick={() => setCurrentView('add-stock')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition duration-200 cursor-pointer ${
                  currentView === 'add-stock'
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <PlusCircle size={14} />
                <span>⚡ தயாரிப்பு சேர் (Add Product)</span>
              </button>

              <button
                onClick={() => setCurrentView('orders-live')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition duration-200 cursor-pointer ${
                  currentView === 'orders-live'
                    ? 'bg-amber-400 text-black shadow-lg shadow-amber-400/20 font-extrabold'
                    : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Truck size={14} />
                <span>📦 கிளை முன்பதிவுகள் ({
                  (() => {
                    const activeShopObj = availableShops.find(sh => sh.name === simShop || sh.displayName === simShop || sh.id === simShop) || availableShops[0];
                    return ordersList.filter(o => 
                      o.status !== 'COMPLETED' && 
                      o.status !== 'CANCELLED' && 
                      (o.pickupShopId === activeShopObj?.id || o.items.some((i: any) => i.shopName === activeShopObj?.displayName.split(' (')[0] || i.shopName === activeShopObj?.name))
                    ).length;
                  })()
                })</span>
              </button>
            </div>

            {/* Selected View Context Banner */}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 bg-white/[0.02] border border-white/[0.06] rounded-xl text-[10px] text-gray-400">
              <div className="flex items-center gap-1.5 font-semibold">
                <span className="text-amber-400">📍</span>
                <span>செயலில் உள்ள கிளை:</span>
                <span className="text-white font-black">{getShopDisplayName(simShop).split(' (')[0]}</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold">
                <span className="text-indigo-400">👤</span>
                <span>பணிபுரியும் ஊழியர்:</span>
                <span className="text-white font-black">{simLoggedStaffName} ({simLoggedStaffRole})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span className="text-emerald-400 font-bold">TrustSpares Live Cloud Linked</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {(!privateConsoleOpen || currentView === 'store') && (
        <>
          {!customerOrdersTabActive ? (
            <>
              {/* DYNAMIC STUDIO COGNIZANT HERO CONTAINER */}
              <section className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-gradient-to-br from-[#121316] via-[#1a1b20] to-[#0d0e12] border border-white/[0.06] rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Subtle Ambient Decorative Gradients */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/[0.03] rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-blue-500/[0.02] rounded-full blur-[100px] pointer-events-none"></div>

          {/* Live Dynamic Banner Showcase Slider */}
          {bannerProducts.length > 0 ? (
            (() => {
              const activePromoProduct = bannerProducts[activeBannerIdx % bannerProducts.length];
              return (
                <>
                  {/* Left Dynamic Context Briefing */}
                  <div className="space-y-4 max-w-lg relative z-10 text-left">
                    <div className="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-450 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
                      <Sparkles size={11} className="text-amber-400" />
                      <span>சிறப்பு விளம்பரத் தயாரிப்பு (ACTIVE HERO CAMPAIGN)</span>
                    </div>
                    
                    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-lg w-max">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{activePromoProduct.category?.toUpperCase() || "PREMIUM"}</span>
                      <span className="text-[9px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-1.5 py-0.2 rounded uppercase font-black tracking-wide">Featured Banner</span>
                    </div>
                    
                    <h2 className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-white leading-tight">
                      {activePromoProduct.name} <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200 font-bold">₹{activePromoProduct.price}</span>
                    </h2>
                    
                    <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium">
                      {activePromoProduct.description || "பிரீமியம் தர மொபைல் டெம்பர் கிளாஸ் கியாரண்டி கார்டு மற்றும் கச்சிதமான 5 நிமிட பொருத்துதல் வசதியுடன் இப்போது நமது கிளைகளில் மட்டுமே!"}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button 
                        onClick={() => {
                          handleAddToPOSCart(activePromoProduct);
                          alert(`வெற்றி! "${activePromoProduct.name}" உடனுக்குடன் பில்லிங் கூடையில் சேர்க்கப்பட்டுவிட்டது! பில் செய்ய பில்லிங் சிஸ்டம் பகுதிக்கு செல்லவும்! 🛒`);
                        }}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition px-5 py-3 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-purple-500/10 active:scale-95 cursor-pointer"
                      >
                        <ShoppingCart size={13} />
                        <span>🛒 பில்லிங் கூடையில் சேர் (Quick POS Cart)</span>
                      </button>
                      
                      {bannerProducts.length > 1 && (
                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 ml-1">
                          <button 
                            onClick={() => setActiveBannerIdx(prev => (prev - 1 + bannerProducts.length) % bannerProducts.length)}
                            className="p-1.5 hover:bg-white/10 rounded-full text-white cursor-pointer"
                            title="Previous Banner"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <span className="text-[10px] font-bold tracking-widest px-1.5 font-mono text-gray-300">
                            {activeBannerIdx + 1}/{bannerProducts.length}
                          </span>
                          <button 
                            onClick={() => setActiveBannerIdx(prev => (prev + 1) % bannerProducts.length)}
                            className="p-1.5 hover:bg-white/10 rounded-full text-white cursor-pointer"
                            title="Next Banner"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Dynamic Glass Cover Card */}
                  <div className="hidden md:flex w-56 sm:w-64 shrink-0 relative flex-col items-center justify-center pt-2 select-none">
                    <div className="relative group overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-[#121316] p-3 w-52 sm:w-56 transform transition duration-300 hover:scale-105">
                      <div className="aspect-square w-full overflow-hidden rounded-xl bg-black relative">
                        <img 
                          src={activePromoProduct.imageUrl} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop';
                          }}
                        />
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 text-white font-black uppercase text-[8px] tracking-widest px-2 py-0.5 rounded-full shadow-lg">
                          HOT BANNER 🔥
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded text-[10px] font-black text-amber-400 font-mono border border-white/10">
                          ₹{activePromoProduct.price}
                        </div>
                      </div>
                      
                      <div className="mt-2 text-left space-y-1">
                        <p className="text-[11px] font-black text-white truncate uppercase">{activePromoProduct.name}</p>
                        <div className="flex items-center gap-1 text-[8.5px] text-gray-400">
                          <span>⭐ {activePromoProduct.rating || 4.9}</span>
                          <span>•</span>
                          <span className="text-purple-400 truncate">{activePromoProduct.badge || `📍 ${getShopDisplayName(simShop).split(' (')[0]}`}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()
          ) : (
            <>
              {/* Default Left Context Briefing (Fallback default template) */}
              <div className="space-y-4 max-w-lg relative z-10 text-left">
                <div className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 text-amber-400 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                  <Sparkles size={11} className="animate-spin-slow text-amber-400" />
                  <span>அரக்கோணத்தின் முதன்மை டெம்பர் கிளாஸ் ஷோரூம்</span>
                </div>
                
                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.08] px-3 py-1.5 rounded-lg w-max">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">TemperKing</span>
                  <span className="text-[9px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-1.5 py-0.2 rounded uppercase font-black tracking-wide">by TrustSpares</span>
                </div>
                
                <h2 className="text-2xl sm:text-4xl font-black font-sans tracking-tight text-white leading-tight">
                  Buy 1 Get 1 Free <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">(1 வாங்குனா 1 இலவசம்!)</span>
                </h2>
                
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-semibold">
                  அரக்கோணத்தின் புதிய <span className="text-white font-extrabold">temperking.in</span> பிரமாண்ட தொடக்க சலுகை! உங்களுக்கான பிரத்யேக 1+1 ஆஃபர் கூப்பனை உடனடியாகப் பெற்று கடையில் பயன்படுத்திக் கொள்ளுங்கள்!
                </p>

                <div className="pt-2">
                  <button 
                    onClick={() => setShowBogoClaimModal(true)} 
                    className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black px-6 py-4 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-400/20 active:scale-95 cursor-pointer group transition-all w-full sm:w-auto"
                  >
                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                    <Gift size={16} className="animate-bounce" />
                    <span>🎁 1+1 இலவச கூப்பனை பெற்றிடுக (Claim BOGO!)</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
                  </button>
                  <p className="text-[10px] text-gray-450 mt-2.5 font-sans font-semibold flex items-center gap-1 text-amber-300/80">
                    🔒 எளிய முறையில் உங்களது போன் மாடலைக் கொடுத்துப் பெற்றுவிடுக!
                  </p>
                </div>
              </div>

              {/* Right Floating Glass Mock Frame - High Fidelity Visuals in pure HTML/CSS */}
              <div className="hidden md:flex w-56 sm:w-64 h-72 sm:h-80 shrink-0 relative items-center justify-center select-none pt-4">
                {/* Phone Base Body */}
                <div className="w-40 sm:w-44 h-64 sm:h-72 bg-[#18191d] rounded-[32px] border-4 border-[#33353e] shadow-[0_15px_40px_rgba(0,0,0,0.8)] relative p-2 overflow-hidden flex flex-col justify-between">
                  {/* Dynamic screen context */}
                  <div className="absolute inset-x-0 top-1 mx-auto w-16 h-3.5 bg-black rounded-full z-20 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-blue-900/40"></span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-[#18191d] to-[#252830] z-0 opacity-80"></div>
                  
                  <div className="text-center text-[10px] text-gray-500 relative z-10 pt-6 font-mono leading-none">
                    <span className="text-amber-400 font-bold">ARMOR ACTIVE</span>
                    <p className="text-[7px] text-gray-650 mt-0.5">READY TO PROTECT</p>
                  </div>

                  <div className="w-full relative z-10 bg-white/[0.02] border border-white/[0.05] p-2 rounded-xl text-center space-y-1 mb-2">
                    <p className="text-[9px] font-black text-white">9H DIAMOND COATING</p>
                    <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full w-[95%]"></div>
                    </div>
                  </div>
                </div>

                {/* Hovering Glass Protector Layer */}
                <div className="absolute w-[42%] sm:w-[44%] h-[82%] border border-white/45 bg-white/10 rounded-2xl shadow-[0_20px_50px_rgba(251,191,36,0.12)] backdrop-blur-[0.5px] transform -rotate-6 translate-x-3 -translate-y-8 transition-all hover:rotate-0 hover:translate-x-0 hover:translate-y-0 cursor-pointer">
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-black rounded-full opacity-60"></div>
                  {/* Glass shine glare lines */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                    <div className="bg-amber-500 text-black text-[7px] font-black tracking-widest uppercase px-1 rounded">TEMPER KING</div>
                    <span className="text-[10px] font-black text-white mt-1 uppercase">PREMIUM</span>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      </section>

      {/* PREMIUM HORIZONTAL BRAND QUICK PILL COMPASS */}
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="border-b border-white/[0.06] pb-3 mb-4">
          <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
            <SlidersHorizontal size={12} />
            <span>மொபைல் பிராண்ட் தேர்வு செய்க (Brand Selector)</span>
          </p>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-3 scrollbar-none">
          <button 
            onClick={() => { setSelectedBrand(''); setSelectedModel(''); }}
            className={`px-4 py-2 rounded-full text-xs font-black tracking-wider transition-all whitespace-nowrap border ${
              selectedBrand === '' 
                ? 'bg-amber-400 text-black border-amber-400 shadow-md' 
                : 'bg-white/[0.03] text-gray-300 border-white/10 hover:bg-white/10'
            }`}
          >
            அனைத்து பிராண்டுகளும் (ALL)
          </button>
          {BRANDS.map((brand) => (
            <button 
              key={brand.id}
              onClick={() => { setSelectedBrand(brand.id); setSelectedModel(''); }}
              className={`px-4 py-2 rounded-full text-xs font-black tracking-wider transition-all whitespace-nowrap border ${
                selectedBrand === brand.id 
                  ? 'bg-amber-400 text-black border-amber-400 shadow-md' 
                  : 'bg-white/[0.03] text-gray-300 border-white/10 hover:bg-white/10'
              }`}
            >
              🏢 {brand.label}
            </button>
          ))}
        </div>

        {/* Dynamic Model Sub-Selector Pill Container (if brand is chosen) */}
        {selectedBrand && filteredModels.length > 0 && (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 mt-3 animate-in fade-in duration-200">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">உங்களது துல்லியமான மொபைல் மாடல்:</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
              {filteredModels.map((model) => (
                <button 
                  key={model.id}
                  onClick={() => setSelectedModel(model.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    selectedModel === model.name 
                      ? 'bg-white text-black font-extrabold shadow-sm' 
                      : 'bg-white/[0.06] text-gray-300 hover:bg-white/[0.12]'
                  }`}
                >
                  {model.name}
                </button>
              ))}
              <button 
                onClick={() => setSelectedModel('other')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                  selectedModel === 'other' 
                    ? 'bg-white text-black font-extrabold' 
                    : 'bg-white/[0.06] text-gray-300'
                }`}
              >
                📝 வேறு மாடல்...
              </button>
            </div>

            {selectedModel === 'other' && (
              <div className="mt-3 max-w-sm">
                <input 
                  type="text" 
                  placeholder="மொபைல் மாடல் பெயரை உள்ளிடவும் (எ.கா: Redmi Note 13 Pro+)"
                  value={customModelText}
                  onChange={(e) => setCustomModelText(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-200 outline-none focus:border-amber-400"
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* CORE PRODUCT SHEETS & TABS SECTION */}
      <section className="max-w-7xl mx-auto px-4 mt-8">

        {/* Category filtering section */}
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-1.5">
              <span>🛡️ பிரீமியம் டெம்பர் கிளாஸ்கள்</span>
              <span className="text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded text-[9px] font-black uppercase">1+1 FREE ON ALL ITEMS</span>
            </h3>
            <p className="text-[10px] text-gray-400 mt-0.5">எங்களின் அதிநவீன கிலாஸ் வகைகள் அனைத்தும் அரக்கோணத்தில் மிகக் குறைந்த விலையில்.</p>
          </div>

          <div className="hidden sm:flex gap-1.5 bg-white/[0.03] p-1 rounded-xl border border-white/[0.05]">
            {[
              { id: 'all', label: 'அனைத்தும்' },
              { id: 'premium', label: 'கொரில்லா ப்ரோ' },
              { id: 'privacy', label: 'பிரைவசி' },
              { id: 'matte', label: 'கேமிங் மேட்' },
              { id: 'uv', label: '3D UV' }
            ].map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition ${
                  selectedCategory === cat.id 
                    ? 'bg-amber-400 text-black shadow' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Small screen categories select */}
        <div className="sm:hidden mb-5">
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'all', label: 'அனைத்தும்' },
              { id: 'premium', label: 'ப்ரோ கொரில்லா' },
              { id: 'privacy', label: 'பிரைவசி' },
              { id: 'matte', label: 'கேமிங் மேட்' },
              { id: 'uv', label: '3D UV' }
            ].map(cat => (
              <button 
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-2 px-3 rounded-xl border text-[11px] font-bold text-center transition ${
                  selectedCategory === cat.id 
                    ? 'bg-amber-400 text-black border-amber-400 font-extrabold shadow-sm' 
                    : 'bg-white/[0.03] text-gray-300 border-white/[0.05] hover:bg-white/[0.06]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic products list renders in pristine Luxury Bento Card layouts */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-3xl p-16 text-center space-y-3">
            <Smartphone size={40} className="text-gray-600 mx-auto" />
            <h4 className="font-extrabold text-white text-base">பொருத்தமான தயாரிப்புகள் எதுவும் கிடைக்கவில்லை</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">வேறு உங்களது பிராண்ட் அல்லது தேடல் வார்த்தையை மாற்றிப் பரிசோதியுங்கள்.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {filteredProducts.map((product) => {
              const listPrice = product.originalPrice || (product.price * 2);
              const discountPct = Math.round(((listPrice - product.price) / listPrice) * 100);

              const isSuperAdmin = simLoggedStaffId === 'ALL';
              const isOwnerOfProduct = isSuperAdmin || (
                (simLoggedStaffId === 'shop-1' && (product.shopName === 'Arakkonam Junction Branch' || !product.shopName)) ||
                (simLoggedStaffId === 'shop-2' && product.shopName === 'Gandhi Road Electronics') ||
                (simLoggedStaffId === 'shop-3' && product.shopName === 'Old Town Auto Garage')
              );

              return (
                <div 
                  key={product.id} 
                  onClick={() => setSelectedDetailProduct(product)}
                  className="bg-[#121316]/80 backdrop-blur-md rounded-2xl border border-white/[0.08] overflow-hidden flex flex-col hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-400/[0.02] transition-all duration-300 group relative p-2.5 text-xs animate-in fade-in duration-200 cursor-pointer"
                >
                  {/* Absolute 1+1 Free dynamic luxury badge */}
                  <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-red-650 to-rose-650 text-white text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md z-10 shadow-md">
                    1+1 FREE
                  </div>

                  {/* Authorized Branch Action Overlays */}
                  {isOwnerOfProduct && (
                    <div className="absolute top-2.5 right-2 tracking-normal flex items-center gap-1 z-20">
                      {/* Edit Price Icon */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newPrice = prompt(`"${product.name}" தயாரிப்பின் புதிய விலையை உள்ளிடவும் (Current: ₹${product.price}):`, product.price.toString());
                          if (newPrice && !isNaN(Number(newPrice))) {
                            handleEditProductPrice(product.id, Number(newPrice));
                            alert("வெற்றி! தயாரிப்பின் விலை மாற்றி அமைக்கப்பட்டது! ✨");
                          }
                        }}
                        title="விலையைத் திருத்து"
                        className="bg-blue-605 hover:bg-blue-700 text-white p-1 rounded-md shadow-md transition-all cursor-pointer border border-blue-400/20 active:scale-90"
                      >
                        <SlidersHorizontal size={10} className="stroke-[2.5px]" />
                      </button>
                      
                      {/* Delete Icon (Simulated items) */}
                      {product.id.toString().startsWith('sim-') && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`கண்டிப்பாக "${product.name}" தயாரிப்பை பட்டியலிலிருந்து நீக்க விரும்புகிறீர்களா?`)) {
                              handleDeleteProduct(product.id);
                              alert("வெற்றி! தயாரிப்பு வெற்றிகரமாக நீக்கப்பட்டது! 🗑️");
                            }
                          }}
                          title="தயாரிப்பை நீக்கு"
                          className="bg-red-655 hover:bg-red-700 text-white p-1 rounded-md shadow-md transition-all cursor-pointer border border-red-500/20 active:scale-90"
                        >
                          <X size={10} className="stroke-[3px]" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Aspect Square Image container */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-white/[0.02]">
                    <img 
                      alt={product.englishName} 
                      src={product.imageUrl} 
                      className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Floating Premium glass outline effect overlay */}
                    <div className="absolute inset-0 p-2 flex items-center justify-center pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity duration-300">
                      <div className="w-[45%] h-[85%] border border-white/40 bg-white/5 rounded-lg shadow-inner backdrop-blur-[0.5px]"></div>
                    </div>

                    <div className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur border border-white/5 px-1.5 py-0.5 rounded text-[7px] font-black text-amber-400">
                      {product.badge}
                    </div>
                  </div>

                  {/* Meta Details container */}
                  <div className="pt-2 flex flex-col justify-between flex-1 mt-1">
                    <div className="space-y-1">
                      <h4 className="font-extrabold text-xs text-white leading-snug line-clamp-1 group-hover:text-amber-400 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-[8px] text-gray-500 uppercase tracking-tight font-mono line-clamp-1">{product.englishName}</p>
                      
                      {/* Star Rating and Counts row */}
                      <div className="flex items-center gap-1">
                        <div className="flex text-amber-400">
                          <Star size={9} className="fill-amber-400 stroke-amber-400" />
                        </div>
                        <span className="text-[9px] font-black text-amber-300">{product.rating}</span>
                        <span className="text-[8px] text-gray-500">• {Math.round(product.rating * 42)}+ ஆர்டர்கள்</span>
                      </div>
                    </div>

                    {/* Price and actions */}
                    <div className="mt-2 pt-1.5 border-t border-white/[0.04]">
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-white text-sm font-black">₹{product.price}</span>
                            <span className="text-rose-500 text-[10px] font-bold">-{discountPct}%</span>
                          </div>
                          <p className="text-[8px] text-gray-500 line-through">M.R.P: ₹{listPrice}</p>
                        </div>
                      </div>
                      
                      {/* Interactive click helper badge */}
                      <div className="mt-2 text-[9px] text-amber-400/80 group-hover:text-amber-400 font-extrabold text-center bg-amber-400/5 group-hover:bg-amber-400/10 border border-amber-400/10 py-1 rounded-lg transition duration-200">
                        பார்க்க கிளிக் செய்க ➔
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>



            </>
          ) : (
            <section className="max-w-7xl mx-auto px-4 mt-6 animate-in fade-in duration-300">
              <div className="bg-[#121316]/60 border border-white/[0.06] rounded-3xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/[0.02] rounded-full blur-[100px] pointer-events-none"></div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06] pb-4 mb-6">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <ClipboardList className="text-amber-400" size={18} />
                      <span>எனது ஆர்டர்கள் & முன்பதிவுகள் ({ordersList.length})</span>
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">உங்களது தற்போதைய ஆன்லைன் ஆர்டர்கள் மற்றும் கிளை முன்பதிவுகளின் நேரடி நிலை.</p>
                  </div>

                  <button
                    onClick={() => {
                      const saved = localStorage.getItem('temperking_orders_list');
                      if (saved) setOrdersList(JSON.parse(saved));
                      alert("ஆர்டர் நிலை புதுப்பிக்கப்பட்டது! 🔄");
                    }}
                    className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-3.5 py-1.5 rounded-xl text-[10.5px] uppercase font-black tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <RefreshCw size={11} className="animate-spin-slow" />
                    <span>நிலையை புதுப்பி (Refresh Status)</span>
                  </button>
                </div>

                {ordersList.length === 0 ? (
                  <div className="text-center py-16 space-y-4 max-w-sm mx-auto">
                    <div className="w-14 h-14 bg-white/[0.03] text-gray-500 rounded-full flex items-center justify-center mx-auto border border-white/10">
                      <HelpCircle size={24} />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">எந்த ஆர்டர்களும் இல்லை</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">கார்ட்டில் தயாரிப்புகளை சேர்த்து, ஆர்டர் செய்யும் போது அவை இந்தத் திரையில் தானாகவே சேர்க்கப்படும்!</p>
                    </div>
                    <button
                      onClick={() => setCustomerOrdersTabActive(false)}
                      className="bg-amber-400 hover:bg-amber-500 text-black font-black text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-xl transition cursor-pointer active:scale-95 shadow-md flex items-center gap-1.5 mx-auto"
                    >
                      <Store size={12} />
                      <span>பொருட்களைப் பார்க்கவும்</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 font-sans">
                    {ordersList.map((order) => {
                      const isPickup = order.fulfillmentType === 'pickup';
                      return (
                        <div key={order.id} className="bg-black/35 border border-white/[0.06] rounded-2xl p-4.5 sm:p-5 space-y-4 relative overflow-hidden">
                          
                          {/* Order Header */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-white/[0.04] pb-3">
                            <div className="space-y-0.5 text-left">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] font-black font-mono text-amber-400">{order.id}</span>
                                <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                  order.status === 'COMPLETED' 
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/10' 
                                    : order.status === 'CANCELLED'
                                    ? 'bg-red-500/15 text-red-400 border border-red-500/10'
                                    : 'bg-amber-400/10 text-amber-400 border border-amber-400/10 animate-pulse'
                                }`}>
                                  {order.status === 'PENDING' ? 'மனுவில் உள்ளது (Pending)' : 
                                   order.status === 'PREPARING' ? 'தயாராகிறது (Preparing)' :
                                   order.status === 'READY_FOR_PICKUP' ? 'பொருத்துவதற்கு தயார்' :
                                   order.status === 'SHIPPED' ? 'அனுப்பப்பட்டது (Shipped)' : 
                                   order.status === 'CANCELLED' ? 'ரத்து செய்யப்பட்டது' : 'முடிந்தது (Completed & Fitted)'}
                                </span>
                              </div>
                              <p className="text-[9px] text-gray-500 font-mono">பதிவு நேரம்: {order.createdAt}</p>
                            </div>

                            <div className="text-left sm:text-right">
                              <p className="text-[9px] text-gray-500 font-mono">மொத்த தொகை</p>
                              <p className="text-sm font-black text-white font-mono">₹{order.total}</p>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div className="space-y-1.5 text-left">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center bg-[#07080a]/40 p-2 rounded-xl text-xs">
                                <div className="flex items-center gap-2.5">
                                  {item.imageUrl && (
                                    <img src={item.imageUrl} className="w-6 h-6 rounded object-cover" alt="" referrerPolicy="no-referrer" />
                                  )}
                                  <div>
                                    <p className="text-gray-200 font-bold">{item.name}</p>
                                    <p className="text-[9px] text-gray-500">{item.englishName} • {item.shopName}</p>
                                  </div>
                                </div>
                                <span className="text-gray-400 font-mono font-bold">Qty: {item.quantity}</span>
                              </div>
                            ))}
                          </div>

                          {/* Visual Step Tracker */}
                          {order.status !== 'CANCELLED' && (
                            <div className="pt-2 text-left">
                              <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-gray-500 uppercase tracking-widest font-black">
                                <span className="text-amber-400">1. பதியப்பட்டது</span>
                                <span className={['PREPARING', 'SHIPPED', 'READY_FOR_PICKUP', 'COMPLETED'].includes(order.status) ? 'text-amber-400' : 'text-gray-600'}>2. தயார் நிலை</span>
                                <span className={['SHIPPED', 'READY_FOR_PICKUP', 'COMPLETED'].includes(order.status) ? 'text-amber-400' : 'text-gray-600'}>{isPickup ? '3. நேரடி வருகை' : '3. குரியர் அனுப்புதல்'}</span>
                                <span className={order.status === 'COMPLETED' ? 'text-emerald-400 font-black' : 'text-gray-600'}>4. நிறைவுற்றது</span>
                              </div>

                              <div className="mt-2.5 h-1.5 bg-[#121316] rounded-full overflow-hidden flex">
                                <div className={`h-full bg-amber-400 rounded-l ${
                                  order.status === 'PENDING' ? 'w-1/4' : 
                                  order.status === 'PREPARING' ? 'w-1/2' :
                                  ['SHIPPED', 'READY_FOR_PICKUP'].includes(order.status) ? 'w-3/4' : 'w-full'
                                }`} />
                              </div>
                            </div>
                          )}

                          {/* Fulfillment Specific Block */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#090a0d] border border-white/[0.04] p-3 rounded-xl text-[11px] leading-relaxed text-left">
                            <div className="space-y-1 text-gray-300">
                              <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase text-gray-500 tracking-wider">
                                <User size={10} />
                                <span>பெறுநர் முகவரி விவரங்கள் (Customer Contact):</span>
                              </div>
                              <p className="font-bold text-white text-xs">{order.customerName}</p>
                              <p className="font-mono text-gray-400">📞 {order.customerPhone}</p>
                              {isPickup ? (
                                <p className="text-gray-400 mt-1">🏪 வருகை தரும் கிளை: <b className="text-amber-305">{order.pickupShopName}</b></p>
                              ) : (
                                <p className="text-gray-400 leading-snug">📍 {order.shippingAddress}, {order.shippingCity} - {order.shippingPincode}</p>
                              )}
                            </div>

                            <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-white/[0.05] pt-3 md:pt-0 md:pl-4 space-y-2 text-left">
                              {isPickup ? (
                                <div className="space-y-1.5 w-full">
                                  <div className="flex items-center justify-between text-[9px] font-black uppercase text-amber-500 tracking-wider">
                                    <span>கிளை சந்திப்பு OTP சீட்டு:</span>
                                    <span className="text-gray-500 italic font-mono">{order.pickupTimeSlot}</span>
                                  </div>
                                  <div className="bg-black/50 p-2.5 rounded-xl border border-white/[0.04] flex items-center justify-between text-xs font-bold w-full">
                                    <span className="text-gray-400">ஆர்டர் OTP:</span>
                                    <span className="text-base font-mono font-black text-amber-400 tracking-widest">{order.pickupOtp}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1 text-xs w-full">
                                  <span className="text-[9px] font-extrabold text-blue-400 uppercase tracking-wider block">குரியர் டிராக் ஐடி (Courier Tracking Index):</span>
                                  {order.trackingNumber ? (
                                    <div className="bg-black/50 border border-white/10 p-2 rounded-xl space-y-1">
                                      <p className="text-white text-[11px] font-black uppercase">🚚 {order.courierName}</p>
                                      <p className="text-amber-400 font-mono text-xs font-bold select-all flex items-center gap-1">
                                        <span>ID: {order.trackingNumber}</span>
                                        <button 
                                          onClick={() => {
                                            navigator.clipboard.writeText(order.trackingNumber);
                                            alert("கொரியர் டிராக்கிங் ஐடி காப்பி செய்யப்பட்டது!");
                                          }}
                                          className="text-gray-500 hover:text-white transition ml-1 cursor-pointer"
                                          title="Copy Tracking ID"
                                        >
                                          <Copy size={10} />
                                        </button>
                                      </p>
                                    </div>
                                  ) : (
                                    <p className="text-gray-400 italic text-[10.5px]">📦 பார்சல் பேக் செய்யப்படுகிறது, டிராக்கிங் ஐடி விரைவில் பதிவேற்றப்படும்.</p>
                                  )}
                                </div>
                              )}

                              {order.status === 'PENDING' && (
                                <button
                                  onClick={() => {
                                    if (confirm("நிச்சயமாக உங்களது இந்த ஆர்டரை ரத்து செய்ய விரும்புகிறீர்களா? கையிருப்பு (Stock) தானாகவே கடையின் கணக்கில் மீட்டமைக்கப்படும்.")) {
                                      setOrdersList(prev => {
                                        const updated = prev.map(o => {
                                          if (o.id === order.id) {
                                            return { ...o, status: 'CANCELLED' };
                                          }
                                          return o;
                                        });
                                        localStorage.setItem('temperking_orders_list', JSON.stringify(updated));
                                        // Revert inventory stock
                                        setSimulatedProducts(curr => curr.map(item => {
                                          const matchItem = order.items.find((i: any) => i.productId === item.id);
                                          if (matchItem) {
                                            return { ...item, stockCount: (item.stockCount || 0) + matchItem.quantity };
                                          }
                                          return item;
                                        }));
                                        return updated;
                                      });
                                      window.dispatchEvent(new Event('storage'));
                                      alert("ஆர்டர் வெற்றிகரமாக ரத்து செய்யப்பட்டது! 🗑️");
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/10 py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider block text-center transition cursor-pointer self-start sm:self-end w-max"
                                >
                                  ஆர்டரை ரத்து செய் (Cancel Order)
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center gap-4 text-[10px] pt-2 text-gray-500 border-t border-white/[0.04]">
                            <span className="flex items-center gap-1.5">
                              <Activity size={10} className="text-amber-500 animate-pulse" />
                              <span>லைவ் ஸ்டாக் ஒதுக்கீடு 100% கன்பார்ம்</span>
                            </span>

                            <button
                              onClick={() => {
                                const adminPhone = platformSettings?.supportPhone 
                                    ? platformSettings.supportPhone.replace('+91', '').replace(/\s/g, '') 
                                    : '9876543210';
                                window.open(`https://wa.me/91${adminPhone}?text=${encodeURIComponent(order.whatsappMessage)}`, '_blank');
                              }}
                              className="bg-[#25d366]/10 hover:bg-[#25d366]/20 text-[#25d366] font-extrabold border border-[#25d366]/15 py-1 px-3 rounded-lg text-[9.5px] uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                            >
                              <MessageSquare size={10} className="fill-[#25d366]/20" />
                              <span>உதவிபெற வாட்ஸ்அப்</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          )}

        </>
      )}

      {/* VIEW 2: DEDICATED STAFF SECURITY PORTAL */}
      {privateConsoleOpen && currentView === 'staff-login' && (
        <section className="max-w-7xl mx-auto px-4 mt-6 animate-in fade-in duration-200">
          <div className="bg-[#111216] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
            <div className="border-b border-white/[0.08] pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full font-black uppercase tracking-wider font-mono">Employee Security Gateway</span>
                <h2 className="text-xl font-black text-white mt-1 uppercase">👥 ஊழியர் பணிதளம் லாகின் (Staff Workplace Portal)</h2>
                <p className="text-xs text-gray-400 mt-1">கீழ்கண்ட ஊழியர்களில் ஒருவரைத் தேர்ந்தெடுத்து 1234 PIN குறியீட்டை உள்ளிட்டு லாகின் செய்யவும்.</p>
              </div>
              {simLoggedStaffId !== 'ALL' && (
                <button
                  onClick={() => {
                    setSimLoggedStaffId('ALL');
                    setSimLoggedStaffName('மச்சான் குமரன் (Super Owner)');
                    setSimLoggedStaffRole('Super Admin');
                    setSimShop('Arakkonam Junction Branch');
                    alert("Logged out to default administrator account.");
                  }}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer transition active:scale-95 animate-in"
                >
                  <LogOut size={12} />
                  <span>வெளியேறு (Logout)</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {staffList.map((st) => {
                const isActive = simLoggedStaffId === st.id;
                return (
                  <div
                    key={st.id}
                    onClick={() => {
                      if (isActive) return;
                      const pin = prompt(`"${st.name}" - பணி அமர்வுக்கு நுழைய secure PIN-ஐ உள்ளிடவும்.\n(முன்னியல்பான PIN: 1234)`, "1234");
                      if (pin === "1234") {
                        handleSimulateStaffLogin(st);
                        alert(`வெற்றி! ${st.name} தற்போது செயலில் உள்ளார்.`);
                      } else if (pin !== null) {
                        alert("தவறான PIN! (பயன்படுத்தவும்: 1234)");
                      }
                    }}
                    className={`border-2 rounded-2xl p-5 cursor-pointer transition-all duration-200 ${
                      isActive ? 'bg-indigo-500/10 border-indigo-400 shadow-[0_4px_25px_rgba(99,102,241,0.1)]' : 'bg-white/[0.01] border-white/10 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-3xl">{st.avatar}</span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full ${isActive ? 'bg-indigo-500 text-white' : 'bg-white/5 text-gray-400'}`}>
                        {isActive ? 'ACTIVE WORK' : 'OFFLINE'}
                      </span>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-extrabold text-white text-sm line-clamp-1">{st.name}</h4>
                      <p className="text-[10px] text-indigo-300 font-semibold mt-0.5">{st.role}</p>
                      <p className="text-[9px] text-gray-400 mt-2 leading-tight">📍 {st.shopDisplayName.split(' (')[0]}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* TRUSTSPARES REDIRECT BANNER */}
            <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-4 bg-purple-500/5 border border-purple-500/10 p-5 rounded-2xl text-left">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-purple-300 text-xs font-black uppercase tracking-wider">
                  <ShieldCheck size={14} className="text-[#a855f7]" />
                  <span>TrustSpares மையக் கட்டுப்பாட்டுப் பலகை (Centralized Administration Hub)</span>
                </div>
                <p className="text-gray-300 text-xs font-medium leading-relaxed max-w-2xl">
                  புதிய ஊழியர்களைச் சேர்க்க மற்றும் அவர்களது கடைப் பகுதிகளை ஒதுக்கீடு செய்ய, மேலே உள்ள <span className="text-purple-300 font-bold">"🛡️ TRUSTSPARES அட்மின்"</span> முதன்மை மேலாண்மைப் பிரிவுக்குச் செல்லவும். TrustSpares எப்போதுமே மைய முதன்மை ஹப்பாகும் (Central Hub), TemperKing கிளைகள் அதன் வழிநடத்தப்படும் கடைகளாகும்!
                </p>
              </div>
              <button
                onClick={() => setCurrentView('trustspares-admin')}
                className="bg-[#a855f7] hover:bg-[#9333ea] text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition duration-200 shrink-0 flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-lg shadow-purple-500/10"
              >
                <span>அட்மின் பலகைக்குச் செல் (Go to Admin Panel)</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* VIEW 2.5: TRUSTSPARES CENTRAL CORPORATE ADMIN HQ */}
      {privateConsoleOpen && currentView === 'trustspares-admin' && (
        <section className="max-w-7xl mx-auto px-4 mt-6 animate-in fade-in duration-200">
          <div className="bg-[#111216] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
            {/* Header / Brand Title */}
            <div className="border-b border-white/[0.08] pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full font-black uppercase tracking-wider font-mono">TRUSTSPARES CORP HQ CONSOLE</span>
                  <span className="w-1.5 h-1.5 bg-[#a855f7] rounded-full animate-ping text-[10px]"></span>
                </div>
                <h2 className="text-xl font-black text-white mt-1.5 uppercase flex items-center gap-2">
                  <ShieldCheck className="text-[#a855f7] shrink-0" size={24} />
                  <span>TRUSTSPARES மைய மேலாண்மைப் பலகை (Central Corporate Hub Panel)</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1 font-medium">
                  முதன்மை நிறுவனமான <span className="text-purple-300 font-bold">TrustSpares</span>-உடன் இணைக்கப்பட்ட அனைத்து விற்பனை கிளைகளையும் (TemperKing) மற்றும் ஊழியர் நியமனங்களையும் நிர்வகிக்கும் பிரத்தியேக அட்மின் கன்சோல்.
                </p>
              </div>
              <div className="text-[11px] text-[#a855f7] bg-purple-500/10 px-3 py-1.5 rounded-xl border border-purple-500/20 font-black flex items-center gap-1.5">
                <span>🛡️ OVERLORD STATUS: ACTIVE</span>
              </div>
            </div>

            {/* BENTO STATS METRICS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#16181d] border border-white/[0.04] rounded-2xl p-4.5 text-left flex items-start gap-3.5">
                <span className="text-3xl bg-purple-500/10 w-12 h-12 flex items-center justify-center rounded-xl shrink-0">🏛️</span>
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-black text-purple-300">CORPORATE ORIGIN</span>
                  <h4 className="text-xs font-black text-white mt-0.5">TrustSpares Hub</h4>
                  <p className="text-[10px] text-gray-400 leading-normal mt-0.5">Central Inventory Supplier & Administrative Core.</p>
                </div>
              </div>

              <div className="bg-[#16181d] border border-white/[0.04] rounded-2xl p-4.5 text-left flex items-start gap-3.5">
                <span className="text-3xl bg-amber-500/10 w-12 h-12 flex items-center justify-center rounded-xl shrink-0">🏪</span>
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-black text-amber-400">ACTIVE OUTLETS</span>
                  <h4 className="text-xs font-black text-white mt-0.5">{availableShops.length} Stores Managed</h4>
                  <p className="text-[10px] text-gray-400 leading-normal mt-0.5">Subordinate franchise branches like TemperKing.</p>
                </div>
              </div>

              <div className="bg-[#16181d] border border-white/[0.04] rounded-2xl p-4.5 text-left flex items-start gap-3.5">
                <span className="text-3xl bg-[#a855f7]/10 w-12 h-12 flex items-center justify-center rounded-xl shrink-0">👥</span>
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-black text-purple-300">TOTAL HEADCOUNT</span>
                  <h4 className="text-xs font-black text-white mt-0.5">{staffList.length} Active Hires</h4>
                  <p className="text-[10px] text-gray-400 leading-normal mt-0.5">Central Overseer + multi-branch fitting agents.</p>
                </div>
              </div>

              <div className="bg-[#16181d] border border-white/[0.04] rounded-2xl p-4.5 text-left flex items-start gap-3.5">
                <span className="text-3xl bg-emerald-500/10 w-12 h-12 flex items-center justify-center rounded-xl shrink-0">📈</span>
                <div>
                  <span className="text-[9px] uppercase tracking-widest font-black text-emerald-400">COMBINED NETWORK BILLS</span>
                  <h4 className="text-xs font-black text-white mt-0.5">{billsList.length} Network Sales</h4>
                  <p className="text-[10px] text-gray-400 leading-normal mt-0.5">Real-time point-of-sale invoices recorded securely.</p>
                </div>
              </div>
            </div>

            {/* CORE SINGLE-COLUMN INTERFACE */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
              {/* Right Column: Custom Added Staff Directory View */}
              <div className="lg:col-span-12 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-widest text-purple-400">TRUSTSPARES EMPLOYEE NETWORK</span>
                  <h3 className="text-sm font-black text-white uppercase flex items-center gap-1.5">
                    <Database size={14} className="text-purple-400" />
                    <span>தற்போது பணிபுரியும் ஊழியர்கள் பட்டியல் (Hired Staff Directory)</span>
                  </h3>
                  <p className="text-[10px] text-gray-400">உங்களால் சேர்க்கப்பட்ட தனிப்பயன் ஊழியர்களை இங்கே உங்களுடைய கட்டுப்பாட்டுப் பலகத்தில் கண்காணிக்கலாம் மற்றும் நீக்கலாம்.</p>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                  {customStaffList.length === 0 ? (
                    <div className="p-10 text-center text-gray-500 space-y-3">
                      <span className="text-4xl block">📋</span>
                      <p className="text-[11px] font-medium leading-relaxed font-sans text-gray-400">
                        தற்போது கூடுதல் ஊழியர்கள் யாரும் பதிவு செய்யப்படவில்லை!<br/>
                        புதிய ஊழியரை நியமிக்க TrustSpares அட்மின் பலகையைப் பயன்படுத்தவும். (Please use TrustSpares Admin Panel / Branch Staff tab to add or assign staff).
                      </p>
                      <div className="inline-block bg-[#a855f7]/10 text-[#a855f7] border border-purple-500/10 text-[9px] font-black uppercase px-2.5 py-1 rounded">
                        TRUSTSPARES MASTER CLOUD SYNCHRONIZER ENABLED
                      </div>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5 max-h-[350px] overflow-y-auto">
                      {customStaffList.map((cst) => {
                        const associatedShop = availableShops.find(sh => sh.id === cst.shopId);
                        return (
                          <div key={cst.id} className="flex items-center justify-between p-3.5 hover:bg-white/[0.01] transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-2xl shrink-0 bg-white/5 w-10 h-10 flex items-center justify-center rounded-xl">{cst.avatar || '👦'}</span>
                              <div className="min-w-0">
                                <h4 className="text-xs font-black text-white truncate">{cst.name}</h4>
                                <div className="flex items-center gap-1 px-1.5 mt-0.5 bg-purple-500/10 text-purple-200 w-max text-[8px] font-black uppercase rounded">
                                  {cst.role}
                                </div>
                                <span className="text-[9.5px] text-amber-300 block truncate mt-1">📍 Assigned Branch: {associatedShop ? associatedShop.displayName.split(' (')[0] : 'Unknown Branch'}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest leading-none">AUTO_SYNC</span>
                              <button
                                type="button"
                                onClick={() => {
                                  handleDeleteCustomStaff(cst.id);
                                  alert("ஊழியர் கணக்கு நீக்கப்பட்டது!");
                                }}
                                className="text-gray-500 hover:text-red-400 p-1 bg-white/5 hover:bg-red-500/10 rounded transition cursor-pointer"
                                title="Delete staff record"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* CENTRAL TRUSTSPARES FRANCHISE ASSURANCE */}
                <div className="bg-[#1c142c] border border-[#a855f7]/10 p-4.5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-left">
                  <span className="text-3xl">🛡️</span>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">TrustSpares Central Hub System Integration</h4>
                    <p className="text-[10px] text-gray-300 mt-1 leading-relaxed">
                      புதிதாகச் சேர்க்கப்படும் அனைத்து ஊழியர்களின் தரவுகளும் TrustSpares முதன்மை மையத் தரவுத்தளத்தில் நிகழ்நேரத்தில் பதிவேற்றப்படுகிறது. அவர்கள் அந்தந்த TemperKing கிளைக் கடைகளில் செய்யும் பில்லிங் மற்றும் இருப்பு மேம்பாடுகள் அனைத்தும் இங்கு அட்மினுக்கு ஒருங்கிணைந்து காண்பிக்கப்படும்!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* VIEW 3: INVOICES & WALK-IN POINT OF SALE BILLING SYSTEM */}
      {privateConsoleOpen && currentView === 'billing' && (
        <section className="max-w-7xl mx-auto px-4 mt-6 animate-in fade-in duration-200">
          <div className="bg-[#111216] border border-white/10 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
            <div className="border-b border-white/[0.08] pb-4 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-full font-black uppercase tracking-wider font-mono">Retail POS Interface</span>
                <h2 className="text-xl font-black text-white mt-1 uppercase">📋 சில்லறை விற்பனை பில்லிங் (Counter Walk-In Billing)</h2>
                <p className="text-xs text-gray-400 mt-0.5">ஊழியர்கள் இங்கு வாடிக்கையாளர்களுக்கு பில்கள் வழங்கி, இருப்பு அளவைக் கழிக்கலாம்.</p>
              </div>
              <div className="text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/15 font-black uppercase">
                📍 {getShopDisplayName(simShop).split(' (')[0]}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Product selector list */}
              <div className="lg:col-span-7 space-y-4">
                <div className="bg-black/30 border border-white/[0.05] p-4 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="தயாரிப்பை இங்கே தேடுங்கள்..."
                      value={activeBarcodeSearch}
                      onChange={(e) => setActiveBarcodeSearch(e.target.value)}
                      className="flex-1 bg-[#121316] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-400"
                    />
                    <div className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-2 rounded-xl text-emerald-400 font-mono">barcode active</div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
                    {displayProducts
                      .filter(p => {
                        const prodShop = p.shopName || 'Arakkonam Junction Branch';
                        if (prodShop !== simShop) return false;
                        if (activeBarcodeSearch.trim()) {
                          const query = activeBarcodeSearch.toLowerCase();
                          return p.name.toLowerCase().includes(query) || p.englishName.toLowerCase().includes(query);
                        }
                        return true;
                      })
                      .map(p => {
                        const inCart = billingCart.find(item => item.product.id === p.id);
                        const qtyInCart = inCart ? inCart.quantity : 0;
                        const stock = p.stockCount || 25;
                        const available = stock - qtyInCart;

                        return (
                          <div key={p.id} className="bg-white/[0.01] border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2.5">
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-[11px] text-white truncate">{p.name}</h4>
                              <p className="text-[9.5px] text-amber-400 font-bold mt-0.5">₹{p.price} <span className="text-gray-500 font-normal font-sans">(Stock: {stock})</span></p>
                            </div>
                            {available <= 0 ? (
                              <span className="text-[8px] bg-rose-500/10 text-rose-500 px-2 py-1 rounded font-black">SOLDOUT</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddToPOSCart(p)}
                                className="bg-emerald-500 hover:bg-emerald-600 text-black text-[10px] font-black px-2 py-1 rounded-md transition cursor-pointer"
                              >
                                ➕ சேர்
                              </button>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Ledger summary */}
                <div className="bg-black/20 p-4 border border-white/5 rounded-2xl">
                  <h3 className="text-xs font-black text-gray-300 uppercase block mb-2">இன்று விடுக்கப்பட்ட ரசீதுகள் (Today's Receipts List)</h3>
                  {billsList.filter(b => b.shopName === simShop).length === 0 ? (
                    <p className="text-[10px] text-gray-500">இந்த கிளையில் இன்று எந்தப் பில்லும் போடப்படவில்லை.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1 font-mono">
                      {billsList.filter(b => b.shopName === simShop).map((bill: any) => (
                        <div
                          key={bill.id}
                          onClick={() => setSelectedCompletedBill(bill)}
                          className="bg-white/[0.01] hover:bg-white/5 border border-white/5 p-2 rounded-lg flex items-center justify-between text-[11px] cursor-pointer"
                        >
                          <span className="text-emerald-400 font-bold">{bill.id} - {bill.customerName}</span>
                          <span className="font-extrabold text-white">₹{bill.grandTotal}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* POS Cart Sidebar (5 Cols) */}
              <div className="lg:col-span-5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (billingCart.length === 0) return;
                    const rawSubtotal = billingCart.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
                    const disc = Math.round(rawSubtotal * (billingDiscount / 100));
                    const taxed = Math.round((rawSubtotal - disc) * 0.18);
                    
                    const newInvoice = {
                      id: 'INV-' + Math.floor(100000 + Math.random() * 900000),
                      customerName: billingCustomerName.trim() || 'நேரடி வாடிக்கையாளர் (Walk-in Customer)',
                      customerPhone: billingCustomerPhone.trim() || 'Not Provided',
                      items: billingCart.map(item => ({
                        name: item.product.name,
                        englishName: item.product.englishName,
                        price: item.product.price,
                        quantity: item.quantity,
                        subtotal: item.product.price * item.quantity
                      })),
                      subtotal: rawSubtotal,
                      discountPct: billingDiscount,
                      discountValue: disc,
                      gstValue: taxed,
                      grandTotal: (rawSubtotal - disc) + taxed,
                      shopName: simShop,
                      staffName: simLoggedStaffName,
                      timestamp: new Date().toLocaleString('ta-IN', { timeZone: 'Asia/Kolkata' }),
                      syncHash: 'TS-' + Math.random().toString(36).substring(2, 9).toUpperCase()
                    };

                    setSimulatedProducts(prev => prev.map(p => {
                      const matchHandler = billingCart.find(c => c.product.id === p.id);
                      if (matchHandler) {
                        return { ...p, stockCount: Math.max(0, (p.stockCount || 25) - matchHandler.quantity) };
                      }
                      return p;
                    }));

                    setBillsList(prev => {
                      const updated = [newInvoice, ...prev];
                      localStorage.setItem('temperking_bills_list_v2', JSON.stringify(updated));
                      return updated;
                    });

                    setBillingCart([]);
                    setBillingCustomerName('');
                    setBillingCustomerPhone('');
                    setBillingDiscount(0);
                    setSelectedCompletedBill(newInvoice);
                  }}
                  className="bg-black/30 border border-white/15 p-5 rounded-2xl space-y-4"
                >
                  <h3 className="text-xs font-black text-white uppercase tracking-wider mb-2 pb-1.5 border-b border-white/[0.05]">🧾 தற்போதைய பில் (Billing Cart List)</h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="பெயர்"
                      value={billingCustomerName}
                      onChange={(e) => setBillingCustomerName(e.target.value)}
                      className="bg-[#121316] border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-white outline-none"
                    />
                    <input
                      type="tel"
                      placeholder="கைபேசி"
                      value={billingCustomerPhone}
                      onChange={(e) => setBillingCustomerPhone(e.target.value)}
                      className="bg-[#121316] border border-white/10 rounded-xl px-3.5 py-1.5 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto">
                    {billingCart.length === 0 ? (
                      <p className="text-[10px] text-gray-500 text-center py-6">உருப்படிகள் சேர்க்கப்படவில்லை.</p>
                    ) : (
                      billingCart.map((item) => {
                        const stock = item.product.stockCount || 25;
                        return (
                          <div key={item.product.id} className="bg-white/[0.02] p-2 rounded-xl flex items-center justify-between text-xs">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-extrabold text-[10.5px] text-white truncate">{item.product.name}</h4>
                              <p className="text-[9px] text-gray-400 mt-0.5">₹{item.product.price} x {item.quantity}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center border border-white/10 rounded bg-black/40 overflow-hidden text-[9px]">
                                <button type="button" onClick={() => handleUpdatePOSCartQty(item.product.id, -1, stock)} className="px-1.5 hover:bg-white/5">-</button>
                                <span className="px-1.5 font-bold text-white">{item.quantity}</span>
                                <button type="button" onClick={() => handleUpdatePOSCartQty(item.product.id, 1, stock)} className="px-1.5 hover:bg-white/5">+</button>
                              </div>
                              <span className="text-emerald-400 font-extrabold min-w-[40px] text-right">₹{item.product.price * item.quantity}</span>
                              <button type="button" onClick={() => handleRemoveFromPOSCart(item.product.id)} className="text-gray-500 hover:text-red-400 pl-1"><X size={12} /></button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {billingCart.length > 0 && (
                    <div className="bg-black/50 p-3 rounded-xl border border-white/[0.05] text-[11px] space-y-1.5">
                      <div className="flex justify-between text-gray-400">
                        <span>துணை மொத்தம்:</span>
                        <span>₹{billingCart.reduce((s, i) => s + (i.product.price * i.quantity), 0)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>தள்ளuபடி தேர்வு (%):</span>
                        <div className="flex gap-1">
                          {[0, 10, 20].map(p => (
                            <button
                              type="button"
                              key={p}
                              onClick={() => setBillingDiscount(p)}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono ${billingDiscount === p ? 'bg-emerald-500 text-black font-black' : 'bg-white/5 text-gray-400'}`}
                            >
                              {p}%
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between font-black text-white pt-1.5 border-t border-white/[0.05]">
                        <span>மொத்த பில் (+ 18% GST):</span>
                        <span className="text-emerald-400 text-sm font-mono font-black">
                          ₹{
                            Math.round(
                              (billingCart.reduce((s, i) => s + (i.product.price * i.quantity), 0) * (1 - billingDiscount / 100)) * 1.18
                            )
                          }
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={billingCart.length === 0}
                    className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider text-center transition ${
                      billingCart.length === 0 ? 'bg-white/5 text-gray-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-black cursor-pointer active:scale-95'
                    }`}
                  >
                    🧾 பில் செய்து ரசீது அச்சிடு
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* VIEW 4: ACTIVE REALT-IME BRANCH STOCK INVENTORY */}
      {privateConsoleOpen && currentView === 'inventory' && (
        <section className="max-w-7xl mx-auto px-4 mt-6 animate-in fade-in duration-200">
          <div className="bg-[#111216] border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
            <div className="border-b border-white/[0.08] pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-1 rounded-full font-black uppercase tracking-wider font-mono font-bold">Live Showroom Stock Ledger</span>
                <h2 className="text-xl font-black text-white mt-1 uppercase">📦 கிளை இன்வென்டரி மேலாண்மை (Branch Stock Register)</h2>
                <p className="text-xs text-gray-400 mt-1">கீழ்கண்ட அட்டவணையில் பொருட்கள் இருப்பு மற்றும் விலைகளை மாற்றி அமைக்கலாம். தன்னிச்சையாக TrustSpares உடன் live-sync ஆகும்.</p>
              </div>
              <button
                onClick={() => setCurrentView('add-stock')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle size={12} />
                <span>புதிய தயாரிப்பு சேர்</span>
              </button>
            </div>

            {/* Quick Summary Widgets */}
            <div className="grid grid-cols-3 gap-4 mb-5 text-center">
              <div className="bg-black/35 border border-white/[0.05] p-3 rounded-xl">
                <span className="text-[9px] text-gray-400 block uppercase font-black">வகைகள்</span>
                <span className="text-sm sm:text-base text-white font-black">{displayProducts.filter(p => !p.shopName || p.shopName === simShop).length} ITEMS</span>
              </div>
              <div className="bg-black/35 border border-white/[0.05] p-3 rounded-xl">
                <span className="text-[9px] text-gray-400 block uppercase font-black">இருப்பு மதிப்பு</span>
                <span className="text-sm sm:text-base text-white font-black font-mono">
                  ₹{displayProducts.filter(p => !p.shopName || p.shopName === simShop).reduce((acc, current) => acc + (Number(current.price) * (current.stockCount || 25)), 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-black/35 border border-white/[0.05] p-3 rounded-xl">
                <span className="text-[9px] text-gray-400 block uppercase font-black">தீரும் நிலையில்</span>
                <span className="text-sm sm:text-base text-rose-400 font-black">
                  {displayProducts.filter(p => (!p.shopName || p.shopName === simShop) && (p.stockCount || 25) <= 5).length} ALARMS 🚨
                </span>
              </div>
            </div>

            <div className="bg-black/30 border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.05] bg-white/[0.01] text-gray-400 font-bold font-mono">
                      <th className="p-3">தயாரிப்பு பெயர்</th>
                      <th className="p-3">வகை Display</th>
                      <th className="p-3 text-center">சரக்கு விலை (₹)</th>
                      <th className="p-3 text-center">இருப்பு அளவு (Qty)</th>
                      <th className="p-3 text-center">ஒத்திசைவு</th>
                      <th className="p-3 text-center">நகலெடு</th>
                      <th className="p-3 text-center">நீக்கு</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayProducts
                      .filter(p => !p.shopName || p.shopName === simShop)
                      .map((product) => {
                        const stock = product.stockCount || 25;
                        const isSim = product.id.toString().startsWith('sim-');
                        return (
                          <tr key={product.id} className="border-b border-white/[0.03] hover:bg-white/[0.01]">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <img src={product.imageUrl} className="w-8 h-8 object-cover rounded bg-black border border-white/10 shrink-0" />
                                <div className="min-w-0">
                                  <span className="font-bold text-white block truncate">{product.name}</span>
                                  <span className="text-[8.5px] text-gray-500 block truncate">{product.englishName}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 uppercase font-mono text-[9.5px] text-blue-300 font-bold">{product.category}</td>
                            <td className="p-3 text-center font-bold">
                              ₹{product.price}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => isSim && handleEditProductStock(product.id, stock - 1)}
                                  className="w-5 h-5 bg-white/5 rounded text-gray-400 hover:text-white font-bold"
                                >
                                  -
                                </button>
                                <span className={`font-black text-xs min-w-[20px] ${stock <= 5 ? 'text-rose-400' : 'text-emerald-400'}`}>{stock}</span>
                                <button
                                  onClick={() => isSim && handleEditProductStock(product.id, stock + 1)}
                                  className="w-5 h-5 bg-white/5 rounded text-gray-400 hover:text-white font-bold"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="p-3 text-center">
                              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8.5px] font-mono">LIVE_SYNC 🟢</span>
                            </td>
                            <td className="p-3 text-center">
                              <button 
                                onClick={() => handleCopyProduct(product)} 
                                className="bg-purple-500/20 text-purple-300 hover:bg-purple-500/40 px-2 py-1 rounded inline-flex items-center gap-1 cursor-pointer font-bold text-[10px] border border-purple-500/20 transition-all active:scale-95"
                                title="தயாரிப்பு விவரங்களை நகலெடு (Copy Details)"
                              >
                                <Copy size={11} className="shrink-0" />
                                <span>Copy</span>
                              </button>
                            </td>
                            <td className="p-3 text-center">
                              {isSim ? (
                                <button onClick={() => handleDeleteProduct(product.id)} className="text-gray-500 hover:text-red-400 cursor-pointer"><X size={12} /></button>
                              ) : (
                                <span className="text-gray-600">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* VIEW 5: QUICK CONVENIENT PRODUCT PUBLISHING ENTRY */}
      {privateConsoleOpen && currentView === 'add-stock' && (
        <section className="max-w-3xl mx-auto px-4 mt-6 animate-in fade-in duration-200">
          <div className="bg-[#111216] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="border-b border-white/[0.08] pb-4 mb-6">
              <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2.5 py-1 rounded-full font-black uppercase tracking-wider font-mono">Showroom Product Register</span>
              <h2 className="text-xl font-black text-white mt-1 uppercase">⚡ புதிய தயாரிப்பு வெளியீட்டு படிவம் (Product Publisher Form)</h2>
              <p className="text-xs text-gray-400">இங்கு நீங்கள் பதிவேற்றும் பொருட்கள் அனைத்தும் TrustSpares மற்றும் உங்களது கடைப் பக்கத்தில் உடனடி விற்பனைக்கு தயாராகும்.</p>
            </div>

            <form
              onSubmit={(e) => {
                handleModalAddProduct(e);
                setCurrentView('inventory');
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block">தயாரிப்பு பெயர் *</label>
                  <input
                    type="text" required placeholder="எ.கா: POCO X6 Corning Gorilla"
                    value={modalProdName} onChange={(e) => setModalProdName(e.target.value)}
                    className="w-full bg-[#121316] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block">மின்னணு சிறப்பம்சங்கள் Subtitle</label>
                  <input
                    type="text" placeholder="எ.கா: 11D Silk Curved Hardness"
                    value={modalProdEngName} onChange={(e) => setModalProdEngName(e.target.value)}
                    className="w-full bg-[#121316] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block">வகை</label>
                  <select
                    value={modalProdCategory} onChange={(e) => setModalProdCategory(e.target.value)}
                    className="w-full bg-[#121316] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="premium">📱 Ultra Clear Premium Glass</option>
                    <option value="matte">🎮 Silk Touch Gaming Matte</option>
                    <option value="privacy">🕵️ Private Spy Anti-Peeping</option>
                    <option value="uv">⚡ UV Curved Full Tempered</option>
                    <option value="BIKE_SPARE">🏍️ பைக் ஸ்பேர்ஸ் (Automotive)</option>
                    <option value="TV_SPARE">📺 டிவி கார்டு (TV Guard)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block">இலக்கு கிளை (Target Branch)</label>
                  <select
                    value={modalProdShop} onChange={(e) => setModalProdShop(e.target.value)}
                    className="w-full bg-[#121316] border border-white/10 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {availableShops.map((sh) => (
                      <option key={sh.id} value={sh.name} className="bg-[#0c0d10] text-gray-200">{sh.displayName.split(' (')[0]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block">விற்பனை விலை (₹) *</label>
                  <input
                    type="number" required placeholder="399"
                    value={modalProdPrice} onChange={(e) => setModalProdPrice(Number(e.target.value) || 0)}
                    className="w-full bg-[#121316] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-gray-400 block">துவக்க இருப்பு அளவு (Qty) *</label>
                  <input
                    type="number" required placeholder="50"
                    value={modalProdStockCount} onChange={(e) => setModalProdStockCount(Number(e.target.value) || 25)}
                    className="w-full bg-[#121316] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Product Cover Selection & Custom File Upload Option */}
              <div className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] uppercase font-bold text-gray-300 block">தயாரிப்பு படம் (Product Image Settings)</label>
                  <span className="text-[9px] text-purple-400 font-mono font-bold">Image URL or Upload</span>
                </div>
                
                {/* Visual Thumbnail Preview */}
                {modalProdImageUrl && (
                  <div className="flex items-center gap-3 bg-purple-500/5 p-2 rounded-xl border border-purple-500/10 mb-2">
                    <img 
                      src={modalProdImageUrl} 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop';
                      }}
                      className="w-12 h-12 object-cover rounded-lg border border-purple-500/20" 
                      alt="Thumbnail Preview" 
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black text-white truncate">தேர்ந்தெடுக்கப்பட்ட படம் (Preview):</p>
                      <span className="text-[8px] text-gray-500 block truncate">{modalProdImageUrl}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setModalProdImageUrl('')}
                      className="text-gray-400 hover:text-red-400 font-black text-[9px] uppercase px-2 py-1 bg-white/5 rounded"
                    >
                      X
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] text-gray-400 block mb-1 font-bold">Image URL மூலம் சேர்க்க:</label>
                    <input
                      type="text"
                      placeholder="https://example.com/image.jpg"
                      value={modalProdImageUrl}
                      onChange={(e) => setModalProdImageUrl(e.target.value)}
                      className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 block mb-1 font-bold font-mono">கணினியிலிருந்து படம் பதிவேற்ற:</label>
                    <label className="w-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-bold py-2 px-3 rounded-xl border border-dashed border-purple-500/30 transition flex items-center justify-center gap-1.5 cursor-pointer text-center text-[10px]">
                      <span>📸 படம் அப்லோட் செய் (Upload file)</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleProductImageUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                <div className="pt-1.5">
                  <span className="text-[9px] text-gray-500 block mb-1 font-bold">அல்லது தயாராக உள்ள தானியங்கு கவர்களில் ஒன்றை தேர்வு செய்யவும்:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setModalProdImageUrl('https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=600&auto=format&fit=crop')}
                      className={`p-2 bg-[#121316] border rounded-lg text-left truncate text-[10px] cursor-pointer ${modalProdImageUrl.includes('photo-161094') ? 'border-purple-500 text-purple-400 font-bold bg-purple-500/5' : 'border-white/10 text-gray-550'}`}
                    >
                      📱 Tempered Glass
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalProdImageUrl('https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop')}
                      className={`p-2 bg-[#121316] border rounded-lg text-left truncate text-[10px] cursor-pointer ${modalProdImageUrl.includes('photo-151151') ? 'border-purple-500 text-purple-400 font-bold bg-purple-500/5' : 'border-white/10 text-gray-550'}`}
                    >
                      🎮 Gaming Silk Matte
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalProdImageUrl('https://images.unsplash.com/photo-1565630916779-e303be97b6f5?q=80&w=600&auto=format&fit=crop')}
                      className={`p-2 bg-[#121316] border rounded-lg text-left truncate text-[10px] cursor-pointer ${modalProdImageUrl.includes('photo-156563') ? 'border-purple-500 text-purple-400 font-bold bg-purple-500/5' : 'border-white/10 text-gray-550'}`}
                    >
                      🕵️ Spy Block Privacy
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalProdImageUrl('https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=600&auto=format&fit=crop')}
                      className={`p-2 bg-[#121316] border rounded-lg text-left truncate text-[10px] cursor-pointer ${modalProdImageUrl.includes('photo-159378') ? 'border-purple-500 text-purple-400 font-bold bg-purple-500/5' : 'border-white/10 text-gray-550'}`}
                    >
                      📺 TV Screen Shield
                    </button>
                  </div>
                </div>
              </div>

              {/* Banner Option Slider Switch */}
              <div className="bg-[#1a1325]/40 border border-purple-500/10 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-purple-300 font-black uppercase text-[10px] tracking-wide">
                    <Sparkles size={12} className="text-amber-400 animate-pulse" />
                    <span>முகப்பு பக்கத்தில் பானராக காட்டு (Feature on Promo Banner Slider)</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">இந்தத் தயாரிப்பைக் கடையின் முகப்புப் பக்க பிரதான விளம்பரப் பானர் பகுதியில் (Hero Banner Carousel) சுழலும் விளம்பரமாக முன்னிலைப்படுத்தி காட்டு வேண்டுமா?</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalProdIsBanner(!modalProdIsBanner)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 shrink-0 ${modalProdIsBanner ? 'bg-purple-500 justify-end' : 'bg-gray-750 justify-start'}`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-all"></span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 rounded-xl uppercase tracking-wider text-xs transition duration-200 cursor-pointer shadow-lg active:scale-95 text-center mt-4"
              >
                💾 தயாரிப்பு பதிவை வெளியிட்டு Live-Sync செய்
              </button>
            </form>
          </div>
        </section>
      )}

      {privateConsoleOpen && currentView === 'orders-live' && (
        <section className="max-w-6xl mx-auto px-4 mt-6 animate-in fade-in duration-200 font-sans">
          <div className="bg-[#111216] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="border-b border-white/[0.08] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-left">
                <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2.5 py-1 rounded-full font-black uppercase tracking-wider font-mono">Branch Booking Command</span>
                <h2 className="text-xl font-black text-white mt-1 uppercase flex items-center gap-2">
                  <Truck className="text-amber-450" size={20} />
                  <span>Incoming Orders & Pre-Bookings</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  கிளை வாரியாக வாடிக்கையாளர்கள் பதிவு செய்த ஆன்லைன் ஆர்டர்கள் மற்றும் கேபின் பொருத்தல் முன்பதிவுகள்.
                </p>
                <div className="inline-flex items-center gap-2 bg-amber-400/5 px-3 py-1 rounded-lg border border-amber-400/10 mt-2 text-xs">
                  <span className="text-amber-400">🏫 கிளை:</span>
                  <span className="text-white font-bold">{simShop}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const saved = localStorage.getItem('temperking_orders_list');
                    if (saved) setOrdersList(JSON.parse(saved));
                    alert("ஆர்டர்கள் மற்றும் முன்பதிவு லிஸ்ட் புதுப்பிக்கப்பட்டது! ⚡");
                  }}
                  className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 px-4 py-2 rounded-xl text-xs uppercase font-extrabold tracking-wider flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw size={12} className="animate-spin-slow" />
                  <span>Refresh Queue</span>
                </button>
              </div>
            </div>

            {/* Counter Summary Cards */}
            {(() => {
              const activeShopObj = availableShops.find(sh => sh.name === simShop || sh.displayName === simShop || sh.id === simShop) || availableShops[0];
              const shopOrders = ordersList.filter(o => {
                if (!activeShopObj) return true;
                const shopShortName = activeShopObj.displayName.split(' (')[0];
                return o.pickupShopId === activeShopObj.id || 
                       o.items.some((i: any) => i.shopName === shopShortName || i.shopName === activeShopObj.name);
              });

              const pendCount = shopOrders.filter(o => o.status === 'PENDING').length;
              const prepCount = shopOrders.filter(o => o.status === 'PREPARING').length;
              const readyCount = shopOrders.filter(o => o.status === 'READY_FOR_PICKUP' || o.status === 'SHIPPED').length;
              const compCount = shopOrders.filter(o => o.status === 'COMPLETED').length;

              return (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                    <div className="bg-[#18191e] border border-white/5 p-4 rounded-2xl relative overflow-hidden">
                      <span className="text-[10px] text-gray-500 block uppercase font-bold">புதியவை (Pending)</span>
                      <span className="text-2xl font-black text-amber-400 block font-mono mt-1">{pendCount}</span>
                      {pendCount > 0 && <div className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full animate-ping"></div>}
                    </div>
                    <div className="bg-[#18191e] border border-white/5 p-4 rounded-2xl">
                      <span className="text-[10px] text-gray-500 block uppercase font-bold">தயாராகிறது (Preparing)</span>
                      <span className="text-2xl font-black text-blue-400 block font-mono mt-1">{prepCount}</span>
                    </div>
                    <div className="bg-[#18191e] border border-white/5 p-4 rounded-2xl">
                      <span className="text-[10px] text-gray-500 block uppercase font-bold">வழங்கத் தயார் (Ready / Shipped)</span>
                      <span className="text-2xl font-black text-purple-400 block font-mono mt-1">{readyCount}</span>
                    </div>
                    <div className="bg-[#18191e] border border-white/5 p-4 rounded-2xl text-left">
                      <span className="text-[10px] text-gray-500 block uppercase font-bold">முடிந்தது (Completed)</span>
                      <span className="text-2xl font-black text-emerald-400 block font-mono mt-1">{compCount}</span>
                    </div>
                  </div>

                  {/* Active Orders List details */}
                  {shopOrders.length === 0 ? (
                    <div className="bg-black/25 rounded-2xl border border-white/[0.04] p-12 text-center space-y-3">
                      <div className="w-12 h-12 bg-white/[0.02] rounded-full mx-auto flex items-center justify-center text-gray-650 border border-white/10">
                        <ClipboardList size={20} />
                      </div>
                      <h4 className="text-sm font-extrabold text-white uppercase tracking-wider">விற்பனைப் பதிவுகள் ஏதுமில்லை</h4>
                      <p className="text-xs text-gray-505 max-w-sm mx-auto leading-relaxed text-gray-400">
                        உங்களுக்கு இந்த கிளையில் ஆன்லைன் கார்ட் ஆர்டர்கள் ஏதும் இதுவரை வாடிக்கையாளர்களிடம் இருந்து பெறப்படவில்லை.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {shopOrders.map((order) => {
                        const isPickupComp = order.fulfillmentType === 'pickup';
                        return (
                          <div key={order.id} className="bg-black/20 border border-white/[0.05] rounded-2xl p-4 sm:p-5 hover:border-white/10 transition-all duration-205 space-y-4 text-left">
                            
                            <div className="flex flex-col sm:flex-row justify-between gap-3 border-b border-white/[0.04] pb-3.5">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-black font-mono text-amber-400">{order.id}</span>
                                  <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                                    order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400' :
                                    order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400' : 'bg-amber-400/10 text-amber-400'
                                  }`}>
                                    {order.status}
                                  </span>
                                  <span className={`text-[8.5px] uppercase font-black px-1.5 py-0.5 rounded font-mono ${
                                    order.fulfillmentType === 'pickup' ? 'bg-purple-500/10 text-purple-400 animate-pulse' : 'bg-blue-500/10 text-blue-400'
                                  }`}>
                                    {order.fulfillmentType === 'pickup' ? '🏪 கடையிலேயே பொருத்தல்' : '📦 குரியர் விநியோகம்'}
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1 font-mono">Date: {order.createdAt}</p>
                              </div>

                              <div className="sm:text-right">
                                <span className="text-[9px] text-gray-500 block font-mono">உத்தேச மதிப்பு:</span>
                                <b className="text-sm text-white font-mono">₹{order.total}</b>
                              </div>
                            </div>

                            {/* Customer segment client detail */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#16171c]/40 p-3.5 rounded-xl border border-white/[0.03]">
                              <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase text-gray-500 tracking-wider">வாடிக்கையாளர் (Recipient):</p>
                                <p className="text-white font-black text-sm">{order.customerName}</p>
                                <p className="text-gray-400 font-mono">📞 {order.customerPhone}</p>
                              </div>

                              <div className="space-y-1">
                                <p className="text-[9px] font-black uppercase text-gray-505 tracking-wider">வழங்கல் முகவரி/குறிப்புகள் (Shipping Target):</p>
                                {isPickupComp ? (
                                  <p className="text-purple-350 font-bold block">🏬 வருகை கிளை: {order.pickupShopName} ({order.pickupTimeSlot})</p>
                                ) : (
                                  <>
                                    <p className="text-gray-300 leading-snug">{order.shippingAddress}</p>
                                    <p className="text-gray-400 font-mono font-bold">📍 {order.shippingCity} - PIN: {order.shippingPincode}</p>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Ordered Spars Details */}
                            <div className="space-y-1.5">
                              <p className="text-[9px] font-black uppercase text-gray-500 tracking-wider">தேவைப்படும் டெம்பர்கள் (Items Ordered):</p>
                              <div className="space-y-1 bg-black/40 p-2.5 rounded-xl border border-white/[0.03]">
                                {order.items.map((it: any, index: number) => (
                                  <div key={index} className="flex justify-between items-center text-xs py-1 px-2 hover:bg-white/[0.02] rounded">
                                    <div className="flex items-center gap-2">
                                      {it.imageUrl && <img src={it.imageUrl} className="w-5.5 h-5.5 rounded object-cover border border-white/10" referrerPolicy="no-referrer" />}
                                      <div className="text-left">
                                        <p className="text-gray-300 font-bold">{it.name}</p>
                                        <p className="text-[9.5px] text-gray-500 block font-mono">{it.englishName}</p>
                                      </div>
                                    </div>
                                    <div className="text-slate-400 font-mono font-bold whitespace-nowrap">
                                      Qty: {it.quantity} × ₹{it.price}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Courier tracker input or OTP challenge overlay */}
                            {selectedShippingOrderId === order.id && (
                              <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl space-y-3 animate-in slide-in-from-top-2 duration-200">
                                <h4 className="text-xs font-black text-blue-400 uppercase tracking-wider">🚚 குரியர் பார்சல் அனுப்பும் விவரங்களைப் பதியவும்</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div className="space-y-1">
                                    <label className="text-[9px] text-gray-405 font-bold block uppercase">குரியர் செக்ஷன் பெயர் (e.g. Professional / DTDC):</label>
                                    <input 
                                      type="text" 
                                      placeholder="DTDC Express" 
                                      value={shippingCarrier}
                                      onChange={(e) => setShippingCarrier(e.target.value)}
                                      className="w-full bg-[#121316] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" 
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] text-gray-405 font-bold block uppercase">டிராக்கிங் நம்பர் (Tracking ID):</label>
                                    <input 
                                      type="text" 
                                      placeholder="TRK10023456" 
                                      value={shippingTrackId}
                                      onChange={(e) => setShippingTrackId(e.target.value)}
                                      className="w-full bg-[#121316] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white" 
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!shippingCarrier || !shippingTrackId) {
                                        alert("விவரங்கள் முழுமையாக நிரப்பவும்.");
                                        return;
                                      }
                                      setOrdersList(prev => {
                                        const updated = prev.map(o => {
                                          if (o.id === order.id) {
                                            return { 
                                              ...o, 
                                              status: 'SHIPPED',
                                              courierName: shippingCarrier,
                                              trackingNumber: shippingTrackId
                                            };
                                          }
                                          return o;
                                        });
                                        localStorage.setItem('temperking_orders_list', JSON.stringify(updated));
                                        return updated;
                                      });
                                      setSelectedShippingOrderId(null);
                                      setShippingCarrier('');
                                      setShippingTrackId('');
                                      alert("நன்றி! குரியர் தகவல் பதிவேற்றப்பட்டது, வாடிக்கையாளருக்கும் தகவல் Live-Sync முறையில் பகிரப்பட்டது. 🚚");
                                    }}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-[10.5px] font-black uppercase cursor-pointer"
                                  >
                                    சுற்று உறுதி செய் (Confirm Shipped)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedShippingOrderId(null)}
                                    className="bg-white/5 hover:bg-white/10 text-white px-3 py-2 rounded-lg text-[10.5px] font-black uppercase cursor-pointer"
                                  >
                                    ரத்து செய்
                                  </button>
                                </div>
                              </div>
                            )}

                            {selectedOtpOrderId === order.id && (
                              <div className="bg-amber-400/5 border border-amber-400/20 p-4 rounded-xl space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                                <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider">⚡ வாடிக்கையாளரின் வருகை OTP காசோலை சரிபார்த்தல்</h4>
                                <p className="text-[10px] text-gray-400">ஆர்டர் செய்யும்போது வாடிக்கையாளரின் போனில் காட்டப்பட்ட 4-இலக்க OTP-ஐக் கேட்டு தட்டச்சு செய்யவும்:</p>
                                <div className="flex gap-2 items-center">
                                  <input 
                                    type="text" 
                                    placeholder="4-digit OTP" 
                                    maxLength={4} 
                                    value={pickupOtpChallenge}
                                    onChange={(e) => setPickupOtpChallenge(e.target.value)}
                                    className="bg-[#121316] border border-white/10 rounded-xl px-4 py-2 font-mono text-base font-black tracking-widest text-center text-amber-400 outline-none focus:border-amber-400 max-w-[120px]" 
                                  />
                                  
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (pickupOtpChallenge === order.pickupOtp) {
                                        setOrdersList(prev => {
                                          const updated = prev.map(o => {
                                            if (o.id === order.id) {
                                              return { ...o, status: 'COMPLETED' };
                                            }
                                            return o;
                                          });
                                          localStorage.setItem('temperking_orders_list', JSON.stringify(updated));
                                          return updated;
                                        });
                                        setSelectedOtpOrderId(null);
                                        setPickupOtpChallenge('');
                                        alert("அமேசிங்! OTP கன்பார்ம் செய்யப்பட்டது. முன்பதிவு வெற்றிகரமாக முடிந்தது! 🟢");
                                      } else {
                                        alert("தவறான OTP குறியீடு! தயவுசெய்து வாடிக்கையாளரின் ஆர்டர் ரசீதில் உள்ள OTP-ஐ சரிபார்க்கவும்.");
                                      }
                                    }}
                                    className="bg-amber-400 hover:bg-amber-500 text-black px-4 py-2.5 rounded-lg text-[10.5px] font-black uppercase cursor-pointer"
                                  >
                                    OTP சரிபார் (Verify OTP)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedOtpOrderId(null)}
                                    className="bg-white/5 hover:bg-white/10 text-white px-3 py-2.5 rounded-lg text-[10.5px] font-black uppercase cursor-pointer"
                                  >
                                    விலகு
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Processing Commands Actions Bar */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[10px] text-gray-500 border-t border-white/[0.03]">
                              <span>ஆர்டர் நிலை: <b className="text-white font-mono">{order.status}</b></span>

                              <div className="flex flex-wrap gap-2">
                                {order.status === 'PENDING' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOrdersList(prev => {
                                          const updated = prev.map(o => {
                                            if (o.id === order.id) {
                                              return { ...o, status: 'PREPARING' };
                                            }
                                            return o;
                                          });
                                          localStorage.setItem('temperking_orders_list', JSON.stringify(updated));
                                          return updated;
                                        });
                                        alert("ஆர்டர் தற்போது தயாராகி வருகிறது! 🛠️");
                                      }}
                                      className="bg-blue-500 text-white px-3.5 py-1.5 rounded-lg font-black uppercase tracking-wider hover:bg-blue-600 transition cursor-pointer"
                                    >
                                      ஆர்டர் ஏற்றுக்கொள் (Set: Preparing)
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm("நிச்சயமாக உங்களது இந்த ஆர்டரை ரத்து செய்ய விரும்புகிறீர்களா? கையிருப்பு (Stock) தானாகவே கடையின் கணக்கில் மீட்டமைக்கப்படும்.")) {
                                          setOrdersList(prev => {
                                            const updated = prev.map(o => {
                                              if (o.id === order.id) {
                                                return { ...o, status: 'CANCELLED' };
                                              }
                                              return o;
                                            });
                                            localStorage.setItem('temperking_orders_list', JSON.stringify(updated));
                                            return updated;
                                          });
                                          // Revert inventory stock
                                          setSimulatedProducts(curr => curr.map(item => {
                                            const matchItem = order.items.find((i: any) => i.productId === item.id);
                                            if (matchItem) {
                                              return { ...item, stockCount: (item.stockCount || 0) + matchItem.quantity };
                                            }
                                            return item;
                                          }));
                                          window.dispatchEvent(new Event('storage'));
                                          alert("ஆர்டர் ரத்து செய்யப்பட்டது! கையிருப்பு திருத்தப்பட்டது. 🗑️");
                                        }
                                      }}
                                      className="text-red-400 hover:text-red-300 border border-red-500/10 hover:bg-red-500/10 px-3 py-1.5 rounded-lg uppercase font-black transition cursor-pointer"
                                    >
                                      ரத்துசெய் (Cancel)
                                    </button>
                                  </>
                                )}

                                {order.status === 'PREPARING' && (
                                  <>
                                    {order.fulfillmentType === 'pickup' ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOrdersList(prev => {
                                            const updated = prev.map(o => {
                                              if (o.id === order.id) {
                                                return { ...o, status: 'READY_FOR_PICKUP' };
                                              }
                                              return o;
                                            });
                                            localStorage.setItem('temperking_orders_list', JSON.stringify(updated));
                                            return updated;
                                          });
                                          alert("முன்பதிவு தற்போது கடையிலேயே வாடிக்கையாளர் பொருத்துவதற்குத் தயார் நிலை! 🟢");
                                        }}
                                        className="bg-purple-600 text-white px-3.5 py-1.5 rounded-lg font-black uppercase tracking-wider hover:bg-purple-700 transition cursor-pointer"
                                      >
                                        பொருத்தத் தயார் (Ready to Fit)
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedShippingOrderId(order.id);
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg font-black uppercase tracking-wider transition cursor-pointer"
                                      >
                                        குரியர் அனுப்பு (Ship and Track)
                                      </button>
                                    )}
                                  </>
                                )}

                                {order.status === 'READY_FOR_PICKUP' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedOtpOrderId(order.id);
                                    }}
                                    className="bg-emerald-500 text-black font-black px-3.5 py-1.5 rounded-lg uppercase tracking-wider hover:bg-emerald-600 transition cursor-pointer"
                                  >
                                    வாடிக்கையாளர் வருகைச் சரிபார்ப்பு (Fit and Complete Order - Enter OTP)
                                  </button>
                                )}

                                {order.status === 'SHIPPED' && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOrdersList(prev => {
                                        const updated = prev.map(o => {
                                          if (o.id === order.id) {
                                            return { ...o, status: 'COMPLETED' };
                                          }
                                          return o;
                                        });
                                        localStorage.setItem('temperking_orders_list', JSON.stringify(updated));
                                        return updated;
                                      });
                                      alert("ஆர்டர் வெற்றிகரமாக நிறைவடைந்தது! ✔️");
                                    }}
                                    className="bg-emerald-500 text-black font-black px-3.5 py-1.5 rounded-lg uppercase tracking-wider hover:bg-emerald-600 transition cursor-pointer"
                                  >
                                    விநியோகம் முடிந்தது (Delivered & Set Complete)
                                  </button>
                                )}

                                {order.status === 'COMPLETED' && (
                                  <span className="text-emerald-400 font-extrabold select-none">✔️ ஆர்டர் முழுமையாக முடிவடைந்தது & டெலிவரி கன்பார்ம்</span>
                                )}

                                {order.status === 'CANCELLED' && (
                                  <span className="text-red-500 font-extrabold select-none font-bold">❌ ரத்து செய்யப்பட்ட ஆர்டர்</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </section>
      )}

      {/* DETAILED WALKIN RETAIL RECEIPT VISUALIZER OUTLINE */}
      {selectedCompletedBill && (
        <div className="fixed inset-0 z-[250] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-black font-mono border-4 border-double border-black p-5 rounded-none w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl relative select-none">
            <div className="absolute top-4 right-4 border border-dashed border-emerald-600 text-emerald-600 font-bold p-1 rounded-sm text-[8px] transform rotate-12">
              Sync Hash: {selectedCompletedBill.syncHash}
            </div>

            <div className="text-center space-y-1 pb-3 border-b border-dashed border-black">
              <h2 className="text-base font-black tracking-tight uppercase">TEMPER KING 👑</h2>
              <p className="text-[8.5px] font-bold leading-normal">{selectedCompletedBill.shopName}</p>
              <p className="text-[8px]">உரிமையாளர்: மச்சான் குமரன் • TrustSpares Network</p>
              <p className="text-[8.5px] font-bold mt-1">ரசீது எண்: {selectedCompletedBill.id}</p>
              <p className="text-[8px] text-gray-600">{selectedCompletedBill.timestamp}</p>
            </div>

            <div className="py-2.5 text-[9px] space-y-1">
              <p><b>வாடிக்கையாளர் (Client):</b> {selectedCompletedBill.customerName}</p>
              <p><b>கைபேசி (Phone):</b> {selectedCompletedBill.customerPhone}</p>
              <p><b>ஊழியர் (Sales Partner):</b> {selectedCompletedBill.staffName}</p>
            </div>

            <table className="w-full text-[9px] border-t border-b border-dashed border-black py-2 my-2 text-left">
              <thead>
                <tr className="font-bold border-b border-black">
                  <th className="pb-1">பொருள்</th>
                  <th className="pb-1 text-center">அளவு</th>
                  <th className="pb-1 text-right">விலை</th>
                </tr>
              </thead>
              <tbody>
                {selectedCompletedBill.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-1">
                      <span className="font-bold block text-[9.5px]">{item.name}</span>
                      <span className="text-[7.5px] font-sans text-gray-500 block">{item.englishName}</span>
                    </td>
                    <td className="py-1 text-center font-bold">{item.quantity}</td>
                    <td className="py-1 text-right font-bold">₹{item.subtotal}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1 text-[9px] text-right">
              <div className="flex justify-between">
                <span>கழிவுகள் (Discount):</span>
                <span>- ₹{selectedCompletedBill.discountValue}</span>
              </div>
              <div className="flex justify-between">
                <span>வரி (Estimated GST 18%):</span>
                <span>₹{selectedCompletedBill.gstValue}</span>
              </div>
              <div className="flex justify-between font-black text-[11px] border-t border-dashed border-black pt-1.5 ">
                <span>GRAND TOTAL:</span>
                <span>₹{selectedCompletedBill.grandTotal}</span>
              </div>
            </div>

            <div className="text-center pt-4 space-y-2.5">
              <div className="w-20 h-20 bg-gray-100 border border-black border-dashed mx-auto flex flex-col justify-center items-center text-center p-1">
                <span className="text-[28px]">📱</span>
                <span className="text-[6px] font-black uppercase mt-1 leading-none">{selectedCompletedBill.syncHash}</span>
              </div>
              <p className="text-[8px] text-gray-500 font-sans">விற்பனை செய்யப்பட்டவை live-sync முறையில் Central Cloud-ல் பதிவாகியது.</p>
              <div className="flex gap-2">
                <button type="button" onClick={() => window.print()} className="flex-1 bg-black text-white py-1.5 text-[9px] font-bold border border-black cursor-pointer">🖨️ பிரிண்ட்</button>
                <button type="button" onClick={() => setSelectedCompletedBill(null)} className="flex-1 bg-white text-black py-1.5 text-[9px] font-bold border border-black cursor-pointer">மூடு</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PREMIUM PRODUCT REGISTER ACTION MODAL */}
      {addProductModalOpen && (
        <div className="fixed inset-0 z-[155] overflow-y-auto" id="add-product-modal">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 transition-opacity bg-black/85 backdrop-blur-sm" 
              onClick={() => setAddProductModalOpen(false)}
            ></div>

            {/* Trick browser to center */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

            {/* Modal Body */}
            <div className="inline-block w-full max-w-lg p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-[#0c0d10] border border-white/10 rounded-3xl shadow-2xl relative z-10 text-gray-200">
              
              {/* Decorative Blur */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-amber-400/[0.03] rounded-full blur-[80px] pointer-events-none"></div>

              {/* Header */}
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 text-lg">📦</span>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">
                      புதிய தயாரிப்பு பதிவேற்றம் (Stock Entry)
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">டெம்பர் கிங் பிராண்ட் லைவ் இன்வென்டரி மேலாண்மை</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAddProductModalOpen(false)}
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleModalAddProduct} className="space-y-4">
                {/* Product display title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black tracking-wider uppercase text-gray-400 block">தயாரிப்பு பெயர் (Tamil Name) *</label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: Redmi Note 13 Glass Armor"
                    value={modalProdName}
                    onChange={(e) => setModalProdName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-gray-200 outline-none focus:border-amber-400 transition"
                  />
                </div>

                {/* English subtitle */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black tracking-wider uppercase text-gray-400 block">specs குறிப்பு (English Name)</label>
                  <input
                    type="text"
                    placeholder="எ.கா: Ultra Armor 11D Glass Shield"
                    value={modalProdEngName}
                    onChange={(e) => setModalProdEngName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-gray-200 outline-none focus:border-amber-400 transition"
                  />
                </div>

                {/* Category & Stock Qty Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-wider uppercase text-gray-400 block">பிரிவு (Category)</label>
                    <select
                      value={modalProdCategory}
                      onChange={(e) => setModalProdCategory(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-gray-200 outline-none focus:border-amber-400 cursor-pointer transition text-white"
                    >
                      <option value="premium" className="bg-[#0c0d10] text-gray-200">📱 Ultra Clear Premium Glass</option>
                      <option value="matte" className="bg-[#0c0d10] text-gray-200">🎮 Silk Touch Gaming Matte</option>
                      <option value="privacy" className="bg-[#0c0d10] text-gray-200">🕵️ Private Spy Anti-Peeping</option>
                      <option value="uv" className="bg-[#0c0d10] text-gray-200">⚡ UV Curved Full Tempered</option>
                      <option value="BIKE_SPARE" className="bg-[#0c0d10] text-gray-200">🏍️ பைக் ஸ்பேர்ஸ் (Automotive)</option>
                      <option value="TV_SPARE" className="bg-[#0c0d10] text-gray-200">📺 டிவி கார்டு (TV Guard)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-wider uppercase text-gray-400 block">In-Stock அளவு (Qty):</label>
                    <input
                      type="number"
                      placeholder="எ.கா: 25"
                      value={modalProdStockCount}
                      onChange={(e) => setModalProdStockCount(Number(e.target.value) || 1)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-gray-200 outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>

                {/* Price Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-wider uppercase text-gray-400 block">விற்பனை விலை (₹) *</label>
                    <input
                      type="number"
                      required
                      placeholder="எ.கா: 399"
                      value={modalProdPrice}
                      onChange={(e) => setModalProdPrice(Number(e.target.value) || 0)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-gray-200 outline-none focus:border-amber-400 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black tracking-wider uppercase text-gray-400 block">அசல் சந்தை விலை (₹)</label>
                    <input
                      type="number"
                      placeholder="எ.கா: 799"
                      value={modalProdOriginalPrice}
                      onChange={(e) => setModalProdOriginalPrice(Number(e.target.value) || 0)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-gray-200 outline-none focus:border-amber-400 transition"
                    />
                  </div>
                </div>

                {/* Rich Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black tracking-wider uppercase text-gray-400 block">தயாரிப்பு விளக்கம் (Description)</label>
                  <textarea
                    placeholder="எ.கா: லேசர் கட் பிரீமியம் டெம்பர் கிளாஸ் மொபைல் பாதுகாப்பிற்கு."
                    value={modalProdDescription}
                    onChange={(e) => setModalProdDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-gray-200 outline-none focus:border-amber-400 transition resize-none"
                  />
                </div>

                {/* Performance specs rows */}
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[8px] font-black text-gray-500 uppercase block">பாதுகாப்பு (Impact)</label>
                    <input
                      type="number"
                      value={modalProdProtectionScore}
                      onChange={(e) => setModalProdProtectionScore(Number(e.target.value) || 95)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-gray-500 uppercase block">மதிப்பீடு (Rating)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={modalProdRating}
                      onChange={(e) => setModalProdRating(Number(e.target.value) || 4.9)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] font-black text-gray-500 uppercase block">விளம்பர பேட்ஜ்</label>
                    <input
                      type="text"
                      placeholder="BEST SELLER"
                      value={modalProdBadge}
                      onChange={(e) => setModalProdBadge(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white text-center outline-none"
                    />
                  </div>
                </div>

                {/* Comma Features list */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black tracking-wider uppercase text-gray-400 block font-mono">சிறப்பம்சங்கள் (Features - கமாவால் பிரிக்கவும்)</label>
                  <input
                    type="text"
                    placeholder="9H Hardness, Bubble Free, Dynamic Glide"
                    value={modalProdFeatures}
                    onChange={(e) => setModalProdFeatures(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400 transition"
                  />
                </div>

                {/* Target Store Branch */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black tracking-wider uppercase text-gray-400 block font-mono">இலக்கு கிளை (Target Branch Store)</label>
                  <select
                    value={modalProdShop}
                    onChange={(e) => setModalProdShop(e.target.value)}
                    className="w-full bg-[#121316] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400 cursor-pointer transition"
                  >
                    {availableShops.map((sh) => (
                      <option key={sh.id} value={sh.name} className="bg-[#0c0d10] text-[#eee]">{sh.displayName.split(' (')[0]}</option>
                    ))}
                  </select>
                </div>

                {/* Optional Custom Image Preset & File Creator */}
                <div className="space-y-3 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold text-gray-300 block">தயாரிப்பு படம் (Product Image)</label>
                    <span className="text-[9px] text-amber-400 font-mono font-bold">URL or Upload File</span>
                  </div>
                  
                  {modalProdImageUrl && (
                    <div className="flex items-center gap-3 bg-amber-400/5 p-2 rounded-xl border border-amber-400/10 mb-1">
                      <img 
                        src={modalProdImageUrl} 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=600&auto=format&fit=crop';
                        }}
                        className="w-10 h-10 object-cover rounded-lg border border-amber-400/20" 
                        alt="Thumbnail" 
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[9px] font-black text-white truncate">தேர்ந்தெடுக்கப்பட்ட படம் (Selected):</p>
                        <span className="text-[8px] text-gray-500 block truncate">{modalProdImageUrl}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setModalProdImageUrl('')}
                        className="text-gray-400 hover:text-red-400 font-black text-[9px] uppercase px-2 py-1 bg-white/5 rounded"
                      >
                        X
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] text-gray-400 block mb-1">Image URL மூலம் சேர்க்க:</label>
                      <input
                        type="text"
                        placeholder="https://example.com/image.jpg"
                        value={modalProdImageUrl}
                        onChange={(e) => setModalProdImageUrl(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200 outline-none focus:border-amber-450 transition text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 block mb-1">படம் அப்லோட் செய்ய:</label>
                      <label className="w-full bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 font-bold py-2 px-3 rounded-xl border border-dashed border-amber-400/30 transition flex items-center justify-center gap-1.5 cursor-pointer text-center text-[10px]">
                        <span>📸 படம் தேர்வு செய் (Upload)</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleProductImageUpload} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Banner Option Slider Switch */}
                <div className="bg-amber-400/[0.02] border border-amber-400/10 p-3.5 rounded-2xl flex items-center justify-between gap-4">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5 text-amber-400 font-black uppercase text-[10px] tracking-wide">
                      <Sparkles size={11} className="text-amber-400 animate-pulse" />
                      <span>பானராக விளம்பரப்படுத்து (Banner Feature)</span>
                    </div>
                    <p className="text-[9px] text-gray-400 leading-normal">தயாரிப்பை கடையின் பிரதான விளம்பரப் பானர் பகுதியில் காட்ட வேண்டுமா?</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalProdIsBanner(!modalProdIsBanner)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 shrink-0 ${modalProdIsBanner ? 'bg-amber-400 justify-end' : 'bg-gray-700 justify-start'}`}
                  >
                    <span className={`w-4 h-4 rounded-full shadow-md transform transition-all ${modalProdIsBanner ? 'bg-black' : 'bg-white'}`}></span>
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setAddProductModalOpen(false)}
                    className="flex-1 bg-white/[0.04] hover:bg-white/[0.08] text-white py-3 rounded-xl text-xs font-extrabold uppercase tracking-wide transition border border-white/10"
                  >
                    மூடவும் (Close)
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-400 hover:bg-amber-500 text-black py-3 rounded-xl text-xs font-black uppercase tracking-wide transition shadow-lg shadow-amber-400/10 cursor-pointer active:scale-95"
                  >
                    சேர்க்கவும் (Publish Live)
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* SLIDING MINI CART SIDE DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden text-gray-200">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity" onClick={() => setCartOpen(false)}></div>
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#0c0d10] border-l border-white/10 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
              
              {/* Cart Header */}
              <div className="px-4 py-4 bg-[#121316] border-b border-white/[0.06] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} className="text-amber-400" />
                  <h3 className="text-sm font-extrabold text-white">உங்களது தேர்வு செய்யப்பட்டவை ({cart.length})</h3>
                </div>
                <button onClick={() => setCartOpen(false)} className="p-1 hover:bg-white/5 rounded-full transition text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {/* Cart Items Scroll Container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                {cart.length === 0 ? (
                  <div className="text-center py-24 space-y-3">
                    <ShoppingCart size={40} className="text-white/10 mx-auto" />
                    <p className="text-gray-400 text-xs font-bold">கார்ட் தற்சமயம் காலியாக உள்ளது!</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="flex gap-3 bg-white/[0.02] p-3 rounded-xl border border-white/[0.05] relative">
                      <img src={item.product.imageUrl} alt={item.product.name} className="w-14 h-14 object-cover rounded-lg border border-white/10 shrink-0 bg-black" />
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between gap-1">
                          <h4 className="font-extrabold text-[12px] line-clamp-1 text-white">{item.product.name}</h4>
                          <button onClick={() => removeFromCart(item.product.id)} className="text-[10px] text-gray-400 hover:text-rose-400 transition pr-1">
                            <X size={14} />
                          </button>
                        </div>
                        <p className="text-[9px] text-gray-500 font-mono tracking-wider uppercase">{item.product.englishName}</p>
                        
                        <div className="flex items-baseline gap-1.5 pt-0.5">
                          <span className="text-amber-400 font-extrabold text-xs">₹{item.product.price}</span>
                          <span className="text-[8px] text-rose-500 bg-rose-500/10 border border-rose-500/10 px-1 rounded-sm uppercase tracking-widest">1+1 Free</span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-1.5">
                          <div className="flex items-center border border-white/10 rounded-lg bg-black/40 overflow-hidden">
                            <button onClick={() => updateCartQty(item.product.id, -1)} className="px-2 py-0.5 hover:bg-white/5 font-extrabold text-xs text-gray-400">-</button>
                            <span className="px-2.5 text-[11px] font-black text-white">{item.quantity}</span>
                            <button onClick={() => updateCartQty(item.product.id, 1)} className="px-2 py-0.5 hover:bg-white/5 font-extrabold text-xs text-gray-400">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {/* DYNAMIC FULFILLMENT FORM SETUP */}
                {cart.length > 0 && (
                  <div className="mt-6 bg-white/[0.02] border border-white/[0.08] rounded-2xl p-4 space-y-4 text-left animate-in fade-in duration-300">
                    <div className="border-b border-white/[0.06] pb-2 mb-2 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-amber-400" />
                      <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider">டெலிவரி / பெறுதல் முறை தேர்வு</h4>
                    </div>

                    {/* Delivery Option Toggle */}
                    <div className="grid grid-cols-2 gap-2 bg-black/50 p-1 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setFulfillmentType('pickup')}
                        className={`py-2 px-1 text-center rounded-lg text-[10px] font-black uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                          fulfillmentType === 'pickup'
                            ? 'bg-amber-400 text-black shadow-md'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Store size={12} />
                        <span>கடைக்கு வருதல்</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFulfillmentType('courier')}
                        className={`py-2 px-1 text-center rounded-lg text-[10px] font-black uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                          fulfillmentType === 'courier'
                            ? 'bg-amber-400 text-black shadow-md'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        <Truck size={12} />
                        <span>வீட்டுக்கு கொரியர்</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {/* Customer Name */}
                      <div>
                        <label className="block text-[9px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">உங்களது பெயர் (Full Name) *</label>
                        <input
                          type="text"
                          required
                          placeholder="எ.கா: சரவணன் குமார்"
                          value={shippingName}
                          onChange={(e) => { setShippingName(e.target.value); setCheckoutError(null); }}
                          className={`w-full bg-[#121316] border rounded-xl px-3 py-2 text-[11px] text-white outline-none focus:border-amber-400/80 font-bold ${checkoutError && !shippingName.trim() ? 'border-red-500 animate-pulse' : 'border-white/10'}`}
                        />
                      </div>

                      {/* Customer Phone */}
                      <div>
                        <label className="block text-[9px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">கைபேசி எண் (Mobile Phone) *</label>
                        <input
                          type="tel"
                          required
                          placeholder="எ.கா: 9876543210"
                          value={shippingPhone}
                          onChange={(e) => { setShippingPhone(e.target.value); setCheckoutError(null); }}
                          className={`w-full bg-[#121316] border rounded-xl px-3 py-2 text-[11px] text-white outline-none focus:border-amber-400/80 font-bold ${checkoutError && (!shippingPhone.trim() || shippingPhone.trim().length < 8) ? 'border-red-500 animate-pulse' : 'border-white/10'}`}
                        />
                      </div>

                      {/* Conditional Options */}
                      {fulfillmentType === 'pickup' ? (
                        <>
                          {/* Dynamically List ALL branches */}
                          <div>
                            <label className="block text-[9px] font-extrabold uppercase tracking-wider text-amber-400 mb-1">வருகை தரும் கிளை (Select Branch Store) *</label>
                            <select
                              value={selectedPickupShopId}
                              onChange={(e) => setSelectedPickupShopId(e.target.value)}
                              className="w-full bg-[#121316] border border-amber-400/20 rounded-xl px-2.5 py-2 text-[11px] text-white outline-none focus:border-amber-400 font-bold"
                            >
                              {availableShops.map((sh) => (
                                <option key={sh.id} value={sh.id} className="bg-[#0c0d10] text-[#eee]">
                                  {sh.displayName.split(' (')[0]} ({sh.domain})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Render Active Selected Shop Details to ensure auto-inheritance is visually verified */}
                          {(() => {
                            const activeBranch = availableShops.find(sh => sh.id === selectedPickupShopId) || availableShops[0];
                            if (!activeBranch) return null;
                            return (
                              <div className="bg-amber-400/5 border border-amber-400/10 p-3 rounded-xl space-y-1.5 text-[10px] animate-in slide-in-from-top-1">
                                <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-amber-500">
                                  <span>கிளை முகவரி (Branch Address)</span>
                                  <span className="flex items-center gap-0.5 text-emerald-400">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    ONLINE LIVE
                                  </span>
                                </div>
                                <p className="text-gray-300 font-bold leading-relaxed">{activeBranch.address}</p>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-gray-500 text-[9px] pt-1 border-t border-white/[0.04]">
                                  <span className="flex items-center gap-1">📍 GPS: {activeBranch.gps}</span>
                                  <span className="flex items-center gap-1">🌐 Domain: {activeBranch.domain}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-[9px] pt-1">
                                  <Check className="stroke-[3px]" size={10} />
                                  <span>கையிருப்பு சரிபார்க்கப்பட்டது: 100% Instant Fitting Ready</span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Appointment Time Selection */}
                          <div>
                            <label className="block text-[9px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">வருகை நேரம் (Time Slot) *</label>
                            <select
                              value={selectedPickupTime}
                              onChange={(e) => setSelectedPickupTime(e.target.value)}
                              className="w-full bg-[#121316] border border-white/10 rounded-xl px-2.5 py-2 text-[11px] text-white outline-none focus:border-amber-400 font-bold"
                            >
                              <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM (காலை நேரம்)</option>
                              <option value="12:00 PM - 02:00 PM">12:00 PM - 02:00 PM (மதிய நேரம்)</option>
                              <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM (மதிய நேரம்)</option>
                              <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM (மாலை நேரம்)</option>
                              <option value="06:00 PM - 08:00 PM">06:00 PM - 08:00 PM (இரவு நேரம்)</option>
                              <option value="08:00 PM - 10:00 PM">08:00 PM - 10:00 PM (இரவு நேரம்)</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Shipping Address Input */}
                          <div>
                            <label className="block text-[9px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">முழு கொரியர் முகவரி (Delivery Address) *</label>
                            <textarea
                              required
                              rows={2}
                              value={shippingAddress}
                              onChange={(e) => setShippingAddress(e.target.value)}
                              placeholder="கதவு எண், தெру பெயர், பகுதி, ஊர் பெயர் மற்றும் மாவட்டம்..."
                              className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white outline-none focus:border-amber-400/80 font-bold leading-relaxed resize-none"
                            />
                          </div>

                          {/* City & Pincode Row */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[9px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">மாவட்டம்/மாநிலம் (City / State)</label>
                              <input
                                type="text"
                                value={shippingCity}
                                onChange={(e) => setShippingCity(e.target.value)}
                                className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2 text-[11px] text-white outline-none focus:border-amber-400/80 font-bold"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] font-extrabold uppercase tracking-wider text-amber-400 mb-1">பின் கோடு (Pincode) *</label>
                              <input
                                type="text"
                                required
                                maxLength={6}
                                placeholder="எ.கா: 631001"
                                value={shippingPincode}
                                onChange={(e) => setShippingPincode(e.target.value)}
                                className="w-full bg-[#121316] border border-amber-400/20 rounded-xl px-3 py-2 text-[11px] text-white outline-none focus:border-amber-400/80 font-bold"
                              />
                            </div>
                          </div>

                          <div className="bg-amber-400/5 border border-amber-400/10 p-3 rounded-xl space-y-2 text-[10px] animate-in slide-in-from-top-1">
                            <span className="font-bold text-amber-400 uppercase text-[8px] tracking-widest block">📦 கொரியர் பேக்கிங் அஷ்யூரன்ஸ்</span>
                            <p className="text-gray-300 leading-normal">
                              உங்களது பார்சல் கிரிஸ்டல் பபுள் ராப் மூலம் பாதுகாப்பாக பேக் செய்யப்பட்டு, 12 மணிநேரத்திற்குள் Professional Courier அல்லது DTDC வழியாக அனுப்பி வைப்போம். லைவ் டிராக்கிங் ஐடி WhatsApp வழியாக அனுப்பி வைக்கப்படும்!
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Subtotal & Checkout Section */}
              {cart.length > 0 && (
                <div className="p-4 border-t border-white/[0.06] bg-[#121316] space-y-3">
                  <div className="flex justify-between items-baseline text-xs font-bold text-gray-400">
                    <span>துணை மொத்தம் (Subtotal):</span>
                    <span className="text-amber-400 text-lg font-black font-sans">₹{cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0)}</span>
                  </div>
                  
                  <div className="space-y-2">
                    {checkoutError && (
                      <div className="bg-red-400/10 border border-red-500/20 text-red-300 p-2.5 rounded-xl text-[10px] font-extrabold text-center leading-normal animate-pulse shadow-sm">
                        ⚠️ {checkoutError}
                      </div>
                    )}
                    <button 
                      onClick={handleProceedToCheckout}
                      className="w-full bg-amber-450 hover:bg-amber-500 active:scale-95 text-black font-extrabold py-3 rounded-xl text-center transition flex justify-center items-center gap-1.5 text-xs uppercase tracking-wider shadow-lg cursor-pointer"
                    >
                      <CheckCircle2 size={14} className="animate-pulse" />
                      <span>ஆன்லைனில் இப்போதே ஆர்டர் செய் (Place Order In-App Now)</span>
                    </button>
                    <p className="text-[10px] text-gray-400 text-center leading-normal">
                      * ஆன்லைனில் ஆர்டர் செய்ததும், உங்களுக்கான ரசீது மற்றும் OTP உடனுக்குடன் உருவாக்கப்பட்டு, கடையின் டேஷ்போர்டில் லைவ்-ஆகச் சேர்க்கப்படும்!
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* UNIFIED MULTI-STORE & REAL-TIME ARCHITECTURE VISUALIZER */}
      <section className="hidden">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 bg-amber-400/10 border border-amber-400/20 text-amber-500 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-mono">
            <Activity size={12} className="animate-pulse" />
            <span>டெக்னாலஜி விளக்கம் • ARCHITECTURE VIEW</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-3 leading-tight">
            TrustSpares & TemperKing <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">ஒருங்கிணைந்த மல்டி-ஸ்டோர் நெட்வொர்க்</span>
          </h3>
          <p className="text-xs sm:text-sm text-gray-400 mt-3 leading-relaxed">
            அரக்கோணத்தின் பல்வேறு பகுதிகளில் தனித்தனி பிராண்ட் பெயர்களில் கடைகள் அமைந்திருந்தாலும், அவை அனைத்தும் <b className="text-white">TrustSpares</b>-இன் ஒரே மைய டேட்டாபேஸ் எஞ்சின் மூலம் எவ்வாறு தடையின்றி இயங்குகின்றன என்பதை கீழே உள்ள லைவ் சிமுலேட்டரில் கிளிக் செய்து தெரிந்து கொள்ளுங்கள்!
          </p>
        </div>

        {/* Dynamic Process Steps Navigator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Step controller and Explanations */}
          <div className="lg:col-span-4 space-y-3">
            <button 
              onClick={() => setActiveStepTab('add')}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 cursor-pointer ${
                activeStepTab === 'add' 
                  ? 'bg-amber-400/[0.04] border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.05)]' 
                  : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                activeStepTab === 'add' ? 'bg-amber-400 text-black font-black' : 'bg-white/5 text-gray-400'
              }`}>
                1
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Plus size={14} className="text-amber-400" />
                  <span>ஸ்டோர் ஊழியர் பொருள் பதிவேற்றம்</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                  கடையிலுள்ள ஊழியர் தங்களது அட்மின் பேனல் மூலம் புதிய தயாரிப்புகளை நொடியில் பதிவேற்றுவர்.
                </p>
              </div>
            </button>

            <button 
              onClick={() => setActiveStepTab('sync')}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 cursor-pointer ${
                activeStepTab === 'sync' 
                  ? 'bg-amber-400/[0.04] border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.05)]' 
                  : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                activeStepTab === 'sync' ? 'bg-amber-400 text-black font-black' : 'bg-white/5 text-gray-400'
              }`}>
                2
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Database size={14} className="text-amber-400" />
                  <span>உடனடி கிளவுட் சர்வர் ஒருங்கிணைப்பு</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                  பதிவு செய்யப்பட்ட பொருட்கள் TrustSpares & TemperKing இரண்டிலுமே தானாக காட்சியளிக்கும்.
                </p>
              </div>
            </button>

            <button 
              onClick={() => setActiveStepTab('book')}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 cursor-pointer ${
                activeStepTab === 'book' 
                  ? 'bg-amber-400/[0.04] border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.05)]' 
                  : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                activeStepTab === 'book' ? 'bg-amber-400 text-black font-black' : 'bg-white/5 text-gray-400'
              }`}>
                3
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <MapPin size={14} className="text-amber-400" />
                  <span>GPS இருப்பிடம் மற்றும் நேரடி பிக்கப்</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                  பயன்பாட்டாளர்கள் புக் செய்ததும், அந்த பொருள் கிடைக்கும் சரியான கடை இருப்பிடம் மற்றும் முகவரியைக் காட்டும்.
                </p>
              </div>
            </button>

            <button 
              onClick={() => setActiveStepTab('profile')}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-4 cursor-pointer ${
                activeStepTab === 'profile' 
                  ? 'bg-amber-400/[0.04] border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.05)]' 
                  : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                activeStepTab === 'profile' ? 'bg-amber-400 text-black font-black' : 'bg-white/5 text-gray-400'
              }`}>
                4
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <Store size={14} className="text-amber-400" />
                  <span>கடை ப்ரொஃபைல் & மேப் அமைப்புகள்</span>
                </h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                  புதிய கிளைகள், ஜி.பி.எஸ் மேப் மற்றும் பிராண்ட் வெப்சைட்டுகளின் டொமைன்களை நிர்வகிக்கலாம்.
                </p>
              </div>
            </button>
          </div>

          {/* RIGHT: Live Interactive Simulation Playground */}
          <div className="lg:col-span-8 bg-[#101115] border-2 border-white/[0.05] rounded-3xl p-6 relative overflow-hidden shadow-2xl">
            
            {/* Step 1 Content: Add product form */}
            {activeStepTab === 'add' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
                  <h4 className="font-extrabold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Store size={14} />
                    <span>ஸ்டெப் 1: ஊழியர் இன்வென்டரி மேலாண்மை (Staff Inventory Entry)</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Live Connection
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  அரக்கோணத்தின் எந்தவொரு பகுதி கிளையிலிருக்கும் ஊழியரும் தனது கைபேசி அல்லது கணினி மூலம் புதிய தயாரிப்புகளை இங்கிருந்து பதிவேற்றலாம்.
                </p>

                {/* 🔑 STAFF ROLE & WORKER LOGIN SIMULATOR */}
                <div className="bg-[#15171d]/60 border border-white/[0.08] p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <User size={15} className="text-amber-400" />
                    <span className="text-[10px] uppercase font-black tracking-widest text-amber-400">
                      கடை ஊழியர் லாகின் சிமுலேட்டர் (Staff Login Simulation Terminal)
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    கீழே உள்ள ஊழியர்களில் ஒருவராக நீங்கள் லாகின் செய்யலாம். லாகின் செய்ததும், <b>அந்த ஊழியர் பணிபுரியும் குறிப்பிட்ட கடைப் பகுதிக்கு மட்டுமே</b> தயாரிப்புகளை சேர்க்க முடியும்:
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {staffList.map((staff) => {
                      const isLogged = simLoggedStaffId === staff.id;
                      return (
                        <button
                          key={staff.id}
                          onClick={() => handleSimulateStaffLogin(staff)}
                          className={`p-2.5 rounded-xl border text-left transition-all duration-300 relative cursor-pointer ${
                            isLogged 
                              ? 'bg-amber-400/10 border-amber-400 text-white shadow-[0_0_10px_rgba(251,191,36,0.1)]' 
                              : 'bg-black/30 border-white/[0.05] hover:border-white/20 text-gray-400 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-base">{staff.avatar}</span>
                            {isLogged && (
                              <span className="text-[8px] bg-amber-400 text-black font-black uppercase px-1 rounded animate-pulse">
                                LOGGED
                              </span>
                            )}
                          </div>
                          <div className="mt-1.5">
                            <div className="font-extrabold text-[10px] truncate leading-tight">
                              {staff.name.split(' (')[0]}
                            </div>
                            <div className="text-[8px] text-gray-500 font-bold uppercase truncate tracking-wider mt-0.5">
                              {staff.role}
                            </div>
                            <div className="text-[8px] text-amber-400 font-medium truncate mt-1">
                              📍 {staff.shopDisplayName.split(' (')[0]}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Logged Status Display Card */}
                  <div className="bg-amber-400/[0.03] border border-amber-400/20 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                      <div>
                        <span className="text-gray-400 text-[10px]">தற்போது லாகின் செய்துள்ள ஊழியர்:</span>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span className="text-amber-400">{simLoggedStaffName}</span>
                          <span className="text-gray-550 text-[10px]">({simLoggedStaffRole})</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 text-[10px] block">அனுமதிக்கப்பட்ட கடை:</span>
                      <span className="text-amber-300 font-extrabold text-[10px]">
                        {simLoggedStaffId === 'ALL' 
                          ? 'அனைத்து கிளைகளும் (Master Owner)' 
                          : getShopDisplayName(simShop)
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* ⚡ DIRECT PREMIUM PRODUCT ADD TEMPLATES */}
                <div className="bg-[#121319] border border-white/[0.05] p-3.5 rounded-2xl">
                  <span className="block text-[10px] uppercase font-black tracking-widest text-[#fbbf24] mb-2">
                    ⚡ உடனடி டெம்பர் கிளாஸ் தயாரிப்பு தேர்வுகள் (Quick Product Presets):
                  </span>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { name: 'OnePlus 12R Full Glue Curved Tempered Glass', price: 499, cat: 'MOBILE_GLASS' },
                      { name: 'iPhone 15 Pro Max Privacy Premium Glass', price: 699, cat: 'MOBILE_GLASS' },
                      { name: 'Redmi Note 13 Pro+ Dust Proof Armor Glass', price: 349, cat: 'MOBILE_GLASS' },
                      { name: 'Samsung Galaxy S24 Ultra UV Liquid Glass', price: 899, cat: 'MOBILE_GLASS' },
                      { name: 'Yamaha R15 V4 Carbon Meter Screen Guard', price: 249, cat: 'BIKE_SPARE' },
                      { name: 'Sony Bravia 55" Led Panel Shield Guard', price: 1499, cat: 'TV_SPARE' },
                    ].map((tpl, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSimProdName(tpl.name);
                          setSimProdPrice(tpl.price);
                          setSimProdCategory(tpl.cat);
                        }}
                        className="p-2 bg-black/40 hover:bg-[#1a1b23] border border-white/[0.05] hover:border-amber-400/45 rounded-xl text-left transition text-[10px] cursor-pointer group"
                      >
                        <div className="font-bold text-gray-300 group-hover:text-amber-400 transition truncate text-[11px]">
                          {tpl.name}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-gray-500 text-[9px]">
                          <span>{tpl.cat === 'MOBILE_GLASS' ? '📱 டெம்பர்' : tpl.cat === 'BIKE_SPARE' ? '🏍️ பைக் ஸ்பேர்ஸ்' : '📺 எல்இடி டிவி'}</span>
                          <span className="text-amber-400 font-extrabold font-mono">₹{tpl.price}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl">
                  {/* Select branch shop */}
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1.5 flex items-center justify-between">
                      <span>கிளைத் தேர்வு (Select Branch Shop):</span>
                      {simLoggedStaffId !== 'ALL' && (
                        <span className="text-[8px] bg-amber-400/10 text-amber-400 border border-amber-400/30 px-1.5 py-0.5 rounded uppercase font-bold">
                          🔒 ஊழியர் கட்டுப்பாட்டில் பூட்டப்பட்டது
                        </span>
                      )}
                    </label>
                    {simLoggedStaffId !== 'ALL' ? (
                      <div className="w-full bg-black/40 border border-amber-400/40 rounded-xl px-3 py-2.5 text-xs text-amber-400 font-bold font-mono">
                        {getShopDisplayName(simShop)}
                      </div>
                    ) : (
                      <select 
                        value={simShop} 
                        onChange={(e) => setSimShop(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none focus:border-amber-400 text-[11px]"
                      >
                        {availableShops.map((shop) => (
                          <option key={shop.id} value={shop.name}>
                            {shop.displayName}
                          </option>
                        ))}
                      </select>
                    )}
                    {simLoggedStaffId !== 'ALL' && (
                      <span className="text-[9px] text-gray-500 mt-1 block">
                        * நீங்கள் <b>{simLoggedStaffName.split(' (')[0]}</b> என்ற கணக்கில் லாகின் செய்திருப்பதால் இக்கிளையைத் தவிர வேறு கடையில் பொருள் சேர்க்க முடியாது.
                      </span>
                    )}
                  </div>

                  {/* Select product category */}
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1.5">தயாரிப்பு வகை (Product Category):</label>
                    <select 
                      value={simProdCategory} 
                      onChange={(e) => setSimProdCategory(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none focus:border-amber-400 text-[11px]"
                    >
                      <option value="MOBILE_GLASS">டெம்பர் கிளாஸ் (Mobile Tempered Glass)</option>
                      <option value="BIKE_SPARE">பைக் ஸ்பேர்ஸ் (Bike Parts & Accessories)</option>
                      <option value="TV_SPARE">டிவி லெட் பேனல் (TV LED Panel Protection)</option>
                    </select>
                  </div>

                  {/* Product name */}
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1.5">தயாரிப்பு பெயர் (Product Name):</label>
                    <input 
                      type="text" 
                      value={simProdName}
                      onChange={(e) => setSimProdName(e.target.value)}
                      placeholder="எ.கா: OnePlus Nord CE 4 Matte Glass"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none focus:border-amber-400 text-[11px]"
                    />
                  </div>

                  {/* Product price */}
                  <div>
                    <label className="block text-[10px] uppercase font-black tracking-widest text-gray-400 mb-1.5">விலை (Price in ₹):</label>
                    <input 
                      type="number" 
                      value={simProdPrice}
                      onChange={(e) => setSimProdPrice(Number(e.target.value))}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-gray-200 outline-none focus:border-amber-400 text-[11px]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={handleSimulateAddProduct}
                    disabled={isSimulatingAdd || !simProdName.trim()}
                    className="bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-black font-extrabold px-6 py-3 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg cursor-pointer active:scale-95 transition-all"
                  >
                    {isSimulatingAdd ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>கிளவுட் நெட்வொர்க்கில் சேமிக்கப்படுகிறது...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={13} />
                        <span>புதிய தயாரிப்பை பதிவேற்றுக (Deploy To Network)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 Content: Split database sync */}
            {activeStepTab === 'sync' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
                  <h4 className="font-extrabold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Database size={14} />
                    <span>ஸ்டெப் 2: பகிரப்பட்ட மைய கிளவுட் நெட்வொர்க் (Synced Platform Display)</span>
                  </h4>
                  <span className="bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase">
                    ஆட்டோ-சிங்க் ஆன்லைன்
                  </span>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  நமது தயாரிப்புகள் அனைத்தும் ஒரே <b>Unified Database</b>-இல் சேமிக்கப்படுவதால், ஒருமுறை ஊழியர் பொருள் சேர்த்தவுடன், அது <b>TrustSpares ஆப்</b> மற்றும் <b>TemperKing வலைப்பக்கம்</b> ஆகிய இரண்டிலும் உடனடியாகத் தானாகவே அப்டேட் ஆகிறது!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Side: TrustSpares Main App Catalog representation */}
                  <div className="border border-white/10 bg-[#07080a] p-4 rounded-2xl relative">
                    <div className="absolute top-2 right-2 text-[8px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wide">
                      Main Platform
                    </div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <Smartphone size={13} className="text-blue-500" />
                      <h5 className="text-[10px] font-black text-gray-300 uppercase tracking-widest font-sans">TrustSpares App Catalog</h5>
                    </div>
                    <div className="text-[9px] text-gray-400 mb-3 bg-white/[0.02] p-2 rounded-lg border border-white/[0.04] leading-relaxed">
                      இங்கு அனைத்து பைக் நட்டுகள், எல்.இ.டி டிவி போர்டுகள் மற்றும் மொபைல் கிளாஸ்கள் போன்ற அனைத்து வகையான ஸ்பேர் பார்ட்ஸ்களும் பிரம்மாண்டமாக பட்டியலிடப்படும்.
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {simulatedProducts.map((p) => (
                        <div key={p.id} className="bg-white/[0.03] hover:bg-white/[0.05] p-2.5 rounded-xl border border-white/[0.05] flex items-center justify-between text-xs transition duration-200">
                          <div className="pr-2">
                            <div className="font-bold text-white text-[11px] leading-tight">{p.name}</div>
                            <div className="text-[9px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Store size={10} className="text-amber-400" />
                              <span>{getShopDisplayName(p.shop)}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-amber-400 font-extrabold text-[11px]">₹{p.price}</span>
                            <span className="block text-[8px] text-emerald-400 mt-0.5 uppercase tracking-wider font-extrabold flex items-center gap-0.5 justify-end">
                              <Check size={8} /> Synced
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Side: TemperKing Landing Page represents khusus glass filter */}
                  <div className="border border-amber-500/20 bg-[#0d0905] p-4 rounded-2xl relative">
                    <div className="absolute top-2 right-2 text-[8px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-1.5 py-0.5 rounded-full font-black uppercase tracking-wide">
                      Brand Page
                    </div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <Sparkles size={13} className="text-amber-400 animate-pulse" />
                      <h5 className="text-[10px] font-black text-amber-300 uppercase tracking-widest font-sans">temperking.in (Only Glass Tech)</h5>
                    </div>
                    <div className="text-[9px] text-amber-400/60 mb-3 bg-amber-400/5 p-2 rounded-lg border border-amber-400/10 leading-relaxed">
                      டெம்பர் கிளாஸ் வகைகளை மட்டும் பில்டர் செய்து அரக்கோணம் வாடிக்கையாளர்களுக்கு மட்டும் பிரத்யேக விலையில் காட்டும் பிரத்தியேக பிராண்ட் லேண்டிங் தளம்.
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto border-t border-amber-450/10 pt-2">
                      {simulatedProducts.filter(p => p.category === 'MOBILE_GLASS').map((p) => (
                        <div key={p.id} className="bg-amber-400/[0.02] hover:bg-amber-400/[0.04] p-2.5 rounded-xl border border-amber-400/10 flex items-center justify-between text-xs transition duration-200">
                          <div className="pr-2">
                            <div className="font-bold text-amber-100 text-[11px] leading-tight">{p.name}</div>
                            <div className="text-[9px] text-amber-550/70 flex items-center gap-1 mt-0.5">
                              <MapPin size={10} />
                              <span>{getShopDisplayName(p.shop)}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-amber-400 font-extrabold text-[11px] block">₹{p.price}</span>
                            <button 
                              onClick={() => handleSimulateBooking(p)}
                              className="block bg-amber-400 text-black text-[9px] font-black px-2 py-0.5 mt-1 rounded uppercase hover:bg-amber-500 active:scale-95 transition-all cursor-pointer"
                            >
                              Simulate Book
                            </button>
                          </div>
                        </div>
                      ))}
                      {simulatedProducts.filter(p => p.category === 'MOBILE_GLASS').length === 0 && (
                        <div className="text-center py-6 text-xs text-gray-500">
                          (டெம்பர் கிளாஸ் தயாரிப்புகள் எதுவும் தயாராக இல்லை. முந்தைய படியில் புதிய டெம்பர் கிளாசைப் பதிவேற்றவும்!)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <p className="text-[10px] text-gray-400 italic">
                    💡 <b>வழிகாட்டி:</b> மேலே உள்ள தயாரிப்பில் உள்ள <b>"Simulate Book"</b> பட்டனை கிளிக் செய்து, பொருள் முன்பதிவிலும் அதன் சரியான இருப்பிடத்தையும் எவ்வாறு பார்க்க முடியும் என சோதியுங்கள்!
                  </p>
                </div>
              </div>
            )}

            {/* Step 3 Content: Real booking & GPS routing logic */}
            {activeStepTab === 'book' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
                  <h4 className="font-extrabold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <MapPin size={14} />
                    <span>ஸ்டெப் 3: வாடிக்கையாளர் எளிதான பிக்கப் & ஜி.பி.எஸ் (GPS Shop Pickup Navigation)</span>
                  </h4>
                  <span className="text-[10px] text-yellow-300 font-mono flex items-center gap-1">
                    👑 Golden Coupon Activated
                  </span>
                </div>

                {selectedBookingSimItem ? (
                  <div className="space-y-4">
                    <p className="text-xs text-gray-300 leading-relaxed">
                      வாடிக்கையாளர் <b>TrustSpares</b> ஆப் வழியாகப் புக் செய்தாலும் சரி, அல்லது <b>TemperKing</b> தளம் வழியாகப் புக் செய்தாலும் சரி, அவர்களுக்கு முன்பதிவு செய்தவுடன் அந்தப் பொருள் எந்தக் கிளையில் ஸ்டாக்கில் உள்ளது என்பதும், அதன் <b>நேரடி ஜி.பி.எஸ் வரைபட லிங்கும்</b> துல்லியமாகக் காட்டும்!
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Booking Ticket Card */}
                      <div className="bg-[#18120b] border-2 border-amber-450 rounded-3xl p-5 relative overflow-hidden shadow-xl">
                        {/* Cut corner details representing physical ticket */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#101115] rounded-full border border-amber-450/40 z-10"></div>
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#101115] rounded-full border border-amber-450/40 z-10"></div>
                        
                        <div className="text-center border-b border-white/10 pb-3 mb-3">
                          <span className="text-[9px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-black tracking-widest uppercase">BOOKING COUPON ACCEPTED</span>
                          <h5 className="font-black text-amber-100 text-xs mt-1.5 uppercase font-mono">{selectedBookingSimItem.name}</h5>
                        </div>

                        <div className="space-y-2.5 text-[11px] leading-relaxed">
                          <div className="flex justify-between">
                            <span className="text-gray-400">டிஜிட்டல் டோக்கன் எண் (Token ID):</span>
                            <span className="font-mono text-white font-bold">TS-TKT-{Math.floor(100000 + Math.random() * 900000)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">குறியீடு (Branch Location):</span>
                            <span className="text-amber-400 font-extrabold">{getShopAddressAndDetails(selectedBookingSimItem.shop).displayName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">கூப்பன் சலுகை:</span>
                            <span className="text-emerald-400 font-extrabold">1 வாங்கினால் 1 முற்றிலும் இலவசம்!</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">ஜிபிஎஸ் (GPS Coord):</span>
                            <span className="text-amber-300 font-mono text-[9px]">{getShopAddressAndDetails(selectedBookingSimItem.shop).gps}</span>
                          </div>
                          <div className="flex flex-col border-t border-dashed border-white/10 pt-2.5 mt-1">
                            <span className="text-gray-300 font-medium">பிக்கப் செய்ய வேண்டிய கடை முகவரி:</span>
                          </div>
                          <div className="text-[10px] text-gray-300 bg-white/[0.02] p-2 leading-normal rounded-lg border border-white/[0.04]">
                            {getShopAddressAndDetails(selectedBookingSimItem.shop).address}
                          </div>
                        </div>
                      </div>

                      {/* Map Location Mockup widget */}
                      <div className="border border-white/10 bg-[#08090a] p-5 rounded-3xl relative overflow-hidden flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-xs text-white font-bold">
                            <Map className="text-amber-400" size={14} />
                            <span>GPS மேப் நேவிகேஷன் சிமுலேட்டர்</span>
                          </div>
                          <p className="text-[10px] text-gray-400 leading-normal">
                            பயன்பாட்டாளர்கள் உங்களது கடையை எளிதில் சென்றடைய, வாட்ஸ்அப்பிலோ அல்லது ஆப்பிலோ நேரடி கூகுள் மேப்ஸ் லிங்க் பகிரப்படும்:
                          </p>
                        </div>

                        {/* Visual Mock-up Map Grid */}
                        <div className="w-full h-24 bg-[#14151a] border border-white/5 rounded-xl mt-2 mb-3 relative overflow-hidden flex items-center justify-center">
                          {/* Simulated grid lines */}
                          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:14px_14px]"></div>
                          {/* Simulated roads layout */}
                          <div className="absolute top-8 h-4 w-full bg-slate-800/40 transform -rotate-2"></div>
                          <div className="absolute left-1/2 w-4 h-full bg-slate-800/40 transform rotate-12"></div>
                          
                          {/* Live Dynamic Store Marker Pin */}
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                            <span className="bg-amber-405 text-black text-[7px] font-black tracking-wider px-1.5 py-0.5 rounded-full shadow-lg border border-white">STORE HERE</span>
                            <MapPin size={18} className="text-red-500 fill-red-500 animate-bounce mt-1" />
                          </div>

                          <span className="absolute bottom-1 right-2 text-[7px] text-gray-550 uppercase tracking-widest font-mono">Arakkonam City Region Map</span>
                        </div>

                        <button 
                          onClick={() => {
                            const details = getShopAddressAndDetails(selectedBookingSimItem.shop);
                            alert(`வாடிக்கையாளரை கடைக்கு அழைத்து செல்ல கூகுள் வரைபடம் (Google Maps) வெற்றிகரமாக திறக்கப்படுகிறது!\n\nகடை கிளை: ${details.displayName}\nGPS ஆயத்தொலைவுகள்: ${details.gps}\nமுகவரி: ${details.address}`);
                          }}
                          className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-2 rounded-xl text-[10px] text-center border border-white/10 transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Compass size={11} className="text-amber-400" />
                          <span>Google Maps-இல் வழியைக் காட்டு</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-3">
                    <HelpCircle size={32} className="text-amber-400 mx-auto opacity-60 animate-bounce" />
                    <p className="text-xs text-gray-400">
                      இதனை சோதிக்க, முதலில் <b>"ஸ்டெப் 2: ஆன்லைன் கிளவுட்"</b> தாவலிற்குச் சென்று, அங்கு ஏதேனும் ஒரு தயாரிப்பில் உள்ள <b>"Simulate Book"</b> பட்டனை கிளிக் செய்யவும்!
                    </p>
                    <button 
                      onClick={() => setActiveStepTab('sync')}
                      className="bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 font-extrabold border border-amber-400/20 px-4 py-2 rounded-full text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                    >
                      விநியோகப் பட்டியலுக்குச் செல்
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeStepTab === 'profile' && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex items-center justify-between border-b border-white/[0.05] pb-3">
                  <h4 className="font-extrabold text-xs text-amber-400 uppercase tracking-wider flex items-center gap-2 font-mono">
                    <Store size={14} />
                    <span>ஸ்டெப் 4: கடை ப்ரொஃபைல் & டொமைன் பிணைப்பு (Shop Profile & Custom Domain)</span>
                  </h4>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <ShieldCheck size={11} /> Cloud Configured
                  </span>
                </div>

                <div className="bg-amber-400/5 border border-amber-400/10 p-3.5 rounded-2xl text-[11px] text-gray-300 leading-relaxed space-y-1.5">
                  <span className="text-amber-400 font-black uppercase tracking-wider block">🗣️ உங்கள் குழப்பத்திற்கான தெளிவான விளக்கம்:</span>
                  <p>
                    <b>1. எப்படி இருதளங்களிலும் பொருள் காட்டும்?</b> Amazon அல்லது Flipkart போன்ற மல்டி-வெண்டார் தளங்களில், கடைகள் (Sellers) தங்களின் பெயரில் பொருட்களைப் பதிவேற்றுவர். அது <b>மைய டேட்டாபேஸான (TrustSpares Platform)</b>-இல் சேமிக்கப்படும்.
                  </p>
                  <p>
                    <b>2. டொமைன் பில்டரிங் (Custom Domain Mapping):</b> நீங்கள் <code>temperking.in</code> என்ற டொமைனை வாங்கி, அதை இந்த <b>"அரக்கோணம் ரயில்வே ஜங்ஷன்"</b> கிளையோடு பிணைத்துவிட்டால், ஒரு வாடிக்கையாளர் <code>temperking.in</code>-க்குள் வரும்போது, சிஸ்டம் தானாகவே <b>TrustSpares</b> மைய டேட்டாபேஸிலிருந்து <i>TemperKing கிளை மற்றும் டெம்பர் கிளாஸ் வகைகளை மட்டும் பில்டர் செய்து காட்டும்!</i>
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Manage shop coordinates and Create branches */}
                  <div className="space-y-4">
                    {/* 1. Shop Information Form - Edit Existing */}
                    <div className="space-y-3 bg-white/[0.02] border border-white/[0.05] p-4 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <span className="block text-[10px] uppercase font-black tracking-widest text-amber-400">1. கிளை ப்ரொஃபைல் எடிட்டர் (Modify Existing Store)</span>
                        <div className="bg-amber-400/10 text-amber-400 px-1.5 py-0.5 rounded text-[8px] font-mono">LIVE SYNC</div>
                      </div>

                      {/* Dropdown to select branch to edit */}
                      <div>
                        <label className="block text-[9px] uppercase font-black text-gray-400 mb-1">திருத்த வேண்டிய கிளை:</label>
                        <select
                          value={selectedEditShopId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedEditShopId(val);
                            // Populate inputs
                            const shop = availableShops.find(sh => sh.id === val);
                            if (shop) {
                              setProfileShopName(shop.displayName);
                              setProfileDomain(shop.domain);
                              setProfileGpsCoordinates(shop.gps);
                              setProfileAddress(shop.address);
                            }
                          }}
                          className="w-full bg-black/50 border border-white/10 rounded-xl px-2.5 py-2 text-xs text-amber-300 font-bold outline-none focus:border-amber-400"
                        >
                          {availableShops.map(sh => (
                            <option key={sh.id} value={sh.id}>{sh.displayName}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase font-black text-gray-405 mb-1">கடையின் பெயர் (Store Display Name):</label>
                        <input 
                          type="text" 
                          value={profileShopName}
                          onChange={(e) => {
                            setProfileShopName(e.target.value);
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-205 outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] uppercase font-black text-gray-405 mb-1">மேப் குறியீடு (GPS Coordinates):</label>
                          <input 
                            type="text" 
                            value={profileGpsCoordinates}
                            onChange={(e) => setProfileGpsCoordinates(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-205 outline-none focus:border-amber-400 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase font-black text-gray-405 mb-1">சொந்த டொமைன் / Brand URL:</label>
                          <input 
                            type="text" 
                            value={profileDomain}
                            onChange={(e) => setProfileDomain(e.target.value)}
                            placeholder="temperking.in"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-amber-410 outline-none focus:border-amber-400 font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase font-black text-gray-405 mb-1">முகவரி (Store Address):</label>
                        <textarea 
                          rows={2}
                          value={profileAddress}
                          onChange={(e) => setProfileAddress(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-205 outline-none shrink-0 focus:border-amber-400 leading-normal"
                        />
                      </div>

                      <button 
                        onClick={() => {
                          setIsSavingProfile(true);
                          setProfileSaveSuccess(false);
                          setTimeout(() => {
                            // Update availableShops list
                            setAvailableShops(prev => prev.map(sh => {
                              if (sh.id === selectedEditShopId) {
                                return {
                                  ...sh,
                                  displayName: profileShopName,
                                  domain: profileDomain,
                                  gps: profileGpsCoordinates,
                                  address: profileAddress
                                };
                              }
                              return sh;
                            }));
                            setIsSavingProfile(false);
                            setProfileSaveSuccess(true);
                            setTimeout(() => setProfileSaveSuccess(false), 3000);
                          }, 1000);
                        }}
                        className="w-full bg-amber-405 hover:bg-amber-500 text-black font-black text-[10px] py-2 rounded-xl transition uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isSavingProfile ? (
                          <>
                            <RefreshCw size={11} className="animate-spin" />
                            <span>சேமிக்கப்படுகிறது...</span>
                          </>
                        ) : profileSaveSuccess ? (
                          <>
                            <CheckCircle2 size={11} className="text-black" />
                            <span>விவரங்கள் சேமிக்கப்பட்டது! ✅</span>
                          </>
                        ) : (
                          <span>கிளை விவரங்களை சேமிக்க (Save changes)</span>
                        )}
                      </button>
                    </div>

                    {/* 2. Create Brand-New Shop Location Form */}
                    <div className="space-y-3 bg-emerald-500/[0.02] border border-emerald-500/20 p-4 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl transform translate-x-8 -translate-y-8"></div>
                      
                      <div className="flex items-center justify-between">
                        <span className="block text-[10px] uppercase font-black tracking-widest text-emerald-400 flex items-center gap-1.5">
                          <PlusCircle size={12} />
                          <span>2. புதிய கிளை கடை உருவாக்கம் (Add New Branch Store)</span>
                        </span>
                        <span className="text-[8px] bg-emerald-400/10 text-emerald-400 px-1 border border-emerald-400/25 rounded uppercase">Admin Exclusive</span>
                      </div>

                      <p className="text-[10px] text-gray-400 leading-normal">
                        இங்கு அட்மின் தனது கட்டுப்பாட்டில் உள்ள புதிய வண்டார் ஸ்டோர் அல்லது டெம்பர் கிங் பிராண்ட் கிளையை உடனுக்குடன் உருவாக்கலாம்:
                      </p>

                      <div>
                        <label className="block text-[9px] uppercase font-black text-emerald-405 mb-1">கிளை பெயர் (Branch Display Name):</label>
                        <input 
                          type="text" 
                          value={newShopName}
                          onChange={(e) => setNewShopName(e.target.value)}
                          placeholder="எ.கா: TemperKing (காந்தி நகர் கிளை)"
                          className="w-full bg-black/40 border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-emerald-100 outline-none focus:border-emerald-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] uppercase font-black text-emerald-405 mb-1">GPS மேப் குறியீடு:</label>
                          <input 
                            type="text" 
                            value={newShopGps}
                            onChange={(e) => setNewShopGps(e.target.value)}
                            placeholder="12.9270° N, 79.6650° E"
                            className="w-full bg-black/40 border border-emerald-500/20 rounded-xl px-3 py-2 text-[11px] text-emerald-100 outline-none focus:border-emerald-400 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[9px] uppercase font-black text-emerald-405 mb-1">சொந்த டொமைன் / Brand URL:</label>
                          <input 
                            type="text" 
                            value={newShopDomain}
                            onChange={(e) => setNewShopDomain(e.target.value)}
                            placeholder="temperking-west.in"
                            className="w-full bg-black/40 border border-emerald-500/20 rounded-xl px-3 py-2 text-[11px] text-emerald-100 outline-none focus:border-emerald-400 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9px] uppercase font-black text-emerald-405 mb-1">முழு முகவரி (Store Physical Address):</label>
                        <textarea 
                          rows={2}
                          value={newShopAddress}
                          onChange={(e) => setNewShopAddress(e.target.value)}
                          placeholder="எ.கா: பஸ் ஸ்டாண்ட் பின்புறம், மொபைல் அவென்யூ தெரு, அரக்கோணம்."
                          className="w-full bg-black/40 border border-emerald-500/20 rounded-xl px-3 py-2 text-xs text-emerald-100 outline-none focus:border-emerald-400 leading-normal"
                        />
                      </div>

                      <button 
                        onClick={handleCreateNewShop}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-black text-[10px] py-2 rounded-xl transition uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={11} className="text-black stroke-[3px]" />
                        <span>புதிய கிளை கடை சேர் (Publish New Branch)</span>
                      </button>
                    </div>
                  </div>

                  {/* Visual Domain Router Representation */}
                  <div className="bg-[#08090b] border border-white/10 p-4 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="block text-[10px] uppercase font-black tracking-widest text-gray-405 mb-2">லைவ் ரூட்டிங் சிமுலேட்டர் (Domain Router Preview)</span>
                      <p className="text-[10px] text-gray-500 leading-relaxed mb-3">
                        நீங்கள் மேலே அமைக்கும் டொமைன் எவ்வாறு மைய சர்வரை பிங் செய்கிறது என்பதை கீழே சோதிக்கவும்:
                      </p>

                      <div className="space-y-2.5">
                        {/* Domain A representation */}
                        <div className="bg-white/[0.02] border border-white/10 p-2.5 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="text-gray-400 font-mono text-[9px] block">IF USER ENTERS WEBSITE:</span>
                            <span className="text-amber-400 font-mono font-bold text-[11px]">https://{profileDomain}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] bg-amber-400/10 text-amber-400 px-2 py-0.5 rounded font-black border border-amber-400/20 uppercase tracking-widest block w-max ml-auto">FILTERS GLASS</span>
                            <span className="text-[8px] text-gray-500 italic mt-0.5 block">{profileShopName}</span>
                          </div>
                        </div>

                        {/* Portal representation */}
                        <div className="bg-white/[0.02] border border-white/10 p-2.5 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="text-gray-400 font-mono text-[9px] block">IF USER ENTERS PORTAL:</span>
                            <span className="text-blue-400 font-mono font-bold text-[11px]">https://trustspares.com</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] bg-blue-400/10 text-blue-400 px-2 py-0.5 rounded font-black border border-blue-400/20 uppercase tracking-widest block w-max ml-auto text-[8px]">SHOWS ALL SPARES</span>
                            <span className="text-[8px] text-gray-550 italic mt-0.5 block">Cross-Stores Network Wide</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 rounded-xl text-[10px] leading-relaxed flex items-start gap-2 mt-4">
                      <span className="font-extrabold text-xs">💡</span>
                      <span>இதன் மூலம் எதிர்காலத்தில் நீங்கள் <b>Arakkonam Auto Parts</b> அல்லது <b>Gandhi Road Repairs</b> என எத்தனை கிளைகள் ஆரம்பித்தாலும், அனைத்தையும் ஒரே இடத்தில் சிங்கிள் டேட்டாபேஸாக உலகத் தரத்தில் நிர்வகிக்கலாம்!</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Dynamic Architectural Block Infographics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 bg-white/[0.01] border border-white/[0.04] p-6 rounded-3xl relative overflow-hidden text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 bg-amber-400/15 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Database size={18} />
            </div>
            <h4 className="font-extrabold text-sm text-yellow-355">ஒருங்கிணைந்த கிளவுட் தளம்</h4>
            <p className="text-xs text-gray-400 leading-relaxed px-4">
              அனைத்து தயாரிப்புகளும், ஆர்டர்களும் ஒரே TrustSpares டேட்டாபேஸில் பதியப்படும். அதனால் மல்டி-ஸ்டோர் மேலாண்மை எளிதாகிறது!
            </p>
          </div>
          <div className="space-y-2 border-y md:border-y-0 md:border-x border-white/[0.06] py-6 md:py-0">
            <div className="w-10 h-10 bg-amber-400/15 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Store size={18} />
            </div>
            <h4 className="font-extrabold text-sm text-yellow-355">தனித்தனி பிராண்ட் பக்கங்கள்</h4>
            <p className="text-xs text-gray-400 leading-relaxed px-4">
              TemperKing போல எதிர்காலத்தில் பைக் ஸ்பேர்ஸ், டிவி ஸ்பேர்ஸ் என தனித்தனி கடைகளுக்கு வாடிக்கையாளர்கள் பார்க்கும் தனித்தனி லேண்டிங் பக்கங்கள் திறக்கலாம்!
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 bg-amber-400/15 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <MapPin size={18} />
            </div>
            <h4 className="font-extrabold text-sm text-yellow-355">மக்களுக்கு தெளிவான இருப்பிடம்</h4>
            <p className="text-xs text-gray-400 leading-relaxed px-4">
              தயாரிப்புகளை புக் செய்ததும், அந்தந்த ஊரின் இருப்பிடம் நேவிகேஷன் மூலம் கடைகளுக்கு வாடிக்கையாளர்களை எளிதாகக் கொண்டு செல்லும்!
            </p>
          </div>
        </div>
      </section>

      {/* MINIMALIST PREMIUM FOOTER */}
      <footer className="border-t border-white/[0.06] bg-[#0c0d10] mt-16 text-xs text-gray-500">
        <button 
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          className="w-full bg-white/[0.02] hover:bg-white/[0.04] transition py-3 text-center text-xs font-bold tracking-wider text-gray-400"
        >
          மீண்டும் மேலே செல்லவும் (Back to Top)
        </button>

        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-2">
            <h5 className="font-extrabold text-gray-300 text-xs tracking-widest uppercase">எங்களை பற்றி</h5>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              அரக்கோணத்தின் முதல் பிரத்யேக Buy 1 Get 1 Free (1 வாங்குனா 1 இலவசம்) மொபைல் டெம்பர் ஷோரூம். அமேசான் தரம் மற்றும் லேசர் பொருத்தம்.
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="font-extrabold text-gray-300 text-xs tracking-widest uppercase">தொடர்பு கொள்ள</h5>
            <p className="text-gray-400 leading-relaxed text-[11px] font-mono">
              உதவிக்கு: +91 {platformSettings?.supportPhone || '9876543210'}<br />
              இடம்: அரக்கோணம் ஜங்ஷன் அருகில், அரக்கோணம்.
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="font-extrabold text-gray-300 text-xs tracking-widest uppercase">சலுகைகள்</h5>
            <ul className="space-y-1.5 text-gray-400 text-[11px]">
              <li>Buy 1 Get 1 Free Lifetime Offer</li>
              <li>Free Hand Fitting Service</li>
              <li>Dual Reinforced Armor Glass</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h5 className="font-extrabold text-gray-300 text-xs tracking-widest uppercase">உதவிகள்</h5>
            <ul className="space-y-1.5 text-gray-400 text-[11px]">
              <li onClick={() => navigate('/')} className="hover:underline cursor-pointer">TrustSpares Account Login</li>
              <li className="hover:underline cursor-pointer">பாதுகாப்பு வழிகாட்டி</li>
            </ul>
          </div>
        </div>

        <div className="bg-[#07080a] py-6 px-6 text-center text-[10px] text-gray-600 border-t border-white/[0.03]">
          <p className="font-bold text-gray-400 mb-1.5">© 2026, temperking.in, Inc. அல்லது அதன் இணைப்பாளர்கள். அனைத்து ராயல் உரிமைகளும் பாதுகாக்கப்பட்டவை.</p>
          <p>அண்ட்ராய்டு & ஐபோன் மொபைல் டெம்பர்கள் அரக்கோணத்தில் சிறந்த முறையில் கடையிலேயே நேரடியாகப் பொருத்தப்படும்.</p>
        </div>
      </footer>

      {activeEcomOrder && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-250">
          <div className="bg-[#111216] border border-amber-400/30 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative my-auto animate-in zoom-in-95 duration-250 font-sans">
            {/* Ambient gold glow */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500"></div>
            
            {/* Success Graphic & Header */}
            <div className="p-6 text-center border-b border-white/[0.06] bg-gradient-to-b from-amber-400/[0.02] to-transparent">
              <div className="w-14 h-14 bg-amber-400/10 text-amber-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-400/20 shadow-lg shadow-amber-400/5">
                <CheckCircle2 size={28} className="stroke-[2.5px] animate-bounce" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wide">ஆர்டர் வெற்றிகரமாக முன்பதிவு செய்யப்பட்டது!</h3>
              <p className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest mt-1 font-mono">Order Successfully Booked</p>
              
              <div className="mt-4 inline-flex items-center gap-1.5 bg-white/[0.03] border border-white/10 rounded-full px-3.5 py-1 text-xs font-mono font-bold text-gray-300">
                <span>ORDER ID:</span>
                <span className="text-amber-400 font-black">{activeEcomOrder.id}</span>
              </div>
            </div>

            {/* Receipt Summary Details */}
            <div className="p-6 space-y-4 text-xs text-left">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">விற்பனைப் பொருட்கள் (Order Items):</p>
                <div className="bg-[#0c0d10] border border-white/[0.05] rounded-2xl p-3 space-y-2.5 max-h-36 overflow-y-auto">
                  {activeEcomOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-3 justify-between items-center text-[11px]">
                      <div className="flex items-center gap-2">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} className="w-7 h-7 rounded bg-white/5 object-cover border border-white/10" alt="" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[9px] text-gray-400 font-bold">TK</div>
                        )}
                        <div className="text-left">
                          <p className="font-bold text-white line-clamp-1">{item.name}</p>
                          <p className="text-[9px] text-gray-500">{item.englishName}</p>
                        </div>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <span className="text-gray-400 text-[10px]">Qty: {item.quantity} ×</span>
                        <span className="text-white font-bold ml-1">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total & Fulfillment info */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-white/[0.06] py-3.5">
                <div>
                  <span className="text-[9px] text-gray-500 uppercase block">மொத்த தொகை (Total Amount):</span>
                  <span className="text-xl font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/10 block w-max mt-0.5 font-mono">₹{activeEcomOrder.total}</span>
                </div>
                <div>
                  <span className="text-[9px] text-gray-500 uppercase block">விருப்பம் (Delivery Preference):</span>
                  <span className="text-xs font-black text-white flex items-center gap-1.5 mt-1">
                    {activeEcomOrder.fulfillmentType === 'courier' ? (
                      <>
                        <Truck size={13} className="text-blue-405" />
                        <span className="text-blue-400">குரியர் டெலிவரி</span>
                      </>
                    ) : (
                      <>
                        <Store size={13} className="text-amber-450" />
                        <span className="text-amber-405">கிளைக்கு வருதல்</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* LOYALTY POINTS EARNED */}
              {activeEcomOrder.bonusPointsEarned && (
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/25 p-3.5 rounded-2xl flex items-center justify-between gap-3 text-left">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black tracking-wider text-amber-400 bg-amber-400/20 px-2 py-0.5 rounded uppercase inline-block">
                      🎖️ LOYALTY BONUS (போனஸ் கணக்கு)
                    </span>
                    <p className="text-white font-black text-[11px] mt-1">தாங்கள் சேமித்த போனஸ் புள்ளிகள் சேர்ந்தது!</p>
                    <p className="text-gray-400 text-[9px] leading-tight">உங்களது லாயல்டி கணக்கில் +₹{activeEcomOrder.bonusPointsEarned} சேர்ந்துள்ளது. இதனை கடையில் காண்பித்து பொருட்கள் வாங்கிக்கொள்ளலாம்.</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-black text-amber-400 font-mono">+₹{activeEcomOrder.bonusPointsEarned}</span>
                  </div>
                </div>
              )}

              {/* Dynamic instruction notice */}
              {activeEcomOrder.fulfillmentType === 'pickup' ? (
                <div className="bg-amber-400/5 border border-amber-400/10 p-3.5 rounded-2xl space-y-1.5 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-amber-500 uppercase">வருகை கிளை & நேரம்:</span>
                    <span className="text-[9px] bg-amber-400/20 text-white px-2 py-0.5 rounded font-black">STUDIO TICKET</span>
                  </div>
                  <p className="font-black text-white text-[11px]">{activeEcomOrder.pickupShopName}</p>
                  <p className="text-gray-405 text-[10px]">⏱️ நேரம்: {activeEcomOrder.pickupTimeSlot}</p>
                  <div className="flex items-center justify-between bg-black/40 p-2 rounded-xl mt-1.5 border border-white/[0.05]">
                    <span className="text-gray-400 text-[10px]">பாதுகாப்பான <b>சரிபார்ப்பு OTP:</b></span>
                    <span className="text-lg font-mono font-black text-emerald-400 tracking-wider">{activeEcomOrder.pickupOtp}</span>
                  </div>
                  <p className="text-[9px] text-gray-500 leading-normal">
                    * கடைக்கு வரும்போது இந்த OTP-ஐக் கூறி உங்களது தயாரிப்பைப் பெற்றுக் கொள்ளவும். ஊழியர்கள் கடையிலேயே இலவசமாகப் பொருத்தித் தருவர்!
                  </p>
                </div>
              ) : (
                <div className="bg-blue-500/5 border border-blue-500/10 p-3.5 rounded-2xl space-y-1.5 text-left">
                  <span className="text-[9.5px] font-black text-blue-400 uppercase tracking-wider block">விநியோக முகவரி (Shipping Destination):</span>
                  <p className="text-gray-300 text-[11px] font-bold leading-normal">{activeEcomOrder.shippingAddress}</p>
                  <p className="text-gray-400 text-[10px]">📍 {activeEcomOrder.shippingCity} - PIN: {activeEcomOrder.shippingPincode}</p>
                  <div className="text-[9px] text-gray-500 pt-1 border-t border-white/[0.04]">
                    📦 ஆர்டர் தயார் செய்யப்பட்டு விரைவில் Courier Tracking ID உங்களுக்கு அனுப்பப்படும்!
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Actions */}
            <div className="p-6 bg-[#0c0d10] border-t border-white/[0.06] flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const adminPhone = platformSettings?.supportPhone 
                      ? platformSettings.supportPhone.replace('+91', '').replace(/\s/g, '') 
                      : '9876543210';
                  window.open(`https://wa.me/91${adminPhone}?text=${encodeURIComponent(activeEcomOrder.whatsappMessage)}`, '_blank');
                }}
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-black font-black text-xs py-3 rounded-2xl transition uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                <MessageSquare size={13} className="fill-black" />
                <span>உடன் வாட்ஸ்அப்பில் உறுதி செய் (Share WhatsApp)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveEcomOrder(null);
                    setCustomerOrdersTabActive(true);
                  }}
                  className="bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border border-white/10 transition cursor-pointer text-center"
                >
                  நமுது ஆர்டர்களைப் பார்
                </button>
                <button
                  type="button"
                  onClick={() => setActiveEcomOrder(null)}
                  className="bg-amber-400 hover:bg-amber-500 text-black py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition cursor-pointer text-center"
                >
                  மேலும் பொருட்கள் வாங்கு
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING GLASS BOTTOM NAVIGATION FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c0d10]/90 backdrop-blur-xl border-t border-white/[0.08] shadow-[0_-10px_30px_rgba(0,0,0,0.6)] px-4 py-2.5 pb-safe">
        <div className="max-w-md mx-auto flex items-center justify-between gap-1">
          {/* OPTION 1: SHOP CATALOG */}
          <button
            onClick={() => {
              setPrivateConsoleOpen(false);
              setCustomerOrdersTabActive(false);
              setCurrentView('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition duration-200 cursor-pointer ${
              !privateConsoleOpen && !customerOrdersTabActive && currentView === 'store'
                ? 'text-amber-400 font-extrabold scale-105'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Store size={18} className={!privateConsoleOpen && !customerOrdersTabActive && currentView === 'store' ? 'text-amber-400 scale-110' : 'text-gray-400'} />
            <span className="text-[10px] mt-1 tracking-wider font-extrabold uppercase">ஷாப் (Shop)</span>
          </button>

          {/* OPTION 2: MY ORDERS */}
          <button
            onClick={() => {
              setPrivateConsoleOpen(false);
              setCustomerOrdersTabActive(true);
              setCurrentView('store');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition duration-200 cursor-pointer relative ${
              !privateConsoleOpen && customerOrdersTabActive && currentView === 'store'
                ? 'text-amber-400 font-extrabold scale-105'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <ClipboardList size={18} className={!privateConsoleOpen && customerOrdersTabActive && currentView === 'store' ? 'text-amber-400 scale-110' : 'text-gray-400'} />
              {ordersList.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-650 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {ordersList.length}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-wider font-extrabold uppercase">ஆர்டர்கள் (Orders)</span>
          </button>

          {/* OPTION 3: LOYALTY BONUS QR */}
          <button
            onClick={() => setShowLoyaltyModal(true)}
            className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition duration-200 cursor-pointer text-gray-400 hover:text-white`}
          >
            <div className="relative flex items-center justify-center">
              <Gift size={18} className="text-amber-400 animate-pulse scale-110" />
              <span className="absolute -top-1.5 -right-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black text-[7px] font-black px-1 rounded-full uppercase scale-90 border border-black leading-tight">
                ₹{currentUser ? (currentUser.bonusPoints || 0) : (Number(localStorage.getItem('temperking_guest_bonus')) || 0)}
              </span>
            </div>
            <span className="text-[10px] mt-1 tracking-wider font-extrabold uppercase">போனஸ் (Bonus)</span>
          </button>

          {/* OPTION 4: PRIVATE CONSOLE / ADMIN */}
          {isTrustSparesStaff && (
            <button
              onClick={() => {
                const newConsoleState = !privateConsoleOpen;
                setPrivateConsoleOpen(newConsoleState);
                if (newConsoleState) {
                  setCurrentView('staff-login');
                } else {
                  setCurrentView('store');
                }
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition duration-200 cursor-pointer ${
                privateConsoleOpen
                  ? 'text-indigo-400 font-extrabold scale-105'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Settings size={18} className={privateConsoleOpen ? 'text-indigo-400 scale-110 animate-spin-slow' : 'text-gray-400'} />
              <span className="text-[10px] mt-1 tracking-wider font-extrabold uppercase">பலகை (Console)</span>
            </button>
          )}
        </div>
      </div>

      {/* LOYALTY CARD OVERLAY MODAL */}
      {showLoyaltyModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#121316] border border-amber-400/25 w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-white font-sans max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Gift className="text-white animate-bounce" size={18} />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">போனஸ் லாயல்டி கார்டு (Loyalty Card)</h3>
              </div>
              <button 
                onClick={() => setShowLoyaltyModal(false)} 
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white cursor-pointer transition flex items-center justify-center"
                title="மூடவும் (Close)"
              >
                <X size={18}/>
              </button>
            </div>
            
            <div className="p-6 text-center space-y-5 overflow-y-auto flex-1">
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center shadow-inner">
                <div className="bg-white p-3 rounded-xl m-1 flex items-center justify-center shadow-md">
                  <QRCode value={`TKLOYAL-${currentUser ? currentUser.id.toUpperCase() : 'GUEST'}`} size={130} />
                </div>
                <span className="text-[9px] font-bold text-gray-500 tracking-wider uppercase mt-3 block">டிஜிட்டல் லாயல்டி ஐடி (Loyalty ID)</span>
                <span className="text-xs font-black text-amber-400 font-mono tracking-widest mt-0.5 block">
                  {currentUser ? `TK-LOYAL-${currentUser.id.substring(0, 8).toUpperCase()}` : 'TK-LOYAL-GUEST'}
                </span>
              </div>

              <div className="flex justify-between items-center bg-amber-400/10 border border-amber-400/20 p-4 rounded-2xl">
                <div className="text-left">
                  <span className="text-[9px] text-amber-400 font-black uppercase tracking-wider block">சேமித்த போனஸ் மதிப்பு (Balance)</span>
                  <p className="text-2xl font-black text-amber-300 font-mono">₹{currentUser ? (currentUser.bonusPoints || 0) : (Number(localStorage.getItem('temperking_guest_bonus')) || 0)}</p>
                </div>
                <div className="bg-amber-405 text-amber-400 bg-amber-450/20 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border border-amber-400/20 shadow-sm">
                  ACTIVE
                </div>
              </div>

              <div className="bg-white/[0.02] p-4 rounded-2xl text-[10px] text-gray-400 leading-relaxed text-left border border-white/[0.04] space-y-2">
                <p className="text-white font-extrabold text-xs">💡 போனஸ் பயன்படுத்துவது எப்படி (Redeem Guide):</p>
                <p>தாங்கள் ஆன்லைனில் செய்யும் ஒவ்வொரு ஆர்டருக்கும் <strong className="text-amber-400">₹5 முதல் ₹10 வரை</strong> போனஸ் புள்ளிகள் உங்களது லாயல்டி கணக்கில் சேரும்!</p>
                <p>எங்களது நேரடி கடைக்கு வந்து பொருட்களை வாங்கும்போது இந்த QR குறியீட்டை ஊழியரிடம் காண்பித்தால், உங்கள் போனஸ் பணத்தை கழிவு செய்து கொள்ளலாம்!</p>
              </div>
            </div>

            <div className="p-4 bg-black/20 border-t border-white/[0.04] shrink-0">
              <button 
                onClick={() => setShowLoyaltyModal(false)} 
                className="w-full bg-amber-400 hover:bg-amber-500 text-black font-black py-3 rounded-xl text-xs uppercase tracking-widest transition cursor-pointer active:scale-95 shadow-md shadow-amber-400/10 text-center block"
              >
                சரி (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHOP SHARE / OPEN APP QR CODE MODAL */}
      {showShareQrModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#121316] border border-amber-400/25 w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-white font-sans text-left max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <QrCode className="text-white animate-pulse" size={18} />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-white font-sans">மொபைலில் திறக்க / பகிரவும்</h3>
              </div>
              <button 
                onClick={() => setShowShareQrModal(false)} 
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white cursor-pointer transition flex items-center justify-center"
                title="மூடவும் (Close)"
              >
                <X size={18}/>
              </button>
            </div>
            
            <div className="p-6 space-y-5 text-center overflow-y-auto flex-1">
              <div className="bg-black/40 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center shadow-inner">
                <p className="text-[10px] text-amber-400 font-extrabold tracking-widest uppercase mb-4 font-mono">SCAN THIS QR TO OPEN TEMPERKING</p>
                <div className="bg-white p-4 rounded-xl flex items-center justify-center shadow-md">
                  <QRCode value="https://trustspares.in/#/temper-king" size={160} />
                </div>
                <span className="text-[9px] font-bold text-gray-500 tracking-wider uppercase mt-4 block">அரக்கோணம் ஆன்லைன் ஸ்டோர் லிங்க்</span>
                <span className="text-[11px] font-black text-amber-400 font-mono tracking-tight mt-1.5 block max-w-full truncate px-2 select-all">
                  https://trustspares.in/#/temper-king
                </span>
              </div>

              {/* Share Actions Grid */}
              <div className="space-y-2 text-left">
                <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">மொபைல் ஷேர் ஆப்ஷன்கள் (Share Options):</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(
                        `🔥 *டெம்பர் கிங் (Buy 1 Get 1 Free)* 🔥\n\nஅரக்கோணத்தின் மிகச்சிறந்த மொபைல் டெம்பர் கிளாஸ் ஆன்லைன் ஸ்டோர்! இப்போதே உங்களது போனுக்கு ஆர்டர் செய்ய இங்கே கிளிக் செய்யுங்க: \n\n🔗 https://trustspares.in/#/temper-king`
                      );
                      window.open(`https://wa.me/?text=${text}`, '_blank');
                    }}
                    className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition cursor-pointer text-center border border-emerald-500/20 shadow-lg shadow-emerald-650/5"
                  >
                    <MessageSquare size={13} className="fill-white text-emerald-600" />
                    WhatsApp
                  </button>
                  <button
                    onClick={async () => {
                      const shareData = {
                        title: 'TemperKing (டெம்பர் கிங்)',
                        text: 'அரக்கோணத்தின் தரம் வாய்ந்த, 1 வாங்குனா 1 இலவசம் மொபைல் டெம்பர் ஆன்லைன் ஷாப்! இப்போதே ஆர்டர் செய்யுங்கள்.',
                        url: 'https://trustspares.in/#/temper-king',
                      };
                      if (navigator.share) {
                        try {
                          await navigator.share(shareData);
                        } catch (err) {
                          console.log('Error sharing:', err);
                        }
                      } else {
                        navigator.clipboard.writeText(shareData.url);
                        alert("லிங்க் காப்பி செய்யப்பட்டது! 🔗");
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 active:scale-95 text-white py-2.5 border border-white/10 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition cursor-pointer text-center"
                  >
                    <Share2 size={13} className="text-amber-400" />
                    இதர பகிர்தல்
                  </button>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText("https://trustspares.in/#/temper-king");
                    alert("ஸ்டோர் லிங்க் வெற்றிகரமாக காப்பி செய்யப்பட்டது! 🔗");
                  }}
                  className="w-full flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-500 active:scale-95 text-black py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition cursor-pointer text-center shadow-lg shadow-amber-400/5 mt-1"
                >
                  <Copy size={13} />
                  லிங்க் காப்பி (Copy Link)
                </button>
              </div>

              <div className="bg-white/[0.02] p-4 rounded-2xl text-[10px] text-gray-400 leading-relaxed text-left border border-white/[0.04] space-y-2">
                <p className="text-white font-extrabold text-xs">💡 மொபைலில் ஸ்கேன் செய்வது எப்படி (How to scan):</p>
                <p>1. உங்களது போனில் உள்ள <strong className="text-white">Camera App</strong> அல்லது <strong className="text-white">Google Lens</strong>-ஐத் திறக்கவும்.</p>
                <p>2. திரையில் தெரியும் இந்த QR குறியீட்டை நோக்கி ஸ்கேன் செய்யவும்.</p>
                <p>3. தோன்றும் லிங்கை பிரஸ் செய்ய, ஆன்லைன் ஸ்டோர் உங்களது மொபைலில் நேரடியாகத் திறக்கும்!</p>
              </div>
            </div>

            <div className="p-4 bg-black/20 border-t border-white/[0.04] shrink-0">
              <button 
                onClick={() => setShowShareQrModal(false)} 
                className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/15 hover:border-white/20 font-black py-3 rounded-xl text-xs uppercase tracking-widest transition cursor-pointer active:scale-95 text-center block font-sans"
              >
                சரி (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1+1 BUY 1 GET 1 FREE (BOGO) CLAIM MODAL */}
      {showBogoClaimModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#121316] border border-amber-400/25 w-full max-w-sm rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-white font-sans max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-5 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Gift className="text-white animate-bounce" size={18} />
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">🎁 1+1 இலவச கூப்பனை பெற்றிடுக (BOGO Pass)</h3>
              </div>
              <button 
                onClick={() => {
                  setShowBogoClaimModal(false);
                  setBogoError(null);
                }} 
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white cursor-pointer transition flex items-center justify-center"
                title="மூடவும் (Close)"
              >
                <X size={18}/>
              </button>
            </div>

            {/* Scrollable Contents */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              
              {currentUser ? (
                /* RENDER COUPON TO LOGGED-IN USERS */
                <div className="space-y-4 text-center">
                  <div className="bg-gradient-to-b from-amber-400/10 via-[#18191d] to-[#121316] p-5 rounded-2xl border border-amber-400/30 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 blur-xl rounded-full"></div>
                    
                    <span className="text-[10px] bg-amber-400 text-black font-black px-2.5 py-1 rounded-full uppercase tracking-widest mb-3 animate-pulse">
                      BOGO PASS ACTIVE 👑
                    </span>
                    
                    <div className="bg-white p-3 rounded-xl flex items-center justify-center shadow-md mb-2">
                      <QRCode value={`TK-BOGO-${currentUser.id.substring(0, 6).toUpperCase()}`} size={130} />
                    </div>
                    
                    <p className="text-[9px] text-gray-450 font-mono tracking-widest uppercase mt-2">கூப்பன் குறியீடு (COUPON CODE)</p>
                    <p className="text-lg font-black text-amber-400 font-mono tracking-wider select-all">
                      TK-BOGO-{currentUser.id.substring(0, 6).toUpperCase()}
                    </p>
                  </div>

                  {/* Certified Details Box */}
                  <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-2xl text-left space-y-2 text-xs">
                    <p className="text-amber-400 font-extrabold text-[10px] uppercase tracking-wider border-b border-white/[0.06] pb-1.5 font-sans">பாஸினுடைய விபரம் (Pass Details):</p>
                    <div className="flex justify-between items-center text-gray-300">
                      <span>👤 பயனர் பெயர் (Name):</span>
                      <strong className="text-white font-bold">{currentUser.name}</strong>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                      <span>📲 மொபைல் எண் (Phone):</span>
                      <strong className="text-white font-mono font-bold">{currentUser.mobile || '-'}</strong>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                      <span>📱 மாதிரி (Phone Model):</span>
                      <strong className="text-amber-300 font-bold">{currentUser.deviceModel || 'General Mobile'}</strong>
                    </div>
                  </div>

                  {/* Guarantee Instruction */}
                  <div className="bg-emerald-500/10 border border-emerald-500/25 p-3.5 rounded-xl text-left text-xs leading-relaxed text-emerald-300">
                    <div className="font-extrabold flex items-center gap-1 mb-1 text-emerald-450 uppercase text-[9.5px]">
                      <CheckCircle2 size={12} />
                      கடையில் எளிதாகக் கிளைம் செய்க!
                    </div>
                    இந்த கூப்பன் குறியீட்டை நேரடியாக அரக்கோணம் 'டெம்பர் கிங் (temperking.in)' கடையில் காட்டி, உங்கள் மொபைலுக்கு 1 டெம்பர் வாங்கினால் மற்றொன்றை முற்றிலும் இலவசமாகப் பெற்றுக்கொள்ளலாம்!
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <button
                      onClick={() => {
                        const bogoCode = `TK-BOGO-${currentUser.id.substring(0, 6).toUpperCase()}`;
                        const model = currentUser.deviceModel || 'மொபைல்';
                        const text = encodeURIComponent(
                          `🔥 *டெம்பர் கிங் (Buy 1 Get 1 Free Pass)* 🔥\n\nமொபைல் மாடல்: *${model}*\nஎனக்கான 1 வாங்குனா 1 இலவச மொபைல் டெம்பர் பாஸ் கன்பார்ம் ஆகிவிட்டது! 👑\n\nகூப்பன் கோடு: *${bogoCode}*\n\nநீங்களும் உங்களது போனுக்கு 1+1 ஃப்ரீ ஆஃபர் கூப்பன் பெற: \n🔗 https://trustspares.in/#/temper-king`
                        );
                        window.open(`https://wa.me/?text=${text}`, '_blank');
                      }}
                      className="flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer active:scale-95"
                    >
                      <Share2 size={12} />
                      பகிர்க (Share)
                    </button>
                    <button
                      onClick={() => {
                        const bogoCode = `TK-BOGO-${currentUser.id.substring(0, 6).toUpperCase()}`;
                        navigator.clipboard.writeText(bogoCode);
                        alert(`வெற்றி! கூப்பன் கோடு "${bogoCode}" காப்பி செய்யப்பட்டது. 🔗`);
                      }}
                      className="flex items-center justify-center gap-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer active:scale-95"
                    >
                      <Copy size={11} />
                      குறியீடு காப்பி
                    </button>
                  </div>
                </div>
              ) : (
                /* RENDER LOGIN / REGISTER FORMS */
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <span className="text-[9px] bg-amber-400/10 text-amber-400 font-black px-2.5 py-0.5 rounded border border-amber-400/20 uppercase tracking-wider">
                      அறிமுக சலுகை (BOGO OFFER)
                    </span>
                    <h4 className="text-xs font-black text-gray-400">
                      {bogoAuthMode === 'register' 
                        ? '1 வாங்குனா 1 இலவசம் சலுகைக்கான புதிய கணக்கு!' 
                        : 'உள்நுழைந்து உங்களது கூப்பனை பெற்றிடுங்கள்!'}
                    </h4>
                  </div>

                  {/* Mode Selector */}
                  <div className="flex bg-black p-1 rounded-xl border border-white/[0.06]">
                    <button
                      onClick={() => {
                        setBogoAuthMode('register');
                        setBogoError(null);
                      }}
                      className={`flex-1 py-1.5 text-[9.5px] font-black uppercase rounded-lg transition-all ${
                        bogoAuthMode === 'register' ? 'bg-amber-400 text-black shadow' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      பதிவு செய்க (Sign Up)
                    </button>
                    <button
                      onClick={() => {
                        setBogoAuthMode('login');
                        setBogoError(null);
                      }}
                      className={`flex-1 py-1.5 text-[9.5px] font-black uppercase rounded-lg transition-all ${
                        bogoAuthMode === 'login' ? 'bg-amber-400 text-black shadow' : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      லாக்-இன் (Login)
                    </button>
                  </div>

                  {bogoError && (
                    <div className="bg-red-500/10 border border-red-500/25 p-2.5 rounded-xl text-center text-[10px] font-bold text-red-400 leading-normal">
                      ⚠️ {bogoError}
                    </div>
                  )}

                  {/* FORM INTERFACES */}
                  <div className="space-y-3.5 text-left">
                    {bogoAuthMode === 'register' && (
                      <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-1">உங்களது பெயர் (Full Name):</label>
                        <div className="relative">
                          <User size={13} className="absolute left-3 top-3.5 text-gray-500" />
                          <input
                            type="text"
                            placeholder="உதாரணம்: குமார் எம்"
                            value={bogoName}
                            onChange={(e) => setBogoName(e.target.value)}
                            className="w-full bg-black/45 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-xs font-semibold focus:outline-none focus:border-amber-400 placeholder:text-gray-650"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-1">மொபைல் எண் (10-Digit Phone):</label>
                      <div className="relative">
                        <Smartphone size={13} className="absolute left-3 top-3.5 text-gray-500" />
                        <input
                          type="tel"
                          maxLength={10}
                          placeholder="உதாரணம்: 9876543210"
                          value={bogoPhone}
                          onChange={(e) => setBogoPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-black/45 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white font-mono text-xs font-semibold focus:outline-none focus:border-amber-400 placeholder:text-gray-650"
                        />
                      </div>
                    </div>

                    {bogoAuthMode === 'register' && (
                      <div>
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-450 block mb-1">மொபைல் மாதிரி/மாடல் (Phone Model):</label>
                        <div className="relative">
                          <Smartphone size={13} className="absolute left-3 top-3.5 text-amber-400/80" />
                          <input
                            type="text"
                            placeholder="உதாரணம்: narzo 20 pro / Vivo v15"
                            value={bogoDeviceModel}
                            onChange={(e) => setBogoDeviceModel(e.target.value)}
                            className="w-full bg-black/45 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-xs font-semibold focus:outline-none focus:border-amber-400 placeholder:text-gray-650"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[10px] uppercase font-black tracking-widest text-gray-400 block mb-1">கடவுச்சொல் (Password):</label>
                      <div className="relative">
                        <ShieldCheck size={13} className="absolute left-3 top-3.5 text-gray-500" />
                        <input
                          type="password"
                          placeholder="குறைந்தது 6 எழுத்துக்கள்"
                          value={bogoPassword}
                          onChange={(e) => setBogoPassword(e.target.value)}
                          className="w-full bg-black/45 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-white text-xs font-semibold focus:outline-none focus:border-amber-400 placeholder:text-gray-650"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={bogoLoading}
                    onClick={async () => {
                      setBogoError(null);
                      const cleanPhone = bogoPhone.trim();
                      const cleanPwd = bogoPassword.trim();
                      
                      if (!cleanPhone || !/^\d{10}$/.test(cleanPhone)) {
                        setBogoError("தயவுசெய்து 10-இலக்க சரியான மொபைல் எண்ணை உள்ளிடவும்!");
                        return;
                      }
                      if (cleanPwd.length < 6) {
                        setBogoError("கடவுச்சொல் குறைந்தபட்சம் 6 எழுத்துகள் கொண்டிருக்க வேண்டும்!");
                        return;
                      }
                      if (bogoAuthMode === 'register') {
                        if (!bogoName.trim()) {
                          setBogoError("தயவுசெய்து உங்களது பெயரை உள்ளிடவும்!");
                          return;
                        }
                        if (!bogoDeviceModel.trim()) {
                          setBogoError("தயவுசெய்து உங்களது மொபைல் மாதிரியை உள்ளிடவும்!");
                          return;
                        }
                      }

                      setBogoLoading(true);
                      try {
                        if (bogoAuthMode === 'register') {
                          await signupWithEmail(cleanPhone, cleanPwd, bogoName.trim(), 'MOBILE' as any, bogoDeviceModel.trim());
                        } else {
                          await loginWithEmail(cleanPhone, cleanPwd);
                        }
                      } catch (error: any) {
                        console.error("BOGO Claim Auth Error: ", error);
                        let msg = error.code === 'auth/email-already-in-use' || error.message?.includes('already')
                           ? "இந்த மொபைல் எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது!" 
                           : error.message?.includes('password')
                           ? "கடவுச்சொல் தவறானது அல்லது மிகக் குட்டையாக உள்ளது!"
                           : "திடீர் பிழை: " + (error.message || "Unable to complete registration.");
                        setBogoError(msg);
                      } finally {
                        setBogoLoading(false);
                      }
                    }}
                    className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition shadow-lg flex items-center justify-center gap-1 cursor-pointer ${
                      bogoLoading 
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-amber-450 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-black active:scale-95 shadow-amber-400/15'
                    }`}
                  >
                    <span>
                      {bogoLoading 
                        ? 'சரிபார்க்கிறது...' 
                        : bogoAuthMode === 'register' 
                        ? 'அக்கவுண்ட் உருவாக்கி கூப்பனைப் பெறுக ➔' 
                        : 'லாக்-இன் செய்து கூப்பனைப் பெறுக ➔'}
                    </span>
                  </button>
                </div>
              )}

            </div>
            
            {/* Footer */}
            <div className="p-4 bg-black/20 border-t border-white/[0.04] shrink-0 text-center">
              <p className="text-[9px] text-gray-500 font-medium font-sans">
                * இந்த சலுகை அரக்கோணம் கிளைக்கு மட்டுமே செல்லுபடியாகும். பாதுகாப்பு குறியீடு கட்டாயம்.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* DETAILED PRODUCT SINGLE PAGE / POPUP MODAL */}
      {selectedDetailProduct && (() => {
        const product = selectedDetailProduct;
        const listPrice = product.originalPrice || (product.price * 2);
        const discountPct = Math.round(((listPrice - product.price) / listPrice) * 100);
        return (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-[#121316] border border-amber-400/20 w-full max-w-lg rounded-[28px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-white font-sans max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border-b border-white/[0.08] p-4.5 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-amber-400 text-black font-black px-1.5 py-0.5 rounded uppercase">PREMIUM GLASS</span>
                  <p className="text-[10px] text-gray-400 font-mono">ID: {product.id}</p>
                </div>
                <button 
                  onClick={() => setSelectedDetailProduct(null)} 
                  className="p-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-white/85 hover:text-white cursor-pointer transition flex items-center justify-center"
                >
                  <X size={18}/>
                </button>
              </div>

              {/* Scrollable contents */}
              <div className="p-6 overflow-y-auto space-y-5 flex-1">
                {/* Image and overlay banner */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/50 border border-white/[0.06] shadow-md flex items-center justify-center">
                  <img 
                    alt={product.englishName} 
                    src={product.imageUrl} 
                    className="w-full h-full object-cover opacity-90"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-red-650 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-md shadow">
                    1+1 FREE OFFER (ஒன்று வாங்கினால் ஒன்று இலவசம்)
                  </div>
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur border border-white/10 px-2.5 py-0.5 rounded-lg text-[9px] font-extrabold text-amber-400">
                    {product.badge}
                  </div>
                </div>

                {/* Names */}
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white leading-tight">{product.name}</h3>
                  <p className="text-xs text-amber-400/90 font-mono uppercase tracking-wider">{product.englishName}</p>
                </div>

                {/* Stars and Rating badge */}
                <div className="flex flex-wrap items-center gap-4 bg-white/[0.02] border border-white/[0.05] p-3 rounded-2xl">
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400">
                      {Array.from({length: 5}).map((_, i) => (
                        <Star key={i} size={13} className={`${i < Math.floor(product.rating) ? 'fill-amber-400 stroke-amber-400' : 'text-gray-700'}`} />
                      ))}
                    </div>
                    <span className="text-xs font-black text-white">{product.rating} / 5.0</span>
                  </div>
                  <div className="text-gray-400 text-xs text-[11px]">
                    🔥 <strong className="text-amber-400 font-mono">{Math.round(product.rating * 163)}+</strong> பேர் வெற்றிகரமாக வாங்கியுள்ளனர்!
                  </div>
                </div>

                {/* Pricing section with genuine list price */}
                <div className="bg-amber-405/5 bg-amber-400/5 border border-amber-400/10 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block font-sans">சிறப்பு ஆஃபர் விலை (Deal Price)</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black text-amber-300 font-mono">₹{product.price}</span>
                      <span className="text-rose-500 font-extrabold text-sm font-sans">-{discountPct}% தள்ளுபடி</span>
                    </div>
                    <p className="text-[10px] text-gray-500 line-through mt-0.5 font-mono">M.R.P: ₹{listPrice}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-emerald-400 font-black tracking-wider uppercase bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 block text-center mb-1">
                      FREE COUPLING
                    </span>
                    <p className="text-[9px] text-gray-405">இலவசப் பொருத்தம்!</p>
                  </div>
                </div>

                {/* Protection Score Index bar */}
                <div className="space-y-2 bg-[#17181c] border border-white/[0.04] p-4.5 rounded-2xl">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-gray-300 flex items-center gap-1.5">
                      <ShieldCheck size={14} className="text-amber-400" />
                      பாதுகாப்பு குறியீடு (Armor Level)
                    </span>
                    <span className="text-amber-400 font-black font-mono">{product.protectionScore}% Ultra Protection</span>
                  </div>
                  <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full animate-pulse" style={{ width: `${product.protectionScore}%` }}></div>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-normal">
                    மிக கடுமையான அதிர்வுகள், கீறல்கள் மற்றும் நேரடி விழுதல் தாக்கங்களை முற்றிலுமாக உறிஞ்சி உங்கள் மொபைல் திரையைக் காக்கும்.
                  </p>
                </div>

                {/* Highlights and Specifications list */}
                <div className="space-y-2.5">
                  <h4 className="font-black text-xs text-white uppercase tracking-wider">முக்கிய சிறப்பம்சங்கள் (Product Highlights):</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {(product.features && product.features.length > 0 ? product.features : ['9H Hardness', 'Anti-Fingerprint Coating', 'Laser-Cut Rounded Edges', 'Bubble-Free Shield']).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white/[0.02] border border-white/[0.04] p-2.5 rounded-xl">
                        <CheckCircle2 size={12} className="text-amber-400 shrink-0" />
                        <span className="text-gray-300 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In Depth Description description */}
                <div className="space-y-1.5 pt-1">
                  <h4 className="font-black text-xs text-white uppercase tracking-wider">விளக்கம் (In depth Details):</h4>
                  <p className="text-xs text-gray-400 leading-relaxed bg-white/[0.01] p-3.5 rounded-2xl border border-white/[0.03]">
                    {product.description} தாங்கள் ஆன்லைனில் இந்த தயாரிப்பை முன்பதிவு செய்து கடைக்கு கொண்டு வரும்போது, எங்களது அனுபவம் வாய்ந்த ஊழியர்கள் எவ்வித கூடுதல் கட்டணமும் இன்றி காற்று குமிழ்கள் (bubbles) இல்லாமல் மிக கச்சிதமாக பொருத்தி தருவார்கள். மேலும் இந்த தயாரிப்பிற்கு 1+1 இலவச ஆஃபர் பொருந்தும் என்பதால் உங்களுக்கு இன்னுமொரு கூடுதல் கிளாஸ் முற்றிலும் இலவசமாக வழங்கப்படும்!
                  </p>
                </div>
              </div>

              {/* Sticky bottom absolute action bar */}
              <div className="p-4 bg-black/40 border-t border-white/[0.08] grid grid-cols-2 gap-3 shrink-0">
                <button 
                  onClick={() => {
                    addToCart(product);
                    alert(`"${product.name}" கார்ட்டில் சேர்க்கப்பட்டது! 🛒`);
                  }} 
                  className="bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition cursor-pointer text-center block"
                >
                  கார்ட் சேர் (Add to Cart)
                </button>
                <button 
                  onClick={() => {
                    addToCart(product);
                    setSelectedDetailProduct(null);
                    setCartOpen(true);
                  }} 
                  className="bg-amber-400 hover:bg-amber-500 active:scale-95 text-black font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition cursor-pointer text-center block shadow-lg shadow-amber-400/10"
                >
                  உடனே வாங்கு (Buy Now)
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default TemperKing;
