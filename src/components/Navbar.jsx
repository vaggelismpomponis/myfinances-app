import React from 'react';
import { Home, PieChart, History, User } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const NAV_ITEMS = [
    { id: 'home',    Icon: Home,     labelKey: 'nav_home'    },
    { id: 'history', Icon: History,  labelKey: 'nav_history' },
    { id: 'stats',   Icon: PieChart, labelKey: 'nav_stats'   },
    { id: 'profile', Icon: User,     labelKey: 'nav_profile' },
];

const Navbar = ({ activeTab, setActiveTab }) => {
    const { t: translate } = useSettings();

    return (
        /* Outer wrapper — provides safe-area padding */
        <div className="relative z-20 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2
                        bg-transparent pointer-events-none">

            {/* Pill container */}
            <div className="pointer-events-auto flex items-center justify-around
                            bg-white/90 dark:bg-surface-dark2/95
                            backdrop-blur-xl
                            rounded-[28px] shadow-glass dark:shadow-card-dark
                            px-2 py-1.5">

                {NAV_ITEMS.map(({ id, Icon, labelKey }) => {
                    const active = activeTab === id;
                    return (
                        <button
                            key={id}
                            id={`nav-${id}`}
                            onClick={() => setActiveTab(id)}
                            className={`flex flex-col items-center justify-center gap-1
                                        flex-1 py-2 px-1
                                        transition-all duration-300 ease-out
                                        ${active
                                            ? 'text-violet-600 dark:text-violet-400'
                                            : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-400'
                                        }`}
                        >
                            {/* Icon with active highlight ring */}
                            <span className={`relative flex items-center justify-center
                                              w-10 h-8 rounded-[14px] transition-all duration-300
                                              ${active
                                                ? 'bg-violet-500/15 shadow-[0_0_12px_rgba(139,92,246,0.4)] ring-1 ring-violet-500/30 animate-pop'
                                                : ''}`}>
                                <Icon
                                    size={20}
                                    strokeWidth={active ? 2.5 : 1.8}
                                    className={`transition-all duration-300 ${active ? 'text-violet-600 dark:text-white' : ''}`}
                                />
                            </span>
                            <span className={`text-[10px] font-semibold tracking-wide transition-all duration-300
                                             ${active ? 'opacity-100' : 'opacity-70'}`}>
                                {translate(labelKey)}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Navbar;
