
import { User, UserRole, DealStatus } from './types';

// *** PUSH NOTIFICATION KEYS ***
export const FIREBASE_VAPID_KEY = "BKXi3v_KRpxkgw9O5ix7AJhnVeQF5M8qmgFKM8SjvPnjc-gktiuqLTDUkL_0sw56GV3YFWgo9VbSiVo3OflywiM"; 
export const FIREBASE_SERVER_KEY = "REPLACE_WITH_YOUR_SERVER_KEY_FROM_FIREBASE_CONSOLE"; 

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Raja Mobile Tech',
    role: UserRole.SELLER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raja',
    walletBalance: 15000,
    escrowBalance: 0,
    trustScore: 4.8,
    kycVerified: true,
    kycStatus: 'VERIFIED',
    mobile: '9876543210',
    address: '12/4, Richie Street, Mount Road, Chennai - 600002',
    shopName: 'Raja Mobile Spares',
    upiId: 'raja@upi',
    bankDetails: {
        accountName: 'Raja Mobile Tech',
        accountNumber: '123456789012',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank',
        branchName: 'Mount Road'
    }
  },
  {
    id: 'u2',
    name: 'Kumar Spares',
    role: UserRole.BUYER,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kumar',
    walletBalance: 25000,
    escrowBalance: 3500,
    trustScore: 4.5,
    kycVerified: true,
    kycStatus: 'VERIFIED',
    mobile: '9123456789',
    address: '45, Gandhipuram 2nd Street, Coimbatore - 641012'
  },
  {
    id: 'u3',
    name: 'TrustSpare Admin',
    role: UserRole.ADMIN,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    walletBalance: 0,
    escrowBalance: 0,
    trustScore: 5.0,
    kycVerified: true
  }
];

// SAMPLE DEALS CLEARED
export const SAMPLE_DEALS = [];
