// فحص شامل لجميع البيانات المشتركة
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

async function checkAllCollectionsSharing() {
  console.log('\n🔍 فحص شامل لجميع البيانات المشتركة...\n');
  
  const collections = [
    'enterpriseformations',
    'enterpriseprojects', 
    'enterpriseevents',
    'enterpriseparticipants',
    'formateurprogrammes',
    'formateurseances',
    'formateurparticipants',
    'formateurevenements'
  ];
  
  const targetPartners = ['ENT-752810', 'ENT-190973'];
  
  for (const collectionName of collections) {
    try {
      console.log(`📁 فحص ${collectionName}:`);
      
      const totalCount = await mongoose.connection.db.collection(collectionName).countDocuments();
      console.log(`   إجمالي المستندات: ${totalCount}`);
      
      if (totalCount === 0) {
        console.log('   ⚪ فارغ\n');
        continue;
      }
      
      // فحص البيانات بدون partnerId
      const withoutPartnerId = await mongoose.connection.db.collection(collectionName).countDocuments({
        $or: [
          { partnerId: { $exists: false } },
          { partnerId: null },
          { partnerId: '' }
        ]
      });
      
      if (withoutPartnerId > 0) {
        console.log(`   ❌ ${withoutPartnerId} مستند بدون partnerId - هذا سبب المشاركة!`);
        
        // عرض عينة من المستندات المشكلة
        const problemDocs = await mongoose.connection.db.collection(collectionName)
          .find({
            $or: [
              { partnerId: { $exists: false } },
              { partnerId: null },
              { partnerId: '' }
            ]
          })
          .limit(3)
          .toArray();
        
        problemDocs.forEach((doc, index) => {
          console.log(`     ${index + 1}. ${doc.title || doc.name || doc.formationId || doc.projectId || 'بدون عنوان'}`);
          console.log(`        ID: ${doc._id}`);
          console.log(`        partnerId: ${doc.partnerId || '❌ مفقود'}`);
        });
      } else {
        console.log('   ✅ جميع المستندات تحتوي على partnerId');
      }
      
      // فحص توزيع البيانات حسب الشريك
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
      
      // فحص الشركاء المحددين
      for (const partnerId of targetPartners) {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments({ partnerId });
        if (count > 0) {
          console.log(`   👤 ${partnerId}: ${count} مستند`);
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ خطأ في فحص ${collectionName}: ${error.message}\n`);
    }
  }
}

async function checkDataIsolationIssues() {
  console.log('\n🚨 فحص مشاكل عزل البيانات:\n');
  
  const collections = [
    'enterpriseformations',
    'enterpriseprojects', 
    'enterpriseevents',
    'enterpriseparticipants'
  ];
  
  let totalIssues = 0;
  
  for (const collectionName of collections) {
    try {
      // البحث عن مستندات بدون partnerId
      const orphanedDocs = await mongoose.connection.db.collection(collectionName).find({
        $or: [
          { partnerId: { $exists: false } },
          { partnerId: null },
          { partnerId: '' }
        ]
      }).toArray();
      
      if (orphanedDocs.length > 0) {
        totalIssues += orphanedDocs.length;
        console.log(`❌ ${collectionName}: ${orphanedDocs.length} مستند بدون partnerId`);
        
        // عرض تفاصيل المستندات المشكلة
        orphanedDocs.slice(0, 5).forEach((doc, index) => {
          console.log(`   ${index + 1}. ${doc.title || doc.name || doc.formationId || doc.projectId || 'بدون عنوان'}`);
          console.log(`      تاريخ الإنشاء: ${doc.createdAt || 'غير محدد'}`);
          console.log(`      partnerId: ${doc.partnerId || '❌ مفقود'}`);
        });
        
        if (orphanedDocs.length > 5) {
          console.log(`   ... و ${orphanedDocs.length - 5} مستند آخر`);
        }
        console.log('');
      }
      
    } catch (error) {
      console.log(`❌ خطأ في فحص ${collectionName}: ${error.message}`);
    }
  }
  
  if (totalIssues > 0) {
    console.log(`🚨 إجمالي المشاكل: ${totalIssues} مستند بدون partnerId`);
    console.log('💡 هذا يفسر سبب ظهور نفس البيانات لجميع الشركاء');
  } else {
    console.log('✅ لا توجد مشاكل في عزل البيانات');
  }
}

async function simulatePartnerView() {
  console.log('\n👥 محاكاة عرض البيانات للشركاء:\n');
  
  const targetPartners = ['ENT-752810', 'ENT-190973'];
  const collections = ['enterpriseformations', 'enterpriseprojects', 'enterpriseevents'];
  
  for (const partnerId of targetPartners) {
    console.log(`👤 عرض البيانات للشريك ${partnerId}:`);
    
    for (const collectionName of collections) {
      try {
        // البيانات الخاصة بالشريك (مع partnerId صحيح)
        const ownData = await mongoose.connection.db.collection(collectionName).countDocuments({ partnerId });
        
        // البيانات المشتركة (بدون partnerId) - هذه ستظهر للجميع
        const sharedData = await mongoose.connection.db.collection(collectionName).countDocuments({
          $or: [
            { partnerId: { $exists: false } },
            { partnerId: null },
            { partnerId: '' }
          ]
        });
        
        const totalVisible = ownData + sharedData;
        
        console.log(`   ${collectionName}: ${totalVisible} (${ownData} خاص + ${sharedData} مشترك)`);
        
        if (sharedData > 0) {
          console.log(`     ⚠️ ${sharedData} مستند مشترك سيظهر لجميع الشركاء!`);
        }
        
      } catch (error) {
        console.log(`   ❌ خطأ في ${collectionName}: ${error.message}`);
      }
    }
    console.log('');
  }
}

async function generateFixCommands() {
  console.log('\n🔧 أوامر الإصلاح المقترحة:\n');
  
  const collections = [
    'enterpriseformations',
    'enterpriseprojects', 
    'enterpriseevents',
    'enterpriseparticipants'
  ];
  
  for (const collectionName of collections) {
    try {
      const orphanedCount = await mongoose.connection.db.collection(collectionName).countDocuments({
        $or: [
          { partnerId: { $exists: false } },
          { partnerId: null },
          { partnerId: '' }
        ]
      });
      
      if (orphanedCount > 0) {
        console.log(`📝 لحذف ${orphanedCount} مستند من ${collectionName}:`);
        console.log(`   db.${collectionName}.deleteMany({$or: [{partnerId: {$exists: false}}, {partnerId: null}, {partnerId: ""}]})`);
        console.log('');
      }
      
    } catch (error) {
      console.log(`❌ خطأ في ${collectionName}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 فحص شامل لمشاكل مشاركة البيانات...');
  
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }
  
  try {
    await checkAllCollectionsSharing();
    await checkDataIsolationIssues();
    await simulatePartnerView();
    await generateFixCommands();
    
    console.log('\n📋 الخلاصة:');
    console.log('إذا وُجدت مستندات بدون partnerId، فهي السبب في ظهور نفس البيانات لجميع الشركاء');
    console.log('استخدم أوامر الإصلاح المقترحة أعلاه لحل المشكلة');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال');
  }
}

main().catch(console.error);
