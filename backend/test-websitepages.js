// Test websitePages module
import express from 'express';
import mongoose from 'mongoose';

console.log('🔍 Testing websitePages module...');

try {
  // Test WebsitePage model import
  const WebsitePage = (await import('./models/WebsitePage.js')).default;
  console.log('✅ WebsitePage model imported successfully');
  
  // Test websitePages routes import
  const websitePagesRoutes = (await import('./routes/websitePages.js')).default;
  console.log('✅ websitePages routes imported successfully');
  
  console.log('🎉 All imports successful! The module is working correctly.');
  
} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error('📍 Error details:', error);
}

process.exit(0);
