// البحث عن جميع مصادر الفورماسيون
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

async function findAllFormationsSources() {
  console.log('\n🔍 البحث عن جميع مصادر الفورماسيون...\n');
  
  // قائمة جميع Collections المحتملة
  const allCollections = await mongoose.connection.db.listCollections().toArray();
  
  console.log('📋 جميع Collections في قاعدة البيانات:');
  allCollections.forEach(col => {
    console.log(`   - ${col.name}`);
  });
  console.log('');
  
  // البحث في كل collection عن مستندات تحتوي على كلمات مفتاحية للفورماسيون
  const searchTerms = ['formation', 'cours', 'training', 'program', 'الفيلا', 'ftg', 'تتبع', 'edhe'];
  
  for (const collection of allCollections) {
    const collectionName = collection.name;
    
    try {
      console.log(`🔍 فحص ${collectionName}:`);
      
      const totalDocs = await mongoose.connection.db.collection(collectionName).countDocuments();
      console.log(`   إجمالي المستندات: ${totalDocs}`);
      
      if (totalDocs === 0) {
        console.log('   ⚪ فارغ\n');
        continue;
      }
      
      // البحث عن مستندات تحتوي على العناوين المرئية في الصورة
      const visibleTitles = ['الفيلا', 'ftg', 'تتبع', 'edhe'];
      
      for (const title of visibleTitles) {
        const matchingDocs = await mongoose.connection.db.collection(collectionName).find({
          $or: [
            { title: { $regex: title, $options: 'i' } },
            { name: { $regex: title, $options: 'i' } },
            { formationTitle: { $regex: title, $options: 'i' } }
          ]
        }).toArray();
        
        if (matchingDocs.length > 0) {
          console.log(`   🎯 وجد "${title}" في ${matchingDocs.length} مستند:`);
          matchingDocs.forEach((doc, index) => {
            console.log(`     ${index + 1}. ID: ${doc._id}`);
            console.log(`        العنوان: ${doc.title || doc.name || doc.formationTitle || 'غير محدد'}`);
            console.log(`        partnerId: ${doc.partnerId || '❌ مفقود'}`);
            console.log(`        تاريخ الإنشاء: ${doc.createdAt || 'غير محدد'}`);
            console.log(`        الحالة: ${doc.status || 'غير محدد'}`);
            
            // عرض جميع الحقول للفهم الكامل
            console.log(`        جميع الحقول:`, Object.keys(doc));
            console.log('');
          });
        }
      }
      
      // البحث عن أي مستندات بدون partnerId
      const orphanedDocs = await mongoose.connection.db.collection(collectionName).find({
        $or: [
          { partnerId: { $exists: false } },
          { partnerId: null },
          { partnerId: '' }
        ]
      }).toArray();
      
      if (orphanedDocs.length > 0) {
        console.log(`   ❌ ${orphanedDocs.length} مستند بدون partnerId:`);
        orphanedDocs.slice(0, 5).forEach((doc, index) => {
          console.log(`     ${index + 1}. ${doc.title || doc.name || doc.formationTitle || 'بدون عنوان'}`);
          console.log(`        ID: ${doc._id}`);
          console.log(`        partnerId: ${doc.partnerId || '❌ مفقود'}`);
        });
        
        if (orphanedDocs.length > 5) {
          console.log(`     ... و ${orphanedDocs.length - 5} مستند آخر`);
        }
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ خطأ في فحص ${collectionName}: ${error.message}\n`);
    }
  }
}

async function checkSpecificFormations() {
  console.log('\n🎯 فحص الفورماسيون المحددة من الصورة...\n');
  
  const visibleFormations = [
    { title: 'الفيلا', date: '20 septembre 2025' },
    { title: 'ftg', date: '19 septembre 2025' },
    { title: 'تتبع', date: '19 septembre 2025' },
    { title: 'edhe', date: '19 septembre 2025' }
  ];
  
  const allCollections = await mongoose.connection.db.listCollections().toArray();
  
  for (const formation of visibleFormations) {
    console.log(`🔍 البحث عن "${formation.title}":`);
    let found = false;
    
    for (const collection of allCollections) {
      try {
        const matches = await mongoose.connection.db.collection(collection.name).find({
          $or: [
            { title: { $regex: formation.title, $options: 'i' } },
            { name: { $regex: formation.title, $options: 'i' } },
            { formationTitle: { $regex: formation.title, $options: 'i' } }
          ]
        }).toArray();
        
        if (matches.length > 0) {
          found = true;
          console.log(`   ✅ وجد في ${collection.name}:`);
          matches.forEach((doc, index) => {
            console.log(`     ${index + 1}. ID: ${doc._id}`);
            console.log(`        partnerId: ${doc.partnerId || '❌ مفقود'}`);
            console.log(`        تاريخ: ${doc.date || doc.createdAt || 'غير محدد'}`);
            console.log(`        الحالة: ${doc.status || 'غير محدد'}`);
          });
        }
        
      } catch (error) {
        // تجاهل الأخطاء
      }
    }
    
    if (!found) {
      console.log(`   ❌ لم يتم العثور على "${formation.title}" في أي collection`);
    }
    
    console.log('');
  }
}

async function findFormationsAPI() {
  console.log('\n🌐 فحص API endpoints للفورماسيون...\n');
  
  // محاكاة استدعاء API للحصول على الفورماسيون
  const targetPartners = ['ENT-752810', 'ENT-190973'];
  
  for (const partnerId of targetPartners) {
    console.log(`👤 فحص API للشريك ${partnerId}:`);
    
    try {
      // فحص enterpriseformations
      const formations = await mongoose.connection.db.collection('enterpriseformations')
        .find({ partnerId }).toArray();
      
      console.log(`   enterpriseformations: ${formations.length} فورماسيون`);
      formations.forEach((f, index) => {
        console.log(`     ${index + 1}. ${f.title} (${f.formationId})`);
      });
      
      // فحص أي collections أخرى قد تحتوي على فورماسيون
      const otherCollections = ['programs', 'courses', 'trainings', 'formations'];
      
      for (const collectionName of otherCollections) {
        try {
          const docs = await mongoose.connection.db.collection(collectionName).find({}).toArray();
          if (docs.length > 0) {
            console.log(`   ${collectionName}: ${docs.length} مستند`);
            docs.forEach((doc, index) => {
              console.log(`     ${index + 1}. ${doc.title || doc.name || 'بدون عنوان'}`);
              console.log(`        partnerId: ${doc.partnerId || '❌ مفقود'}`);
            });
          }
        } catch (error) {
          // Collection doesn't exist
        }
      }
      
    } catch (error) {
      console.log(`   ❌ خطأ: ${error.message}`);
    }
    
    console.log('');
  }
}

async function main() {
  console.log('🚀 البحث الشامل عن مصادر الفورماسيون...');
  
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }
  
  try {
    await findAllFormationsSources();
    await checkSpecificFormations();
    await findFormationsAPI();
    
    console.log('\n📋 الخلاصة:');
    console.log('ابحث عن الفورماسيون المرئية في الصورة (الفيلا، ftg، تتبع، edhe)');
    console.log('وتحقق من أي collections تحتوي على مستندات بدون partnerId');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال');
  }
}

main().catch(console.error);
