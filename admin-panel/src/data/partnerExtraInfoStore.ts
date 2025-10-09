export type PartnerCategoryKey = 'formateur' | 'freelance' | 'commercial' | 'entreprise';

export interface PartnerExtraInfo {
  title: string;
  subtitle: string;
  intro: string;
  icon: string;
  color: string;
  gradient: string;
  details: string[];
  requirements: string[];
  ctaLabel: string;
  isVisible: boolean;
  updatedAt: string;
}

const STORAGE_KEY = 'partner_extra_info_v1';

const DEFAULT_REQUIREMENTS = [
  "Minimum 3 ans d'expérience dans votre domaine",
  "Diplôme ou certifications reconnues",
  "Excellentes compétences pédagogiques",
  "Disponibilité flexible pour les formations",
  "Maîtrise des outils numériques",
];

const DEFAULT_DATA: Record<PartnerCategoryKey, PartnerExtraInfo> = {
  formateur: {
    title: 'Formateur',
    subtitle: 'Rejoignez notre équipe de formateurs experts',
    intro: 'Rejoignez notre équipe de formateurs experts et partagez vos connaissances avec nos apprenants.',
    icon: '📘',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    details: [
      'Encadrer des sessions en présentiel et à distance',
      'Concevoir des supports pédagogiques de qualité',
      'Évaluer et suivre la progression des apprenants',
    ],
    requirements: DEFAULT_REQUIREMENTS,
    ctaLabel: 'Accéder à l\'Espace Formateur',
    isVisible: true,
    updatedAt: new Date().toISOString(),
  },
  freelance: {
    title: 'Freelance',
    subtitle: 'Collaborez avec nous en tant que freelance',
    intro: 'Collaborez avec nous en tant que freelance pour des missions ponctuelles ou récurrentes.',
    icon: '💻',
    color: 'green',
    gradient: 'from-green-500 to-green-600',
    details: [
      'Missions adaptées à votre expertise',
      'Collaboration flexible et agile',
      'Facturation simple et transparente',
    ],
    requirements: [
      'Portfolio démontrant vos compétences',
      'Expérience en freelancing ou projets indépendants',
      'Capacité à respecter les délais',
      'Communication professionnelle',
      'Spécialisation dans un domaine technique',
    ],
    ctaLabel: 'Accéder à l\'Espace Freelancer',
    isVisible: true,
    updatedAt: new Date().toISOString(),
  },
  commercial: {
    title: 'Commercial / Affilié',
    subtitle: 'Devenez notre partenaire commercial',
    intro: 'Devenez notre partenaire commercial et bénéficiez de commissions attractives sur les ventes.',
    icon: '📈',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    details: [
      'Programme de commissions motivant',
      'Outils marketing fournis',
      'Suivi et reporting dédiés',
    ],
    requirements: [
      'Expérience en vente ou marketing',
      'Réseau professionnel développé',
      'Compétences en négociation',
      'Motivation et esprit entrepreneurial',
      'Connaissance du secteur de la formation',
    ],
    ctaLabel: 'Accéder à l\'Espace Commercial',
    isVisible: true,
    updatedAt: new Date().toISOString(),
  },
  entreprise: {
    title: 'Entreprise / École',
    subtitle: 'Établissez un partenariat institutionnel',
    intro: 'Établissez un partenariat institutionnel pour des formations sur mesure et des collaborations durables.',
    icon: '🏢',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    details: [
      'Programmes adaptés aux objectifs',
      'Accompagnement et suivi personnalisés',
      'Modalités intra/inter-entreprise',
    ],
    requirements: [
      'Entreprise ou institution éducative établie',
      'Besoin récurrent en formation',
      'Capacité de collaboration à long terme',
      'Budget dédié à la formation',
      'Engagement dans le développement des compétences',
    ],
    ctaLabel: 'Accéder à l\'Espace Partenariat',
    isVisible: true,
    updatedAt: new Date().toISOString(),
  },
};

function readStore(): Record<PartnerCategoryKey, PartnerExtraInfo> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
      return { ...DEFAULT_DATA };
    }
    
    const parsed = JSON.parse(raw);
    
    // Ensure all entries have isVisible field (for backward compatibility)
    const categories: PartnerCategoryKey[] = ['formateur', 'freelance', 'commercial', 'entreprise'];
    categories.forEach(cat => {
      if (parsed[cat] && parsed[cat].isVisible === undefined) {
        parsed[cat].isVisible = true; // Default to visible
      }
    });
    
    return parsed;
  } catch (e) {
    console.warn('Error reading partner extra info store:', e);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_DATA));
    return { ...DEFAULT_DATA };
  }
}

function writeStore(data: Record<PartnerCategoryKey, PartnerExtraInfo>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getPartnerExtraInfo(key: PartnerCategoryKey): PartnerExtraInfo {
  const store = readStore();
  return store[key];
}

export function setPartnerExtraInfo(key: PartnerCategoryKey, info: PartnerExtraInfo) {
  const store = readStore();
  store[key] = { ...info, updatedAt: new Date().toISOString() };
  writeStore(store);
}

export function listPartnerExtraInfo(): Array<{ key: PartnerCategoryKey; info: PartnerExtraInfo }>{
  const store = readStore();
  return (Object.keys(store) as PartnerCategoryKey[]).map((k) => ({ key: k, info: store[k] }));
}
