import React from "react";
import { mockFreelancerStats, mockJobOffers, mockProjects, mockMeetings, mockDeliverables } from "../services/freelancerData";
import { FaProjectDiagram, FaEuroSign, FaStar, FaCheckCircle, FaRocket, FaRegCalendarCheck, FaTasks, FaLightbulb } from "react-icons/fa";

const DashboardOverviewAr: React.FC = () => {
  const nextMeeting = mockMeetings.find(m => m.status === "scheduled");
  const lastDeliverable = mockDeliverables.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0];

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4" dir="rtl" lang="ar">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-1 flex items-center gap-2">
            <FaRocket className="text-indigo-500 animate-bounce" /> لوحة تحكم المستقل
          </h2>
          <p className="text-gray-500">نظرة شاملة على نشاطك وإمكانية وصول سريعة إلى مهامك.</p>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border-t-4 border-indigo-500">
          <FaProjectDiagram className="text-2xl text-indigo-500 mb-2" />
          <span className="text-lg font-semibold">{mockFreelancerStats.activeProjects} مشاريع نشطة</span>
          <span className="text-xs text-gray-400">الإجمالي: {mockFreelancerStats.totalProjects}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border-t-4 border-green-500">
          <FaEuroSign className="text-2xl text-green-500 mb-2" />
          <span className="text-lg font-semibold">{mockFreelancerStats.monthlyEarnings} د.ت</span>
          <span className="text-xs text-gray-400">هذا الشهر</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border-t-4 border-yellow-400">
          <FaStar className="text-2xl text-yellow-400 mb-2" />
          <span className="text-lg font-semibold">{mockFreelancerStats.averageRating} / 5</span>
          <span className="text-xs text-gray-400">متوسط التقييم</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border-t-4 border-blue-500">
          <FaCheckCircle className="text-2xl text-blue-500 mb-2" />
          <span className="text-lg font-semibold">{mockFreelancerStats.successRate}%</span>
          <span className="text-xs text-gray-400">نسبة النجاح</span>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-indigo-50 rounded-lg p-4 flex items-center gap-4">
          <FaTasks className="text-2xl text-indigo-400" />
          <div>
            <div className="font-semibold">عروض جديدة</div>
            <div className="text-sm text-gray-500">{mockJobOffers.filter(o => o.status === "pending").length} عروض في انتظارك</div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 flex items-center gap-4">
          <FaRegCalendarCheck className="text-2xl text-green-400" />
          <div>
            <div className="font-semibold">موعدك القادم</div>
            <div className="text-sm text-gray-500">{nextMeeting ? `${nextMeeting.title} في ${nextMeeting.date} على الساعة ${nextMeeting.time}` : "لا يوجد مواعيد قادمة"}</div>
          </div>
        </div>
      </div>

      {/* Dernier livrable */}
      <div className="bg-yellow-50 rounded-lg p-4 flex items-center gap-4 mb-8">
        <FaCheckCircle className="text-2xl text-yellow-400" />
        <div>
          <div className="font-semibold">آخر تسليم مطلوب</div>
          <div className="text-sm text-gray-500">{lastDeliverable ? `${lastDeliverable.title} (الموعد النهائي: ${lastDeliverable.dueDate})` : "لا يوجد تسليمات معلقة"}</div>
        </div>
      </div>

      {/* Conseil du jour */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 mb-8 border-l-4 border-yellow-400">
        <FaLightbulb className="text-2xl text-yellow-400 animate-pulse" />
        <span className="text-sm text-gray-700">قم بتحديث ملفك الشخصي ومهاراتك لجذب المزيد من العملاء!</span>
      </div>
    </div>
  );
};

export default DashboardOverviewAr;
