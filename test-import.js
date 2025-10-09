// Test file to verify ES module imports
import express from 'express';

console.log('✅ Express import successful');

try {
  const { default: WebsitePage } = await import('./backend/models/WebsitePage.js');
  console.log('✅ WebsitePage model import successful');
} catch (error) {
  console.error('❌ WebsitePage model import failed:', error.message);
}

try {
  const { default: websitePagesRoutes } = await import('./backend/routes/websitePages.js');
  console.log('✅ websitePages routes import successful');
} catch (error) {
  console.error('❌ websitePages routes import failed:', error.message);
}

console.log('🎯 Import test completed');
process.exit(0);
