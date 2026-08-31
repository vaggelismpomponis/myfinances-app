import React from 'react';
import { Hourglass } from 'lucide-react';
import { calculateLifeEnergy, formatLifeEnergy } from '../features/LifeEnergyEngine';

const LifeEnergyBadge = ({ amount, hourlyWage }) => {
    // Only display for positive expenses where an hourly wage exists
    if (!amount || amount <= 0 || !hourlyWage || hourlyWage <= 0) return null;

    const lifeEnergy = calculateLifeEnergy(amount, hourlyWage);
    
    // If it's literally less than 1 minute of work, maybe hide it or show <1m
    if (lifeEnergy.hours === 0 && lifeEnergy.minutes === 0) {
        return null;
    }

    const formatted = formatLifeEnergy(lifeEnergy);

    return (
        <div 
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/10 border border-violet-200/60 dark:border-violet-500/20 text-violet-600 dark:text-violet-400 shadow-[0_0_10px_rgba(124,58,237,0.15)] dark:shadow-[0_0_10px_rgba(124,58,237,0.2)] ml-2"
            aria-label={`Costs ${lifeEnergy.hours} hours and ${lifeEnergy.minutes} minutes of work`}
        >
            <Hourglass size={10} className="animate-pulse" />
            <span className="text-[10px] font-bold tracking-tight">{formatted}</span>
        </div>
    );
};

export default LifeEnergyBadge;
