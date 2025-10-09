const API_BASE_URL = 'http://localhost:3001/api/partnerships';

export interface Partnership {
  _id?: string;
  partnershipId?: string;
  type: string;
  title: string;
  subtitle: string;
  intro: string;
  icon: string;
  color: string;
  gradient: string;
  details: string[];
  requirements: string[];
  ctaLabel?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  count?: number;
}

class PartnershipsApiService {
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error parsing response:', error);
      return {
        success: false,
        error: 'Error parsing server response'
      };
    }
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  // Get all partnerships
  async getAllPartnerships(): Promise<ApiResponse<Partnership[]>> {
    return this.makeRequest<Partnership[]>('');
  }

  async getPartnershipByType(type: string): Promise<ApiResponse<Partnership>> {
    return this.makeRequest<Partnership>(`/${type}`);
  }

  // Convert API partnership to PartnershipType format for frontend
  convertToPartnershipType(partnership: Partnership): any {
    return {
      id: partnership.type,
      title: partnership.title,
      icon: partnership.icon,
      lucideIcon: this.getLucideIcon(partnership.type),
      description: partnership.intro,
      color: partnership.color,
      gradient: partnership.gradient,
      details: partnership.details || [],
      conditions: partnership.requirements || [],
      isVisible: partnership.isVisible !== false // Use isVisible from localStorage
    };
  }

  // Get Lucide icon based on partnership type
  private getLucideIcon(type: string): string {
    switch (type) {
      case 'formateur': return 'BookOpen';
      case 'freelance': return 'Laptop';
      case 'commercial': return 'TrendingUp';
      case 'entreprise': return 'Building2';
      default: return 'BookOpen';
    }
  }

  // Get all partnerships formatted for frontend
  async getPartnershipsForFrontend(): Promise<any[]> {
    try {
      console.log('🔄 Loading partnerships from Backend API...');
      const response = await fetch('http://localhost:3001/api/partnerships');
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        console.log('✅ Using Backend API data:', data.data.length, 'partnerships');
        return data.data.map(partnership => this.convertToPartnershipType(partnership));
      }
      
      console.log('⚠️ Backend API incomplete, using fallback data');
      // Fallback to default data if API fails or incomplete
      return this.getDefaultPartnerships();
    } catch (error) {
      console.error('❌ Error fetching partnerships from Backend:', error);
      console.log('🔄 Using fallback data...');
      return this.getDefaultPartnerships();
    }
  }

  // Default partnerships fallback
  private getDefaultPartnerships(): any[] {
    return [
      {
        id: "formateur",
        title: "Formateur",
        icon: "📘",
        lucideIcon: "BookOpen",
        description: "Rejoignez notre équipe de formateurs experts et partagez vos connaissances avec nos apprenants.",
        color: "blue",
        gradient: "from-blue-500 to-blue-600",
        details: [
          "Encadrer des sessions en présentiel et à distance",
          "Concevoir des supports pédagogiques de qualité",
          "Évaluer et suivre la progression des apprenants",
        ],
        conditions: [
          "Minimum 3 ans d'expérience dans votre domaine",
          "Diplôme ou certifications reconnues",
          "Excellentes compétences pédagogiques",
          "Disponibilité flexible pour les formations",
          "Maîtrise des outils numériques",
        ],
        mailSubject: "Candidature Formateur - Programme de Partenariat",
        contactEmail: "ahmedmaalou78l@gmail.com",
      },
      {
        id: "freelance",
        title: "Freelance",
        icon: "💻",
        lucideIcon: "Laptop",
        description: "Collaborez avec nous en tant que freelance pour des missions ponctuelles ou récurrentes.",
        color: "green",
        gradient: "from-green-500 to-green-600",
        details: [
          "Missions adaptées à votre expertise",
          "Collaboration flexible et agile",
          "Facturation simple et transparente",
        ],
        conditions: [
          "Portfolio démontrant vos compétences",
          "Expérience en freelancing ou projets indépendants",
          "Capacité à respecter les délais",
          "Communication professionnelle",
          "Spécialisation dans un domaine technique",
        ],
        mailSubject: "Candidature Freelance - Programme de Partenariat",
        contactEmail: "ahmedmaalou78l@gmail.com",
      },
      {
        id: "commercial",
        title: "Commercial / Affilié",
        icon: "📈",
        lucideIcon: "TrendingUp",
        description: "Devenez notre partenaire commercial et bénéficiez de commissions attractives sur les ventes.",
        color: "orange",
        gradient: "from-orange-500 to-orange-600",
        details: [
          "Programme de commissions motivant",
          "Outils marketing fournis",
          "Suivi et reporting dédiés",
        ],
        conditions: [
          "Expérience en vente ou marketing",
          "Réseau professionnel développé",
          "Compétences en négociation",
          "Motivation et esprit entrepreneurial",
          "Connaissance du secteur de la formation",
        ],
        mailSubject: "Candidature Commercial/Affilié - Programme de Partenariat",
        contactEmail: "ahmedmaalou78l@gmail.com",
      },
      {
        id: "entreprise",
        title: "Entreprise / École",
        icon: "🏢",
        lucideIcon: "Building2",
        description: "Établissez un partenariat institutionnel pour des formations sur mesure et des collaborations durables.",
        color: "purple",
        gradient: "from-purple-500 to-purple-600",
        details: [
          "Programmes adaptés aux objectifs",
          "Accompagnement et suivi personnalisés",
          "Modalités intra/inter-entreprise",
        ],
        conditions: [
          "Entreprise ou institution éducative établie",
          "Besoin récurrent en formation",
          "Capacité de collaboration à long terme",
          "Budget dédié à la formation",
          "Engagement dans le développement des compétences",
        ],
        mailSubject: "Partenariat Institutionnel - Programme de Partenariat",
        contactEmail: "ahmedmaalou78l@gmail.com",
      },
    ];
  }

  // Test API connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch('http://localhost:3001/api/health');
      const data = await response.json();
      
      if (data.success) {
        return { success: true, message: 'API connection successful' };
      } else {
        return { success: false, message: 'API health check failed' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: `API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

export const partnershipsApiService = new PartnershipsApiService();
export default partnershipsApiService;
