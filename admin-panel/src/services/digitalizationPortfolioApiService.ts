import { API_BASE_URL } from '../config/api';
const API_BASE = `${API_BASE_URL}/digitalization-portfolio`;

export interface PortfolioCard {
  title: string;
  description: string;
  result?: string;
  emoji?: string;
}

export interface PortfolioExample {
  name: string;
  detail: string;
  link?: string;
  imageUrl?: string;
}

export interface PortfolioData {
  title: string;
  intro: string;
  cards: PortfolioCard[];
  examples: Record<string, PortfolioExample[]>;
}

class DigitalizationPortfolioApiService {
  
  // جلب البيانات للـ Admin Panel
  async getPortfolioForAdmin(): Promise<PortfolioData> {
    try {
      console.log('🔄 Fetching portfolio data for admin...');
      
      const response = await fetch(`${API_BASE}/admin`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Portfolio data fetched successfully');
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch portfolio data');
      }
      
    } catch (error) {
      console.error('❌ Error fetching portfolio data:', error);
      
      // Fallback to localStorage
      console.log('🔄 Falling back to localStorage...');
      return this.getLocalStorageData();
    }
  }

  // حفظ البيانات من Admin Panel
  async savePortfolio(data: PortfolioData): Promise<boolean> {
    try {
      console.log('💾 Saving portfolio data...', data);
      
      const response = await fetch(API_BASE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Portfolio saved successfully');
        
        // Also save to localStorage as backup
        this.saveToLocalStorage(data);
        
        return true;
      } else {
        throw new Error(result.message || 'Failed to save portfolio');
      }
      
    } catch (error) {
      console.error('❌ Error saving portfolio:', error);
      
      // Fallback to localStorage
      console.log('💾 Saving to localStorage as fallback...');
      this.saveToLocalStorage(data);
      
      return false;
    }
  }

  // إضافة بطاقة جديدة
  async addCard(card: PortfolioCard): Promise<boolean> {
    try {
      console.log('➕ Adding new card...', card);
      
      const response = await fetch(`${API_BASE}/card`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(card),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Card added successfully');
        return true;
      } else {
        throw new Error(result.message || 'Failed to add card');
      }
      
    } catch (error) {
      console.error('❌ Error adding card:', error);
      return false;
    }
  }

  // إعادة تعيين للبيانات الافتراضية
  async resetToDefault(): Promise<boolean> {
    try {
      console.log('🔄 Resetting portfolio to default...');
      
      const response = await fetch(`${API_BASE}/reset`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Portfolio reset successfully');
        return true;
      } else {
        throw new Error(result.message || 'Failed to reset portfolio');
      }
      
    } catch (error) {
      console.error('❌ Error resetting portfolio:', error);
      return false;
    }
  }

  // جلب الإحصائيات
  async getStats(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      
      return {
        totalCards: 0,
        totalExamples: 0,
        lastUpdated: null
      };
      
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      return {
        totalCards: 0,
        totalExamples: 0,
        lastUpdated: null
      };
    }
  }

  // فحص حالة الـ API
  async checkApiHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // البيانات الافتراضية للـ localStorage
  private getLocalStorageData(): PortfolioData {
    const saved = localStorage.getItem('digitalization_portfolio');
    
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
      }
    }
    
    // Default data
    return {
      title: 'Portfolio & Réalisations',
      intro: 'Découvrez les résultats concrets obtenus pour nos clients',
      cards: [
        {
          title: 'Transformation E-commerce',
          description: 'Lancement boutique + campagnes acquisition',
          result: '+300% ventes',
          emoji: '🛒'
        },
        {
          title: 'Automatisation RH',
          description: 'Onboarding, signature, suivi candidats',
          result: '-70% temps',
          emoji: '🤖'
        },
        {
          title: 'Présence Digitale',
          description: 'Site, SEO, social, branding',
          result: '+250% visibilité',
          emoji: '✨'
        }
      ],
      examples: {
        'Transformation E-commerce': [
          { name: 'Boutique Alpha', detail: 'Shopify + Ads → CA x3', link: '' }
        ]
      }
    };
  }

  // حفظ في localStorage
  private saveToLocalStorage(data: PortfolioData): void {
    try {
      localStorage.setItem('digitalization_portfolio', JSON.stringify(data));
      console.log('💾 Data saved to localStorage');
    } catch (error) {
      console.error('❌ Error saving to localStorage:', error);
    }
  }
}

export const digitalizationPortfolioApiService = new DigitalizationPortfolioApiService();
