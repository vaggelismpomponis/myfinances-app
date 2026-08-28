import React from 'react';
import { Lightbulb, Bug, MessageSquare, Trash2, User, Filter } from 'lucide-react';

const getTypeIcon = (type) => {
    switch (type) {
        case 'idea': return <Lightbulb size={16} className="text-amber-500" />;
        case 'bug': return <Bug size={16} className="text-rose-500" />;
        default: return <MessageSquare size={16} className="text-blue-500" />;
    }
};

const getTypeBg = (type) => {
    switch (type) {
        case 'idea': return 'bg-amber-50 dark:bg-amber-500/10';
        case 'bug': return 'bg-rose-50 dark:bg-rose-500/10';
        default: return 'bg-blue-50 dark:bg-blue-500/10';
    }
};

const getTypeBorder = (type) => {
    switch (type) {
        case 'idea': return 'border-amber-100 dark:border-amber-500/20';
        case 'bug': return 'border-rose-100 dark:border-rose-500/20';
        default: return 'border-blue-100 dark:border-blue-500/20';
    }
};

const AdminFeedback = ({ feedback, onDelete, translate }) => {
    if (feedback.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-40 animate-fade-in">
                <Filter size={40} strokeWidth={1} className="mb-3" />
                <p className="text-[13px] font-medium">{translate('no_feedback_found')}</p>
            </div>
        );
    }

    return (
        <div className="space-y-3 animate-fade-in">
            {feedback.map((item) => (
                <div
                    key={item.id}
                    className={`bg-white dark:bg-white/[0.04] rounded-2xl border ${getTypeBorder(item.type)} shadow-sm space-y-3 group overflow-hidden`}
                >
                    {/* Type accent strip */}
                    <div className={`h-1 w-full ${item.type === 'idea' ? 'bg-amber-400' : item.type === 'bug' ? 'bg-rose-500' : 'bg-blue-500'}`} />
                    <div className="px-4 pb-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${getTypeBg(item.type)}`}>
                                    {getTypeIcon(item.type)}
                                </div>
                                <div>
                                    <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-tight capitalize">
                                        {translate(item.type)} {translate('submission')}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium">
                                        {new Date(item.created_at).toLocaleDateString()} at {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => onDelete(item.id)}
                                className="p-2 text-gray-300 hover:text-rose-500 active:scale-90 transition-all opacity-0 group-hover:opacity-100 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10"
                            >
                                <Trash2 size={15} />
                            </button>
                        </div>
                        <p className="text-[13px] text-gray-600 dark:text-white/70 leading-relaxed bg-gray-50 dark:bg-white/[0.02] p-3.5 rounded-xl border border-gray-100/50 dark:border-white/[0.03]">
                            {item.message}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                            <User size={12} className="text-gray-400" />
                            <span className="text-[11px] font-medium text-gray-400 truncate">{item.email}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminFeedback;
