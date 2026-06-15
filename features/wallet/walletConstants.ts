
export const WALLET_TEXT = {
    TITLE: "My Wallet",
    AVAILABLE_BALANCE: "Available to Withdraw",
    LOCKED_BALANCE: "Processing / Held", // Renamed from Locked in Escrow
    WITHDRAW_TITLE: "Withdraw to Bank",
    WITHDRAW_BUTTON: "Withdraw",
    WITHDRAW_HINT: "Money will be transferred to your linked bank account by Admin.",
    HISTORY_TITLE: "Transaction History",
    NO_TRANSACTIONS: "No transactions yet.",
    GATEWAY_TITLE: "Secure Admin Payment", // Changed from Escrow
    GATEWAY_SUBTITLE: "Pay securely to TrustSpares Admin",
    GATEWAY_NOTE: "பணம் செலுத்திய பிறகு ஸ்கிரீன்ஷாட் அப்லோட் செய்யவும். அட்மின் சரிபார்த்த பின் ஆர்டர் உறுதி செய்யப்படும்.",
    REFUND_GUARANTEE: "100% Secure Payment Protection."
};

export const WALLET_THEME = {
    balanceCard: "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg",
    lockedCard: "bg-gray-100 text-gray-700 border border-gray-200",
    withdrawButton: "bg-gray-900 text-white disabled:opacity-50",
    transaction: {
        deposit: "bg-green-100 text-green-600",
        withdrawal: "bg-gray-100 text-gray-600",
        penalty: "bg-orange-100 text-orange-600"
    }
};
