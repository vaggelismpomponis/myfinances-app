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
    Package,
    Utensils,
    Gamepad2,
    MoreHorizontal
} from 'lucide-react';

const CategoryIcon = ({ category, type }) => {
    const icons = {
        'Καφές': Coffee,
        'Φαγητό': Utensils,
        'Σούπερ Μάρκετ': ShoppingCart,
        'Σπίτι': HomeIcon,
        'Μεταφορικά': Car,
        'Λογαριασμοί': Receipt,
        'Διασκέδαση': Gamepad2,
        'Μισθός': Banknote,
        'Δώρο': Gift,
        'Επενδύσεις': LineChart,
        'Άλλο': Package
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









