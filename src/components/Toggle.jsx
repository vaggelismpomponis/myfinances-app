import React from 'react';

/**
 * Toggle - Unified iOS / modern Fintech animated toggle switch.
 */
const Toggle = ({
    enabled,
    onChange,
    onClick,
    disabled = false,
    className = '',
}) => {
    const handleClick = (e) => {
        e.stopPropagation();
        if (disabled) return;
        if (onChange) onChange();
        else if (onClick) onClick();
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            aria-pressed={enabled}
            className={`w-[44px] h-[26px] rounded-full flex items-center p-[3px] transition-colors duration-300 shrink-0
                ${enabled ? 'bg-violet-600 shadow-[0_2px_8px_rgba(124,58,237,0.4)]' : 'bg-gray-200 dark:bg-white/10'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'} ${className}`}
        >
            <div
                className={`w-[20px] h-[20px] rounded-full bg-white shadow-sm transition-transform duration-300
                    ${enabled ? 'translate-x-[18px]' : 'translate-x-0'}`}
            />
        </button>
    );
};

export default Toggle;
