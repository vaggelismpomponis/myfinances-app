import { useState, useEffect } from 'react';

/**
 * Returns true when the viewport width is ≥ 1024 px (desktop breakpoint).
 * Reactively updates on resize.
 */
const useIsDesktop = () => {
    const [isDesktop, setIsDesktop] = useState(
        typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
    );

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mql = window.matchMedia('(min-width: 1024px)');
        const handler = (e) => setIsDesktop(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    return isDesktop;
};

export default useIsDesktop;
