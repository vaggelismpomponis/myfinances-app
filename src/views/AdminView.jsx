import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, RefreshCw, Search, X,
    LayoutDashboard, Users, MessageSquare, Radio,
    Filter, ChevronLeft, ChevronRight, ShieldCheck,
    Sparkles, Activity, CheckCircle2, SlidersHorizontal, ArrowRight
} from 'lucide-react';
import { supabase } from '../supabase';
import { useToast } from '../contexts/ToastContext';
import { useSettings } from '../contexts/SettingsContext';
import ConfirmationModal from '../components/ConfirmationModal';

// Sub-components
import AdminOverview from '../components/admin/AdminOverview';
import AdminUsersList from '../components/admin/AdminUsersList';
import AdminUserDetail from '../components/admin/AdminUserDetail';
import AdminFeedback from '../components/admin/AdminFeedback';
import AdminUpdates from '../components/admin/AdminUpdates';
import AdminBroadcast from '../components/admin/AdminBroadcast';

/* ─── Desktop Sidebar Tab ─── */
const SidebarTab = ({ tab, isActive, onClick }) => {
    const Icon = tab.icon;
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all duration-200 group relative
                ${isActive
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25 font-bold'
                    : 'text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white font-semibold'}`}
        >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors
                ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400'}`}>
                <Icon size={16} strokeWidth={2.2} />
            </div>
            <span className="text-[13px] flex-1 truncate">{tab.label}</span>
            {tab.badge !== undefined && tab.badge !== null && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 transition-colors
                    ${isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 dark:bg-white/[0.08] text-gray-500 dark:text-gray-400 group-hover:bg-violet-50 dark:group-hover:bg-violet-500/10 group-hover:text-violet-600 dark:group-hover:text-violet-400'}`}>
                    {tab.badge}
                </span>
            )}
            {isActive && <ChevronRight size={14} className="text-white/70 ml-1 shrink-0" />}
        </button>
    );
};

/* ─── Main AdminView Component ─── */
const AdminView = ({ onBack, hideHeader }) => {
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
    const [showUpdateDeleteModal, setShowUpdateDeleteModal] = useState(false);
    const [updateToDelete, setUpdateToDelete] = useState(null);
    const initialUpdateState = { version: '', title_el: '', title_en: '', features: [] };
    const [newUpdate, setNewUpdate] = useState(initialUpdateState);

    // Dashboard & Users State
    const [stats, setStats] = useState({ users: 0, transactions: 0, feedback: 0, activity: 0 });
    const [metrics, setMetrics] = useState({ proUsers: 0, freeUsers: 0, canceledUsers: 0, active7Days: 0, active30Days: 0, mostActiveUsers: [] });
    const [profiles, setProfiles] = useState([]);
    const [sessions, setSessions] = useState([]);

    // Broadcast State
    const [broadcastTitle, setBroadcastTitle] = useState('');
    const [broadcastMessage, setBroadcastMessage] = useState('');

    // Subscription Management State
    const [showSubModal, setShowSubModal] = useState(false);
    const [subTarget, setSubTarget] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);

    // Notes State
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [notesTarget, setNotesTarget] = useState(null);
    const [editingNotes, setEditingNotes] = useState('');
    const [isSavingNotes, setIsSavingNotes] = useState(false);

    // User Detail State
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [profileStats, setProfileStats] = useState({ transactions: 0, budgets: 0, goals: 0 });
    const [profileSessions, setProfileSessions] = useState([]);
    const [loadingProfileData, setLoadingProfileData] = useState(false);

    const { showToast } = useToast();
    const { t: translate } = useSettings();

    /* ─── Data Fetching ─── */
    const fetchAllData = async () => {
        setLoading(true);
        try {
            const [
                { data: fbData },
                { data: upData },
                { count: fCount },
                { count: tCount },
                { data: profRes, error: profInvokeError }
            ] = await Promise.all([
                supabase.from('feedback').select('*').order('created_at', { ascending: false }),
                supabase.from('app_updates').select('*').order('created_at', { ascending: false }),
                supabase.from('feedback').select('*', { count: 'exact', head: true }),
                supabase.from('transactions').select('*', { count: 'exact', head: true }),
                supabase.functions.invoke('admin-get-profiles')
            ]);

            if (profInvokeError) {
                console.error('Invoke error:', profInvokeError);
                showToast(`Function error: ${profInvokeError.message}`, 'error');
            }
            if (profRes?.error) {
                console.error('Admin API error:', profRes.error);
                showToast(`Admin API: ${profRes.error}`, 'error');
            }

            const profData = profRes?.profiles || [];
            const sessData = profRes?.sessions || [];

            setFeedback(fbData || []);
            setUpdates(upData || []);
            setSessions(sessData || []);

            const allUserIds = new Set([
                ...(profData || []).map(p => p.id),
                ...(sessData || []).map(s => s.user_id)
            ].filter(id => !!id));

            const latestSessionsMap = (sessData || []).reduce((acc, s) => {
                if (!acc[s.user_id] || new Date(s.last_active) > new Date(acc[s.user_id].last_active)) {
                    acc[s.user_id] = s;
                }
                return acc;
            }, {});

            const enhancedProfiles = Array.from(allUserIds).map((uid, index) => {
                const profile = (profData || []).find(p => p.id === uid);
                const latestSession = latestSessionsMap[uid];
                return {
                    id: uid,
                    email: profile?.email || latestSession?.email || 'Unknown',
                    display_name: profile?.display_name || latestSession?.display_name || null,
                    subscription_status: profile?.subscription_status || 'free',
                    stripe_customer_id: profile?.stripe_customer_id || null,
                    admin_notes: profile?.admin_notes || null,
                    created_at: profile?.created_at || null,
                    last_sign_in_at: profile?.last_sign_in_at || null,
                    displayId: index + 1,
                    latest_session: latestSession || null,
                    is_virtual: !profile
                };
            });

            setProfiles(enhancedProfiles);
            setSelectedProfile(prev => {
                if (!prev) return null;
                const updated = enhancedProfiles.find(p => p.id === prev.id);
                return updated ? { ...prev, ...updated } : prev;
            });

            const uniqueUsers = allUserIds.size;
            setStats({
                users: uniqueUsers,
                transactions: tCount || 0,
                feedback: fCount || 0,
                activity: sessData?.length || 0
            });

            const now = new Date();
            const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

            const proUsers = enhancedProfiles.filter(p => p.subscription_status === 'pro').length;
            const freeUsers = enhancedProfiles.filter(p => p.subscription_status === 'free').length;
            const canceledUsers = enhancedProfiles.filter(p => p.subscription_status === 'canceled' || p.subscription_status === 'cancelled').length;

            const active7Days = enhancedProfiles.filter(p => {
                const session = latestSessionsMap[p.id];
                return session && new Date(session.last_active) >= sevenDaysAgo;
            }).length;

            const active30Days = enhancedProfiles.filter(p => {
                const session = latestSessionsMap[p.id];
                return session && new Date(session.last_active) >= thirtyDaysAgo;
            }).length;

            const sessionCounts = (sessData || []).reduce((acc, s) => {
                acc[s.user_id] = (acc[s.user_id] || 0) + 1;
                return acc;
            }, {});

            const mostActiveUsers = enhancedProfiles
                .map(p => ({ ...p, sessionCount: sessionCounts[p.id] || 0 }))
                .filter(p => p.sessionCount > 0)
                .sort((a, b) => b.sessionCount - a.sessionCount)
                .slice(0, 5);

            setMetrics({ proUsers, freeUsers, canceledUsers, active7Days, active30Days, mostActiveUsers });

        } catch (error) {
            console.error('Fetch error:', error);
            showToast('Failed to load admin data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllData(); }, []);

    /* ─── Handlers ─── */
    const handleDeleteClick = (id) => { setItemToDelete(id); setShowDeleteModal(true); };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const { error } = await supabase.from('feedback').delete().eq('id', itemToDelete);
            if (error) throw error;
            setFeedback(prev => prev.filter(f => f.id !== itemToDelete));
            showToast('Feedback deleted', 'success');
        } catch (error) {
            showToast('Failed to delete', 'error');
        } finally {
            setShowDeleteModal(false);
            setItemToDelete(null);
        }
    };

    const handleSubClick = (profile, status) => { setSubTarget({ profile, status }); setShowSubModal(true); };

    const confirmSubscriptionChange = async () => {
        if (!subTarget) return;
        const { profile, status } = subTarget;
        setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, subscription_status: status } : p));
        if (selectedProfile?.id === profile.id) {
            setSelectedProfile(prev => ({ ...prev, subscription_status: status }));
        }
        try {
            const { error } = await supabase.functions.invoke('admin-manage-subscription', {
                body: { targetUserId: profile.id, status }
            });
            if (error) throw error;
            showToast(`User updated to ${status.toUpperCase()}`, 'success');
            await fetchAllData();
        } catch (err) {
            showToast(`Error: ${err.message}`, 'error');
            fetchAllData();
        } finally {
            setShowSubModal(false);
            setSubTarget(null);
        }
    };

    const handleSaveNotes = async (userId, notesText) => {
        setIsSavingNotes(true);
        try {
            const { error } = await supabase.functions.invoke('admin-update-notes', {
                body: { targetUserId: userId, notes: notesText }
            });
            if (error) throw error;
            showToast(translate('notes_saved') || 'Notes saved', 'success');
            setProfiles(prev => prev.map(p => p.id === userId ? { ...p, admin_notes: notesText } : p));
            if (selectedProfile?.id === userId) {
                setSelectedProfile(prev => ({ ...prev, admin_notes: notesText }));
            }
            setShowNotesModal(false);
        } catch (err) {
            showToast(`Error: ${err.message}`, 'error');
        } finally {
            setIsSavingNotes(false);
        }
    };

    const handleSaveNotesModal = async () => {
        if (!notesTarget) return;
        await handleSaveNotes(notesTarget.id, editingNotes);
    };

    const handleDeleteUpdateClick = (update) => { setUpdateToDelete(update); setShowUpdateDeleteModal(true); };

    const confirmDeleteUpdate = async () => {
        if (!updateToDelete) return;
        try {
            const { error } = await supabase.from('app_updates').delete().eq('id', updateToDelete.id);
            if (error) throw error;
            showToast('Update deleted', 'success');
            fetchAllData();
        } catch (error) {
            showToast('Failed to delete update', 'error');
        } finally {
            setShowUpdateDeleteModal(false);
            setUpdateToDelete(null);
        }
    };

    const handleProfileClick = async (profile) => {
        setSelectedProfile(profile);
        setActiveSection('users');
        setLoadingProfileData(true);
        try {
            const [
                { count: tCount },
                { count: bCount },
                { count: gCount },
                { data: sData }
            ] = await Promise.all([
                supabase.from('transactions').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
                supabase.from('budgets').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
                supabase.from('goals').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
                supabase.from('sessions').select('*').eq('user_id', profile.id).order('last_active', { ascending: false })
            ]);
            setProfileStats({ transactions: tCount || 0, budgets: bCount || 0, goals: gCount || 0 });
            setProfileSessions(sData || []);
        } catch (err) {
            console.error('Error fetching profile data:', err);
        } finally {
            setLoadingProfileData(false);
        }
    };

    const handleDropdownAction = (action, profile) => {
        if (action === 'stripe') {
            if (profile.stripe_customer_id) {
                window.open(`https://dashboard.stripe.com/customers/${profile.stripe_customer_id}`, '_blank');
            } else {
                window.open(`https://dashboard.stripe.com/search?query=${encodeURIComponent(profile.email)}`, '_blank');
            }
        } else if (action === 'copyId') {
            navigator.clipboard.writeText(profile.id);
            showToast(translate('copied') || 'Copied!', 'success');
        } else if (action === 'notes') {
            setNotesTarget(profile);
            setEditingNotes(profile.admin_notes || '');
            setShowNotesModal(true);
        }
    };

    const addFeature = () => {
        setNewUpdate({ ...newUpdate, features: [...newUpdate.features, { icon: 'star', title_el: '', title_en: '', desc_el: '', desc_en: '', bg: 'bg-violet-50 dark:bg-violet-500/10', color: 'text-violet-500' }] });
    };
    const removeFeature = (index) => {
        const updated = [...newUpdate.features];
        updated.splice(index, 1);
        setNewUpdate({ ...newUpdate, features: updated });
    };
    const updateFeature = (index, field, value) => {
        const updated = [...newUpdate.features];
        updated[index][field] = value;
        setNewUpdate({ ...newUpdate, features: updated });
    };

    const handlePublishUpdate = async () => {
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
    };

    const handleSendBroadcast = async () => {
        if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
            return showToast(translate('admin_broadcast_fill_fields'), 'error');
        }
        try {
            const { error } = await supabase.from('broadcasts').insert([{
                title: broadcastTitle.trim(),
                message: broadcastMessage.trim(),
                created_at: new Date().toISOString()
            }]);
            if (error) throw error;
            showToast(translate('admin_broadcast_success'), 'success');
            setBroadcastTitle('');
            setBroadcastMessage('');
        } catch (e) {
            showToast('Αποτυχία αποστολής: ' + e.message, 'error');
        }
    };

    const filteredFeedback = feedback.filter(f => {
        const matchesFilter = filter === 'all' || f.type === filter;
        const matchesSearch = (f.message || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (f.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const tabs = [
        { id: 'overview', icon: LayoutDashboard, label: translate('admin_tab_overview') || 'Overview', badge: null },
        { id: 'users', icon: Users, label: translate('admin_tab_users') || 'Users', badge: profiles.length || null },
        { id: 'feedback', icon: MessageSquare, label: translate('admin_tab_feedback') || 'Feedback', badge: feedback.length || null },
        { id: 'updates', icon: RefreshCw, label: translate('admin_tab_updates') || 'Updates', badge: updates.length || null },
        { id: 'broadcast', icon: Radio, label: translate('admin_tab_broadcast') || 'Broadcast', badge: 'Live' },
    ];

    /* ─── Content Renderer ─── */
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-surface-dark2 rounded-3xl border border-gray-100 dark:border-white/[0.06] shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-4 shadow-sm">
                        <RefreshCw size={24} className="animate-spin" />
                    </div>
                    <p className="text-sm font-bold text-gray-800 dark:text-white mb-1">
                        {translate('admin_loading') || 'Loading telemetry data...'}
                    </p>
                    <p className="text-xs text-gray-400">Fetching live database metrics from Supabase</p>
                </div>
            );
        }

        switch (activeSection) {
            case 'overview':
                return (
                    <AdminOverview
                        stats={stats}
                        metrics={metrics}
                        profiles={profiles}
                        sessions={sessions}
                        onNavigateUsers={() => setActiveSection('users')}
                        onUserClick={handleProfileClick}
                    />
                );
            case 'users':
                return selectedProfile ? (
                    <AdminUserDetail
                        profile={selectedProfile}
                        profileStats={profileStats}
                        profileSessions={profileSessions}
                        loadingProfileData={loadingProfileData}
                        onBack={() => setSelectedProfile(null)}
                        onSubClick={handleSubClick}
                        onSaveNotes={handleSaveNotes}
                        isSavingNotes={isSavingNotes}
                        showToast={showToast}
                        translate={translate}
                    />
                ) : (
                    <AdminUsersList
                        profiles={profiles}
                        sessions={sessions}
                        onProfileClick={handleProfileClick}
                        onSubClick={handleSubClick}
                        onDropdownAction={handleDropdownAction}
                        activeDropdown={activeDropdown}
                        setActiveDropdown={setActiveDropdown}
                        translate={translate}
                    />
                );
            case 'feedback':
                return (
                    <div className="space-y-4">
                        {/* Search & Filters */}
                        <div className="bg-white dark:bg-surface-dark2 p-4 sm:p-5 rounded-3xl border border-gray-100 dark:border-white/[0.06] shadow-sm space-y-3">
                            <div className="relative">
                                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={translate('search_feedback') || 'Search feedback submissions...'}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-white/[0.05] border border-gray-100 dark:border-transparent rounded-2xl text-[13px] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all font-medium"
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap items-center">
                                {['all', 'idea', 'bug', 'other'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setFilter(t)}
                                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all
                                            ${filter === t
                                                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                                                : 'bg-gray-100 dark:bg-white/[0.06] text-gray-600 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-white/[0.1]'}`}
                                    >
                                        {translate(t)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <AdminFeedback feedback={filteredFeedback} onDelete={handleDeleteClick} translate={translate} />
                    </div>
                );
            case 'updates':
                return (
                    <AdminUpdates
                        updates={updates}
                        showUpdateModal={showUpdateModal}
                        setShowUpdateModal={setShowUpdateModal}
                        newUpdate={newUpdate}
                        setNewUpdate={setNewUpdate}
                        addFeature={addFeature}
                        removeFeature={removeFeature}
                        updateFeature={updateFeature}
                        onPublish={handlePublishUpdate}
                        onDelete={handleDeleteUpdateClick}
                        translate={translate}
                    />
                );
            case 'broadcast':
                return (
                    <AdminBroadcast
                        broadcastTitle={broadcastTitle}
                        setBroadcastTitle={setBroadcastTitle}
                        broadcastMessage={broadcastMessage}
                        setBroadcastMessage={setBroadcastMessage}
                        onSend={handleSendBroadcast}
                        translate={translate}
                    />
                );
            default:
                return null;
        }
    };

    /* ─── Layout ─── */
    return (
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col animate-fade-in transition-colors duration-300 overflow-hidden">

            {/* ─────── Desktop Control & Breadcrumb Header ─────── */}
            {hideHeader ? (
                <div className="shrink-0 bg-white dark:bg-surface-dark2 border-b border-gray-100 dark:border-white/[0.06] px-6 py-3.5 flex items-center justify-between gap-4 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-xs font-bold text-gray-700 dark:text-gray-200 active:scale-95 transition-all shadow-sm"
                        >
                            <ArrowLeft size={14} strokeWidth={2.5} />
                            <span>Back to App</span>
                        </button>
                        <div className="h-4 w-px bg-gray-200 dark:bg-white/10 hidden sm:block" />
                        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                            <span>Admin Console</span>
                            <span className="text-gray-300 dark:text-white/20">/</span>
                            <span className="font-extrabold text-violet-600 dark:text-violet-400 capitalize">
                                {tabs.find(t => t.id === activeSection)?.label}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Cloud Telemetry Online</span>
                        </div>

                        <button
                            onClick={fetchAllData}
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-50 dark:bg-violet-500/10 hover:bg-violet-100 dark:hover:bg-violet-500/20 border border-violet-200/60 dark:border-violet-500/20 text-xs font-bold text-violet-700 dark:text-violet-300 active:scale-95 transition-all"
                            title="Refresh Data"
                        >
                            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                        </button>
                    </div>
                </div>
            ) : (
                /* ─────── Mobile Sticky Header ─────── */
                <div
                    className="shrink-0 transition-colors duration-300 sticky top-0 z-20 bg-gray-50/90 dark:bg-surface-dark/90 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.06] px-4 pb-3"
                    style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.75rem)' }}
                >
                    <div className="flex items-center justify-between min-h-[36px] mb-3">
                        <button
                            onClick={onBack}
                            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center text-gray-700 dark:text-white/70 hover:bg-gray-200 dark:hover:bg-white/[0.14] active:scale-90 transition-all duration-150"
                            aria-label="Back"
                        >
                            <ArrowLeft size={16} strokeWidth={2.5} />
                        </button>
                        <div className="text-center">
                            <h2 className="text-[17px] font-extrabold text-gray-900 dark:text-white leading-tight">
                                {translate('admin_dashboard_title') || 'Admin Panel'}
                            </h2>
                            <p className="text-[11px] font-medium text-gray-500 dark:text-white/50 leading-none mt-0.5">
                                Operations & Telemetry
                            </p>
                        </div>
                        <button
                            onClick={fetchAllData}
                            className="w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 active:rotate-180 transition-all duration-500"
                            aria-label="Refresh Data"
                        >
                            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        </button>
                    </div>

                    {/* Mobile tabs row */}
                    <div className="relative">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pr-6">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeSection === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => { setActiveSection(tab.id); if (tab.id !== 'users') setSelectedProfile(null); }}
                                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap
                                            ${isActive
                                                ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25'
                                                : 'bg-white dark:bg-white/[0.05] text-gray-600 dark:text-white/60 border border-gray-100 dark:border-transparent'}`}
                                    >
                                        <Icon size={13} />
                                        <span>{tab.label}</span>
                                        {tab.badge && (
                                            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-black ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                                                {tab.badge}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ─────── Desktop Layout: Sidebar + Content ─────── */}
            <div className="flex-1 flex overflow-hidden">

                {/* Desktop Left Sidebar (hidden on mobile) */}
                <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-surface-dark2 border-r border-gray-100 dark:border-white/[0.06] p-4 gap-2 overflow-y-auto">
                    <div className="px-3 pt-2 pb-1 flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                            <SlidersHorizontal size={12} />
                            <span>Operations Hub</span>
                        </p>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Operational" />
                    </div>

                    <div className="space-y-1">
                        {tabs.map(tab => (
                            <SidebarTab
                                key={tab.id}
                                tab={tab}
                                isActive={activeSection === tab.id}
                                onClick={() => { setActiveSection(tab.id); if (tab.id !== 'users') setSelectedProfile(null); }}
                            />
                        ))}
                    </div>

                    {/* Telemetry card at bottom of sidebar */}
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/[0.05] space-y-3">
                        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100/80 dark:border-white/[0.04] space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                    <ShieldCheck size={13} className="text-violet-500" />
                                    Security Role
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300">
                                    Master Admin
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                                <span className="font-bold text-gray-500 dark:text-gray-400">Database Engine</span>
                                <span className="font-black text-gray-800 dark:text-white">Supabase Live</span>
                            </div>
                        </div>

                        <button
                            onClick={fetchAllData}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-gray-100/80 dark:bg-white/[0.05] hover:bg-gray-200 dark:hover:bg-white/[0.1] text-gray-600 dark:text-white/70 active:scale-[0.98] transition-all text-xs font-bold"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin text-violet-600' : 'text-gray-400'} />
                            <span>{loading ? 'Syncing Engine...' : 'Sync Telemetry'}</span>
                        </button>
                    </div>
                </aside>

                {/* ─────── Main Content Scrollable Area ─────── */}
                <main className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-16">

                        {/* ─────── Executive Command Center Hero Banner ─────── */}
                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-indigo-600 to-indigo-900 dark:from-violet-950 dark:via-indigo-950 dark:to-surface-dark3 border border-violet-400/30 dark:border-white/10 shadow-xl shadow-violet-500/15 text-white p-6 sm:p-8">
                            {/* Ambient decorative glowing backdrops */}
                            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-violet-400/25 blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-indigo-400/25 blur-3xl pointer-events-none" />
                            <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-10 pointer-events-none hidden md:block">
                                <ShieldCheck size={160} strokeWidth={1} />
                            </div>

                            <div className="relative z-10 max-w-3xl space-y-3">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 dark:bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-violet-100 tracking-wide uppercase">
                                    <Sparkles size={13} />
                                    <span>System Command Center</span>
                                </div>

                                <div className="space-y-1">
                                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                                        SpendWise Operations Console
                                    </h1>
                                    <p className="text-sm sm:text-base text-violet-100/90 leading-relaxed font-medium">
                                        Real-time user engagement analytics, subscription sovereignty, data auditing, and system broadcasts.
                                    </p>
                                </div>

                                {/* Live Telemetry Pills (2x2 grid on mobile, flex row on tablet/desktop) */}
                                <div className="pt-2 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-2.5 text-[11px] sm:text-xs font-semibold">
                                    <span className="px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white flex items-center justify-center sm:justify-start gap-1.5 min-w-0">
                                        <Users size={13} className="shrink-0" />
                                        <span className="truncate">{stats.users} Total Accounts</span>
                                    </span>
                                    <span className="px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white flex items-center justify-center sm:justify-start gap-1.5 min-w-0">
                                        <Activity size={13} className="shrink-0" />
                                        <span className="truncate">{metrics.proUsers} Pro Subscribers</span>
                                    </span>
                                    <span className="px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-white flex items-center justify-center sm:justify-start gap-1.5 min-w-0">
                                        <CheckCircle2 size={13} className="shrink-0" />
                                        <span className="truncate">{stats.transactions} Ledger Entries</span>
                                    </span>
                                    <span className="px-2.5 sm:px-3 py-2 sm:py-1.5 rounded-xl bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-200 flex items-center justify-center sm:justify-start gap-1.5 min-w-0">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                        <span className="truncate">Database Online</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Section Header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight capitalize">
                                    {tabs.find(t => t.id === activeSection)?.label}
                                </h2>
                                {activeSection === 'users' && selectedProfile ? (
                                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                                        <button onClick={() => setSelectedProfile(null)} className="text-violet-600 dark:text-violet-400 hover:underline font-bold">
                                            Users List
                                        </button>
                                        <span>/</span>
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                                            {selectedProfile.display_name || selectedProfile.email?.split('@')[0]}
                                        </span>
                                    </p>
                                ) : (
                                    <p className="text-xs text-gray-400 mt-0.5 font-medium">
                                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Section Content */}
                        {renderContent()}
                    </div>
                </main>
            </div>

            {/* ─────── Modals ─────── */}

            {/* Feedback Delete Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title={translate('delete_feedback_title')}
                message={translate('delete_feedback_msg')}
                confirmText={translate('delete')}
                type="danger"
            />

            {/* Subscription Modal */}
            <ConfirmationModal
                isOpen={showSubModal}
                onClose={() => setShowSubModal(false)}
                onConfirm={confirmSubscriptionChange}
                title={subTarget?.status === 'pro' ? translate('admin_grant_pro_title') : translate('admin_revoke_pro_title')}
                message={subTarget?.status === 'pro'
                    ? translate('admin_grant_pro_message', { email: subTarget?.profile?.email })
                    : translate('admin_revoke_pro_message', { email: subTarget?.profile?.email })
                }
                confirmText={subTarget?.status === 'pro' ? translate('admin_grant_pro_btn') : translate('admin_revoke_pro_btn')}
                type={subTarget?.status === 'pro' ? 'info' : 'danger'}
            />

            {/* Update Delete Modal */}
            <ConfirmationModal
                isOpen={showUpdateDeleteModal}
                onClose={() => setShowUpdateDeleteModal(false)}
                onConfirm={confirmDeleteUpdate}
                title={translate('admin_delete_update_confirm')}
                message={translate('admin_delete_update_message', { version: updateToDelete?.version })}
                confirmText={translate('delete')}
                type="danger"
            />

            {/* Notes Modal */}
            {showNotesModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowNotesModal(false)} />
                    <div className="relative w-full max-w-lg bg-white dark:bg-surface-dark2 rounded-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col border border-gray-100 dark:border-white/10">
                        <div className="p-6 border-b border-gray-100 dark:border-white/[0.06] flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-gray-900 dark:text-white">{translate('admin_notes')}</h3>
                                <p className="text-xs text-gray-400">{notesTarget?.email}</p>
                            </div>
                            <button onClick={() => setShowNotesModal(false)} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full hover:bg-gray-200 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <textarea
                                value={editingNotes}
                                onChange={e => setEditingNotes(e.target.value)}
                                className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/[0.06] text-[13px] min-h-[200px] focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none font-medium"
                                placeholder="Write internal notes about this account..."
                            />
                            <button
                                onClick={handleSaveNotesModal}
                                disabled={isSavingNotes}
                                className="w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-violet-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
                            >
                                {isSavingNotes ? <RefreshCw size={18} className="animate-spin" /> : null}
                                {translate('save') || 'Save Notes'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminView;
