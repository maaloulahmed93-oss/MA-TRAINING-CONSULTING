export interface TestimonialData {
  id: string;
  name: string;
  position: string;
  skills: string;
  category: string;
  level: 'Intermédiaire' | 'Avancé' | 'Expert';
  progress: number;
  content: string;
  badge?: string;
  rating: number;
  company?: string;
  createdAt: string;
}

const API_BASE_URL = 'https://matc-backend.onrender.com/api/testimonials';

export class TestimonialsApiService {
  private static instance: TestimonialsApiService;
  private cache: Map<string, { data: TestimonialData[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  public static getInstance(): TestimonialsApiService {
    if (!TestimonialsApiService.instance) {
      TestimonialsApiService.instance = new TestimonialsApiService();
    }
    return TestimonialsApiService.instance;
  }

  private isCacheValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.CACHE_DURATION;
  }

  private setCache(key: string, data: TestimonialData[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache(key: string): TestimonialData[] | null {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  // Vérifier la connexion API
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/testimonials', '')}/health`);
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      console.warn('🔌 API Backend non disponible:', error);
      return false;
    }
  }

  // Récupérer les témoignages publiés pour le site principal
  async getPublishedTestimonials(): Promise<TestimonialData[]> {
    try {
      const cacheKey = 'published-testimonials';
      
      // Vérifier le cache
      if (this.isCacheValid(cacheKey)) {
        const cached = this.getCache(cacheKey);
        if (cached) {
          console.log('📋 Témoignages récupérés depuis le cache');
          return cached;
        }
      }

      console.log('🌐 Récupération des témoignages publiés depuis l\'API...');
      
      const response = await fetch(`${API_BASE_URL}/published`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        const testimonials = result.data.map(this.transformApiTestimonial);
        console.log(`✅ ${testimonials.length} témoignages publiés récupérés depuis l'API`);
        
        // Mettre en cache
        this.setCache(cacheKey, testimonials);
        
        return testimonials;
      } else {
        throw new Error(result.message || 'Erreur API');
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des témoignages:', error);
      
      // Fallback vers données statiques
      console.log('🔄 Basculement vers les données statiques...');
      return this.getFallbackTestimonials();
    }
  }

  // Transformer les données de l'API au format frontend
  private transformApiTestimonial(apiTestimonial: any): TestimonialData {
    return {
      id: apiTestimonial._id || apiTestimonial.id,
      name: apiTestimonial.name,
      position: apiTestimonial.position,
      skills: apiTestimonial.skills,
      category: apiTestimonial.category,
      level: apiTestimonial.level,
      progress: apiTestimonial.progress,
      content: apiTestimonial.content,
      badge: apiTestimonial.badge || '',
      rating: apiTestimonial.rating,
      company: apiTestimonial.company || '',
      createdAt: apiTestimonial.createdAt
    };
  }

  // Données de fallback (statiques)
  private getFallbackTestimonials(): TestimonialData[] {
    return [
      {
        id: "fallback-1",
        name: "Sarah Benlahsen",
        position: "DevOps Engineer",
        skills: "React, Node.js",
        category: "Développement Full-Stack",
        level: "Expert",
        progress: 100,
        content: "Grâce à VirtualClass Pro, j'ai pu maîtriser les technologies modernes et décrocher un poste de Lead Developer...",
        badge: "TOP des participants",
        rating: 5,
        company: "TechCorp",
        createdAt: new Date().toISOString()
      },
      {
        id: "fallback-2",
        name: "Mohamed Alami",
        position: "Business Analyst",
        skills: "Leadership, Management",
        category: "Leadership stratégique",
        level: "Avancé",
        progress: 75,
        content: "L'approche personnalisée et l'expertise des formateurs m'ont permis de développer mes compétences en leadership...",
        rating: 5,
        company: "BusinessPro",
        createdAt: new Date().toISOString()
      },
      {
        id: "fallback-3",
        name: "Fatima Zahra",
        position: "Data Scientist",
        skills: "Data Science, Python",
        category: "Analyse prédictive",
        level: "Expert",
        progress: 100,
        content: "Remarquable réussite avec la Data Science ! Les cours étaient parfaitement structurés...",
        rating: 5,
        company: "DataTech",
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Obtenir les initiales d'un nom
  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  // Obtenir la couleur selon le niveau
  getLevelColor(level: 'Intermédiaire' | 'Avancé' | 'Expert'): string {
    switch (level) {
      case 'Intermédiaire':
        return 'from-blue-500 to-blue-600';
      case 'Avancé':
        return 'from-green-500 to-green-600';
      case 'Expert':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-400 to-gray-500';
    }
  }

  // Obtenir les étoiles de notation
  getStarRating(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}

export const testimonialsApiService = TestimonialsApiService.getInstance();
