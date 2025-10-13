// MATC Admin Panel Deployment Verification Script
// Verifies API connectivity and environment configuration

const CORRECT_API_URL = 'https://matc-backend.onrender.com/api';

console.log('🔍 MATC Admin Panel Deployment Verification');
console.log('=' .repeat(50));
console.log(`🎯 Target API: ${CORRECT_API_URL}`);
console.log(`🕐 Verification Time: ${new Date().toISOString()}`);
console.log('=' .repeat(50));

// Test Results Storage
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
};

function addTestResult(name, success, details = '', responseTime = 0) {
    testResults.total++;
    if (success) testResults.passed++;
    else testResults.failed++;
    
    testResults.tests.push({
        name,
        success,
        details,
        responseTime,
        timestamp: new Date().toISOString()
    });
    
    const status = success ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${name} (${responseTime}ms)`);
    if (details) console.log(`   📝 ${details}`);
}

// Test 1: Backend Health Check
async function testBackendHealth() {
    console.log('\n🏥 Test 1: Backend Health Check');
    const startTime = Date.now();
    
    try {
        const response = await fetch(`${CORRECT_API_URL}/health`);
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
            const data = await response.json();
            addTestResult(
                'Backend Health Check',
                data.success === true,
                `Status: ${data.message}, DB: ${data.database}, Uptime: ${data.uptime}s`,
                responseTime
            );
        } else {
            addTestResult('Backend Health Check', false, `HTTP ${response.status}`, responseTime);
        }
    } catch (error) {
        addTestResult('Backend Health Check', false, `Network Error: ${error.message}`);
    }
}

// Test 2: Programs API
async function testProgramsAPI() {
    console.log('\n📚 Test 2: Programs API');
    const startTime = Date.now();
    
    try {
        const response = await fetch(`${CORRECT_API_URL}/programs`);
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
            const data = await response.json();
            addTestResult(
                'Programs API',
                data.success === true,
                `Found ${data.count} programs`,
                responseTime
            );
        } else {
            addTestResult('Programs API', false, `HTTP ${response.status}`, responseTime);
        }
    } catch (error) {
        addTestResult('Programs API', false, `Network Error: ${error.message}`);
    }
}

// Test 3: Categories API
async function testCategoriesAPI() {
    console.log('\n🏷️ Test 3: Categories API');
    const startTime = Date.now();
    
    try {
        const response = await fetch(`${CORRECT_API_URL}/categories`);
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
            const data = await response.json();
            addTestResult(
                'Categories API',
                data.success === true,
                `Found ${data.count} categories`,
                responseTime
            );
        } else {
            addTestResult('Categories API', false, `HTTP ${response.status}`, responseTime);
        }
    } catch (error) {
        addTestResult('Categories API', false, `Network Error: ${error.message}`);
    }
}

// Test 4: Partners API
async function testPartnersAPI() {
    console.log('\n🤝 Test 4: Partners API');
    const startTime = Date.now();
    
    try {
        const response = await fetch(`${CORRECT_API_URL}/partners`);
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
            const data = await response.json();
            addTestResult(
                'Partners API',
                data.success === true,
                `Found ${data.count} partners`,
                responseTime
            );
        } else {
            addTestResult('Partners API', false, `HTTP ${response.status}`, responseTime);
        }
    } catch (error) {
        addTestResult('Partners API', false, `Network Error: ${error.message}`);
    }
}

// Test 5: CORS Configuration
async function testCORS() {
    console.log('\n🌐 Test 5: CORS Configuration');
    const startTime = Date.now();
    
    try {
        const response = await fetch(`${CORRECT_API_URL}/health`, {
            method: 'OPTIONS'
        });
        const responseTime = Date.now() - startTime;
        
        const corsHeaders = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        };
        
        addTestResult(
            'CORS Configuration',
            response.ok,
            `Headers: ${JSON.stringify(corsHeaders)}`,
            responseTime
        );
    } catch (error) {
        addTestResult('CORS Configuration', false, `Network Error: ${error.message}`);
    }
}

// Run all tests
async function runAllTests() {
    console.log('\n🚀 Starting comprehensive API tests...\n');
    
    await testBackendHealth();
    await testProgramsAPI();
    await testCategoriesAPI();
    await testPartnersAPI();
    await testCORS();
    
    // Final Report
    console.log('\n' + '='.repeat(50));
    console.log('📊 FINAL VERIFICATION REPORT');
    console.log('='.repeat(50));
    console.log(`✅ Tests Passed: ${testResults.passed}/${testResults.total}`);
    console.log(`❌ Tests Failed: ${testResults.failed}/${testResults.total}`);
    console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
    
    const avgResponseTime = testResults.tests
        .filter(t => t.responseTime > 0)
        .reduce((sum, t) => sum + t.responseTime, 0) / testResults.tests.filter(t => t.responseTime > 0).length;
    
    console.log(`⚡ Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
    
    if (testResults.failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! Admin Panel is ready for deployment.');
        console.log('✅ MATC Admin Panel successfully reconnected to backend API.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the issues above.');
    }
    
    return testResults;
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests, testResults };
}

// Auto-run if executed directly
if (typeof window === 'undefined') {
    runAllTests().catch(console.error);
}
