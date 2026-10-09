package com.bomponis.spendwise;

import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import android.app.Notification;
import android.os.Bundle;
import android.content.SharedPreferences;
import android.content.Context;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Date;
import java.util.UUID;
import java.util.LinkedHashSet;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import android.util.Log;

public class SMSNotificationListenerService extends NotificationListenerService {

    private static final String TAG = "SpendWiseNotifListener";

    // Deduplication buffer for recent notification signatures
    private static final LinkedHashSet<String> sProcessedSignatures = new LinkedHashSet<>();
    private static final int MAX_DEDUP_CACHE = 50;

    // Explicitly blocked packages (never read notifications from these)
    private static final String[] BLOCKED_PACKAGES = {
        "com.whatsapp",
        "com.facebook.orca",
        "com.facebook.katana",
        "com.facebook.lite",
        "com.instagram.android",
        "org.telegram.messenger",
        "com.viber.voip",
        "com.discord",
        "com.slack",
        "com.twitter.android",
        "com.zhiliaoapp.musically",
        "com.tiktok",
        "com.snapchat.android",
        "com.linkedin.android",
        "com.reddit.frontpage",
        "com.skype.raider",
        "org.thoughtcrime.securesms",
        "android",
        "com.android.systemui",
        "com.android.vending",
        "com.google.android.youtube",
        "com.spotify.music",
        "com.netflix.mediaclient"
    };

    // Whitelisted banking, digital wallet & SMS packages
    private static final String[] ALLOWED_PACKAGES = {
        // Digital Wallets & Fintech
        "com.google.android.apps.walletnfcrel",
        "com.google.android.apps.wallet",
        "com.samsung.android.spay",
        "com.samsung.android.raja.spay",
        "com.revolut.revolut",
        "com.transferwise.android",
        "com.paypal.android.p2pmobile",
        "de.number26.android",
        "co.uk.getmondo",
        "com.imaginecurve.curve.prd",
        "com.klarna.mobile",
        "co.starlingbank.android",
        "com.bunq.android",

        // Greek Banks & Fintech
        "gr.winbank.mobile",
        "com.winbank.mobile",
        "gr.alphabank.myalphamobile",
        "gr.alphabank.alpha",
        "gr.eurobank.ebanking",
        "gr.nbg.mobilebanking",
        "com.vivawallet.consumer",
        "com.vivawallet",
        "com.vivawallet.wallet",
        "gr.optimabank.mobile",
        "gr.atticabank.mobile",

        // Major European & International Banks
        "uk.co.santander.santanderUK",
        "es.bancosantander.apps",
        "com.barclays.android.barclaysmobilebanking",
        "uk.co.hsbc.hsbcukmobilebanking",
        "com.htsu.hsbcpersonalbanking",
        "com.chase.sig.android",
        "com.infonow.bofa",
        "com.wf.wellsfargomobile",
        "com.citi.citimobile",
        "com.konylabs.capitalone",
        "com.bnpparibas.mescomptes",
        "com.ing.banking",
        "nl.ing.mobile",
        "de.deutschebank.pbc.mobilebanking",
        "com.intesasanpaolo.android.combo",
        "com.bbva.bbvacontigo",
        "com.bankofcyprus.mobile",
        "com.hellenicbank.mobile",

        // SMS & Messenger Apps (where bank SMS arrives)
        "com.google.android.apps.messaging",
        "com.samsung.android.messaging",
        "com.android.mms",
        "com.android.messaging",
        "com.miui.sms",
        "com.miui.mms",
        "com.huawei.message",
        "com.coloros.mms",
        "com.heytap.mms",
        "com.vivo.mms",
        "com.oppo.mms"
    };

    // Regex for OTP, 2FA, verification codes (STRICT REJECTION)
    private static final Pattern OTP_PATTERN = Pattern.compile(
        "(?i)(?:\\b(?:otp|one[- ]time|passcode|verification\\s*code|security\\s*code|auth\\s*code|authorization\\s*code|temporary\\s*password|use\\s*code|do\\s*not\\s*share)\\b|" +
        "κωδικ[οό][ςυ]?\\s*(?:μιας\\s*χρ[ήη]σης|ασφαλ[εεί]ας|επιβεβα[ίι]ωσης|εισ[όο]δου|σ[υύ]νδεσης)?|" +
        "μην\\s*τον\\s*κοινοποιε[ίι]τε|μην\\s*αποκαλ[υύ]πτετε)"
    );

    // Regex for Marketing, promos, loan offers, discounts (STRICT REJECTION)
    private static final Pattern MARKETING_PATTERN = Pattern.compile(
        "(?i)(?:\\b(?:invite\\s*a\\s*friend|refer\\s*a\\s*friend|earn\\s*up\\s*to|cashback\\s*offer|loan\\s*offer|pre[- ]approved|special\\s*offer|discount|apply\\s*now|personal\\s*loan|win\\s*[$€£]|save\\s*on\\s*your\\s*next)\\b|" +
        "προσφορ[άα]|[έε]κπτωσ[ηη]|δ[άα]νειο|προ[έε]γκρισ[ηη]|κερδ[ίι]στε|ανακαλ[ύυ]ψτε|επιβρ[άα]βευσ[ηη]|ν[έε]ο\\s*πρ[όο]γραμμα|επωφεληθε[ίι]τε)"
    );

    // Regex for Security, logins, statements, card status (STRICT REJECTION)
    private static final Pattern SECURITY_PATTERN = Pattern.compile(
        "(?i)(?:\\b(?:new\\s*login|login\\s*detected|unrecognized\\s*device|password\\s*changed|statement\\s*(?:is\\s*)?ready|monthly\\s*statement|card\\s*(?:activated|frozen|unblocked)|pin\\s*changed|biometrics\\s*enabled)\\b|" +
        "ν[έε]α\\s*ε[ίι]σοδος|σ[ύυ]νδεση\\s*απ[όο]|αλλαγ[ήη]\\s*κωδικο[ύυ]|απ[όο]σπασμα\\s*λογαριασμο[ύυ]|ενεργοποι[ήη]θηκε\\s*η\\s*κ[άα]ρτα|μπλοκαρ[ίι]στηκε\\s*η\\s*κ[άα]ρτα|αλλαγ[ήη]\\s*pin)"
    );

    // Regex for positive transaction verbs (REQUIRED)
    private static final Pattern TRANSACTION_ACTION_PATTERN = Pattern.compile(
        "(?i)(?:\\b(?:paid|payment|purchase|charged|spent|debit|withdrawal|sent|transferred|refund|received|deposit|credited|salary|pos)\\b|" +
        "αγορ[άα]|χρ[έε]ωσ[ηη]|πληρωμ[ήη]|πληρ[ώω]θηκε|χρε[ώω]θηκε|αν[άα]ληψη|εξ[όο]φληση|συναλλαγ[ήη]|έξοδο|μεταφορ[άα]|απεστ[άα]λη|στε[ίι]λατε|εγκρ[ίι]θηκε|" +
        "κατ[άα]θεση|π[ίι]στωσ[ηη]|πιστ[ώω]θηκε|ελ[ήη]φθη|επιστροφ[ήη]|μισθοδοσ[ίι]α|έσοδο|λ[άα]βατε|πληρωθ[ήη]κατε|" +
        "xreosi|agora|pliromi|synallagi|katathesi|pistosi|egkrithike)"
    );

    // Regex for monetary amount with currency (REQUIRED)
    private static final Pattern AMOUNT_CURRENCY_PATTERN = Pattern.compile(
        "(?i)(?:[€$£]|EUR|USD|GBP|euro|ευρ[ώω])\\s*\\d+(?:[.,]\\d{1,2})?|\\d+(?:[.,]\\d{1,2})?\\s*(?:[€$£]|EUR|USD|GBP|euro|ευρ[ώω])|\\b\\d+[.,]\\d{2}\\b"
    );

    // Bank identification keywords for SMS messages
    private static final Pattern SMS_BANK_IDENTIFIER_PATTERN = Pattern.compile(
        "(?i)(?:winbank|piraeus|πειραιως|πειραιώς|alpha|αλφα|άλφα|eurobank|γιουρομπανκ|nbg|εθνικη|εθνική|revolut|viva|paypal|wise|optima|attica|" +
        "\\bkarta\\b|\\bκάρτα\\b|\\bcard\\b|\\bpos\\b|\\biban\\b|λογαριασμ|\\bbank\\b|τραπεζ)"
    );

    @Override
    public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn == null) return;

        String packageName = sbn.getPackageName();
        if (packageName == null || !isAllowedPackage(packageName)) {
            return;
        }

        Notification notification = sbn.getNotification();
        if (notification == null || notification.extras == null) {
            return;
        }

        Bundle extras = notification.extras;
        String title = extras.getString(Notification.EXTRA_TITLE);
        CharSequence textCharSeq = extras.getCharSequence(Notification.EXTRA_TEXT);
        CharSequence bigTextCharSeq = extras.getCharSequence(Notification.EXTRA_BIG_TEXT);
        CharSequence subTextCharSeq = extras.getCharSequence(Notification.EXTRA_SUB_TEXT);

        String text = textCharSeq != null ? textCharSeq.toString() : "";
        String bigText = bigTextCharSeq != null ? bigTextCharSeq.toString() : "";
        String subText = subTextCharSeq != null ? subTextCharSeq.toString() : "";

        if (title == null) title = "";

        String combined = (title + " " + text + " " + bigText + " " + subText).trim();
        if (combined.length() < 5) {
            return;
        }

        // Deduplication check
        String signature = packageName + "_" + title + "_" + combined.hashCode();
        synchronized (sProcessedSignatures) {
            if (sProcessedSignatures.contains(signature)) {
                Log.d(TAG, "Duplicate notification skipped: " + signature);
                return;
            }
            if (sProcessedSignatures.size() >= MAX_DEDUP_CACHE) {
                String oldest = sProcessedSignatures.iterator().next();
                sProcessedSignatures.remove(oldest);
            }
            sProcessedSignatures.add(signature);
        }

        // 1. Strict Negative Check: OTP / 2FA / Passcodes
        if (OTP_PATTERN.matcher(combined).find()) {
            Log.d(TAG, "Rejected: OTP / 2FA verification message");
            return;
        }

        // 2. Strict Negative Check: Marketing / Promotions
        if (MARKETING_PATTERN.matcher(combined).find()) {
            Log.d(TAG, "Rejected: Marketing / promotional notification");
            return;
        }

        // 3. Strict Negative Check: Security / Logins / Statements
        if (SECURITY_PATTERN.matcher(combined).find()) {
            Log.d(TAG, "Rejected: Security / system alert notification");
            return;
        }

        // 4. Positive Check: Transaction action keyword must be present
        if (!TRANSACTION_ACTION_PATTERN.matcher(combined).find()) {
            Log.d(TAG, "Rejected: No transaction action verb found");
            return;
        }

        // 5. Positive Check: Monetary amount pattern must be present
        if (!AMOUNT_CURRENCY_PATTERN.matcher(combined).find()) {
            Log.d(TAG, "Rejected: No monetary amount pattern found");
            return;
        }

        // 6. Extra verification for SMS apps: Must identify a bank or financial institution
        boolean isSmsApp = isSmsPackage(packageName);
        if (isSmsApp && !SMS_BANK_IDENTIFIER_PATTERN.matcher(combined).find()) {
            Log.d(TAG, "Rejected: SMS message does not originate from a financial institution");
            return;
        }

        Log.i(TAG, "Valid financial transaction notification confirmed from: " + packageName);
        saveTransaction(packageName, title, text, bigText, subText);
    }

    private boolean isAllowedPackage(String pkg) {
        if (pkg == null) return false;
        String p = pkg.toLowerCase();

        // 1. Definite blocked check
        for (String blocked : BLOCKED_PACKAGES) {
            if (p.startsWith(blocked)) {
                return false;
            }
        }

        // 2. Whitelist match
        for (String allowed : ALLOWED_PACKAGES) {
            if (p.equals(allowed) || p.startsWith(allowed)) {
                return true;
            }
        }

        // 3. Generic financial heuristic
        if (p.contains("bank") || p.contains("wallet") || p.contains("fintech") || p.contains("card")) {
            return true;
        }
        if (p.contains("pay") && !p.contains("play") && !p.contains("player") && !p.contains("game")) {
            return true;
        }

        return false;
    }

    private boolean isSmsPackage(String pkg) {
        if (pkg == null) return false;
        String p = pkg.toLowerCase();
        return p.contains("messaging") || p.contains("mms") || p.contains("sms");
    }

    private void saveTransaction(String packageName, String title, String text, String bigText, String subText) {
        try {
            SharedPreferences prefs = getSharedPreferences("com.bomponis.spendwise.transactions", Context.MODE_PRIVATE);
            String existing = prefs.getString("pending", "[]");
            JSONArray jsonArray = new JSONArray(existing);

            JSONObject obj = new JSONObject();
            obj.put("id", UUID.randomUUID().toString());
            obj.put("packageName", packageName);
            obj.put("title", title);
            obj.put("text", text);
            obj.put("bigText", bigText);
            obj.put("subText", subText);
            obj.put("date", new Date().getTime());

            jsonArray.put(obj);

            SharedPreferences.Editor editor = prefs.edit();
            editor.putString("pending", jsonArray.toString());
            boolean success = editor.commit(); // Synchronous write

            Log.i(TAG, "Financial transaction saved successfully. Pending count: " + jsonArray.length() + " Success: " + success);
        } catch (Exception e) {
            Log.e(TAG, "Error saving pending financial transaction", e);
        }
    }
}
