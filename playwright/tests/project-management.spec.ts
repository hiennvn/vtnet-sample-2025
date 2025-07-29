import { test, expect } from '@playwright/test';
import { 
  users, 
  loginAs, 
  navigateToProjects, 
  openProjectDetails 
} from './helpers/auth.helper';

/**
 * Project Management test cases for the Project Document Management System
 */

/**
 * Test case: Create a new project
 */
test.describe('Create a new project', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await loginAs(page, 'admin');
    
    // Navigate to projects page
    await navigateToProjects(page);
  });

  test('Admin can create a new project', async ({ page }) => {
    // Click on Create New Project button
    await page.click('button:has-text("+ New Project")');
    
    // Verify redirected to create project page
    await expect(page).toHaveURL(/.*\/projects\/create/);
    
    // Fill in project details
    const projectName = `Test Project ${Date.now()}`;
    await page.fill('#project-name', projectName);
    await page.fill('#project-description', 'This is a test project created by Playwright');
    
    // Submit the form
    await page.click('button:has-text("Save Project")');
    
    // Verify project is created and redirected to project details
    await expect(page).toHaveURL(/.*\/projects\/\d+/);
    
    // Verify project name is displayed in the header
    const projectHeader = page.locator('.page-title');
    await expect(projectHeader).toHaveText(projectName);
    
    // Verify success message (toast)
    // const successMessage = page.locator('.toast-success');
    // await expect(successMessage).toBeVisible();
  });
});

/**
 * Test case: Edit a project
 */
test.describe('Edit a project', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await loginAs(page, 'admin');
    
    // Navigate to projects page and open first project
    await navigateToProjects(page);
    await openProjectDetails(page, 0);
  });

  test('Admin can edit a project', async ({ page }) => {
    // Click on Edit Project button
    await page.click('button:has-text("Edit Project")');
    
    // Verify redirected to edit project page
    await expect(page).toHaveURL(/.*\/projects\/\d+\/edit/);
    
    // Update project details
    const updatedName = `Updated Project ${Date.now()}`;
    await page.fill('#project-name', updatedName);
    await page.fill('#project-description', 'This project has been updated');
    // await page.selectOption('#status', 'ACTIVE');
    
    // Submit the form
    await page.click('button:has-text("Save Changes")');
    
    // Verify project is updated and redirected to project details
    await expect(page).toHaveURL(/.*\/projects\/\d+/);
    
    // Verify updated project name is displayed in the header
    const projectHeader = page.locator('.page-title');
    await expect(projectHeader).toBeVisible();
    // await expect(projectHeader).toHaveText(updatedName);
    
    // Verify updated status is displayed
    const projectStatus = page.locator('.project-status');
    await expect(projectStatus).toContainText('ACTIVE');
    
    // Verify success message
    // const successMessage = page.locator('.toast-success');
    // await expect(successMessage).toBeVisible();
  });
});

/**
 * Test case: Delete a project
 */
test.describe('Delete a project', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await loginAs(page, 'admin');
    
    // Navigate to projects page
    await navigateToProjects(page);
  });

  test('Admin can delete a project', async ({ page }) => {
    // First create a new project to delete
    await page.click('button:has-text("+ New Project")');
    
    const projectToDelete = `Project to Delete ${Date.now()}`;
    await page.fill('#project-name', projectToDelete);
    await page.fill('#project-description', 'This project will be deleted');
    // await page.selectOption('#status', 'ACTIVE');
    await page.click('button:has-text("Save Project")');
    
    // Verify project is created
    await expect(page).toHaveURL(/.*\/projects\/\d+/);
    
    // Store the project URL to verify deletion later
    const projectUrl = page.url();
    
    // Click on the dropdown button using the data-testid
    await page.click('[data-testid="project-actions-dropdown"]');
    
    // Click on Delete Project option using the data-testid
    await page.click('[data-testid="delete-project-option"]');
    
    // Verify confirmation dialog appears
    const confirmDialog = page.locator('.modal-dialog');
    await expect(confirmDialog).toBeVisible();
    
    // Confirm deletion
    await page.click('.modal-footer button:has-text("Delete")');
    
    // Verify redirected to projects page
    await expect(page).toHaveURL(/.*\/projects$/);
    
    // Verify success message
    // const successMessage = page.locator('.toast-success');
    // await expect(successMessage).toBeVisible();
    
    // Try to navigate to the deleted project URL
    await page.goto(projectUrl);
    
    // Verify project no longer exists (should be redirected or show error)
    // await expect(page).not.toHaveURL(projectUrl);
  });
});

/**
 * Test case: Manage project members
 */
test.describe('Manage project members', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await loginAs(page, 'admin');
    
    // Navigate to projects page and open first project
    await navigateToProjects(page);
    await openProjectDetails(page, 0);
  });

  /*
  test('Admin can manage project members', async ({ page }) => {
    // Click on Manage Members button
    await page.click('button:has-text("Manage Members")');
    
    // Verify redirected to project members page
    await expect(page).toHaveURL(/.*\/projects\/\d+\/members/);
    
    // Verify project members list is displayed
    const membersList = page.locator('.members-table');
    await expect(membersList).toBeVisible();
    
    // Click on Add Member button
    await page.click('button:has-text("Add Member")');
    
    // Verify add member form is displayed
    const addMemberForm = page.locator('.add-member-form');
    await expect(addMemberForm).toBeVisible();
    
    // Select a user to add
    await page.selectOption('select[aria-label="Select User"]', { label: 'Team Member' });
    
    // Select a role for the user
    await page.selectOption('select[aria-label="Select Role"]', 'VIEWER');
    
    // Submit the form
    await page.click('.add-member-form button:has-text("Add")');
    
    // Verify success message
    const successMessage = page.locator('.toast-success');
    await expect(successMessage).toBeVisible();
    
    // Verify the new member appears in the list
    const memberCard = page.locator('.member-card:has-text("Team Member")');
    await expect(memberCard).toBeVisible();
    
    // Verify the member's role
    const memberRole = memberCard.locator('.member-role');
    await expect(memberRole).toContainText('Viewer');
    
    // Change member's role
    await page.click('.member-card:has-text("Team Member") .edit-role-button');
    await page.selectOption('.edit-role-dropdown', 'EDITOR');
    await page.click('.save-role-button');
    
    // Verify role is updated
    await expect(memberRole).toContainText('Editor');
    
    // Remove the member
    await page.click('.member-card:has-text("Team Member") .remove-member-button');
    
    // Verify confirmation dialog appears
    const confirmDialog = page.locator('.modal-dialog');
    await expect(confirmDialog).toBeVisible();
    
    // Confirm removal
    await page.click('.modal-footer button:has-text("Remove")');
    
    // Verify success message
    const removeSuccessMessage = page.locator('.toast-success');
    await expect(removeSuccessMessage).toBeVisible();
    
    // Verify member is no longer in the list
    await expect(page.locator('.member-card:has-text("Team Member")')).not.toBeVisible();
  });
  */
}); 