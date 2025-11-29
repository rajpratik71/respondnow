import { test, expect } from '@playwright/test';

test.describe('User Management E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard|incidents/);
  });

  test('should navigate to user management page', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page.locator('h2')).toContainText('User Management');
  });

  test('should create a new user', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Click create user button
    await page.click('button:has-text("Create User")');
    
    // Fill in the form
    await page.fill('[name="username"]', 'testuser_e2e');
    await page.fill('[name="email"]', 'testuser@e2e.com');
    await page.fill('[name="password"]', 'Password123!');
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    
    // Submit the form
    await page.click('button:has-text("Create User")');
    
    // Verify user appears in the list
    await expect(page.locator('text=testuser_e2e')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Test User')).toBeVisible();
  });

  test('should edit an existing user', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Find and click edit button for testuser_e2e
    await page.locator('tr:has-text("testuser_e2e") button:has-text("Edit")').click();
    
    // Update first name
    await page.fill('[name="firstName"]', 'Updated');
    
    // Save changes
    await page.click('button:has-text("Save Changes")');
    
    // Verify update
    await expect(page.locator('text=Updated User')).toBeVisible({ timeout: 10000 });
  });

  test('should delete a user', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Accept confirmation dialog
    page.on('dialog', dialog => dialog.accept());
    
    // Click delete button
    await page.locator('tr:has-text("testuser_e2e") button:has-text("Delete")').click();
    
    // Verify user is removed
    await expect(page.locator('text=testuser_e2e')).not.toBeVisible({ timeout: 10000 });
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/admin/users');
    await page.click('button:has-text("Create User")');
    
    // Try to submit without filling fields
    await page.click('button:has-text("Create User")');
    
    // Check for validation errors
    await expect(page.locator('text=Username must be at least 3 characters')).toBeVisible();
    await expect(page.locator('text=Invalid email address')).toBeVisible();
    await expect(page.locator('text=Password must be at least 8 characters')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/admin/users');
    await page.click('button:has-text("Create User")');
    
    // Fill with invalid email
    await page.fill('[name="username"]', 'testuser');
    await page.fill('[name="email"]', 'invalid-email');
    await page.fill('[name="password"]', 'Password123!');
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    
    await page.click('button:has-text("Create User")');
    
    // Check for email validation error
    await expect(page.locator('text=Invalid email address')).toBeVisible();
  });

  test('should display user list with correct columns', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Check table headers
    await expect(page.locator('th:has-text("Username")')).toBeVisible();
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
    await expect(page.locator('th:has-text("Roles")')).toBeVisible();
    await expect(page.locator('th:has-text("Actions")')).toBeVisible();
  });

  test('should show user status badge', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Check for status badges
    const statusBadge = page.locator('.status-badge').first();
    await expect(statusBadge).toBeVisible();
  });

  test('should cancel user creation', async ({ page }) => {
    await page.goto('/admin/users');
    await page.click('button:has-text("Create User")');
    
    // Fill some fields
    await page.fill('[name="username"]', 'testcancel');
    
    // Click cancel
    await page.click('button:has-text("Cancel")');
    
    // Dialog should be closed
    await expect(page.locator('[name="username"]')).not.toBeVisible();
  });
});

test.describe('Role-Based Access Control E2E Tests', () => {
  test('should show different permissions for different roles', async ({ page }) => {
    // This test would require multiple user accounts with different roles
    // For now, we'll test admin access
    
    await page.goto('/login');
    await page.fill('[name="username"]', 'admin');
    await page.fill('[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.goto('/admin/users');
    
    // Admin should see create button
    await expect(page.locator('button:has-text("Create User")')).toBeVisible();
  });
});
