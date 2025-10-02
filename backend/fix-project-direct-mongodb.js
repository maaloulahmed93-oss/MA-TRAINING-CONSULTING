import mongoose from 'mongoose';
import ParticipantProject from './models/ParticipantProject.js';

// MongoDB connection - استخدام نفس الـ URI من server.js
const MONGODB_URI = 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db?retryWrites=true&w=majority&appName=matc';

async function fixProjectDirectMongoDB() {
  try {
    console.log('🔄 الاتصال بـ MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ متصل بـ MongoDB');

    // البحث عن جميع مشاريع المشارك PART-177037
    const participantId = 'PART-177037';
    const projects = await ParticipantProject.find({ 
      participantId: participantId,
      isActive: true 
    }).sort({ createdAt: -1 });

    console.log(`📊 وُجد ${projects.length} مشاريع للمشارك ${participantId}`);

    if (projects.length === 0) {
      console.log('❌ لا توجد مشاريع للمشارك');
      return;
    }

    // عرض المشاريع الموجودة
    console.log('\n📋 المشاريع الموجودة:');
    projects.forEach((project, index) => {
      console.log(`  ${index + 1}. ${project.title}`);
      console.log(`     ID: ${project._id}`);
      console.log(`     projectUrl: "${project.projectUrl || 'فارغ'}"`);
      console.log(`     الحالة: ${project.status}`);
      console.log(`     تاريخ الإنشاء: ${project.createdAt}`);
      console.log('');
    });

    // البحث عن المشروع "cima" أو أول مشروع
    let targetProject = projects.find(p => p.title.toLowerCase().includes('cima'));
    if (!targetProject) {
      targetProject = projects[0]; // أول مشروع
      console.log(`⚠️ لم يتم العثور على مشروع "cima"، سيتم تحديث المشروع: ${targetProject.title}`);
    } else {
      console.log(`🎯 تم العثور على المشروع المستهدف: ${targetProject.title}`);
    }

    // تحديث projectUrl
    const newUrl = 'https://tv.animerco.org/';
    const oldUrl = targetProject.projectUrl;
    
    console.log(`\n🔄 تحديث المشروع "${targetProject.title}"`);
    console.log(`  من: "${oldUrl || 'فارغ'}"`);
    console.log(`  إلى: "${newUrl}"`);

    targetProject.projectUrl = newUrl;
    targetProject.updatedAt = new Date();
    
    await targetProject.save();
    
    console.log('✅ تم تحديث المشروع بنجاح!');

    // التحقق من التحديث
    const updatedProject = await ParticipantProject.findById(targetProject._id);
    console.log('\n🔍 التحقق من التحديث:');
    console.log(`  العنوان: ${updatedProject.title}`);
    console.log(`  projectUrl: "${updatedProject.projectUrl}"`);
    console.log(`  تاريخ التحديث: ${updatedProject.updatedAt}`);
    console.log(`  التحديث نجح: ${updatedProject.projectUrl === newUrl ? '✅ نعم' : '❌ لا'}`);

    // إحصائيات نهائية
    const allProjectsAfterUpdate = await ParticipantProject.find({ 
      participantId: participantId,
      isActive: true 
    });
    
    const projectsWithUrl = allProjectsAfterUpdate.filter(p => p.projectUrl && p.projectUrl.trim());
    
    console.log('\n📊 إحصائيات نهائية:');
    console.log(`  إجمالي المشاريع: ${allProjectsAfterUpdate.length}`);
    console.log(`  مشاريع بها روابط: ${projectsWithUrl.length}`);
    console.log(`  مشاريع بدون روابط: ${allProjectsAfterUpdate.length - projectsWithUrl.length}`);

    console.log('\n🎉 الإصلاح اكتمل بنجاح!');
    console.log('📋 الخطوات التالية:');
    console.log('  1. حدث صفحة Frontend (F5)');
    console.log('  2. اختبر espace participant');
    console.log('  3. ابحث عن قسم "Lien du projet" في بطاقة المشروع');
    console.log('  4. تأكد من ظهور الرابط: https://tv.animerco.org/');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 انقطع الاتصال من MongoDB');
  }
}

fixProjectDirectMongoDB();
