import React from 'react';
import {
    Coffee,
    ShoppingBag,
    Home as HomeIcon,
    Car,
    Smartphone,
    Gift,
    Wallet,
    TrendingUp,
    MoreHorizontal,
    Utensils
} from 'lucide-react';

const CategoryIcon = ({ category, type }) => {
    const icons = {
        'Καφές': Coffee,
        'Φαγητό': Utensils,
        'Σούπερ Μάρκετ': ShoppingBag,
        'Σπίτι': HomeIcon,
        'Μεταφορικά': Car,
        'Λογαριασμοί': Smartphone,
        'Διασκέδαση': Gift,
        'Μισθός': Wallet,
        'Δώρο': Gift,
        'Επενδύσεις': TrendingUp,
        'Άλλο': MoreHorizontal
    };

    const IconComponent = icons[category] || MoreHorizontal;

    return (
        <div className={`p-3 rounded-full ${type === 'expense'
            ? 'bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400'
            : 'bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400'}`}>
            <IconComponent size={20} />
        </div>
    );
};

export default CategoryIcon;
