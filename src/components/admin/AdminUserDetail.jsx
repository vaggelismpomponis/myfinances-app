import React, { useState } from 'react';
import {
    ChevronLeft, RefreshCw, Activity, Shield, FileText, ExternalLink, Mail,
    Copy, Smartphone, Monitor, Radio, MapPin, Clock, Calendar, User,
    TrendingUp, Target, CreditCard, CheckCircle2
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
    return new Date(dateStr).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
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

/* ─── Mini Stat Badge ─── */
const StatBadge = ({ icon: Icon, label, value, color, bgColor, loading }) => (
    <div className={`flex flex-col gap-1.5 p-4 rounded-2xl ${bgColor} border border-transparent`}>
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color} bg-white/60 dark:bg-white/10`}>
            <Icon size={14} />
        </div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-[22px] font-black text-gray-900 dark:text-white">
            {loading ? <span className="animate-pulse text-gray-300">—</span> : value}
        </p>
    </div>
);

/* ─── Session Timeline Row ─── */
const SessionRow = ({ session, isLatest, idx }) => {
    const deviceIcon = () => {
        const d = session.device || '';
        if (d.includes('iPhone') || d.includes('Android') || d.includes('Mobile')) return <Smartphone size={14} />;
        if (d.includes('Windows') || d.includes('Mac') || d.includes('Linux')) return <Monitor size={14} />;
        return <Radio size={14} />;
    };

    return (
        <div className="flex gap-3 group">
            {/* Timeline indicator */}
            <div className="flex flex-col items-center shrink-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 z-10
                    ${isLatest
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
                        : 'bg-white dark:bg-surface-dark2 border-gray-100 dark:border-white/10 text-gray-400'}`}
                >
                    {deviceIcon()}
                </div>
                {idx < 9 && <div className="w-0.5 flex-1 bg-gray-100 dark:bg-white/5 mt-1 mb-1" />}
            </div>

            {/* Content */}
            <div className={`flex-1 pb-4 ${idx >= 9 ? 'pb-0' : ''}`}>
                <div className={`p-3 rounded-2xl border transition-colors
                    ${isLatest
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20'
                        : 'bg-gray-50 dark:bg-white/[0.03] border-gray-100 dark:border-transparent group-hover:border-gray-200 dark:group-hover:border-white/10'}`}
                >
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                            <p className={`text-[12px] font-bold leading-tight ${isLatest ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-800 dark:text-white'}`}>
                                {session.device || 'Unknown Device'}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                {new Date(session.last_active).toLocaleString()}
                            </p>
                        </div>
                        {isLatest && (
                            <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase rounded-lg shrink-0">Latest</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        {session.location && !session.location.includes('Unknown') && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                <MapPin size={10} className="text-gray-400" />
                                <span>{session.location}</span>
                            </div>
                        )}
                        {session.ip && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                                <Shield size={10} />
                                <span>{session.ip}</span>
                            </div>
                        )}
                        {session.last_active && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                <Clock size={10} />
                                <span>{timeAgo(session.last_active)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── Inline Notes Editor ─── */
const InlineNotes = ({ notes, onSave, isSaving, translate }) => {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(notes || '');

    const handleSave = async () => {
        await onSave(value);
        setEditing(false);
    };

    return (
        <div>
            {editing ? (
                <div className="space-y-2">
                    <textarea
                        autoFocus
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        className="w-full p-3.5 bg-amber-50/50 dark:bg-amber-500/5 rounded-2xl border border-amber-200 dark:border-amber-500/20 text-[12px] text-amber-900/80 dark:text-amber-300/80 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-amber-400/40 resize-none transition-all leading-relaxed"
                        placeholder="Notes about this user..."
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[12px] font-black rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
                        >
                            {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                            {translate('save')}
                        </button>
                        <button
                            onClick={() => { setValue(notes || ''); setEditing(false); }}
                            className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-500 text-[12px] font-bold rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={() => setEditing(true)}
                    className="min-h-[80px] p-3.5 bg-amber-50 dark:bg-amber-500/5 rounded-2xl border border-amber-100 dark:border-amber-500/10 cursor-text hover:border-amber-300 dark:hover:border-amber-500/30 transition-all group"
                >
                    {notes ? (
                        <p className="text-[12px] text-amber-900/70 dark:text-amber-400/70 leading-relaxed italic">{notes}</p>
                    ) : (
                        <p className="text-[12px] text-amber-400/50 italic">Click to add notes…</p>
                    )}
                    <p className="text-[9px] text-amber-400/40 uppercase font-bold tracking-wider mt-2 opacity-0 group-hover:opacity-100 transition-opacity">Click to edit</p>
                </div>
            )}
        </div>
    );
};

/* ─── Main AdminUserDetail Component ─── */
const AdminUserDetail = ({
    profile, profileStats, profileSessions,
    loadingProfileData, onBack, onSubClick, onSaveNotes,
    isSavingNotes, showToast, translate
}) => {
    if (!profile) return null;

    const initials = (profile.display_name || profile.email || '?').slice(0, 2).toUpperCase();
    const allSessions = profileSessions || [];
    const totalSessions = allSessions.length;
    const firstSeen = allSessions.length > 0
        ? new Date(Math.min(...allSessions.map(s => new Date(s.last_active).getTime()))).toLocaleDateString()
        : null;

    const handleStripeClick = () => {
        if (profile.stripe_customer_id) {
            window.open(`https://dashboard.stripe.com/customers/${profile.stripe_customer_id}`, '_blank');
        } else {
            window.open(`https://dashboard.stripe.com/search?query=${encodeURIComponent(profile.email)}`, '_blank');
        }
    };

    return (
        <div className="space-y-5 animate-fade-in pb-10">

            {/* Back + Actions Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-[12px] font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-white/5 px-3.5 py-2 rounded-xl border border-gray-100 dark:border-transparent transition-all hover:shadow-sm"
                >
                    <ChevronLeft size={15} /> {translate('back') || 'Back'}
                </button>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { navigator.clipboard.writeText(profile.email || ''); showToast(translate('copied') || 'Copied!', 'success'); }}
                        className="p-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-xl text-gray-400 hover:text-violet-500 hover:border-violet-200 transition-all"
                        title="Copy email"
                    >
                        <Mail size={16} />
                    </button>
                    <button
                        onClick={handleStripeClick}
                        className="p-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-xl text-gray-400 hover:text-violet-500 hover:border-violet-200 transition-all"
                        title="Open in Stripe"
                    >
                        <ExternalLink size={16} />
                    </button>
                    <button
                        onClick={() => { navigator.clipboard.writeText(profile.id); showToast(translate('copied') || 'Copied!', 'success'); }}
                        className="p-2.5 bg-white dark:bg-white/5 border border-gray-100 dark:border-transparent rounded-xl text-gray-400 hover:text-violet-500 hover:border-violet-200 transition-all"
                        title="Copy user ID"
                    >
                        <Copy size={16} />
                    </button>
                    <button
                        onClick={() => onSubClick(profile, profile.subscription_status === 'pro' ? 'free' : 'pro')}
                        className={`px-4 py-2.5 rounded-xl text-[12px] font-black transition-all ${profile.subscription_status === 'pro'
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100'
                        }`}
                    >
                        {profile.subscription_status === 'pro' ? 'Revoke Pro' : 'Grant Pro'}
                    </button>
                </div>
            </div>

            {/* Identity Card */}
            <div className="bg-white dark:bg-surface-dark2 rounded-3xl border border-gray-100 dark:border-transparent shadow-sm overflow-hidden">
                <div className={`h-20 bg-gradient-to-r ${avatarGradient(profile.id)} opacity-20 dark:opacity-10`} />
                <div className="px-6 pb-6 -mt-10">
                    <div className="flex items-end gap-4 mb-4">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${avatarGradient(profile.id)} flex items-center justify-center font-black text-white text-2xl shadow-xl border-4 border-white dark:border-surface-dark2`}>
                            {initials}
                        </div>
                        <div className="pb-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight">
                                    {profile.display_name || profile.email?.split('@')[0]}
                                </h2>
                                {profile.subscription_status === 'pro' && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 uppercase tracking-widest">PRO</span>
                                )}
                                {profile.subscription_status === 'canceled' && (
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-600 uppercase tracking-widest">Canceled</span>
                                )}
                            </div>
                            <p className="text-[13px] text-gray-400 mt-0.5">{profile.email}</p>
                        </div>
                    </div>

                    {/* Identity details grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {profile.created_at && (
                            <div className="flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-white/[0.03] rounded-2xl">
                                <Calendar size={14} className="text-violet-500 shrink-0" />
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Joined</p>
                                    <p className="text-[11px] font-black text-gray-900 dark:text-white">{formatDate(profile.created_at)}</p>
                                </div>
                            </div>
                        )}
                        {profile.last_sign_in_at && (
                            <div className="flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-white/[0.03] rounded-2xl">
                                <Clock size={14} className="text-blue-500 shrink-0" />
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Last Sign In</p>
                                    <p className="text-[11px] font-black text-gray-900 dark:text-white">{timeAgo(profile.last_sign_in_at)}</p>
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-white/[0.03] rounded-2xl">
                            <Activity size={14} className="text-emerald-500 shrink-0" />
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Sessions</p>
                                <p className="text-[11px] font-black text-gray-900 dark:text-white">{totalSessions}</p>
                            </div>
                        </div>
                        {profile.stripe_customer_id && (
                            <div className="flex items-center gap-2.5 p-3 bg-gray-50 dark:bg-white/[0.03] rounded-2xl">
                                <CreditCard size={14} className="text-amber-500 shrink-0" />
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Stripe</p>
                                    <p className="text-[11px] font-black text-gray-900 dark:text-white font-mono truncate">{profile.stripe_customer_id.slice(0, 12)}…</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-3 gap-3">
                <StatBadge icon={TrendingUp} label="Transactions" value={profileStats.transactions}
                    color="text-violet-500" bgColor="bg-violet-50 dark:bg-violet-500/10" loading={loadingProfileData} />
                <StatBadge icon={Target} label="Budgets" value={profileStats.budgets}
                    color="text-blue-500" bgColor="bg-blue-50 dark:bg-blue-500/10" loading={loadingProfileData} />
                <StatBadge icon={TrendingUp} label="Goals" value={profileStats.goals}
                    color="text-emerald-500" bgColor="bg-emerald-50 dark:bg-emerald-500/10" loading={loadingProfileData} />
            </div>

            {/* Session Timeline + Notes/Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Session Timeline — takes 2/3 width on desktop */}
                <div className="lg:col-span-2 bg-white dark:bg-surface-dark2 rounded-3xl border border-gray-100 dark:border-transparent shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-gray-50 dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <Activity size={16} className="text-violet-500" />
                            <h3 className="text-[13px] font-black text-gray-900 dark:text-white uppercase tracking-wider">Session History</h3>
                        </div>
                        {firstSeen && (
                            <span className="text-[10px] text-gray-400 font-medium">Since {firstSeen}</span>
                        )}
                    </div>
                    <div className="p-5">
                        {loadingProfileData ? (
                            <div className="flex flex-col items-center py-12 opacity-50">
                                <RefreshCw size={24} className="animate-spin text-violet-500 mb-3" />
                                <p className="text-[11px] font-bold text-gray-400">Loading activity…</p>
                            </div>
                        ) : allSessions.length > 0 ? (
                            <>
                                {allSessions.slice(0, 10).map((sess, idx) => (
                                    <SessionRow key={idx} session={sess} isLatest={idx === 0} idx={idx} />
                                ))}
                                {allSessions.length > 10 && (
                                    <p className="text-[10px] font-bold text-gray-400 uppercase text-center mt-2 pt-3 border-t border-gray-50 dark:border-white/5">
                                        Showing 10 of {allSessions.length} sessions
                                    </p>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-400 text-[12px] italic">No sessions recorded yet</div>
                        )}
                    </div>
                </div>

                {/* Right Column: Tools + Notes */}
                <div className="space-y-4">
                    {/* Admin Tools */}
                    <div className="bg-white dark:bg-surface-dark2 rounded-3xl border border-gray-100 dark:border-transparent shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield size={15} className="text-blue-500" />
                            <h3 className="text-[12px] font-black text-gray-900 dark:text-white uppercase tracking-wider">Admin Tools</h3>
                        </div>
                        <div className="space-y-2">
                            <button onClick={handleStripeClick}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.03] hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-2xl border border-gray-100 dark:border-transparent transition-all group">
                                <div className="flex items-center gap-2.5">
                                    <ExternalLink size={14} className="text-gray-400 group-hover:text-violet-500 transition-colors" />
                                    <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">Stripe Dashboard</span>
                                </div>
                                <ChevronLeft size={12} className="rotate-180 text-gray-300 group-hover:text-violet-400 transition-colors" />
                            </button>
                            <a href={`mailto:${profile.email}`}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.03] hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-2xl border border-gray-100 dark:border-transparent transition-all group">
                                <div className="flex items-center gap-2.5">
                                    <Mail size={14} className="text-gray-400 group-hover:text-violet-500 transition-colors" />
                                    <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">Send Email</span>
                                </div>
                                <ChevronLeft size={12} className="rotate-180 text-gray-300 group-hover:text-violet-400 transition-colors" />
                            </a>
                            <button onClick={() => { navigator.clipboard.writeText(profile.id); showToast(translate('copied') || 'Copied!', 'success'); }}
                                className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-white/[0.03] hover:bg-violet-50 dark:hover:bg-violet-500/10 rounded-2xl border border-gray-100 dark:border-transparent transition-all group">
                                <div className="flex items-center gap-2.5">
                                    <Copy size={14} className="text-gray-400 group-hover:text-violet-500 transition-colors" />
                                    <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">Copy User ID</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Notes — inline editable */}
                    <div className="bg-white dark:bg-surface-dark2 rounded-3xl border border-gray-100 dark:border-transparent shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <FileText size={15} className="text-amber-500" />
                            <h3 className="text-[12px] font-black text-gray-900 dark:text-white uppercase tracking-wider">Admin Notes</h3>
                        </div>
                        <InlineNotes
                            notes={profile.admin_notes}
                            onSave={(text) => onSaveNotes(profile.id, text)}
                            isSaving={isSavingNotes}
                            translate={translate}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUserDetail;
