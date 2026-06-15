
export enum UserRole {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN'
}

export type AppLanguage = 'TAMIL' | 'HINDI' | 'ENGLISH' | 'MALAYALAM' | 'KANNADA' | 'TELUGU';

export type IndustryType = 'MOBILE' | 'TV_ELECTRONICS' | 'AUTOMOBILE' | 'COMPUTER_LAPTOP' | 'HOME_APPLIANCE';

export enum DealStatus {
  DRAFT = 'DRAFT', // NEW: For auto-generated items waiting for price/photo
  AVAILABLE = 'AVAILABLE',
  REQUESTED = 'REQUESTED',
  ACCEPTED = 'ACCEPTED',
  CREATED = 'CREATED',
  PAYMENT_PENDING = 'PAYMENT_PENDING', 
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  DISPUTED = 'DISPUTED',
  CANCELLED = 'CANCELLED',
  APPOINTMENT_BOOKED = 'APPOINTMENT_BOOKED',
  REPAIR_IN_PROGRESS = 'REPAIR_IN_PROGRESS'
}

export enum MovementType {
  PURCHASE = 'PURCHASE', // Stock IN
  SALE = 'SALE',         // Stock OUT
  RETURN_IN = 'RETURN_IN',   // Customer Return (Stock UP)
  RETURN_OUT = 'RETURN_OUT'  // Supplier Return (Stock DOWN)
}

export interface InventoryLog {
  id: string;
  dealId: string;
  productName: string;
  partyName: string; // Shop name or Person name
  type: MovementType;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  paidAmount: number;    // NEW: Amount paid at time of entry
  balanceAmount: number; // NEW: Remaining balance (Udhaar)
  date: string;
  note?: string;
}

export enum DeliveryType {
  COURIER = 'COURIER',
  SHOP_VISIT = 'SHOP_VISIT',
  REPAIR_COURIER = 'REPAIR_COURIER' // NEW: User sends device to shop
}

export enum ServiceType {
  PURCHASE = 'PURCHASE',
  EXCHANGE = 'EXCHANGE',
  REPAIR = 'REPAIR'
}

export interface BankDetails {
  accountName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
}

export interface PlatformSettings {
    adminUpiId: string;
    adminAccountName: string;
    adminAccountNumber: string;
    adminIfsc: string;
    adminBankName: string;
    supportPhone?: string;
    supportEmail?: string;
    supportAddress?: string;
    grievanceOfficer?: string;
    geminiApiKey?: string; // NEW: Dynamic API Key for Studio AI
}

export interface ProductReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  isVerified: boolean;
}

export interface User {
  id: string;
  name: string;
  email?: string; 
  role: UserRole;
  isAdmin?: boolean; 
  industry?: IndustryType; 
  avatar: string;
  walletBalance: number; 
  escrowBalance: number; 
  trustScore: number;
  totalDeals?: number;
  language?: AppLanguage; 
  theme?: 'LIGHT' | 'DARK'; 
  notificationsEnabled?: boolean; 
  fcmToken?: string;
  
  createdAt?: string; 
  lastLogin?: string; 
  approvedAt?: string; 

  kycVerified: boolean; 
  kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'NOT_SUBMITTED';
  rejectionReason?: string; 
  mobile?: string; 
  deviceModel?: string; // NEW: Stores user's mobile model (e.g. Samsung A50)
  address?: string;
  latitude?: number; // NEW: GPS Lat
  longitude?: number; // NEW: GPS Lng
  googleMapsLink?: string; // NEW: Dedicated Google Maps Link provided by Admin/Seller
  shopName?: string;
  upiId?: string;
  udyamNumber?: string;
  
  aadhaarFront?: string;
  aadhaarBack?: string;
  panCard?: string;
  shopImage?: string;
  udyamCertificate?: string;

  bankDetails?: BankDetails;
  isProMember?: boolean; 
  bonusPoints?: number; // Loyalty bonus points balance
}

export interface BulkPriceTier {
    minQty: number;
    pricePerUnit: number;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  amount: number; 
  dealerPrice?: number; 
  fixingCharge?: number; 
  
  stockQuantity: number; 
  soldQuantity?: number; 
  
  bulkPrices?: BulkPriceTier[]; 

  category: string; 
  quality?: 'ORIGINAL' | 'OLED' | 'COPY' | 'REFURB'; // Added Quality Field

  industry?: IndustryType; 
  
  brand?: string;
  model?: string;

  sellerId: string;
  buyerId?: string; 
  status: DealStatus;
  deliveryType?: DeliveryType;
  serviceType?: ServiceType; 
  visitToken?: string;
  visitOtp?: string;
  completedAt?: string; 
  createdAt: string;
  listingImage?: string; 
  listingImages?: string[]; 
  trackingNumber?: string; // Outbound (Seller -> Buyer)
  customerTrackingNumber?: string; // NEW: Inbound (Buyer -> Seller for Repair)
  shippingReceipt?: string; 
  packagingEvidence?: string; 
  unboxingEvidence?: string;  
  evidenceImages: string[]; 
  disputeReason?: string;
  aiAnalysis?: string;
  tags?: string[];
  
  rating?: number; 
  review?: string; 
  productReviews?: ProductReview[]; 
  
  isMobile?: boolean;
  batteryHealth?: number;
  storageRam?: string;
  displayType?: 'ORIGINAL' | 'COPY' | 'REFURB' | 'UNKNOWN';
  deviceGrade?: 'GRADE_A' | 'GRADE_B' | 'GRADE_C';
  imeiLast4?: string;
  techReportImages?: string[];
  location?: string; // Physical branch or brand specific storefront (e.g. "Temper King Store", "TrustSpares Central")
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: 'ESCROW_LOCK' | 'ESCROW_RELEASE' | 'WITHDRAWAL' | 'REFUND';
  description: string;
  date: string;
  dealId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  proofImage?: string;
  paymentId?: string; 
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
}
