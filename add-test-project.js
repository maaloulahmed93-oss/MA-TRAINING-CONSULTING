// إضافة مشروع تجريبي للشريك Enterprise
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function addTestProject() {
    console.log('🚀 إضافة مشروع تجريبي للشريك Enterprise');
    console.log('=' .repeat(50));
    
    try {
        // 1. البحث عن شريك Enterprise
        console.log('\n1️⃣ البحث عن شريك Enterprise...');
        const partnersResponse = await fetch(`${API_BASE}/partners?type=entreprise`);
        const partnersData = await partnersResponse.json();
        
        if (!partnersData.success || !partnersData.data || partnersData.data.length === 0) {
            console.log('❌ لا توجد شركاء Enterprise');
            return;
        }
        
        const partner = partnersData.data[0]; // أول شريك
        console.log(`✅ تم العثور على الشريك: ${partner.partnerId} - ${partner.fullName}`);
        
        // 2. إضافة مشروع تجريبي
        console.log('\n2️⃣ إضافة مشروع تجريبي...');
        
        const projectData = {
            title: 'مشروع تطوير موقع إلكتروني',
            description: 'تطوير موقع إلكتروني متكامل للشركة مع لوحة تحكم',
            status: 'planning',
            startDate: '2024-01-15',
            endDate: '2024-07-15',
            budget: 85000,
            progress: 15,
            objectives: [
                'تصميم واجهة المستخدم',
                'تطوير لوحة التحكم',
                'ربط قاعدة البيانات',
                'اختبار النظام'
            ],
            deliverables: [
                'موقع إلكتروني متجاوب',
                'لوحة تحكم إدارية',
                'وثائق فنية',
                'دليل المستخدم'
            ]
        };
        
        console.log(`📝 إنشاء مشروع: "${projectData.title}"`);
        console.log(`🏢 للشريك: ${partner.partnerId}`);
        console.log(`💰 الميزانية: ${projectData.budget} دينار`);
        
        // محاولة إضافة المشروع باستخدام Enterprise API
        const createResponse = await fetch(`${API_BASE}/enterprise/${partner.partnerId}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(projectData)
        });
        
        if (createResponse.ok) {
            const result = await createResponse.json();
            console.log(`✅ مشروع تم إنشاؤه بنجاح!`);
            console.log(`📊 معرف المشروع: ${result.data?.projectId || result.data?._id || 'غير محدد'}`);
            
            // 3. التحقق من الحفظ في قاعدة البيانات
            console.log('\n3️⃣ التحقق من الحفظ في قاعدة البيانات...');
            
            const verifyResponse = await fetch(`${API_BASE}/enterprise/${partner.partnerId}/projects`);
            const verifyData = await verifyResponse.json();
            
            if (verifyData.success && verifyData.data) {
                console.log(`📊 عدد المشاريع المحفوظة: ${verifyData.data.length}`);
                
                // البحث عن المشروع المُضاف
                const addedProject = verifyData.data.find(p => p.title === projectData.title);
                
                if (addedProject) {
                    console.log(`✅ المشروع محفوظ بنجاح في قاعدة البيانات!`);
                    console.log(`📋 تفاصيل المشروع المحفوظ:`);
                    console.log(`   - العنوان: ${addedProject.title}`);
                    console.log(`   - الحالة: ${addedProject.status}`);
                    console.log(`   - partnerId: ${addedProject.partnerId}`);
                    console.log(`   - تاريخ الإنشاء: ${new Date(addedProject.createdAt).toLocaleString('ar')}`);
                    console.log(`   - الميزانية: ${addedProject.budget || 'غير محدد'}`);
                    console.log(`   - التقدم: ${addedProject.progress || 0}%`);
                } else {
                    console.log(`❌ المشروع غير موجود في قاعدة البيانات!`);
                }
                
                // عرض جميع المشاريع
                console.log(`\n📋 جميع مشاريع الشريك ${partner.partnerId}:`);
                verifyData.data.forEach((project, index) => {
                    console.log(`   ${index + 1}. ${project.title} (${project.status}) - ${new Date(project.createdAt).toLocaleDateString('ar')}`);
                });
                
            } else {
                console.log(`❌ خطأ في استرجاع المشاريع: ${verifyData.message}`);
            }
            
        } else {
            const error = await createResponse.json();
            console.log(`❌ فشل في إنشاء المشروع: ${error.message}`);
            
            // محاولة بديلة
            console.log('\n🔄 محاولة بديلة باستخدام API عادي...');
            
            const fallbackData = {
                ...projectData,
                partnerId: partner.partnerId
            };
            
            const fallbackResponse = await fetch(`${API_BASE}/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(fallbackData)
            });
            
            if (fallbackResponse.ok) {
                console.log(`✅ المشروع تم إنشاؤه بالطريقة البديلة`);
            } else {
                const fallbackError = await fallbackResponse.json();
                console.log(`❌ فشل في الطريقة البديلة: ${fallbackError.message}`);
            }
        }
        
        // 4. اختبار إضافة مشروع ثاني
        console.log('\n4️⃣ إضافة مشروع ثاني للتأكد...');
        
        const project2Data = {
            title: 'مشروع تطبيق موبايل',
            description: 'تطوير تطبيق موبايل للأندرويد والآيفون',
            status: 'in_progress',
            startDate: '2024-02-01',
            endDate: '2024-08-01',
            budget: 120000,
            progress: 35
        };
        
        const create2Response = await fetch(`${API_BASE}/enterprise/${partner.partnerId}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(project2Data)
        });
        
        if (create2Response.ok) {
            console.log(`✅ المشروع الثاني تم إنشاؤه بنجاح!`);
            
            // التحقق النهائي
            const finalCheckResponse = await fetch(`${API_BASE}/enterprise/${partner.partnerId}/projects`);
            const finalCheckData = await finalCheckResponse.json();
            
            if (finalCheckData.success && finalCheckData.data) {
                console.log(`\n🎉 النتيجة النهائية:`);
                console.log(`📊 إجمالي المشاريع: ${finalCheckData.data.length}`);
                console.log(`✅ النظام يعمل بشكل صحيح!`);
            }
        } else {
            console.log(`⚠️ فشل في إنشاء المشروع الثاني`);
        }
        
        console.log('\n🎯 الخلاصة:');
        console.log('- إذا ظهرت المشاريع هنا، فالـ Backend يعمل بشكل صحيح');
        console.log('- المشكلة في Frontend (Espace Partenariat)');
        console.log('- يجب تحديث Espace Partenariat لاستخدام Enterprise API');
        
    } catch (error) {
        console.log(`❌ خطأ عام: ${error.message}`);
    }
}

// تشغيل الاختبار
addTestProject().catch(console.error);
