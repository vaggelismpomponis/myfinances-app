import React from 'react';
import { Home, PieChart } from 'lucide-react';
import IconButton from './IconButton';

const Navbar = ({ activeTab, setActiveTab }) => {
    return (
        <div className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-800 px-6 pb-6 pt-2 z-10 sticky bottom-0 transition-colors duration-300">
            <div className="flex justify-between items-end relative">
                <div className="flex-1 mr-8">
                    <IconButton icon={Home} label="Αρχική" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
                </div>
                <div className="w-12"></div> {/* Space for FAB */}
                <div className="flex-1 ml-8">
                    <IconButton icon={PieChart} label="Ανάλυση" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
                </div>
            </div>
        </div>
    );
};

export default Navbar;
