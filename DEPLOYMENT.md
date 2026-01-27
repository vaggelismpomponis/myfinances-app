# App Deployment & Usage Guide

Your project is a **Single Source of Truth** application. This means code in `src/` powers **both** the Web App (PWA) and the Android Native App.

## 🔄 How Updates Work

When you change code (e.g., `App.jsx`, `translations.js`):

| Platform | Update Process |
| :--- | :--- |
| **Web / PWA** | deploy to web server (e.g., Vercel, Netlify). <br> *Users see changes immediately upon refresh.* |
| **Android App** | 1. `npm run build` (Compiles React to HTML/JS) <br> 2. `npx cap sync` (Copies compiled files to Android project) <br> 3. Re-install APK or run from Android Studio. |

---

## 📱 Android Native App

This version runs as a standalone app on your phone.

### **How to Build & Install**
1.  **Compile & Sync**:
    ```bash
    npm run build
    npx cap sync
    ```
2.  **Open in Android Studio** (Optional but recommended for signing/final builds):
    ```bash
    npx cap open android
    ```
3.  **Quick Install (Debug APK)**:
    If you just want the file to send to your phone:
    *   Navigate to: `android/app/build/outputs/apk/debug/`
    *   File: `app-debug.apk`
    *   Transfer this file to your phone and install it.

---

## 🌐 Web App (PWA)

This version runs in any browser and can be "installed" to the home screen.

### **How to Use**
1.  **Local Testing**:
    ```bash
    npm run dev
    ```
    Open the URL (usually `http://localhost:5173`) on your computer or phone (if on same WiFi).

2.  **Deployment (Vercel)**:
    *   Push your code to GitHub.
    *   Connect your repo to [Vercel](https://vercel.com).
    *   It will auto-deploy.
    *   **Access**: Open the provided Vercel URL (e.g., `my-finances-app.vercel.app`).

### **PWA Installation**
*   **Android (Chrome)**: Open URL -> Tap "Three dots" -> "Install App".
*   **iOS (Safari)**: Open URL -> Tap "Share" -> "Add to Home Screen".
