import React from 'react';
import { RefreshCw, Plus, Trash2, Star, Shield, Zap, CheckCircle2, HardDriveDownload, Sparkles, X, Calendar } from 'lucide-react';

const iconOptions = [
    { id: 'star', component: Star },
    { id: 'shield', component: Shield },
    { id: 'zap', component: Zap },
    { id: 'check', component: CheckCircle2 },
    { id: 'download', component: HardDriveDownload },
    { id: 'sparkles', component: Sparkles },
];

const AdminUpdates = ({
    updates, showUpdateModal, setShowUpdateModal,
    newUpdate, setNewUpdate, addFeature, removeFeature, updateFeature,
    onPublish, onDelete, translate
}) => {

    return (
        <div className="space-y-3 animate-fade-in">
            <button
                onClick={() => setShowUpdateModal(true)}
                className="w-full py-3 bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold rounded-2xl shadow-lg shadow-violet-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
                <Plus size={16} /> {translate('admin_create_update')}
            </button>

            {updates.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                    <Calendar size={40} strokeWidth={1} className="mb-3" />
                    <p className="text-[13px] font-medium">{translate('admin_no_updates')}</p>
                </div>
            ) : (
                updates.map(upd => (
                    <div key={upd.id} className="relative bg-white dark:bg-white/[0.04] rounded-2xl p-5 border border-gray-100 dark:border-transparent shadow-sm group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                    <RefreshCw size={18} />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-black text-gray-900 dark:text-white">v{upd.version}</h3>
                                    <p className="text-[11px] text-gray-400">{new Date(upd.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <button onClick={() => onDelete(upd)} className="p-2 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10">
                                <Trash2 size={15} />
                            </button>
                        </div>
                        <p className="text-[12px] text-gray-500 dark:text-white/60 font-medium mb-3">{upd.title_el} / {upd.title_en}</p>
                        {upd.features && upd.features.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap">
                                {upd.features.map((f, i) => (
                                    <div key={i} className="px-2.5 py-1 rounded-lg bg-violet-50 dark:bg-violet-500/10 text-[10px] text-violet-600 dark:text-violet-400 font-bold">
                                        {f.title_en}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))
            )}

            {/* Create Update Modal */}
            {showUpdateModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowUpdateModal(false)} />
                    <div className="relative w-full max-w-xl bg-white dark:bg-surface-dark2 rounded-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
                        <div className="shrink-0 p-6 border-b border-gray-100 dark:border-transparent flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white">{translate('admin_publish_update_title')}</h3>
                                <p className="text-xs text-gray-400">{translate('admin_publish_update_subtitle')}</p>
                            </div>
                            <button onClick={() => setShowUpdateModal(false)} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 block ml-1">Version</label>
                                    <input placeholder="1.2.0" className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" value={newUpdate.version} onChange={e => setNewUpdate({ ...newUpdate, version: e.target.value })} />
                                </div>
                                <div className="md:col-span-2 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 block ml-1">Greek Title</label>
                                        <input placeholder="Τι νέο υπάρχει;" className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-xl text-sm focus:outline-none" value={newUpdate.title_el} onChange={e => setNewUpdate({ ...newUpdate, title_el: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 block ml-1">English Title</label>
                                        <input placeholder="What's New?" className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-xl text-sm focus:outline-none" value={newUpdate.title_en} onChange={e => setNewUpdate({ ...newUpdate, title_en: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-black uppercase tracking-wider text-violet-500">Feature Bullet Points</label>
                                    <button onClick={addFeature} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 dark:bg-violet-500/10 text-violet-600 font-bold rounded-lg text-[10px] hover:bg-violet-200 transition-colors">
                                        <Plus size={12} /> Add Feature
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {newUpdate.features.map((feature, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-transparent rounded-2xl space-y-3 relative">
                                            <button onClick={() => removeFeature(idx)} className="absolute top-3 right-3 text-gray-300 hover:text-rose-500 transition-colors"><X size={14} /></button>
                                            <div className="flex gap-1.5 bg-white dark:bg-white/5 p-1 rounded-xl w-fit">
                                                {iconOptions.map(opt => (
                                                    <button key={opt.id} onClick={() => updateFeature(idx, 'icon', opt.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${feature.icon === opt.id ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                                                        <opt.component size={14} />
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input placeholder="Feature Title (EL)" className="p-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-xl text-[12px] font-bold focus:outline-none" value={feature.title_el} onChange={e => updateFeature(idx, 'title_el', e.target.value)} />
                                                <input placeholder="Feature Title (EN)" className="p-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-xl text-[12px] font-bold focus:outline-none" value={feature.title_en} onChange={e => updateFeature(idx, 'title_en', e.target.value)} />
                                                <textarea placeholder="Description (EL)" className="p-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-xl text-[11px] min-h-[60px] resize-none focus:outline-none" value={feature.desc_el} onChange={e => updateFeature(idx, 'desc_el', e.target.value)} />
                                                <textarea placeholder="Description (EN)" className="p-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-xl text-[11px] min-h-[60px] resize-none focus:outline-none" value={feature.desc_en} onChange={e => updateFeature(idx, 'desc_en', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                    {newUpdate.features.length === 0 && (
                                        <div className="py-10 border-2 border-dashed border-gray-100 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-300">
                                            <Sparkles size={24} className="mb-2 opacity-40" />
                                            <p className="text-[11px] font-medium">{translate('admin_add_feature_hint')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="shrink-0 p-6 bg-gray-50/50 dark:bg-surface-dark2 border-t border-gray-100 dark:border-transparent">
                            <button
                                onClick={onPublish}
                                className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl shadow-xl shadow-violet-500/20 active:scale-[0.98] transition-all"
                            >
                                {translate('admin_publish_btn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUpdates;
