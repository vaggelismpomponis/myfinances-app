import { useEffect, useRef } from 'react';

export function useAppNavigation({ activeTab, setActiveTab, previousTab }) {
    const isPopping = useRef(false);

    useEffect(() => {
        if (!window.history.state?.tab) {
            window.history.replaceState({ tab: activeTab }, '', '');
        }

        const handlePopState = (event) => {
            if (event.state && event.state.tab) {
                isPopping.current = true;
                setActiveTab(event.state.tab);
            } else {
                isPopping.current = true;
                setActiveTab('home');
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [activeTab, setActiveTab]);

    useEffect(() => {
        localStorage.setItem('lastActiveTab', activeTab);
        if (isPopping.current) {
            isPopping.current = false;
            return;
        }
        window.history.pushState({ tab: activeTab }, '', '');
    }, [activeTab]);

    useEffect(() => {
        localStorage.setItem('lastPreviousTab', previousTab);
    }, [previousTab]);
}
