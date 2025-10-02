// إصلاح مشكلة إضافة المشاريع للشركاء Enterprise
const API_BASE = 'http://localhost:3001/api';

async function fixEnterpriseProjects() {
    console.log('🔧 إصلاح مشاريع الشركاء Enterprise');
    console.log('=' .repeat(50));
    
    try {
        // 1. فحص الشركاء Enterprise
        console.log('\n1️⃣ فحص الشركاء Enterprise...');
        const partnersResponse = await fetch(`${API_BASE}/partners?type=entreprise`);
        const partnersData = await partnersResponse.json();
        
        if (!partnersData.success || !partnersData.data) {
            console.log('❌ لا توجد شركاء Enterprise');
            return;
        }
        
        const enterprises = partnersData.data;
        console.log(`📊 عدد الشركاء Enterprise: ${enterprises.length}`);
        
        enterprises.forEach(partner => {
            console.log(`🏢 ${partner.partnerId}: ${partner.fullName} (${partner.isActive ? 'نشط' : 'غير نشط'})`);
        });
        
        // 2. اختبار إضافة مشروع لكل شريك
        console.log('\n2️⃣ اختبار إضافة المشاريع...');
        
        for (const partner of enterprises.slice(0, 2)) {
            console.log(`\n🏢 اختبار الشريك: ${partner.partnerId}`);
            
            const projectData = {
                title: `مشروع تجريبي - ${partner.fullName}`,
                description: 'مشروع لاختبار النظام',
                status: 'planning',
                startDate: '2024-01-15',
                endDate: '2024-06-15',
                budget: 75000,
                progress: 25
            };
            
            try {
                // استخدام Enterprise API
                const response = await fetch(`${API_BASE}/enterprise/${partner.partnerId}/projects`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(projectData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log(`  ✅ مشروع تم إنشاؤه: ${result.data?.projectId || 'ID غير محدد'}`);
                    
                    // التحقق من الحفظ
                    const verifyResponse = await fetch(`${API_BASE}/enterprise/${partner.partnerId}/projects`);
                    const verifyData = await verifyResponse.json();
                    
                    if (verifyData.success && verifyData.data) {
                        console.log(`  📊 عدد المشاريع: ${verifyData.data.length}`);
                    }
                } else {
                    const error = await response.json();
                    console.log(`  ❌ فشل: ${error.message}`);
                }
            } catch (error) {
                console.log(`  ❌ خطأ: ${error.message}`);
            }
        }
        
        // 3. عرض النتائج النهائية
        console.log('\n3️⃣ النتائج النهائية...');
        
        for (const partner of enterprises.slice(0, 2)) {
            try {
                const response = await fetch(`${API_BASE}/enterprise/${partner.partnerId}/projects`);
                const data = await response.json();
                
                if (data.success && data.data) {
                    console.log(`🏢 ${partner.partnerId}: ${data.data.length} مشروع`);
                    data.data.forEach((project, index) => {
                        console.log(`  ${index + 1}. ${project.title} (${project.status})`);
                    });
                } else {
                    console.log(`🏢 ${partner.partnerId}: لا توجد مشاريع`);
                }
            } catch (error) {
                console.log(`🏢 ${partner.partnerId}: خطأ - ${error.message}`);
            }
        }
        
        console.log('\n🎯 الحل:');
        console.log('1. تأكد من أن Espace Partenariat يستخدم Enterprise API');
        console.log('2. استخدم: /api/enterprise/{partnerId}/projects');
        console.log('3. تأكد من أن partnerId صحيح في الطلبات');
        
    } catch (error) {
        console.log(`❌ خطأ عام: ${error.message}`);
    }
}

// تشغيل الاختبار
if (typeof window === 'undefined') {
    import('node-fetch').then(({ default: fetch }) => {
        global.fetch = fetch;
        fixEnterpriseProjects();
    }).catch(() => {
        console.log('⚠️ استخدم هذا في المتصفح');
    });
} else {
    fixEnterpriseProjects();
}
