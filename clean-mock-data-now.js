// حذف البيانات التجريبية من قاعدة البيانات
import mongoose from 'mongoose';
import Partner from './backend/models/Partner.js';

const MONGODB_URI = 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db';

async function cleanMockData() {
  try {
    console.log('🔍 الاتصال بقاعدة البيانات...');
    await mongoose.connect(MONGODB_URI);
    
    console.log('\n📊 البحث عن البيانات التجريبية...');
    
    // البحث عن aziz ben ameur
    const azizPartner = await Partner.findOne({ 
      $or: [
        { fullName: { $regex: /aziz ben ameur/i } },
        { email: 'ameur@gmail.com' },
        { partnerId: { $regex: /PART-.*809/ } }
      ]
    });
    
    if (azizPartner) {
      console.log(`❗ تم العثور على البيانات التجريبية:`);
      console.log(`  - ID: ${azizPartner.partnerId}`);
      console.log(`  - الاسم: ${azizPartner.fullName}`);
      console.log(`  - البريد: ${azizPartner.email}`);
      console.log(`  - النوع: ${azizPartner.type}`);
      console.log(`  - تاريخ الإنشاء: ${azizPartner.createdAt}`);
      
      console.log('\n🗑️ حذف البيانات التجريبية...');
      await Partner.deleteOne({ _id: azizPartner._id });
      console.log('✅ تم حذف aziz ben ameur بنجاح');
    } else {
      console.log('✅ لا توجد بيانات تجريبية لـ aziz ben ameur');
    }
    
    // البحث عن أي بيانات تجريبية أخرى
    console.log('\n🔍 البحث عن بيانات تجريبية أخرى...');
    const testPartners = await Partner.find({
      $or: [
        { email: { $regex: /@example\.com$/i } },
        { fullName: { $regex: /test/i } },
        { fullName: { $regex: /demo/i } },
        { fullName: { $regex: /sample/i } }
      ]
    });
    
    if (testPartners.length > 0) {
      console.log(`❗ تم العثور على ${testPartners.length} بيانات تجريبية أخرى:`);
      for (const partner of testPartners) {
        console.log(`  - ${partner.partnerId}: ${partner.fullName} (${partner.email})`);
      }
      
      console.log('\n🗑️ حذف البيانات التجريبية الأخرى...');
      const deleteResult = await Partner.deleteMany({
        $or: [
          { email: { $regex: /@example\.com$/i } },
          { fullName: { $regex: /test/i } },
          { fullName: { $regex: /demo/i } },
          { fullName: { $regex: /sample/i } }
        ]
      });
      console.log(`✅ تم حذف ${deleteResult.deletedCount} بيانات تجريبية`);
    } else {
      console.log('✅ لا توجد بيانات تجريبية أخرى');
    }
    
    // عرض الإحصائيات النهائية
    console.log('\n📊 الإحصائيات النهائية:');
    const finalStats = await Partner.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    finalStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} شريك`);
    });
    
    const totalPartners = await Partner.countDocuments();
    console.log(`\n✅ إجمالي الشركاء المتبقين: ${totalPartners}`);
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ تم قطع الاتصال بقاعدة البيانات');
  }
}

cleanMockData();
