import { useEffect, useState } from 'react';
import { Home, BarChart, Wallet, User, Zap } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useSubscription } from '../contexts/SubscriptionContext';

const NAV_ITEMS_LEFT = [
    { id: 'home', Icon: Home, labelKey: 'nav_home' },
    { id: 'stats', Icon: BarChart, labelKey: 'nav_stats' },
];

const NAV_ITEMS_RIGHT = [
    { id: 'history', Icon: Wallet, labelKey: 'nav_history' },
    { id: 'profile', Icon: User, labelKey: 'nav_profile' },
];

/** Watches the `dark` class on <html> and returns a boolean. */
function useDarkMode() {
    const [isDark, setIsDark] = useState(
        () => document.documentElement.classList.contains('dark')
    );
    useEffect(() => {
        const obs = new MutationObserver(() =>
            setIsDark(document.documentElement.classList.contains('dark'))
        );
        obs.observe(document.documentElement, { attributeFilter: ['class'] });
        return () => obs.disconnect();
    }, []);
    return isDark;
}

const Navbar = ({ activeTab, setActiveTab }) => {
    const { t: translate } = useSettings();
    const { isPro, openUpgradeModal } = useSubscription();
    const isDark = useDarkMode();

    const handleNavClick = (id) => {
        if (id === 'stats' && !isPro) {
            openUpgradeModal('stats');
            return;
        }
        setActiveTab(id);
    };

    const renderItem = ({ id, Icon, labelKey }) => {
        const active = activeTab === id;
        const isProLocked = id === 'stats' && !isPro;
        const label = translate(labelKey);

        const iconActiveClass = isDark ? 'text-violet-400' : 'text-violet-600';
        const iconInactiveClass = isDark
            ? 'text-gray-400 group-hover:text-gray-200'
            : 'text-gray-500 group-hover:text-gray-700';
        const labelActiveClass = isDark ? 'text-violet-400 font-semibold' : 'text-violet-600 font-semibold';
        const labelInactiveClass = isDark ? 'text-gray-400 font-medium' : 'text-gray-500 font-medium';

        return (
            <button
                key={id}
                id={`nav-${id}`}
                onClick={() => handleNavClick(id)}
                aria-label={label}
                aria-current={active ? 'page' : undefined}
                className="flex flex-col items-center justify-center flex-1 h-full gap-1 relative group"
                style={{ transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >

                <div
                    className={`relative flex items-center justify-center rounded-xl p-1 transition-all duration-300
                        ${active ? `scale-110` : `scale-100 group-hover:scale-105`}`}
                >
                    <Icon size={24} strokeWidth={active ? 2.5 : 2} className={active ? iconActiveClass : iconInactiveClass} />
                    {isProLocked && (
                        <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                            <Zap size={8} className="text-white" strokeWidth={2.5} fill="currentColor" />
                        </span>
                    )}
                </div>

                <span className={`text-[10px] tracking-wide capitalize transition-all duration-300
                    ${active ? labelActiveClass : labelInactiveClass}`}>
                    {label}
                </span>
            </button>
        );
    };

    const barStyle = isDark
        ? {
              background: 'rgba(28, 26, 46, 0.70)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 -4px 32px rgba(0,0,0,0.2)',
          }
        : {
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              borderTop: '1px solid rgba(255,255,255,0.4)',
              boxShadow: '0 -4px 32px rgba(0,0,0,0.05)',
          };

    return (
        <nav
            aria-label="Main navigation"
            className="w-full pointer-events-none"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            <div
                className="w-full pointer-events-auto relative"
                style={barStyle}
            >
                <div className="flex items-center h-[72px] px-2 pb-2">
                    {/* Left nav items */}
                    <div className="flex-1 flex justify-around h-full items-center">
                        {NAV_ITEMS_LEFT.map(renderItem)}
                    </div>

                    {/* Spacer for FAB */}
                    <div className="w-[80px] flex-shrink-0" />

                    {/* Right nav items */}
                    <div className="flex-1 flex justify-around h-full items-center">
                        {NAV_ITEMS_RIGHT.map(renderItem)}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
