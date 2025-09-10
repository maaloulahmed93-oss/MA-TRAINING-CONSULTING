import React from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  HomeIcon,
  InformationCircleIcon,
  PhoneIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { ROUTES } from '../config/routes';

/**
 * Static Pages Management Page
 * Overview of all static pages
 */
const StaticPagesPage: React.FC = () => {
  const staticPages = [
    {
      name: 'Section Hero',
      description: 'Gérez le contenu de la page d\'accueil principale',
      href: ROUTES.HERO_SECTION,
      icon: HomeIcon,
      color: 'bg-blue-500',
      lastUpdated: '2024-01-20',
    },
    {
      name: 'Section À Propos',
      description: 'Modifiez les informations sur votre entreprise',
      href: ROUTES.ABOUT_SECTION,
      icon: InformationCircleIcon,
      color: 'bg-green-500',
      lastUpdated: '2024-01-18',
    },
    {
      name: 'Section Contact',
      description: 'Gérez les informations de contact et formulaire',
      href: ROUTES.CONTACT_SECTION,
      icon: PhoneIcon,
      color: 'bg-purple-500',
      lastUpdated: '2024-01-15',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pages Statiques</h1>
        <p className="mt-2 text-gray-600">
          Gérez le contenu de vos pages statiques
        </p>
      </div>

      {/* Overview Stats */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600">3</div>
            <div className="text-sm text-gray-500">Pages disponibles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">3</div>
            <div className="text-sm text-gray-500">Pages configurées</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">100%</div>
            <div className="text-sm text-gray-500">Taux de completion</div>
          </div>
        </div>
      </div>

      {/* Pages Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {staticPages.map((page) => {
          const Icon = page.icon;
          return (
            <Link
              key={page.name}
              to={page.href}
              className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`${page.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {page.name}
                      </h3>
                    </div>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4">
                  {page.description}
                </p>

                {/* Last Updated */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Configuré
                  </span>
                  <span className="text-xs text-gray-500">
                    Mis à jour le {page.lastUpdated}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Actions Rapides</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Exporter le contenu
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <DocumentTextIcon className="h-5 w-5 mr-2" />
              Importer le contenu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticPagesPage;
