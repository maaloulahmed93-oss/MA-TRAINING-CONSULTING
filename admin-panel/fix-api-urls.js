#!/usr/bin/env node

/**
 * Script to fix hardcoded localhost API URLs in Admin Panel service files
 * This script replaces all hardcoded localhost:3001 URLs with imports from the centralized config
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVICES_DIR = './src/services';
const CONFIG_IMPORT = "import { API_BASE_URL } from '../config/api';";

// Patterns to find and replace
const PATTERNS = [
  {
    find: /const API_BASE_URL = ['"`]http:\/\/localhost:3001\/api['"`];?/g,
    replace: CONFIG_IMPORT
  },
  {
    find: /const API_BASE = ['"`]http:\/\/localhost:3001\/api['"`];?/g,
    replace: `${CONFIG_IMPORT}\nconst API_BASE = API_BASE_URL;`
  },
  {
    find: /private readonly API_BASE = ['"`]http:\/\/localhost:3001\/api[^'"`]*['"`];?/g,
    replace: `private readonly API_BASE = API_BASE_URL;`
  },
  {
    find: /['"`]http:\/\/localhost:3001\/api\/health['"`]/g,
    replace: '`${API_BASE_URL.replace("/api", "")}/health`'
  }
];

// Special cases for specific files
const SPECIAL_CASES = {
  'websitePagesApiService.ts': {
    find: /const API_BASE_URL = ['"`]http:\/\/localhost:3001\/api\/website-pages['"`];?/g,
    replace: `${CONFIG_IMPORT}\nconst API_BASE_URL = \`\${API_BASE_URL}/website-pages\`;`
  },
  'siteConfigApiService.ts': {
    find: /private readonly API_BASE = ['"`]http:\/\/localhost:3001\/api\/site-config['"`];?/g,
    replace: `private readonly API_BASE = \`\${API_BASE_URL}/site-config\`;`
  }
};

function fixFile(filePath) {
  console.log(`🔧 Fixing ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if config import already exists
  const hasConfigImport = content.includes("import { API_BASE_URL } from '../config/api'");
  
  // Apply general patterns
  PATTERNS.forEach(pattern => {
    if (pattern.find.test(content)) {
      content = content.replace(pattern.find, pattern.replace);
      modified = true;
    }
  });
  
  // Apply special cases
  const fileName = path.basename(filePath);
  if (SPECIAL_CASES[fileName]) {
    const specialCase = SPECIAL_CASES[fileName];
    if (specialCase.find.test(content)) {
      content = content.replace(specialCase.find, specialCase.replace);
      modified = true;
    }
  }
  
  // Add import if not present and modifications were made
  if (modified && !hasConfigImport) {
    // Add import at the top after existing imports
    const lines = content.split('\n');
    let insertIndex = 0;
    
    // Find the last import line
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('import ') || lines[i].startsWith('export ')) {
        insertIndex = i + 1;
      } else if (lines[i].trim() === '') {
        continue;
      } else {
        break;
      }
    }
    
    lines.splice(insertIndex, 0, CONFIG_IMPORT);
    content = lines.join('\n');
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
    return true;
  } else {
    console.log(`⏭️  No changes needed for ${filePath}`);
    return false;
  }
}

function main() {
  console.log('🚀 Starting API URL fix process...\n');
  
  if (!fs.existsSync(SERVICES_DIR)) {
    console.error(`❌ Services directory not found: ${SERVICES_DIR}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(SERVICES_DIR)
    .filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts'))
    .map(file => path.join(SERVICES_DIR, file));
  
  let fixedCount = 0;
  
  files.forEach(file => {
    if (fixFile(file)) {
      fixedCount++;
    }
  });
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total files processed: ${files.length}`);
  console.log(`   Files modified: ${fixedCount}`);
  console.log(`   Files unchanged: ${files.length - fixedCount}`);
  
  if (fixedCount > 0) {
    console.log('\n✅ API URL fixes completed successfully!');
    console.log('🔄 Please rebuild the admin panel for changes to take effect.');
  } else {
    console.log('\n✨ All files are already using the centralized API configuration.');
  }
}

// Run the script if called directly
main();

export { fixFile, PATTERNS, SPECIAL_CASES };
