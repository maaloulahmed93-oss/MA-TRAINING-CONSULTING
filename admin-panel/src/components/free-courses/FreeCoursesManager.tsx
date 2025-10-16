import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2, BookOpen, Clock } from 'lucide-react';

interface CourseModule {
  id: number;
  title: string;
  duration: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  modules: CourseModule[];
}

interface Domain {
  id: string;
  title: string;
  icon: string;
  description: string;
  courses: Course[];
}

// Embedded courses data - no external imports
const coursesDatabase = {
  domains: [
    {
      id: 'marketing',
      title: 'Marketing Digital',
      icon: '📊',
      description: 'Stratégies marketing modernes et efficaces',
      courses: [
        {
          id: 'marketing-digital-basics',
          title: 'Marketing Digital - Les Bases',
          description: 'Apprenez les fondamentaux du marketing digital',
          modules: [
            { id: 1, title: 'Introduction au Marketing Digital', duration: '45 min' },
            { id: 2, title: 'SEO et Référencement', duration: '60 min' },
            { id: 3, title: 'Réseaux Sociaux', duration: '50 min' }
          ]
        },
        {
          id: 'content-marketing',
          title: 'Content Marketing',
          description: 'Créez du contenu qui convertit',
          modules: [
            { id: 1, title: 'Stratégie de Contenu', duration: '40 min' },
            { id: 2, title: 'Création de Contenu Viral', duration: '55 min' }
          ]
        }
      ]
    },
    {
      id: 'business',
      title: 'Business & Entrepreneuriat',
      icon: '💼',
      description: 'Compétences entrepreneuriales essentielles',
      courses: [
        {
          id: 'startup-basics',
          title: 'Créer sa Startup',
          description: 'De l\'idée au lancement',
          modules: [
            { id: 1, title: 'Validation d\'Idée', duration: '50 min' },
            { id: 2, title: 'Business Model', duration: '45 min' }
          ]
        }
      ]
    }
  ],
  validAccessIds: ['DEMO2024', 'FREE-ACCESS', 'STUDENT-2024']
};

const FreeCoursesManager: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>(coursesDatabase.domains);
  const [expandedDomain, setExpandedDomain] = useState<string | null>('marketing');

  const toggleDomain = (domainId: string) => {
    setExpandedDomain(expandedDomain === domainId ? null : domainId);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Cours Gratuits</h1>
          <p className="text-gray-600 mt-2">Gérez vos domaines de formation et cours gratuits</p>
        </div>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <PlusCircle className="w-5 h-5" />
          Nouveau Domaine
        </button>
      </div>

      <div className="grid gap-6">
        {domains.map((domain) => (
          <div key={domain.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div 
              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleDomain(domain.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{domain.icon}</div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{domain.title}</h3>
                    <p className="text-gray-600 mt-1">{domain.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {domain.courses.length} cours
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {expandedDomain === domain.id && (
              <div className="border-t border-gray-200 bg-gray-50">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Cours du domaine</h4>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors text-sm">
                      <PlusCircle className="w-4 h-4" />
                      Nouveau Cours
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {domain.courses.map((course) => (
                      <div key={course.id} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{course.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {course.modules.length} modules
                          </div>
                          
                          <div className="space-y-1">
                            {course.modules.slice(0, 2).map((module) => (
                              <div key={module.id} className="text-xs text-gray-600 bg-gray-50 rounded px-2 py-1">
                                {module.title} - {module.duration}
                              </div>
                            ))}
                            {course.modules.length > 2 && (
                              <div className="text-xs text-gray-500 px-2">
                                +{course.modules.length - 2} autres modules...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {domains.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun domaine de cours</h3>
          <p className="text-gray-600 mb-6">Commencez par créer votre premier domaine de formation</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors mx-auto">
            <PlusCircle className="w-5 h-5" />
            Créer un Domaine
          </button>
        </div>
      )}
    </div>
  );
};

export default FreeCoursesManager;
