// إصلاح مشكلة إضافة المشاريع للشركاء
// Fix project creation for enterprise partners

const API_BASE = 'http://localhost:3001/api';

async function fixProjectCreation() {
    console.log('🔧 إصلاح مشكلة إضافة المشاريع للشركاء');
    console.log('=' .repeat(50));
    
    try {
        // 1. التحقق من الشركاء الموجودين
        console.log('\n1️⃣ البحث عن الشركاء...');
        const partnersResponse = await fetch(`${API_BASE}/partners?type=entreprise`);
        const partnersData = await partnersResponse.json();
        
        if (!partnersData.success || !partnersData.data || partnersData.data.length === 0) {
            console.log('⚠️ لا توجد شركاء. إنشاء شريك تجريبي...');
            
            // إنشاء شريك تجريبي
            const testPartner = {
                fullName: 'شركة تجريبية للمشاريع',
                email: 'test-projects@company.com',
                type: 'entreprise',
                contactPerson: 'مدير المشاريع',
                isActive: true
            };
            
            const createResponse = await fetch(`${API_BASE}/partners`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testPartner)
            });
            
            if (createResponse.ok) {
                const created = await createResponse.json();
                console.log(`✅ شريك تجريبي تم إنشاؤه: ${created.data.partnerId}`);
                partnersData.data = [created.data];
            } else {
                throw new Error('فشل في إنشاء شريك تجريبي');
            }
        }
        
        console.log(`📊 عدد الشركاء: ${partnersData.data.length}`);
        
        // 2. اختبار إضافة مشروع لكل شريك
        console.log('\n2️⃣ اختبار إضافة المشاريع...');
        
        for (const partner of partnersData.data.slice(0, 2)) { // أول شريكين فقط
            console.log(`\n🏢 اختبار الشريك: ${partner.partnerId} (${partner.fullName})`);
            
            // بيانات المشروع التجريبي
            const projectData = {
                title: `مشروع تجريبي - ${partner.fullName}`,
                description: 'مشروع لاختبار النظام',
                status: 'planning',
                startDate: '2024-01-15',
                endDate: '2024-06-15',
                budget: 50000,
                progress: 0,
                objectives: ['تطوير النظام', 'اختبار الوظائف'],
                deliverables: ['تطبيق ويب', 'وثائق فنية']
            };
            
            try {
                // محاولة إضافة المشروع باستخدام Enterprise API
                console.log('  📝 إضافة مشروع باستخدام Enterprise API...');
                const createResponse = await fetch(`${API_BASE}/enterprise/${partner.partnerId}/projects`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(projectData)
                });
                
                if (createResponse.ok) {
                    const result = await createResponse.json();
                    console.log(`  ✅ مشروع تم إنشاؤه: ${result.data?.projectId || 'ID غير محدد'}`);
                    
                    // التحقق من أن المشروع مُسجل بشكل صحيح
                    const verifyResponse = await fetch(`${API_BASE}/enterprise/${partner.partnerId}/projects`);
                    const verifyData = await verifyResponse.json();
                    
                    if (verifyData.success && verifyData.data) {
                        const projectCount = verifyData.data.length;
                        console.log(`  📊 عدد المشاريع للشريك: ${projectCount}`);
                        
                        // التحقق من أن المشروع يحتوي على partnerId صحيح
                        const lastProject = verifyData.data[verifyData.data.length - 1];
                        if (lastProject && lastProject.partnerId === partner.partnerId) {
                            console.log(`  ✅ المشروع مُسجل بشكل صحيح مع partnerId: ${lastProject.partnerId}`);
                        } else {
                            console.log(`  ❌ مشكلة في partnerId: متوقع ${partner.partnerId}, موجود ${lastProject?.partnerId}`);
                        }
                    }
                } else {
                    const error = await createResponse.json();
                    console.log(`  ❌ فشل إنشاء المشروع: ${error.message}`);
                    
                    // محاولة بديلة باستخدام API عادي
                    console.log('  🔄 محاولة بديلة...');
                    const fallbackData = { ...projectData, partnerId: partner.partnerId };
                    
                    const fallbackResponse = await fetch(`${API_BASE}/projects`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(fallbackData)
                    });
                    
                    if (fallbackResponse.ok) {
                        console.log('  ✅ المشروع تم إنشاؤه بالطريقة البديلة');
                    } else {
                        console.log('  ❌ فشل في الطريقة البديلة أيضاً');
                    }
                }
                
            } catch (error) {
                console.log(`  ❌ خطأ في إضافة المشروع: ${error.message}`);
            }
        }
        
        // 3. عرض ملخص النتائج
        console.log('\n3️⃣ ملخص النتائج...');
        
        for (const partner of partnersData.data.slice(0, 2)) {
            try {
                const projectsResponse = await fetch(`${API_BASE}/enterprise/${partner.partnerId}/projects`);
                const projectsData = await projectsResponse.json();
                
                if (projectsData.success) {
                    const count = projectsData.data ? projectsData.data.length : 0;
                    console.log(`🏢 ${partner.partnerId}: ${count} مشروع`);
                    
                    if (projectsData.data && projectsData.data.length > 0) {
                        projectsData.data.forEach((project, index) => {
                            console.log(`  ${index + 1}. ${project.title} (${project.status})`);
                        });
                    }
                } else {
                    console.log(`🏢 ${partner.partnerId}: خطأ في استرجاع المشاريع`);
                }
            } catch (error) {
                console.log(`🏢 ${partner.partnerId}: خطأ - ${error.message}`);
            }
        }
        
        // 4. تعليمات الإصلاح
        console.log('\n4️⃣ تعليمات الإصلاح:');
        console.log('=' .repeat(50));
        
        console.log('📋 للإصلاح النهائي:');
        console.log('1. تأكد من أن Admin Panel يستخدم Enterprise API');
        console.log('2. عند إضافة مشروع، استخدم: /api/enterprise/{partnerId}/projects');
        console.log('3. تأكد من أن partnerId يُرسل في البيانات');
        console.log('4. تحقق من أن middleware partnerAuth يعمل بشكل صحيح');
        
        console.log('\n🔧 كود الإصلاح للـ Admin Panel:');
        console.log(`
// في مكون إضافة المشروع
const createProject = async (projectData) => {
  const partnerId = getCurrentPartnerId(); // احصل على ID الشريك الحالي
  
  const response = await fetch(\`/api/enterprise/\${partnerId}/projects\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(projectData)
  });
  
  if (response.ok) {
    const result = await response.json();
    console.log('مشروع تم إنشاؤه:', result.data);
    // تحديث القائمة
    refreshProjectsList();
  }
};
        `);
        
    } catch (error) {
        console.log(`❌ خطأ عام: ${error.message}`);
    }
}

// تشغيل الاختبار
if (typeof window === 'undefined') {
    // Node.js environment
    import('node-fetch').then(({ default: fetch }) => {
        global.fetch = fetch;
        fixProjectCreation();
    }).catch(() => {
        console.log('⚠️ node-fetch غير متوفر. استخدم هذا في المتصفح.');
    });
} else {
    // Browser environment
    fixProjectCreation();
}
