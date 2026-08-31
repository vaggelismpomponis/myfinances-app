import { chromium } from '@playwright/test';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 2,
    });
    
    // Add local storage to disable onboarding
    await context.addInitScript(() => {
        window.localStorage.setItem('onboarding_completed', 'true');
        const originalGetItem = Storage.prototype.getItem;
        Storage.prototype.getItem = function(key) {
            if (key && key.startsWith('onboarding_completed_')) return 'true';
            return originalGetItem.apply(this, arguments);
        };
    });

    const page = await context.newPage();

    console.log('Navigating to localhost:5173...');
    await page.goto('http://localhost:5173');

    // 1. Home Screen (Safe to Burn)
    console.log('Waiting for Home screen...');
    await page.waitForTimeout(3000);
    
    // Dismiss any modal
    await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Skip') || b.textContent.includes('Παράλειψη'));
        if(btn) btn.click();
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/devoauth/.gemini/antigravity-ide/brain/5c1d9d8c-1f0e-4e60-9170-85aa482791ef/screenshot_home.jpg' });

    // 2. Stats Screen
    console.log('Navigating to Stats...');
    await page.evaluate(() => {
        const statsBtn = document.getElementById('nav-stats');
        if(statsBtn) statsBtn.click();
    });
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.scrollBy(0, 800)); // Scroll down
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/devoauth/.gemini/antigravity-ide/brain/5c1d9d8c-1f0e-4e60-9170-85aa482791ef/screenshot_stats.jpg' });

    // Navigate back to home
    await page.evaluate(() => {
        const homeBtn = document.getElementById('nav-home');
        if(homeBtn) homeBtn.click();
    });
    await page.waitForTimeout(2000);

    // 3. Goals Screen
    console.log('Navigating to Goals...');
    await page.evaluate(() => {
        const goalsBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Στόχοι') || b.textContent.includes('Goals'));
        if(goalsBtn) goalsBtn.click();
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'C:/Users/devoauth/.gemini/antigravity-ide/brain/5c1d9d8c-1f0e-4e60-9170-85aa482791ef/screenshot_goals.jpg' });

    // Reload to Home
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(2000);

    // 4. Add Modal
    console.log('Opening Add Modal...');
    await page.evaluate(() => {
        const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label') === 'Add transaction' || b.getAttribute('aria-label') === 'Προσθήκη συναλλαγής');
        if(addBtn) addBtn.click();
    });
    await page.waitForTimeout(2000);
    
    await page.evaluate(() => {
        const savedBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Saved It'));
        if(savedBtn) savedBtn.click();
    });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'C:/Users/devoauth/.gemini/antigravity-ide/brain/5c1d9d8c-1f0e-4e60-9170-85aa482791ef/screenshot_add_modal.jpg' });

    await browser.close();
    console.log('Done!');
})();
