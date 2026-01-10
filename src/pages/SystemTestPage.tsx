import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Database,
  Globe,
  Settings,
  Activity,
  Clock,
  Play,
  BarChart3
} from 'lucide-react';
import SystemDiagnosticTool from '../components/SystemDiagnosticTool';

const SystemTestPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagnostic' | 'sync'>('diagnostic');

  const tabs = [
    { id: 'diagnostic', label: 'تشخيص النظام', icon: Activity },
    { id: 'sync', label: 'اختبار المزامنة', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">أداة اختبار النظام الشاملة</h1>
              <p className="text-gray-600">تشخيص وإدارة جميع مكونات نظام MATC</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                آخر تحديث: {new Date().toLocaleString()}
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {activeTab === 'diagnostic' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SystemDiagnosticTool />
          </motion.div>
        )}

        {activeTab === 'sync' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SyncTestPanel />
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Sync Test Panel Component
const SyncTestPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const runSyncTest = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      console.log('🚀 بدء اختبار المزامنة الشامل...');
      
      const testResults = [];
      
      // Test 1: Backend API Health
      testResults.push({
        name: 'صحة الخادم الخلفي',
        status: 'running',
        message: 'جاري اختبار الاتصال...'
      });
      setResults([...testResults]);

      const healthResponse = await fetch('https://matc-backend.onrender.com/api/health', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });

      testResults[0] = {
        name: 'صحة الخادم الخلفي',
        status: healthResponse.ok ? 'success' : 'error',
        message: healthResponse.ok ? 'الخادم يعمل بشكل طبيعي' : `خطأ HTTP: ${healthResponse.status}`,
        details: healthResponse.ok ? 'تم الاتصال بنجاح' : 'فشل في الاتصال'
      };
      setResults([...testResults]);

      // Test 2: Programs Sync
      testResults.push({
        name: 'مزامنة البرامج',
        status: 'running',
        message: 'جاري اختبار مزامنة البرامج...'
      });
      setResults([...testResults]);

      const programsResponse = await fetch('https://matc-backend.onrender.com/api/programs', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });

      if (programsResponse.ok) {
        const programsData = await programsResponse.json();
        testResults[1] = {
          name: 'مزامنة البرامج',
          status: 'success',
          message: `تم العثور على ${programsData.data?.length || 0} برنامج`,
          details: 'البرامج متزامنة بنجاح'
        };
      } else {
        testResults[1] = {
          name: 'مزامنة البرامج',
          status: 'error',
          message: 'فشل في جلب البرامج',
          details: `HTTP ${programsResponse.status}`
        };
      }
      setResults([...testResults]);

      // Test 3: Testimonials Sync
      testResults.push({
        name: 'مزامنة الشهادات',
        status: 'running',
        message: 'جاري اختبار مزامنة الشهادات...'
      });
      setResults([...testResults]);

      const testimonialsResponse = await fetch('https://matc-backend.onrender.com/api/testimonials', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });

      if (testimonialsResponse.ok) {
        const testimonialsData = await testimonialsResponse.json();
        testResults[2] = {
          name: 'مزامنة الشهادات',
          status: 'success',
          message: `تم العثور على ${testimonialsData.data?.length || 0} شهادة`,
          details: 'الشهادات متزامنة بنجاح'
        };
      } else {
        testResults[2] = {
          name: 'مزامنة الشهادات',
          status: 'error',
          message: 'فشل في جلب الشهادات',
          details: `HTTP ${testimonialsResponse.status}`
        };
      }
      setResults([...testResults]);

      // Test 4: Events Sync
      testResults.push({
        name: 'مزامنة الأحداث',
        status: 'running',
        message: 'جاري اختبار مزامنة الأحداث...'
      });
      setResults([...testResults]);

      const eventsResponse = await fetch('https://matc-backend.onrender.com/api/events', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        testResults[3] = {
          name: 'مزامنة الأحداث',
          status: 'success',
          message: `تم العثور على ${eventsData.data?.length || 0} حدث`,
          details: 'الأحداث متزامنة بنجاح'
        };
      } else {
        testResults[3] = {
          name: 'مزامنة الأحداث',
          status: 'error',
          message: 'فشل في جلب الأحداث',
          details: `HTTP ${eventsResponse.status}`
        };
      }
      setResults([...testResults]);

      // Test 5: Freelancer Offers Sync
      testResults.push({
        name: 'مزامنة عروض المستقلين',
        status: 'running',
        message: 'جاري اختبار مزامنة عروض المستقلين...'
      });
      setResults([...testResults]);

      const freelancerOffersResponse = await fetch('https://matc-backend.onrender.com/api/freelancer-offers', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000)
      });

      if (freelancerOffersResponse.ok) {
        const freelancerOffersData = await freelancerOffersResponse.json();
        testResults[4] = {
          name: 'مزامنة عروض المستقلين',
          status: 'success',
          message: `تم العثور على ${freelancerOffersData.data?.length || 0} عرض مستقل`,
          details: 'عروض المستقلين متزامنة بنجاح'
        };
      } else {
        testResults[4] = {
          name: 'مزامنة عروض المستقلين',
          status: 'error',
          message: 'فشل في جلب عروض المستقلين',
          details: `HTTP ${freelancerOffersResponse.status}`
        };
      }
      setResults([...testResults]);

      console.log('✅ انتهى اختبار المزامنة');

    } catch (error) {
      console.error('❌ خطأ في اختبار المزامنة:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running': return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'running': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOverallStatus = () => {
    if (results.length === 0) return 'idle';
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    
    if (errorCount === 0) return 'success';
    if (successCount > errorCount) return 'warning';
    return 'error';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">اختبار المزامنة الشامل</h2>
            <p className="text-gray-600">اختبار مزامنة البيانات بين جميع مكونات النظام</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              getOverallStatus() === 'success' ? 'bg-green-100 text-green-800' :
              getOverallStatus() === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              getOverallStatus() === 'error' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {getOverallStatus() === 'success' ? 'جميع الاختبارات نجحت' :
               getOverallStatus() === 'warning' ? 'بعض الاختبارات فشلت' :
               getOverallStatus() === 'error' ? 'الاختبارات فشلت' :
               'لم يتم تشغيل الاختبارات'}
            </div>
            <button
              onClick={runSyncTest}
              disabled={isRunning}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isRunning ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              {isRunning ? 'جاري الاختبار...' : 'تشغيل الاختبار'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">نتائج الاختبار</h3>
          
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
                  {result.status === 'running' ? 'جاري...' : 'مكتمل'}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* System URLs */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">روابط النظام للاختبار</h3>
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
  );
};

export default SystemTestPage;
