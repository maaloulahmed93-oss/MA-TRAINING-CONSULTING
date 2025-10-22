import React from 'react';

const FreeCoursesPage: React.FC = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cours Gratuits</h1>
        <p className="text-gray-600 mt-2">Gestion des cours gratuits et formations libres</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Gestion des Cours Gratuits
          </h2>
          <p className="text-gray-600 mb-6">
            Cette section permet de gérer les cours gratuits et formations libres disponibles sur la plateforme.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-800 text-sm">
              🚀 Fonctionnalités à venir : Ajout, modification et gestion des cours gratuits
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeCoursesPage;
