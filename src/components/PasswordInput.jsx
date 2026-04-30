import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({ label, value, onChange, placeholder = '••••••••', required = false, error = '', icon: Icon }) => {
    const [show, setShow] = useState(false);
    
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="block text-[11px] font-semibold text-gray-400 dark:text-white/60 uppercase tracking-wide ml-0.5">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 transition-colors group-focus-within:text-violet-500" size={16} />
                )}
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full ${Icon ? 'pl-10' : 'px-4'} py-3 pr-11 
                               bg-gray-50 dark:bg-white/[0.05]
                               border border-gray-200 dark:border-transparent
                               rounded-xl text-[14px] text-gray-900 dark:text-white
                               placeholder:text-gray-300 dark:placeholder:text-white/20
                               focus:outline-none focus:ring-2 
                               ${error ? 'focus:ring-rose-500/40 border-rose-200 dark:border-rose-500/30' : 'focus:ring-violet-500/40'}
                               transition-all duration-200`}
                    required={required}
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 
                               text-gray-400 dark:text-white/40
                               hover:text-gray-600 dark:hover:text-white/60 
                               active:scale-90 transition-all duration-200"
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
            {error && (
                <p className="text-[10px] text-rose-500 dark:text-rose-400 font-medium ml-1 animate-fade-in">
                    {error}
                </p>
            )}
        </div>
    );
};

export default PasswordInput;
