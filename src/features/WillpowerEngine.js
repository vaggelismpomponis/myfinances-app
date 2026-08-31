/**
 * Calculates the future value of a principal amount using compound interest.
 * @param {number} principalCents - The initial amount in cents.
 * @param {number} years - Number of years to compound.
 * @param {number} rate - Annual interest rate (e.g., 0.07 for 7%).
 * @returns {number} The compounded future value in cents.
 */
export const calculateCompoundedValue = (principalCents, years = 10, rate = 0.07) => {
    if (principalCents <= 0) return 0;
    // A = P(1 + r)^t
    const futureValue = principalCents * Math.pow((1 + rate), years);
    return Math.round(futureValue);
};

/**
 * Aggregates a list of resisted impulses.
 * @param {Array} impulses - List of resisted impulse objects { amount: number, ... }
 * @returns {Object} { totalSaved: number, futureValue: number }
 */
export const aggregateWillpower = (impulses) => {
    if (!impulses || impulses.length === 0) {
        return { totalSaved: 0, futureValue: 0 };
    }

    const totalSaved = impulses.reduce((sum, imp) => sum + imp.amount, 0);
    const futureValue = impulses.reduce((sum, imp) => sum + calculateCompoundedValue(imp.amount), 0);

    return {
        totalSaved,
        futureValue
    };
};
