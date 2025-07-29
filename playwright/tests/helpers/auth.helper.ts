import { Page } from '@playwright/test';

// User roles and credentials
export const users = {
  admin: {
    email: 'admin@vtnet.com',
    password: 'admin',
    role: 'Admin'
  },
  director: {
    email: 'director@example.com',
    password: 'password123',
    role: 'Director'
  },
  projectManager: {
    email: 'pm@example.com',
    password: 'password123',
    role: 'Project Manager'
  },
  teamMember: {
    email: 'member@example.com',
    password: 'password123',
    role: 'Team Member'
  }
};

/**
 * Login as a specific user
 * @param page - Playwright page
 * @param userRole - User role to login as (director, projectManager, teamMember)
 */
export async function loginAs(page: Page, userRole: keyof typeof users): Promise<void> {
  const user = users[userRole];
  
  // Navigate to login page
  await page.goto('/login');
  
  // Enter credentials
  await page.fill('#email', user.email);
  await page.fill('#password', user.password);
  
  // Click login button
  await page.click('.login-button');
  
  // Wait for navigation to dashboard
  await page.waitForURL(/.*\/users/);
}

/**
 * Logout the current user
 * @param page - Playwright page
 */
export async function logout(page: Page): Promise<void> {
  // Click on user profile to open dropdown
  await page.click('.user-profile');
  
  // Click logout button in the dropdown
  await page.click('.user-dropdown button:has-text("Logout")');
  
  // Wait for navigation to login page
  await page.waitForURL(/.*\/login/);
}

/**
 * Navigate to projects page
 * @param page - Playwright page
 */
export async function navigateToProjects(page: Page): Promise<void> {
  await page.click('.navigation .nav-item:has-text("Projects")');
  await page.waitForURL(/.*\/projects/);
}

/**
 * Navigate to user management page (Director only)
 * @param page - Playwright page
 */
export async function navigateToUserManagement(page: Page): Promise<void> {
  await page.click('.navigation .nav-item:has-text("Users")');
  await page.waitForURL(/.*\/users/);
}

/**
 * Navigate to project details page
 * @param page - Playwright page
 * @param projectIndex - Index of the project to open (0-based)
 */
export async function openProjectDetails(page: Page, projectIndex: number = 0): Promise<void> {
  await page.click(`.project-card >> nth=${projectIndex}`);
  await page.waitForURL(/.*\/projects\/\d+/);
} 