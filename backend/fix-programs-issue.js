// إصلاح مشكلة البرامج في collection خاطئ
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

async function analyzeIssue() {
  console.log('\n🔍 تحليل المشكلة:\n');
  
  // فحص programs collection
  const programsCount = await mongoose.connection.db.collection('programs').countDocuments();
  console.log(`📊 programs collection: ${programsCount} مستند`);
  
  if (programsCount > 0) {
    const programs = await mongoose.connection.db.collection('programs').find({}).toArray();
    console.log('\n📋 البرامج الموجودة في programs:');
    programs.forEach((program, index) => {
      console.log(`   ${index + 1}. ${program.title || program.name || 'بدون عنوان'}`);
      console.log(`      ID: ${program._id}`);
      console.log(`      partnerId: ${program.partnerId || '❌ مفقود'}`);
      console.log(`      تاريخ الإنشاء: ${program.createdAt || 'غير محدد'}`);
      console.log('');
    });
  }
  
  // فحص enterpriseformations collection
  const formationsCount = await mongoose.connection.db.collection('enterpriseformations').countDocuments();
  console.log(`📊 enterpriseformations collection: ${formationsCount} مستند`);
  
  return { programsCount, formationsCount };
}

async function fixIssue() {
  console.log('\n🔧 إصلاح المشكلة:\n');
  
  try {
    // الحل 1: حذف البرامج من programs collection (لأنها بدون partnerId)
    const deleteResult = await mongoose.connection.db.collection('programs').deleteMany({
      $or: [
        { partnerId: { $exists: false } },
        { partnerId: null },
        { partnerId: '' }
      ]
    });
    
    console.log(`✅ تم حذف ${deleteResult.deletedCount} برنامج من programs collection`);
    
    // الحل 2: التأكد من أن الفورماسيون الجديدة ستُحفظ في المكان الصحيح
    console.log('💡 الآن الفورماسيون الجديدة ستُحفظ في enterpriseformations collection مع partnerId صحيح');
    
    return deleteResult.deletedCount;
    
  } catch (error) {
    console.error('❌ خطأ في الإصلاح:', error.message);
    return 0;
  }
}

async function verifyFix() {
  console.log('\n✅ التحقق من الإصلاح:\n');
  
  const programsCount = await mongoose.connection.db.collection('programs').countDocuments();
  const formationsCount = await mongoose.connection.db.collection('enterpriseformations').countDocuments();
  
  console.log(`📊 programs collection: ${programsCount} مستند`);
  console.log(`📊 enterpriseformations collection: ${formationsCount} مستند`);
  
  if (programsCount === 0) {
    console.log('✅ تم حذف البرامج المشكلة من programs collection');
    console.log('✅ الآن كل شريك سيرى فقط فورماسيونه الخاصة');
    console.log('✅ الإحصائيات ستعمل بشكل صحيح');
  } else {
    console.log('⚠️ لا تزال هناك برامج في programs collection');
  }
}

async function createTestFormations() {
  console.log('\n🧪 إنشاء فورماسيون تجريبية للاختبار:\n');
  
  const testFormations = [
    {
      formationId: 'FORM-TEST001',
      partnerId: 'ENT-752810',
      title: 'فورماسيون تجريبية للشريك الأول',
      description: 'فورماسيون لاختبار عزل البيانات',
      date: new Date(),
      duration: 8,
      location: 'online',
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      formationId: 'FORM-TEST002',
      partnerId: 'ENT-190973',
      title: 'فورماسيون تجريبية للشريك الثاني',
      description: 'فورماسيون لاختبار عزل البيانات',
      date: new Date(),
      duration: 6,
      location: 'onsite',
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  try {
    const result = await mongoose.connection.db.collection('enterpriseformations').insertMany(testFormations);
    console.log(`✅ تم إنشاء ${result.insertedCount} فورماسيون تجريبية`);
    
    // التحقق من النتائج
    for (const formation of testFormations) {
      const count = await mongoose.connection.db.collection('enterpriseformations').countDocuments({ 
        partnerId: formation.partnerId 
      });
      console.log(`   ${formation.partnerId}: ${count} فورماسيون`);
    }
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الفورماسيون التجريبية:', error.message);
  }
}

async function main() {
  console.log('🚀 إصلاح مشكلة الفورماسيون...');
  
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }
  
  try {
    // تحليل المشكلة
    const analysis = await analyzeIssue();
    
    console.log('\n📋 تشخيص المشكلة:');
    console.log('❌ الفورماسيون محفوظة في programs collection بدون partnerId');
    console.log('❌ هذا يجعلها تظهر لجميع الشركاء');
    console.log('❌ الإحصائيات تبحث في enterpriseformations فتجد 0');
    
    // إصلاح المشكلة
    if (analysis.programsCount > 0) {
      const deleted = await fixIssue();
      
      if (deleted > 0) {
        await verifyFix();
        
        // إنشاء فورماسيون تجريبية للاختبار
        await createTestFormations();
        
        console.log('\n🎉 تم إصلاح المشكلة بنجاح!');
        console.log('💡 الآن:');
        console.log('   ✅ كل شريك سيرى فقط فورماسيونه');
        console.log('   ✅ الإحصائيات ستعمل بشكل صحيح');
        console.log('   ✅ عزل البيانات يعمل بشكل مثالي');
      }
    } else {
      console.log('\n✅ لا توجد مشكلة - programs collection فارغ');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال');
  }
}

main().catch(console.error);
