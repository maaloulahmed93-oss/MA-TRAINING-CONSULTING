// Commercial Data Service
// Handles mock data, points, levels, commissions, and sales for commercial users

export interface CommercialUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  points: number;
  level: number;
  commission: number;
  totalSales: number;
  salesCount: number;
  joinDate: string;
  lastActivity: string;
  sales: Sale[];
  achievements: Achievement[];
}

export interface Sale {
  id: string;
  client: string;
  clientEmail: string;
  program: string;
  amount: number;
  commission: number;
  status: 'Paid' | 'Pending' | 'Cancelled';
  date: string;
  paymentMethod: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  level: number;
}

export interface TrainingProgram {
  id: string;
  name: string;
  category: string;
  description: string;
  publicPrice: number;
  level1Price: number;
  level2Price: number;
  level3Price: number;
  level4Price: number;
  commission: number;
  duration: string;
  rating: number;
  studentsCount: number;
}

// Custom program/service defined by partner (manual commission/economy)
export interface CustomProgram {
  id: string;
  name: string;
  publicPrice: number;    // prix public
  partnerPrice: number;   // prix partenaire ("votre prix")
  commission: number;     // commission fixe (saisie manuelle)
  category?: string;
  description?: string;
  duration?: string;
}

// Mock training programs
const trainingPrograms: TrainingProgram[] = [
  {
    id: 'prog-001',
    name: 'Développement Web Full Stack',
    category: 'Développement',
    description: 'Formation complète en développement web moderne avec React, Node.js et MongoDB',
    publicPrice: 1200,
    level1Price: 1080, // 10% discount
    level2Price: 960,  // 20% discount
    level3Price: 840,  // 30% discount
    level4Price: 720,  // 40% discount
    commission: 120,   // 10% commission
    duration: '3 mois',
    rating: 4.8,
    studentsCount: 245
  },
  {
    id: 'prog-002',
    name: 'Marketing Digital Avancé',
    category: 'Marketing',
    description: 'Stratégies marketing digitales, SEO, réseaux sociaux et analytics',
    publicPrice: 800,
    level1Price: 720,  // 10% discount
    level2Price: 640,  // 20% discount
    level3Price: 560,  // 30% discount
    level4Price: 480,  // 40% discount
    commission: 80,    // 10% commission
    duration: '2 mois',
    rating: 4.6,
    studentsCount: 189
  },
  {
    id: 'prog-003',
    name: 'Design UX/UI Professionnel',
    category: 'Design',
    description: 'Conception d\'interfaces utilisateur modernes et expérience utilisateur optimale',
    publicPrice: 950,
    level1Price: 855,  // 10% discount
    level2Price: 760,  // 20% discount
    level3Price: 665,  // 30% discount
    level4Price: 570,  // 40% discount
    commission: 95,    // 10% commission
    duration: '2.5 mois',
    rating: 4.7,
    studentsCount: 156
  },
  {
    id: 'prog-004',
    name: 'Data Science & IA',
    category: 'Data Science',
    description: 'Analyse de données, machine learning et intelligence artificielle',
    publicPrice: 1500,
    level1Price: 1350, // 10% discount
    level2Price: 1200, // 20% discount
    level3Price: 1050, // 30% discount
    level4Price: 900,  // 40% discount
    commission: 150,   // 10% commission
    duration: '4 mois',
    rating: 4.9,
    studentsCount: 98
  },
  {
    id: 'prog-005',
    name: 'Gestion de Projet Agile',
    category: 'Management',
    description: 'Méthodologies agiles, Scrum, Kanban et leadership d\'équipe',
    publicPrice: 700,
    level1Price: 630,  // 10% discount
    level2Price: 560,  // 20% discount
    level3Price: 490,  // 30% discount
    level4Price: 420,  // 40% discount
    commission: 70,    // 10% commission
    duration: '1.5 mois',
    rating: 4.5,
    studentsCount: 203
  }
];

// Mock commercial users data
const mockCommercialUsers: { [key: string]: CommercialUser } = {
  'COMM123': {
    id: 'COMM123',
    name: 'Ahmed Ben Salah',
    email: 'ahmed.bensalah@email.com',
    phone: '+216 98 765 432',
    points: 1800,
    level: 2,
    commission: 2850,
    totalSales: 28500,
    salesCount: 15,
    joinDate: '2023-08-15',
    lastActivity: '2024-02-01',
    sales: [
      {
        id: 'sale-001',
        client: 'TechCorp SARL',
        clientEmail: 'contact@techcorp.tn',
        program: 'Développement Web Full Stack',
        amount: 1200,
        commission: 120,
        status: 'Paid',
        date: '2024-01-28',
        paymentMethod: 'Virement bancaire'
      },
      {
        id: 'sale-002',
        client: 'Digital Agency',
        clientEmail: 'info@digitalagency.com',
        program: 'Marketing Digital Avancé',
        amount: 800,
        commission: 80,
        status: 'Paid',
        date: '2024-01-25',
        paymentMethod: 'Carte bancaire'
      },
      {
        id: 'sale-003',
        client: 'StartupXYZ',
        clientEmail: 'team@startupxyz.com',
        program: 'Design UX/UI Professionnel',
        amount: 950,
        commission: 95,
        status: 'Pending',
        date: '2024-02-01',
        paymentMethod: 'PayPal'
      }
    ],
    achievements: [
      {
        id: 'ach-001',
        title: 'Premier Niveau',
        description: 'Atteint le niveau 1 avec 1000 points',
        icon: '🥉',
        unlockedAt: '2023-10-15',
        level: 1
      },
      {
        id: 'ach-002',
        title: 'Deuxième Niveau',
        description: 'Atteint le niveau 2 avec 1500 points',
        icon: '🥈',
        unlockedAt: '2024-01-10',
        level: 2
      }
    ]
  },
  'COMM456': {
    id: 'COMM456',
    name: 'Fatima El Mansouri',
    email: 'fatima.elmansouri@email.com',
    phone: '+212 66 543 210',
    points: 2450,
    level: 3,
    commission: 4200,
    totalSales: 42000,
    salesCount: 22,
    joinDate: '2023-06-20',
    lastActivity: '2024-01-30',
    sales: [
      {
        id: 'sale-004',
        client: 'InnovTech',
        clientEmail: 'contact@innovtech.ma',
        program: 'Data Science & IA',
        amount: 1500,
        commission: 150,
        status: 'Paid',
        date: '2024-01-20',
        paymentMethod: 'Virement bancaire'
      },
      {
        id: 'sale-005',
        client: 'ConsultPro',
        clientEmail: 'info@consultpro.com',
        program: 'Gestion de Projet Agile',
        amount: 700,
        commission: 70,
        status: 'Paid',
        date: '2024-01-18',
        paymentMethod: 'Chèque'
      }
    ],
    achievements: [
      {
        id: 'ach-003',
        title: 'Troisième Niveau',
        description: 'Atteint le niveau 3 avec 2000 points',
        icon: '🥇',
        unlockedAt: '2024-01-05',
        level: 3
      }
    ]
  },
  'COMMERCIAL789': {
    id: 'COMMERCIAL789',
    name: 'Omar Rachidi',
    email: 'omar.rachidi@email.com',
    phone: '+213 55 432 109',
    points: 950,
    level: 1,
    commission: 1580,
    totalSales: 15800,
    salesCount: 8,
    joinDate: '2023-11-10',
    lastActivity: '2024-01-29',
    sales: [
      {
        id: 'sale-006',
        client: 'EduCenter',
        clientEmail: 'admin@educenter.dz',
        program: 'Marketing Digital Avancé',
        amount: 800,
        commission: 80,
        status: 'Paid',
        date: '2024-01-15',
        paymentMethod: 'Carte bancaire'
      }
    ],
    achievements: [
      {
        id: 'ach-004',
        title: 'Premier Niveau',
        description: 'Atteint le niveau 1 avec 1000 points',
        icon: '🥉',
        unlockedAt: '2024-01-12',
        level: 1
      }
    ]
  },
  'AFFILIATE2024': {
    id: 'AFFILIATE2024',
    name: 'Leila Benali',
    email: 'leila.benali@email.com',
    phone: '+216 22 876 543',
    points: 3200,
    level: 4,
    commission: 6750,
    totalSales: 67500,
    salesCount: 35,
    joinDate: '2023-03-01',
    lastActivity: '2024-02-02',
    sales: [
      {
        id: 'sale-007',
        client: 'MegaCorp',
        clientEmail: 'training@megacorp.com',
        program: 'Développement Web Full Stack',
        amount: 1200,
        commission: 120,
        status: 'Paid',
        date: '2024-01-30',
        paymentMethod: 'Virement bancaire'
      },
      {
        id: 'sale-008',
        client: 'CreativeStudio',
        clientEmail: 'hello@creativestudio.com',
        program: 'Design UX/UI Professionnel',
        amount: 950,
        commission: 95,
        status: 'Paid',
        date: '2024-01-28',
        paymentMethod: 'PayPal'
      }
    ],
    achievements: [
      {
        id: 'ach-005',
        title: 'Niveau Expert',
        description: 'Atteint le niveau 4 - Statut Expert',
        icon: '👑',
        unlockedAt: '2023-12-20',
        level: 4
      }
    ]
  },
  'DEMO-COMM': {
    id: 'DEMO-COMM',
    name: 'Utilisateur Démo',
    email: 'demo@example.com',
    phone: '+000 00 000 000',
    points: 1250,
    level: 2,
    commission: 1850,
    totalSales: 18500,
    salesCount: 10,
    joinDate: '2024-01-01',
    lastActivity: '2024-02-02',
    sales: [
      {
        id: 'sale-demo',
        client: 'Client Démo',
        clientEmail: 'client@demo.com',
        program: 'Formation Démo',
        amount: 1000,
        commission: 100,
        status: 'Paid',
        date: '2024-01-15',
        paymentMethod: 'Démo'
      }
    ],
    achievements: [
      {
        id: 'ach-demo',
        title: 'Utilisateur Démo',
        description: 'Compte de démonstration',
        icon: '🎭',
        unlockedAt: '2024-01-01',
        level: 1
      }
    ]
  }
};

// ---------- Custom Programs (per commercial) ----------
const customKey = (commercialId: string) => `custom-programs-${commercialId}`;

export const addCustomProgram = (commercialId: string, item: Omit<CustomProgram, 'id'>): CustomProgram[] => {
  const existing = loadCustomPrograms(commercialId);
  const newItem: CustomProgram = { id: `cprog-${Date.now()}`, ...item };
  const updated = [newItem, ...existing];
  localStorage.setItem(customKey(commercialId), JSON.stringify(updated));
  return updated;
};

export const loadCustomPrograms = (commercialId: string): CustomProgram[] => {
  try {
    const raw = localStorage.getItem(customKey(commercialId));
    if (!raw) return [];
    return JSON.parse(raw) as CustomProgram[];
  } catch {
    return [];
  }
};

// Map custom programs to TrainingProgram for UI consumption
export const getCustomProgramsForDisplay = (commercialId: string): TrainingProgram[] => {
  const customs = loadCustomPrograms(commercialId);
  return customs.map<TrainingProgram>((c) => ({
    id: c.id,
    name: c.name,
    category: c.category || 'Personnalisé',
    description: c.description || 'Élément personnalisé défini par le partenaire',
    publicPrice: c.publicPrice,
    // Pour l’affichage, on aligne tous les niveaux sur le prix partenaire
    level1Price: c.partnerPrice,
    level2Price: c.partnerPrice,
    level3Price: c.partnerPrice,
    level4Price: c.partnerPrice,
    commission: c.commission,
    duration: c.duration || '—',
    rating: 0,
    studentsCount: 0
  }));
};

export const updateCustomProgram = (
  commercialId: string,
  id: string,
  updates: Partial<Omit<CustomProgram, 'id'>>
): CustomProgram[] => {
  const list = loadCustomPrograms(commercialId);
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return list;
  const next = { ...list[idx], ...updates } as CustomProgram;
  const updated = [...list];
  updated[idx] = next;
  localStorage.setItem(customKey(commercialId), JSON.stringify(updated));
  return updated;
};

export const deleteCustomProgram = (commercialId: string, id: string): CustomProgram[] => {
  const list = loadCustomPrograms(commercialId);
  const updated = list.filter((x) => x.id !== id);
  localStorage.setItem(customKey(commercialId), JSON.stringify(updated));
  return updated;
};

// Update limited fields of a sale (does not alter aggregates)
export const updateSale = (
  commercialId: string,
  saleId: string,
  updates: Partial<Pick<Sale, 'client' | 'clientEmail' | 'status' | 'paymentMethod' | 'date' | 'amount' | 'commission'>>
): boolean => {
  const user = mockCommercialUsers[commercialId];
  if (!user) return false;
  const idx = user.sales.findIndex((s) => s.id === saleId);
  if (idx === -1) return false;

  const prev = user.sales[idx];
  const next: Sale = { ...prev, ...updates };

  // Determine effective contributions (only for Paid sales)
  const wasEffective = prev.status === 'Paid';
  const willBeEffective = next.status === 'Paid';

  // Rollback previous effective amounts
  if (wasEffective) {
    user.totalSales = Math.max(0, user.totalSales - prev.amount);
    user.commission = Math.max(0, user.commission - prev.commission);
    user.points = Math.max(0, user.points - prev.amount);
  }

  // Apply new effective amounts
  if (willBeEffective) {
    user.totalSales += next.amount;
    user.commission += next.commission;
    user.points += next.amount;
  }

  user.sales[idx] = next;
  const levelInfo = getLevelInfo(user.points);
  user.level = levelInfo.level;
  user.lastActivity = new Date().toISOString().split('T')[0];
  saveCommercialData(commercialId, user);
  return true;
};

// Delete a sale and rollback aggregates
export const deleteSale = (commercialId: string, saleId: string): boolean => {
  const user = mockCommercialUsers[commercialId];
  if (!user) return false;
  const sale = user.sales.find((s) => s.id === saleId);
  if (!sale) return false;

  user.sales = user.sales.filter((s) => s.id !== saleId);
  user.salesCount = Math.max(0, user.salesCount - 1);
  user.totalSales = Math.max(0, user.totalSales - sale.amount);
  user.commission = Math.max(0, user.commission - sale.commission);
  user.points = Math.max(0, user.points - sale.amount);
  const levelInfo = getLevelInfo(user.points);
  user.level = levelInfo.level;
  user.lastActivity = new Date().toISOString().split('T')[0];
  saveCommercialData(commercialId, user);
  return true;
};

// Level system functions
export const getLevelInfo = (points: number) => {
  if (points >= 3000) return { level: 4, name: 'Expert', color: 'purple', nextLevel: null, pointsToNext: 0 };
  if (points >= 2000) return { level: 3, name: 'Avancé', color: 'blue', nextLevel: 4, pointsToNext: 3000 - points };
  if (points >= 1000) return { level: 2, name: 'Intermédiaire', color: 'green', nextLevel: 3, pointsToNext: 2000 - points };
  return { level: 1, name: 'Débutant', color: 'orange', nextLevel: 2, pointsToNext: 1000 - points };
};

export const calculateCommission = (points: number): number => {
  return Math.floor(points / 100) * 10; // 100 points = 10€ commission
};

// Data management functions
export const getCommercialData = (commercialId: string): CommercialUser | null => {
  return mockCommercialUsers[commercialId] || null;
};

export const getTrainingPrograms = (): TrainingProgram[] => {
  return trainingPrograms;
};

export const getProgramPrice = (program: TrainingProgram, level: number): number => {
  switch (level) {
    case 1: return program.level1Price;
    case 2: return program.level2Price;
    case 3: return program.level3Price;
    case 4: return program.level4Price;
    default: return program.publicPrice;
  }
};

export const addSale = (commercialId: string, sale: Omit<Sale, 'id'>): boolean => {
  const user = mockCommercialUsers[commercialId];
  if (!user) return false;

  const newSale: Sale = {
    ...sale,
    id: `sale-${Date.now()}`
  };

  user.sales.unshift(newSale);
  user.salesCount += 1;
  user.totalSales += sale.amount;
  user.commission += sale.commission;
  
  // Add points (1 point per euro of sale)
  user.points += sale.amount;
  
  // Update level
  const levelInfo = getLevelInfo(user.points);
  user.level = levelInfo.level;
  
  user.lastActivity = new Date().toISOString().split('T')[0];

  // Save to localStorage
  saveCommercialData(commercialId, user);
  
  return true;
};

export const convertPointsToCommission = (commercialId: string): boolean => {
  const user = mockCommercialUsers[commercialId];
  if (!user) return false;

  const additionalCommission = calculateCommission(user.points);
  user.commission += additionalCommission;
  user.points = 0; // Reset points after conversion
  user.level = 1; // Reset to level 1
  user.lastActivity = new Date().toISOString().split('T')[0];

  // Save to localStorage
  saveCommercialData(commercialId, user);
  
  return true;
};

// LocalStorage functions
export const saveCommercialData = (commercialId: string, data: CommercialUser): void => {
  localStorage.setItem(`commercialData_${commercialId}`, JSON.stringify(data));
};

export const loadCommercialData = (commercialId: string): CommercialUser | null => {
  try {
    const stored = localStorage.getItem(`commercialData_${commercialId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    
    // If no stored data, return mock data and save it
    const mockData = mockCommercialUsers[commercialId];
    if (mockData) {
      saveCommercialData(commercialId, mockData);
      return mockData;
    }
    
    return null;
  } catch (error) {
    console.error('Error loading commercial data:', error);
    return mockCommercialUsers[commercialId] || null;
  }
};

// Initialize commercial data
export const initializeCommercialData = (commercialId: string): CommercialUser | null => {
  console.log('🔄 Initializing commercial data for:', commercialId);
  
  const existingData = loadCommercialData(commercialId);
  if (existingData) {
    console.log('✅ Loaded existing data:', existingData);
    return existingData;
  }
  
  const mockData = mockCommercialUsers[commercialId];
  if (mockData) {
    saveCommercialData(commercialId, mockData);
    console.log('✅ Initialized with mock data:', mockData);
    return mockData;
  }
  
  console.log('❌ No data found for commercial ID:', commercialId);
  return null;
};
