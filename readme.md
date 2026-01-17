# MyFinancesApp

A modern, full-stack personal finance application built with React, Vite, Tailwind CSS, and Firebase.

## Features

- **PWA-ready UI**: Mobile-first design that simulates a native app experience.
- **Expense Tracking**: Easily add income and expenses with categories.
- **Real-time Sync**: Data is synced in real-time using Cloud Firestore.
- **Statistics**: Visual breakdown of your expenses by category.
- **Authentication**: Secure login via Firebase Auth (Anonymous login enabled for demo).

## Setup Instructions

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Configure Firebase**
    Create a `.env` file in the root directory and add your Firebase configuration:
    ```env
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```

4.  **Build for Production**
    ```bash
    npm run build
    ```

## Project Structure

- `src/components`: Reusable UI components.
- `src/views`: Main page views (Home, Stats, History, Login).
- `src/firebase.js`: Firebase configuration and initialization.
- `src/App.jsx`: Main application logic and routing.