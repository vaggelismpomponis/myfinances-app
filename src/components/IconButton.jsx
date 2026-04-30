import React from 'react';

// Kept for any legacy usage — Navbar no longer uses this directly.
const IconButton = ({ icon: Icon, onClick, active, label }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-2xl
                    transition-all duration-200 active:scale-95
                    ${active
                        ? 'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20'
                        : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400'
                    }`}
    >
        <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
        <span className="text-[10px] font-semibold">{label}</span>
    </button>
);

export default IconButton;









