// إصلاح جميع البيانات بدون partnerId
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');
    return true;
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
    return false;
  }
}

async function fixAllOrphanedData() {
  console.log('\n🔧 إصلاح جميع البيانات بدون partnerId...\n');
  
  const collections = [
    'enterpriseformations',
    'enterpriseprojects', 
    'enterpriseevents',
    'enterpriseparticipants',
    'formateurprogrammes',
    'formateurseances',
    'formateurparticipants',
    'formateurevenements',
    'programs', // إضافة programs للتأكد
    'courses',
    'trainings'
  ];
  
  let totalDeleted = 0;
  
  for (const collectionName of collections) {
    try {
      console.log(`🔍 فحص ${collectionName}...`);
      
      // عد المستندات بدون partnerId
      const orphanedCount = await mongoose.connection.db.collection(collectionName).countDocuments({
        $or: [
          { partnerId: { $exists: false } },
          { partnerId: null },
          { partnerId: '' }
        ]
      });
      
      if (orphanedCount > 0) {
        console.log(`   ❌ وجد ${orphanedCount} مستند بدون partnerId`);
        
        // عرض عينة من المستندات قبل الحذف
        const sampleDocs = await mongoose.connection.db.collection(collectionName)
          .find({
            $or: [
              { partnerId: { $exists: false } },
              { partnerId: null },
              { partnerId: '' }
            ]
          })
          .limit(3)
          .toArray();
        
        console.log('   📋 عينة من المستندات التي ستُحذف:');
        sampleDocs.forEach((doc, index) => {
          console.log(`     ${index + 1}. ${doc.title || doc.name || doc.formationId || doc.projectId || 'بدون عنوان'}`);
          console.log(`        ID: ${doc._id}`);
          console.log(`        تاريخ الإنشاء: ${doc.createdAt || 'غير محدد'}`);
        });
        
        // حذف المستندات بدون partnerId
        const deleteResult = await mongoose.connection.db.collection(collectionName).deleteMany({
          $or: [
            { partnerId: { $exists: false } },
            { partnerId: null },
            { partnerId: '' }
          ]
        });
        
        console.log(`   ✅ تم حذف ${deleteResult.deletedCount} مستند`);
        totalDeleted += deleteResult.deletedCount;
        
      } else {
        console.log('   ✅ لا توجد مستندات بدون partnerId');
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ خطأ في معالجة ${collectionName}: ${error.message}\n`);
    }
  }
  
  return totalDeleted;
}

async function verifyFix() {
  console.log('\n✅ التحقق من الإصلاح...\n');
  
  const collections = [
    'enterpriseformations',
    'enterpriseprojects', 
    'enterpriseevents',
    'formateurprogrammes',
    'formateurseances',
    'formateurevenements'
  ];
  
  let remainingIssues = 0;
  
  for (const collectionName of collections) {
    try {
      const orphanedCount = await mongoose.connection.db.collection(collectionName).countDocuments({
        $or: [
          { partnerId: { $exists: false } },
          { partnerId: null },
          { partnerId: '' }
        ]
      });
      
      const totalCount = await mongoose.connection.db.collection(collectionName).countDocuments();
      
      console.log(`📁 ${collectionName}: ${totalCount} مستند إجمالي`);
      
      if (orphanedCount > 0) {
        console.log(`   ❌ لا يزال يوجد ${orphanedCount} مستند بدون partnerId`);
        remainingIssues += orphanedCount;
      } else {
        console.log('   ✅ جميع المستندات تحتوي على partnerId صحيح');
      }
      
      // عرض توزيع البيانات حسب الشريك
      if (totalCount > 0) {
        const partnerDistribution = await mongoose.connection.db.collection(collectionName).aggregate([
          {
            $match: {
              partnerId: { $exists: true, $ne: null, $ne: '' }
            }
          },
          {
            $group: {
              _id: '$partnerId',
              count: { $sum: 1 }
            }
          }
        ]).toArray();
        
        if (partnerDistribution.length > 0) {
          console.log('   📊 توزيع حسب الشريك:');
          partnerDistribution.forEach(partner => {
            console.log(`     ${partner._id}: ${partner.count} مستند`);
          });
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`❌ خطأ في التحقق من ${collectionName}: ${error.message}`);
    }
  }
  
  return remainingIssues;
}

async function testDataIsolation() {
  console.log('\n🧪 اختبار عزل البيانات النهائي...\n');
  
  const targetPartners = ['ENT-752810', 'ENT-190973'];
  const collections = ['enterpriseformations', 'enterpriseprojects', 'enterpriseevents'];
  
  for (const partnerId of targetPartners) {
    console.log(`👤 ${partnerId}:`);
    
    for (const collectionName of collections) {
      try {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments({ partnerId });
        console.log(`   ${collectionName}: ${count} مستند`);
      } catch (error) {
        console.log(`   ${collectionName}: خطأ في الفحص`);
      }
    }
    console.log('');
  }
  
  // فحص الفورماتور أيضاً
  console.log('👨‍🏫 فحص بيانات الفورماتور:');
  const formateurCollections = ['formateurprogrammes', 'formateurseances', 'formateurevenements'];
  
  for (const collectionName of formateurCollections) {
    try {
      const totalCount = await mongoose.connection.db.collection(collectionName).countDocuments();
      const withPartnerId = await mongoose.connection.db.collection(collectionName).countDocuments({
        partnerId: { $exists: true, $ne: null, $ne: '' }
      });
      
      console.log(`   ${collectionName}: ${totalCount} إجمالي (${withPartnerId} مع partnerId)`);
      
    } catch (error) {
      console.log(`   ${collectionName}: خطأ في الفحص`);
    }
  }
}

async function main() {
  console.log('🚀 إصلاح شامل لجميع البيانات المشتركة...');
  
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }
  
  try {
    const totalDeleted = await fixAllOrphanedData();
    
    console.log(`📊 ملخص الإصلاح: تم حذف ${totalDeleted} مستند بدون partnerId`);
    
    if (totalDeleted > 0) {
      const remainingIssues = await verifyFix();
      
      if (remainingIssues === 0) {
        console.log('🎉 تم إصلاح جميع مشاكل عزل البيانات بنجاح!');
        
        await testDataIsolation();
        
        console.log('\n✅ النتيجة النهائية:');
        console.log('   • كل شريك سيرى فقط بياناته الخاصة');
        console.log('   • لن تظهر بيانات مشتركة بين الشركاء');
        console.log('   • عزل البيانات يعمل بشكل مثالي');
        
      } else {
        console.log(`⚠️ لا تزال هناك ${remainingIssues} مشكلة تحتاج إصلاح`);
      }
    } else {
      console.log('✅ لا توجد مشاكل تحتاج إصلاح');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال');
  }
}

main().catch(console.error);
