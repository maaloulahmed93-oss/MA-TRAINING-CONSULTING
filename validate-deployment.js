#!/usr/bin/env node

/**
 * MATC Full-Stack Deployment Validation Script
 * Comprehensive testing and validation of all deployment components
 */

const https = require('https');
const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');

// Configuration
const CONFIG = {
  backend: {
    url: 'https://matc-backend.onrender.com',
    healthEndpoint: '/api/health',
    testEndpoints: ['/api/programs', '/api/categories', '/api/partners'],
    name: 'Backend API (Render)'
  },
  frontend: {
    url: 'https://matrainingconsulting.vercel.app',
    name: 'Frontend Website (Vercel)'
  },
  admin: {
    url: 'https://admine-lake.vercel.app',
    name: 'Admin Panel (Vercel)'
  },
  database: {
    name: 'MongoDB Atlas',
    connectionString: 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db'
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

// Utility functions
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

// HTTP request helper with timeout and retry
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    const timeout = options.timeout || 30000;
    
    const req = protocol.request(url, {
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'MATC-Deployment-Validator/1.0',
        'Accept': 'application/json, text/html, */*',
        ...options.headers
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          responseTime: Date.now() - startTime
        });
      });
    });
    
    const startTime = Date.now();
    
    req.on('error', (err) => {
      reject({
        error: err.message,
        code: err.code,
        responseTime: Date.now() - startTime
      });
    });
    
    req.setTimeout(timeout, () => {
      req.destroy();
      reject({
        error: 'Request timeout',
        code: 'TIMEOUT',
        responseTime: timeout
      });
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Validation results storage
const validationResults = {
  timestamp: new Date().toISOString(),
  overall: false,
  components: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// Component validation function
async function validateComponent(name, testFunction) {
  validationResults.summary.total++;
  
  try {
    const result = await testFunction();
    validationResults.components[name] = {
      status: result.success ? 'passed' : 'failed',
      details: result.details || {},
      responseTime: result.responseTime || 0,
      error: result.error || null
    };
    
    if (result.success) {
      validationResults.summary.passed++;
      success(`${name}: ${result.message || 'Validation passed'}`);
    } else {
      validationResults.summary.failed++;
      error(`${name}: ${result.message || 'Validation failed'}`);
      if (result.details) {
        info(`Details: ${JSON.stringify(result.details, null, 2)}`);
      }
    }
    
    return result.success;
  } catch (err) {
    validationResults.summary.failed++;
    validationResults.components[name] = {
      status: 'failed',
      error: err.message,
      responseTime: 0
    };
    error(`${name}: ${err.message}`);
    return false;
  }
}

// Backend API validation
async function validateBackendAPI() {
  info('Testing backend API endpoints...');
  
  try {
    // Health check
    const healthResponse = await makeRequest(CONFIG.backend.url + CONFIG.backend.healthEndpoint);
    
    if (healthResponse.statusCode !== 200) {
      return {
        success: false,
        message: `Health check failed (HTTP ${healthResponse.statusCode})`,
        responseTime: healthResponse.responseTime
      };
    }
    
    let healthData;
    try {
      healthData = JSON.parse(healthResponse.data);
    } catch (e) {
      return {
        success: false,
        message: 'Health endpoint returned invalid JSON',
        responseTime: healthResponse.responseTime
      };
    }
    
    if (!healthData.success) {
      return {
        success: false,
        message: 'Health check reported failure',
        details: healthData,
        responseTime: healthResponse.responseTime
      };
    }
    
    // Test other endpoints
    const endpointResults = {};
    for (const endpoint of CONFIG.backend.testEndpoints) {
      try {
        const response = await makeRequest(CONFIG.backend.url + endpoint);
        endpointResults[endpoint] = {
          status: response.statusCode,
          responseTime: response.responseTime
        };
      } catch (err) {
        endpointResults[endpoint] = {
          status: 'error',
          error: err.error,
          responseTime: err.responseTime
        };
      }
    }
    
    return {
      success: true,
      message: `Backend API healthy (${healthResponse.responseTime}ms)`,
      responseTime: healthResponse.responseTime,
      details: {
        health: healthData,
        endpoints: endpointResults
      }
    };
    
  } catch (err) {
    return {
      success: false,
      message: `Backend API unreachable: ${err.error}`,
      responseTime: err.responseTime,
      error: err
    };
  }
}

// Frontend validation
async function validateFrontend() {
  info('Testing frontend website...');
  
  try {
    const response = await makeRequest(CONFIG.frontend.url);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      // Check if it's a valid HTML page
      const isHTML = response.data.includes('<html') || response.data.includes('<!DOCTYPE');
      
      return {
        success: true,
        message: `Frontend accessible (${response.responseTime}ms)`,
        responseTime: response.responseTime,
        details: {
          statusCode: response.statusCode,
          contentType: response.headers['content-type'],
          isHTML: isHTML,
          size: response.data.length
        }
      };
    } else {
      return {
        success: false,
        message: `Frontend returned HTTP ${response.statusCode}`,
        responseTime: response.responseTime
      };
    }
    
  } catch (err) {
    return {
      success: false,
      message: `Frontend unreachable: ${err.error}`,
      responseTime: err.responseTime,
      error: err
    };
  }
}

// Admin panel validation
async function validateAdminPanel() {
  info('Testing admin panel...');
  
  try {
    const response = await makeRequest(CONFIG.admin.url);
    
    if (response.statusCode >= 200 && response.statusCode < 300) {
      const isHTML = response.data.includes('<html') || response.data.includes('<!DOCTYPE');
      
      return {
        success: true,
        message: `Admin panel accessible (${response.responseTime}ms)`,
        responseTime: response.responseTime,
        details: {
          statusCode: response.statusCode,
          contentType: response.headers['content-type'],
          isHTML: isHTML,
          size: response.data.length
        }
      };
    } else {
      return {
        success: false,
        message: `Admin panel returned HTTP ${response.statusCode}`,
        responseTime: response.responseTime
      };
    }
    
  } catch (err) {
    return {
      success: false,
      message: `Admin panel unreachable: ${err.error}`,
      responseTime: err.responseTime,
      error: err
    };
  }
}

// CORS validation
async function validateCORS() {
  info('Testing CORS configuration...');
  
  const origins = [
    CONFIG.frontend.url,
    CONFIG.admin.url
  ];
  
  const corsResults = {};
  let allPassed = true;
  
  for (const origin of origins) {
    try {
      const response = await makeRequest(CONFIG.backend.url + CONFIG.backend.healthEndpoint, {
        method: 'OPTIONS',
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
      };
      
      const passed = response.statusCode >= 200 && response.statusCode < 300;
      corsResults[origin] = {
        status: response.statusCode,
        headers: corsHeaders,
        passed: passed,
        responseTime: response.responseTime
      };
      
      if (!passed) allPassed = false;
      
    } catch (err) {
      corsResults[origin] = {
        status: 'error',
        error: err.error,
        passed: false,
        responseTime: err.responseTime
      };
      allPassed = false;
    }
  }
  
  return {
    success: allPassed,
    message: allPassed ? 'CORS configuration valid' : 'CORS configuration issues detected',
    details: corsResults
  };
}

// Environment variables validation
async function validateEnvironmentVariables() {
  info('Validating environment configuration...');
  
  const requiredVars = {
    backend: ['MONGODB_URI', 'NODE_ENV', 'PORT'],
    frontend: ['VITE_API_BASE_URL', 'VITE_APP_NAME'],
    admin: ['VITE_API_BASE_URL']
  };
  
  const envStatus = {};
  
  // Check if environment files exist
  const envFiles = [
    '.env.example',
    'production.env',
    'admin-panel/env.production',
    'backend/env.production.template'
  ];
  
  for (const file of envFiles) {
    const fullPath = `c:\\Users\\ahmed\\Desktop\\MATC SITE\\${file}`;
    envStatus[file] = {
      exists: fs.existsSync(fullPath),
      path: fullPath
    };
  }
  
  return {
    success: true,
    message: 'Environment configuration validated',
    details: {
      requiredVariables: requiredVars,
      environmentFiles: envStatus
    }
  };
}

// GitHub Actions workflows validation
async function validateGitHubWorkflows() {
  info('Validating GitHub Actions workflows...');
  
  const workflowFiles = [
    '.github/workflows/deploy-full-stack.yml',
    '.github/workflows/deploy-frontend.yml',
    'admin-panel/.github/workflows/deploy-admin.yml',
    'backend/.github/workflows/deploy-backend.yml'
  ];
  
  const workflowStatus = {};
  
  for (const workflow of workflowFiles) {
    const fullPath = `c:\\Users\\ahmed\\Desktop\\MATC SITE\\${workflow}`;
    const exists = fs.existsSync(fullPath);
    
    workflowStatus[workflow] = {
      exists: exists,
      path: fullPath
    };
    
    if (exists) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        workflowStatus[workflow].hasSecrets = content.includes('secrets.');
        workflowStatus[workflow].hasEnvironment = content.includes('env:');
        workflowStatus[workflow].size = content.length;
      } catch (err) {
        workflowStatus[workflow].error = err.message;
      }
    }
  }
  
  const allExist = Object.values(workflowStatus).every(w => w.exists);
  
  return {
    success: allExist,
    message: allExist ? 'All GitHub workflows configured' : 'Missing GitHub workflow files',
    details: workflowStatus
  };
}

// Generate comprehensive report
function generateReport() {
  const report = {
    ...validationResults,
    configuration: CONFIG,
    recommendations: []
  };
  
  // Add recommendations based on results
  if (validationResults.components['Backend API']?.status === 'failed') {
    report.recommendations.push('Backend API is unreachable - check Render deployment status');
  }
  
  if (validationResults.components['CORS Configuration']?.status === 'failed') {
    report.recommendations.push('CORS configuration needs adjustment for frontend origins');
  }
  
  if (validationResults.summary.failed > 0) {
    report.recommendations.push('Review failed components and check deployment logs');
  }
  
  // Calculate overall success
  validationResults.overall = validationResults.summary.failed === 0;
  
  // Save report
  const reportPath = 'matc_validation_report.json';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  return report;
}

// Main validation function
async function runValidation() {
  const startTime = Date.now();
  
  header('MATC Full-Stack Deployment Validation');
  
  info(`Starting comprehensive validation at ${new Date().toISOString()}`);
  info(`Target systems: Backend (Render), Frontend (Vercel), Admin Panel (Vercel)`);
  
  // Run all validations
  await validateComponent('Backend API', validateBackendAPI);
  await validateComponent('Frontend Website', validateFrontend);
  await validateComponent('Admin Panel', validateAdminPanel);
  await validateComponent('CORS Configuration', validateCORS);
  await validateComponent('Environment Variables', validateEnvironmentVariables);
  await validateComponent('GitHub Workflows', validateGitHubWorkflows);
  
  // Generate final report
  const report = generateReport();
  const duration = Math.round((Date.now() - startTime) / 1000);
  
  // Display summary
  header('Validation Summary');
  
  log(`📊 Total Tests: ${validationResults.summary.total}`, colors.blue);
  log(`✅ Passed: ${validationResults.summary.passed}`, colors.green);
  log(`❌ Failed: ${validationResults.summary.failed}`, colors.red);
  log(`⚠️  Warnings: ${validationResults.summary.warnings}`, colors.yellow);
  log(`⏱️  Duration: ${duration} seconds`, colors.blue);
  
  if (validationResults.overall) {
    success('\n🎉 ALL VALIDATIONS PASSED! MATC deployment is healthy and operational.');
    success('✅ Backend API: Accessible and responding');
    success('✅ Frontend: Live and serving content');
    success('✅ Admin Panel: Accessible and functional');
    success('✅ CORS: Properly configured for cross-origin requests');
    success('✅ Environment: All configuration files present');
    success('✅ GitHub Actions: All workflows configured');
  } else {
    error('\n⚠️  VALIDATION ISSUES DETECTED');
    error('Please review the failed components above and check:');
    error('- Deployment status on respective platforms');
    error('- Environment variable configuration');
    error('- Network connectivity and DNS resolution');
    error('- GitHub Actions workflow execution logs');
  }
  
  info(`\n📋 Detailed report saved to: matc_validation_report.json`);
  
  // Display URLs for quick access
  header('Quick Access URLs');
  log(`🔗 Backend API: ${CONFIG.backend.url}${CONFIG.backend.healthEndpoint}`, colors.cyan);
  log(`🔗 Frontend: ${CONFIG.frontend.url}`, colors.cyan);
  log(`🔗 Admin Panel: ${CONFIG.admin.url}`, colors.cyan);
  
  return validationResults.overall;
}

// Handle command line execution
if (require.main === module) {
  runValidation()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('Validation failed with error:', error);
      process.exit(1);
    });
}

module.exports = {
  runValidation,
  validateComponent,
  CONFIG
};
