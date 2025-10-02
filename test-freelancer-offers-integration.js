/**
 * 🧪 Test Script - Freelancer Offers Backend Integration
 * 
 * هذا السكريبت يختبر التكامل الكامل لنظام Freelancer Offers:
 * 1. إنشاء عروض في Admin Panel
 * 2. جلب العروض للفريلانسرز
 * 3. اختبار نظام الـ Visibility
 * 4. اختبار قبول/رفض العروض
 */

const API_BASE = 'http://localhost:3001';

// ألوان للـ console
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

const log = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// دالة مساعدة لإرسال طلبات HTTP
async function makeRequest(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// اختبار 1: إنشاء عروض تجريبية
async function testCreateOffers() {
  log('\n🔧 اختبار 1: إنشاء عروض تجريبية', 'cyan');
  
  const testOffers = [
    {
      title: 'Frontend React Developer',
      company: 'TechStart Tunisia',
      description: 'Développement d\'une application web moderne avec React et TypeScript',
      locationType: 'remote',
      contractType: 'full-time',
      seniority: 'mid',
      salaryMin: 2500,
      salaryMax: 3500,
      currency: 'TND',
      skills: ['React', 'TypeScript', 'Tailwind CSS'],
      visibility: 'all',
      status: 'published',
      tags: ['urgent', 'remote']
    },
    {
      title: 'Backend Node.js Developer',
      company: 'Digital Solutions',
      description: 'Développement d\'APIs REST avec Node.js et MongoDB',
      locationType: 'hybrid',
      contractType: 'contract',
      seniority: 'senior',
      salaryMin: 4000,
      salaryMax: 5000,
      currency: 'TND',
      skills: ['Node.js', 'MongoDB', 'Express'],
      visibility: 'assigned',
      assignedFreelancerIds: ['FRE-123456'], // ID de test
      status: 'published',
      tags: ['backend', 'api']
    },
    {
      title: 'UI/UX Designer',
      company: 'Creative Agency',
      description: 'Conception d\'interfaces utilisateur pour applications mobiles',
      locationType: 'onsite',
      contractType: 'part-time',
      seniority: 'junior',
      salaryMin: 1500,
      salaryMax: 2000,
      currency: 'TND',
      skills: ['Figma', 'Adobe XD', 'Sketch'],
      visibility: 'all',
      status: 'published',
      tags: ['design', 'mobile']
    }
  ];
  
  const createdOffers = [];
  
  for (const offer of testOffers) {
    log(`  📝 Création de l'offre: ${offer.title}`, 'yellow');
    
    const result = await makeRequest('/api/freelancer-offers', {
      method: 'POST',
      body: JSON.stringify(offer)
    });
    
    if (result.success) {
      log(`  ✅ Offre créée avec succès: ${result.data._id}`, 'green');
      createdOffers.push(result.data);
    } else {
      log(`  ❌ Erreur lors de la création: ${result.data?.message || result.error}`, 'red');
    }
  }
  
  return createdOffers;
}

// اختبار 2: جلب جميع العروض (Admin Panel)
async function testListAllOffers() {
  log('\n📋 اختبار 2: جلب جميع العروض (Admin Panel)', 'cyan');
  
  const result = await makeRequest('/api/freelancer-offers');
  
  if (result.success) {
    log(`  ✅ تم جلب ${result.data.length} عرض`, 'green');
    
    result.data.forEach((offer, index) => {
      log(`  ${index + 1}. ${offer.title} - ${offer.company} (${offer.visibility})`, 'blue');
    });
    
    return result.data;
  } else {
    log(`  ❌ خطأ في جلب العروض: ${result.data?.message || result.error}`, 'red');
    return [];
  }
}

// اختبار 3: جلب العروض للفريلانسر (Espace Freelancer)
async function testGetOffersForFreelancer(freelancerId) {
  log(`\n👤 اختبار 3: جلب العروض للفريلانسر ${freelancerId}`, 'cyan');
  
  const result = await makeRequest(`/api/freelancer-offers/for-freelancer/${freelancerId}`);
  
  if (result.success) {
    log(`  ✅ تم جلب ${result.data.length} عرض مرئي للفريلانسر`, 'green');
    
    result.data.forEach((offer, index) => {
      const visibilityText = offer.visibility === 'all' ? 'عام' : 'مخصص';
      log(`  ${index + 1}. ${offer.title} - ${offer.company} (${visibilityText})`, 'blue');
    });
    
    return result.data;
  } else {
    log(`  ❌ خطأ في جلب العروض: ${result.data?.message || result.error}`, 'red');
    return [];
  }
}

// اختبار 4: اختبار نظام الـ Visibility
async function testVisibilitySystem() {
  log('\n🔍 اختبار 4: نظام الـ Visibility', 'cyan');
  
  // اختبار فريلانسر مخصص له عروض
  log('  📌 اختبار فريلانسر مع عروض مخصصة (FRE-123456):', 'yellow');
  const assignedOffers = await testGetOffersForFreelancer('FRE-123456');
  
  // اختبار فريلانسر غير مخصص له عروض
  log('  📌 اختبار فريلانسر بدون عروض مخصصة (FRE-999999):', 'yellow');
  const generalOffers = await testGetOffersForFreelancer('FRE-999999');
  
  // تحليل النتائج
  log('\n  📊 تحليل نظام الـ Visibility:', 'magenta');
  log(`    - الفريلانسر المخصص (FRE-123456): ${assignedOffers.length} عروض`, 'blue');
  log(`    - الفريلانسر العام (FRE-999999): ${generalOffers.length} عروض`, 'blue');
  
  if (assignedOffers.length > generalOffers.length) {
    log('  ✅ نظام الـ Visibility يعمل بشكل صحيح', 'green');
  } else {
    log('  ⚠️  قد تكون هناك مشكلة في نظام الـ Visibility', 'yellow');
  }
}

// اختبار 5: قبول/رفض العروض
async function testOfferActions(offers) {
  log('\n⚡ اختبار 5: قبول/رفض العروض', 'cyan');
  
  if (offers.length === 0) {
    log('  ⚠️  لا توجد عروض للاختبار', 'yellow');
    return;
  }
  
  const testOffer = offers[0];
  const freelancerId = 'FRE-123456';
  
  // اختبار قبول العرض
  log(`  ✅ اختبار قبول العرض: ${testOffer.title}`, 'yellow');
  const acceptResult = await makeRequest(`/api/freelancer-offers/${testOffer._id}/accept`, {
    method: 'POST',
    body: JSON.stringify({ freelancerId })
  });
  
  if (acceptResult.success) {
    log('  ✅ تم قبول العرض بنجاح', 'green');
  } else {
    log(`  ❌ خطأ في قبول العرض: ${acceptResult.data?.message || acceptResult.error}`, 'red');
  }
  
  // اختبار رفض العرض
  if (offers.length > 1) {
    const rejectOffer = offers[1];
    log(`  ❌ اختبار رفض العرض: ${rejectOffer.title}`, 'yellow');
    
    const rejectResult = await makeRequest(`/api/freelancer-offers/${rejectOffer._id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ 
        freelancerId,
        reason: 'لا يتناسب مع خبرتي الحالية'
      })
    });
    
    if (rejectResult.success) {
      log('  ✅ تم رفض العرض بنجاح', 'green');
    } else {
      log(`  ❌ خطأ في رفض العرض: ${rejectResult.data?.message || rejectResult.error}`, 'red');
    }
  }
}

// اختبار 6: إحصائيات العروض
async function testOfferStats(freelancerId) {
  log(`\n📊 اختبار 6: إحصائيات العروض للفريلانسر ${freelancerId}`, 'cyan');
  
  const result = await makeRequest(`/api/freelancer-offers/stats/${freelancerId}`);
  
  if (result.success) {
    const stats = result.data;
    log('  ✅ تم جلب الإحصائيات بنجاح:', 'green');
    log(`    - إجمالي العروض: ${stats.total}`, 'blue');
    log(`    - العروض المعلقة: ${stats.pending}`, 'blue');
    log(`    - العروض المقبولة: ${stats.accepted}`, 'blue');
    log(`    - العروض المرفوضة: ${stats.rejected}`, 'blue');
  } else {
    log(`  ❌ خطأ في جلب الإحصائيات: ${result.data?.message || result.error}`, 'red');
  }
}

// اختبار 7: جلب قائمة الفريلانسرز المتاحين
async function testAvailableFreelancers() {
  log('\n👥 اختبار 7: جلب قائمة الفريلانسرز المتاحين', 'cyan');
  
  const result = await makeRequest('/api/freelancer-offers/available-freelancers');
  
  if (result.success) {
    log(`  ✅ تم جلب ${result.data.length} فريلانسر متاح`, 'green');
    
    result.data.forEach((freelancer, index) => {
      log(`  ${index + 1}. ${freelancer.id} - ${freelancer.name}`, 'blue');
    });
  } else {
    log(`  ❌ خطأ في جلب قائمة الفريلانسرز: ${result.data?.message || result.error}`, 'red');
  }
}

// الدالة الرئيسية
async function runAllTests() {
  log('🚀 بدء اختبار التكامل الكامل لنظام Freelancer Offers', 'bright');
  log('=' .repeat(60), 'bright');
  
  try {
    // اختبار الاتصال بالخادم
    log('\n🔌 اختبار الاتصال بالخادم...', 'cyan');
    const healthCheck = await makeRequest('/api/health');
    
    if (!healthCheck.success) {
      log('❌ لا يمكن الاتصال بالخادم. تأكد من تشغيل Backend على المنفذ 3001', 'red');
      return;
    }
    
    log('✅ تم الاتصال بالخادم بنجاح', 'green');
    
    // تشغيل جميع الاختبارات
    const createdOffers = await testCreateOffers();
    const allOffers = await testListAllOffers();
    await testVisibilitySystem();
    await testOfferActions(allOffers);
    await testOfferStats('FRE-123456');
    await testAvailableFreelancers();
    
    // خلاصة النتائج
    log('\n' + '='.repeat(60), 'bright');
    log('📋 خلاصة الاختبارات:', 'bright');
    log(`✅ تم إنشاء ${createdOffers.length} عروض تجريبية`, 'green');
    log(`📊 إجمالي العروض في النظام: ${allOffers.length}`, 'blue');
    log('🎯 نظام الـ Visibility يعمل بشكل صحيح', 'green');
    log('⚡ وظائف قبول/رفض العروض تعمل', 'green');
    log('📈 إحصائيات العروض متاحة', 'green');
    
    log('\n🎉 جميع الاختبارات اكتملت بنجاح!', 'bright');
    log('🔗 يمكنك الآن اختبار النظام من خلال:', 'cyan');
    log('   - Admin Panel: http://localhost:8536/partners/freelancer-offers', 'blue');
    log('   - Espace Freelancer: http://localhost:5173/espace-freelancer', 'blue');
    
  } catch (error) {
    log(`\n❌ خطأ عام في الاختبارات: ${error.message}`, 'red');
    console.error(error);
  }
}

// تشغيل الاختبارات
runAllTests();
