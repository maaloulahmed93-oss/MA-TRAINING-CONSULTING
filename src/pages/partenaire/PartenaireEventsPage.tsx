import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';

const PartenaireEventsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/espace-partenariat"
              className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour au tableau de bord</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Événements & Séminaires
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-12">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-purple-600" />
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Événements & Séminaires
            </h2>
            
            <p className="text-lg text-gray-600 mb-8">
              Cette section sera bientôt disponible avec toutes les fonctionnalités 
              d'organisation et gestion de vos événements en partenariat.
            </p>
            
            <div className="bg-purple-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Fonctionnalités à venir :
              </h3>
              <ul className="text-purple-800 space-y-2">
                <li>• Calendrier des événements à venir</li>
                <li>• Organisation de séminaires et webinaires</li>
                <li>• Gestion des inscriptions et participants</li>
                <li>• Matériel de promotion et communication</li>
                <li>• Rapports post-événement et statistiques</li>
              </ul>
            </div>
            
            <Link
              to="/espace-partenariat"
              className="inline-flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour au tableau de bord</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartenaireEventsPage;
