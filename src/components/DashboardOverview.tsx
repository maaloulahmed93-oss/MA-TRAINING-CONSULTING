import React from "react";
import { mockFreelancerStats, mockJobOffers, mockProjects, mockMeetings, mockDeliverables } from "../services/freelancerData";
import { FaProjectDiagram, FaEuroSign, FaStar, FaCheckCircle, FaRocket, FaRegCalendarCheck, FaTasks, FaLightbulb } from "react-icons/fa";

const DashboardOverview: React.FC = () => {
  // Suivi des données mock
  console.log('Stats:', mockFreelancerStats);
  console.log('Job Offers:', mockJobOffers);
  console.log('Meetings:', mockMeetings);
  console.log('Deliverables:', mockDeliverables);
  const nextMeeting = mockMeetings.find(m => m.status === "scheduled");
  const lastDeliverable = mockDeliverables.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())[0];

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

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border-t-4 border-indigo-500">
          <FaProjectDiagram className="text-2xl text-indigo-500 mb-2" />
          <span className="text-lg font-semibold">{mockFreelancerStats.activeProjects} projets actifs</span>
          <span className="text-xs text-gray-400">Total: {mockFreelancerStats.totalProjects}</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border-t-4 border-green-500">
          <FaEuroSign className="text-2xl text-green-500 mb-2" />
          <span className="text-lg font-semibold">{mockFreelancerStats.monthlyEarnings} €</span>
          <span className="text-xs text-gray-400">Ce mois-ci</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border-t-4 border-yellow-400">
          <FaStar className="text-2xl text-yellow-400 mb-2" />
          <span className="text-lg font-semibold">{mockFreelancerStats.averageRating} / 5</span>
          <span className="text-xs text-gray-400">Note moyenne</span>
        </div>
        <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center border-t-4 border-blue-500">
          <FaCheckCircle className="text-2xl text-blue-500 mb-2" />
          <span className="text-lg font-semibold">{mockFreelancerStats.successRate}%</span>
          <span className="text-xs text-gray-400">Taux de réussite</span>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-indigo-50 rounded-lg p-4 flex items-center gap-4">
          <FaTasks className="text-2xl text-indigo-400" />
          <div>
            <div className="font-semibold">Nouvelles offres</div>
            <div className="text-sm text-gray-500">{mockJobOffers.filter(o => o.status === "pending").length} offres à découvrir</div>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 flex items-center gap-4">
          <FaRegCalendarCheck className="text-2xl text-green-400" />
          <div>
            <div className="font-semibold">Prochain rendez-vous</div>
            <div className="text-sm text-gray-500">{nextMeeting ? `${nextMeeting.title} le ${nextMeeting.date} à ${nextMeeting.time}` : "Aucun rendez-vous à venir"}</div>
          </div>
        </div>
      </div>

      {/* Dernier livrable */}
      <div className="bg-yellow-50 rounded-lg p-4 flex items-center gap-4 mb-8">
        <FaCheckCircle className="text-2xl text-yellow-400" />
        <div>
          <div className="font-semibold">Dernier livrable à soumettre</div>
          <div className="text-sm text-gray-500">{lastDeliverable ? `${lastDeliverable.title} (Deadline: ${lastDeliverable.dueDate})` : "Aucun livrable en attente"}</div>
        </div>
      </div>

      {/* Conseil du jour */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center gap-4 mb-8 border-l-4 border-yellow-400">
        <FaLightbulb className="text-2xl text-yellow-400 animate-pulse" />
        <span className="text-sm text-gray-700">Optimisez votre profil et mettez à jour vos compétences pour attirer plus de clients !</span>
      </div>
    </div>
  );
};

export default DashboardOverview;
