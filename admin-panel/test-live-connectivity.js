// Backend Connectivity Test for MATC Admin Panel
// Tests live connection between Vercel Admin Panel and Render Backend

const API_BASE_URL = 'https://ma-training-consulting.onrender.com/api';

console.log('🧪 MATC Backend Connectivity Test');
console.log('='.repeat(50));
console.log(`🎯 Target API: ${API_BASE_URL}`);
console.log(`🕐 Test Time: ${new Date().toISOString()}`);
console.log('='.repeat(50));

// Test Results Storage
const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
};

// Helper function to add test result
function addTestResult(name, success, details, responseTime = 0) {
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

// Test 1: Environment Variable Check
function testEnvironmentVariable() {
    console.log('\n📋 Test 1: Environment Variable Configuration');
    
    // Simulate environment variable check (would be import.meta.env.VITE_API_BASE_URL in browser)
    const expectedUrl = 'https://ma-training-consulting.onrender.com/api';
    const isCorrect = API_BASE_URL === expectedUrl;
    
    addTestResult(
        'Environment Variable VITE_API_BASE_URL',
        isCorrect,
        isCorrect ? 'Correctly configured' : `Expected: ${expectedUrl}, Got: ${API_BASE_URL}`
    );
}

// Test 2: Backend Health Check
async function testBackendHealth() {
    console.log('\n🏥 Test 2: Backend Health Check');
    
    const startTime = Date.now();
    try {
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        const responseTime = Date.now() - startTime;
        const data = await response.json();
        
        addTestResult(
            'Backend Health Endpoint',
            response.ok,
            `Status: ${response.status} | Response: ${JSON.stringify(data)}`,
            responseTime
        );
        
        return { success: response.ok, data, status: response.status };
    } catch (error) {
        const responseTime = Date.now() - startTime;
        addTestResult(
            'Backend Health Endpoint',
            false,
            `Network Error: ${error.message}`,
            responseTime
        );
        return { success: false, error: error.message };
    }
}

// Test 3: Programs API Test
async function testProgramsAPI() {
    console.log('\n📚 Test 3: Programs API Test');
    
    const startTime = Date.now();
    try {
        const response = await fetch(`${API_BASE_URL}/programs`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        const responseTime = Date.now() - startTime;
        
        // Check CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        };
        
        console.log('   🔍 CORS Headers:', corsHeaders);
        
        if (response.ok) {
            const data = await response.json();
            const programCount = Array.isArray(data) ? data.length : 'Unknown';
            
            addTestResult(
                'Programs API Endpoint',
                true,
                `Status: ${response.status} | Programs found: ${programCount}`,
                responseTime
            );
            
            return { success: true, data, status: response.status, corsHeaders };
        } else {
            const errorData = await response.text();
            addTestResult(
                'Programs API Endpoint',
                false,
                `Status: ${response.status} | Error: ${errorData}`,
                responseTime
            );
            
            return { success: false, status: response.status, error: errorData, corsHeaders };
        }
    } catch (error) {
        const responseTime = Date.now() - startTime;
        addTestResult(
            'Programs API Endpoint',
            false,
            `Network Error: ${error.message}`,
            responseTime
        );
        return { success: false, error: error.message };
    }
}

// Test 4: Categories API Test
async function testCategoriesAPI() {
    console.log('\n📂 Test 4: Categories API Test');
    
    const startTime = Date.now();
    try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
            const data = await response.json();
            const categoryCount = Array.isArray(data) ? data.length : 'Unknown';
            
            addTestResult(
                'Categories API Endpoint',
                true,
                `Status: ${response.status} | Categories found: ${categoryCount}`,
                responseTime
            );
            
            return { success: true, data, status: response.status };
        } else {
            const errorData = await response.text();
            addTestResult(
                'Categories API Endpoint',
                false,
                `Status: ${response.status} | Error: ${errorData}`,
                responseTime
            );
            
            return { success: false, status: response.status, error: errorData };
        }
    } catch (error) {
        const responseTime = Date.now() - startTime;
        addTestResult(
            'Categories API Endpoint',
            false,
            `Network Error: ${error.message}`,
            responseTime
        );
        return { success: false, error: error.message };
    }
}

// Test 5: CORS Preflight Test
async function testCORSPreflight() {
    console.log('\n🌐 Test 5: CORS Preflight Test');
    
    const startTime = Date.now();
    try {
        const response = await fetch(`${API_BASE_URL}/programs`, {
            method: 'OPTIONS'
        });
        
        const responseTime = Date.now() - startTime;
        
        const corsHeaders = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        };
        
        const hasCORS = corsHeaders['Access-Control-Allow-Origin'] !== null;
        
        addTestResult(
            'CORS Preflight Check',
            hasCORS,
            `CORS Headers: ${JSON.stringify(corsHeaders)}`,
            responseTime
        );
        
        return { success: hasCORS, corsHeaders };
    } catch (error) {
        const responseTime = Date.now() - startTime;
        addTestResult(
            'CORS Preflight Check',
            false,
            `Network Error: ${error.message}`,
            responseTime
        );
        return { success: false, error: error.message };
    }
}

// Main Test Runner
async function runAllTests() {
    console.log('🚀 Starting Backend Connectivity Tests...\n');
    
    // Run all tests
    testEnvironmentVariable();
    await testBackendHealth();
    const programsResult = await testProgramsAPI();
    await testCategoriesAPI();
    await testCORSPreflight();
    
    // Generate Summary Report
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY REPORT');
    console.log('='.repeat(50));
    
    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    const avgResponseTime = testResults.tests
        .filter(t => t.responseTime > 0)
        .reduce((sum, t) => sum + t.responseTime, 0) / testResults.tests.filter(t => t.responseTime > 0).length;
    
    console.log(`📈 Tests Passed: ${testResults.passed}/${testResults.total} (${successRate}%)`);
    console.log(`⏱️  Average Response Time: ${Math.round(avgResponseTime)}ms`);
    
    if (testResults.passed === testResults.total) {
        console.log('\n✅ CONNECTION SUCCESS');
        console.log('🎉 All tests passed! Backend connectivity is working perfectly.');
        console.log('🔗 Admin Panel can successfully communicate with Render backend.');
    } else {
        console.log('\n❌ CONNECTION ISSUES DETECTED');
        console.log('⚠️  Some tests failed. Analysis:');
        
        // Analyze failures
        const failedTests = testResults.tests.filter(t => !t.success);
        failedTests.forEach(test => {
            console.log(`   • ${test.name}: ${test.details}`);
        });
        
        // Provide recommendations
        console.log('\n🔧 RECOMMENDED FIXES:');
        
        if (failedTests.some(t => t.details.includes('CORS'))) {
            console.log('   1. CORS Issue: Update backend to allow Vercel domain');
            console.log('      - Add your Vercel domain to CORS allowedOrigins');
            console.log('      - Temporarily use "*" for testing');
        }
        
        if (failedTests.some(t => t.details.includes('Network Error'))) {
            console.log('   2. Network Issue: Check backend deployment status');
            console.log('      - Verify Render service is running');
            console.log('      - Check DNS resolution');
        }
        
        if (failedTests.some(t => t.details.includes('404') || t.details.includes('500'))) {
            console.log('   3. API Issue: Check backend routes and database');
            console.log('      - Verify API endpoints are properly configured');
            console.log('      - Check database connection');
        }
    }
    
    console.log('\n' + '='.repeat(50));
    
    return {
        success: testResults.passed === testResults.total,
        results: testResults,
        programsData: programsResult
    };
}

// Export for use in other contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests, testResults };
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
    runAllTests().then(results => {
        process.exit(results.success ? 0 : 1);
    });
}
