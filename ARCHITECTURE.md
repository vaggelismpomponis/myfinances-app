# MyFinancesApp - Architecture & Technical Details

This document provides a comprehensive overview of how the application works, its tech stack, components, and security mechanisms. This will help developers understand the architecture and troubleshoot implementations.

## 1. Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Mobile Wrapper**: Capacitor (`@capacitor/core`, `@capacitor/android`, `@capacitor/app`)

### Backend & Database
- **Platform**: Supabase (PostgreSQL, GoTrue for Auth)
- **Language**: JavaScript (Node.js) is used for serverless API endpoints hosted on Vercel.
- **APIs**: Vercel Serverless Functions (`api/create-checkout-session.js`, `api/stripe-webhook.js`) to handle Stripe payments securely.

---

## 2. Authentication & JWT Storage

### How Auth Works
The application uses **Supabase Auth (GoTrue)**. It supports:
- Email/Password with OTP verification (`signInWithPassword`, `verifyOtp`).
- Google Sign-In (using `@codetrix-studio/capacitor-google-auth` for native mobile and Google One Tap / OAuth popup fallback for web).

### JWT Key Storage
- By default, the Supabase client handles session persistence automatically. 
- The JWT access token and refresh token are stored locally using **`localStorage`** on web browsers (typically under a key like `sb-[project-ref]-auth-token`).
- For mobile environments within Capacitor, this same browser-based storage mechanism is typically used by the webview.

---

## 3. Data Storage (Files, Prices, Users)

All user-generated financial data is securely stored in the Supabase PostgreSQL database. 
- **Transactions (Prices/Files)**: Stored in the `transactions` table. Each record contains the `amount`, `category`, `type` (income/expense), `note`, `date`, and `user_id`.
- **Goals & Budgets**: Stored in `goals` and `budgets` tables linked to the user.
- **Realtime Sync**: The app subscribes to PostgreSQL changes via Supabase's Realtime websockets (`supabase.channel('transactions-changes')`), which instantly updates the UI across devices when data changes.

---

## 4. Advanced Features Implementation

### OCR (Optical Character Recognition) - Scanning Receipts
The scanner feature allows users to photograph receipts and extract prices.
- **Library**: `tesseract.js` (used in `ScannerModal.jsx` and `BulkScannerModal.jsx`).
- **Language Support**: Uses `eng+ell` (English and Greek).
- **Flow**:
  1. User takes a photo or uploads an image.
  2. `react-image-crop` is used to allow the user to crop the receipt area.
  3. `Tesseract.recognize` runs locally on the device/browser to extract the text.
  4. Custom logic parses the text: Regex matches currency formats (`\d+[.,]\d{2}`), and keywords (e.g., *total*, *synolo*, *sum*) are used to identify the final amount.

### Speech Recognition - Voice Input
Users can add transactions via voice commands.
- **Libraries**: `@capacitor-community/speech-recognition` for native platforms, and `webkitSpeechRecognition` (HTML5 Web Speech API) as a fallback for the browser.
- **Language Support**: Set to `el-GR` (Greek).
- **Flow**:
  1. The app prompts the user to "Say the amount and category" (e.g., "50 ευρώ στο σούπερ μάρκετ").
  2. The text transcript is passed to a `processVoiceInput` parser.
  3. A predefined keyword mapping (`CATEGORY_KEYWORDS`) scans the text to auto-assign the category (e.g., "γάλα" -> "Σούπερ Μάρκετ"). Regex extracts the number as the price.

---

## 5. Security Measures

The app implements several layers of security both client-side and server-side:

### A. Rate Limiting
- Supabase inherently applies rate limiting to authentication endpoints (e.g., brute-force login attempts, OTP requests) via its GoTrue service. The frontend catches these `429` status codes and displays user-friendly "Rate limit" errors.

### B. Email Enumeration Protection
- Supabase is configured to prevent email enumeration. The frontend explicitly handles the "fake success" responses that Supabase returns when attempting to register an already existing email without exposing that the email is in use prematurely.

### C. Application Privacy & Device Security
- **Privacy Screen**: Uses `@capacitor/privacy-screen` to obscure the app's content with a splash screen or blank screen when the app is sent to the background or viewed in the app switcher. This prevents sensitive financial data from being exposed.
- **App Lock**: Provides an in-app lock screen (`LockScreen.jsx`).
- **Biometrics**: Uses `@capgo/capacitor-native-biometric` for FaceID/Fingerprint authentication upon opening the app.

### D. Session & Device Tracking
- The app tracks active sessions (IP address, location, and device type/browser) and stores them in a `sessions` table. It utilizes fallback IP APIs (like `ipwho.is`, `freeipapi.com`) to determine login locations, alerting users to suspicious logins.

### E. Database Row Level Security (RLS)
- Data isolation is strictly enforced via Supabase's PostgreSQL Row Level Security (RLS) policies. Users can only `SELECT`, `INSERT`, `UPDATE`, or `DELETE` rows in tables (like `transactions`, `goals`) where the `user_id` matches their authenticated JWT token UUID.
