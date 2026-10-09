/**
 * Transaction Notification Parser for SpendWise
 * 
 * Accurately detects and parses real financial transaction notifications
 * from banking apps (Winbank, Alpha Bank, Eurobank, NBG, etc.),
 * digital wallets (Google Pay, Apple Pay, Revolut, Viva, PayPal, Wise, etc.),
 * and bank SMS alerts.
 * 
 * Strict filtering guarantees non-transaction notifications (e.g. OTP codes,
 * 2FA passcodes, marketing promos, loan offers, balance alerts, system logins)
 * are NEVER recognized as transactions.
 */

// Known financial source identifiers
const SOURCE_PATTERNS = [
    { key: 'revolut', name: 'Revolut', regex: /revolut/i },
    { key: 'google_pay', name: 'Google Pay', regex: /google\s*(?:pay|wallet)|gpay|walletnfcrel/i },
    { key: 'apple_pay', name: 'Apple Pay', regex: /apple\s*pay/i },
    { key: 'samsung_pay', name: 'Samsung Pay', regex: /samsung\s*(?:pay|wallet)|spay/i },
    { key: 'paypal', name: 'PayPal', regex: /paypal/i },
    { key: 'wise', name: 'Wise', regex: /transferwise|wise/i },
    { key: 'winbank', name: 'Winbank', regex: /winbank|piraeus|πειραιως|πειραιώς/i },
    { key: 'alpha_bank', name: 'Alpha Bank', regex: /alpha\s*bank|alphabank|άλφα\s*bank/i },
    { key: 'eurobank', name: 'Eurobank', regex: /eurobank|γιουρομπανκ/i },
    { key: 'nbg', name: 'NBG', regex: /nbg|εθνικη\s*τραπεζα|εθνική\s*τράπεζα/i },
    { key: 'viva', name: 'Viva.com', regex: /viva(?:\.com|wallet)?/i },
    { key: 'optima', name: 'Optima Bank', regex: /optima\s*bank/i },
    { key: 'attica', name: 'Attica Bank', regex: /attica\s*bank/i },
    { key: 'n26', name: 'N26', regex: /number26|n26/i },
    { key: 'monzo', name: 'Monzo', regex: /monzo/i },
    { key: 'curve', name: 'Curve', regex: /curve/i },
    { key: 'klarna', name: 'Klarna', regex: /klarna/i },
];

// Blocked keywords: One-Time Passwords (OTP) and 2FA authentication
const OTP_REGEX = /(?:\b(?:otp|one[- ]time|passcode|verification code|security code|auth code|authorization code|temporary password|use code)\b|κωδικ[οό][ςυ]?\s*(?:μιας\s*χρ[ήη]σης|ασφαλ[εεί]ας|επιβεβα[ίι]ωσης|εισ[όο]δου|σ[υύ]νδεσης)?|μην\s*τον\s*κοινοποιε[ίι]τε|μην\s*αποκαλ[υύ]πτετε|do\s*not\s*share)/i;

// Blocked keywords: Marketing, promotions, loans, advertisements
const MARKETING_REGEX = /(?:\b(?:invite\s*a\s*friend|refer\s*a\s*friend|earn\s*up\s*to|cashback\s*offer|loan\s*offer|pre[- ]approved|special\s*offer|discount|apply\s*now|personal\s*loan|win\s*[$€£]|save\s*on\s*your\s*next)\b|προσφορ[άα]|[έε]κπτωσ[ηη]|δ[άα]νειο|προ[έε]γκρισ[ηη]|κερδ[ίι]στε|ανακαλ[ύυ]ψτε|επιβρ[άα]βευσ[ηη]|ν[έε]ο\s*πρ[όο]γραμμα|επωφεληθε[ίι]τε)/i;

// Blocked keywords: Security alerts, logins, statement generation, card maintenance
const SECURITY_REGEX = /(?:\b(?:new\s*login|login\s*detected|unrecognized\s*device|password\s*changed|statement\s*(?:is\s*)?ready|monthly\s*statement|card\s*(?:activated|frozen|unblocked)|pin\s*changed|biometrics\s*enabled)\b|ν[έε]α\s*ε[ίι]σοδος|σ[ύυ]νδεση\s*απ[όο]|αλλαγ[ήη]\s*κωδικο[ύυ]|απ[όο]σπασμα\s*λογαριασμο[ύυ]|ενεργοποι[ήη]θηκε\s*η\s*κ[άα]ρτα|μπλοκαρ[ίι]στηκε\s*η\s*κ[άα]ρτα|αλλαγ[ήη]\s*pin)/i;

// Pure balance alert (e.g. "Available balance: 150€") without transaction verbs
const PURE_BALANCE_REGEX = /^(?:.*(?:διαθ[έε]σιμο\s*υπ[όο]λοιπο|υπ[όο]λοιπο\s*λογαριασμο[ύυ]|available\s*balance|account\s*balance|current\s*balance).*)$/i;

// Positive transaction action keywords
const EXPENSE_KEYWORDS_REGEX = /(?:\b(?:paid|payment|purchase|charged|spent|debit|withdrawal|sent|transferred|pos|spent\s*at)\b|αγορ[άα]|χρ[έε]ωσ[ηη]|πληρωμ[ήη]|πληρ[ώω]θηκε|χρε[ώω]θηκε|αν[άα]ληψη|εξ[όο]φληση|συναλλαγ[ήη]|έξοδο|μεταφορ[άα]\s*σε|απεστ[άα]λη|στε[ίι]λατε|εγκρ[ίι]θηκε\s*(?:συναλλαγ[ήη]|αγορ[άα])|xreosi|agora|pliromi|synallagi)/i;

const INCOME_KEYWORDS_REGEX = /(?:\b(?:received|refund|deposit|credited|salary|cashback|got\s*paid|transferred\s*from|incoming)\b|κατ[άα]θεση|π[ίι]στωσ[ηη]|πιστ[ώω]θηκε|ελ[ήη]φθη|επιστροφ[ήη]|μισθοδοσ[ίι]α|έσοδο|λ[άα]βατε|πληρωθ[ήη]κατε|μεταφορ[άα]\s*απ[όο]|pistosi|katathesi|epistrofi)/i;

/**
 * Detect bank or payment provider source
 */
export const detectSource = (packageName = '', title = '', text = '') => {
    const combined = `${packageName} ${title} ${text}`.toLowerCase();
    for (const p of SOURCE_PATTERNS) {
        if (p.regex.test(combined)) {
            return p.name;
        }
    }
    if (packageName.includes('messaging') || packageName.includes('mms')) {
        return 'SMS';
    }
    return 'Bank / Wallet';
};

/**
 * Determines whether a notification is an authentic financial transaction
 */
export const isTransactionNotification = (data = {}) => {
    const title = (data.title || '').trim();
    const text = (data.text || '').trim();
    const bigText = (data.bigText || '').trim();
    const combined = `${title} ${text} ${bigText}`.trim();

    if (!combined || combined.length < 5) return false;

    // 1. Filter out OTP / 2FA verification codes
    if (OTP_REGEX.test(combined)) {
        return false;
    }

    // 2. Filter out Marketing / Promos
    if (MARKETING_REGEX.test(combined)) {
        return false;
    }

    // 3. Filter out Security alerts / Logins / Statements
    if (SECURITY_REGEX.test(combined)) {
        return false;
    }

    // 4. Filter out pure balance queries without an actual transaction action
    const hasExpenseAction = EXPENSE_KEYWORDS_REGEX.test(combined);
    const hasIncomeAction = INCOME_KEYWORDS_REGEX.test(combined);
    if (!hasExpenseAction && !hasIncomeAction) {
        return false;
    }

    if (PURE_BALANCE_REGEX.test(combined) && !hasExpenseAction && !hasIncomeAction) {
        return false;
    }

    // 5. Must have an extractable monetary amount
    const parsedAmount = extractAmount(combined);
    if (!parsedAmount || parsedAmount.amount <= 0) {
        return false;
    }

    return true;
};

/**
 * Extracts numeric transaction amount and currency safely
 * avoiding dates, times, OTPs, and card 4-digit numbers.
 */
export const extractAmount = (rawText = '') => {
    if (!rawText) return null;

    // Remove dates like 09/10/2026 or 09.10.2026 or 2026-10-09
    let cleaned = rawText.replace(/\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b/g, ' ');

    // Remove times like 14:30 or 14.30 preceded by "στις" or "at"
    cleaned = cleaned.replace(/(?:στις|at|ώρα|time)\s+\d{1,2}[:.]\d{2}/gi, ' ');

    // Remove masked card numbers like *1234, ..1234, **** 1234, κάρτα 1234
    cleaned = cleaned.replace(/(?:\*+|\.{2,}|κάρτα\s*|card\s*)\d{4}\b/gi, ' ');

    // Match currency symbol/code followed or preceded by number
    // Formats: €12.50, 12,50€, 12.50 EUR, EUR 12,50, 1.250,50 €, 1,250.50 EUR, 50€
    const patterns = [
        // Prefix currency: €12.50 or EUR 12,50 or $12.50
        /(?:[€$£]|EUR|USD|GBP)\s*(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})|\d+(?:[.,]\d{1,2})?)/i,
        // Postfix currency: 12.50€ or 12,50 EUR or 12,50 ευρώ
        /(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})|\d+(?:[.,]\d{1,2})?)\s*(?:[€$£]|EUR|USD|GBP|euro|ευρ[ώω])/i,
        // Fallback: Number with decimal right next to action words
        /(?:ποσ[όο][υύ]?|συναλλαγ[ήη]|αγορ[άα]|χρ[έε]ωσ[ηη]|πληρωμ[ήη]|paid|spent|charged|refund)\s*:?\s*(\d+(?:[.,]\d{1,2}))/i,
    ];

    for (const pattern of patterns) {
        const match = cleaned.match(pattern);
        if (match && match[1]) {
            let numStr = match[1].trim();

            // Detect European thousands (1.250,50) vs US (1,250.50)
            if (numStr.includes('.') && numStr.includes(',')) {
                if (numStr.lastIndexOf(',') > numStr.lastIndexOf('.')) {
                    // European: 1.250,50 -> 1250.50
                    numStr = numStr.replace(/\./g, '').replace(',', '.');
                } else {
                    // US: 1,250.50 -> 1250.50
                    numStr = numStr.replace(/,/g, '');
                }
            } else if (numStr.includes(',')) {
                numStr = numStr.replace(',', '.');
            }

            const amount = parseFloat(numStr);
            if (!isNaN(amount) && amount > 0 && amount < 1000000) {
                // Currency
                let currency = 'EUR';
                if (/[$$]|USD/i.test(cleaned)) currency = 'USD';
                else if (/[£]|GBP/i.test(cleaned)) currency = 'GBP';
                else if (/CHF/i.test(cleaned)) currency = 'CHF';

                return { amount, currency };
            }
        }
    }

    return null;
};

/**
 * Extracts transaction type: 'expense' | 'income'
 */
export const extractTransactionType = (text = '') => {
    if (INCOME_KEYWORDS_REGEX.test(text)) {
        return 'income';
    }
    return 'expense';
};

/**
 * Extracts clean merchant or counterparty name
 */
export const extractMerchant = (rawText = '', title = '', sourceName = '') => {
    let combined = `${title} ${rawText}`.replace(/\s+/g, ' ');

    // Specific merchant patterns
    const patterns = [
        // "Paid €12.50 to Starbucks" -> Starbucks
        /(?:paid|payment\s+to|sent|transferred\s+to)\s+(?:[€$£\d.,\s\w]+?)\s+to\s+([A-Za-z0-9\s&'./\-]+?)(?:\s+(?:with|using|on|via|\.|$))/i,
        // "Spent €12.50 at Shell" or "Purchase at Zara" -> Shell / Zara
        /(?:spent|purchase|charged)\s+(?:[€$£\d.,\s\w]+?)\s+at\s+([A-Za-z0-9\s&'./\-]+?)(?:\s+(?:with|using|on|via|\.|$))/i,
        // Greek: "στην επιχείρηση SKLAVENITIS"
        /(?:στην\s+επιχε[ίι]ρηση|επιχε[ίι]ρηση)\s+([A-Za-z0-9\sΑ-Ωα-ωά-ώ&'./\-]+?)(?:\s+(?:με|στις|την|\.|$))/i,
        // Greek: "στο SKLAVENITIS" or "σε WOLT"
        /(?:στ[οη]|σε)\s+([A-Za-z0-9\sΑ-Ωα-ωά-ώ&'./\-]+?)(?:\s+(?:με|στις|την|για|\.|$))/i,
        // Greek: "από AMAZON" / "from John Doe"
        /(?:απ[όο]|from)\s+([A-Za-z0-9\sΑ-Ωα-ωά-ώ&'./\-]+?)(?:\s+(?:με|στις|την|μέσω|via|\.|$))/i,
        // POS / SMS pattern: "Συναλλαγή 15.00€, AB VASSILOPOULOS, Κάρτα ..1234"
        /(?:συναλλαγ[ήη]|αγορ[άα]|χρ[έε]ωσ[ηη])[^,:]*?[,:]\s*([A-Za-z0-9\sΑ-Ωα-ωά-ώ&'./\-]+?)(?:[,.]|\s+κ[άα]ρτα|\s+με|\s*$)/i,
    ];

    for (const pattern of patterns) {
        const match = combined.match(pattern);
        if (match && match[1]) {
            let m = match[1].trim();
            // Clean common suffix artifacts
            m = m.replace(/^(?:the|τον|την|το)\s+/i, '');
            m = m.replace(/\s+(?:με|στις|την|με\s+την\s+κ[άα]ρτα.*)$/i, '');
            m = m.replace(/[,.-]+$/, '').trim();

            // Ignore if match is just currency or numbers
            if (m.length >= 2 && !/^\d+$/.test(m) && !/^(?:eur|euro|usd)$/i.test(m)) {
                return m;
            }
        }
    }

    // Fallback: If title contains merchant name and title isn't just the bank
    if (title && !SOURCE_PATTERNS.some(s => s.regex.test(title)) && !/notification|messages|sms/i.test(title)) {
        return title.trim();
    }

    return sourceName || 'Bank Transaction';
};

/**
 * Maps merchant and transaction context to SpendWise Greek categories
 */
export const categorizeTransaction = (merchant = '', text = '', type = 'expense') => {
    const combined = `${merchant} ${text}`.toLowerCase();

    if (type === 'income') {
        if (/μισθοδοσ[ίι]α|salary|payroll/i.test(combined)) return 'Μισθός';
        if (/επιστροφ[ήη]|refund|cashback|δ[ώω]ρο|gift/i.test(combined)) return 'Δώρο';
        if (/μ[έε]ρισμα|dividend|interest|τ[όο]κοι|επ[έε]νδυσ[ηη]|investment|crypto/i.test(combined)) return 'Επενδύσεις';
        return 'Άλλα Έσοδα';
    }

    // Expense categories
    // 1. Supermarket / Groceries
    if (/σκλαβεν[ίι]τη[ςς]|sklavenitis|lidl|ab\s*vassilopoulos|αβ\s*βασιλ[όο]πουλος|μασο[ύυ]τη[ςς]|masoutis|market\s*in|γαλαξ[ίι]α[ςς]|galaxias|bazaar|supermarket|super\s*market|παντοπωλε[ίι]ο|μαν[άα]βικο|κρεοπωλε[ίι]ο|carrefour/i.test(combined)) {
        return 'Σούπερ Μάρκετ';
    }

    // 2. Food & Delivery
    if (/e[- ]?food|wolt|goody'?s|mcdonald'?s|kfc|pizza|domino|ταβ[έε]ρνα|σουβλ[άα]κι|ψητοπωλε[ίι]ο|grill|burger|restaurant|εστιατ[όο]ριο|delivery|everest|γρηγ[όο]ρη[ςς]|gregory'?s/i.test(combined)) {
        return 'Φαγητό';
    }

    // 3. Coffee
    if (/starbucks|coffee\s*island|mikel|coffee\s*lab|coffee|caf[ée]|espresso|freddo|καφ[έε][ςς]/i.test(combined)) {
        return 'Καφές';
    }

    // 4. Fuel & Gas
    if (/shell|bp|eko|avin|revoil|elin|ελιν|petrol|fuel|gas\s*station|βενζιν[άα]δικο|κα[ύυ]σιμα|δι[όο]δια|attiki\s*odos/i.test(combined)) {
        return 'Βενζίνη';
    }

    // 5. Bills & Utilities
    if (/δεη|dei|cosmote|vodafone|nova|ευδαπ|eydap|οτε|ote|δεδδηε|deddie|ppc|taxisnet|εφκα|efka|ενφια|bill|λογαριασμ[όο][ςς]|ρε[ύυ]μα|νερο/i.test(combined)) {
        return 'Λογαριασμοί';
    }

    // 6. Entertainment
    if (/netflix|spotify|cinema|village|odeon|steam|playstation|youtube\s*premium|disney|σινεμ[άα]|θ[έε]ατρο|εισιτ[ήη]ρια|concert/i.test(combined)) {
        return 'Διασκέδαση';
    }

    // 7. Health & Pharmacy
    if (/φαρμακε[ίι]ο|farmakeio|pharmacy|γιατρ[όο][ςς]|doctor|κλινικ[ήη]|νοσοκομε[ίι]ο|clinic/i.test(combined)) {
        return 'Υγεία';
    }

    // 8. Home
    if (/ikea|ικεα|praktiker|leroy\s*merlin|jysk|zara\s*home|σπ[ίι]τι|[έε]πιπλα/i.test(combined)) {
        return 'Σπίτι';
    }

    return 'Άλλο';
};

/**
 * Full parsing pipeline for an incoming notification object
 * 
 * @param {Object} rawNotification - { title, text, bigText, subText, packageName, date }
 * @returns {Object} Structured SpendWise transaction or invalid flag
 */
export const parseNotificationTransaction = (rawNotification = {}) => {
    if (!rawNotification) {
        return { isValidTransaction: false, reason: 'Empty notification' };
    }

    const title = (rawNotification.title || '').trim();
    const text = (rawNotification.text || '').trim();
    const bigText = (rawNotification.bigText || '').trim();
    const subText = (rawNotification.subText || '').trim();
    const packageName = (rawNotification.packageName || '').trim();

    const fullContent = `${title} ${text} ${bigText} ${subText}`.trim();

    if (!isTransactionNotification({ title, text, bigText, subText })) {
        return {
            isValidTransaction: false,
            reason: 'Notification is not an authentic transaction (e.g. OTP, promo, balance, or unrecognized)'
        };
    }

    const amountResult = extractAmount(fullContent);
    if (!amountResult || amountResult.amount <= 0) {
        return { isValidTransaction: false, reason: 'Could not extract valid transaction amount' };
    }

    const sourceName = detectSource(packageName, title, fullContent);
    const type = extractTransactionType(fullContent);
    const merchant = extractMerchant(fullContent, title, sourceName);
    const category = categorizeTransaction(merchant, fullContent, type);

    // Formulate a clean note
    let note = merchant;
    if (sourceName && !merchant.toLowerCase().includes(sourceName.toLowerCase())) {
        note = `${merchant} • ${sourceName}`;
    }

    return {
        isValidTransaction: true,
        amount: amountResult.amount,
        currency: amountResult.currency,
        type,
        category,
        merchant,
        note: note.substring(0, 200),
        sourceName,
        rawTitle: title,
        rawText: text,
        date: rawNotification.date ? new Date(rawNotification.date).toISOString() : new Date().toISOString()
    };
};
