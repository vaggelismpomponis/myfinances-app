import React, { useCallback, useMemo } from 'react';
import { Joyride, ACTIONS, EVENTS, STATUS } from 'react-joyride';
import TourBubble from './TourBubble';
import { Wallet, Plus, Home, ShieldCheck } from 'lucide-react';

// Inject spotlight styles via CSS to avoid react-joyride spreading them onto SVG elements
const SPOTLIGHT_STYLE = `
  .react-joyride__spotlight {
    border-radius: 1.25rem !important;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.5), 0 0 0 6px rgba(139, 92, 246, 0.15) !important;
  }
`;
if (typeof document !== 'undefined' && !document.getElementById('joyride-spotlight-fix')) {
    const style = document.createElement('style');
    style.id = 'joyride-spotlight-fix';
    style.textContent = SPOTLIGHT_STYLE;
    document.head.appendChild(style);
}

// ─────────────────────────────────────────────────────────────────
// Tour Step Definitions
// Targets must match real DOM IDs in the rendered app.
// For desktop, navbar items are in DesktopSidebar and the Add button is in DesktopTopBar.
// ─────────────────────────────────────────────────────────────────
export const getTourSteps = (isDesktop = false) => [
    {
        target: 'body',
        placement: 'center',
        disableBeacon: true,
        hideCloseButton: false,
        data: {
            titleKey: 'tour_step1_title',
            descKey:  'tour_step1_desc',
            Icon:     Wallet,
            gradient: 'from-violet-600 via-indigo-600 to-purple-700',
            orbColor: 'bg-violet-400',
            iconBg:   'bg-white/20',
            iconColor: 'text-white',
            accent:   '#7c3aed',
        },
    },
    {
        target: '#tour-add-button',
        placement: isDesktop ? 'bottom-end' : 'top',
        disableBeacon: true,
        spotlightPadding: 8,
        data: {
            titleKey: 'tour_step2_title',
            descKey:  'tour_step2_desc',
            Icon:     Plus,
            gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
            orbColor: 'bg-emerald-400',
            iconBg:   'bg-white/20',
            iconColor: 'text-white',
            accent:   '#10b981',
        },
    },
    {
        target: '#nav-home',
        placement: isDesktop ? 'right' : 'top',
        disableBeacon: true,
        spotlightPadding: 6,
        data: {
            titleKey: 'tour_step3_title',
            descKey:  'tour_step3_desc',
            Icon:     Home,
            gradient: 'from-blue-600 via-indigo-500 to-violet-600',
            orbColor: 'bg-blue-400',
            iconBg:   'bg-white/20',
            iconColor: 'text-white',
            accent:   '#4f46e5',
        },
    },
    {
        target: '#nav-history',
        placement: isDesktop ? 'right' : 'top',
        disableBeacon: true,
        spotlightPadding: 6,
        data: {
            titleKey: 'tour_step4_title',
            descKey:  'tour_step4_desc',
            Icon:     Wallet,
            gradient: 'from-amber-500 via-orange-500 to-rose-500',
            orbColor: 'bg-amber-400',
            iconBg:   'bg-white/20',
            iconColor: 'text-white',
            accent:   '#f59e0b',
        },
    },
    {
        target: '#nav-profile',
        placement: isDesktop ? 'right' : 'top',
        disableBeacon: true,
        spotlightPadding: 6,
        data: {
            titleKey: 'tour_step5_title',
            descKey:  'tour_step5_desc',
            Icon:     ShieldCheck,
            gradient: 'from-rose-500 via-pink-500 to-fuchsia-600',
            orbColor: 'bg-rose-400',
            iconBg:   'bg-white/20',
            iconColor: 'text-white',
            accent:   '#ec4899',
        },
    },
];

export const TOUR_STEPS = getTourSteps(false);

// ─────────────────────────────────────────────────────────────────
// OnboardingTour
// Props:
//   run       {boolean}  — whether tour is running
//   onFinish  {function} — called when tour ends (finished OR skipped)
//   isDesktop {boolean}  — adapts placements for desktop sidebar / header
// ─────────────────────────────────────────────────────────────────
const OnboardingTour = ({ run, onFinish, isDesktop = false }) => {
    const steps = useMemo(() => getTourSteps(isDesktop), [isDesktop]);

    const handleCallback = useCallback((data) => {
        const { action, status, type } = data;

        if (type === EVENTS.TARGET_NOT_FOUND) {
            console.warn('[OnboardingTour] Target element not found:', data.step?.target);
        }

        const isDone =
            status === STATUS.FINISHED ||
            status === STATUS.SKIPPED ||
            (type === EVENTS.STEP_AFTER && action === ACTIONS.CLOSE);

        if (isDone) {
            onFinish?.();
        }
    }, [onFinish]);

    return (
        <Joyride
            steps={steps}
            run={run}
            continuous
            showProgress={false}
            showSkipButton
            disableScrolling={isDesktop}
            disableOverlayClose={false}
            spotlightClicks={false}
            callback={handleCallback}
            tooltipComponent={TourBubble}
            styles={{
                options: {
                    arrowColor: 'transparent',
                    zIndex: 10000,
                    overlayColor: 'rgba(0, 0, 0, 0.55)',
                },
                overlay: {
                    backdropFilter: 'blur(2px)',
                    WebkitBackdropFilter: 'blur(2px)',
                },
            }}
            locale={{
                back: '←',
                close: '✕',
                last: "Ξεκινώ! 🚀",
                next: 'Επόμενο →',
                open: 'Open',
                skip: 'Παράλειψη',
            }}
        />
    );
};

export default OnboardingTour;
