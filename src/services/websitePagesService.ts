interface WebsitePage {
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
  category: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = 'https://matc-backend.onrender.com/api/website-pages';

// Cache للأداء
let cachedPages: WebsitePage[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 دقائق

export class WebsitePagesService {
  // جلب الصفحات النشطة للموقع الرئيسي
  static async getActivePages(): Promise<WebsitePage[]> {
    try {
      // التحقق من الـ cache
      const now = Date.now();
      if (cachedPages && (now - cacheTimestamp) < CACHE_DURATION) {
        return cachedPages;
      }

      const response = await fetch(`${API_BASE_URL}/active`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        cachedPages = result.data;
        cacheTimestamp = now;
        return result.data;
      }
      
      throw new Error(result.message || 'Erreur lors de la récupération des pages');
    } catch (error) {
      console.error('Error fetching active pages:', error);
      
      // Fallback للبيانات الافتراضية
      return this.getDefaultPages();
    }
  }

  // البيانات الافتراضية كـ fallback
  static getDefaultPages(): WebsitePage[] {
    return [
      {
        _id: 'default-1',
        pageId: 'PAGE-ABOUT',
        title: 'À propos de nous',
        description: 'Des experts engagés, une mission claire et une vision orientée vers l\'impact et la transformation professionnelle.',
        icon: '👥',
        buttonText: 'En savoir plus',
        buttonLink: '/about',
        isActive: true,
        order: 1,
        backgroundColor: '#3B82F6',
        textColor: '#FFFFFF',
        category: 'about',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'default-2',
        pageId: 'PAGE-ETRAINING',
        title: 'E-Training',
        description: 'Formez-vous autrement. Progressez durablement.',
        icon: '🎓',
        buttonText: 'Accéder',
        buttonLink: '/etraining',
        isActive: true,
        order: 2,
        backgroundColor: '#8B5CF6',
        textColor: '#FFFFFF',
        category: 'formation',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'default-3',
        pageId: 'PAGE-DIGITALISATION',
        title: 'Digitalisation',
        description: 'Moderniser n\'est plus un choix, c\'est une nécessité.',
        icon: '📱',
        buttonText: 'Découvrir',
        buttonLink: '/digitalisation',
        isActive: true,
        order: 3,
        backgroundColor: '#F97316',
        textColor: '#FFFFFF',
        category: 'service',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'default-4',
        pageId: 'PAGE-PARTENARIAT',
        title: 'Partenariat',
        description: 'Mobilisation des compétences & articulation fonctionnelle. Ensemble, construisons des projets à impact réel.',
        icon: '🤝',
        buttonText: 'Nous rejoindre',
        buttonLink: '/partenariat',
        isActive: true,
        order: 4,
        backgroundColor: '#10B981',
        textColor: '#FFFFFF',
        category: 'contact',
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  // مسح الـ cache
  static clearCache(): void {
    cachedPages = null;
    cacheTimestamp = 0;
  }

  // التحقق من حالة API
  static async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch('https://matc-backend.onrender.com/api/health');
      return response.ok;
    } catch {
      return false;
    }
  }
}

export type { WebsitePage };
