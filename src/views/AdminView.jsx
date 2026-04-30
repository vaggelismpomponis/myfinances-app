import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Trash2, RefreshCw, MessageSquare, Lightbulb, Bug, Search,
    User, Calendar, ChevronRight, Filter, Plus, X, Shield, Zap,
    CheckCircle2, Star, HardDriveDownload, Sparkles, Send, LayoutDashboard, Users, Radio
} from 'lucide-react';
import { supabase } from '../supabase';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
import ConfirmationModal from '../components/ConfirmationModal';

const AdminView = ({ onBack }) => {
    const [activeSection, setActiveSection] = useState('overview');
    const [loading, setLoading] = useState(true);

    // Feedback State
    const [feedback, setFeedback] = useState([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Updates State
    const [updates, setUpdates] = useState([]);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const initialUpdateState = { version: '', title_el: '', title_en: '', features: [] };
    const [newUpdate, setNewUpdate] = useState(initialUpdateState);

    // Dashboard & Users State
    const [stats, setStats] = useState({ users: 0, transactions: 0, feedback: 0, activity: 0 });
    const [sessions, setSessions] = useState([]);

    // Broadcast State
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');

    const { showToast } = useToast();
    const { t: translate } = useSettings();

    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [
                { data: fbData },
                { data: upData },
                { count: fCount },
                { count: tCount },
                { data: sessData }
            ] = await Promise.all([
                supabase.from('feedback').select('*').order('created_at', { ascending: false }),
                supabase.from('app_updates').select('*').order('created_at', { ascending: false }),
                supabase.from('feedback').select('*', { count: 'exact', head: true }),
                supabase.from('transactions').select('*', { count: 'exact', head: true }),
                supabase.from('sessions').select('*').order('last_active', { ascending: false })
            ]);

            setFeedback(fbData || []);
            setUpdates(upData || []);
            setSessions(sessData || []);

            const uniqueUsers = new Set((sessData || []).map(s => s.user_id)).size;
            setStats({
                users: uniqueUsers || 0,
                transactions: tCount || 0,
                feedback: fCount || 0,
                activity: sessData?.length || 0
            });
        } catch (error) {
            console.error('Fetch error:', error);
            showToast('Failed to load admin data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const { error } = await supabase.from('feedback').delete().eq('id', itemToDelete);
            if (error) throw error;
            setFeedback(prev => prev.filter(f => f.id !== itemToDelete));
            showToast('Feedback deleted', 'success');
        } catch (error) {
            console.error('Delete error:', error);
            showToast('Failed to delete', 'error');
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const addFeature = () => {
        setNewUpdate({
            ...newUpdate,
            features: [...newUpdate.features, { icon: 'star', title_el: '', title_en: '', desc_el: '', desc_en: '', bg: 'bg-violet-50 dark:bg-violet-500/10', color: 'text-violet-500' }]
        });
    };

    const removeFeature = (index) => {
        const updatedFeatures = [...newUpdate.features];
        updatedFeatures.splice(index, 1);
        setNewUpdate({ ...newUpdate, features: updatedFeatures });
    };

    const updateFeature = (index, field, value) => {
        const updatedFeatures = [...newUpdate.features];
        updatedFeatures[index][field] = value;
        setNewUpdate({ ...newUpdate, features: updatedFeatures });
    };

    const filteredFeedback = feedback.filter(f => {
        const matchesFilter = filter === 'all' || f.type === filter;
        const matchesSearch = (f.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (f.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

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

    const iconOptions = [
        { id: 'star', component: Star },
        { id: 'shield', component: Shield },
        { id: 'zap', component: Zap },
        { id: 'check', component: CheckCircle2 },
        { id: 'download', component: HardDriveDownload },
        { id: 'sparkles', component: Sparkles }
    ];

    const tabs = [
        { id: 'overview', icon: LayoutDashboard, label: translate('admin_tab_overview') },
        { id: 'users', icon: Users, label: translate('admin_tab_users') },
        { id: 'feedback', icon: MessageSquare, label: translate('admin_tab_feedback') },
        { id: 'updates', icon: RefreshCw, label: translate('admin_tab_updates') },
        { id: 'broadcast', icon: Radio, label: translate('admin_tab_broadcast') }
    ];

    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col animate-fade-in transition-colors duration-300">
            {/* Header */}
            <div className="shrink-0 bg-gray-50 dark:bg-surface-dark border-b border-gray-100 dark:border-transparent px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 sticky top-0 z-10 backdrop-blur-xl transition-colors duration-300">
                <div className="flex items-center justify-center relative mb-4 min-h-[36px]">
                    <button onClick={onBack} className="absolute left-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center text-gray-500 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-white/[0.14] active:scale-90 transition-all duration-150">
                        <ArrowLeft size={15} strokeWidth={2.5} />
                    </button>
                    <h2 className="text-[17px] font-bold text-gray-900 dark:text-white text-center">{translate('admin_dashboard_title')}</h2>
                    <button onClick={fetchAllData} className="absolute right-0 w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 active:rotate-180 transition-all duration-500">
                        <RefreshCw size={17} />
                    </button>
                </div>

                {/* Section Toggle */}
                <div className="relative mb-3">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pr-8">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeSection === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveSection(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all whitespace-nowrap
                                                ${isActive ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : 'bg-white dark:bg-white/[0.05] text-gray-500 dark:text-white/60 border border-gray-100 dark:border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.1]'}`}
                                >
                                    <Icon size={14} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 dark:from-surface-dark to-transparent pointer-events-none flex items-center justify-end pb-1">
                        <ChevronRight size={16} className="text-gray-400 dark:text-gray-500 animate-pulse" />
                    </div>
                </div>

                {/* Search & Filters (Feedback Only) */}
                {activeSection === 'feedback' && (
                    <div className="space-y-3 animate-fade-in">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder={translate('search_feedback')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-white/[0.05] border border-gray-100 dark:border-transparent rounded-xl text-[13px] text-gray-900 dark:text-white focus:outline-none"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {['all', 'idea', 'bug', 'other'].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setFilter(t)}
                                    className={`px-4 py-1.5 rounded-full text-[11px] font-bold capitalize transition-all
                                                ${filter === t ? 'bg-violet-600 text-white shadow-md' : 'bg-white dark:bg-white/[0.06] text-gray-500 dark:text-white/60 border border-gray-100 dark:border-transparent'}`}
                                >
                                    {translate(t)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Create Update Button (Updates Only) */}
                {activeSection === 'updates' && (
                    <button onClick={() => setShowUpdateModal(true)} className="w-full py-2.5 bg-violet-600 text-white text-[13px] font-bold rounded-xl shadow-lg active:scale-95 transition-all animate-fade-in">
                        + {translate('admin_create_update')}
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                        <RefreshCw size={30} className="animate-spin text-violet-500 mb-2" />
                        <p className="text-[12px] font-medium">{translate('admin_loading')}</p>
                    </div>
                ) : (
                    <>
                        {/* OVERVIEW SECTION */}
                        {activeSection === 'overview' && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white dark:bg-surface-dark2 p-4 rounded-2xl border border-gray-100 dark:border-transparent shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                                                <Users size={14} className="text-blue-500" />
                                            </div>
                                            <span className="text-[12px] font-bold text-gray-500">Total Users</span>
                                        </div>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.users}</p>
                                    </div>
                                    <div className="bg-white dark:bg-surface-dark2 p-4 rounded-2xl border border-gray-100 dark:border-transparent shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                                <RefreshCw size={14} className="text-emerald-500" />
                                            </div>
                                            <span className="text-[12px] font-bold text-gray-500">Transactions</span>
                                        </div>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.transactions}</p>
                                    </div>
                                    <div className="bg-white dark:bg-surface-dark2 p-4 rounded-2xl border border-gray-100 dark:border-transparent shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                                                <MessageSquare size={14} className="text-amber-500" />
                                            </div>
                                            <span className="text-[12px] font-bold text-gray-500">Feedback</span>
                                        </div>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.feedback}</p>
                                    </div>
                                    <div className="bg-white dark:bg-surface-dark2 p-4 rounded-2xl border border-gray-100 dark:border-transparent shadow-sm">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                                                <Zap size={14} className="text-violet-500" />
                                            </div>
                                            <span className="text-[12px] font-bold text-gray-500">App Sessions</span>
                                        </div>
                                        <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.activity}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* USERS SECTION */}
                        {activeSection === 'users' && (
                            <div className="space-y-3 animate-fade-in">
                                {sessions.length === 0 ? (
                                    <div className="text-center py-10 opacity-50">
                                        <Users size={40} className="mx-auto mb-3" />
                                        <p className="text-sm">{translate('admin_no_users')}</p>
                                    </div>
                                ) : (
                                    sessions.map(session => (
                                        <div key={session.id} className="bg-white dark:bg-surface-dark2 p-4 rounded-2xl border border-gray-100 dark:border-transparent shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                                    <User size={18} className="text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate max-w-[180px]">
                                                        {session.display_name || session.email || `User: ${session.user_id?.substring(0, 8)}...`}
                                                    </p>
                                                    {session.display_name && session.email && (
                                                        <p className="text-[10px] text-gray-400 truncate -mt-0.5">{session.email}</p>
                                                    )}
                                                    <p className="text-[11px] text-gray-500 mt-0.5">{session.device || "Unknown Device"} • {session.location || "Unknown Location"}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md block mb-1">Active</span>
                                                <span className="text-[10px] text-gray-400">{new Date(session.last_active).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* FEEDBACK SECTION */}
                        {activeSection === 'feedback' && (
                            filteredFeedback.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                    <Filter size={40} strokeWidth={1} className="mb-3" />
                                    <p className="text-[13px] font-medium">{translate('no_feedback_found')}</p>
                                </div>
                            ) : (
                                filteredFeedback.map((item) => (
                                    <div key={item.id} className="bg-white dark:bg-white/[0.04] rounded-2xl p-4 border border-gray-100 dark:border-transparent shadow-sm space-y-3 group">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeBg(item.type)}`}>
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
                                            <button onClick={() => handleDeleteClick(item.id)} className="p-2 text-gray-300 hover:text-rose-500 active:scale-90 transition-all opacity-0 group-hover:opacity-100">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <p className="text-[13px] text-gray-600 dark:text-white/70 leading-relaxed bg-gray-50 dark:bg-white/[0.02] p-3 rounded-xl border border-gray-100/50 dark:border-white/[0.03]">
                                            {item.message}
                                        </p>
                                        <div className="flex items-center gap-2 pt-1">
                                            <User size={12} className="text-gray-400" />
                                            <span className="text-[11px] font-medium text-gray-400 truncate">{item.email}</span>
                                        </div>
                                    </div>
                                ))
                            )
                        )}

                        {/* UPDATES SECTION */}
                        {activeSection === 'updates' && (
                            updates.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                    <Calendar size={40} strokeWidth={1} className="mb-3" />
                                    <p className="text-[13px] font-medium">{translate('admin_no_updates')}</p>
                                </div>
                            ) : (
                                updates.map(upd => (
                                    <div key={upd.id} className="relative bg-white dark:bg-white/[0.04] rounded-2xl p-4 border border-gray-100 dark:border-transparent shadow-sm group">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600">
                                                    <RefreshCw size={16} />
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">v{upd.version}</h3>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-gray-400">{new Date(upd.created_at).toLocaleDateString()}</span>
                                                <button onClick={async () => {
                                                    if (window.confirm(translate('admin_delete_update_confirm'))) {
                                                        await supabase.from('app_updates').delete().eq('id', upd.id);
                                                        fetchAllData();
                                                    }
                                                }} className="p-1.5 text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[12px] text-gray-500 dark:text-white/60 px-1 font-medium">{upd.title_el} / {upd.title_en}</p>
                                        {upd.features && upd.features.length > 0 && (
                                            <div className="mt-2 pt-2 border-t border-gray-50 dark:border-transparent flex gap-1.5 flex-wrap">
                                                {upd.features.map((f, i) => (
                                                    <div key={i} className="px-2 py-0.5 rounded-md bg-gray-50 dark:bg-white/5 text-[9px] text-gray-400">
                                                        {f.title_en}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )
                        )}

                        {/* BROADCAST SECTION */}
                        {activeSection === 'broadcast' && (
                            <div className="bg-white dark:bg-surface-dark2 p-6 rounded-3xl border border-gray-100 dark:border-transparent shadow-sm space-y-5 animate-fade-in">
                                <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-white/5">
                                    <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                                        <Send size={20} className="text-violet-600 dark:text-violet-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-[15px] font-black text-gray-900 dark:text-white">{translate('admin_broadcast_title')}</h3>
                                        <p className="text-[11px] text-gray-500">{translate('admin_broadcast_subtitle')}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">{translate('admin_broadcast_title_label')}</label>
                                        <input 
                                            type="text" 
                                            value={broadcastTitle} 
                                            onChange={e => setBroadcastTitle(e.target.value)} 
                                            className="w-full p-3.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-transparent text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                                            placeholder={translate('admin_broadcast_title_placeholder')}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">{translate('admin_broadcast_message_label')}</label>
                                        <textarea 
                                            value={broadcastMessage} 
                                            onChange={e => setBroadcastMessage(e.target.value)} 
                                            className="w-full p-3.5 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-transparent text-[13px] min-h-[120px] focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none"
                                            placeholder={translate('admin_broadcast_message_placeholder')}
                                        />
                                    </div>
                                    <button 
                                        onClick={() => {
                                            if(!broadcastTitle.trim() || !broadcastMessage.trim()) return showToast(translate('admin_broadcast_fill_fields'), 'error');
                                            showToast(translate('admin_broadcast_success'), 'success');
                                            setBroadcastTitle('');
                                            setBroadcastMessage('');
                                        }}
                                        className="w-full py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-xl active:scale-[0.98] transition-all shadow-xl shadow-violet-500/20 flex items-center justify-center gap-2"
                                    >
                                        <Radio size={16} /> {translate('admin_broadcast_btn')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Create Update Modal */}
            {showUpdateModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowUpdateModal(false)} />
                    <div className="relative w-full max-w-xl bg-white dark:bg-surface-dark2 rounded-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
                        <div className="shrink-0 p-6 border-b dark:border-transparent flex items-center justify-between bg-white dark:bg-surface-dark2">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white">{translate('admin_publish_update_title')}</h3>
                                <p className="text-xs text-gray-400">{translate('admin_publish_update_subtitle')}</p>
                            </div>
                            <button onClick={() => setShowUpdateModal(false)} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Version & Main Titles */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 block ml-1">Version</label>
                                    <input placeholder="1.2.0" className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-xl text-sm" value={newUpdate.version} onChange={e => setNewUpdate({ ...newUpdate, version: e.target.value })} />
                                </div>
                                <div className="md:col-span-2 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 block ml-1">Greek Title</label>
                                        <input placeholder="Τι νέο υπάρχει;" className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-xl text-sm" value={newUpdate.title_el} onChange={e => setNewUpdate({ ...newUpdate, title_el: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-gray-400 mb-1.5 block ml-1">English Title</label>
                                        <input placeholder="What's New?" className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-xl text-sm" value={newUpdate.title_en} onChange={e => setNewUpdate({ ...newUpdate, title_en: e.target.value })} />
                                    </div>
                                </div>
                            </div>

                            {/* Features Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-black uppercase tracking-wider text-violet-500">Feature Bullet Points</label>
                                    <button onClick={addFeature} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 dark:bg-violet-500/10 text-violet-600 font-bold rounded-lg text-[10px]">
                                        <Plus size={12} /> Add Feature
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {newUpdate.features.map((feature, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50/50 dark:bg-white/[0.02] border border-gray-100 dark:border-transparent rounded-2xl space-y-3 relative">
                                            <button onClick={() => removeFeature(idx)} className="absolute top-3 right-3 text-gray-300 hover:text-rose-500"><X size={14} /></button>
                                            <div className="flex items-center gap-4">
                                                <div className="flex gap-1.5 bg-white dark:bg-white/5 p-1 rounded-xl">
                                                    {iconOptions.map(opt => (
                                                        <button key={opt.id} onClick={() => updateFeature(idx, 'icon', opt.id)} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${feature.icon === opt.id ? 'bg-violet-600 text-white' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'}`}>
                                                            <opt.component size={14} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <input placeholder="Feature Title (EL)" className="p-2.5 bg-white dark:bg-white/5 border dark:border-transparent rounded-xl text-[12px] font-bold" value={feature.title_el} onChange={e => updateFeature(idx, 'title_el', e.target.value)} />
                                                <input placeholder="Feature Title (EN)" className="p-2.5 bg-white dark:bg-white/5 border dark:border-transparent rounded-xl text-[12px] font-bold" value={feature.title_en} onChange={e => updateFeature(idx, 'title_en', e.target.value)} />
                                                <textarea placeholder="Description (EL)" className="p-2.5 bg-white dark:bg-white/5 border dark:border-transparent rounded-xl text-[11px] min-h-[60px]" value={feature.desc_el} onChange={e => updateFeature(idx, 'desc_el', e.target.value)} />
                                                <textarea placeholder="Description (EN)" className="p-2.5 bg-white dark:bg-white/5 border dark:border-transparent rounded-xl text-[11px] min-h-[60px]" value={feature.desc_en} onChange={e => updateFeature(idx, 'desc_en', e.target.value)} />
                                            </div>
                                        </div>
                                    ))}
                                    {newUpdate.features.length === 0 && (
                                        <div className="py-8 border-2 border-dashed border-gray-100 dark:border-transparent rounded-2xl flex flex-col items-center justify-center text-gray-300">
                                            <Sparkles size={24} className="mb-2 opacity-20" />
                                            <p className="text-[11px] font-medium">{translate('admin_add_feature_hint')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="shrink-0 p-6 bg-gray-50/50 dark:bg-surface-dark2 border-t dark:border-transparent">
                            <button onClick={async () => {
                                if (!newUpdate.version) return showToast(translate('admin_version_required'), 'error');
                                try {
                                    const { error } = await supabase.from('app_updates').insert([newUpdate]);
                                    if (error) throw error;
                                    showToast(translate('admin_update_published'), 'success');
                                    setShowUpdateModal(false);
                                    setNewUpdate(initialUpdateState);
                                    fetchAllData();
                                } catch (e) {
                                    showToast(translate('admin_update_error') + e.message, 'error');
                                }
                            }} className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl shadow-xl shadow-violet-500/20 active:scale-[0.98] transition-all">
                                {translate('admin_publish_btn')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Deletion Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title={translate('delete_feedback_title')}
                message={translate('delete_feedback_msg')}
                confirmText={translate('delete')}
                type="danger"
            />
        </div>
    );
};

export default AdminView;
