// Admin statistics computation
export interface AdminStats {
  activeProjects: number;
  totalProjects: number;
  completedProjects: number;
  totalRevenue: number;
  averageRating: number;
  successRate: number; // completed / totalProjects
}

import { getRevenue } from './revenueStore';

export const computeAdminStats = (): AdminStats => {
  // Notifications system disabled - using default values
  const accepted = 0;
  const removed = 0;
  const revenue = getRevenue();
  const ratings: number[] = [];

  const active = Math.max(accepted - removed, 0);
  const total = active + removed;
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const successRate = total > 0 ? (removed / total) * 100 : 0;

  return {
    activeProjects: active,
    totalProjects: total,
    completedProjects: removed,
    totalRevenue: revenue,
    averageRating: avgRating,
    successRate: successRate,
  };
};

// Cards used by the Admin Dashboard UI
export interface StatCard {
  title: string;
  value: string | number;
  accent?: string; // optional Tailwind text color class
}

const formatEuro = (v: number): string =>
  Number(v || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

// Provide the cards expected by Dashboard.tsx
export const getDashboardCards = (): StatCard[] => {
  const s = computeAdminStats();
  return [
    { title: 'Projets actifs', value: s.activeProjects, accent: 'text-emerald-600' },
    { title: 'Projets terminés', value: s.completedProjects, accent: 'text-indigo-600' },
    { title: 'Taux de réussite', value: `${Math.round(s.successRate)}%`, accent: 'text-blue-600' },
    { title: 'Revenus totaux', value: formatEuro(s.totalRevenue), accent: 'text-amber-600' },
  ];
};
