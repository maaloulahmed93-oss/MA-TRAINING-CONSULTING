// Script لإضافة برنامج تجريبي مباشرة إلى قاعدة البيانات
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const testProgram = {
  title: "برنامج تجريبي - تطوير المواقع",
  description: "برنامج تجريبي لتعلم تطوير المواقع باستخدام React و Node.js. هذا البرنامج تم إنشاؤه لاختبار النظام.",
  category: "Technologies",
  level: "Débutant",
  price: 299,
  duration: "8 أسابيع",
  maxParticipants: 20,
  sessionsPerYear: 4,
  modules: [
    { title: "مقدمة في HTML و CSS" },
    { title: "JavaScript الأساسي" },
    { title: "React للمبتدئين" },
    { title: "Node.js و Express" },
    { title: "قواعد البيانات MongoDB" }
  ],
  sessions: [
    { title: "الجلسة الأولى: الأساسيات", date: "2024-02-15" },
    { title: "الجلسة الثانية: التطبيق العملي", date: "2024-02-22" },
    { title: "الجلسة الثالثة: المشروع النهائي", date: "2024-03-01" },
    { title: "الجلسة الرابعة: العرض والتقييم", date: "2024-03-08" }
  ],
  isActive: true
};

async function addTestProgram() {
  try {
    console.log('🚀 إضافة برنامج تجريبي...');
    console.log('📋 البيانات:', JSON.stringify(testProgram, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}/programs`, testProgram, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ تم إضافة البرنامج بنجاح!');
    console.log('📊 الاستجابة:', response.data);
    console.log('🆔 معرف البرنامج:', response.data.data._id);
    
    // الآن نجرب استرجاع البرامج للتأكد
    console.log('\n🔍 اختبار استرجاع البرامج...');
    const getResponse = await axios.get(`${API_BASE_URL}/programs`);
    console.log('📋 عدد البرامج الموجودة:', getResponse.data.count);
    console.log('📊 البرامج:', getResponse.data.data.map(p => `${p.title} - ${p.price}€`));
    
  } catch (error) {
    console.error('❌ خطأ في إضافة البرنامج:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

addTestProgram();
