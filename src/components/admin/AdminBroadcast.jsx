import React from 'react';
import { Send, Radio, RefreshCw } from 'lucide-react';

const AdminBroadcast = ({ broadcastTitle, setBroadcastTitle, broadcastMessage, setBroadcastMessage, onSend, translate }) => {
    return (
        <div className="animate-fade-in max-w-2xl mx-auto">
            <div className="bg-white dark:bg-surface-dark2 p-6 rounded-3xl border border-gray-100 dark:border-transparent shadow-sm space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 pb-5 border-b border-gray-100 dark:border-white/5">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center shadow-sm">
                        <Send size={22} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                        <h3 className="text-[17px] font-black text-gray-900 dark:text-white">{translate('admin_broadcast_title')}</h3>
                        <p className="text-[12px] text-gray-400 mt-0.5">{translate('admin_broadcast_subtitle')}</p>
                    </div>
                </div>

                {/* Warning notice */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20">
                    <Radio size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Broadcast to all users</p>
                        <p className="text-[11px] text-amber-600/70 dark:text-amber-400/60 mt-0.5">This message will be visible to all users the next time they open the app.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                            {translate('admin_broadcast_title_label')}
                        </label>
                        <input
                            type="text"
                            value={broadcastTitle}
                            onChange={e => setBroadcastTitle(e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-transparent text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all"
                            placeholder={translate('admin_broadcast_title_placeholder')}
                        />
                    </div>
                    <div>
                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                            {translate('admin_broadcast_message_label')}
                        </label>
                        <textarea
                            value={broadcastMessage}
                            onChange={e => setBroadcastMessage(e.target.value)}
                            className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-transparent text-[13px] min-h-[140px] focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all resize-none leading-relaxed"
                            placeholder={translate('admin_broadcast_message_placeholder')}
                        />
                        <p className="text-[10px] text-gray-400 mt-1.5 text-right">{broadcastMessage.length} chars</p>
                    </div>
                    <button
                        onClick={onSend}
                        className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl active:scale-[0.98] transition-all shadow-xl shadow-violet-500/20 flex items-center justify-center gap-2.5 text-[14px]"
                    >
                        <Radio size={17} /> {translate('admin_broadcast_btn')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminBroadcast;
