import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';

const PromptModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    title, 
    description, 
    placeholder, 
    submitText, 
    inputType = 'text',
    error,
    isLoading = false
}) => {
    const [inputValue, setInputValue] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setInputValue('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(inputValue);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/60 sm:bg-black/50 backdrop-blur-sm transition-opacity"
                 onClick={onClose} />
            <div className="relative z-10 w-full max-w-md
                            bg-white dark:bg-surface-dark2
                            rounded-t-[2rem] sm:rounded-2xl p-7
                            border-t border-x sm:border border-gray-200 dark:border-transparent
                            shadow-2xl animate-slide-up sm:animate-pop">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-5 sm:hidden" />
                
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                
                {description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                        {description}
                    </p>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 dark:bg-rose-900/30 text-red-600 dark:text-rose-400 text-xs p-3 rounded-xl border border-red-100 dark:border-rose-800/40">
                            {error}
                        </div>
                    )}
                    <div className="relative">
                        <input
                            type={inputType === 'password' ? (showPassword ? 'text' : 'password') : inputType}
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            placeholder={placeholder}
                            required
                            className="input-glow w-full px-4 py-3 rounded-xl text-sm
                                       bg-gray-50 dark:bg-white/8 
                                       border border-gray-200 dark:border-transparent
                                       text-gray-900 dark:text-white 
                                       placeholder-gray-400 dark:placeholder-gray-600
                                       focus:ring-2 focus:ring-violet-500/50 dark:focus:ring-violet-500/50
                                       transition-all duration-200"
                        />
                        {inputType === 'password' && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        )}
                    </div>
                    <button type="submit" disabled={isLoading}
                            className="w-full py-3.5 rounded-xl font-bold text-sm text-white
                                       bg-gradient-to-r from-violet-600 to-violet-700
                                       shadow-glow-sm hover:from-violet-500
                                       active:scale-[0.98] disabled:opacity-60
                                       transition-all duration-200">
                        {submitText}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PromptModal;









