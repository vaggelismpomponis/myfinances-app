import React, { useState, useMemo } from 'react';
import {
    Search, ChevronRight, MoreVertical, ExternalLink, Mail, Copy, FileText,
    Users, ArrowUpDown, Smartphone, Monitor, Globe, Clock
} from 'lucide-react';

/* ─── Utility ─── */
const timeAgo = (dateStr) => {
    if (!dateStr) return null;
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    if (mins < 2) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const avatarGradient = (id) => {
    const gradients = [
        'from-violet-500 to-purple-600',
        'from-blue-500 to-indigo-600',
        'from-emerald-500 to-teal-600',
        'from-amber-500 to-orange-600',
        'from-rose-500 to-pink-600',
        'from-cyan-500 to-blue-600',
        'from-fuchsia-500 to-violet-600',
        'from-green-500 to-emerald-600',
    ];
    const hash = (id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
};

/* ─── User Row Card ─── */
const UserRow = ({ profile, onProfileClick, onSubClick, onDropdownAction, activeDropdown, setActiveDropdown, translate, sessions }) => {
    const initials = (profile.display_name || profile.email || '?').slice(0, 2).toUpperCase();
    const lastActive = profile.latest_session?.last_active;
    const sessionCount = sessions.filter(s => s.user_id === profile.id).length;
    const isOnline = lastActive && (Date.now() - new Date(lastActive).getTime()) < 15 * 60 * 1000; // 15min

    const deviceIcon = () => {
        const d = profile.latest_session?.device || '';
        if (d.includes('iPhone') || d.includes('Android') || d.includes('Mobile')) return <Smartphone size={11} />;
        if (d.includes('Windows') || d.includes('Mac') || d.includes('Linux')) return <Monitor size={11} />;
        return <Globe size={11} />;
    };

    return (
        <div
            onClick={() => onProfileClick(profile)}
            className="group relative bg-white dark:bg-surface-dark2 rounded-2xl border border-gray-100 dark:border-transparent shadow-sm
                       hover:shadow-md hover:border-violet-100 dark:hover:border-violet-500/20 hover:scale-[1.005]
                       active:scale-[0.998] transition-all cursor-pointer overflow-hidden"
        >
            <div className="flex items-center gap-3 p-4">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarGradient(profile.id)} flex items-center justify-center font-black text-white text-[13px] shadow-sm`}>
                        {initials}
                    </div>
                    {isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-surface-dark2" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[13px] font-bold text-gray-900 dark:text-white leading-tight truncate">
                            {profile.display_name || profile.latest_session?.display_name || profile.email?.split('@')[0]}
                        </p>
                        {profile.subscription_status === 'pro' && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 uppercase tracking-widest shrink-0">PRO</span>
                        )}
                        {profile.subscription_status === 'canceled' && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 uppercase tracking-widest shrink-0">Canceled</span>
                        )}
                    </div>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{profile.email}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {profile.created_at && (
                            <span className="text-[10px] text-gray-400 font-medium">Joined {formatDate(profile.created_at)}</span>
                        )}
                        {lastActive && (
                            <>
                                <span className="text-gray-200 dark:text-white/10">·</span>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                    <Clock size={9} />
                                    {timeAgo(lastActive)}
                                </div>
                            </>
                        )}
                        {profile.latest_session?.device && (
                            <>
                                <span className="text-gray-200 dark:text-white/10">·</span>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                    {deviceIcon()}
                                    <span className="truncate max-w-[100px]">{profile.latest_session.device}</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right side */}
                <div className="shrink-0 flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {/* Session count badge */}
                    {sessionCount > 0 && (
                        <div className="hidden sm:flex flex-col items-center px-3 py-1.5 bg-gray-50 dark:bg-white/5 rounded-xl">
                            <span className="text-[14px] font-black text-gray-900 dark:text-white">{sessionCount}</span>
                            <span className="text-[8px] uppercase font-bold text-gray-400 tracking-wider">sess.</span>
                        </div>
                    )}

                    {/* Grant/Revoke */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onSubClick(profile, profile.subscription_status === 'pro' ? 'free' : 'pro'); }}
                        className={`hidden sm:block px-3 py-1.5 rounded-xl text-[10px] font-black transition-all border whitespace-nowrap
                            ${profile.subscription_status === 'pro'
                                ? 'border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/30 dark:hover:bg-rose-500/10 dark:text-rose-400'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/30 dark:hover:bg-emerald-500/10 dark:text-emerald-400'
                            }`}
                    >
                        {profile.subscription_status === 'pro' ? translate('admin_revoke_pro') : translate('admin_grant_pro')}
                    </button>

                    {/* Dropdown */}
                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === profile.id ? null : profile.id); }}
                            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        >
                            <MoreVertical size={16} />
                        </button>
                        {activeDropdown === profile.id && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} />
                                <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-surface-dark border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden py-1.5 animate-fade-in">
                                    {/* Mobile only: grant/revoke */}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onSubClick(profile, profile.subscription_status === 'pro' ? 'free' : 'pro'); setActiveDropdown(null); }}
                                        className="sm:hidden w-full text-left px-4 py-2.5 text-[12px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                                    >
                                        {profile.subscription_status === 'pro' ? '🔴 Revoke Pro' : '✅ Grant Pro'}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDropdownAction('stripe', profile); setActiveDropdown(null); }}
                                        className="w-full text-left px-4 py-2.5 text-[12px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                                    >
                                        <ExternalLink size={14} className="text-gray-400" /> {translate('admin_view_on_stripe')}
                                    </button>
                                    <a
                                        href={`mailto:${profile.email}`}
                                        onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }}
                                        className="w-full text-left px-4 py-2.5 text-[12px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                                    >
                                        <Mail size={14} className="text-gray-400" /> {translate('admin_send_email')}
                                    </a>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDropdownAction('copyId', profile); setActiveDropdown(null); }}
                                        className="w-full text-left px-4 py-2.5 text-[12px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors"
                                    >
                                        <Copy size={14} className="text-gray-400" /> {translate('admin_copy_user_id')}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDropdownAction('notes', profile); setActiveDropdown(null); }}
                                        className="w-full text-left px-4 py-2.5 text-[12px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2.5 transition-colors border-t border-gray-50 dark:border-white/5"
                                    >
                                        <FileText size={14} className="text-gray-400" /> {translate('admin_notes')}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 group-hover:text-violet-400 transition-colors" />
                </div>
            </div>
        </div>
    );
};

/* ─── Main AdminUsersList Component ─── */
const AdminUsersList = ({ profiles, sessions, onProfileClick, onSubClick, onDropdownAction, activeDropdown, setActiveDropdown, translate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('joined'); // 'joined' | 'active' | 'name' | 'sessions'
    const [sortDir, setSortDir] = useState('desc');

    const sessionCountMap = useMemo(() => {
        return sessions.reduce((acc, s) => {
            acc[s.user_id] = (acc[s.user_id] || 0) + 1;
            return acc;
        }, {});
    }, [sessions]);

    const filtered = useMemo(() => {
        let list = profiles.filter(p => {
            const matchFilter = filter === 'all' || p.subscription_status === filter;
            const q = searchTerm.toLowerCase();
            const matchSearch = !q ||
                (p.email || '').toLowerCase().includes(q) ||
                (p.display_name || '').toLowerCase().includes(q);
            return matchFilter && matchSearch;
        });

        list = [...list].sort((a, b) => {
            let va, vb;
            if (sortBy === 'name') { va = (a.display_name || a.email || '').toLowerCase(); vb = (b.display_name || b.email || '').toLowerCase(); }
            else if (sortBy === 'active') { va = new Date(a.latest_session?.last_active || 0).getTime(); vb = new Date(b.latest_session?.last_active || 0).getTime(); }
            else if (sortBy === 'sessions') { va = sessionCountMap[a.id] || 0; vb = sessionCountMap[b.id] || 0; }
            else { va = new Date(a.created_at || 0).getTime(); vb = new Date(b.created_at || 0).getTime(); }
            return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
        });

        return list;
    }, [profiles, sessions, filter, searchTerm, sortBy, sortDir, sessionCountMap]);

    const toggleSort = (col) => {
        if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortBy(col); setSortDir('desc'); }
    };

    const SortBtn = ({ col, label }) => (
        <button
            onClick={() => toggleSort(col)}
            className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-lg transition-all
                ${sortBy === col ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'}`}
        >
            {label}
            <ArrowUpDown size={10} className={sortBy === col ? 'opacity-100' : 'opacity-40'} />
        </button>
    );

    return (
        <div className="space-y-3 animate-fade-in">
            {/* Search */}
            <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder={translate('search_users') || 'Search by name or email…'}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-surface-dark2 border border-gray-100 dark:border-transparent rounded-2xl text-[13px] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all shadow-sm"
                />
            </div>

            {/* Filters + Sort row */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-1.5 flex-1">
                    {['all', 'pro', 'free'].map(t => (
                        <button key={t}
                            onClick={() => setFilter(t)}
                            className={`px-3.5 py-1.5 rounded-xl text-[11px] font-black capitalize transition-all
                                ${filter === t ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20' : 'bg-white dark:bg-surface-dark2 text-gray-500 dark:text-white/60 border border-gray-100 dark:border-transparent hover:border-violet-200 dark:hover:border-violet-500/30'}`}
                        >
                            {t === 'all' ? `All (${profiles.length})` : t === 'pro' ? `Pro (${profiles.filter(p => p.subscription_status === 'pro').length})` : `Free (${profiles.filter(p => p.subscription_status === 'free').length})`}
                        </button>
                    ))}
                </div>
                <div className="hidden md:flex items-center gap-1 bg-white dark:bg-surface-dark2 border border-gray-100 dark:border-transparent rounded-xl p-1 shadow-sm">
                    <SortBtn col="joined" label="Joined" />
                    <SortBtn col="active" label="Active" />
                    <SortBtn col="sessions" label="Sessions" />
                    <SortBtn col="name" label="Name" />
                </div>
            </div>

            {/* Count */}
            <p className="text-[11px] font-bold text-gray-400 px-1">
                {filtered.length} {filtered.length === 1 ? 'user' : 'users'} found
            </p>

            {/* User List */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 opacity-40">
                    <Users size={40} className="mx-auto mb-3" />
                    <p className="text-sm font-medium">{translate('admin_no_users')}</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(profile => (
                        <UserRow
                            key={profile.id}
                            profile={profile}
                            sessions={sessions}
                            onProfileClick={onProfileClick}
                            onSubClick={onSubClick}
                            onDropdownAction={onDropdownAction}
                            activeDropdown={activeDropdown}
                            setActiveDropdown={setActiveDropdown}
                            translate={translate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminUsersList;
