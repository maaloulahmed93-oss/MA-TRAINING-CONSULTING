export interface AdminStats {
  activeProjects: number;
  totalProjects: number;
  completedProjects: number;
  totalRevenue: number; // sum of budgets of completed projects
  avgRating: number; // from deliverables ratings
  successRate: number; // completed / totalProjects
}

import { getNotifications, AdminNotification } from './adminNotifications';
import { getRevenue } from './revenueStore';

type OfferAcceptedPayload = {
  event: 'offer_accepted';
  projectId: string;
  projectTitle: string;
  client: string;
  budget?: number;
};

type ProjectRemovedPayload = {
  event: 'project_removed';
  projectId: string;
  projectTitle: string;
  client: string;
  budget?: number;
};

type DeliverableSubmittedPayload = {
  event: 'deliverable_submitted';
  projectId: string;
  projectTitle: string;
  rating?: number;
};

type KnownPayload = OfferAcceptedPayload | ProjectRemovedPayload | DeliverableSubmittedPayload;

const isPayload = (p: unknown): p is KnownPayload => {
  return (
    !!p && typeof p === 'object' && 'event' in (p as Record<string, unknown>)
  );
};

export const computeAdminStats = (): AdminStats => {
  const list = getNotifications();
  let accepted = 0;
  let removed = 0;
  const revenue = getRevenue();
  const ratings: number[] = [];

  for (const n of list as AdminNotification[]) {
    const payload = isPayload(n.payload) ? n.payload : undefined;
    const ev = payload?.event;
    if (!ev) continue;
    if (ev === 'offer_accepted') {
      accepted += 1;
    } else if (ev === 'project_removed') {
      removed += 1;
      // Optionally align revenue to sum of completed budgets if admin hasn't set revenue manually.
      // We won't change revenue here because it's sourced from the admin panel store.
    } else if (ev === 'deliverable_submitted') {
      const rating = payload?.rating;
      if (typeof rating === 'number' && rating > 0) ratings.push(rating);
    }
  }

  const active = Math.max(accepted - removed, 0);
  const total = active + removed;
  const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const successRate = total > 0 ? (removed / total) * 100 : 0;

  return {
    activeProjects: active,
    totalProjects: total,
    completedProjects: removed,
    totalRevenue: revenue,
    avgRating,
    successRate,
  };
};

export type StatCard = {
  title: string;
  value: string;
  accent?: string; // tailwind color class
};

export const getDashboardCards = (): StatCard[] => {
  const s = computeAdminStats();
  return [
    { title: 'Projets Actifs', value: String(s.activeProjects) },
    { title: 'Revenus Totaux', value: `${s.totalRevenue.toLocaleString()} €`, accent: 'text-orange-600' },
    { title: 'Note Moyenne', value: `${s.avgRating.toFixed(1)}/5` },
    { title: 'Taux de Réussite', value: `${s.successRate.toFixed(0)}%` },
    { title: 'Projets totaux', value: String(s.totalProjects) },
    { title: 'Terminés', value: String(s.completedProjects) },
  ];
};
