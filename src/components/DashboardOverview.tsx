import React, { useState, useEffect } from "react";
import { mockFreelancerStats, mockJobOffers, mockMeetings, mockDeliverables } from "../services/freelancerData";
import { getRealtimeScore, FreelancerScore, getPerformanceRating } from "../services/freelancerScoring";
import { FaProjectDiagram, FaEuroSign, FaStar, FaCheckCircle, FaRocket, FaRegCalendarCheck, FaTasks, FaLightbulb, FaTrophy } from "react-icons/fa";

const DashboardOverview: React.FC = () => {
  const [score, setScore] = useState<FreelancerScore | null>(null);
  const [loading, setLoading] = useState(true);

  // تحميل السكور الديناميكي
  useEffect(() => {
    const loadScore = async () => {
      try {
        setLoading(true);
        console.log('🎯 تحميل السكور الديناميكي...');
        const freelancerScore = await getRealtimeScore();
        setScore(freelancerScore);
        console.log('✅ تم تحميل السكور بنجاح:', freelancerScore);
      } catch (error) {
        console.error('❌ خطأ في تحميل السكور:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScore();
  }, []);

  // Suivi des données mock
  console.log('Stats:', mockFreelancerStats);
  console.log('Job Offers:', mockJobOffers);
  console.log('Meetings:', mockMeetings);
  console.log('Deliverables:', mockDeliverables);
  const nextMeeting = mockMeetings.find(m => m.status === "scheduled");
  const lastDeliverable = mockDeliverables.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0];

  // حساب السكور للعرض (استخدام السكور الديناميكي أو القيمة الافتراضية)
  const displayScore = score ? score.scorePercentage : mockFreelancerStats.successRate;
  const performanceRating = getPerformanceRating(displayScore);

  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-1 flex items-center gap-2">
            <FaRocket className="text-indigo-500 animate-bounce" /> Tableau de bord Freelancer
          </h2>
          <p className="text-gray-500">Aperçu global de votre activité et accès rapide à vos missions.</p>
        </div>
      </div>


      {/* Détail du Score (si disponible) */}
      {score && !loading && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8 border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-500 rounded-full p-3">
              <FaTrophy className="text-2xl text-white" />
            </div>
            <div>
              <h3 className="font-bold text-purple-800 text-lg">Détail du Score</h3>
              <p className="text-sm text-purple-600">{performanceRating.description}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">+{score.breakdown.acceptedOffers.points}</div>
              <div className="text-xs text-gray-600">{score.breakdown.acceptedOffers.count} Offres acceptées</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">+{score.breakdown.completedProjects.points}</div>
              <div className="text-xs text-gray-600">{score.breakdown.completedProjects.count} Projets terminés</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{score.breakdown.refusedMeetings.points}</div>
              <div className="text-xs text-gray-600">{score.breakdown.refusedMeetings.count} Réunions refusées</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">{score.breakdown.pendingOffers.points}</div>
              <div className="text-xs text-gray-600">{score.breakdown.pendingOffers.count} Offres en attente</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">{score.breakdown.refusedOffers.points}</div>
              <div className="text-xs text-gray-600">{score.breakdown.refusedOffers.count} Offres refusées</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-purple-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-purple-700">Score Total:</span>
              <span className="text-xl font-bold text-purple-800">{score.totalScore}/{score.maxPossibleScore} points</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardOverview;
