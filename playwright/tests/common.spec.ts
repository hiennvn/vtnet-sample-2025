import { test, expect } from '@playwright/test';
import { 
  users, 
  loginAs, 
  logout, 
  navigateToProjects, 
  navigateToUserManagement, 
  openProjectDetails 
} from './helpers/auth.helper';

/**
 * Common test cases for the Project Document Management System
 * Based on 5.0.common_testcases.md
 */

/**
 * TC-C1: User Login
 * Verify that users can successfully log in to the system with valid credentials.
 */
test.describe('TC-C1: User Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test.afterEach(async ({ page }) => {
    await logout(page);
  });

  test('Admin can login successfully', async ({ page }) => {
    // Enter valid director credentials
    await page.fill('#email', users.admin.email);
    await page.fill('#password', users.admin.password);
    
    // Click the login button
    await page.click('.login-button');
    
    // Verify successful login
    await expect(page).toHaveURL(/.*\/users/);
    
    // Verify user avatar is displayed in the header
    const userAvatar = page.locator('.user-profile .avatar');
    await expect(userAvatar).toBeVisible();
  });

  test('Director can login successfully', async ({ page }) => {
    // Enter valid director credentials
    await page.fill('#email', users.director.email);
    await page.fill('#password', users.director.password);
    
    // Click the login button
    await page.click('.login-button');
    
    // Verify successful login
    await expect(page).toHaveURL(/.*\/users/);
    
    // Verify user avatar is displayed in the header
    const userAvatar = page.locator('.user-profile .avatar');
    await expect(userAvatar).toBeVisible();
  });

  test('Project Manager can login successfully', async ({ page }) => {
    // Enter valid project manager credentials
    await page.fill('#email', users.projectManager.email);
    await page.fill('#password', users.projectManager.password);
    
    // Click the login button
    await page.click('.login-button');
    
    // Verify successful login
    await expect(page).toHaveURL(/.*\/users/);
    
    // Verify user avatar is displayed in the header
    const userAvatar = page.locator('.user-profile .avatar');
    await expect(userAvatar).toBeVisible();
  });

  test('Team Member can login successfully', async ({ page }) => {
    // Enter valid team member credentials
    await page.fill('#email', users.teamMember.email);
    await page.fill('#password', users.teamMember.password);
    
    // Click the login button
    await page.click('.login-button');
    
    // Verify successful login
    await expect(page).toHaveURL(/.*\/users/);
    
    // Verify user avatar is displayed in the header
    const userAvatar = page.locator('.user-profile .avatar');
    await expect(userAvatar).toBeVisible();
  });
});

/**
 * TC-C2: User Logout
 * Verify that users can successfully log out of the system.
 */
test.describe('TC-C2: User Logout', () => {
  test.beforeEach(async ({ page }) => {
    // Login as director first
    await loginAs(page, 'admin');
  });

  test('User can logout successfully', async ({ page }) => {
    // Click on user profile to open dropdown
    await page.click('.user-profile');
    
    // Click logout button in the dropdown
    await page.click('.user-dropdown button:has-text("Logout")');
    
    // Verify user is redirected to login page
    await expect(page).toHaveURL(/.*\/login/);
    
    // Verify protected resources are no longer accessible
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});

/**
 * TC-C3: Navigate to Projects Dashboard
 * Verify that users can navigate to the projects dashboard.
 */
test.describe('TC-C3: Navigate to Projects Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as director first
    await loginAs(page, 'admin');
  });

  test('User can navigate to projects dashboard', async ({ page }) => {
    // Click on the Projects link in the sidebar
    await page.click('.navigation .nav-item span:has-text("Projects")');
    
    // Verify user is redirected to projects page
    await expect(page).toHaveURL(/.*\/projects/);
    
    // Verify project grid is displayed
    const projectGrid = page.locator('#projects-grid');
    await expect(projectGrid).toBeVisible();
    
    /*
    // Verify project cards are displayed
    const projectCards = page.locator('.project-card');
    const count = await projectCards.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify project card contains required elements
    const firstProjectCard = projectCards.first();
    await expect(firstProjectCard.locator('.project-title')).toBeVisible();
    await expect(firstProjectCard.locator('.project-status')).toBeVisible();
    await expect(firstProjectCard.locator('.project-desc')).toBeVisible();
    await expect(firstProjectCard.locator('.project-meta')).toBeVisible();
    */
    // Verify Create New Project button is available for Director
    const createProjectButton = page.locator('button:has-text("+ New Project")');
    await expect(createProjectButton).toBeVisible();
  });
});

/**
 * TC-C4: Access User Management (Director Only)
 * Verify that Directors can access the user management section.
 */
test.describe('TC-C4: Access User Management (Director Only)', () => {
  test('Director can access user management', async ({ page }) => {
    // Login as director
    await loginAs(page, 'admin');
    
    // Click on User Management in sidebar (Users link)
    await page.click('.navigation .nav-item span:has-text("Users")');
    
    // Verify user is redirected to user management page
    await expect(page).toHaveURL(/.*\/users/);
    
    // Verify user grid is displayed
    const userGrid = page.locator('.user-grid');
    await expect(userGrid).toBeVisible();
    
    // Verify user cards are displayed
    const userCards = page.locator('.user-card');
    const count = await userCards.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify user card contains required elements
    const firstUserCard = userCards.first();
    await expect(firstUserCard.locator('.user-name')).toBeVisible();
    await expect(firstUserCard.locator('.user-email')).toBeVisible();
    await expect(firstUserCard.locator('.user-role')).toBeVisible();
    
    // Verify Add User button is available
    const addUserButton = page.locator('button:has-text("Add User")');
    await expect(addUserButton).toBeVisible();
    
    // Verify role filter pills are available
    const roleFilters = page.locator('.role-filter');
    await expect(roleFilters).toBeVisible();
  });
});

/**
 * TC-C5: Access Project Details
 * Verify that users can access a specific project's details.
 */
test.describe('TC-C5: Access Project Details', () => {
  test.beforeEach(async ({ page }) => {
    // Login as director and navigate to projects page
    await loginAs(page, 'admin');
    await navigateToProjects(page);
  });

  test('User can access project details', async ({ page }) => {
    // Click on the first project card
    await page.click('.project-card >> nth=0');
    
    // Verify user is redirected to project details page
    await expect(page).toHaveURL(/.*\/projects\/\d+/);
    
    // Verify project header is displayed
    // const projectHeader = page.locator('.project-header');
    // await expect(projectHeader).toBeVisible();
    
    // Verify project name and status are displayed
    await expect(page.locator('.page-title')).toBeVisible(); // Project name
    // await expect(page.locator('.project-status')).toBeVisible();
    
    // Verify project description is displayed
    //await expect(page.locator('.project-description')).toBeVisible();
    
    // Verify project metadata is displayed
    //await expect(page.locator('.project-meta')).toBeVisible();
    
    // Verify action buttons are available for Director
    await expect(page.locator('button:has-text("Edit Project")')).toBeVisible();
    await expect(page.locator('button:has-text("Manage Members")')).toBeVisible();
    
    // Verify tabs for Documents are available
    await expect(page.locator('.tabs .tab:has-text("Documents")')).toBeVisible();
  });
}); 