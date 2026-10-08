import React, { useState } from 'react';
import {
    ArrowLeft,
    Send,
    MessageSquare,
    Lightbulb,
    Bug,
    Sparkles,
    CheckCircle2,
    ShieldCheck,
    Zap,
    Tag,
    Heart
} from 'lucide-react';
import { supabase } from '../supabase';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';

const FeedbackView = ({ user, onBack, hideHeader }) => {
    const { t: translate } = useSettings();
    const { showToast } = useToast();
    const [message, setMessage] = useState('');
    const [type, setType] = useState('idea'); // 'idea', 'bug', 'other'
    const [selectedTag, setSelectedTag] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSending(true);
        try {
            const finalMessage = selectedTag && !message.includes(`[${selectedTag}]`)
                ? `[${selectedTag}] ${message.trim()}`
                : message.trim();

            const { error } = await supabase
                .from('feedback')
                .insert({
                    user_id: user?.id,
                    message: finalMessage,
                    type: type,
                    email: user?.email,
                    created_at: new Date().toISOString()
                });

            if (error) throw error;

            showToast(translate('feedback_success') || 'Thank you for your feedback!', 'success');
            setMessage('');
            setSelectedTag('');
            setTimeout(onBack, 1500);
        } catch (error) {
            console.error('Feedback error:', error);
            showToast(translate('feedback_error') || 'Failed to send feedback.', 'error');
        } finally {
            setIsSending(false);
        }
    };

    const types = [
        {
            id: 'idea',
            icon: Lightbulb,
            title: translate('idea_title') || 'Feature Idea',
            subtitle: translate('idea_subtitle') || 'Suggest a new tool or improvement',
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/20',
            activeBorder: 'border-amber-400 dark:border-amber-500/50 ring-1 ring-amber-400/30'
        },
        {
            id: 'bug',
            icon: Bug,
            title: translate('bug_title') || 'Bug Report',
            subtitle: translate('bug_subtitle') || 'Report a glitch or error',
            color: 'text-rose-500',
            bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-500/20',
            activeBorder: 'border-rose-400 dark:border-rose-500/50 ring-1 ring-rose-400/30'
        },
        {
            id: 'other',
            icon: MessageSquare,
            title: translate('other_title') || 'General Feedback',
            subtitle: translate('other_subtitle') || 'Questions or thoughts',
            color: 'text-indigo-500',
            bg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200/60 dark:border-indigo-500/20',
            activeBorder: 'border-indigo-400 dark:border-indigo-500/50 ring-1 ring-indigo-400/30'
        },
    ];

    const quickTags = [
        'UI & Design',
        'Receipt Scanner',
        'Budgets & Limits',
        'Savings Goals',
        'Recurring Payments',
        'Performance & Sync'
    ];

    const getPlaceholder = () => {
        if (type === 'idea') {
            return translate('feedback_placeholder_idea') || 'Describe your idea... How would it help you manage your finances better?';
        }
        if (type === 'bug') {
            return translate('feedback_placeholder_bug') || 'What happened? Please describe the steps to reproduce or any error message...';
        }
        return translate('feedback_placeholder_other') || 'Share your questions, impressions, or thoughts with our team...';
    };

    const handleTagClick = (tag) => {
        if (selectedTag === tag) {
            setSelectedTag('');
        } else {
            setSelectedTag(tag);
        }
    };

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col transition-colors duration-300 overflow-hidden">
            {/* ─────── Mobile Sticky Header ─────── */}
            {!hideHeader && (
                <div
                    className="shrink-0 transition-colors duration-300 sticky top-0 z-20 bg-gray-50/90 dark:bg-surface-dark/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.06] px-4 pb-3"
                    style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
                >
                    <div className="flex items-center justify-between min-h-[36px]">
                        <button
                            onClick={onBack}
                            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center text-gray-700 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/[0.14] active:scale-90 transition-all duration-150"
                            aria-label="Back"
                        >
                            <ArrowLeft size={16} strokeWidth={2.5} />
                        </button>
                        <div className="text-center">
                            <h2 className="text-[17px] font-extrabold text-gray-900 dark:text-white leading-tight">
                                {translate('feedback') || 'Feedback & Ideas'}
                            </h2>
                            <p className="text-[11px] font-medium text-gray-500 dark:text-white/50 leading-none mt-0.5">
                                {translate('feedback_desc') || 'Tell us how to improve'}
                            </p>
                        </div>
                        <div className="w-9" />
                    </div>
                </div>
            )}

            {/* ─────── Main Scroll Container ─────── */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 space-y-6">

                    {/* Desktop Navigation Breadcrumb Bar */}
                    {hideHeader && (
                        <div className="flex items-center justify-between pb-1">
                            <button
                                onClick={onBack}
                                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-white/[0.05] border border-gray-200/80 dark:border-white/[0.08] text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.1] active:scale-95 shadow-sm transition-all"
                            >
                                <ArrowLeft size={14} strokeWidth={2.5} />
                                <span>{translate('guide_back_to_settings') || 'Back to Settings'}</span>
                            </button>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-200/60 dark:border-violet-500/20 text-xs font-semibold text-violet-700 dark:text-violet-300">
                                <Sparkles size={13} className="shrink-0 text-violet-600 dark:text-violet-400" />
                                <span>SpendWise Community Voice</span>
                            </div>
                        </div>
                    )}

                    {/* ─────── Hero Hub ─────── */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-800 dark:from-violet-950 dark:via-indigo-950 dark:to-surface-dark3 border border-violet-400/30 dark:border-white/10 shadow-xl shadow-violet-500/15 text-white p-6 sm:p-8">
                        {/* Ambient decorative glowing backdrop lights */}
                        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-400/20 blur-3xl pointer-events-none" />
                        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-400/20 blur-3xl pointer-events-none" />
                        <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
                            <MessageSquare size={160} strokeWidth={1} />
                        </div>

                        <div className="relative z-10 max-w-2xl space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-violet-100 tracking-wide uppercase">
                                <Sparkles size={13} />
                                <span>We Are Listening</span>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                                {translate('feedback_title') || 'Your Opinion Matters'}
                            </h2>
                            <p className="text-sm sm:text-base text-violet-100/90 leading-relaxed font-medium">
                                {translate('feedback_subtitle') || 'Send us your ideas or report a bug to help us build the best finance app.'}
                            </p>

                            {/* Attribute Chips */}
                            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-semibold text-violet-100/90">
                                <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                                    Direct Dev Review
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                                    Feature Roadmaps
                                </span>
                                <span className="px-2.5 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10">
                                    100% Privacy Protected
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ─────── Feedback Form Card ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Type Selection */}
                            <div className="space-y-2.5">
                                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                    {translate('type') || 'Feedback Type'}
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {types.map((t) => {
                                        const Icon = t.icon;
                                        const isSelected = type === t.id;
                                        return (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => setType(t.id)}
                                                className={`flex items-center sm:flex-col sm:items-start text-left p-4 rounded-2xl border transition-all duration-200 relative group ${
                                                    isSelected
                                                        ? `bg-gray-50/80 dark:bg-white/[0.05] ${t.activeBorder} shadow-sm`
                                                        : 'bg-white dark:bg-surface-dark2 border-gray-200/70 dark:border-white/[0.06] hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3 sm:w-full">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${t.bg}`}>
                                                        <Icon size={20} strokeWidth={2.2} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight">
                                                            {t.title}
                                                        </p>
                                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                                                            {t.subtitle}
                                                        </p>
                                                    </div>
                                                </div>

                                                {isSelected && (
                                                    <div className="absolute top-3 right-3 text-violet-600 dark:text-violet-400">
                                                        <CheckCircle2 size={16} strokeWidth={2.5} />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Quick Topic Tags (Optional) */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                    <Tag size={13} />
                                    <span>{translate('feedback_quick_tags') || 'Quick Tag (Optional)'}</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {quickTags.map((tag) => {
                                        const isTagActive = selectedTag === tag;
                                        return (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => handleTagClick(tag)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                                    isTagActive
                                                        ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/25'
                                                        : 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/[0.1]'
                                                }`}
                                            >
                                                {tag}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Message Area */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                                        {translate('feedback_label') || 'Your Message'}
                                    </label>
                                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                                        {message.length} chars
                                    </span>
                                </div>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={getPlaceholder()}
                                    rows={5}
                                    className="w-full p-4 rounded-2xl bg-gray-50/70 dark:bg-surface-dark border border-gray-200/80 dark:border-white/[0.08] text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:focus:ring-violet-400 transition-all resize-y min-h-[140px]"
                                    required
                                />
                            </div>

                            {/* User Context & Privacy Banner */}
                            {user?.email && (
                                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-200/60 dark:border-white/[0.06] text-xs text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <ShieldCheck size={16} className="text-violet-600 dark:text-violet-400 shrink-0" />
                                        <span className="truncate">
                                            {translate('feedback_submitting_as') || 'Submitting as'}: <strong className="text-gray-900 dark:text-white">{user.email}</strong>
                                        </span>
                                    </div>
                                    <span className="text-[10px] uppercase font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2 py-0.5 rounded-md shrink-0 ml-2">
                                        Verified
                                    </span>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSending || !message.trim()}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSending ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>{translate('send_feedback') || 'Send Feedback'}</span>
                                        <Send size={16} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* ─────── Bottom Bento: Trust & Process Card ─────── */}
                    <div className="bg-white dark:bg-surface-dark2 border border-gray-200/80 dark:border-white/[0.08] rounded-3xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                                <Zap size={20} strokeWidth={2.3} />
                            </div>
                            <div>
                                <h4 className="text-sm font-extrabold text-gray-900 dark:text-white">
                                    {translate('feedback_promise_title') || 'How We Handle Your Feedback'}
                                </h4>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                    Transparent, continuous development
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5 text-violet-600 dark:text-violet-400">
                                    <CheckCircle2 size={13} strokeWidth={2.5} />
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                                    {translate('feedback_promise_1') || 'Every submission is directly reviewed by the development team.'}
                                </p>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5 text-violet-600 dark:text-violet-400">
                                    <ShieldCheck size={13} strokeWidth={2.5} />
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                                    {translate('feedback_promise_2') || 'Your personal financial balances and transactions are never shared.'}
                                </p>
                            </div>

                            <div className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center shrink-0 mt-0.5 text-violet-600 dark:text-violet-400">
                                    <Sparkles size={13} strokeWidth={2.5} />
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                                    {translate('feedback_promise_3') || 'Reported bugs and suggestions are prioritized in regular releases.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Signature */}
                    <div className="text-center pt-2 pb-8 flex flex-col items-center gap-1.5 opacity-60">
                        <Heart size={14} className="text-rose-500" fill="currentColor" />
                        <p className="text-[11px] font-medium text-gray-400 dark:text-white/40">
                            SpendWise &bull; Made with care for the community &bull; Version 2.0
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FeedbackView;
