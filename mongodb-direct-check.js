// MongoDB Direct Check Script
// تشغيل هذا السكريبت لفحص قاعدة البيانات مباشرة

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config({ path: './backend/.env' });

// نماذج البيانات
const enterpriseFormationSchema = new mongoose.Schema({
  formationId: String,
  partnerId: String,
  title: String,
  description: String,
  createdAt: Date,
  updatedAt: Date
}, { collection: 'enterpriseformations' });

const partnerSchema = new mongoose.Schema({
  partnerId: String,
  fullName: String,
  type: String,
  isActive: Boolean,
  createdAt: Date
}, { collection: 'partners' });

const EnterpriseFormation = mongoose.model('EnterpriseFormation', enterpriseFormationSchema);
const Partner = mongoose.model('Partner', partnerSchema);

async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات MongoDB');
    return true;
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error.message);
    return false;
  }
}

async function analyzeFormations() {
  console.log('\n🔍 تحليل الفورماسيون في قاعدة البيانات...\n');
  
  try {
    // إحصائيات عامة
    const totalFormations = await EnterpriseFormation.countDocuments();
    console.log(`📊 إجمالي الفورماسيون: ${totalFormations}`);
    
    // فورماسيون مع partnerId
    const withPartnerId = await EnterpriseFormation.countDocuments({
      partnerId: { $exists: true, $ne: null, $ne: '' }
    });
    console.log(`✅ فورماسيون مع partnerId: ${withPartnerId}`);
    
    // فورماسيون بدون partnerId
    const withoutPartnerId = await EnterpriseFormation.countDocuments({
      $or: [
        { partnerId: { $exists: false } },
        { partnerId: null },
        { partnerId: '' }
      ]
    });
    console.log(`❌ فورماسيون بدون partnerId: ${withoutPartnerId}`);
    
    // توزيع الفورماسيون حسب الشريك
    const partnerDistribution = await EnterpriseFormation.aggregate([
      {
        $match: {
          partnerId: { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$partnerId',
          count: { $sum: 1 },
          formations: { $push: { title: '$title', formationId: '$formationId' } }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    console.log('\n👥 توزيع الفورماسيون حسب الشريك:');
    partnerDistribution.forEach(partner => {
      console.log(`   ${partner._id}: ${partner.count} فورماسيون`);
    });
    
    // فحص الشركاء المحددين
    const targetPartners = ['ENT-752810', 'ENT-190973'];
    console.log('\n🎯 فحص الشركاء المحددين:');
    
    for (const partnerId of targetPartners) {
      const partnerFormations = await EnterpriseFormation.find({ partnerId });
      console.log(`   ${partnerId}: ${partnerFormations.length} فورماسيون`);
      
      if (partnerFormations.length > 0) {
        console.log('     الفورماسيون:');
        partnerFormations.forEach(f => {
          console.log(`       - ${f.title || 'بدون عنوان'} (${f.formationId})`);
        });
      }
    }
    
    // فحص الفورماسيون المشكلة
    if (withoutPartnerId > 0) {
      console.log('\n⚠️ الفورماسيون بدون partnerId:');
      const problemFormations = await EnterpriseFormation.find({
        $or: [
          { partnerId: { $exists: false } },
          { partnerId: null },
          { partnerId: '' }
        ]
      }).limit(10);
      
      problemFormations.forEach(f => {
        console.log(`   - ${f.title || 'بدون عنوان'} (${f.formationId}) - تاريخ: ${f.createdAt}`);
      });
      
      if (withoutPartnerId > 10) {
        console.log(`   ... و ${withoutPartnerId - 10} فورماسيون أخرى`);
      }
    }
    
    return {
      total: totalFormations,
      withPartnerId,
      withoutPartnerId,
      partnerDistribution,
      problemFormations: withoutPartnerId
    };
    
  } catch (error) {
    console.error('❌ خطأ في تحليل الفورماسيون:', error.message);
    return null;
  }
}

async function analyzePartners() {
  console.log('\n👥 تحليل الشركاء...\n');
  
  try {
    const totalPartners = await Partner.countDocuments();
    console.log(`📊 إجمالي الشركاء: ${totalPartners}`);
    
    const activePartners = await Partner.countDocuments({ isActive: true });
    console.log(`✅ شركاء نشطين: ${activePartners}`);
    
    // توزيع الشركاء حسب النوع
    const typeDistribution = await Partner.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.log('\n📊 توزيع الشركاء حسب النوع:');
    typeDistribution.forEach(type => {
      console.log(`   ${type._id}: ${type.count}`);
    });
    
    // فحص الشركاء المحددين
    const targetPartners = ['ENT-752810', 'ENT-190973'];
    console.log('\n🎯 فحص الشركاء المحددين:');
    
    for (const partnerId of targetPartners) {
      const partner = await Partner.findOne({ partnerId });
      if (partner) {
        console.log(`   ✅ ${partnerId}: ${partner.fullName} (${partner.type}) - ${partner.isActive ? 'نشط' : 'غير نشط'}`);
      } else {
        console.log(`   ❌ ${partnerId}: غير موجود في قاعدة البيانات`);
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في تحليل الشركاء:', error.message);
  }
}

async function findDataIsolationIssues() {
  console.log('\n🔍 البحث عن مشاكل عزل البيانات...\n');
  
  try {
    // البحث عن فورماسيون مكررة (نفس formationId)
    const duplicateFormations = await EnterpriseFormation.aggregate([
      {
        $group: {
          _id: '$formationId',
          count: { $sum: 1 },
          partners: { $addToSet: '$partnerId' },
          docs: { $push: '$$ROOT' }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    if (duplicateFormations.length > 0) {
      console.log(`❌ تم العثور على ${duplicateFormations.length} فورماسيون مكررة:`);
      duplicateFormations.forEach(dup => {
        console.log(`   ${dup._id}: ${dup.count} نسخ، شركاء: ${dup.partners.join(', ')}`);
      });
    } else {
      console.log('✅ لا توجد فورماسيون مكررة');
    }
    
    // البحث عن فورماسيون بـ partnerId غير موجود
    const allPartnerIds = await Partner.distinct('partnerId');
    const formationsWithInvalidPartner = await EnterpriseFormation.find({
      partnerId: { 
        $exists: true, 
        $ne: null, 
        $ne: '',
        $nin: allPartnerIds 
      }
    });
    
    if (formationsWithInvalidPartner.length > 0) {
      console.log(`❌ فورماسيون بـ partnerId غير صحيح: ${formationsWithInvalidPartner.length}`);
      formationsWithInvalidPartner.forEach(f => {
        console.log(`   ${f.title} (${f.formationId}) - Partner: ${f.partnerId}`);
      });
    } else {
      console.log('✅ جميع الفورماسيون تحتوي على partnerId صحيح');
    }
    
  } catch (error) {
    console.error('❌ خطأ في البحث عن مشاكل العزل:', error.message);
  }
}

async function suggestFixes() {
  console.log('\n💡 اقتراحات الإصلاح:\n');
  
  const withoutPartnerId = await EnterpriseFormation.countDocuments({
    $or: [
      { partnerId: { $exists: false } },
      { partnerId: null },
      { partnerId: '' }
    ]
  });
  
  if (withoutPartnerId > 0) {
    console.log(`1. حذف ${withoutPartnerId} فورماسيون بدون partnerId:`);
    console.log('   db.enterpriseformations.deleteMany({$or: [{partnerId: {$exists: false}}, {partnerId: null}, {partnerId: ""}]})');
    console.log('');
  }
  
  console.log('2. إعادة إنشاء الفهارس:');
  console.log('   db.enterpriseformations.createIndex({partnerId: 1})');
  console.log('   db.enterpriseformations.createIndex({partnerId: 1, createdAt: -1})');
  console.log('');
  
  console.log('3. التحقق من النتائج:');
  console.log('   db.enterpriseformations.find({partnerId: "ENT-752810"}).count()');
  console.log('   db.enterpriseformations.find({partnerId: "ENT-190973"}).count()');
}

async function main() {
  console.log('🚀 بدء فحص قاعدة البيانات MongoDB...\n');
  
  const connected = await connectToDatabase();
  if (!connected) {
    process.exit(1);
  }
  
  try {
    await analyzePartners();
    const formationAnalysis = await analyzeFormations();
    await findDataIsolationIssues();
    await suggestFixes();
    
    console.log('\n📋 ملخص التحليل:');
    if (formationAnalysis) {
      console.log(`   • إجمالي الفورماسيون: ${formationAnalysis.total}`);
      console.log(`   • مع partnerId: ${formationAnalysis.withPartnerId}`);
      console.log(`   • بدون partnerId: ${formationAnalysis.withoutPartnerId}`);
      
      if (formationAnalysis.problemFormations > 0) {
        console.log('\n⚠️ يوجد مشكلة في عزل البيانات - الفورماسيون بدون partnerId تظهر لجميع الشركاء');
        console.log('💡 استخدم الأوامر المقترحة أعلاه لإصلاح المشكلة');
      } else {
        console.log('\n✅ عزل البيانات يعمل بشكل صحيح');
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في التحليل:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال بقاعدة البيانات');
  }
}

// تشغيل التحليل
main().catch(console.error);
