import React from 'react';
import { Zap } from 'lucide-react';

/**
 * ProBadge — inline amber-orange "⚡ PRO" chip.
 * Used next to locked features throughout the app.
 */
const ProBadge = () => (
    <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase"
        style={{
            background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(245,158,11,0.35)',
        }}
    >
        <Zap size={9} fill="#fff" strokeWidth={0} />
        PRO
    </span>
);

export default ProBadge;
