// 🧪 اختبار اتصال MongoDB - تشغيل محلي
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  console.log('🔍 اختبار اتصال MongoDB...');
  console.log('📍 MONGODB_URI:', process.env.MONGODB_URI ? 'موجود' : 'مفقود');
  
  if (!process.env.MONGODB_URI) {
    console.log('❌ متغير MONGODB_URI غير موجود في .env');
    return;
  }
  
  try {
    // إخفاء كلمة المرور في الـ log
    const safeUri = process.env.MONGODB_URI.replace(/:([^:@]{1,})@/, ':***@');
    console.log('🔗 محاولة الاتصال بـ:', safeUri);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
    });
    
    console.log('✅ نجح الاتصال بـ MongoDB!');
    console.log('📊 حالة الاتصال:', mongoose.connection.readyState);
    console.log('🏷️  اسم قاعدة البيانات:', mongoose.connection.db.databaseName);
    
    // اختبار عملية بسيطة
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 المجموعات الموجودة:', collections.map(c => c.name));
    
  } catch (error) {
    console.log('❌ فشل الاتصال:', error.message);
    console.log('🔍 نوع الخطأ:', error.name);
    
    if (error.message.includes('bad auth')) {
      console.log('🚨 مشكلة في المصادقة - تحقق من:');
      console.log('   - اسم المستخدم وكلمة المرور');
      console.log('   - URL encoding للرموز الخاصة');
      console.log('   - Database Access permissions في MongoDB Atlas');
    }
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
      console.log('🚨 مشكلة في الشبكة - تحقق من:');
      console.log('   - Network Access في MongoDB Atlas');
      console.log('   - إضافة 0.0.0.0/0 للـ IP whitelist');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال');
  }
};

// تشغيل الاختبار
testConnection().catch(console.error);
