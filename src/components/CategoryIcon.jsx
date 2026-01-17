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
    MoreHorizontal
} from 'lucide-react';

const CategoryIcon = ({ category, type }) => {
    const icons = {
        'Φαγητό': Coffee,
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
        <div className={`p-3 rounded-full ${type === 'expense' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
            <IconComponent size={20} />
        </div>
    );
};

export default CategoryIcon;
