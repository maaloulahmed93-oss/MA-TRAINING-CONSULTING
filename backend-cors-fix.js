// 🔧 إصلاح إعدادات CORS في Backend - MATC
// أضف هذا الكود في ملف server.js في Backend

import cors from 'cors';

// إعدادات CORS المحسنة للإنتاج
const corsOptions = {
  // النطاقات المسموحة
  origin: [
    // Production URLs
    'https://matrainingconsulting.vercel.app',
    'https://admine-lake.vercel.app',
    'https://matc-backend.onrender.com',
    
    // Alternative Vercel URLs (في حالة تغيير الأسماء)
    'https://ma-training-consulting.vercel.app',
    'https://matc-admin.vercel.app',
    
    // Git-based deployments
    'https://admine-git-main-maalouls-projects.vercel.app',
    'https://matrainingconsulting-git-main-maalouls-projects.vercel.app',
    
    // Development URLs (فقط في بيئة التطوير)
    ...(process.env.NODE_ENV !== 'production' ? [
      'http://localhost:5173',
      'http://localhost:8536',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8536'
    ] : [])
  ],
  
  // السماح بـ credentials (cookies, authorization headers)
  credentials: true,
  
  // HTTP Methods المسموحة
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  
  // Headers المسموحة
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  
  // Headers المكشوفة للـ client
  exposedHeaders: [
    'Content-Length',
    'X-Foo',
    'X-Bar'
  ],
  
  // مدة cache للـ preflight requests (بالثواني)
  maxAge: 86400, // 24 ساعة
  
  // السماح بـ preflight requests
  preflightContinue: false,
  
  // Status code للـ successful OPTIONS requests
  optionsSuccessStatus: 200
};

// تطبيق إعدادات CORS
app.use(cors(corsOptions));

// إضافة headers إضافية للأمان
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // التحقق من أن Origin موجود في القائمة المسموحة
  if (corsOptions.origin.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  // Headers إضافية للأمان
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // معالجة طلبات OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', corsOptions.methods.join(','));
    res.header('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(','));
    res.header('Access-Control-Max-Age', corsOptions.maxAge);
    return res.status(200).json({
      success: true,
      message: 'CORS preflight successful',
      allowedOrigins: corsOptions.origin.length,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
});

// معالجة خاصة للـ Vercel deployments
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // السماح لجميع deployments من Vercel تلقائياً
  if (origin && (
    origin.includes('vercel.app') && (
      origin.includes('matrainingconsulting') ||
      origin.includes('admine') ||
      origin.includes('matc') ||
      origin.includes('maalouls-projects')
    )
  )) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  
  next();
});

// Debug middleware لتسجيل طلبات CORS (فقط في التطوير)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS' || req.headers.origin) {
      console.log('🔍 CORS Request:', {
        method: req.method,
        origin: req.headers.origin,
        path: req.path,
        timestamp: new Date().toISOString()
      });
    }
    next();
  });
}

// Route للتحقق من إعدادات CORS
app.get('/api/cors-test', (req, res) => {
  res.json({
    success: true,
    message: 'CORS test successful',
    requestOrigin: req.headers.origin,
    allowedOrigins: corsOptions.origin,
    corsEnabled: true,
    timestamp: new Date().toISOString()
  });
});

export default corsOptions;
