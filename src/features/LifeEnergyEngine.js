/**
 * Pure utility function to calculate the Life-Energy (time cost) of a transaction.
 * Execution must be < 10ms.
 * 
 * @param {number} amountInCents The cost of the transaction in cents.
 * @param {number} hourlyWageInCents The user's hourly wage in cents.
 * @returns {Object} { hours: number, minutes: number }
 */
export function calculateLifeEnergy(amountInCents, hourlyWageInCents) {
    if (!amountInCents || !hourlyWageInCents || hourlyWageInCents <= 0) {
        return { hours: 0, minutes: 0 };
    }

    const totalHours = amountInCents / hourlyWageInCents;
    const hours = Math.floor(totalHours);
    const minutes = Math.round((totalHours - hours) * 60);

    // Handle rounding overflow (e.g. 59.6 mins rounds to 60)
    if (minutes === 60) {
        return { hours: hours + 1, minutes: 0 };
    }

    return { hours, minutes };
}

/**
 * Formats a LifeEnergy object into a readable string (e.g., "1h 30m" or "45m").
 */
export function formatLifeEnergy(lifeEnergy) {
    const { hours, minutes } = lifeEnergy;
    
    if (hours === 0 && minutes === 0) return '0m';
    if (hours === 0) return `${minutes}m`;
    if (minutes === 0) return `${hours}h`;
    
    return `${hours}h ${minutes}m`;
}
