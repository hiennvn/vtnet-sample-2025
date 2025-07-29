import { test, expect } from '@playwright/test';

/**
 * Invalid login test cases for the Project Document Management System
 * Based on 5.0.common_testcases.md
 */

/**
 * TC-C1: User Login
 * Verify that users can successfully log in to the system with valid credentials.
 */
test.describe('TC-C1-1: Invalid Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('Shows error with invalid credentials', async ({ page }) => {
    // Enter invalid credentials
    await page.fill('#email', 'invalid@example.com');
    await page.fill('#password', 'wrongpassword');
    
    // Click the login button
    await page.click('.login-button');
    
    // Verify error message is displayed
    const errorMessage = page.locator('.error-message');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Invalid email or password');
    
    // Verify we're still on the login page
    await expect(page).toHaveURL(/.*\/login/);
  });
});