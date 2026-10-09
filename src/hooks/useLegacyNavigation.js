import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useEffect } from 'react';

export function useLegacyNavigation() {
    const location = useLocation();
    const navigate = useNavigate();

    const activeTab = useMemo(() => {
        const path = location.pathname;
        if (path === '/' || path === '/home') return 'home';
        if (path.startsWith('/settings/account')) return 'account';
        if (path.startsWith('/settings/general')) return 'general';
        if (path.startsWith('/settings/security')) return 'security';
        if (path.startsWith('/settings/privacy')) return 'privacy';
        if (path.startsWith('/settings/backup')) return 'backup';
        if (path.startsWith('/settings/feedback')) return 'feedback';
        if (path.startsWith('/settings/guide')) return 'guide';
        if (path.startsWith('/settings')) return 'profile'; // Profile is settings root
        if (path.startsWith('/admin')) return 'admin';
        if (path.startsWith('/stats')) return 'stats';
        if (path.startsWith('/history')) return 'history';
        if (path.startsWith('/recurring')) return 'recurring';
        if (path.startsWith('/goals')) return 'goals';
        if (path.startsWith('/budgets')) return 'budgets';
        if (path.startsWith('/advisor')) return 'advisor';
        if (path.startsWith('/upgrade')) return 'upgrade';
        return 'home';
    }, [location.pathname]);

    const setActiveTab = (tab) => {
        const paths = {
            'home': '/',
            'stats': '/stats',
            'history': '/history',
            'profile': '/settings',
            'account': '/settings/account',
            'general': '/settings/general',
            'security': '/settings/security',
            'privacy': '/settings/privacy',
            'backup': '/settings/backup',
            'feedback': '/settings/feedback',
            'guide': '/settings/guide',
            'admin': '/admin',
            'recurring': '/recurring',
            'goals': '/goals',
            'budgets': '/budgets',
            'advisor': '/advisor',
            'upgrade': '/upgrade',
        };
        navigate(paths[tab] || '/');
    };

    // The logic previously maintained a previousTab state in local storage
    const previousTab = localStorage.getItem('lastPreviousTab') || 'home';
    const setPreviousTab = (tab) => localStorage.setItem('lastPreviousTab', tab);

    // Save activeTab to local storage for backward compatibility
    useEffect(() => {
        localStorage.setItem('lastActiveTab', activeTab);
        if (typeof window !== 'undefined' && window.history) {
            // Replace state so that window.history.state.tab exists
            window.history.replaceState({ tab: activeTab }, '', location.pathname);
        }
    }, [activeTab, location.pathname]);

    return { activeTab, setActiveTab, previousTab, setPreviousTab };
}
