import React from 'react';
import { ArrowLeft } from 'lucide-react';

/**
 * ViewHeader - Unified, premium top bar for view screens.
 * Automatically handles safe-area insets, dark mode blur, back button,
 * title, subtitle, right action, and optional children (e.g. tabs/search).
 */
const ViewHeader = ({
    onBack,
    title,
    subtitle,
    rightAction,
    hideHeader = false,
    className = '',
    contentClassName = '',
    children,
}) => {
    if (hideHeader) return null;

    return (
        <div
            className={`shrink-0 transition-colors duration-300 sticky top-0 z-20 bg-gray-50/90 dark:bg-[#121212]/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.06] px-4 pb-3 ${className}`}
            style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
        >
            <div className={`flex items-center justify-between min-h-[36px] ${contentClassName}`}>
                {onBack ? (
                    <button
                        type="button"
                        onClick={onBack}
                        className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center text-gray-700 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/[0.14] active:scale-90 transition-all duration-150 shrink-0"
                        aria-label="Back"
                    >
                        <ArrowLeft size={16} strokeWidth={2.5} />
                    </button>
                ) : (
                    <div className="w-9 shrink-0" />
                )}

                <div className="text-center px-2 flex-1 min-w-0">
                    {typeof title === 'string' ? (
                        <h2 className="text-[17px] font-extrabold text-gray-900 dark:text-white leading-tight truncate">
                            {title}
                        </h2>
                    ) : (
                        title
                    )}
                    {subtitle && (
                        typeof subtitle === 'string' ? (
                            <p className="text-[11px] font-medium text-gray-500 dark:text-white/50 leading-none mt-0.5 truncate">
                                {subtitle}
                            </p>
                        ) : (
                            subtitle
                        )
                    )}
                </div>

                {rightAction ? (
                    <div className="flex items-center justify-end min-w-[36px] shrink-0">
                        {rightAction}
                    </div>
                ) : (
                    <div className="w-9 shrink-0" />
                )}
            </div>

            {children}
        </div>
    );
};

export default ViewHeader;
