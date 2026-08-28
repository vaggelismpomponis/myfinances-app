import React, { useMemo } from 'react';
import {
    Users, RefreshCw, MessageSquare, Zap, Award, Activity, TrendingUp,
    Clock, Calendar, Smartphone, Monitor, Globe, ChevronRight, ArrowUpRight
} from 'lucide-react';

/* ─── Donut Chart (pure SVG) ─── */
const DonutChart = ({ segments, size = 120, strokeWidth = 18 }) => {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const cx = size / 2;
    const cy = size / 2;

    const total = segments.reduce((s, seg) => s + seg.value, 0);
    let offset = 0;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor"
                className="text-gray-100 dark:text-white/5" strokeWidth={strokeWidth} />
            {total > 0 && segments.map((seg, i) => {
                const dash = (seg.value / total) * circ;
                const gap = circ - dash;
                const el = (
                    <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                        stroke={seg.color} strokeWidth={strokeWidth}
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="butt"
                        style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.16,1,0.3,1)' }}
                    />
                );
                offset += dash;
                return el;
            })}
        </svg>
    );
};

/* ─── KPI Stat Card ─── */
const StatCard = ({ icon: Icon, label, value, color, bgColor, onClick, trend }) => (
    <div
        onClick={onClick}
        className={`relative bg-white dark:bg-surface-dark2 p-5 rounded-2xl border border-gray-100 dark:border-transparent shadow-sm
                    flex flex-col gap-3 overflow-hidden
                    ${onClick ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all group' : ''}`}
    >
        <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-[0.06] dark:opacity-[0.08] ${bgColor}`} />
        <div className="flex items-center justify-between">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bgColor} ${color} transition-colors`}>
                <Icon size={16} />
            </div>
            {onClick && (
                <ChevronRight size={14} className="text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
        </div>
        <div>
            <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5 truncate">{label}</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
        </div>
        {trend !== undefined && (
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                <ArrowUpRight size={12} />
                <span>+{trend} this month</span>
            </div>
        )}
    </div>
);

/* ─── Platform breakdown bar ─── */
const PlatformBar = ({ label, count, total, color, icon: Icon }) => {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon size={13} className="text-gray-400" />
                    <span className="text-[12px] font-bold text-gray-700 dark:text-gray-300">{label}</span>
                </div>
                <span className="text-[12px] font-black text-gray-900 dark:text-white">{count}</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
};

/* ─── Most Active Users ─── */
const UserLeaderboardRow = ({ user, idx, onClick }) => {
    const colors = [
        'from-amber-400 to-yellow-500',
        'from-slate-400 to-slate-500',
        'from-orange-400 to-amber-600',
        'from-violet-400 to-violet-600',
        'from-blue-400 to-blue-600',
    ];
    const initials = (user.display_name || user.email || '?').slice(0, 2).toUpperCase();

    return (
        <div
            onClick={() => onClick && onClick(user)}
            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors cursor-pointer group"
        >
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${colors[idx] || colors[4]} flex items-center justify-center font-black text-white text-[11px] shadow-sm shrink-0`}>
                {initials}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                    {user.display_name || user.email?.split('@')[0]}
                    {user.subscription_status === 'pro' && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 uppercase tracking-widest">PRO</span>
                    )}
                </p>
                <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
            </div>
            <div className="text-right shrink-0">
                <p className="text-[16px] font-black text-gray-900 dark:text-white">{user.sessionCount}</p>
                <p className="text-[9px] text-gray-400 uppercase font-bold tracking-wider">sessions</p>
            </div>
        </div>
    );
};

/* ─── Main AdminOverview Component ─── */
const AdminOverview = ({ stats, metrics, profiles, sessions, onNavigateUsers, onUserClick }) => {

    // Platform breakdown from session data
    const platformCounts = useMemo(() => {
        const mobile = sessions.filter(s =>
            s.device && (s.device.includes('iPhone') || s.device.includes('Android') || s.device.includes('Mobile'))
        ).length;
        const desktop = sessions.filter(s =>
            s.device && (s.device.includes('Windows') || s.device.includes('Mac') || s.device.includes('Linux') ||
                s.device.includes('Desktop') || s.device.includes('Chrome') || s.device.includes('Firefox'))
        ).length;
        const other = sessions.length - mobile - desktop;
        return { mobile, desktop, other: Math.max(0, other) };
    }, [sessions]);

    // Users joined this month
    const joinedThisMonth = useMemo(() => {
        const now = new Date();
        return profiles.filter(p => {
            if (!p.created_at) return false;
            const d = new Date(p.created_at);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }).length;
    }, [profiles]);

    const subSegments = [
        { value: metrics.proUsers, color: '#7c3aed' },
        { value: metrics.freeUsers, color: '#e5e7eb' },
        { value: metrics.canceledUsers, color: '#f43f5e' },
    ];

    const totalPlatform = platformCounts.mobile + platformCounts.desktop + platformCounts.other;

    return (
        <div className="space-y-5 animate-fade-in">

            {/* KPI Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <StatCard
                    icon={Users} label="Total Users" value={stats.users}
                    color="text-blue-500" bgColor="bg-blue-50 dark:bg-blue-500/10"
                    onClick={onNavigateUsers}
                    trend={joinedThisMonth > 0 ? joinedThisMonth : undefined}
                />
                <StatCard
                    icon={RefreshCw} label="Transactions" value={stats.transactions}
                    color="text-emerald-500" bgColor="bg-emerald-50 dark:bg-emerald-500/10"
                />
                <StatCard
                    icon={MessageSquare} label="Feedback" value={stats.feedback}
                    color="text-amber-500" bgColor="bg-amber-50 dark:bg-amber-500/10"
                />
                <StatCard
                    icon={Zap} label="App Sessions" value={stats.activity}
                    color="text-violet-500" bgColor="bg-violet-50 dark:bg-violet-500/10"
                />
            </div>

            {/* Middle Row: Subscription Donut + Engagement + Platform */}
            <div className="grid grid-cols-1 min-[1106px]:grid-cols-2 min-[1408px]:grid-cols-3 gap-4">

                {/* Subscription Breakdown */}
                <div className="bg-white dark:bg-surface-dark2 p-5 rounded-3xl border border-gray-100 dark:border-transparent shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Award size={16} className="text-violet-500" />
                        <h3 className="text-[13px] font-black text-gray-900 dark:text-white">Subscription Split</h3>
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="relative shrink-0">
                            <DonutChart segments={subSegments} size={100} strokeWidth={16} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-[18px] font-black text-gray-900 dark:text-white">{stats.users}</p>
                            </div>
                        </div>
                        <div className="flex-1 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
                                    <span className="text-[12px] font-bold text-gray-600 dark:text-gray-300">Pro</span>
                                </div>
                                <span className="text-[13px] font-black text-violet-600 dark:text-violet-400">{metrics.proUsers}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-500" />
                                    <span className="text-[12px] font-bold text-gray-600 dark:text-gray-300">Free</span>
                                </div>
                                <span className="text-[13px] font-black text-gray-900 dark:text-white">{metrics.freeUsers}</span>
                            </div>
                            {metrics.canceledUsers > 0 && (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                        <span className="text-[12px] font-bold text-gray-600 dark:text-gray-300">Canceled</span>
                                    </div>
                                    <span className="text-[13px] font-black text-rose-600 dark:text-rose-400">{metrics.canceledUsers}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Engagement */}
                <div className="bg-white dark:bg-surface-dark2 p-5 rounded-3xl border border-gray-100 dark:border-transparent shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity size={16} className="text-emerald-500" />
                        <h3 className="text-[13px] font-black text-gray-900 dark:text-white">User Engagement</h3>
                    </div>
                    <div className="space-y-3">
                        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400">Last 7 Days</span>
                                </div>
                                <span className="text-[18px] font-black text-emerald-600 dark:text-emerald-400">{metrics.active7Days}</span>
                            </div>
                            <div className="h-1.5 bg-emerald-100 dark:bg-emerald-500/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                    style={{ width: stats.users > 0 ? `${(metrics.active7Days / stats.users) * 100}%` : '0%' }}
                                />
                            </div>
                            <p className="text-[10px] text-emerald-600/60 dark:text-emerald-400/60 mt-1 font-medium">
                                {stats.users > 0 ? Math.round((metrics.active7Days / stats.users) * 100) : 0}% of users
                            </p>
                        </div>
                        <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-500/10">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-blue-600 dark:text-blue-400" />
                                    <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">Last 30 Days</span>
                                </div>
                                <span className="text-[18px] font-black text-blue-600 dark:text-blue-400">{metrics.active30Days}</span>
                            </div>
                            <div className="h-1.5 bg-blue-100 dark:bg-blue-500/20 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                                    style={{ width: stats.users > 0 ? `${(metrics.active30Days / stats.users) * 100}%` : '0%' }}
                                />
                            </div>
                            <p className="text-[10px] text-blue-600/60 dark:text-blue-400/60 mt-1 font-medium">
                                {stats.users > 0 ? Math.round((metrics.active30Days / stats.users) * 100) : 0}% of users
                            </p>
                        </div>
                    </div>
                </div>

                {/* Platform Breakdown */}
                <div className="bg-white dark:bg-surface-dark2 p-5 rounded-3xl border border-gray-100 dark:border-transparent shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe size={16} className="text-blue-500" />
                        <h3 className="text-[13px] font-black text-gray-900 dark:text-white">Platform Split</h3>
                    </div>
                    <div className="space-y-4">
                        <PlatformBar label="Mobile" count={platformCounts.mobile} total={totalPlatform}
                            color="bg-violet-500" icon={Smartphone} />
                        <PlatformBar label="Desktop" count={platformCounts.desktop} total={totalPlatform}
                            color="bg-blue-500" icon={Monitor} />
                        {platformCounts.other > 0 && (
                            <PlatformBar label="Other" count={platformCounts.other} total={totalPlatform}
                                color="bg-gray-400" icon={Globe} />
                        )}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-4 font-medium">{totalPlatform} total sessions tracked</p>
                </div>
            </div>

            {/* Most Active Users */}
            <div className="bg-white dark:bg-surface-dark2 rounded-3xl border border-gray-100 dark:border-transparent shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-50 dark:border-white/5">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-amber-500" />
                        <h3 className="text-[14px] font-black text-gray-900 dark:text-white">Most Active Users</h3>
                    </div>
                    <button onClick={onNavigateUsers} className="text-[11px] font-black text-violet-500 hover:text-violet-600 uppercase tracking-wider transition-colors">
                        View All →
                    </button>
                </div>
                <div className="p-3">
                    {metrics.mostActiveUsers.length > 0 ? (
                        metrics.mostActiveUsers.map((user, idx) => (
                            <UserLeaderboardRow key={user.id} user={user} idx={idx} onClick={onUserClick} />
                        ))
                    ) : (
                        <p className="text-center py-8 text-[13px] text-gray-400 italic">No session data yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
