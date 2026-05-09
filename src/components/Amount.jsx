import React from 'react';
import { useSettings } from '../contexts/SettingsContext';

/**
 * Reusable component to display financial amounts.
 * Automatically masks the value if Privacy Mode is enabled.
 */
const Amount = ({ 
    value, 
    showCurrency = true, 
    className = "", 
    minimumFractionDigits = 2, 
    maximumFractionDigits = 2,
    style = "decimal", // "decimal" or "currency"
    prefix = "",
    showSign = true
}) => {
    const { privacyMode, currency, language } = useSettings();

    if (privacyMode) {
        return <span className={className}>{prefix}****</span>;
    }

    const locale = language === 'el' ? 'el-GR' : 'en-US';
    
    try {
        const displayValue = showSign ? value : Math.abs(value);
        const formatted = new Intl.NumberFormat(locale, {
            style: style,
            currency: style === 'currency' ? (currency === '€' ? 'EUR' : currency) : undefined,
            minimumFractionDigits,
            maximumFractionDigits,
        }).format(displayValue);

        return (
            <span className={className}>
                {prefix}{formatted}{style === 'decimal' && showCurrency && ` ${currency}`}
            </span>
        );
    } catch (e) {
        // Fallback if Intl fails
        const val = showSign ? value : Math.abs(value);
        return <span className={className}>{prefix}{val.toFixed(2)}{showCurrency && ` ${currency}`}</span>;
    }
};

export default Amount;









