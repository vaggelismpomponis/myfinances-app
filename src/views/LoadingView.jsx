import React from 'react';
import { Wallet } from 'lucide-react';

const LoadingView = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="relative mb-8">
            {/* Pulsing Background Circle */}
            <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full animate-ping"></div>

            {/* Main Icon Container */}
            <div className="relative z-10 w-24 h-24 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl shadow-xl flex items-center justify-center transform animate-bounce-slow">
                <Wallet className="text-white w-10 h-10" strokeWidth={1.5} />
            </div>
        </div>

        {/* App Name with Gradient */}
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 tracking-tight">
            MyFinances
        </h1>

        {/* Loading Indicator */}
        <div className="flex gap-1.5 items-center mt-2">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
        </div>
    </div>
);

export default LoadingView;
