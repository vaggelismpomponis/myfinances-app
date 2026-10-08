import React, { useMemo } from 'react';
import {
    Users, RefreshCw, MessageSquare, Zap, Award, Activity, TrendingUp,
    Clock, Calendar, Smartphone, Monitor, Globe, ChevronRight, ArrowUpRight,
    Crown, Trophy, ArrowRight, ShieldCheck, CheckCircle2
} from 'lucide-react';

/* ─── Donut Chart (Enhanced SVG) ─── */
const DonutChart = ({ segments, size = 110, strokeWidth = 16 }) => {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const cx = size / 2;
    const cy = size / 2;

    const total = segments.reduce((s, seg) => s + seg.value, 0);
    let offset = 0;

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
            <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="currentColor"
                className="text-gray-100 dark:text-white/[0.06]"
                strokeWidth={strokeWidth}
            />
            {total > 0 && segments.map((seg, i) => {
                const dash = (seg.value / total) * circ;
                const gap = circ - dash;
                const el = (
                    <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${dash} ${gap}`}
                        strokeDashoffset={-offset}
                        strokeLinecap="round"
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
const StatCard = ({
    icon: Icon,
    label,
    value,
    subtext,
    color,
    bgColor,
    iconBg,
    onClick,
    trend,
    badge
}) => (
    <div
        onClick={onClick}
        className={`relative bg-white dark:bg-surface-dark2 p-5 sm:p-6 rounded-3xl border border-gray-100 dark:border-white/[0.06] shadow-sm
                    flex flex-col justify-between overflow-hidden transition-all duration-300 group
                    ${onClick ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1 hover:border-violet-300/60 dark:hover:border-violet-500/30' : 'hover:shadow-md'}`}
    >
        {/* Ambient background glow orb */}
        <div className={`absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-50 dark:opacity-20 pointer-events-none ${bgColor}`} />

        <div className="flex items-center justify-between relative z-10">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${iconBg} ${color} shadow-sm border border-white/60 dark:border-white/10 group-hover:scale-110 transition-transform duration-300`}>
                <Icon size={20} strokeWidth={2.2} />
            </div>
            {badge && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-white/[0.08] text-gray-600 dark:text-gray-300 border border-gray-200/50 dark:border-white/[0.06]">
                    {badge}
                </span>
            )}
            {onClick && !badge && (
                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-white/[0.05] flex items-center justify-center text-gray-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all">
                    <ChevronRight size={15} />
                </div>
            )}
        </div>

        <div className="mt-4 relative z-10">
            <p className="text-[11px] font-extrabold text-gray-400 dark:text-gray-400 uppercase tracking-widest mb-1 truncate">{label}</p>
            <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight">{value}</span>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.05] flex items-center justify-between text-xs">
                {trend !== undefined ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-200/50 dark:border-emerald-500/20">
                        <ArrowUpRight size={12} strokeWidth={2.5} />
                        +{trend} this month
                    </span>
                ) : (
                    <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">{subtext || 'Telemetry active'}</span>
                )}
                {onClick && (
                    <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                        Inspect <ArrowRight size={10} />
                    </span>
                )}
            </div>
        </div>
    </div>
);

/* ─── Platform breakdown bar ─── */
const PlatformBar = ({ label, count, total, color, icon: Icon }) => {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-gray-500 dark:text-gray-400">
                        <Icon size={13} />
                    </div>
                    <span className="font-bold text-gray-700 dark:text-gray-200">{label}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-extrabold text-gray-900 dark:text-white">{count}</span>
                    <span className="text-[11px] text-gray-400 font-semibold">({pct}%)</span>
                </div>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ${color}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
};

/* ─── Most Active Users Row ─── */
const UserLeaderboardRow = ({ user, idx, onClick }) => {
    const rankBadges = [
        { label: '#1', bg: 'bg-amber-500 text-white shadow-md shadow-amber-500/30' },
        { label: '#2', bg: 'bg-slate-400 text-white shadow-md shadow-slate-400/30' },
        { label: '#3', bg: 'bg-amber-700 text-white shadow-md shadow-amber-700/30' },
        { label: `#${idx + 1}`, bg: 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300' }
    ];
    const badge = rankBadges[idx] || rankBadges[3];
    const initials = (user.display_name || user.email || '?').slice(0, 2).toUpperCase();

    return (
        <div
            onClick={() => onClick && onClick(user)}
            className="flex items-center gap-3.5 p-3.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.04] border border-transparent hover:border-gray-100 dark:hover:border-white/[0.05] transition-all cursor-pointer group"
        >
            {/* Rank badge */}
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 ${badge.bg}`}>
                {badge.label}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-black text-white text-xs shadow-sm shrink-0">
                {initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                        {user.display_name || user.email?.split('@')[0]}
                    </p>
                    {user.subscription_status === 'pro' && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 uppercase tracking-widest shrink-0 flex items-center gap-0.5 shadow-sm">
                            <Crown size={8} className="fill-yellow-900" /> PRO
                        </span>
                    )}
                </div>
                <p className="text-[11px] text-gray-400 truncate mt-0.5 font-medium">{user.email}</p>
            </div>

            {/* Sessions count */}
            <div className="text-right shrink-0">
                <div className="flex items-center gap-1 justify-end">
                    <Zap size={12} className="text-violet-500" />
                    <p className="text-base font-black text-gray-900 dark:text-white">{user.sessionCount}</p>
                </div>
                <p className="text-[9px] text-gray-400 uppercase font-extrabold tracking-wider">sessions</p>
            </div>

            <ChevronRight size={15} className="text-gray-300 dark:text-gray-600 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all shrink-0" />
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

    const proConversionRate = stats.users > 0 ? Math.round((metrics.proUsers / stats.users) * 100) : 0;
    const active7DaysRate = stats.users > 0 ? Math.round((metrics.active7Days / stats.users) * 100) : 0;
    const active30DaysRate = stats.users > 0 ? Math.round((metrics.active30Days / stats.users) * 100) : 0;
    const estimatedMrr = (metrics.proUsers * 2.99).toFixed(2);
    const avgTxPerUser = stats.users > 0 ? (stats.transactions / stats.users).toFixed(1) : '0';

    const subSegments = [
        { value: metrics.proUsers, color: '#8b5cf6' },
        { value: metrics.freeUsers, color: '#94a3b8' },
        { value: metrics.canceledUsers, color: '#f43f5e' },
    ];

    const totalPlatform = platformCounts.mobile + platformCounts.desktop + platformCounts.other;

    return (
        <div className="space-y-6 animate-fade-in">

            {/* ─────── 4 Core KPI Bento Cards ─────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 min-[1106px]:grid-cols-4 gap-4">
                <StatCard
                    icon={Users}
                    label="Total User Base"
                    value={stats.users}
                    color="text-blue-500"
                    bgColor="bg-blue-500"
                    iconBg="bg-blue-50 dark:bg-blue-500/10"
                    onClick={onNavigateUsers}
                    trend={joinedThisMonth > 0 ? joinedThisMonth : undefined}
                    badge={`${proConversionRate}% Pro`}
                />
                <StatCard
                    icon={RefreshCw}
                    label="Recorded Transactions"
                    value={stats.transactions}
                    subtext={`~${avgTxPerUser} entries / user`}
                    color="text-emerald-500"
                    bgColor="bg-emerald-500"
                    iconBg="bg-emerald-50 dark:bg-emerald-500/10"
                    badge="Ledger Live"
                />
                <StatCard
                    icon={MessageSquare}
                    label="User Feedback"
                    value={stats.feedback}
                    subtext="Community submissions"
                    color="text-amber-500"
                    bgColor="bg-amber-500"
                    iconBg="bg-amber-50 dark:bg-amber-500/10"
                    badge={stats.feedback > 0 ? `${stats.feedback} Submissions` : 'Zero Bugs'}
                />
                <StatCard
                    icon={Zap}
                    label="Total App Sessions"
                    value={stats.activity}
                    subtext={`${metrics.active7Days} active in last 7d`}
                    color="text-violet-500"
                    bgColor="bg-violet-500"
                    iconBg="bg-violet-50 dark:bg-violet-500/10"
                    badge="Heartbeat Online"
                />
            </div>

            {/* ─────── Mid Section: Subscription Split + Engagement + Platform ─────── */}
            <div className="grid grid-cols-1 min-[1106px]:grid-cols-2 min-[1408px]:grid-cols-3 gap-5">

                {/* Subscription Sovereignty Card */}
                <div className="bg-white dark:bg-surface-dark2 p-6 rounded-3xl border border-gray-100 dark:border-white/[0.06] shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/[0.05] mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                    <Crown size={16} strokeWidth={2.2} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white">Subscription Split</h3>
                                    <p className="text-[11px] text-gray-400 font-medium">Tier breakdown & estimated MRR</p>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-200/50 dark:border-violet-500/20">
                                ~€{estimatedMrr}/mo
                            </span>
                        </div>

                        <div className="flex items-center gap-5 my-2">
                            <div className="relative shrink-0">
                                <DonutChart segments={subSegments} size={110} strokeWidth={16} />
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <p className="text-xl font-black text-gray-900 dark:text-white leading-none">{stats.users}</p>
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Users</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-2.5">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-sm" />
                                        <span className="font-bold text-gray-700 dark:text-gray-200">Pro Tier</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-violet-600 dark:text-violet-400">{metrics.proUsers}</span>
                                        <span className="text-[11px] text-gray-400 font-semibold ml-1">({proConversionRate}%)</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                                        <span className="font-bold text-gray-700 dark:text-gray-200">Free Tier</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-gray-900 dark:text-white">{metrics.freeUsers}</span>
                                        <span className="text-[11px] text-gray-400 font-semibold ml-1">({stats.users > 0 ? 100 - proConversionRate : 0}%)</span>
                                    </div>
                                </div>

                                {metrics.canceledUsers > 0 && (
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                                            <span className="font-bold text-gray-700 dark:text-gray-200">Canceled</span>
                                        </div>
                                        <span className="font-black text-rose-600 dark:text-rose-400">{metrics.canceledUsers}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.05] flex items-center justify-between text-[11px] text-gray-400 font-medium">
                        <span>Conversion Rate</span>
                        <span className="font-extrabold text-violet-600 dark:text-violet-400">{proConversionRate}% of user base</span>
                    </div>
                </div>

                {/* User Engagement & Retention Card */}
                <div className="bg-white dark:bg-surface-dark2 p-6 rounded-3xl border border-gray-100 dark:border-white/[0.06] shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/[0.05] mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <Activity size={16} strokeWidth={2.2} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white">User Engagement</h3>
                                    <p className="text-[11px] text-gray-400 font-medium">Active retention telemetry</p>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20">
                                Live
                            </span>
                        </div>

                        <div className="space-y-4">
                            {/* Last 7 Days */}
                            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-500/10 border border-emerald-100/60 dark:border-emerald-500/15">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Clock size={13} className="text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Last 7 Days (WAU)</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-black text-emerald-700 dark:text-emerald-300">{metrics.active7Days}</span>
                                        <span className="text-[10px] font-semibold text-emerald-600/70 dark:text-emerald-400/70">users</span>
                                    </div>
                                </div>
                                <div className="h-2 bg-emerald-200/50 dark:bg-emerald-500/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                                        style={{ width: `${active7DaysRate}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 mt-1.5 font-semibold">
                                    {active7DaysRate}% of registered user base
                                </p>
                            </div>

                            {/* Last 30 Days */}
                            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-100/60 dark:border-blue-500/15">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={13} className="text-blue-600 dark:text-blue-400" />
                                        <span className="text-xs font-bold text-blue-800 dark:text-blue-300">Last 30 Days (MAU)</span>
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-lg font-black text-blue-700 dark:text-blue-300">{metrics.active30Days}</span>
                                        <span className="text-[10px] font-semibold text-blue-600/70 dark:text-blue-400/70">users</span>
                                    </div>
                                </div>
                                <div className="h-2 bg-blue-200/50 dark:bg-blue-500/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 rounded-full transition-all duration-700"
                                        style={{ width: `${active30DaysRate}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-blue-700/70 dark:text-blue-400/70 mt-1.5 font-semibold">
                                    {active30DaysRate}% of registered user base
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.05] flex items-center justify-between text-[11px] text-gray-400 font-medium">
                        <span>Stickiness (7d/30d)</span>
                        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                            {metrics.active30Days > 0 ? Math.round((metrics.active7Days / metrics.active30Days) * 100) : 0}%
                        </span>
                    </div>
                </div>

                {/* Platform & Client Distribution Card */}
                <div className="bg-white dark:bg-surface-dark2 p-6 rounded-3xl border border-gray-100 dark:border-white/[0.06] shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/[0.05] mb-5">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <Globe size={16} strokeWidth={2.2} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 dark:text-white">Platform Split</h3>
                                    <p className="text-[11px] text-gray-400 font-medium">Client OS & form factor telemetry</p>
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20">
                                {totalPlatform} Sessions
                            </span>
                        </div>

                        <div className="space-y-4">
                            <PlatformBar
                                label="Mobile (iOS & Android)"
                                count={platformCounts.mobile}
                                total={totalPlatform}
                                color="bg-gradient-to-r from-violet-500 to-indigo-500"
                                icon={Smartphone}
                            />
                            <PlatformBar
                                label="Desktop Web & PWA"
                                count={platformCounts.desktop}
                                total={totalPlatform}
                                color="bg-gradient-to-r from-blue-500 to-cyan-500"
                                icon={Monitor}
                            />
                            {platformCounts.other > 0 && (
                                <PlatformBar
                                    label="Other Clients"
                                    count={platformCounts.other}
                                    total={totalPlatform}
                                    color="bg-gray-400"
                                    icon={Globe}
                                />
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.05] flex items-center justify-between text-[11px] text-gray-400 font-medium">
                        <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            Multi-client sync active
                        </span>
                        <span className="font-bold text-gray-700 dark:text-gray-300">{totalPlatform} recorded</span>
                    </div>
                </div>
            </div>

            {/* ─────── Most Active Users Leaderboard ─────── */}
            <div className="bg-white dark:bg-surface-dark2 rounded-3xl border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 dark:border-white/[0.05]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <Trophy size={18} strokeWidth={2.2} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-gray-900 dark:text-white">Most Active Accounts</h3>
                            <p className="text-[11px] text-gray-400 font-medium">Top user engagement leaderboard by app sessions</p>
                        </div>
                    </div>
                    <button
                        onClick={onNavigateUsers}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/20 text-xs font-bold transition-all"
                    >
                        <span>View All Users</span>
                        <ArrowRight size={13} />
                    </button>
                </div>

                <div className="p-3 sm:p-4 divide-y divide-gray-50 dark:divide-white/[0.03]">
                    {metrics.mostActiveUsers.length > 0 ? (
                        metrics.mostActiveUsers.map((user, idx) => (
                            <UserLeaderboardRow
                                key={user.id}
                                user={user}
                                idx={idx}
                                onClick={onUserClick}
                            />
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <Activity size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No session telemetry recorded yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
