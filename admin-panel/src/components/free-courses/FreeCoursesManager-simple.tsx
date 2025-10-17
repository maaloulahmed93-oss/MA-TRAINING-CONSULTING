import React, { useState } from 'react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

// Simple courses data without external dependencies
const simpleCourses = {
  domains: [
    {
      id: 'marketing',
      title: 'Marketing',
      icon: '📊',
      description: 'Stratégies marketing modernes',
      courses: [
        {
          id: 'marketing-digital',
          title: 'Marketing Digital Avancé',
          description: 'Maîtrisez les outils du marketing digital moderne',
          modules: [
            { id: 1, title: 'Introduction au Marketing Digital', duration: '45 min' },
            { id: 2, title: 'Stratégies SEO et SEM', duration: '60 min' }
          ]
        }
      ]
    }
  ],
  validAccessIds: ['DEMO2024', 'FREE-ACCESS']
};

const FreeCoursesManager: React.FC = () => {
  const [domains, setDomains] = useState(simpleCourses.domains);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Cours Gratuits</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <PlusCircle className="w-4 h-4" />
          Nouveau Domaine
        </button>
      </div>

      <div className="space-y-4">
        {domains.map((domain) => (
          <div key={domain.id} className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{domain.icon}</span>
                <div>
                  <h3 className="font-semibold text-lg">{domain.title}</h3>
                  <p className="text-gray-600 text-sm">{domain.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {domain.courses.map((course) => (
                <div key={course.id} className="bg-gray-50 rounded p-3">
                  <h4 className="font-medium">{course.title}</h4>
                  <p className="text-sm text-gray-600">{course.description}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    {course.modules.length} modules
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FreeCoursesManager;
