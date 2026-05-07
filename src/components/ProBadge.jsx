import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

const ProBadge = () => {
    const { t } = useSettings();
    
    return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase
                         bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
            👑 {t('pro_badge', 'PRO')}
        </span>
    );
};

export default ProBadge;
