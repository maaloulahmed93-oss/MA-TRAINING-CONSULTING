import React, { useState, useEffect } from 'react';
import ProgrammeManager from './ProgrammeManager';
import SeanceManager from './SeanceManager';
import ParticipantManager from './ParticipantManager';
import EvenementManager from './EvenementManager';
import { formateurProgrammeService } from '../../services/formateurProgrammeService';

interface FormateurDashboardProps {
  formateurId: string;
  formateurName: string;
}

const FormateurDashboard: React.FC<FormateurDashboardProps> = ({ formateurId, formateurName }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    programmes: 0,
    seances: 0,
    participants: 0,
    evenements: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [formateurId]);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques en parallèle
      const [programmesRes, seancesRes, participantsRes, evenementsRes] = await Promise.all([
        formateurProgrammeService.getProgrammes(formateurId, { limit: 1 }),
        formateurProgrammeService.getSeances(formateurId, { limit: 1 }),
        formateurProgrammeService.getParticipants(formateurId, { limit: 1 }),
        formateurProgrammeService.getEvenements(formateurId, { limit: 1 })
      ]);

      setStats({
        programmes: programmesRes.pagination?.total || 0,
        seances: seancesRes.pagination?.total || 0,
        participants: participantsRes.pagination?.total || 0,
        evenements: evenementsRes.pagination?.total || 0
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'programmes', label: 'Programmes', icon: '📚' },
    { id: 'seances', label: 'Séances', icon: '🎓' },
    { id: 'participants', label: 'Participants', icon: '👥' },
    { id: 'evenements', label: 'Événements', icon: '📅' }
  ];

  const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Programmes"
          value={stats.programmes}
          icon="📚"
          color="hover:shadow-md transition-shadow"
        />
        <StatCard
          title="Séances"
          value={stats.seances}
          icon="🎓"
          color="hover:shadow-md transition-shadow"
        />
        <StatCard
          title="Participants"
          value={stats.participants}
          icon="👥"
          color="hover:shadow-md transition-shadow"
        />
        <StatCard
          title="Événements"
          value={stats.evenements}
          icon="📅"
          color="hover:shadow-md transition-shadow"
        />
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab('programmes')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📚</div>
              <div className="text-sm font-medium text-gray-700">Nouveau Programme</div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('seances')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🎓</div>
              <div className="text-sm font-medium text-gray-700">Nouvelle Séance</div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('participants')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👥</div>
              <div className="text-sm font-medium text-gray-700">Nouveau Participant</div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('evenements')}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📅</div>
              <div className="text-sm font-medium text-gray-700">Nouvel Événement</div>
            </div>
          </button>
        </div>
      </div>

      {/* Informations utiles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Bienvenue dans votre espace</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• <strong>Programmes :</strong> Créez et gérez vos formations</p>
            <p>• <strong>Séances :</strong> Planifiez vos cours et modules</p>
            <p>• <strong>Participants :</strong> Suivez vos apprenants</p>
            <p>• <strong>Événements :</strong> Organisez votre agenda</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Conseils</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>• Commencez par créer un programme</p>
            <p>• Ajoutez des séances à vos programmes</p>
            <p>• Inscrivez des participants</p>
            <p>• Planifiez vos événements</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Espace Formateur
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Bienvenue, {formateurName} ({formateurId})
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && activeTab === 'overview' ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Chargement de votre tableau de bord...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'programmes' && <ProgrammeManager formateurId={formateurId} />}
            {activeTab === 'seances' && <SeanceManager formateurId={formateurId} />}
            {activeTab === 'participants' && <ParticipantManager formateurId={formateurId} />}
            {activeTab === 'evenements' && <EvenementManager formateurId={formateurId} />}
          </>
        )}
      </div>
    </div>
  );
};

export default FormateurDashboard;
