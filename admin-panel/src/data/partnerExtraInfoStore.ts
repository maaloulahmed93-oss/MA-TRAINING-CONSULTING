export type PartnerCategoryKey = 'formateur' | 'freelance' | 'commercial' | 'entreprise';

export interface PartnerExtraInfo {
  title: string;
  subtitle: string;
  intro: string;
  details: string[]; // bullet points
  requirements: string[]; // conditions requises
  ctaLabel: string;
  contactEmail?: string;
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
    intro: 'Partagez vos connaissances avec nos apprenants et contribuez à leur réussite.',
    details: [
      'Encadrer des sessions en présentiel et à distance',
      'Concevoir des supports pédagogiques de qualité',
      'Évaluer et suivre la progression des apprenants',
    ],
    requirements: DEFAULT_REQUIREMENTS,
    ctaLabel: 'Devenir formateur',
    contactEmail: '',
    updatedAt: new Date().toISOString(),
  },
  freelance: {
    title: 'Freelance',
    subtitle: 'Collaborez avec nous en tant que freelance',
    intro: 'Intervenez sur des missions ponctuelles ou récurrentes selon vos disponibilités.',
    details: [
      'Missions adaptées à votre expertise',
      'Collaboration flexible et agile',
      'Facturation simple et transparente',
    ],
    requirements: DEFAULT_REQUIREMENTS,
    ctaLabel: 'Proposer une mission',
    contactEmail: '',
    updatedAt: new Date().toISOString(),
  },
  commercial: {
    title: 'Commercial / Affilié',
    subtitle: 'Devenez notre partenaire commercial',
    intro: 'Bénéficiez de commissions attractives sur les ventes.',
    details: [
      'Programme de commissions motivant',
      'Outils marketing fournis',
      'Suivi et reporting dédiés',
    ],
    requirements: DEFAULT_REQUIREMENTS,
    ctaLabel: 'Devenir affilié',
    contactEmail: '',
    updatedAt: new Date().toISOString(),
  },
  entreprise: {
    title: 'Entreprise / École',
    subtitle: 'Établissez un partenariat institutionnel',
    intro: 'Formations sur mesure et collaborations durables.',
    details: [
      'Programmes adaptés aux objectifs',
      'Accompagnement et suivi personnalisés',
      'Modalités intra/inter-entreprise',
    ],
    requirements: DEFAULT_REQUIREMENTS,
    ctaLabel: 'Discuter de partenariat',
    contactEmail: '',
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
    return { ...DEFAULT_DATA, ...parsed };
  } catch (e) {
    console.warn('partnerExtraInfoStore: reset store after parse error', e);
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
