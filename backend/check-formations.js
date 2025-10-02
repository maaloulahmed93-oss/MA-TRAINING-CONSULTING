// فحص الفورماسيون في قاعدة البيانات
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import EnterpriseFormation from './models/EnterpriseFormation.js';
import Partner from './models/Partner.js';

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

async function analyzeFormations() {
  console.log('\n🔍 تحليل الفورماسيون...\n');
  
  // إحصائيات عامة
  const total = await EnterpriseFormation.countDocuments();
  console.log(`📊 إجمالي الفورماسيون: ${total}`);
  
  // فورماسيون مع partnerId
  const withPartner = await EnterpriseFormation.countDocuments({
    partnerId: { $exists: true, $ne: null, $ne: '' }
  });
  console.log(`✅ مع partnerId: ${withPartner}`);
  
  // فورماسيون بدون partnerId
  const withoutPartner = await EnterpriseFormation.countDocuments({
    $or: [
      { partnerId: { $exists: false } },
      { partnerId: null },
      { partnerId: '' }
    ]
  });
  console.log(`❌ بدون partnerId: ${withoutPartner}`);
  
  // فحص الشركاء المحددين
  const targetPartners = ['ENT-752810', 'ENT-190973'];
  console.log('\n👥 فحص الشركاء المحددين:');
  
  for (const partnerId of targetPartners) {
    const count = await EnterpriseFormation.countDocuments({ partnerId });
    console.log(`   ${partnerId}: ${count} فورماسيون`);
    
    if (count > 0) {
      const formations = await EnterpriseFormation.find({ partnerId }).limit(3);
      formations.forEach(f => {
        console.log(`     - ${f.title || 'بدون عنوان'} (${f.formationId})`);
      });
    }
  }
  
  // عرض الفورماسيون المشكلة
  if (withoutPartner > 0) {
    console.log('\n⚠️ الفورماسيون بدون partnerId:');
    const problemFormations = await EnterpriseFormation.find({
      $or: [
        { partnerId: { $exists: false } },
        { partnerId: null },
        { partnerId: '' }
      ]
    }).limit(5);
    
    problemFormations.forEach(f => {
      console.log(`   - ${f.title || 'بدون عنوان'} (${f.formationId})`);
    });
    
    if (withoutPartner > 5) {
      console.log(`   ... و ${withoutPartner - 5} فورماسيون أخرى`);
    }
  }
  
  return { total, withPartner, withoutPartner };
}

async function fixFormations() {
  console.log('\n🔧 إصلاح الفورماسيون...\n');
  
  try {
    // حذف الفورماسيون بدون partnerId
    const result = await EnterpriseFormation.deleteMany({
      $or: [
        { partnerId: { $exists: false } },
        { partnerId: null },
        { partnerId: '' }
      ]
    });
    
    console.log(`✅ تم حذف ${result.deletedCount} فورماسيون بدون partnerId`);
    return result.deletedCount;
    
  } catch (error) {
    console.error('❌ خطأ في الإصلاح:', error.message);
    return 0;
  }
}

async function verifyFix() {
  console.log('\n✅ التحقق من الإصلاح...\n');
  
  const targetPartners = ['ENT-752810', 'ENT-190973'];
  
  for (const partnerId of targetPartners) {
    const count = await EnterpriseFormation.countDocuments({ partnerId });
    console.log(`${partnerId}: ${count} فورماسيون`);
  }
  
  const withoutPartner = await EnterpriseFormation.countDocuments({
    $or: [
      { partnerId: { $exists: false } },
      { partnerId: null },
      { partnerId: '' }
    ]
  });
  
  console.log(`فورماسيون بدون partnerId: ${withoutPartner}`);
  
  if (withoutPartner === 0) {
    console.log('✅ تم إصلاح المشكلة بنجاح!');
  } else {
    console.log('⚠️ لا تزال هناك مشكلة');
  }
}

async function main() {
  console.log('🚀 بدء فحص وإصلاح الفورماسيون...');
  
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }
  
  try {
    // تحليل أولي
    const analysis = await analyzeFormations();
    
    if (analysis.withoutPartner > 0) {
      console.log(`\n⚠️ تم العثور على ${analysis.withoutPartner} فورماسيون بدون partnerId`);
      console.log('هذا يفسر سبب ظهور نفس الفورماسيون في جميع الحسابات');
      
      // إصلاح المشكلة
      const deleted = await fixFormations();
      
      if (deleted > 0) {
        // التحقق من الإصلاح
        await verifyFix();
      }
    } else {
      console.log('\n✅ لا توجد مشكلة - جميع الفورماسيون تحتوي على partnerId');
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال');
  }
}

main().catch(console.error);
