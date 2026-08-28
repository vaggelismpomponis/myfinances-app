import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, RefreshCw, Search, X,
    LayoutDashboard, Users, MessageSquare, Radio,
    Filter, ChevronLeft, ChevronRight
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
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-200 group
                ${isActive
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
                    : 'text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white'}`}
        >
            <Icon size={17} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-violet-500 transition-colors'} />
            <span className="text-[13px] font-bold">{tab.label}</span>
            {isActive && <ChevronRight size={14} className="ml-auto text-white/60" />}
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
            // Legacy modal support
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
        { id: 'overview', icon: LayoutDashboard, label: translate('admin_tab_overview') || 'Overview' },
        { id: 'users', icon: Users, label: translate('admin_tab_users') || 'Users' },
        { id: 'feedback', icon: MessageSquare, label: translate('admin_tab_feedback') || 'Feedback' },
        { id: 'updates', icon: RefreshCw, label: translate('admin_tab_updates') || 'Updates' },
        { id: 'broadcast', icon: Radio, label: translate('admin_tab_broadcast') || 'Broadcast' },
    ];

    /* ─── Content Renderer ─── */
    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-64 opacity-50">
                    <RefreshCw size={30} className="animate-spin text-violet-500 mb-3" />
                    <p className="text-[12px] font-medium text-gray-500">{translate('admin_loading')}</p>
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
                    <div className="space-y-3">
                        {/* Search & Filters */}
                        <div className="space-y-3">
                            <div className="relative">
                                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder={translate('search_feedback')}
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-surface-dark2 border border-gray-100 dark:border-transparent rounded-2xl text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-500/30 shadow-sm"
                                />
                            </div>
                            <div className="flex gap-2 flex-wrap">
                                {['all', 'idea', 'bug', 'other'].map(t => (
                                    <button key={t} onClick={() => setFilter(t)}
                                        className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black capitalize transition-all
                                            ${filter === t ? 'bg-violet-600 text-white shadow-md' : 'bg-white dark:bg-surface-dark2 text-gray-500 dark:text-white/60 border border-gray-100 dark:border-transparent'}`}>
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
        <div className="h-full bg-gray-50 dark:bg-surface-dark flex flex-col animate-fade-in transition-colors duration-300">

            {/* ── Mobile/Compact Header ── */}
            <div className={`shrink-0 transition-colors duration-300 sticky top-0 z-10
                            ${hideHeader
                                ? 'bg-transparent border-none px-4 pt-4 pb-2'
                                : 'bg-gray-50 dark:bg-surface-dark border-b border-gray-100 dark:border-transparent px-4 pb-4 backdrop-blur-xl'}`}
                style={!hideHeader ? { paddingTop: 'calc(env(safe-area-inset-top) + 1rem)' } : {}}
            >
                <div className="flex items-center justify-center relative mb-4 min-h-[36px]">
                    <button onClick={onBack}
                        className="absolute left-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center text-gray-500 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-white/[0.14] active:scale-90 transition-all duration-150">
                        <ArrowLeft size={15} strokeWidth={2.5} />
                    </button>
                    {!hideHeader && (
                        <h2 className="text-[17px] font-bold text-gray-900 dark:text-white text-center">
                            {translate('admin_dashboard_title')}
                        </h2>
                    )}
                    <button onClick={fetchAllData}
                        className="absolute right-0 w-9 h-9 rounded-full bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400 active:rotate-180 transition-all duration-500">
                        <RefreshCw size={17} />
                    </button>
                </div>

                {/* ── Mobile tabs (horizontal scroll, hidden on desktop) ── */}
                <div className="lg:hidden relative">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pr-8">
                        {tabs.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeSection === tab.id;
                            return (
                                <button key={tab.id}
                                    onClick={() => { setActiveSection(tab.id); if (tab.id !== 'users') setSelectedProfile(null); }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all whitespace-nowrap
                                        ${isActive ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30' : 'bg-white dark:bg-white/[0.05] text-gray-500 dark:text-white/60 border border-gray-100 dark:border-transparent hover:bg-gray-50 dark:hover:bg-white/[0.1]'}`}
                                >
                                    <Icon size={13} />{tab.label}
                                </button>
                            );
                        })}
                    </div>
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-50 dark:from-surface-dark to-transparent pointer-events-none flex items-center justify-end pb-1">
                        <ChevronRight size={16} className="text-gray-400 dark:text-gray-500 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* ── Desktop Layout: sidebar + content ── */}
            <div className="flex-1 flex overflow-hidden">

                {/* Desktop Left Sidebar (hidden on mobile) */}
                <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white dark:bg-surface-dark2 border-r border-gray-100 dark:border-white/[0.05] p-4 gap-1.5 overflow-y-auto">
                    <div className="mb-3 px-2">
                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Navigation</p>
                    </div>
                    {tabs.map(tab => (
                        <SidebarTab
                            key={tab.id}
                            tab={tab}
                            isActive={activeSection === tab.id}
                            onClick={() => { setActiveSection(tab.id); if (tab.id !== 'users') setSelectedProfile(null); }}
                        />
                    ))}
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5">
                        <button onClick={fetchAllData}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-[12px] font-bold">
                            <RefreshCw size={15} className="text-gray-400" />
                            Refresh Data
                        </button>
                    </div>
                </aside>

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 lg:p-6 space-y-4 pb-10">
                        {/* Desktop section title */}
                        <div className="hidden lg:flex items-center justify-between mb-2">
                            <div>
                                <h1 className="text-[22px] font-black text-gray-900 dark:text-white">
                                    {tabs.find(t => t.id === activeSection)?.label}
                                </h1>
                                {activeSection === 'users' && selectedProfile && (
                                    <p className="text-[12px] text-gray-400 mt-0.5">
                                        ← <button onClick={() => setSelectedProfile(null)} className="text-violet-500 hover:text-violet-600 font-bold transition-colors">Users</button>
                                        {' '}/{' '}{selectedProfile.display_name || selectedProfile.email?.split('@')[0]}
                                    </p>
                                )}
                                {activeSection === 'overview' && (
                                    <p className="text-[12px] text-gray-400 mt-0.5">
                                        {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                )}
                            </div>
                        </div>
                        {renderContent()}
                    </div>
                </main>
            </div>

            {/* ── Modals ── */}

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

            {/* Legacy Notes Modal (from user list dropdown) */}
            {showNotesModal && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setShowNotesModal(false)} />
                    <div className="relative w-full max-w-lg bg-white dark:bg-surface-dark2 rounded-3xl overflow-hidden shadow-2xl animate-slide-up flex flex-col">
                        <div className="p-6 border-b border-gray-100 dark:border-transparent flex items-center justify-between">
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
                                className="w-full p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-transparent text-[13px] min-h-[200px] focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none"
                                placeholder="Write notes about this user..."
                            />
                            <button
                                onClick={handleSaveNotesModal}
                                disabled={isSavingNotes}
                                className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white font-black rounded-2xl shadow-xl shadow-violet-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {isSavingNotes ? <RefreshCw size={18} className="animate-spin" /> : null}
                                {translate('save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminView;
