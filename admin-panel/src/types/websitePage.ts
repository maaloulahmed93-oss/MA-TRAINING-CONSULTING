export interface WebsitePage {
  _id: string;
  pageId: string;
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
  order: number;
  backgroundColor: string;
  textColor: string;
  category: 'service' | 'formation' | 'about' | 'contact' | 'other';
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WebsitePageFormData {
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
  textColor: string;
  category: 'service' | 'formation' | 'about' | 'contact' | 'other';
  order: number;
}

export interface WebsitePageStats {
  totalPages: number;
  activePages: number;
  inactivePages: number;
  defaultPages: number;
  customPages: number;
  categoriesStats: { _id: string; count: number }[];
}

export const CATEGORY_OPTIONS = [
  { value: 'service', label: 'Service' },
  { value: 'formation', label: 'Formation' },
  { value: 'about', label: 'À propos' },
  { value: 'contact', label: 'Contact' },
  { value: 'other', label: 'Autre' }
];

export const ICON_OPTIONS = [
  '👥', '🎓', '📱', '🤝', '💼', '📊', '🚀', '💡', 
  '🎯', '📈', '🔧', '🌟', '📝', '💻', '🎨', '📞',
  '📧', '🏢', '🌍', '⚡', '🔒', '📋', '🎪', '🎭'
];

export const COLOR_OPTIONS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280'  // Gray
];
