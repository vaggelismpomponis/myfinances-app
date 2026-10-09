import React, { useState, useMemo } from 'react';
import {
    ArrowLeft,
    BookOpen,
    Target,
    Camera,
    Repeat,
    ShieldCheck,
    Wallet,
    PieChart,
    Rocket,
    ArrowRight,
    ArrowUpRight,
    Search,
    X,
    CheckCircle2,
    Lightbulb,
    SearchX,
    Zap,
    MessageSquare,
    RotateCcw
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import ViewHeader from '../components/ViewHeader';
import DesktopBreadcrumb from '../components/DesktopBreadcrumb';

const GuideView = ({ onBack, hideHeader, onStartTour, onNavigate }) => {
    const { t: translate } = useSettings();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const sections = useMemo(() => [
        {
            id: 'home',
            tab: 'home',
            category: 'core',
            badge: translate('guide_badge_transactions') || 'Transactions',
            icon: Wallet,
            title: translate('nav_home') || 'Home & Transactions',
            description: translate('guide_home_desc') || 'The foundation of SpendWise. Track every transaction with ease.',
            items: [
                translate('guide_home_1') || 'Add new income or expenses using the + button.',
                translate('guide_home_2') || 'View your daily, weekly, and monthly balance at a glance.',
                translate('guide_home_3') || 'Categorize transactions to understand where your money goes.'
            ],
            proTip: translate('guide_tip_home') || 'Long-press the + button for instant access to income or expense logging.',
            theme: {
                text: 'text-violet-600 dark:text-violet-400',
                badgeBg: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 border-violet-200/60 dark:border-violet-500/20',
                iconBox: 'bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300 border border-violet-500/20',
                button: 'hover:bg-violet-50 text-violet-600 dark:hover:bg-violet-500/20 dark:text-violet-300',
                proTipBg: 'bg-violet-50/60 dark:bg-violet-950/20 border-violet-100 dark:border-violet-900/30'
            }
        },
        {
            id: 'scan',
            tab: 'add',
            category: 'core',
            badge: translate('guide_badge_scanner') || 'Smart OCR',
            icon: Camera,
            title: translate('scan') || 'AI Receipt Scanner',
            description: translate('guide_scan_desc') || 'Save time by scanning your physical receipts.',
            items: [
                translate('guide_scan_1') || 'Use "Scan" for a single receipt or "Bulk" for multiple.',
                translate('guide_scan_2') || 'AI automatically extracts date, amount, and category.',
                translate('guide_scan_3') || 'Confirm the details and save with one tap.'
            ],
            proTip: translate('guide_tip_scan') || 'OCR automatically extracts merchant, amount, category, and receipt date.',
            theme: {
                text: 'text-emerald-600 dark:text-emerald-400',
                badgeBg: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-500/20',
                iconBox: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-500/20',
                button: 'hover:bg-emerald-50 text-emerald-600 dark:hover:bg-emerald-500/20 dark:text-emerald-300',
                proTipBg: 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30'
            }
        },
        {
            id: 'budgets',
            tab: 'budgets',
            category: 'planning',
            badge: translate('guide_badge_budgets') || 'Spending Limits',
            icon: PieChart,
            title: translate('budgets') || 'Budgets & Limits',
            description: translate('guide_budgets_desc') || 'Stay within your limits and avoid overspending.',
            items: [
                translate('guide_budgets_1') || 'Set monthly limits for specific categories.',
                translate('guide_budgets_2') || 'Enable notifications to get alerted when you reach a % threshold.',
                translate('guide_budgets_3') || 'Visualize your spending progress with real-time bars.'
            ],
            proTip: translate('guide_tip_budgets') || 'Set threshold alerts at 80% to receive proactive warnings before overspending.',
            theme: {
                text: 'text-amber-600 dark:text-amber-400',
                badgeBg: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-200/60 dark:border-amber-500/20',
                iconBox: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-500/20',
                button: 'hover:bg-amber-50 text-amber-600 dark:hover:bg-amber-500/20 dark:text-amber-300',
                proTipBg: 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30'
            }
        },
        {
            id: 'goals',
            tab: 'goals',
            category: 'planning',
            badge: translate('guide_badge_goals') || 'Savings Goals',
            icon: Target,
            title: translate('goals') || 'Savings Goals',
            description: translate('guide_goals_desc') || 'Save for what matters most.',
            items: [
                translate('guide_goals_1') || 'Create specific goals with target amounts.',
                translate('guide_goals_2') || 'Deposit savings directly into each goal.',
                translate('guide_goals_3') || 'Track progress circles to stay motivated.'
            ],
            proTip: translate('guide_tip_goals') || 'Set a target date to calculate the required monthly savings pace.',
            theme: {
                text: 'text-blue-600 dark:text-blue-400',
                badgeBg: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border-blue-200/60 dark:border-blue-500/20',
                iconBox: 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-500/20',
                button: 'hover:bg-blue-50 text-blue-600 dark:hover:bg-blue-500/20 dark:text-blue-300',
                proTipBg: 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30'
            }
        },
        {
            id: 'recurring',
            tab: 'recurring',
            category: 'core',
            badge: translate('guide_badge_recurring') || 'Automation',
            icon: Repeat,
            title: translate('recurring_transactions') || 'Recurring Payments',
            description: translate('guide_recurring_desc') || 'Never forget a bill or subscription again.',
            items: [
                translate('guide_recurring_1') || 'Add monthly rent, Netflix, or gym memberships.',
                translate('guide_recurring_2') || 'The app will automatically log them on the set day.',
                translate('guide_recurring_3') || 'See your future cash flow in the recurring dashboard.'
            ],
            proTip: translate('guide_tip_recurring') || 'Recurring transactions post automatically to your balance on due dates.',
            theme: {
                text: 'text-indigo-600 dark:text-indigo-400',
                badgeBg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-500/20',
                iconBox: 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300 border border-indigo-500/20',
                button: 'hover:bg-indigo-50 text-indigo-600 dark:hover:bg-indigo-500/20 dark:text-indigo-300',
                proTipBg: 'bg-indigo-50/60 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30'
            }
        },
        {
            id: 'advisor',
            tab: 'advisor',
            category: 'smart',
            badge: translate('guide_badge_advisor') || 'AI Insights',
            icon: Lightbulb,
            title: translate('nav_advisor') || 'Financial Advisor',
            description: translate('guide_advisor_desc') || 'Personalized insights based on your habits.',
            items: [
                translate('guide_advisor_1') || 'Uses the 50-30-20 rule to evaluate your health.',
                translate('guide_advisor_2') || 'Provides tips on how to save more effectively.',
                translate('guide_advisor_3') || 'Calculates your wellness score based on historical data.'
            ],
            proTip: translate('guide_advisor_tip') || 'Applies the 50/30/20 financial rule to evaluate your fiscal wellness in real time.',
            theme: {
                text: 'text-fuchsia-600 dark:text-fuchsia-400',
                badgeBg: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300 border-fuchsia-200/60 dark:border-fuchsia-500/20',
                iconBox: 'bg-fuchsia-500/10 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-300 border border-fuchsia-500/20',
                button: 'hover:bg-fuchsia-50 text-fuchsia-600 dark:hover:bg-fuchsia-500/20 dark:text-fuchsia-300',
                proTipBg: 'bg-fuchsia-50/60 dark:bg-fuchsia-950/20 border-fuchsia-100 dark:border-fuchsia-900/30'
            }
        },
        {
            id: 'security',
            tab: 'security',
            category: 'smart',
            badge: translate('guide_badge_security') || 'Data Privacy',
            icon: ShieldCheck,
            title: translate('security') || 'Privacy & Security',
            description: translate('guide_security_desc') || 'Your financial data is protected and private.',
            items: [
                translate('guide_security_1') || 'Enable App PIN or Biometrics for local protection.',
                translate('guide_security_2') || 'Hide content from the application switcher.',
                translate('guide_security_3') || 'Create encrypted backups of your data at any time.'
            ],
            proTip: translate('guide_tip_security') || 'Enable biometric locks and create encrypted JSON backups at any time.',
            theme: {
                text: 'text-rose-600 dark:text-rose-400',
                badgeBg: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300 border-rose-200/60 dark:border-rose-500/20',
                iconBox: 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-500/20',
                button: 'hover:bg-rose-50 text-rose-600 dark:hover:bg-rose-500/20 dark:text-rose-300',
                proTipBg: 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30'
            }
        }
    ], [translate]);

    const categories = [
        { id: 'all', label: translate('guide_filter_all') || 'All Guides', count: sections.length },
        { id: 'core', label: translate('guide_filter_core') || 'Core Tracking', count: sections.filter(s => s.category === 'core').length },
        { id: 'planning', label: translate('guide_filter_planning') || 'Budgets & Goals', count: sections.filter(s => s.category === 'planning').length },
        { id: 'smart', label: translate('guide_filter_smart') || 'AI & Security', count: sections.filter(s => s.category === 'smart').length },
    ];

    const filteredSections = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        return sections.filter(section => {
            const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
            if (!matchesCategory) return false;
            if (!query) return true;

            const inTitle = section.title.toLowerCase().includes(query);
            const inDesc = section.description.toLowerCase().includes(query);
            const inBadge = section.badge.toLowerCase().includes(query);
            const inProTip = section.proTip.toLowerCase().includes(query);
            const inItems = section.items.some(item => item.toLowerCase().includes(query));

            return inTitle || inDesc || inBadge || inProTip || inItems;
        });
    }, [sections, selectedCategory, searchQuery]);

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300 overflow-hidden">
            {/* ─────── Mobile Sticky Header ─────── */}
            <ViewHeader
                onBack={onBack}
                title={translate('user_guide') || 'User Guide'}
                subtitle="SpendWise Knowledge Base"
                hideHeader={hideHeader}
            />

            {/* ─────── Main Scroll Container ─────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 space-y-6">

                    {/* Desktop Navigation Breadcrumb Bar */}
                    <DesktopBreadcrumb
                        onBack={onBack}
                        backLabel={translate('guide_back_to_settings') || 'Back to Settings'}
                        hideHeader={hideHeader}
                    />

                    {/* ─────── Hero Hub ─────── */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 dark:from-violet-950 dark:via-indigo-950 dark:to-surface-dark3 border border-violet-400/30 dark:border-white/10 shadow-xl shadow-violet-500/15 text-white p-6 sm:p-8 lg:p-10">
                        {/* Ambient decorative glowing backdrop lights */}
                        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
                        <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
                            <BookOpen size={180} strokeWidth={1} />
                        </div>

                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                            <div className="max-w-2xl space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-violet-100 tracking-wide uppercase">
                                    <BookOpen size={13} />
                                    <span>SpendWise Manual</span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                                    {translate('guide_intro_title') || 'Master your finances'}
                                </h2>
                                <p className="text-sm sm:text-base text-violet-100/90 leading-relaxed font-medium">
                                    {translate('guide_intro_desc') || 'This guide covers all the powerful features of SpendWise to help you achieve financial freedom.'}
                                </p>

                                {/* Quick Attribute Chips */}
                                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-violet-100/90">
                                    <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                                        7 Feature Modules
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                                        AI OCR Scanning
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                                        50-30-20 Advisor
                                    </span>
                                    <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                                        Bank-Grade Privacy
                                    </span>
                                </div>
                            </div>

                            {/* Integrated Interactive Tour Launch Card */}
                            {onStartTour && (
                                <div className="lg:max-w-xs w-full shrink-0">
                                    <button
                                        id="guide-start-tour-btn"
                                        onClick={onStartTour}
                                        className="w-full text-left p-5 rounded-2xl bg-white/15 hover:bg-white/20 dark:bg-white/10 dark:hover:bg-white/15 backdrop-blur-md border border-white/25 active:scale-[0.98] transition-all duration-200 group shadow-lg"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="w-10 h-10 rounded-xl bg-white text-violet-700 flex items-center justify-center font-bold shadow-md shadow-black/10 group-hover:scale-105 transition-transform">
                                                <Rocket size={20} />
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-bold text-violet-100 group-hover:text-white transition-colors">
                                                <span>{translate('guide_explore_feature') || 'Launch'}</span>
                                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                        <p className="text-[15px] font-extrabold text-white leading-tight">
                                            {translate('tour_start_interactive') || 'Start the Interactive Tour'}
                                        </p>
                                        <p className="text-xs text-violet-100/80 mt-1 font-medium">
                                            60 sec &bull; 5 steps &bull; guided walkthrough
                                        </p>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─────── Search & Category Filter Toolbar ─────── */}
                    <div className="space-y-4 pt-1">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            {/* Search Input */}
                            <div className="relative flex-1 max-w-lg">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={translate('guide_search_placeholder') || 'Search guides, features, or tips...'}
                                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 shadow-sm transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        aria-label="Clear search"
                                    >
                                        <X size={15} />
                                    </button>
                                )}
                            </div>

                            {/* Section Count Indicator */}
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 self-end sm:self-center px-1">
                                {filteredSections.length} / {sections.length} {translate('guide_filter_all') || 'Guides'}
                            </div>
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar scrollbar-none">
                            {categories.map((cat) => {
                                const isActive = selectedCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 ${
                                            isActive
                                                ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                                                : 'bg-white dark:bg-surface-dark2 text-gray-600 dark:text-gray-300 border border-gray-200/70 dark:border-white/[0.06] hover:bg-gray-100 dark:hover:bg-white/[0.05]'
                                        }`}
                                    >
                                        <span>{cat.label}</span>
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                                            isActive
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gray-100 dark:bg-white/[0.08] text-gray-500 dark:text-gray-400'
                                        }`}>
                                            {cat.count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* ─────── Feature Cards Grid ─────── */}
                    {filteredSections.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {filteredSections.map((section) => {
                                const Icon = section.icon;
                                return (
                                    <div
                                        key={section.id}
                                        className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-lg dark:hover:border-violet-500/30 transition-all duration-200 flex flex-col justify-between group"
                                    >
                                        {/* Card Top: Icon, Badge, and Action */}
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${section.theme.iconBox}`}>
                                                        <Icon size={22} strokeWidth={2.2} />
                                                    </div>
                                                    <div>
                                                        <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${section.theme.badgeBg}`}>
                                                            {section.badge}
                                                        </span>
                                                        <h3 className="text-base font-extrabold text-gray-900 dark:text-white leading-tight mt-1">
                                                            {section.title}
                                                        </h3>
                                                    </div>
                                                </div>

                                                {onNavigate && (
                                                    <button
                                                        onClick={() => onNavigate(section.tab)}
                                                        className={`p-2 rounded-xl transition-all duration-150 shrink-0 ${section.theme.button}`}
                                                        title={`${translate('guide_explore_feature') || 'Open'} ${section.title}`}
                                                    >
                                                        <ArrowUpRight size={17} strokeWidth={2.3} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Description */}
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                                                {section.description}
                                            </p>

                                            {/* Feature Highlights */}
                                            <div className="space-y-2.5 mb-5">
                                                {section.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-start gap-2.5">
                                                        <div className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5 text-gray-600 dark:text-gray-300">
                                                            <CheckCircle2 size={12} strokeWidth={2.5} className={section.theme.text} />
                                                        </div>
                                                        <p className="text-[12px] text-gray-700 dark:text-gray-300 leading-snug">
                                                            {item}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Pro Tip Callout */}
                                        <div className={`p-3 rounded-2xl border flex items-start gap-2.5 ${section.theme.proTipBg}`}>
                                            <Lightbulb size={15} strokeWidth={2.2} className={`shrink-0 mt-0.5 ${section.theme.text}`} />
                                            <div>
                                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                    {translate('guide_pro_tip') || 'Pro Tip'}
                                                </p>
                                                <p className="text-[11.5px] font-medium text-gray-700 dark:text-gray-300 leading-snug mt-0.5">
                                                    {section.proTip}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Empty State when Search has no matches */
                        <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-10 text-center space-y-4">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mx-auto text-gray-400">
                                <SearchX size={28} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                    {translate('guide_search_no_results') || 'No guides found for your search'}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {searchQuery ? `"${searchQuery}"` : ''}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('all');
                                }}
                                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-sm"
                            >
                                {translate('guide_search_reset') || 'Reset Search'}
                            </button>
                        </div>
                    )}

                    {/* ─────── Bottom Bento: Productivity Tips & Help ─────── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                        {/* Productivity Shortcuts Card */}
                        <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                        <Zap size={20} strokeWidth={2.3} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                                            {translate('guide_shortcuts_title') || 'Quick Productivity Tips'}
                                        </h4>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                            Speed up your daily finance tracking
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2.5 pt-1">
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                                        <p className="text-xs text-gray-600 dark:text-gray-300">
                                            {translate('guide_shortcuts_1') || 'Long-press the add button for instant income/expense logging shortcuts.'}
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                                        <p className="text-xs text-gray-600 dark:text-gray-300">
                                            {translate('guide_shortcuts_2') || 'Swipe left on any transaction in history to delete or edit quickly.'}
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-2" />
                                        <p className="text-xs text-gray-600 dark:text-gray-300">
                                            {translate('guide_shortcuts_3') || 'Export all your data anytime in encrypted JSON from Settings.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feedback & Assistance Card */}
                        <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                                        <MessageSquare size={20} strokeWidth={2.3} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                                            {translate('guide_feedback_box_title') || 'Need help or have suggestions?'}
                                        </h4>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                            We build SpendWise together with your input
                                        </p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                                    {translate('guide_feedback_box_desc') || 'Send us your ideas, feature requests, or issue reports to improve SpendWise.'}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                {onNavigate && (
                                    <button
                                        onClick={() => onNavigate('feedback')}
                                        className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm shadow-violet-500/20"
                                    >
                                        <MessageSquare size={14} />
                                        <span>{translate('guide_feedback_box_action') || 'Send Feedback'}</span>
                                    </button>
                                )}
                                {onStartTour && (
                                    <button
                                        onClick={onStartTour}
                                        className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.14] text-gray-700 dark:text-gray-200 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                                        title={translate('guide_restart_tour') || 'Restart Tour'}
                                    >
                                        <RotateCcw size={14} />
                                        <span>{translate('guide_restart_tour') || 'Restart Tour'}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Signature */}
                    <div className="text-center pt-4 pb-8">
                        <p className="text-[11px] font-medium text-gray-400 dark:text-white/40">
                            SpendWise &bull; Financial Freedom &bull; Version 2.0
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default GuideView;
