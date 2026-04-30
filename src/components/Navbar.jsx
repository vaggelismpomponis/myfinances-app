import { Home, BarChart, Wallet, User } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const NAV_ITEMS_LEFT = [
    { id: 'home',  Icon: Home,     labelKey: 'nav_home'  },
    { id: 'stats', Icon: BarChart, labelKey: 'nav_stats' },
];

const NAV_ITEMS_RIGHT = [
    { id: 'history', Icon: Wallet, labelKey: 'nav_history' },
    { id: 'profile', Icon: User,   labelKey: 'nav_profile' },
];

const Navbar = ({ activeTab, setActiveTab }) => {
    const { t: translate } = useSettings();

    const renderItem = ({ id, Icon, labelKey }) => {
        const active = activeTab === id;
        return (
            <button
                key={id}
                id={`nav-${id}`}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1
                            transition-all duration-300 ease-out`}
            >
                <div className={`relative flex items-center justify-center transition-all duration-300 ${active ? 'scale-110' : ''}`}>
                    {id === 'home' && active ? (
                        <Icon size={22} strokeWidth={2.5} className="text-violet-600 fill-violet-600" />
                    ) : (
                        <Icon size={22} strokeWidth={2.5} className={active ? 'text-violet-600' : 'text-gray-400 hover:text-gray-500 dark:text-gray-500'} />
                    )}
                </div>
                <span className={`text-[10px] font-semibold tracking-wide transition-all duration-300
                                 ${active ? 'text-violet-600 opacity-100' : 'text-gray-400 dark:text-gray-500 opacity-70'}`}>
                    {translate(labelKey)}
                </span>
            </button>
        );
    };

    // This SVG defines a smooth U-shape curve for the center notch.
    // Width 110px, Height 72px. The cutout dips down to Y=42.
    const notchSvg = "data:image/svg+xml;charset=UTF-8,%3csvg width='110' height='72' viewBox='0 0 110 72' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M0 0 C 12 0 18 5 25 18 C 35 42 75 42 85 18 C 92 5 98 0 110 0 V 72 H 0 Z' fill='black'/%3e%3c/svg%3e";

    return (
        <div className="relative z-20 pb-[env(safe-area-inset-bottom)] pointer-events-none w-full">
            {/* 
                Wrapper with CSS drop-shadow. 
                Using drop-shadow instead of box-shadow so the shadow perfectly traces the SVG mask cutout!
            */}
            <div className="absolute inset-0 pointer-events-none drop-shadow-[0_-8px_16px_rgba(0,0,0,0.06)]">
                {/* The white background with the multi-part SVG mask cutout */}
                <div className="absolute inset-0 bg-white dark:bg-surface-dark2 pointer-events-auto"
                     style={{
                         maskImage: `linear-gradient(black, black), url("${notchSvg}"), linear-gradient(black, black)`,
                         WebkitMaskImage: `linear-gradient(black, black), url("${notchSvg}"), linear-gradient(black, black)`,
                         maskPosition: 'left top, center top, right top',
                         WebkitMaskPosition: 'left top, center top, right top',
                         maskSize: 'calc(50% - 54px) 100%, 110px 72px, calc(50% - 54px) 100%',
                         WebkitMaskSize: 'calc(50% - 54px) 100%, 110px 72px, calc(50% - 54px) 100%',
                         maskRepeat: 'no-repeat, no-repeat, no-repeat',
                         WebkitMaskRepeat: 'no-repeat, no-repeat, no-repeat',
                         borderTopLeftRadius: '28px',
                         borderTopRightRadius: '28px',
                     }}
                />
            </div>

            {/* Content container */}
            <div className="relative pointer-events-auto flex items-center justify-between h-[72px] px-4">
                <div className="flex-1 flex justify-around h-full items-center">
                    {NAV_ITEMS_LEFT.map(renderItem)}
                </div>
                
                {/* Spacer for the FAB */}
                <div className="w-[88px] h-full flex-shrink-0" />
                
                <div className="flex-1 flex justify-around h-full items-center">
                    {NAV_ITEMS_RIGHT.map(renderItem)}
                </div>
            </div>
        </div>
    );
};

export default Navbar;









