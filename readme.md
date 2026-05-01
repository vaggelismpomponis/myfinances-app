# SpendWise          

SpendWise is a comprehensive personal finance management application built with React and Capacitor, designed to help you track your income and expenses, manage budgets, and achieve your financial goals. The app features a modern, user-friendly interface with dark mode support and advanced analytics.

## Features

- **Transaction Tracking**: Log income and expenses with detailed categorization.
- **AI-Powered Scanning**: Use your camera to scan receipts and automatically extract transaction details.
- **Budget Management**: Set monthly budgets for different categories and monitor your spending against them.
- **Financial Goals**: Create savings goals and track your progress.
- **Recurring Transactions**: Automate the entry of regular bills and subscriptions.
- **Smart Insights**: Get personalized financial advice based on your spending habits.
- **Security**: Secure login with biometric authentication (Face ID/Touch ID) and PIN code.
- **Cross-Platform**: Runs on Android and iOS thanks to Capacitor.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- [Capacitor CLI](https://capacitorjs.com/docs/getting-started/basic)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd myfinances-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To run the app in development mode with hot-reload:

```bash
npm run dev
```

### Building for Mobile

To build the web application and sync it with the native mobile projects:

```bash
npm run prepare-mobile
```

To open the Android project in Android Studio:

```bash
npx cap open android
```

## Project Structure

- `src/components/`: Reusable UI components.
- `src/pages/`: Main application screens (Home, Transactions, Budgets, etc.).
- `src/services/`: API and data management logic.
- `src/utils/`: Utility functions and helpers.
- `public/`: Static assets.

## License

This project is licensed under the MIT License.
