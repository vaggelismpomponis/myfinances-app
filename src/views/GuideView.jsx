import { useState } from 'react';
import {
    ArrowLeft, BookOpen, Target, BarChart,
    Camera, Repeat, ShieldCheck, Sparkles,
    ChevronRight, Wallet, PieChart, Layers,
    Plus, BarChart2, ArrowRight, Rocket
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

/* ─────────────────────────────────────────────
   Getting Started — onboarding steps data
───────────────────────────────────────────── */
const GETTING_STARTED_STEPS = [
    {
        titleKey: 'onboarding_welcome_title',
        descKey: 'onboarding_welcome_desc',
        Icon: Wallet,
        gradient: 'from-violet-600 via-indigo-600 to-purple-700',
        iconBg: 'bg-violet-100 dark:bg-violet-500/15',
        iconColor: 'text-violet-600 dark:text-violet-400',
    },
    {
        titleKey: 'onboarding_transactions_title',
        descKey: 'onboarding_transactions_desc',
        Icon: Plus,
        gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
        iconBg: 'bg-emerald-100 dark:bg-emerald-500/15',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
        titleKey: 'onboarding_budgets_title',
        descKey: 'onboarding_budgets_desc',
        Icon: Target,
        gradient: 'from-amber-500 via-orange-500 to-rose-500',
        iconBg: 'bg-amber-100 dark:bg-amber-500/15',
        iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
        titleKey: 'onboarding_analytics_title',
        descKey: 'onboarding_analytics_desc',
        Icon: BarChart2,
        gradient: 'from-blue-600 via-indigo-500 to-violet-600',
        iconBg: 'bg-blue-100 dark:bg-blue-500/15',
        iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
        titleKey: 'onboarding_security_title',
        descKey: 'onboarding_security_desc',
        Icon: ShieldCheck,
        gradient: 'from-rose-500 via-pink-500 to-fuchsia-600',
        iconBg: 'bg-rose-100 dark:bg-rose-500/15',
        iconColor: 'text-rose-600 dark:text-rose-400',
    },
];

/* ─────────────────────────────────────────────
   Getting Started Card
───────────────────────────────────────────── */
const GettingStarted = ({ translate }) => {
    const [activeStep, setActiveStep] = useState(0);
    const step = GETTING_STARTED_STEPS[activeStep];

    return (
        <div className="bg-white dark:bg-white/[0.04] rounded-2xl border border-gray-100 dark:border-transparent shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
                    <Rocket size={20} className="text-white" />
                </div>
                <div>
                    <h3 className="text-[15px] font-bold text-gray-900 dark:text-white leading-tight">
                        {translate('guide_getting_started') || 'Getting Started'}
                    </h3>
                    <p className="text-[11px] text-gray-400 dark:text-white/40 mt-0.5">
                        {translate('guide_getting_started_desc') || 'Quick walkthrough of the key features'}
                    </p>
                </div>
            </div>

            {/* Step dots */}
            <div className="px-5 flex items-center gap-1.5 mb-3">
                {GETTING_STARTED_STEPS.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveStep(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                            i === activeStep
                                ? 'w-6 bg-violet-500'
                                : 'w-1.5 bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20'
                        }`}
                    />
                ))}
                <span className="ml-auto text-[10px] text-gray-400 dark:text-white/30 font-semibold tabular-nums">
                    {activeStep + 1}/{GETTING_STARTED_STEPS.length}
                </span>
            </div>

            {/* Active step card */}
            <div className="px-5 pb-4">
                <div className={`bg-gradient-to-br ${step.gradient} rounded-xl p-4 relative overflow-hidden`}>
                    {/* Decorative orbs */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/10 blur-lg" />

                    <div className="relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3 ring-1 ring-white/20">
                            <step.Icon size={24} className="text-white" strokeWidth={1.8} />
                        </div>
                        <h4 className="text-[15px] font-bold text-white mb-1.5">
                            {translate(step.titleKey)}
                        </h4>
                        <p className="text-[12.5px] text-white/80 leading-relaxed font-medium">
                            {translate(step.descKey)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation buttons */}
            <div className="px-5 pb-4 flex items-center gap-2">
                <button
                    onClick={() => setActiveStep(s => Math.max(0, s - 1))}
                    disabled={activeStep === 0}
                    className="w-9 h-9 rounded-xl flex items-center justify-center
                               bg-gray-100 dark:bg-white/[0.07]
                               text-gray-500 dark:text-white/50
                               hover:bg-gray-200 dark:hover:bg-white/[0.12]
                               disabled:opacity-30 disabled:pointer-events-none
                               active:scale-90 transition-all duration-150"
                >
                    <ArrowLeft size={14} strokeWidth={2.5} />
                </button>
                <button
                    onClick={() => {
                        if (activeStep < GETTING_STARTED_STEPS.length - 1) {
                            setActiveStep(s => s + 1);
                        } else {
                            setActiveStep(0);
                        }
                    }}
                    className={`flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5
                               font-semibold text-[12px] text-white
                               bg-gradient-to-r ${step.gradient}
                               active:scale-[0.98] transition-all duration-150
                               shadow-sm`}
                >
                    <span>
                        {activeStep === GETTING_STARTED_STEPS.length - 1
                            ? (translate('guide_restart_tour') || 'Restart Tour')
                            : (translate('onboarding_next') || 'Next')}
                    </span>
                    <ArrowRight size={13} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    );
};

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

const GuideView = ({ onBack, hideHeader }) => {
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
            <div className={`shrink-0 transition-colors duration-300 sticky top-0 z-20
                            ${hideHeader 
                                ? 'bg-transparent border-none px-4 pt-4 pb-2' 
                                : 'bg-gray-50 dark:bg-surface-dark backdrop-blur-xl border-b border-gray-100 dark:border-transparent px-4 pb-3'}`}
                style={!hideHeader ? { paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' } : {}}
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
                    {!hideHeader && (
                        <div className="text-center">
                            <h1 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">
                                {translate('user_guide') || 'User Guide'}
                            </h1>
                            <p className="text-[11px] text-gray-400 dark:text-white/50 leading-none mt-0.5">
                                Everything you need to know
                            </p>
                        </div>
                    )}
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
                                <img src="/spendwise-logo.png" alt="SpendWise" className="w-5 h-5 rounded-md object-contain" />
                                <span className="text-[11px] font-bold uppercase tracking-wider text-violet-100">Welcome to SpendWise</span>
                            </div>
                            <h2 className="text-xl font-bold mb-2">{translate('guide_intro_title')}</h2>
                            <p className="text-sm text-violet-100/80 leading-relaxed font-medium">
                                {translate('guide_intro_desc')}
                            </p>
                        </div>
                    </div>

                    {/* Getting Started — onboarding walkthrough */}
                    <GettingStarted translate={translate} />

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









