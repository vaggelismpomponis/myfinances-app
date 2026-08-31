import React, { useState, useEffect } from 'react';
import { Joyride, STATUS, EVENTS } from 'react-joyride';
import TourBubble from './TourBubble';
import { useSettings } from '../contexts/SettingsContext';
import { Wallet, Plus, Target, BarChart2, ShieldCheck } from 'lucide-react';

const STEP_CONFIGS = [
    {
        target: 'body',
        placement: 'center',
        titleKey: 'onboarding_welcome_title',
        descKey: 'onboarding_welcome_desc',
        Icon: Wallet,
        gradient: 'from-violet-600 via-indigo-600 to-purple-700',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
        accent: '#7c3aed',
        orbColor: 'bg-violet-400',
        disableBeacon: true,
    },
    {
        target: '#tour-add-button',
        placement: 'auto',
        titleKey: 'onboarding_transactions_title',
        descKey: 'onboarding_transactions_desc',
        Icon: Plus,
        gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
        accent: '#10b981',
        orbColor: 'bg-emerald-400',
        disableBeacon: true,
    },
    {
        target: '#tour-quick-access',
        placement: 'auto',
        titleKey: 'onboarding_budgets_title',
        descKey: 'onboarding_budgets_desc',
        Icon: Target,
        gradient: 'from-amber-500 via-orange-500 to-rose-500',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
        accent: '#f59e0b',
        orbColor: 'bg-amber-400',
        disableBeacon: true,
    },
    {
        target: '#nav-stats',
        placement: 'auto',
        titleKey: 'onboarding_analytics_title',
        descKey: 'onboarding_analytics_desc',
        Icon: BarChart2,
        gradient: 'from-blue-600 via-indigo-500 to-violet-600',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
        accent: '#3b82f6',
        orbColor: 'bg-blue-400',
        disableBeacon: true,
    },
    {
        target: '#nav-profile',
        placement: 'auto',
        titleKey: 'onboarding_security_title',
        descKey: 'onboarding_security_desc',
        Icon: ShieldCheck,
        gradient: 'from-rose-500 via-pink-500 to-fuchsia-600',
        iconBg: 'bg-white/20',
        iconColor: 'text-white',
        accent: '#f43f5e',
        orbColor: 'bg-rose-400',
        disableBeacon: true,
    },
];

const OnboardingTour = ({ onComplete }) => {
    const { theme } = useSettings();
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    useEffect(() => {
        // Start tour after a tiny delay to ensure DOM is ready
        const timer = setTimeout(() => {
            setRun(true);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const steps = STEP_CONFIGS.map(config => ({
        target: config.target,
        placement: config.placement,
        disableBeacon: config.disableBeacon,
        data: config, // Pass the whole config to the custom tooltip
    }));

    const handleJoyrideCallback = (data) => {
        const { status, type, index, action } = data;
        const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

        if (type === EVENTS.STEP_AFTER) {
            // Normal navigation: next or prev
            setStepIndex(index + (action === 'prev' ? -1 : 1));
        } else if (type === EVENTS.TARGET_NOT_FOUND) {
            // Target element missing in DOM — skip forward to avoid getting stuck
            setStepIndex(index + 1);
        } else if (finishedStatuses.includes(status)) {
            setRun(false);
            if (onComplete) onComplete();
        }
    };

    return (
        <Joyride
            steps={steps}
            run={run}
            stepIndex={stepIndex}
            callback={handleJoyrideCallback}
            continuous={true}
            showSkipButton={true}
            showProgress={true}
            tooltipComponent={TourBubble}
            styles={{
                options: {
                    zIndex: 10000,
                    overlayColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.75)' : 'rgba(0, 0, 0, 0.5)',
                }
            }}
        />
    );
};

export default OnboardingTour;
