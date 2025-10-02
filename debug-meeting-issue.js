// ملف لفحص مشكلة عدم ظهور الاجتماعات للفريلانسر FRE-340255
import mongoose from 'mongoose';
import FreelancerMeeting from './backend/models/FreelancerMeeting.js';

const mongoURI = 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db?retryWrites=true&w=majority&appName=matc';

async function debugMeetingIssue() {
    try {
        // الاتصال بقاعدة البيانات
        console.log('🔗 الاتصال بقاعدة البيانات...');
        await mongoose.connect(mongoURI);
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

        // 1. فحص جميع الاجتماعات
        console.log('\n📋 1. فحص جميع الاجتماعات في قاعدة البيانات:');
        const allMeetings = await FreelancerMeeting.find({});
        console.log(`📊 إجمالي الاجتماعات: ${allMeetings.length}`);
        
        allMeetings.forEach((meeting, index) => {
            console.log(`\n🔸 اجتماع ${index + 1}:`);
            console.log(`   📝 الموضوع: ${meeting.subject}`);
            console.log(`   📅 التاريخ: ${meeting.date}`);
            console.log(`   👥 المشاركون: ${JSON.stringify(meeting.participantFreelancerIds)}`);
            console.log(`   🆔 ID: ${meeting._id}`);
        });

        // 2. البحث عن اجتماعات FRE-340255
        console.log('\n🔍 2. البحث عن اجتماعات FRE-340255:');
        const freelancerId = 'FRE-340255';
        
        // البحث المباشر
        const directSearch = await FreelancerMeeting.find({
            participantFreelancerIds: { $in: [freelancerId] }
        });
        console.log(`📊 نتائج البحث المباشر: ${directSearch.length} اجتماع`);
        
        // البحث بطرق مختلفة
        const exactMatch = await FreelancerMeeting.find({
            participantFreelancerIds: freelancerId
        });
        console.log(`📊 البحث بالتطابق التام: ${exactMatch.length} اجتماع`);
        
        const arrayContains = await FreelancerMeeting.find({
            participantFreelancerIds: { $elemMatch: { $eq: freelancerId } }
        });
        console.log(`📊 البحث بـ elemMatch: ${arrayContains.length} اجتماع`);

        // 3. فحص تفاصيل كل اجتماع
        console.log('\n🔍 3. تفاصيل كل اجتماع:');
        for (const meeting of allMeetings) {
            console.log(`\n📋 اجتماع: ${meeting.subject}`);
            console.log(`   👥 participantFreelancerIds: ${JSON.stringify(meeting.participantFreelancerIds)}`);
            console.log(`   📊 نوع البيانات: ${typeof meeting.participantFreelancerIds}`);
            console.log(`   📊 هل هو array: ${Array.isArray(meeting.participantFreelancerIds)}`);
            
            if (Array.isArray(meeting.participantFreelancerIds)) {
                console.log(`   📊 عدد العناصر: ${meeting.participantFreelancerIds.length}`);
                meeting.participantFreelancerIds.forEach((id, idx) => {
                    console.log(`   📊 العنصر ${idx}: "${id}" (نوع: ${typeof id})`);
                    console.log(`   📊 هل يساوي FRE-340255: ${id === freelancerId}`);
                });
            }
        }

        // 4. إنشاء اجتماع تجريبي جديد
        console.log('\n➕ 4. إنشاء اجتماع تجريبي جديد:');
        const testMeeting = new FreelancerMeeting({
            subject: 'اجتماع تجريبي - اختبار النظام',
            type: 'visio',
            date: '2025-09-28',
            startTime: '14:00',
            endTime: '15:00',
            timezone: 'Africa/Tunis',
            meetingLink: 'https://meet.google.com/debug-test',
            withWhom: 'فريق التطوير',
            participantFreelancerIds: ['FRE-340255'],
            agenda: ['اختبار النظام', 'فحص المشكلة'],
            notes: 'اجتماع تجريبي لفحص المشكلة',
            status: 'scheduled',
            outcome: 'pending'
        });

        const savedMeeting = await testMeeting.save();
        console.log(`✅ تم إنشاء اجتماع تجريبي بنجاح: ${savedMeeting._id}`);

        // 5. البحث مرة أخرى بعد الإنشاء
        console.log('\n🔍 5. البحث مرة أخرى بعد إنشاء الاجتماع التجريبي:');
        const newSearch = await FreelancerMeeting.find({
            participantFreelancerIds: { $in: [freelancerId] }
        });
        console.log(`📊 نتائج البحث الجديد: ${newSearch.length} اجتماع`);
        
        newSearch.forEach((meeting, index) => {
            console.log(`\n🔸 اجتماع ${index + 1}:`);
            console.log(`   📝 الموضوع: ${meeting.subject}`);
            console.log(`   📅 التاريخ: ${meeting.date}`);
            console.log(`   👥 المشاركون: ${JSON.stringify(meeting.participantFreelancerIds)}`);
        });

        // 6. اختبار API route محلياً
        console.log('\n🧪 6. محاكاة API route:');
        const apiResult = await FreelancerMeeting.find({
            participantFreelancerIds: { $in: [freelancerId] }
        }).sort({ date: 1, startTime: 1 });
        
        console.log(`📊 نتيجة محاكاة API: ${apiResult.length} اجتماع`);
        console.log('📋 البيانات التي ستُرسل للفريلانسر:');
        console.log(JSON.stringify(apiResult, null, 2));

    } catch (error) {
        console.error('❌ خطأ:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 تم قطع الاتصال بقاعدة البيانات');
    }
}

// تشغيل الفحص
debugMeetingIssue();
