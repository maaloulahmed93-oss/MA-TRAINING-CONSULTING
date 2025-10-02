// حذف شامل لجميع البيانات التجريبية من النظام
import mongoose from 'mongoose';
import Partner from './backend/models/Partner.js';

const MONGODB_URI = 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db';

async function completeCleanup() {
  try {
    console.log('🔍 الاتصال بقاعدة البيانات...');
    await mongoose.connect(MONGODB_URI);
    
    console.log('\n📊 فحص شامل للبيانات التجريبية...');
    
    // قائمة جميع البيانات التجريبية المعروفة
    const mockEmails = [
      'ahmed.benali@email.com',
      'fatima.elmansouri@email.com', 
      'youssef.trabelsi@example.com',
      'fatima.gharbi@email.com',
      'mohamed.triki@email.com',
      'amina.sassi@email.com',
      'youssef.khelifi@email.com',
      'leila.bouazizi@email.com',
      'ameur@gmail.com',
      'ismail@gmail.com'
    ];
    
    const mockNames = [
      'Ahmed Benali',
      'Fatima El Mansouri',
      'Youssef Trabelsi', 
      'Fatima Gharbi',
      'Mohamed Triki',
      'Amina Sassi',
      'Youssef Khelifi',
      'Leila Bouazizi',
      'aziz ben ameur',
      'ismail'
    ];
    
    const mockPartnerIds = [
      'PART-2024-001',
      'PART-2024-002', 
      'PART-2024-003',
      'PART-2024-004',
      'PART-2024-005',
      'PART-2024-006',
      'PART-814809',
      'PART-834809',
      'FRE-340255'
    ];
    
    // البحث عن جميع البيانات التجريبية
    console.log('🔍 البحث عن البيانات التجريبية...');
    const mockPartners = await Partner.find({
      $or: [
        { email: { $in: mockEmails } },
        { fullName: { $in: mockNames } },
        { partnerId: { $in: mockPartnerIds } },
        { email: { $regex: /@example\.com$/i } },
        { email: { $regex: /@email\.com$/i } },
        { fullName: { $regex: /test/i } },
        { fullName: { $regex: /demo/i } },
        { fullName: { $regex: /sample/i } },
        { type: 'participant' } // حذف جميع الـ participants
      ]
    });
    
    if (mockPartners.length > 0) {
      console.log(`❗ تم العثور على ${mockPartners.length} بيانات تجريبية:`);
      
      mockPartners.forEach((partner, index) => {
        console.log(`  ${index + 1}. ${partner.partnerId} - ${partner.fullName}`);
        console.log(`     📧 ${partner.email} | النوع: ${partner.type}`);
        console.log(`     📅 تاريخ الإنشاء: ${partner.createdAt.toLocaleDateString('ar')}`);
        console.log('');
      });
      
      console.log('🗑️ بدء حذف جميع البيانات التجريبية...');
      console.log('⏳ انتظار 3 ثوانٍ...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // حذف جميع البيانات التجريبية
      const deleteResult = await Partner.deleteMany({
        $or: [
          { email: { $in: mockEmails } },
          { fullName: { $in: mockNames } },
          { partnerId: { $in: mockPartnerIds } },
          { email: { $regex: /@example\.com$/i } },
          { email: { $regex: /@email\.com$/i } },
          { fullName: { $regex: /test/i } },
          { fullName: { $regex: /demo/i } },
          { fullName: { $regex: /sample/i } },
          { type: 'participant' }
        ]
      });
      
      console.log(`✅ تم حذف ${deleteResult.deletedCount} بيانات تجريبية`);
    } else {
      console.log('✅ لا توجد بيانات تجريبية للحذف');
    }
    
    // عرض الإحصائيات النهائية
    console.log('\n📊 الإحصائيات النهائية:');
    const finalStats = await Partner.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          partners: { $push: { partnerId: '$partnerId', fullName: '$fullName' } }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    if (finalStats.length > 0) {
      finalStats.forEach(stat => {
        console.log(`\n${stat._id.toUpperCase()}: ${stat.count} شريك`);
        stat.partners.forEach(p => {
          console.log(`  - ${p.partnerId}: ${p.fullName}`);
        });
      });
    } else {
      console.log('📋 لا يوجد شركاء في قاعدة البيانات');
    }
    
    const totalPartners = await Partner.countDocuments();
    console.log(`\n✅ إجمالي الشركاء المتبقين: ${totalPartners}`);
    
    // التحقق من عدم وجود نوع participant
    const participantCount = await Partner.countDocuments({ type: 'participant' });
    if (participantCount === 0) {
      console.log('🎉 تم حذف جميع الشركاء من نوع "participant" بنجاح!');
      console.log('✅ النظام الآن يحتوي على الأنواع الصحيحة فقط');
    } else {
      console.log(`⚠️ لا يزال هناك ${participantCount} شريك من نوع "participant"`);
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ تم قطع الاتصال بقاعدة البيانات');
  }
}

completeCleanup();
