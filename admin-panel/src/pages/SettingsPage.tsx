import React from 'react';
import { Link } from 'react-router-dom';
import {
  CogIcon,
  PaintBrushIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { ROUTES } from '../config/routes';

const SettingsPage: React.FC = () => {
  const settingsPages = [
    {
      name: 'Configuration Site',
      description: 'Nom du site, logo, informations générales',
      href: ROUTES.SITE_CONFIG,
      icon: CogIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Apparence',
      description: 'Couleurs, thème, personnalisation visuelle',
      href: ROUTES.APPEARANCE,
      icon: PaintBrushIcon,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="mt-2 text-gray-600">Configurez votre site web</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {settingsPages.map((page) => {
          const Icon = page.icon;
          return (
            <Link
              key={page.name}
              to={page.href}
              className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow group"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`${page.color} p-3 rounded-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {page.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {page.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SettingsPage;
