import { describe, it, expect } from 'vitest';
import {
    isTransactionNotification,
    extractAmount,
    extractTransactionType,
    detectSource,
    extractMerchant,
    categorizeTransaction,
    parseNotificationTransaction
} from '../transactionParser';

describe('Transaction Notification Parser', () => {
    describe('OTP / 2FA & Security Filtering (Must Reject)', () => {
        it('rejects bank OTP verification SMS with amounts', () => {
            const data = {
                title: 'Winbank',
                text: 'Ο κωδικός μιας χρήσης (OTP) για τη συναλλαγή σας αξίας 50.00€ είναι 482910. Μην τον αποκαλύπτετε.',
                packageName: 'gr.winbank.mobile'
            };
            expect(isTransactionNotification(data)).toBe(false);
            const parsed = parseNotificationTransaction(data);
            expect(parsed.isValidTransaction).toBe(false);
        });

        it('rejects English 2FA passcodes from banks and payment services', () => {
            const data = {
                title: 'Revolut',
                text: 'Your one-time passcode is 492-104. Never share this code with anyone.',
                packageName: 'com.revolut.revolut'
            };
            expect(isTransactionNotification(data)).toBe(false);
            expect(parseNotificationTransaction(data).isValidTransaction).toBe(false);
        });

        it('rejects Alpha Bank authorization codes', () => {
            const data = {
                title: 'ALPHA BANK',
                text: 'Κωδικός επιβεβαίωσης: 893421 για την είσοδό σας.',
                packageName: 'gr.alphabank.myalphamobile'
            };
            expect(isTransactionNotification(data)).toBe(false);
        });

        it('rejects Google verification messages', () => {
            const data = {
                title: 'Google',
                text: 'G-948123 is your Google verification code. Do not share.',
                packageName: 'com.google.android.apps.messaging'
            };
            expect(isTransactionNotification(data)).toBe(false);
        });
    });

    describe('Marketing & Non-Transaction Alert Filtering (Must Reject)', () => {
        it('rejects Revolut referral marketing alerts', () => {
            const data = {
                title: 'Revolut',
                text: 'Invite a friend and get €50 when they order a card and make 3 purchases!',
                packageName: 'com.revolut.revolut'
            };
            expect(isTransactionNotification(data)).toBe(false);
            expect(parseNotificationTransaction(data).isValidTransaction).toBe(false);
        });

        it('rejects bank loan promotion messages', () => {
            const data = {
                title: 'Eurobank',
                text: 'Αποκτήστε καταναλωτικό δάνειο Fast Loan έως 5.000€ με άμεση έγκριση.',
                packageName: 'gr.eurobank.ebanking'
            };
            expect(isTransactionNotification(data)).toBe(false);
        });

        it('rejects security and new login notifications', () => {
            const data = {
                title: 'Winbank',
                text: 'Ενημέρωση ασφαλείας: Νέα είσοδος στο e-banking από συσκευή Windows.',
                packageName: 'gr.winbank.mobile'
            };
            expect(isTransactionNotification(data)).toBe(false);
        });

        it('rejects account statement readiness alerts', () => {
            const data = {
                title: 'Alpha Bank',
                text: 'Το μηνιαίο απόσπασμα λογαριασμού σας είναι διαθέσιμο.',
                packageName: 'gr.alphabank.myalphamobile'
            };
            expect(isTransactionNotification(data)).toBe(false);
        });

        it('rejects pure balance alerts without transaction actions', () => {
            const data = {
                title: 'Winbank',
                text: 'Το διαθέσιμο υπόλοιπο του λογαριασμού σας είναι 450,20€.',
                packageName: 'gr.winbank.mobile'
            };
            expect(isTransactionNotification(data)).toBe(false);
        });

        it('rejects regular chat / WhatsApp messages', () => {
            const data = {
                title: 'Nikos',
                text: 'Τα λέμε στις 14:30 για καφέ!',
                packageName: 'com.whatsapp'
            };
            expect(isTransactionNotification(data)).toBe(false);
        });
    });

    describe('Valid Transaction Parsing (Must Accept & Parse Correctly)', () => {
        it('parses Google Pay expense at Sklavenitis', () => {
            const data = {
                title: 'Google Pay',
                text: 'Paid €14.50 to Sklavenitis',
                packageName: 'com.google.android.apps.walletnfcrel'
            };
            const parsed = parseNotificationTransaction(data);
            expect(parsed.isValidTransaction).toBe(true);
            expect(parsed.amount).toBe(14.50);
            expect(parsed.currency).toBe('EUR');
            expect(parsed.type).toBe('expense');
            expect(parsed.category).toBe('Σούπερ Μάρκετ');
            expect(parsed.sourceName).toBe('Google Pay');
        });

        it('parses Revolut coffee expense at Starbucks', () => {
            const data = {
                title: 'Revolut',
                text: 'You paid €4.80 to Starbucks',
                packageName: 'com.revolut.revolut'
            };
            const parsed = parseNotificationTransaction(data);
            expect(parsed.isValidTransaction).toBe(true);
            expect(parsed.amount).toBe(4.80);
            expect(parsed.type).toBe('expense');
            expect(parsed.category).toBe('Καφές');
            expect(parsed.sourceName).toBe('Revolut');
        });

        it('parses Revolut income transfer from friend', () => {
            const data = {
                title: 'Revolut',
                text: 'You received €50.00 from Maria Papadopoulou',
                packageName: 'com.revolut.revolut'
            };
            const parsed = parseNotificationTransaction(data);
            expect(parsed.isValidTransaction).toBe(true);
            expect(parsed.amount).toBe(50.00);
            expect(parsed.type).toBe('income');
            expect(parsed.category).toBe('Άλλα Έσοδα');
        });

        it('parses Winbank card purchase in Greek with comma decimals', () => {
            const data = {
                title: 'winbank',
                text: 'Χρέωση 32,50€ στην επιχείρηση SHELL με την κάρτα σας *1234.',
                packageName: 'gr.winbank.mobile'
            };
            const parsed = parseNotificationTransaction(data);
            expect(parsed.isValidTransaction).toBe(true);
            expect(parsed.amount).toBe(32.50);
            expect(parsed.type).toBe('expense');
            expect(parsed.category).toBe('Βενζίνη');
            expect(parsed.sourceName).toBe('Winbank');
        });

        it('parses Alpha Bank card purchase with EUR currency code', () => {
            const data = {
                title: 'ALPHA BANK',
                text: 'Αγορά EUR 45,00 στο ZARA με την κάρτα ..5678 στις 18:20',
                packageName: 'gr.alphabank.myalphamobile'
            };
            const parsed = parseNotificationTransaction(data);
            expect(parsed.isValidTransaction).toBe(true);
            expect(parsed.amount).toBe(45.00);
            expect(parsed.type).toBe('expense');
            expect(parsed.category).toBe('Άλλο');
            expect(parsed.sourceName).toBe('Alpha Bank');
        });

        it('parses Eurobank food delivery purchase', () => {
            const data = {
                title: 'Eurobank',
                text: 'Εγκρίθηκε αγορά 12,80€ στο E-FOOD',
                packageName: 'gr.eurobank.ebanking'
            };
            const parsed = parseNotificationTransaction(data);
            expect(parsed.isValidTransaction).toBe(true);
            expect(parsed.amount).toBe(12.80);
            expect(parsed.category).toBe('Φαγητό');
            expect(parsed.sourceName).toBe('Eurobank');
        });

        it('parses NBG utility bill payment', () => {
            const data = {
                title: 'NBG',
                text: 'Πληρωμή 65,00€ σε ΔΕΗ',
                packageName: 'gr.nbg.mobilebanking'
            };
            const parsed = parseNotificationTransaction(data);
            expect(parsed.isValidTransaction).toBe(true);
            expect(parsed.amount).toBe(65.00);
            expect(parsed.category).toBe('Λογαριασμοί');
            expect(parsed.sourceName).toBe('NBG');
        });

        it('parses Viva Wallet transaction', () => {
            const data = {
                title: 'Viva.com',
                text: 'Πληρωμή 3,50€ σε THE COFFEE LAB',
                packageName: 'com.vivawallet.consumer'
            };
            const parsed = parseNotificationTransaction(data);
            expect(parsed.isValidTransaction).toBe(true);
            expect(parsed.amount).toBe(3.50);
            expect(parsed.category).toBe('Καφές');
            expect(parsed.sourceName).toBe('Viva.com');
        });

        it('parses SMS from bank with card mask and European thousands separator', () => {
            const data = {
                title: 'PIRAEUS',
                text: 'Karta *9988: Xreosi 1.250,00 EUR se Idomeneas',
                packageName: 'com.google.android.apps.messaging'
            };
            const parsed = parseNotificationTransaction(data);
            expect(parsed.isValidTransaction).toBe(true);
            expect(parsed.amount).toBe(1250.00);
            expect(parsed.type).toBe('expense');
        });

        it('parses salary deposit income', () => {
            const data = {
                title: 'Winbank',
                text: 'Πίστωση 1.100,00€ στο λογαριασμό σας (Μισθοδοσία)',
                packageName: 'gr.winbank.mobile'
            };
            const parsed = parseNotificationTransaction(data);
            expect(parsed.isValidTransaction).toBe(true);
            expect(parsed.amount).toBe(1100.00);
            expect(parsed.type).toBe('income');
            expect(parsed.category).toBe('Μισθός');
        });

        it('parses refund as income gift/refund category', () => {
            const data = {
                title: 'Revolut',
                text: 'Refund of €19.99 from Amazon',
                packageName: 'com.revolut.revolut'
            };
            const parsed = parseNotificationTransaction(data);
            expect(parsed.isValidTransaction).toBe(true);
            expect(parsed.amount).toBe(19.99);
            expect(parsed.type).toBe('income');
            expect(parsed.category).toBe('Δώρο');
        });
    });
});
