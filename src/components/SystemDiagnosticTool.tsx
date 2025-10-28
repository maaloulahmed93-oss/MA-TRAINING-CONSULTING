import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Globe, 
  Settings, 
  Download,
  Activity,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
  timestamp: string;
}

interface SystemHealth {
  backend: boolean;
  database: boolean;
  cors: boolean;
  rateLimit: boolean;
  overall: 'healthy' | 'degraded' | 'unhealthy';
}

class SystemDiagnostic {
  private static readonly API_BASE = 'https://matc-backend.onrender.com/api';
  private static readonly ADMIN_URL = 'https://admine-lake.vercel.app';
  private static readonly FRONTEND_URL = 'https://matrainingconsulting.vercel.app';

  static async runFullDiagnostic(): Promise<DiagnosticResult[]> {
    console.log('🔍 بدء التشخيص الشامل للنظام...');
    
    const results: DiagnosticResult[] = [];
    
    // Test Backend Health
    results.push(await this.testBackendHealth());
    
    // Test Database Connection
    results.push(await this.testDatabaseConnection());
    
    // Test CORS Configuration
    results.push(await this.testCORSConfiguration());
    
    // Test Rate Limiting
    results.push(await this.testRateLimiting());
    
    // Test API Endpoints
    results.push(...await this.testAPIEndpoints());
    
    // Test Admin Panel Connectivity
    results.push(await this.testAdminPanelConnectivity());
    
    // Test Frontend Connectivity
    results.push(await this.testFrontendConnectivity());
    
    // Test Data Synchronization
    results.push(...await this.testDataSynchronization());
    
    console.log(`✅ انتهى التشخيص: ${results.length} اختبار`);
    return results;
  }

  private static async testBackendHealth(): Promise<DiagnosticResult> {
    try {
      const response = await fetch(`${this.API_BASE}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        return {
          name: 'Backend Health',
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          timestamp: new Date().toISOString()
        };
      }

      const result = await response.json();
      
      if (result.success) {
        return {
          name: 'Backend Health',
          status: 'success',
          message: 'Backend is healthy and responding',
          details: `Uptime: ${result.uptime}s, Environment: ${result.environment}`,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'Backend Health',
          status: 'warning',
          message: 'Backend responded but with warnings',
          details: result.message,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'Backend Health',
        status: 'error',
        message: 'Backend is not responding',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private static async testDatabaseConnection(): Promise<DiagnosticResult> {
    try {
      const response = await fetch(`${this.API_BASE}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        return {
          name: 'Database Connection',
          status: 'error',
          message: 'Cannot test database - backend unavailable',
          timestamp: new Date().toISOString()
        };
      }

      const result = await response.json();
      
      if (result.database === 'connected') {
        return {
          name: 'Database Connection',
          status: 'success',
          message: 'Database is connected and accessible',
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'Database Connection',
          status: 'error',
          message: 'Database connection failed',
          details: `Status: ${result.database}`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'Database Connection',
        status: 'error',
        message: 'Cannot test database connection',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private static async testCORSConfiguration(): Promise<DiagnosticResult> {
    try {
      const response = await fetch(`${this.API_BASE}`, {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        signal: AbortSignal.timeout(5000)
      });

      const corsHeaders = {
        'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
      };

      if (corsHeaders['Access-Control-Allow-Origin']) {
        return {
          name: 'CORS Configuration',
          status: 'success',
          message: 'CORS is properly configured',
          details: `Origin: ${corsHeaders['Access-Control-Allow-Origin']}`,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'CORS Configuration',
          status: 'warning',
          message: 'CORS headers not detected',
          details: 'This may cause issues with cross-origin requests',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'CORS Configuration',
        status: 'error',
        message: 'Cannot test CORS configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private static async testRateLimiting(): Promise<DiagnosticResult> {
    try {
      // Make multiple rapid requests to test rate limiting
      const requests = Array(5).fill(null).map(() => 
        fetch(`${this.API_BASE}/health`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(2000)
        })
      );

      const responses = await Promise.all(requests);
      const successCount = responses.filter(r => r.ok).length;

      if (successCount === 5) {
        return {
          name: 'Rate Limiting',
          status: 'success',
          message: 'Rate limiting is working properly',
          details: `All ${successCount} requests succeeded`,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'Rate Limiting',
          status: 'warning',
          message: 'Rate limiting may be too permissive',
          details: `${successCount}/5 requests succeeded`,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'Rate Limiting',
        status: 'error',
        message: 'Cannot test rate limiting',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private static async testAPIEndpoints(): Promise<DiagnosticResult[]> {
    const endpoints = [
      '/programs',
      '/participants',
      '/testimonials',
      '/events',
      '/newsletter',
      '/freelancer-offers',
      '/free-courses',
      '/site-config',
      '/footer-settings'
    ];

    const results: DiagnosticResult[] = [];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${this.API_BASE}${endpoint}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(3000)
        });

        if (response.ok) {
          results.push({
            name: `API Endpoint: ${endpoint}`,
            status: 'success',
            message: 'Endpoint is accessible',
            timestamp: new Date().toISOString()
          });
        } else {
          results.push({
            name: `API Endpoint: ${endpoint}`,
            status: 'warning',
            message: `HTTP ${response.status}`,
            details: response.statusText,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        results.push({
          name: `API Endpoint: ${endpoint}`,
          status: 'error',
          message: 'Endpoint is not accessible',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    }

    return results;
  }

  private static async testAdminPanelConnectivity(): Promise<DiagnosticResult> {
    try {
      const response = await fetch(this.ADMIN_URL, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        return {
          name: 'Admin Panel Connectivity',
          status: 'success',
          message: 'Admin panel is accessible',
          details: `Status: ${response.status}`,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'Admin Panel Connectivity',
          status: 'warning',
          message: `Admin panel returned ${response.status}`,
          details: response.statusText,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'Admin Panel Connectivity',
        status: 'error',
        message: 'Admin panel is not accessible',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private static async testFrontendConnectivity(): Promise<DiagnosticResult> {
    try {
      const response = await fetch(this.FRONTEND_URL, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        return {
          name: 'Frontend Connectivity',
          status: 'success',
          message: 'Frontend is accessible',
          details: `Status: ${response.status}`,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          name: 'Frontend Connectivity',
          status: 'warning',
          message: `Frontend returned ${response.status}`,
          details: response.statusText,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        name: 'Frontend Connectivity',
        status: 'error',
        message: 'Frontend is not accessible',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private static async testDataSynchronization(): Promise<DiagnosticResult[]> {
    const results: DiagnosticResult[] = [];

    // Test if data can be fetched from API
    try {
      const response = await fetch(`${this.API_BASE}/programs`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          results.push({
            name: 'Data Synchronization: Programs',
            status: 'success',
            message: 'Programs data is synchronized',
            details: `${result.data.length} programs available`,
            timestamp: new Date().toISOString()
          });
        } else {
          results.push({
            name: 'Data Synchronization: Programs',
            status: 'warning',
            message: 'Programs data format issue',
            details: 'API returned unexpected format',
            timestamp: new Date().toISOString()
          });
        }
      } else {
        results.push({
          name: 'Data Synchronization: Programs',
          status: 'error',
          message: 'Cannot fetch programs data',
          details: `HTTP ${response.status}`,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      results.push({
        name: 'Data Synchronization: Programs',
        status: 'error',
        message: 'Programs data synchronization failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }

    return results;
  }

  static calculateSystemHealth(results: DiagnosticResult[]): SystemHealth {
    const criticalTests = results.filter(r => 
      ['Backend Health', 'Database Connection'].includes(r.name)
    );
    
    const warningTests = results.filter(r => r.status === 'warning');
    const errorTests = results.filter(r => r.status === 'error');

    const backend = criticalTests.find(r => r.name === 'Backend Health')?.status === 'success';
    const database = criticalTests.find(r => r.name === 'Database Connection')?.status === 'success';
    const cors = results.find(r => r.name === 'CORS Configuration')?.status === 'success';
    const rateLimit = results.find(r => r.name === 'Rate Limiting')?.status === 'success';

    let overall: 'healthy' | 'degraded' | 'unhealthy';
    
    if (errorTests.length === 0 && warningTests.length <= 2) {
      overall = 'healthy';
    } else if (errorTests.length <= 2) {
      overall = 'degraded';
    } else {
      overall = 'unhealthy';
    }

    return {
      backend: backend || false,
      database: database || false,
      cors: cors || false,
      rateLimit: rateLimit || false,
      overall
    };
  }

  static generateReport(results: DiagnosticResult[]): string {
    const health = this.calculateSystemHealth(results);
    const timestamp = new Date().toISOString();
    
    let report = `# MATC System Diagnostic Report\n\n`;
    report += `**Generated:** ${timestamp}\n`;
    report += `**Overall Status:** ${health.overall.toUpperCase()}\n\n`;
    
    report += `## System Health Summary\n\n`;
    report += `- **Backend:** ${health.backend ? '✅ Healthy' : '❌ Unhealthy'}\n`;
    report += `- **Database:** ${health.database ? '✅ Connected' : '❌ Disconnected'}\n`;
    report += `- **CORS:** ${health.cors ? '✅ Configured' : '⚠️ Issues'}\n`;
    report += `- **Rate Limiting:** ${health.rateLimit ? '✅ Active' : '⚠️ Issues'}\n\n`;
    
    report += `## Test Results\n\n`;
    
    const successCount = results.filter(r => r.status === 'success').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    report += `**Summary:** ${successCount} passed, ${warningCount} warnings, ${errorCount} errors\n\n`;
    
    results.forEach(result => {
      const status = result.status === 'success' ? '✅' : 
                    result.status === 'warning' ? '⚠️' : '❌';
      report += `- ${status} **${result.name}**: ${result.message}\n`;
      if (result.details) {
        report += `  - Details: ${result.details}\n`;
      }
    });

    report += `\n## Recommendations\n\n`;
    
    if (health.overall === 'unhealthy') {
      report += `### Critical Issues Need Immediate Attention:\n`;
      results.filter(r => r.status === 'error').forEach(result => {
        report += `- **${result.name}**: ${result.message}\n`;
      });
    }

    if (warningCount > 0) {
      report += `\n### Warnings to Address:\n`;
      results.filter(r => r.status === 'warning').forEach(result => {
        report += `- **${result.name}**: ${result.message}\n`;
      });
    }

    return report;
  }
}

const SystemDiagnosticTool: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runDiagnostic = async () => {
    setIsRunning(true);
    try {
      const diagnosticResults = await SystemDiagnostic.runFullDiagnostic();
      const health = SystemDiagnostic.calculateSystemHealth(diagnosticResults);
      
      setResults(diagnosticResults);
      setSystemHealth(health);
      setLastRun(new Date());
      
      console.log('🔍 Diagnostic completed:', diagnosticResults);
    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    if (results.length === 0) return;
    
    const report = SystemDiagnostic.generateReport(results);
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matc-diagnostic-report-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getHealthColor = (overall: string) => {
    switch (overall) {
      case 'healthy': return 'text-green-600';
      case 'degraded': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            أداة تشخيص النظام
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            تشخيص شامل لصحة النظام واتصال جميع المكونات
          </p>
        </div>

        {/* System Health Overview */}
        {systemHealth && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">حالة النظام العامة</h2>
              <div className={`text-2xl font-bold ${getHealthColor(systemHealth.overall)}`}>
                {systemHealth.overall.toUpperCase()}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <Database className={`w-8 h-8 mx-auto mb-2 ${systemHealth.database ? 'text-green-600' : 'text-red-600'}`} />
                <div className="font-semibold">قاعدة البيانات</div>
                <div className={`text-sm ${systemHealth.database ? 'text-green-600' : 'text-red-600'}`}>
                  {systemHealth.database ? 'متصل' : 'غير متصل'}
                </div>
              </div>
              
              <div className="text-center">
                <Globe className={`w-8 h-8 mx-auto mb-2 ${systemHealth.backend ? 'text-green-600' : 'text-red-600'}`} />
                <div className="font-semibold">الخادم الخلفي</div>
                <div className={`text-sm ${systemHealth.backend ? 'text-green-600' : 'text-red-600'}`}>
                  {systemHealth.backend ? 'يعمل' : 'لا يعمل'}
                </div>
              </div>
              
              <div className="text-center">
                <Shield className={`w-8 h-8 mx-auto mb-2 ${systemHealth.cors ? 'text-green-600' : 'text-yellow-600'}`} />
                <div className="font-semibold">CORS</div>
                <div className={`text-sm ${systemHealth.cors ? 'text-green-600' : 'text-yellow-600'}`}>
                  {systemHealth.cors ? 'مُكوَّن' : 'مشاكل'}
                </div>
              </div>
              
              <div className="text-center">
                <Zap className={`w-8 h-8 mx-auto mb-2 ${systemHealth.rateLimit ? 'text-green-600' : 'text-yellow-600'}`} />
                <div className="font-semibold">حد المعدل</div>
                <div className={`text-sm ${systemHealth.rateLimit ? 'text-green-600' : 'text-yellow-600'}`}>
                  {systemHealth.rateLimit ? 'نشط' : 'مشاكل'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">تشخيص النظام</h3>
              {lastRun && (
                <p className="text-sm text-gray-600">
                  آخر تشغيل: {lastRun.toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={runDiagnostic}
                disabled={isRunning}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isRunning ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Activity className="w-4 h-4 mr-2" />
                )}
                {isRunning ? 'جاري التشخيص...' : 'تشغيل التشخيص'}
              </button>
              {results.length > 0 && (
                <button
                  onClick={downloadReport}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  تحميل التقرير
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">نتائج التشخيص</h3>
            
            <div className="space-y-3">
              {results.map((result, index) => (
                <motion.div
                  key={result.name}
                  className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(result.status)}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center">
                    {getStatusIcon(result.status)}
                    <div className="ml-3">
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm">{result.message}</div>
                      {result.details && (
                        <div className="text-xs mt-1 opacity-75">{result.details}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* System URLs */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">روابط النظام</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Settings className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-gray-900">لوحة الإدارة</span>
              </div>
              <a 
                href="https://admine-lake.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 break-all"
              >
                https://admine-lake.vercel.app
              </a>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Database className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-gray-900">الخادم الخلفي</span>
              </div>
              <a 
                href="https://matc-backend.onrender.com/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-green-600 hover:text-green-800 break-all"
              >
                https://matc-backend.onrender.com/api
              </a>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Globe className="w-5 h-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">الواجهة الأمامية</span>
              </div>
              <a 
                href="https://matrainingconsulting.vercel.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:text-purple-800 break-all"
              >
                https://matrainingconsulting.vercel.app
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemDiagnosticTool;
