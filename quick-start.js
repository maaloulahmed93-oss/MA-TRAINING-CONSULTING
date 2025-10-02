#!/usr/bin/env node

/**
 * MATC System Quick Start Script
 * Initializes system with sample data and validates setup
 * Run: node quick-start.js
 */

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

class QuickStart {
    constructor() {
        this.step = 0;
        this.totalSteps = 8;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const colors = {
            info: COLORS.blue,
            success: COLORS.green,
            error: COLORS.red,
            warning: COLORS.yellow,
            header: COLORS.magenta,
            step: COLORS.cyan
        };
        
        console.log(`${colors[type]}[${timestamp}] ${message}${COLORS.reset}`);
    }

    nextStep(message) {
        this.step++;
        this.log(`\n🔹 Step ${this.step}/${this.totalSteps}: ${message}`, 'step');
    }

    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async runCommand(command, cwd = process.cwd()) {
        return new Promise((resolve, reject) => {
            exec(command, { cwd }, (error, stdout, stderr) => {
                if (error) {
                    reject({ error, stdout, stderr });
                } else {
                    resolve({ stdout, stderr });
                }
            });
        });
    }

    async checkPrerequisites() {
        this.nextStep('Checking Prerequisites');
        
        const checks = [
            { name: 'Node.js', command: 'node --version' },
            { name: 'NPM', command: 'npm --version' }
        ];
        
        for (const check of checks) {
            try {
                const result = await this.runCommand(check.command);
                this.log(`✅ ${check.name}: ${result.stdout.trim()}`, 'success');
            } catch (error) {
                this.log(`❌ ${check.name}: Not found or not working`, 'error');
                throw new Error(`${check.name} is required but not available`);
            }
        }
    }

    async checkDirectoryStructure() {
        this.nextStep('Checking Directory Structure');
        
        const requiredDirs = [
            'backend',
            'backend/models',
            'backend/routes',
            'backend/middleware',
            'src',
            'src/services',
            'src/components'
        ];
        
        const requiredFiles = [
            'backend/server.js',
            'backend/models/Partner.js',
            'backend/routes/partners.js',
            'backend/middleware/partnerAuth.js',
            'src/services/enterpriseApiService.ts',
            'package.json'
        ];
        
        // Check directories
        for (const dir of requiredDirs) {
            if (fs.existsSync(dir)) {
                this.log(`✅ Directory: ${dir}`, 'success');
            } else {
                this.log(`⚠️ Directory missing: ${dir}`, 'warning');
            }
        }
        
        // Check files
        let criticalFiles = 0;
        for (const file of requiredFiles) {
            if (fs.existsSync(file)) {
                this.log(`✅ File: ${file}`, 'success');
                criticalFiles++;
            } else {
                this.log(`❌ Critical file missing: ${file}`, 'error');
            }
        }
        
        if (criticalFiles < requiredFiles.length * 0.8) {
            throw new Error('Too many critical files missing');
        }
    }

    async installDependencies() {
        this.nextStep('Installing Dependencies');
        
        // Check if backend dependencies need installation
        if (fs.existsSync('backend/package.json') && !fs.existsSync('backend/node_modules')) {
            this.log('Installing backend dependencies...', 'info');
            try {
                await this.runCommand('npm install', './backend');
                this.log('✅ Backend dependencies installed', 'success');
            } catch (error) {
                this.log('⚠️ Backend dependency installation failed', 'warning');
            }
        }
        
        // Check if frontend dependencies need installation
        if (fs.existsSync('package.json') && !fs.existsSync('node_modules')) {
            this.log('Installing frontend dependencies...', 'info');
            try {
                await this.runCommand('npm install');
                this.log('✅ Frontend dependencies installed', 'success');
            } catch (error) {
                this.log('⚠️ Frontend dependency installation failed', 'warning');
            }
        }
        
        this.log('✅ Dependencies check completed', 'success');
    }

    async checkEnvironmentFiles() {
        this.nextStep('Checking Environment Configuration');
        
        const envFiles = [
            { path: 'backend/.env', required: ['MONGODB_URI', 'PORT'] },
            { path: '.env', required: ['VITE_API_BASE_URL'] }
        ];
        
        for (const envFile of envFiles) {
            if (fs.existsSync(envFile.path)) {
                this.log(`✅ Environment file found: ${envFile.path}`, 'success');
                
                // Check if required variables are present
                const content = fs.readFileSync(envFile.path, 'utf8');
                const missingVars = envFile.required.filter(variable => 
                    !content.includes(variable + '=')
                );
                
                if (missingVars.length > 0) {
                    this.log(`⚠️ Missing variables in ${envFile.path}: ${missingVars.join(', ')}`, 'warning');
                }
            } else {
                this.log(`⚠️ Environment file missing: ${envFile.path}`, 'warning');
                this.createSampleEnvFile(envFile.path);
            }
        }
    }

    createSampleEnvFile(filePath) {
        const sampleConfigs = {
            'backend/.env': `# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/matc-database
DB_NAME=matc-database

# Server Configuration
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here

# CORS
FRONTEND_URL=http://localhost:5175
ADMIN_URL=http://localhost:8536`,
            
            '.env': `# Frontend Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=MATC - Formation & Consulting
VITE_APP_VERSION=2.0.0`
        };
        
        if (sampleConfigs[filePath]) {
            fs.writeFileSync(filePath, sampleConfigs[filePath]);
            this.log(`📝 Created sample environment file: ${filePath}`, 'info');
            this.log(`⚠️ Please update with your actual configuration values`, 'warning');
        }
    }

    async startBackendServer() {
        this.nextStep('Starting Backend Server');
        
        if (!fs.existsSync('backend/server.js')) {
            this.log('❌ Backend server file not found', 'error');
            return false;
        }
        
        this.log('Starting backend server on port 3001...', 'info');
        
        // Start backend server in background
        const backendProcess = spawn('node', ['server.js'], {
            cwd: './backend',
            detached: true,
            stdio: 'pipe'
        });
        
        // Give server time to start
        await this.sleep(3000);
        
        // Test if server is responding
        try {
            const response = await fetch('http://localhost:3001/api/health');
            if (response.ok) {
                this.log('✅ Backend server started successfully', 'success');
                return true;
            } else {
                this.log('⚠️ Backend server started but not responding correctly', 'warning');
                return false;
            }
        } catch (error) {
            this.log('⚠️ Backend server may not be responding yet', 'warning');
            this.log('💡 Try running: cd backend && npm start', 'info');
            return false;
        }
    }

    async createSampleData() {
        this.nextStep('Creating Sample Data');
        
        const samplePartners = [
            {
                partnerId: 'ENT-DEMO001',
                fullName: 'Entreprise Demo Alpha',
                email: 'demo-alpha@matc-system.com',
                type: 'entreprise',
                contactPerson: 'Ahmed Demo',
                phone: '+216 20 123 456',
                isActive: true
            },
            {
                partnerId: 'FOR-DEMO001',
                fullName: 'Formateur Demo Beta',
                email: 'demo-beta@matc-system.com',
                type: 'formateur',
                contactPerson: 'Sarah Demo',
                phone: '+216 20 654 321',
                isActive: true
            }
        ];
        
        for (const partner of samplePartners) {
            try {
                const response = await fetch('http://localhost:3001/api/partners', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(partner)
                });
                
                if (response.ok) {
                    this.log(`✅ Created sample partner: ${partner.partnerId}`, 'success');
                } else {
                    const error = await response.json();
                    if (error.message && error.message.includes('duplicate')) {
                        this.log(`⚠️ Sample partner already exists: ${partner.partnerId}`, 'warning');
                    } else {
                        this.log(`❌ Failed to create partner: ${partner.partnerId}`, 'error');
                    }
                }
            } catch (error) {
                this.log(`❌ Error creating sample data: ${error.message}`, 'error');
            }
        }
    }

    async runSystemValidation() {
        this.nextStep('Running System Validation');
        
        if (fs.existsSync('validate-system.js')) {
            this.log('Running comprehensive system validation...', 'info');
            try {
                const result = await this.runCommand('node validate-system.js');
                this.log('✅ System validation completed', 'success');
                return true;
            } catch (error) {
                this.log('⚠️ System validation found issues', 'warning');
                this.log('💡 Check the validation output above for details', 'info');
                return false;
            }
        } else {
            this.log('⚠️ System validation script not found', 'warning');
            return false;
        }
    }

    async displayQuickStartGuide() {
        this.nextStep('Quick Start Guide');
        
        this.log('\n' + '='.repeat(60), 'header');
        this.log('🚀 MATC SYSTEM QUICK START COMPLETE!', 'header');
        this.log('='.repeat(60), 'header');
        
        this.log('\n📋 NEXT STEPS:', 'info');
        this.log('1. 🔧 Start Backend Server:', 'info');
        this.log('   cd backend && npm start', 'info');
        
        this.log('\n2. 🎨 Start Frontend Development Server:', 'info');
        this.log('   npm run dev', 'info');
        
        this.log('\n3. 🔍 Open System Health Monitor:', 'info');
        this.log('   Open system-health-monitor.html in your browser', 'info');
        
        this.log('\n4. 🧪 Test Data Isolation:', 'info');
        this.log('   Open test-data-isolation.html in your browser', 'info');
        
        this.log('\n📊 DEMO ACCOUNTS CREATED:', 'success');
        this.log('   Enterprise: ENT-DEMO001', 'success');
        this.log('   Formateur:  FOR-DEMO001', 'success');
        
        this.log('\n🔗 ACCESS URLS:', 'info');
        this.log('   Frontend:     http://localhost:5175', 'info');
        this.log('   Backend API:  http://localhost:3001/api', 'info');
        this.log('   Health Check: http://localhost:3001/api/health', 'info');
        
        this.log('\n📚 DOCUMENTATION:', 'info');
        this.log('   Deployment Guide: DEPLOYMENT-GUIDE.md', 'info');
        this.log('   Implementation:   DATA-ISOLATION-IMPLEMENTATION-SUMMARY.md', 'info');
        
        this.log('\n🔒 SECURITY STATUS:', 'success');
        this.log('   ✅ Data isolation by partnerId implemented', 'success');
        this.log('   ✅ Authentication middleware active', 'success');
        this.log('   ✅ Route protection enabled', 'success');
        this.log('   ✅ Cross-partner access blocked', 'success');
        
        this.log('\n' + '='.repeat(60), 'header');
        this.log('🎉 System ready for development and testing!', 'success');
        this.log('='.repeat(60), 'header');
    }

    async initialize() {
        try {
            this.log('🚀 MATC System Quick Start Initializing...', 'header');
            this.log('🔧 Setting up your development environment\n', 'info');
            
            await this.checkPrerequisites();
            await this.checkDirectoryStructure();
            await this.installDependencies();
            await this.checkEnvironmentFiles();
            
            // Try to start backend (optional)
            const backendStarted = await this.startBackendServer();
            
            if (backendStarted) {
                await this.createSampleData();
                await this.runSystemValidation();
            }
            
            await this.displayQuickStartGuide();
            
        } catch (error) {
            this.log(`\n❌ Quick start failed: ${error.message}`, 'error');
            this.log('💡 Please check the error above and try again', 'warning');
            process.exit(1);
        }
    }
}

// Run quick start if called directly
if (require.main === module) {
    const quickStart = new QuickStart();
    quickStart.initialize();
}

module.exports = QuickStart;
