import React, { useState, useEffect } from 'react';
import { 
  getProjects, 
  getProjectsStats, 
  ExtendedProject 
} from '../services/partnershipProjectsService';

interface ProjectStats {
  total: number;
  inProgress: number;
  completed: number;
  planning: number;
  onHold: number;
  averageProgress: number;
}

const ProjectsTestPage: React.FC = () => {
  const [projects, setProjects] = useState<ExtendedProject[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test avec un partnerId fictif
    const testPartnerId = 'PARTNER123';
    
    console.log('🧪 Test du service des projets...');
    
    // Charger les projets
    const loadedProjects = getProjects(testPartnerId);
    setProjects(loadedProjects);
    
    // Charger les statistiques
    const projectStats = getProjectsStats(testPartnerId);
    setStats(projectStats);
    
    console.log('📊 Projets chargés:', loadedProjects);
    console.log('📈 Statistiques:', projectStats);
    
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des projets de test...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🧪 Test du Service des Projets
        </h1>

        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Total</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">En Cours</h3>
              <p className="text-3xl font-bold text-green-600">{stats.inProgress}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Terminés</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.completed}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Planification</h3>
              <p className="text-3xl font-bold text-yellow-600">{stats.planning}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-500">Progression Moy.</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.averageProgress}%</p>
            </div>
          </div>
        )}

        {/* Liste des projets */}
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{project.description}</p>
                  
                  {/* Barre de progression */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progression</span>
                      <span className="text-sm font-bold text-blue-600">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="ml-6">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    project.status === 'completed' ? 'bg-green-100 text-green-800' :
                    project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status === 'completed' ? 'Terminé' :
                     project.status === 'in_progress' ? 'En cours' :
                     project.status === 'planning' ? 'Planification' :
                     project.status}
                  </span>
                </div>
              </div>

              {/* Détails du projet */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Dates</h4>
                  <p className="text-sm text-gray-700">
                    Début: {new Date(project.startDate).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="text-sm text-gray-700">
                    Fin: {new Date(project.endDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Équipe</h4>
                  <p className="text-sm text-gray-700">
                    {project.participants.length} membres
                  </p>
                  {project.teamMembers && (
                    <div className="text-xs text-gray-500 mt-1">
                      {project.teamMembers.slice(0, 2).map((member, idx) => (
                        <div key={idx}>{member}</div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Budget</h4>
                  {project.budget && (
                    <p className="text-lg font-bold text-green-600">
                      {project.budget.toLocaleString('fr-FR')} €
                    </p>
                  )}
                </div>
              </div>

              {/* Milestones */}
              {project.milestones && project.milestones.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Milestones</h4>
                  <div className="space-y-2">
                    {project.milestones.map((milestone) => (
                      <div key={milestone.id} className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${
                          milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                        <div className="flex-1">
                          <span className={`text-sm ${
                            milestone.completed ? 'text-green-700 font-medium' : 'text-gray-600'
                          }`}>
                            {milestone.title}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            ({new Date(milestone.date).toLocaleDateString('fr-FR')})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Documents */}
              {project.documents && project.documents.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-3">Documents</h4>
                  <div className="flex flex-wrap gap-2">
                    {project.documents.map((doc) => (
                      <span key={doc.id} className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        📄 {doc.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              {project.contactEmail && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Contact: <span className="text-blue-600">{project.contactEmail}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Test localStorage */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            🔍 Test localStorage
          </h3>
          <p className="text-sm text-yellow-700 mb-4">
            Ouvrez les DevTools (F12) → Console pour voir les logs du service.
          </p>
          <p className="text-sm text-yellow-700">
            Les données sont automatiquement sauvegardées dans localStorage avec la clé: 
            <code className="bg-yellow-100 px-2 py-1 rounded">partnership_projects_PARTNER123</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectsTestPage;
