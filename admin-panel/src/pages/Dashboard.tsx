import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { getDashboardCards, StatCard } from '../data/adminStats';

const Dashboard: React.FC = () => {
  const [cards, setCards] = useState<StatCard[]>(getDashboardCards());

  useEffect(() => {
    const i = setInterval(() => setCards(getDashboardCards()), 1000);
    return () => clearInterval(i);
  }, []);

  

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-sm text-gray-500">Statistiques en temps réel du Freelancer.</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-4">
            <p className="text-sm text-gray-600">{c.title}</p>
            <p className={`mt-2 text-2xl font-bold ${c.accent || 'text-gray-900'}`}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Actions Rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to={ROUTES.USERS}
            className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700"
          >
            Gérer les Utilisateurs
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
