#!/usr/bin/env node

/**
 * MATC GitHub Automation Setup Script
 * Automates GitHub repository setup, secrets configuration, and deployment pipeline
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  repository: {
    owner: 'maaloulahmed93-oss',
    name: 'matc-fullstack',
    url: 'https://github.com/maaloulahmed93-oss/matc-fullstack',
    branch: 'main'
  },
  secrets: {
    // Backend secrets
    MONGODB_URI: 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db',
    NODE_ENV: 'production',
    PORT: '10000',
    FRONTEND_URLS: 'https://matrainingconsulting.vercel.app,https://admine-lake.vercel.app',
    JWT_SECRET: 'matc_secret_2025',
    
    // Frontend secrets
    VITE_API_BASE_URL: 'https://matc-backend.onrender.com/api',
    VITE_APP_NAME: 'MA-TRAINING-CONSULTING',
    
    // Deployment secrets (to be added manually)
    // VERCEL_TOKEN: '<your_vercel_token_here>',
    // RENDER_API_KEY: '<your_render_api_key_here>',
    // RENDER_SERVICE_ID: '<your_render_service_id_here>',
    // VERCEL_ORG_ID: '<your_vercel_org_id_here>',
    // VERCEL_PROJECT_ID: '<your_vercel_project_id_here>',
    // VERCEL_ADMIN_PROJECT_ID: '<your_vercel_admin_project_id_here>'
  }
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function header(message) {
  log(`\n${'='.repeat(60)}`, colors.cyan);
  log(`🚀 ${message}`, colors.cyan);
  log(`${'='.repeat(60)}`, colors.cyan);
}

// Execute command with error handling
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: options.cwd || process.cwd(),
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit'
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout || error.stderr || ''
    };
  }
}

// Check if Git is installed and configured
function checkGitSetup() {
  header('Git Configuration Check');
  
  // Check if git is installed
  const gitCheck = runCommand('git --version', { silent: true });
  if (!gitCheck.success) {
    error('Git is not installed or not in PATH');
    error('Please install Git from https://git-scm.com/');
    return false;
  }
  success(`Git is installed: ${gitCheck.output.trim()}`);
  
  // Check git configuration
  const userCheck = runCommand('git config user.name', { silent: true });
  const emailCheck = runCommand('git config user.email', { silent: true });
  
  if (!userCheck.success || !emailCheck.success) {
    warning('Git user configuration is incomplete');
    info('Please configure Git with:');
    info('git config --global user.name "Your Name"');
    info('git config --global user.email "your.email@example.com"');
    return false;
  }
  
  success(`Git user: ${userCheck.output.trim()} <${emailCheck.output.trim()}>`);
  return true;
}

// Initialize or verify Git repository
function setupGitRepository() {
  header('Git Repository Setup');
  
  // Check if we're in a git repository
  const gitStatus = runCommand('git status', { silent: true });
  
  if (!gitStatus.success) {
    info('Initializing Git repository...');
    const initResult = runCommand('git init');
    if (!initResult.success) {
      error('Failed to initialize Git repository');
      return false;
    }
    success('Git repository initialized');
  } else {
    success('Git repository already exists');
  }
  
  // Check current remote
  const remoteCheck = runCommand('git remote get-url origin', { silent: true });
  
  if (!remoteCheck.success) {
    info(`Adding GitHub remote: ${CONFIG.repository.url}`);
    const addRemote = runCommand(`git remote add origin ${CONFIG.repository.url}`);
    if (!addRemote.success) {
      error('Failed to add GitHub remote');
      return false;
    }
    success('GitHub remote added');
  } else {
    const currentRemote = remoteCheck.output.trim();
    if (currentRemote !== CONFIG.repository.url) {
      info(`Updating remote from ${currentRemote} to ${CONFIG.repository.url}`);
      const updateRemote = runCommand(`git remote set-url origin ${CONFIG.repository.url}`);
      if (!updateRemote.success) {
        error('Failed to update GitHub remote');
        return false;
      }
      success('GitHub remote updated');
    } else {
      success(`GitHub remote already configured: ${currentRemote}`);
    }
  }
  
  return true;
}

// Create .gitignore if it doesn't exist
function setupGitignore() {
  const gitignorePath = '.gitignore';
  
  if (!fs.existsSync(gitignorePath)) {
    info('Creating .gitignore file...');
    
    const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
.next/
.nuxt/
.vuepress/dist/

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port

# Stores VSCode versions used for testing VSCode extensions
.vscode-test
`;
    
    fs.writeFileSync(gitignorePath, gitignoreContent);
    success('.gitignore file created');
  } else {
    success('.gitignore file already exists');
  }
}

// Commit and push all changes
function commitAndPush() {
  header('Committing and Pushing Changes');
  
  // Add all files
  info('Adding all files to Git...');
  const addResult = runCommand('git add .');
  if (!addResult.success) {
    error('Failed to add files to Git');
    return false;
  }
  success('All files added to Git');
  
  // Check if there are changes to commit
  const statusResult = runCommand('git status --porcelain', { silent: true });
  if (!statusResult.output.trim()) {
    info('No changes to commit');
    return true;
  }
  
  // Commit changes
  const commitMessage = `🚀 Complete MATC fullstack deployment automation setup

- Added comprehensive GitHub Actions workflow
- Configured environment variables and secrets
- Set up automated CI/CD pipeline for Render + Vercel
- Added deployment validation and monitoring
- Created setup and validation scripts

Components:
- Backend API (Node.js + Express + MongoDB)
- Frontend Website (Vite + React)
- Admin Panel (Vite + React + TypeScript)

Deployment targets:
- Backend: Render.com
- Frontend: Vercel
- Admin Panel: Vercel

Generated by MATC Deployment Automation Script`;

  info('Committing changes...');
  const commitResult = runCommand(`git commit -m "${commitMessage}"`);
  if (!commitResult.success) {
    error('Failed to commit changes');
    return false;
  }
  success('Changes committed successfully');
  
  // Push to GitHub
  info('Pushing to GitHub...');
  const pushResult = runCommand(`git push -u origin ${CONFIG.repository.branch}`);
  if (!pushResult.success) {
    warning('Failed to push to GitHub - this may be expected if the repository doesn\'t exist yet');
    info('You may need to create the repository on GitHub first');
    info(`Repository URL: ${CONFIG.repository.url}`);
    return false;
  }
  success('Changes pushed to GitHub successfully');
  
  return true;
}

// Generate GitHub Secrets setup instructions
function generateSecretsInstructions() {
  header('GitHub Secrets Configuration');
  
  const secretsInstructions = `# 🔐 GitHub Secrets Configuration Instructions

## 📋 Required Secrets

To complete the deployment automation, you need to add the following secrets to your GitHub repository:

### 🔗 Repository URL
${CONFIG.repository.url}/settings/secrets/actions

### 📝 Secrets to Add

Click "New repository secret" for each of the following:

#### **Backend & Environment Secrets:**
\`\`\`
Name: MONGODB_URI
Value: ${CONFIG.secrets.MONGODB_URI}

Name: NODE_ENV
Value: ${CONFIG.secrets.NODE_ENV}

Name: PORT
Value: ${CONFIG.secrets.PORT}

Name: FRONTEND_URLS
Value: ${CONFIG.secrets.FRONTEND_URLS}

Name: JWT_SECRET
Value: ${CONFIG.secrets.JWT_SECRET}

Name: VITE_API_BASE_URL
Value: ${CONFIG.secrets.VITE_API_BASE_URL}

Name: VITE_APP_NAME
Value: ${CONFIG.secrets.VITE_APP_NAME}
\`\`\`

#### **Deployment Secrets (Get from respective platforms):**
\`\`\`
Name: VERCEL_TOKEN
Value: [Get from Vercel Dashboard → Settings → Tokens]

Name: RENDER_API_KEY
Value: [Get from Render Dashboard → Account Settings → API Keys]

Name: RENDER_SERVICE_ID
Value: [Get from Render service URL: srv-XXXXXXXXX]

Name: VERCEL_ORG_ID
Value: [Get from Vercel Dashboard → Settings → General]

Name: VERCEL_PROJECT_ID
Value: [Get from Vercel Project → Settings → General]

Name: VERCEL_ADMIN_PROJECT_ID
Value: [Get from Admin Panel Vercel Project → Settings]
\`\`\`

## 🚀 After Adding Secrets

1. Go to the Actions tab in your GitHub repository
2. You should see the "Deploy MATC Fullstack" workflow
3. Click "Run workflow" to test the deployment
4. Or push a new commit to trigger automatic deployment

## 🔗 Quick Links

- **Repository:** ${CONFIG.repository.url}
- **Actions:** ${CONFIG.repository.url}/actions
- **Secrets:** ${CONFIG.repository.url}/settings/secrets/actions

## ✅ Verification

After adding all secrets, the deployment should work automatically when you push code to the main branch.
`;

  const instructionsPath = 'GITHUB_SECRETS_INSTRUCTIONS.md';
  fs.writeFileSync(instructionsPath, secretsInstructions);
  success(`GitHub Secrets instructions saved to: ${instructionsPath}`);
  
  // Display key information
  info('🔐 GitHub Secrets Configuration Required:');
  info(`1. Go to: ${CONFIG.repository.url}/settings/secrets/actions`);
  info('2. Add the secrets listed in GITHUB_SECRETS_INSTRUCTIONS.md');
  info('3. Get deployment tokens from Vercel and Render dashboards');
  info('4. Test the deployment by pushing code or running the workflow manually');
}

// Validate project structure
function validateProjectStructure() {
  header('Project Structure Validation');
  
  const requiredPaths = [
    'backend/package.json',
    'backend/server.js',
    'admin-panel/package.json',
    'package.json',
    '.github/workflows/deploy.yml'
  ];
  
  let allValid = true;
  
  for (const filePath of requiredPaths) {
    if (fs.existsSync(filePath)) {
      success(`✓ ${filePath}`);
    } else {
      error(`✗ ${filePath} - Missing`);
      allValid = false;
    }
  }
  
  if (allValid) {
    success('Project structure validation passed');
  } else {
    error('Project structure validation failed - some required files are missing');
  }
  
  return allValid;
}

// Main setup function
async function main() {
  const startTime = Date.now();
  
  header('MATC GitHub Automation Setup');
  
  info('🎯 Setting up complete GitHub automation for MATC fullstack project');
  info(`📁 Working directory: ${process.cwd()}`);
  info(`🔗 Target repository: ${CONFIG.repository.url}`);
  
  try {
    // Step 1: Validate project structure
    if (!validateProjectStructure()) {
      error('Project structure validation failed. Please ensure all required files exist.');
      process.exit(1);
    }
    
    // Step 2: Check Git setup
    if (!checkGitSetup()) {
      error('Git setup incomplete. Please configure Git and try again.');
      process.exit(1);
    }
    
    // Step 3: Setup Git repository
    if (!setupGitRepository()) {
      error('Failed to setup Git repository');
      process.exit(1);
    }
    
    // Step 4: Setup .gitignore
    setupGitignore();
    
    // Step 5: Commit and push changes
    const pushSuccess = commitAndPush();
    
    // Step 6: Generate secrets instructions
    generateSecretsInstructions();
    
    // Final summary
    const duration = Math.round((Date.now() - startTime) / 1000);
    
    header('Setup Complete');
    
    if (pushSuccess) {
      success('🎉 MATC GitHub automation setup completed successfully!');
      success(`⏱️  Setup time: ${duration} seconds`);
      success(`🔗 Repository: ${CONFIG.repository.url}`);
      success('✅ All code committed and pushed to GitHub');
      success('✅ GitHub Actions workflow configured');
      success('✅ Deployment pipeline ready');
    } else {
      warning('⚠️  Setup completed with warnings');
      warning('Code may not have been pushed to GitHub');
      warning('Please check the repository exists and you have push access');
    }
    
    info('\n📋 Next Steps:');
    info('1. Ensure the GitHub repository exists and is accessible');
    info('2. Add the required secrets using GITHUB_SECRETS_INSTRUCTIONS.md');
    info('3. Test the deployment by pushing code or running the workflow');
    info('4. Monitor the deployment in the GitHub Actions tab');
    
    info('\n🔗 Quick Links:');
    info(`Repository: ${CONFIG.repository.url}`);
    info(`Actions: ${CONFIG.repository.url}/actions`);
    info(`Secrets: ${CONFIG.repository.url}/settings/secrets/actions`);
    
  } catch (error) {
    error(`Setup failed: ${error.message}`);
    process.exit(1);
  }
}

// Handle command line execution
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  main,
  CONFIG
};
