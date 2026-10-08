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
    'αγορές':       '#ec4899',
    'αγορες':       '#ec4899',
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

const CATEGORY_ICONS = {
    // Greek
    'καφές': Coffee,
    'φαγητό': Utensils,
    'σούπερ μάρκετ': ShoppingCart,
    'αγορές': ShoppingCart,
    'αγορες': ShoppingCart,
    'σπίτι': HomeIcon,
    'μεταφορικά': Car,
    'λογαριασμοί': Receipt,
    'διασκέδαση': Martini,
    'βενζίνη': Fuel,
    'υγεία': HeartPulse,
    'μισθός': Banknote,
    'δώρο': Gift,
    'επενδύσεις': LineChart,
    'άλλο': Shapes,
    'άλλα έσοδα': Shapes,
    // English
    'coffee': Coffee,
    'food': Utensils,
    'supermarket': ShoppingCart,
    'shopping': ShoppingCart,
    'home': HomeIcon,
    'transport': Car,
    'car': Car,
    'bills': Receipt,
    'receipt': Receipt,
    'entertainment': Martini,
    'fuel': Fuel,
    'gas': Fuel,
    'health': HeartPulse,
    'salary': Banknote,
    'gift': Gift,
    'investments': LineChart,
    'investment': LineChart,
    'other': Shapes,
    'other_income': Shapes
};

const CategoryIcon = ({ category, type, size = 20 }) => {
    const key = category?.trim()?.toLowerCase() || '';
    const IconComponent = CATEGORY_ICONS[key] || MoreHorizontal;
    const accentHex = CATEGORY_ACCENT[key] || (type === 'income' ? '#10b981' : '#f43f5e');

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
            <IconComponent size={size} className="relative z-10" />
        </div>
    );
};

export default CategoryIcon;









