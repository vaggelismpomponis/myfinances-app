import React from 'react';
import { Home, PieChart, History, User } from 'lucide-react';
import IconButton from './IconButton';
import { useSettings } from '../contexts/SettingsContext';

const Navbar = ({ activeTab, setActiveTab }) => {
    const { t: translate } = useSettings();

    return (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800 px-6 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-3 z-10 sticky bottom-0 transition-colors duration-300">
            <div className="flex justify-between items-end relative">
                <div className="flex-1 flex justify-around mr-4">
                    <IconButton icon={Home} label={translate('nav_home')} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                    <IconButton icon={History} label={translate('nav_history')} active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
                </div>
                <div className="w-12"></div> {/* Space for FAB */}
                <div className="flex-1 flex justify-around ml-4">
                    <IconButton icon={PieChart} label={translate('nav_stats')} active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
                    <IconButton icon={User} label={translate('nav_profile')} active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
                </div>
            </div>
        </div>
    );
};

export default Navbar;
