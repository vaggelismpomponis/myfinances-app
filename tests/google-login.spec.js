import { test, expect } from '@playwright/test';

test('Google Login Button Click', async ({ page }) => {
    // Navigate to the app (assuming it's running on localhost:5173 - user should ensure dev server is running)
    // Or I can use the 'run_command' to start it in background if needed, but for now assuming it's up or I'll try to build/serve.
    // Actually, CI usually builds and serves. I'll assume dev server or serve dist.
    // Let's try 5173 first.
    await page.goto('http://localhost:5173');

    // Check if we are on Login Page
    await expect(page.getByText('MyFinances')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Google' })).toBeVisible();

    // Setup listener for popup
    const popupPromise = page.waitForEvent('popup');

    // Click the Google button
    await page.getByRole('button', { name: 'Google' }).click();

    // Wait for popup
    const popup = await popupPromise;

    // Verify popup URL contains google.com
    // Note: We won't login because we don't have creds, but opening the popup proves the button works.
    await popup.waitForLoadState();
    expect(popup.url()).toContain('accounts.google.com');

    // Close popup
    // await popup.close();
});
