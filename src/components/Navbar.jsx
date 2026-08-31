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

// SVG mask that cuts a smooth U-shaped notch from the TOP of the pill
// The filled (black) area = visible pill; the notch gap = transparent hole for the FAB
// Width: 110px, Height: 68px (matches pill height), notch depth: 38px at center
const NOTCH_SVG = "data:image/svg+xml;charset=UTF-8,%3csvg width='110' height='68' viewBox='0 0 110 68' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M0 0 C 14 0, 20 8, 26 26 C 36 42, 74 42, 84 26 C 90 8, 96 0, 110 0 V 68 H 0 Z' fill='black'/%3e%3c/svg%3e";

// 3-part mask: left solid | center notch SVG | right solid
const NOTCH_MASK = {
    maskImage: `linear-gradient(black, black), url("${NOTCH_SVG}"), linear-gradient(black, black)`,
    WebkitMaskImage: `linear-gradient(black, black), url("${NOTCH_SVG}"), linear-gradient(black, black)`,
    maskPosition: 'left top, center top, right top',
    WebkitMaskPosition: 'left top, center top, right top',
    maskSize: 'calc(50% - 55px) 100%, 110px 100%, calc(50% - 55px) 100%',
    WebkitMaskSize: 'calc(50% - 55px) 100%, 110px 100%, calc(50% - 55px) 100%',
    maskRepeat: 'no-repeat, no-repeat, no-repeat',
    WebkitMaskRepeat: 'no-repeat, no-repeat, no-repeat',
};

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
            ? 'text-gray-300 group-hover:text-gray-100'
            : 'text-gray-500 group-hover:text-gray-700';
        const labelActiveClass = isDark ? 'text-violet-400' : 'text-violet-600';
        const labelInactiveClass = isDark ? 'text-gray-400' : 'text-gray-500';
        const iconBgActive = isDark ? 'bg-violet-500/25' : 'bg-violet-500/15';
        const iconBgHover = isDark ? 'group-hover:bg-white/8' : 'group-hover:bg-black/5';

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
                {/* Active glow strip at top */}
                {active && (
                    <span
                        className="absolute inset-x-2 top-2 h-0.5 rounded-full"
                        style={{
                            background: isDark
                                ? 'linear-gradient(90deg, transparent, #a78bfa, transparent)'
                                : 'linear-gradient(90deg, transparent, #7c3aed, transparent)',
                            boxShadow: isDark
                                ? '0 0 10px 3px rgba(167,139,250,0.45)'
                                : '0 0 8px 2px rgba(124,58,237,0.35)',
                        }}
                    />
                )}

                <div
                    className={`relative flex items-center justify-center rounded-xl p-1.5 transition-all duration-300
                        ${active ? `${iconBgActive} scale-110` : `scale-100 group-hover:scale-105 ${iconBgHover}`}`}
                >
                    {id === 'home' && active ? (
                        <Icon size={21} strokeWidth={2.5} className={`${iconActiveClass} fill-violet-500/30`} />
                    ) : (
                        <Icon size={21} strokeWidth={2.5} className={active ? iconActiveClass : iconInactiveClass} />
                    )}
                    {isProLocked && (
                        <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                            <Zap size={8} className="text-white" strokeWidth={2.5} fill="currentColor" />
                        </span>
                    )}
                </div>

                <span className={`text-[9px] font-semibold tracking-wider uppercase transition-all duration-300
                    ${active ? labelActiveClass : labelInactiveClass}`}>
                    {label}
                </span>
            </button>
        );
    };

    const pillStyle = isDark
        ? {
              borderRadius: '28px',
              background: 'rgba(28, 26, 46, 0.85)',
              backdropFilter: 'blur(28px) saturate(160%)',
              WebkitBackdropFilter: 'blur(28px) saturate(160%)',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.50), 0 2px 8px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.07)',
          }
        : {
              borderRadius: '28px',
              background: '#f5f5f5',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(0,0,0,0.07)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.90)',
          };

    return (
        <nav
            aria-label="Main navigation"
            className="w-full pointer-events-none"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {/* Floating glass pill with top-center notch for FAB */}
            <div
                className="mx-4 mb-4 pointer-events-auto relative"
                style={{ ...pillStyle, ...NOTCH_MASK }}
            >
                <div className="flex items-center h-[68px] px-2">
                    {/* Left nav items */}
                    <div className="flex-1 flex justify-around h-full items-center">
                        {NAV_ITEMS_LEFT.map(renderItem)}
                    </div>

                    {/* Spacer for FAB notch */}
                    <div className="w-[110px] flex-shrink-0" />

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
