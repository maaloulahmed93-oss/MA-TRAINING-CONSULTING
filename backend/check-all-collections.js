// فحص جميع collections في قاعدة البيانات
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');
    console.log(`📍 قاعدة البيانات: ${mongoose.connection.db.databaseName}`);
    return true;
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
    return false;
  }
}

async function listAllCollections() {
  console.log('\n📋 جميع Collections في قاعدة البيانات:\n');
  
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('⚠️ لا توجد collections في قاعدة البيانات');
      return;
    }
    
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`📁 ${collection.name}: ${count} مستند`);
      
      // فحص خاص للـ collections المتعلقة بالفورماسيون
      if (collection.name.toLowerCase().includes('formation')) {
        console.log(`   🔍 فحص تفصيلي لـ ${collection.name}:`);
        
        const sample = await mongoose.connection.db.collection(collection.name).find({}).limit(3).toArray();
        sample.forEach((doc, index) => {
          console.log(`     ${index + 1}. ${doc.title || 'بدون عنوان'} (partnerId: ${doc.partnerId || 'مفقود'})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في قراءة Collections:', error.message);
  }
}

async function searchForFormations() {
  console.log('\n🔍 البحث عن الفورماسيون في جميع Collections:\n');
  
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      try {
        // البحث عن مستندات تحتوي على كلمة "formation" أو "title"
        const formationDocs = await mongoose.connection.db.collection(collection.name)
          .find({
            $or: [
              { title: { $exists: true } },
              { formationId: { $exists: true } },
              { type: /formation/i }
            ]
          }).limit(5).toArray();
        
        if (formationDocs.length > 0) {
          console.log(`📚 ${collection.name}: وجد ${formationDocs.length} مستند يشبه الفورماسيون`);
          formationDocs.forEach((doc, index) => {
            console.log(`   ${index + 1}. ${doc.title || doc.name || 'بدون عنوان'} (ID: ${doc._id})`);
            if (doc.partnerId) {
              console.log(`      partnerId: ${doc.partnerId}`);
            }
          });
        }
        
      } catch (error) {
        // تجاهل الأخطاء في collections معينة
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في البحث:', error.message);
  }
}

async function checkSpecificCollections() {
  console.log('\n🎯 فحص Collections محددة:\n');
  
  const collectionsToCheck = [
    'enterpriseformations',
    'formations', 
    'programs',
    'courses',
    'trainings'
  ];
  
  for (const collectionName of collectionsToCheck) {
    try {
      const exists = await mongoose.connection.db.listCollections({ name: collectionName }).hasNext();
      
      if (exists) {
        const count = await mongoose.connection.db.collection(collectionName).countDocuments();
        console.log(`✅ ${collectionName}: ${count} مستند`);
        
        if (count > 0) {
          const sample = await mongoose.connection.db.collection(collectionName).find({}).limit(2).toArray();
          sample.forEach(doc => {
            console.log(`   - ${doc.title || doc.name || 'بدون عنوان'} (partnerId: ${doc.partnerId || 'غير محدد'})`);
          });
        }
      } else {
        console.log(`❌ ${collectionName}: غير موجود`);
      }
      
    } catch (error) {
      console.log(`❌ ${collectionName}: خطأ في الفحص`);
    }
  }
}

async function checkDatabaseConnection() {
  console.log('\n🔗 فحص الاتصال بقاعدة البيانات:\n');
  
  console.log(`📍 URI: ${process.env.MONGODB_URI?.substring(0, 50)}...`);
  console.log(`📍 اسم قاعدة البيانات: ${mongoose.connection.db.databaseName}`);
  console.log(`📍 حالة الاتصال: ${mongoose.connection.readyState === 1 ? 'متصل' : 'غير متصل'}`);
  
  // اختبار كتابة وقراءة
  try {
    const testCollection = mongoose.connection.db.collection('test_connection');
    
    // كتابة مستند تجريبي
    await testCollection.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ اختبار الكتابة: نجح');
    
    // قراءة المستند
    const testDoc = await testCollection.findOne({ test: true });
    console.log('✅ اختبار القراءة: نجح');
    
    // حذف المستند التجريبي
    await testCollection.deleteOne({ test: true });
    console.log('✅ اختبار الحذف: نجح');
    
  } catch (error) {
    console.error('❌ خطأ في اختبار قاعدة البيانات:', error.message);
  }
}

async function main() {
  console.log('🚀 فحص شامل لقاعدة البيانات...');
  
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }
  
  try {
    await checkDatabaseConnection();
    await listAllCollections();
    await checkSpecificCollections();
    await searchForFormations();
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال');
  }
}

main().catch(console.error);
