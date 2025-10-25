#!/usr/bin/env node

/**
 * MATC API URL Comprehensive Fix Script
 * Updates all localhost:3001 references to production backend URL
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PRODUCTION_API_URL = 'https://matc-backend.onrender.com/api';
const OLD_API_URL_PATTERNS = [
  'http://localhost:3001/api',
  'http://localhost:3001',
  "'http://localhost:3001/api'",
  '"http://localhost:3001/api"',
  "'http://localhost:3001'",
  '"http://localhost:3001"'
];

// Files to update (relative to project root)
const FILES_TO_UPDATE = [
  'src/services/programsApi.ts',
  'src/services/partnershipsApiService.ts',
  'src/services/siteConfigApiService.ts',
  'src/services/testimonialsApiService.ts',
  'src/services/websitePagesService.ts',
  'src/services/partnerTestimonialsApiService.ts',
  'src/services/partnershipAuth.ts',
  'src/services/participantApiService.ts',
  'src/services/packsApi.ts',
  'src/services/globalEmailService.ts',
  'src/services/freelancerOffersService.ts',
  'src/services/freelancerProjectsService.ts',
  'src/services/freelancerMeetingsService.ts',
  'src/services/freelancerDeliverablesService.ts',
  'src/services/freelancerDecisionsService.ts',
  'src/services/freelancerData.ts',
  'src/services/freelancerAuth.ts',
  'src/services/freeCoursesService.ts',
  'src/services/formateurProgrammeService.ts',
  'src/services/formateurApiService.ts',
  'src/services/footerApiService.ts',
  'src/services/eventsApiService.ts',
  'src/services/enterpriseApiService.ts',
  'src/services/digitalizationTestimonialsApiService.ts',
  'src/services/digitalizationServicesApi.ts',
  'src/services/digitalizationProductsApi.ts',
  'src/services/digitalizationPortfolioApiService.ts',
  'src/services/digitalizationContactApiService.ts',
  'src/services/commercialNewApiService.ts',
  'src/services/commercialNewApiService-simple.ts'
];

function updateApiUrls() {
  console.log('🔧 Starting comprehensive API URL fix...\n');
  
  let totalUpdates = 0;
  let filesUpdated = 0;

  FILES_TO_UPDATE.forEach(relativePath => {
    const filePath = path.join(__dirname, relativePath);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${relativePath}`);
      return;
    }

    try {
      let content = fs.readFileSync(filePath, 'utf8');
      let fileUpdated = false;
      let fileUpdateCount = 0;

      // Replace all localhost patterns
      OLD_API_URL_PATTERNS.forEach(oldPattern => {
        const regex = new RegExp(oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        const matches = content.match(regex);
        
        if (matches) {
          // Determine replacement based on pattern
          let replacement;
          if (oldPattern.includes('/api')) {
            replacement = PRODUCTION_API_URL;
          } else {
            replacement = 'https://matc-backend.onrender.com';
          }
          
          // Preserve quotes if they exist
          if (oldPattern.startsWith("'")) {
            replacement = `'${replacement}'`;
          } else if (oldPattern.startsWith('"')) {
            replacement = `"${replacement}"`;
          }
          
          content = content.replace(regex, replacement);
          fileUpdateCount += matches.length;
          fileUpdated = true;
        }
      });

      if (fileUpdated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated ${relativePath} (${fileUpdateCount} replacements)`);
        filesUpdated++;
        totalUpdates += fileUpdateCount;
      } else {
        console.log(`✓  ${relativePath} - No updates needed`);
      }

    } catch (error) {
      console.error(`❌ Error updating ${relativePath}:`, error.message);
    }
  });

  console.log(`\n🎉 Fix completed!`);
  console.log(`📊 Files updated: ${filesUpdated}`);
  console.log(`📊 Total replacements: ${totalUpdates}`);
  console.log(`🔗 New API URL: ${PRODUCTION_API_URL}`);
}

// Run the fix
updateApiUrls();
