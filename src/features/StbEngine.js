export function calculateStb({ income = 0, fixed = 0, savings = 0, pastDailySpends = [], todaySpend = 0, daysInMonth = 30 }) {
    // 1. Calculate Base Daily Budget
    const totalPool = income - fixed - savings;
    const baseDaily = totalPool / Math.max(1, daysInMonth);
    
    let rollover = 0;
    let activeGlides = [];
    let streak = 0;
    
    // 2. Simulate historical days to calculate rollovers and active glides
    for (let day = 0; day < pastDailySpends.length; day++) {
        const spend = pastDailySpends[day];
        
        // Calculate penalty for this day
        const glideDeduction = activeGlides.reduce((sum, g) => sum + g.amount, 0);
        
        // Daily Budget before spend
        const dailyBudget = baseDaily + rollover - glideDeduction;
        
        // Age the active glides BEFORE adding new ones for the next day
        activeGlides = activeGlides
            .map(g => ({ ...g, daysLeft: g.daysLeft - 1 }))
            .filter(g => g.daysLeft > 0);
            
        // Process spend
        if (spend > dailyBudget) {
            const deficit = spend - dailyBudget;
            rollover = 0;
            streak = 0;
            // Amortize over next 3 days
            activeGlides.push({ amount: deficit / 3, daysLeft: 3 });
        } else {
            rollover = dailyBudget - spend;
            streak++;
        }
    }
    
    // 3. Calculate Today's metrics
    const todayGlideDeduction = activeGlides.reduce((sum, g) => sum + g.amount, 0);
    const todayStartingBudget = baseDaily + rollover - todayGlideDeduction;
    const currentStb = todayStartingBudget - todaySpend;
    
    return {
        stb: Math.round(currentStb),
        todayStartingBudget: Math.round(todayStartingBudget),
        isGlideActive: activeGlides.length > 0,
        streak
    };
}

export function getRemainingDaysInMonth(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const currentDay = date.getDate();
    return lastDay.getDate() - currentDay + 1;
}

export function getDaysInMonth(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
}
