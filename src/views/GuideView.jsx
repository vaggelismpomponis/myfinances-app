import {
    ArrowLeft, BookOpen, Target, BarChart,
    Camera, Repeat, ShieldCheck, Sparkles,
    ChevronRight, Wallet, PieChart, Layers
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const Section = ({ icon: Icon, title, description, items, color, bg }) => (
    <div className="bg-white dark:bg-white/[0.04] rounded-2xl p-5 border border-gray-100 dark:border-transparent shadow-sm">
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon size={20} className={color} />
            </div>
            <div>
                <h3 className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight">
                    {title}
                </h3>
            </div>
        </div>
        <p className="text-[13px] text-gray-500 dark:text-white/60 mb-4 leading-relaxed">
            {description}
        </p>
        <div className="space-y-3">
            {items.map((item, i) => (
                <div key={i} className="flex gap-3">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                    <span className="text-[12.5px] text-gray-600 dark:text-white/60 leading-snug">
                        {item}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

const GuideView = ({ onBack }) => {
    const { t: translate } = useSettings();

    const sections = [
        {
            icon: Wallet,
            title: translate('nav_home') || 'Home & Transactions',
            description: translate('guide_home_desc'),
            items: [
                translate('guide_home_1'),
                translate('guide_home_2'),
                translate('guide_home_3')
            ],
            color: 'text-violet-500',
            bg: 'bg-violet-50 dark:bg-violet-500/10'
        },
        {
            icon: Camera,
            title: translate('scan') || 'AI Scanner',
            description: translate('guide_scan_desc'),
            items: [
                translate('guide_scan_1'),
                translate('guide_scan_2'),
                translate('guide_scan_3')
            ],
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-500/10'
        },
        {
            icon: PieChart,
            title: translate('budgets') || 'Budgets & Limits',
            description: translate('guide_budgets_desc'),
            items: [
                translate('guide_budgets_1'),
                translate('guide_budgets_2'),
                translate('guide_budgets_3')
            ],
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-500/10'
        },
        {
            icon: Target,
            title: translate('goals') || 'Savings Goals',
            description: translate('guide_goals_desc'),
            items: [
                translate('guide_goals_1'),
                translate('guide_goals_2'),
                translate('guide_goals_3')
            ],
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-500/10'
        },
        {
            icon: Repeat,
            title: translate('recurring_transactions') || 'Recurring Payments',
            description: translate('guide_recurring_desc'),
            items: [
                translate('guide_recurring_1'),
                translate('guide_recurring_2'),
                translate('guide_recurring_3')
            ],
            color: 'text-indigo-500',
            bg: 'bg-indigo-50 dark:bg-indigo-500/10'
        },
        {
            icon: Sparkles,
            title: translate('nav_advisor') || 'Financial Advisor',
            description: translate('guide_advisor_desc'),
            items: [
                translate('guide_advisor_1'),
                translate('guide_advisor_2'),
                translate('guide_advisor_3')
            ],
            color: 'text-fuchsia-500',
            bg: 'bg-fuchsia-50 dark:bg-fuchsia-500/10'
        },
        {
            icon: ShieldCheck,
            title: translate('security') || 'Privacy & Security',
            description: translate('guide_security_desc'),
            items: [
                translate('guide_security_1'),
                translate('guide_security_2'),
                translate('guide_security_3')
            ],
            color: 'text-rose-500',
            bg: 'bg-rose-50 dark:bg-rose-500/10'
        }
    ];

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300 overflow-hidden">
            {/* ─────── Sticky Header ─────── */}
            <div className="shrink-0 sticky top-0 z-20 
                            bg-gray-50/90 dark:bg-surface-dark/90 
                            backdrop-blur-xl 
                            border-b border-gray-200/60 dark:border-transparent
                            px-4 pb-3 transition-colors duration-300"
                style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
            >
                <div className="flex items-center justify-center relative min-h-[36px]">
                    <button
                        onClick={onBack}
                        className="absolute left-0 w-8 h-8 rounded-full 
                                   bg-gray-100 dark:bg-white/[0.07]
                                   flex items-center justify-center
                                   text-gray-500 dark:text-white/50
                                   hover:bg-gray-200 dark:hover:bg-white/[0.12]
                                   active:scale-90 transition-all duration-150"
                    >
                        <ArrowLeft size={15} strokeWidth={2.5} />
                    </button>
                    <div className="text-center">
                        <h1 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">
                            {translate('user_guide') || 'User Guide'}
                        </h1>
                        <p className="text-[11px] text-gray-400 dark:text-white/50 leading-none mt-0.5">
                            Everything you need to know
                        </p>
                    </div>
                </div>
            </div>

            {/* ─────── Content ─────── */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 pb-12 space-y-4">

                    {/* Intro Card */}
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <BookOpen size={100} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={16} className="text-violet-200" />
                                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-100">Welcome to SpendWise</span>
                            </div>
                            <h2 className="text-xl font-bold mb-2">{translate('guide_intro_title')}</h2>
                            <p className="text-sm text-violet-100/80 leading-relaxed font-medium">
                                {translate('guide_intro_desc')}
                            </p>
                        </div>
                    </div>

                    {/* Guide Sections */}
                    {sections.map((section, idx) => (
                        <Section key={idx} {...section} />
                    ))}

                    {/* Footer */}
                    <div className="flex flex-col items-center gap-2 pt-6 pb-4">
                        <div className="w-12 h-1 bg-gray-200 dark:bg-white/10 rounded-full mb-2" />
                        <p className="text-[11px] text-gray-400 dark:text-white/40 text-center px-8 leading-relaxed">
                            Need more help? Send us your thoughts in the <b>Feedback</b> section.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GuideView;









