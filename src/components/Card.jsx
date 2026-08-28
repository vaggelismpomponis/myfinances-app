import React from 'react';

const Card = ({ children, className = "" }) => (
    <div className={`bg-[#f5f5f5] dark:bg-white/[0.04] rounded-[20px] p-5 transition-colors duration-300 ${className}`}>
        {children}
    </div>
);

export default Card;









