import React from 'react';

const Card = ({ children, className = "" }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 transition-colors duration-300 ${className}`}>
        {children}
    </div>
);

export default Card;
