import React, { useState } from 'react';
import {
    ArrowLeft,
    Send,
    MessageSquare,
    Lightbulb,
    Bug,
    Smile,
    Heart
} from 'lucide-react';
import { supabase } from '../supabase';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';

const FeedbackView = ({ user, onBack }) => {
    const { t: translate } = useSettings();
    const { showToast } = useToast();
    const [message, setMessage] = useState('');
    const [type, setType] = useState('idea'); // 'idea', 'bug', 'other'
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSending(true);
        try {
            const { error } = await supabase
                .from('feedback')
                .insert({
                    user_id: user.id,
                    message: message.trim(),
                    type: type,
                    email: user.email,
                    created_at: new Date().toISOString()
                });

            if (error) throw error;

            showToast(translate('feedback_success') || 'Thank you for your feedback!', 'success');
            setMessage('');
            setTimeout(onBack, 1500);
        } catch (error) {
            console.error('Feedback error:', error);
            showToast(translate('feedback_error') || 'Failed to send feedback.', 'error');
        } finally {
            setIsSending(false);
        }
    };

    const types = [
        { id: 'idea', icon: Lightbulb, label: translate('idea'), color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
        { id: 'bug', icon: Bug, label: translate('bug'), color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
        { id: 'other', icon: MessageSquare, label: translate('other'), color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    ];

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col animate-fade-in transition-colors duration-300">

            {/* Header */}
            <div className="shrink-0 bg-gray-50 dark:bg-surface-dark 
                            border-b border-gray-100 dark:border-transparent
                            px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 sticky top-0 z-10
                            backdrop-blur-xl transition-colors duration-300">
                <div className="flex items-center justify-center relative min-h-[36px]">
                    <button
                        onClick={onBack}
                        className="absolute left-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/[0.08]
                                   flex items-center justify-center text-gray-500 dark:text-white/50
                                   hover:bg-gray-200 dark:hover:bg-white/[0.14]
                                   active:scale-90 transition-all duration-150"
                    >
                        <ArrowLeft size={15} strokeWidth={2.5} />
                    </button>
                    <div className="text-center">
                        <h2 className="text-[17px] font-bold text-gray-900 dark:text-white leading-tight">
                            {translate('feedback') || 'Feedback & Ideas'}
                        </h2>
                        <p className="text-[11px] text-gray-400 dark:text-white/35">
                            {translate('feedback_desc') || "Tell us how to improve"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-8">

                {/* Intro Illustration/Icon */}
                <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-600 
                                    rounded-[2.5rem] flex items-center justify-center
                                    shadow-glow-violet animate-float">
                        <Smile size={38} className="text-white" strokeWidth={1.5} />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-lg font-black text-gray-900 dark:text-white">
                            {translate('feedback_title') || "Your Opinion Matters"}
                        </h3>
                        <p className="text-[13px] text-gray-500 dark:text-gray-400 max-w-[240px]">
                            {translate('feedback_subtitle') || "Send us your ideas or report a bug to help us build the best finance app."}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Feedback Type Selector */}
                    <div className="space-y-3">
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/50 ml-1">
                            {translate('type') || "Type"}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {types.map((t) => {
                                const Icon = t.icon;
                                const isSelected = type === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => setType(t.id)}
                                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200
                                                    ${isSelected
                                                ? 'bg-white dark:bg-white/[0.08] border-violet-500/50 shadow-lg scale-105'
                                                : 'bg-white/50 dark:bg-white/[0.03] border-transparent hover:bg-white dark:hover:bg-white/[0.05]'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.bg}`}>
                                            <Icon size={20} className={t.color} />
                                        </div>
                                        <span className={`text-[11px] font-bold ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                            {t.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Message Area */}
                    <div className="space-y-3">
                        <label className="block text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/50 ml-1">
                            {translate('feedback_label') || "Your Message"}
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder={translate('feedback_placeholder') || "Describe your idea or the issue..."}
                            className="w-full h-40 px-4 py-4 bg-white dark:bg-white/[0.04] 
                                       border border-gray-100 dark:border-transparent
                                       rounded-2xl text-[14px] text-gray-900 dark:text-white
                                       placeholder:text-gray-300 dark:placeholder:text-white/10
                                       focus:outline-none focus:ring-2 focus:ring-violet-500/30
                                       resize-none transition-all shadow-sm"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSending || !message.trim()}
                        className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600
                                   text-white font-bold rounded-2xl shadow-glow-violet
                                   active:scale-[0.97] transition-all disabled:opacity-50
                                   flex items-center justify-center gap-2"
                    >
                        {isSending ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>{translate('send_feedback') || "Send Feedback"}</span>
                                <Send size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div className="pt-4 flex flex-col items-center gap-2 opacity-40">
                    <Heart size={16} className="text-rose-500 animate-pulse" fill="currentColor" />
                    <p className="text-[10px] font-medium text-gray-500 dark:text-white">Made with love for the community</p>
                </div>
            </div>
        </div>
    );
};

export default FeedbackView;









