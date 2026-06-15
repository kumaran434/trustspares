
import React from 'react';
import { CreditCard, Shield, Settings, HelpCircle, FileLock, ScrollText, PhoneCall, Mail, MapPin, Truck, Share2, QrCode } from 'lucide-react';

export const handleShareApp = async () => {
    const url = "https://trustspares.in";
    const title = "TrustSpares - Secure Technician Market";
    const text = "Join TrustSpares to buy/sell mobile spares securely. Verified sellers & Escrow protection.";
    if (typeof navigator.share === 'function') {
        try { await navigator.share({ title, text, url }); } catch (e) {}
    } else {
        navigator.clipboard.writeText(url);
        alert("App link copied to clipboard!");
    }
};

export const PROFILE_MENU_ITEMS = [
    {
        id: 'share',
        title: "Share App",
        subtitle: "Invite friends to TrustSpares",
        icon: Share2,
        iconBg: "bg-pink-50",
        iconColor: "text-pink-600",
        action: handleShareApp
    },
    {
        id: 'qr',
        title: "My Shop QR Code",
        subtitle: "Download QR for your shop",
        icon: QrCode,
        iconBg: "bg-slate-100",
        iconColor: "text-slate-900"
    },
    {
        id: 'bank',
        title: "Bank Details",
        subtitle: "Bank account for withdrawals",
        icon: CreditCard,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600"
    },
    {
        id: 'shipping-policy',
        title: "Shipping Policy",
        subtitle: "Delivery timelines & partners",
        icon: Truck,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600"
    },
    {
        id: 'refund-policy',
        title: "Refund Policy",
        subtitle: "Cancellation and returns",
        icon: FileLock,
        iconBg: "bg-orange-50",
        iconColor: "text-orange-600"
    },
    {
        id: 'terms',
        title: "Terms of Service",
        subtitle: "Platform rules & guidelines",
        icon: ScrollText,
        iconBg: "bg-indigo-50",
        iconColor: "text-indigo-600"
    },
    {
        id: 'help',
        title: "Help & Support",
        subtitle: "Contact TrustSpares Admin",
        icon: HelpCircle,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600"
    }
];

export const LEGAL_TEXTS: Record<string, any> = {
    ENGLISH: {
        REFUND: {
            title: "Refund & Cancellation Policy",
            content: `1. Cancellation: Orders can be cancelled within 2 hours of payment.
2. Return Period: 7-day return policy for functional defects in spare parts.
3. Refund Mode: Original payment method or TrustSpares wallet.
4. Timeline: Refunds processed within 5-7 working days of seller receiving the returned item.`
        },
        SHIPPING: {
            title: "Shipping & Delivery Policy",
            content: `1. Dispatch: Sellers must ship within 24-48 hours of order confirmation.
2. Delivery Time: Standard delivery takes 3-5 working days across India.
3. Tracking: Real-time tracking IDs provided via WhatsApp and App.
4. Partners: We use professional courier services like Delhivery, BlueDart, and DTDC.`
        },
        TERMS: {
            title: "Terms & Conditions",
            content: `1. TrustSpares is a B2B marketplace for mobile technicians.
2. Users must provide valid Udyam/GST details for seller verification.
3. All payments are held in Escrow by TrustSpares Admin (Manual Verification).
4. Direct transactions outside the app are strictly prohibited.`
        }
    },
    TAMIL: {
        REFUND: {
            title: "ரீஃபண்ட் & ரத்து செய்தல் கொள்கை (Refund Policy)",
            content: `1. ரத்து செய்தல்: ஆர்டர் செய்த 2 மணி நேரத்திற்குள் ரத்து செய்யலாம்.
2. ரிட்டர்ன்: ஸ்பேர் பார்ட்ஸ் வேலை செய்யவில்லை என்றால் 7 நாட்களுக்குள் ரிட்டர்ன் செய்யலாம்.
3. பணம் திரும்பப் பெறுதல்: பணம் உங்கள் வாலட் அல்லது வங்கி கணக்கிற்கு அனுப்பப்படும்.
4. காலக்கெடு: செல்லர் பொருளைப் பெற்ற 5-7 நாட்களில் பணம் கிடைக்கும்.`
        },
        SHIPPING: {
            title: "ஷிப்பிங் கொள்கை (Shipping Policy)",
            content: `1. அனுப்புதல்: ஆர்டர் வந்த 24-48 மணி நேரத்திற்குள் செல்லர் கொரியர் செய்ய வேண்டும்.
2. டெலிவரி நேரம்: இந்தியா முழுவதும் 3-5 வேலை நாட்களில் கிடைக்கும்.
3. ட்ராக்கிங்: வாட்ஸ்அப் அல்லது ஆப் மூலம் ட்ராக்கிங் ஐடி வழங்கப்படும்.
4. கூரியர்: Delhivery, BlueDart, DTDC போன்ற நம்பகமான கூரியர் மட்டுமே பயன்படுத்தப்படும்.`
        },
        TERMS: {
            title: "விதிமுறைகள் & நிபந்தனைகள் (Terms)",
            content: `1. TrustSpares மொபைல் டெக்னீஷியன்களுக்கானது மட்டுமே.
2. செல்லராக மாற Udyam அல்லது GST கட்டாயம்.
3. அனைத்து பணப்பரிமாற்றங்களும் TrustSpares Admin Escrow முறையில் நடக்கும்.
4. ஆப்-ஐத் தாண்டி நேரடியாக பணப்பரிமாற்றம் செய்வது தடைசெய்யப்பட்டுள்ளது.`
        }
    }
};

['HINDI', 'MALAYALAM', 'KANNADA', 'TELUGU'].forEach(lang => {
    if (!LEGAL_TEXTS[lang]) {
        LEGAL_TEXTS[lang] = LEGAL_TEXTS['ENGLISH'];
    }
});

export const CONTACT_INFO = {
    title: "Contact Us & Grievance",
    shop_name: "TrustSpares India Pvt Ltd",
    address: "New No. 42, Old No. 10, Richie Street, Chintadripet, Chennai, Tamil Nadu - 600002",
    email: "grievance@trustspares.in",
    phone: "+91 98765 43210",
    officer: "Senthil Kumar (Grievance Officer)",
    hours: "10:00 AM to 07:00 PM (Mon-Sat)"
};

export const PROFILE_TEXT = {
    ABOUT_TITLE: "About TrustSpares",
    ABOUT_DESC: "India's most secure B2B trade platform for mobile spare parts. We empower technicians with escrow protection and verified inventory.",
    VERSION: "TrustSpares v1.6.0 (trustspares.in)"
};
