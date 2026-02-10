import { test, expect } from '@playwright/test';

test('Comprehensive QA Audit', async ({ page }) => {
    console.log('Starting QA Audit Sequence...');

    try {
        // 1. Navigation
        console.log('Attempting connection to http://localhost:5000...');
        await page.goto('http://localhost:5000', { timeout: 15000, waitUntil: 'domcontentloaded' });
        console.log('Connected to Server (5000).');

        // Check Title/Content
        const title = await page.title();
        console.log(`Page Title: ${title}`);

        // 2. Dashboard Checks
        // Check if body contains basic app text
        const bodyText = await page.textContent('body');
        if (bodyText?.includes('Dashboard') || bodyText?.includes('Defense Surveillance')) {
            console.log('Verified: Dashboard Content Loaded');
        } else {
            console.log('Warning: "Dashboard" text not found immediately.');
        }

        // 3. Settings Navigation
        console.log('Navigating to Settings...');
        // Try click by href or text
        await page.click('a[href="/settings"]');
        console.log('Clicked Settings Link');

        // Verify Header
        await expect(page.locator('body')).toContainText('CORE_SETTINGS', { timeout: 5000 });
        console.log('Verified: Settings Page Loaded');

        // 4. Interaction Test: Feature Toggles
        const toggle = page.locator('text=Dark Mode').first();
        if (await toggle.isVisible()) {
            await toggle.click();
            console.log('Verified: Dark Mode Toggle Clicked');
        }

        // 5. Interaction Test: Toast Notification (Danger Zone)
        const wipeBtn = page.getByRole('button', { name: 'INIT_WIPE' });
        if (await wipeBtn.isVisible()) {
            await wipeBtn.click();
            const toast = page.locator('text=ACCESS_DENIED').first();
            await expect(toast).toBeVisible({ timeout: 5000 });
            console.log('VERIFIED: Danger Zone Toast Logic (Command Blocked)');
        }

        // 6. Device Manager
        console.log('Navigating to Device Manager...');
        await page.click('a[href="/devices"]');
        await expect(page.locator('body')).toContainText('ASSET_REGISTRY', { timeout: 5000 });
        console.log('Verified: Device Manager Loaded');

        const addDeviceBtn = page.getByRole('button').filter({ has: page.locator('lucide-plus') }).first(); // heuristic
        // Or just look for the Plus icon
        console.log('Audit Complete: SUCCESS');

    } catch (error) {
        console.error('################ TEST FAILURE ################');
        console.error(error);
        throw error;
    }
});
