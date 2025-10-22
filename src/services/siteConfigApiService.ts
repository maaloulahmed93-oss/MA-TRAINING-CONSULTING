interface PublicSiteConfig {
  siteName: string;
  siteTitle: string;
  siteDescription: string;
  favicon: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    facebook: string;
    linkedin: string;
    twitter: string;
    instagram: string;
  };
  seo: {
    keywords: string;
    googleAnalytics: string;
    googleTagManager: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

class SiteConfigService {
  private readonly API_BASE_URL = 'https://matc-backend.onrender.com/api';
  private readonly API_BASE = `${this.API_BASE_URL}/site-config`;
  private cache: PublicSiteConfig | null = null;
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Obtenir la configuration publique du site
  async getPublicConfig(): Promise<PublicSiteConfig> {
    try {
      // Vérifier le cache
      if (this.cache && Date.now() < this.cacheExpiry) {
        return this.cache;
      }

      const response = await fetch(`${this.API_BASE}/public`);
      const result: ApiResponse<PublicSiteConfig> = await response.json();
      
      if (result.success && result.data) {
        // Mettre en cache
        this.cache = result.data;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
        
        // Sauvegarder en localStorage comme backup
        localStorage.setItem('siteConfig', JSON.stringify(result.data));
        
        return result.data;
      }
      
      throw new Error(result.message || 'Erreur lors de la récupération de la configuration');
    } catch (error) {
      console.error('Erreur getPublicConfig:', error);
      
      // Fallback vers localStorage
      const localConfig = localStorage.getItem('siteConfig');
      if (localConfig) {
        try {
          const config = JSON.parse(localConfig);
          this.cache = config;
          return config;
        } catch (parseError) {
          console.error('Erreur parsing localStorage:', parseError);
        }
      }
      
      // Configuration par défaut
      return this.getDefaultConfig();
    }
  }

  // Appliquer la configuration au document
  async applySiteConfig(): Promise<void> {
    try {
      const config = await this.getPublicConfig();
      
      // Mettre à jour le titre de la page
      document.title = config.siteTitle;
      
      // Mettre à jour la meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', config.siteDescription);
      
      // Mettre à jour les mots-clés SEO
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', config.seo.keywords);
      
      // Mettre à jour le favicon
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = config.favicon.startsWith('/') ? `https://matc-backend.onrender.com${config.favicon}` : config.favicon;
      
      // Ajouter Google Analytics si configuré
      if (config.seo.googleAnalytics) {
        this.addGoogleAnalytics(config.seo.googleAnalytics);
      }
      
      // Ajouter Google Tag Manager si configuré
      if (config.seo.googleTagManager) {
        this.addGoogleTagManager(config.seo.googleTagManager);
      }
      
      // Appliquer les couleurs personnalisées
      this.applyCustomColors(config.primaryColor, config.secondaryColor);
      
    } catch (error) {
      console.error('Erreur lors de l\'application de la configuration:', error);
    }
  }

  // Ajouter Google Analytics
  private addGoogleAnalytics(gaId: string): void {
    if (document.querySelector(`script[src*="${gaId}"]`)) return;
    
    // Script de chargement GA
    const gaScript = document.createElement('script');
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
    document.head.appendChild(gaScript);
    
    // Configuration GA
    const gaConfig = document.createElement('script');
    gaConfig.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${gaId}');
    `;
    document.head.appendChild(gaConfig);
  }

  // Ajouter Google Tag Manager
  private addGoogleTagManager(gtmId: string): void {
    if (document.querySelector(`script[src*="${gtmId}"]`)) return;
    
    // GTM Head Script
    const gtmScript = document.createElement('script');
    gtmScript.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${gtmId}');
    `;
    document.head.appendChild(gtmScript);
    
    // GTM Body NoScript
    const gtmNoScript = document.createElement('noscript');
    gtmNoScript.innerHTML = `
      <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
      height="0" width="0" style="display:none;visibility:hidden"></iframe>
    `;
    document.body.insertBefore(gtmNoScript, document.body.firstChild);
  }

  // Appliquer les couleurs personnalisées
  private applyCustomColors(primaryColor: string, secondaryColor: string): void {
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --primary-color: ${primaryColor};
        --secondary-color: ${secondaryColor};
      }
      
      .bg-primary { background-color: var(--primary-color) !important; }
      .text-primary { color: var(--primary-color) !important; }
      .border-primary { border-color: var(--primary-color) !important; }
      
      .bg-secondary { background-color: var(--secondary-color) !important; }
      .text-secondary { color: var(--secondary-color) !important; }
      .border-secondary { border-color: var(--secondary-color) !important; }
      
      .btn-primary {
        background-color: var(--primary-color) !important;
        border-color: var(--primary-color) !important;
      }
      
      .btn-primary:hover {
        background-color: var(--secondary-color) !important;
        border-color: var(--secondary-color) !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Vider le cache
  clearCache(): void {
    this.cache = null;
    this.cacheExpiry = 0;
    localStorage.removeItem('siteConfig');
  }

  // Configuration par défaut
  private getDefaultConfig(): PublicSiteConfig {
    return {
      siteName: '3d MA-TRAINING-CONSULTING',
      siteTitle: '3d MA-TRAINING-CONSULTING - Formation et Consulting',
      siteDescription: 'Centre de formation professionnelle et consulting en Tunisie',
      favicon: '/favicon.ico',
      logo: '/logo.png',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      contactEmail: 'contact@ma-training-consulting.com',
      contactPhone: '+216 XX XXX XXX',
      address: 'Tunis, Tunisie',
      socialMedia: {
        facebook: '',
        linkedin: '',
        twitter: '',
        instagram: ''
      },
      seo: {
        keywords: 'formation, consulting, tunisie, professionnelle',
        googleAnalytics: '',
        googleTagManager: ''
      }
    };
  }

  // Vérifier la connexion API
  async checkApiConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://matc-backend.onrender.com/api/health');
      const result = await response.json();
      return result.success === true;
    } catch (error) {
      return false;
    }
  }
}

export const siteConfigService = new SiteConfigService();
export type { PublicSiteConfig };
