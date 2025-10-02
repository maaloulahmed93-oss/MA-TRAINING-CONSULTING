// Fix project URL via API instead of direct MongoDB
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';
const PARTICIPANT_ID = 'PART-177037';
const TEST_URL = 'https://tv.animerco.org/';

async function fixProjectViaAPI() {
  try {
    console.log('🔄 Fixing project via API...');
    
    // 1. Test if backend is running
    console.log('1️⃣ اختبار اتصال Backend...');
    try {
      const healthResponse = await fetch(`${API_BASE}/participants`);
      if (!healthResponse.ok) {
        throw new Error(`Backend غير متاح - Status: ${healthResponse.status}`);
      }
      console.log('✅ Backend متاح ويعمل');
    } catch (error) {
      console.log('❌ Backend غير متاح:', error.message);
      console.log('💡 تأكد من تشغيل Backend: npm run dev');
      return;
    }

    // 2. Get current participant data
    console.log('\n2️⃣ جلب بيانات المشارك...');
    const getResponse = await fetch(`${API_BASE}/participants/${PARTICIPANT_ID}`);
    
    if (!getResponse.ok) {
      throw new Error(`خطأ في جلب البيانات: ${getResponse.status}`);
    }
    
    const participantData = await getResponse.json();
    
    if (!participantData.success) {
      throw new Error('المشارك غير موجود');
    }
    
    console.log(`✅ المشارك موجود: ${participantData.data.fullName}`);
    console.log(`📊 عدد المشاريع: ${participantData.data.projects.length}`);
    
    // 3. Check current projects
    console.log('\n3️⃣ فحص المشاريع الحالية...');
    participantData.data.projects.forEach((project, index) => {
      console.log(`  ${index + 1}. ${project.title}`);
      console.log(`     projectUrl: "${project.projectUrl || 'فارغ'}"`);
      console.log(`     الحالة: ${project.status}`);
    });

    // 4. Find target project (cima or first project)
    let targetProject = participantData.data.projects.find(p => 
      p.title.toLowerCase().includes('cima')
    );
    
    if (!targetProject) {
      targetProject = participantData.data.projects[0];
      console.log(`⚠️ لم يتم العثور على مشروع "cima"، سيتم تحديث: ${targetProject.title}`);
    } else {
      console.log(`🎯 تم العثور على المشروع المستهدف: ${targetProject.title}`);
    }

    // 5. Update project with URL
    console.log(`\n4️⃣ تحديث المشروع "${targetProject.title}"`);
    console.log(`  من: "${targetProject.projectUrl || 'فارغ'}"`);
    console.log(`  إلى: "${TEST_URL}"`);
    
    const updatedProjects = participantData.data.projects.map(project => {
      if (project.title === targetProject.title) {
        console.log(`🔄 تحديث مشروع: ${project.title}`);
        return { ...project, projectUrl: TEST_URL };
      }
      return project;
    });

    // 6. Send update request
    console.log('\n5️⃣ إرسال طلب التحديث...');
    const updatePayload = {
      ...participantData.data,
      projects: updatedProjects
    };

    console.log(`📤 إرسال البيانات إلى: PUT ${API_BASE}/participants/${PARTICIPANT_ID}`);
    
    const updateResponse = await fetch(`${API_BASE}/participants/${PARTICIPANT_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });

    if (!updateResponse.ok) {
      throw new Error(`خطأ في التحديث: ${updateResponse.status}`);
    }

    const updateResult = await updateResponse.json();
    
    if (updateResult.success) {
      console.log('✅ تم التحديث بنجاح!');
      
      // 7. Verify the update
      console.log('\n6️⃣ التحقق من التحديث...');
      const verifyResponse = await fetch(`${API_BASE}/participants/${PARTICIPANT_ID}/projects`);
      
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        
        if (verifyData.success && verifyData.data.length > 0) {
          const updatedProject = verifyData.data.find(p => p.title === targetProject.title);
          
          if (updatedProject) {
            console.log(`📋 المشروع بعد التحديث:`);
            console.log(`  العنوان: ${updatedProject.title}`);
            console.log(`  projectUrl: "${updatedProject.projectUrl || 'فارغ'}"`);
            console.log(`  التحديث نجح: ${updatedProject.projectUrl === TEST_URL ? '✅ نعم' : '❌ لا'}`);
            
            if (updatedProject.projectUrl === TEST_URL) {
              console.log('\n🎉 الإصلاح اكتمل بنجاح!');
              console.log('📋 الخطوات التالية:');
              console.log('  1. حدث صفحة Frontend (F5)');
              console.log('  2. اختبر espace participant');
              console.log('  3. ابحث عن قسم "Lien du projet" في بطاقة المشروع');
              console.log('  4. تأكد من ظهور الرابط الأزرق');
              console.log(`  5. اضغط على الرابط: ${TEST_URL}`);
              
              console.log('\n📝 Console Logs المتوقعة في Frontend:');
              console.log(`  🔍 Analyzing project data: {projectUrl: "${TEST_URL}", hasProjectUrl: true}`);
              console.log(`  ✅ Transformed project: {projectUrl: "${TEST_URL}", hasUrl: true}`);
              console.log(`  🔗 Ouverture du lien projet: ${TEST_URL}`);
            }
          }
        }
      }
      
    } else {
      throw new Error(updateResult.message || 'فشل في التحديث');
    }

  } catch (error) {
    console.error('❌ خطأ في الإصلاح:', error.message);
    console.log('\n🛠️ الحلول البديلة:');
    console.log('  • تأكد من تشغيل Backend على localhost:3001');
    console.log('  • أعد تشغيل Backend: npm run dev');
    console.log('  • تحقق من Backend console logs');
    console.log('  • جرب مرة أخرى بعد دقيقة');
  }
}

// تشغيل الإصلاح
fixProjectViaAPI();
