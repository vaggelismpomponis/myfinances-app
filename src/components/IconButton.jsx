import React from 'react';

const IconButton = ({ icon: Icon, onClick, active, label }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center space-y-1 w-full py-2 transition-colors ${active ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
            }`}
    >
        <Icon size={24} strokeWidth={active ? 2.5 : 2} />
        <span className="text-[10px] font-medium">{label}</span>
    </button>
);

export default IconButton;
