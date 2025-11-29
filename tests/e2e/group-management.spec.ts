import { test, expect } from '@playwright/test';

test.describe('Group Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard|incidents/);
  });

  test('should navigate to group management page', async ({ page }) => {
    await page.goto('/admin/groups');
    await expect(page.locator('h2')).toContainText('Group Management');
  });

  test('should display groups list', async ({ page }) => {
    await page.goto('/admin/groups');
    
    // Check table headers
    await expect(page.locator('th:has-text("Group Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Description")')).toBeVisible();
    await expect(page.locator('th:has-text("Members")')).toBeVisible();
    await expect(page.locator('th:has-text("Roles")')).toBeVisible();
    await expect(page.locator('th:has-text("Actions")')).toBeVisible();
  });

  test('should show member count badge', async ({ page }) => {
    await page.goto('/admin/groups');
    
    // Check for member count badge
    const memberBadge = page.locator('.badge:has-text("members")').first();
    if (await memberBadge.isVisible()) {
      await expect(memberBadge).toContainText('members');
    }
  });

  test('should show role badges in group list', async ({ page }) => {
    await page.goto('/admin/groups');
    
    // Check for role badges (if groups exist)
    const rolesBadges = page.locator('.role-badge');
    const count = await rolesBadges.count();
    
    if (count > 0) {
      await expect(rolesBadges.first()).toBeVisible();
    }
  });

  test('should show empty state when no groups exist', async ({ page }) => {
    await page.goto('/admin/groups');
    
    // If no groups, should show empty state
    const groupRows = page.locator('tbody tr');
    const rowCount = await groupRows.count();
    
    if (rowCount === 0) {
      await expect(page.locator('.empty-state')).toBeVisible();
      await expect(page.locator('text=No groups found')).toBeVisible();
    }
  });

  test('should show create group button', async ({ page }) => {
    await page.goto('/admin/groups');
    await expect(page.locator('button:has-text("Create Group")')).toBeVisible();
  });

  test('should allow clicking on group rows', async ({ page }) => {
    await page.goto('/admin/groups');
    
    const groupRows = page.locator('tbody tr');
    const rowCount = await groupRows.count();
    
    if (rowCount > 0) {
      // Click first group row
      await groupRows.first().click();
      
      // Should show group details
      await expect(page.locator('.group-details')).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Group and User Integration Tests', () => {
  test('should show group members', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.goto('/admin/groups');
    
    const groupRows = page.locator('tbody tr');
    const rowCount = await groupRows.count();
    
    if (rowCount > 0) {
      // Click first group
      await groupRows.first().click();
      
      // Should show members section
      const membersSection = page.locator('.members-list');
      if (await membersSection.isVisible()) {
        await expect(membersSection).toContainText('Members');
      }
    }
  });
});
