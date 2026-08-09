import { test, expect } from '@playwright/test';

test.describe('Dashboard Interaction Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the dashboard (auth is bypassed for localhost)
    await page.goto('http://localhost:5174/admin/overview');
    // Wait for data to load
    await page.waitForTimeout(3000);
  });

  test('1. Sidebar items load correctly', async ({ page }) => {
    const sidebarLinks = [
      'Hero Section', 'About Section', 'Journey', 'Contact Info',
      'Projects', 'Skills', 'Certifications', 'Social Links', 
      'Navbar Menu', 'Settings', 'Account Center', 'Media Library'
    ];
    
    for (const linkText of sidebarLinks) {
      const link = page.getByRole('link', { name: linkText, exact: true });
      await expect(link).toBeVisible();
      await link.click();
      await page.waitForTimeout(500); 
      const errorMsg = page.locator('text=Cannot read properties');
      await expect(errorMsg).toHaveCount(0);
    }
  });

  test('2. Health Score Diagnostics', async ({ page }) => {
    await page.goto('http://localhost:5174/admin/overview');
    await page.waitForTimeout(2000);
    
    // Click health score card
    await page.locator('text=Health Score').click();
    
    // Diagnostics modal should open
    await expect(page.locator('text=System Health Diagnostics')).toBeVisible();
    
    // Close it
    await page.locator('button:has-text("Close")').first().click();
    await expect(page.locator('text=System Health Diagnostics')).not.toBeVisible();
  });

  test('3. Search (Ctrl+K)', async ({ page }) => {
    await page.keyboard.press('Control+k');
    const searchInput = page.locator('input[placeholder="Search anything (Projects, Skills, Pages...)"]');
    await expect(searchInput).toBeVisible();
    
    await searchInput.fill('Projects');
    await page.waitForTimeout(500);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveURL(/.*\/admin\/projects/);
  });

  test('4. Notification Center', async ({ page }) => {
    await page.locator('button:has(.lucide-bell)').click();
    await expect(page.locator('text=Notifications')).toBeVisible();
    
    const clearAll = page.locator('text=Clear all');
    if (await clearAll.isVisible()) {
      await clearAll.click();
    }
    
    await page.reload();
    await page.waitForTimeout(2000);
    
    await page.locator('button:has(.lucide-bell)').click();
    await expect(page.locator('text=caught up!')).toBeVisible();
  });

  test('5. CRUD Verification (Skills)', async ({ page }) => {
    await page.goto('http://localhost:5174/admin/skills');
    await page.waitForTimeout(2000);
    
    await page.locator('button:has-text("Add New")').click();
    await page.fill('input[name="name"]', 'Playwright Test Skill');
    await page.fill('input[name="category"]', 'Testing');
    await page.fill('input[name="percent"]', '99');
    
    await page.locator('button:has-text("Publish")').click();
    
    // Wait for toast and item
    await expect(page.locator('h3:has-text("Playwright Test Skill")')).toBeVisible({ timeout: 15000 });
    
    // Delete it
    page.on('dialog', dialog => dialog.accept());
    const skillCard = page.locator('div', { hasText: 'Playwright Test Skill' }).first();
    await skillCard.locator('.lucide-trash-2').first().click();
    
    await expect(page.locator('h3:has-text("Playwright Test Skill")')).not.toBeVisible({ timeout: 15000 });
  });
});
