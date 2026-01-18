import React from 'react';
import { Wallet, Landmark, Banknote, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const ICONS = {
    wallet: Wallet,
    bank: Landmark,
    cash: Banknote,
    card: CreditCard,
};

const AccountCard = ({ account }) => {
    const { currency } = useSettings();
    const Icon = ICONS[account.type] || Wallet;

    // Use inline style for dynamic color to avoid massive Tailwind safelist
    const iconStyle = { color: account.color };
    const bgStyle = { backgroundColor: `${account.color}15` }; // 15 = ~8% opacity hex

    return (
        <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between group hover:border-indigo-100 dark:hover:border-indigo-900 transition-colors">
            <div className="flex items-center gap-4">
                <div
                    className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                    style={bgStyle}
                >
                    <Icon size={24} style={iconStyle} />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{account.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm capitalize">
                        {account.type === 'bank' ? 'Τράπεζα' :
                            account.type === 'cash' ? 'Μετρητά' :
                                account.type === 'card' ? 'Κάρτα' : 'Ποροφόλι'}
                    </p>
                </div>
            </div>

            <div className="text-right">
                <span className="block text-lg font-bold text-gray-900 dark:text-white font-mono">
                    {currency} {account.balance?.toLocaleString('el-GR', { minimumFractionDigits: 2 })}
                </span>
            </div>
        </div>
    );
};

export default AccountCard;
