/**
 * Global teardown for Playwright tests
 */
async function globalTeardown() {
  // You can add global teardown logic here, such as:
  // - Cleaning up test data
  // - Shutting down services
  // - Generating reports
  
  console.log('Finished running Playwright tests.');
}

export default globalTeardown; 