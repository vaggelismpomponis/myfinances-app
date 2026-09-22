import React from 'react';
import {
    Coffee,
    ShoppingCart,
    Home as HomeIcon,
    Car,
    Receipt,
    Gift,
    Banknote,
    LineChart,
    Shapes,
    Utensils,
    Martini,
    MoreHorizontal,
    Fuel,
    HeartPulse
} from 'lucide-react';

export const CATEGORY_ACCENT = {
    food:        '#f59e0b',
    shopping:    '#ec4899',
    transport:   '#3b82f6',
    bills:       '#8b5cf6',
    health:      '#10b981',
    entertainment: '#06b6d4',
    education:   '#6366f1',
    salary:      '#10b981',
    investment:  '#f59e0b',
    gift:        '#ec4899',
    fuel:        '#ef4444',
    health:      '#0ea5e9',
    other:       '#9ca3af',
    
    // Greek mapping
    'καφές':        '#f59e0b',
    'φαγητό':       '#f59e0b',
    'σούπερ μάρκετ': '#ec4899',
    'σπίτι':        '#8b5cf6',
    'μεταφορικά':   '#3b82f6',
    'λογαριασμοί':  '#8b5cf6',
    'διασκέδαση':   '#06b6d4',
    'βενζίνη':      '#ef4444',
    'υγεία':        '#0ea5e9',
    'μισθός':       '#10b981',
    'δώρο':         '#ec4899',
    'επενδύσεις':   '#10b981',
    'άλλο':         '#9ca3af',
    'άλλα έσοδα':   '#9ca3af'
};

const CategoryIcon = ({ category, type }) => {
    const icons = {
        'Καφές': Coffee,
        'Φαγητό': Utensils,
        'Σούπερ Μάρκετ': ShoppingCart,
        'Σπίτι': HomeIcon,
        'Μεταφορικά': Car,
        'Λογαριασμοί': Receipt,
        'Διασκέδαση': Martini,
        'Βενζίνη': Fuel,
        'Υγεία': HeartPulse,
        'Μισθός': Banknote,
        'Δώρο': Gift,
        'Επενδύσεις': LineChart,
        'Άλλο': Shapes,
        'Άλλα Έσοδα': Shapes
    };

    const IconComponent = icons[category] || MoreHorizontal;
    const accentHex = CATEGORY_ACCENT[category?.toLowerCase()] || (type === 'income' ? '#10b981' : '#f43f5e');

    return (
        <div 
            className="p-2.5 md:p-3 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-300 shadow-sm"
            style={{ 
                backgroundColor: `${accentHex}15`, 
                color: accentHex,
                border: `1px solid ${accentHex}25` 
            }}
        >
            <div className="absolute inset-0 opacity-20 blur-xl" style={{ backgroundColor: accentHex }} />
            <IconComponent size={20} className="relative z-10" />
        </div>
    );
};

export default CategoryIcon;









