import React from 'react';

const Card = ({ children, className = "" }) => (
    <div className={`bg-white dark:bg-surface-dark2 rounded-2xl shadow-card dark:shadow-card-dark border border-gray-200/80 dark:border-white/[0.06] p-5 transition-colors duration-300 ${className}`}>
        {children}
    </div>
);

export default Card;









