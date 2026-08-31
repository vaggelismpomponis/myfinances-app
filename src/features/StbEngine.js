export function calculateStb({ income = 0, fixed = 0, savings = 0, spend = 0, daysRemaining = 1 }) {
    // Protect against divide by zero (e.g. if daysRemaining somehow comes in as 0 or negative)
    // On the last day of the month, daysRemaining should be 1 (including today)
    const effectiveDays = Math.max(1, daysRemaining);
    
    // Formula: (Income - Obligations - Savings - Spend) / Remaining Days
    const stb = (income - fixed - savings - spend) / effectiveDays;
    
    // Returns cents since the local store and DB use integers (cents)
    return Math.round(stb);
}

export function getRemainingDaysInMonth(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // The 0th day of the next month is the last day of the current month
    const lastDay = new Date(year, month + 1, 0);
    const currentDay = date.getDate();
    
    // Remaining days includes today
    return lastDay.getDate() - currentDay + 1;
}
