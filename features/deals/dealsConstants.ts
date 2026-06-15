
import { Deal, ProductReview } from '../../types';

export const DEAL_FEES = {
    ADMIN_COMMISSION_RATE: 0.01, // 1%
    GATEWAY_FEE_RATE: 0.02, // 2%
};

/**
 * List of auto-generated reviews to build trust for new products.
 */
export const MOCK_REVIEWS_LIST: Omit<ProductReview, 'id' | 'date'>[] = [
    { userName: "Siva Mobile Tech", rating: 5, comment: "Original product quality. Display perfect-ah eruku. Good packing.", isVerified: true },
    { userName: "Arun Electronics", rating: 5, comment: "Technician price romba kammi. Quick delivery, thank you admin.", isVerified: true },
    { userName: "Bala Mobiles", rating: 4, comment: "Fitting perfect-ah set aachu. Best quality for this price.", isVerified: true },
    { userName: "Raj Tech Chennai", rating: 5, comment: "100% genuine spares. TrustSpares payment safe.", isVerified: true },
    { userName: "MS Mobile Care", rating: 5, comment: "Quality is good as mentioned. Happy with the purchase.", isVerified: true },
    { userName: "Kumar Reparing", rating: 4, comment: "Fast shipping. Spare part working well. Recommended.", isVerified: true },
];

/**
 * Shared logic to generate a product share message and trigger the share dialog.
 */
export const handleShareProduct = async (deal: Deal, sellerName?: string) => {
    const url = `https://trustspares.in/#/deal/${deal.id}`;
    const price = deal.amount;
    
    const text = 
`🛠️ *${deal.title.toUpperCase()}*
💰 Price: *₹${price.toLocaleString()}*
🏢 Seller: ${sellerName || 'TrustSpares Official'}

📝 _Details:_
${deal.description.substring(0, 100)}${deal.description.length > 100 ? '...' : ''}

📦 *Buy securely on TrustSpares App!*

👇 *Click to view and order:*
${url}`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: deal.title,
                text: text,
                url: url,
            });
        } catch (error) {
            console.log('Error sharing', error);
        }
    } else {
        const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(waUrl, '_blank');
        try {
            await navigator.clipboard.writeText(`${text}\n\n${url}`);
        } catch (e) {}
    }
};

export const SECURITY_ALERTS = {
    TAMIL: {
        TITLE: "TrustSpares கேரண்டி",
        MESSAGE: "பாதுகாப்பான அட்மின் பேமெண்ட்",
        RET_POLICY: "7 நாட்கள் ரிட்டர்ன் பாலிசி",
        SECURE_PAY: "பாதுகாப்பான பரிவர்த்தனை"
    },
    HINDI: {
        TITLE: "TrustSpares गारंटी",
        MESSAGE: "सुरक्षित एडमिन भुगतान",
        RET_POLICY: "7 दिन की वापसी नीति",
        SECURE_PAY: "सुरक्षित भुगतान"
    },
    ENGLISH: {
        TITLE: "TrustSpares Guarantee",
        MESSAGE: "Secure Admin Payment",
        RET_POLICY: "7 Days Return Policy",
        SECURE_PAY: "100% Secure Payment"
    },
    MALAYALAM: {
        TITLE: "ഗ്യാരണ്ടി",
        MESSAGE: "സുരക്ഷിതമായ പേയ്മെന്റ്",
        RET_POLICY: "7 ദിവസത്തെ റിട്ടേൺ",
        SECURE_PAY: "സുരക്ഷിത പേയ്മെന്റ്"
    },
    KANNADA: {
        TITLE: "ಭರವಸೆ",
        MESSAGE: "ಸುರಕ್ಷಿತ ಪಾವತಿ",
        RET_POLICY: "7 ದಿನಗಳ ರಿಟರ್ನ್ ಪಾಲಿಸಿ",
        SECURE_PAY: "ಸುರಕ್ಷಿತ ಪಾವತಿ"
    },
    TELUGU: {
        TITLE: "హామీ",
        MESSAGE: "సురక్షిత చెల్లింపు",
        RET_POLICY: "7 రోజుల రిటర్న్ పాలసీ",
        SECURE_PAY: "సురక్షిత చెల్లింపు"
    }
};

export const DEAL_TEXTS = {
    PLEDGE_HONESTY: "Mention every scratch, dent, or issue clearly. Honest sellers get repeat customers and higher ratings.",
    PLEDGE_DEFECTS: "If the item received is different from your description, you will pay the Return Shipping + Penalty.",
    PLEDGE_FRAUD: "Selling fake products or intentional fraud will result in an immediate and Permanent Ban.",
    SHIPPING_AGREEMENT: "I promise to pack the item safely and provide a tracking number within 24 hours. If the item breaks due to bad packing, I accept a refund."
};

export const DEAL_CARD_TEXT = {
    STATUS_FOR_SALE: "In Stock",
    STATUS_PENDING: "Processing",
    STATUS_READY: "Ready to Pay",
    NEW_BADGE: "NEW",
    SOLD_BY: "Sold by",
    TAG_SELLER: "Your Listing",
    TAG_BUYER: "Your Order",
    PRICE_LABEL: "Price",
    BTN_CHECK_STOCK: "View Details"
};

export const CATALOG_TEXT = {
    BACK_BUTTON: "Back",
    ACTIVE_LISTINGS: "In Stock",
    ITEMS_SOLD: "Items Sold",
    INVENTORY_TITLE: "Inventory",
    EMPTY_STATE: "No items available right now."
};

export const SUGGESTED_TAGS = [
    "Original",
    "First Copy",
    "Display Good",
    "Glass Broken",
    "Touch Working",
    "Battery Good",
    "Battery Weak",
    "Motherboard Working",
    "Dead Mobile",
    "For Parts Only",
    "Camera Issue",
    "No FaceID",
    "With Box"
];
