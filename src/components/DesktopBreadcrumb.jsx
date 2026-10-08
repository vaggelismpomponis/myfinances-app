import React from 'react';
import { ArrowLeft } from 'lucide-react';

/**
 * DesktopBreadcrumb - Unified desktop navigation bar shown above settings pages
 * when the mobile header is hidden.
 */
const DesktopBreadcrumb = ({
    onBack,
    backLabel = 'Back to Settings',
    badgeIcon: BadgeIcon,
    badgeText,
    rightAction,
    hideHeader = true,
    className = '',
}) => {
    if (!hideHeader) return null;

    return (
        <div className={`flex flex-wrap items-center justify-between gap-3 sm:gap-4 pb-2.5 sm:pb-3 ${className}`}>
            <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-white dark:bg-white/[0.05] border border-gray-200/80 dark:border-white/[0.08] text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.1] active:scale-95 shadow-sm transition-all whitespace-nowrap shrink-0"
            >
                <ArrowLeft size={14} strokeWidth={2.5} className="shrink-0" />
                <span>{backLabel}</span>
            </button>

            {badgeText && (
                <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-200/60 dark:border-violet-500/20 text-xs font-semibold text-violet-700 dark:text-violet-300 whitespace-nowrap shrink-0 max-w-full">
                    {BadgeIcon && <BadgeIcon size={14} strokeWidth={2} className="shrink-0 text-violet-600 dark:text-violet-400" />}
                    <span className="truncate">{badgeText}</span>
                </div>
            )}

            {rightAction}
        </div>
    );
};

export default DesktopBreadcrumb;
