import { useState, useEffect } from 'react';
import { Users, GraduationCap, Smartphone, Handshake, ArrowRight } from 'lucide-react';
import NotFoundPage from './NotFoundPage';
import { WebsitePagesService, WebsitePage } from '../services/websitePagesService';

const NavigationCards = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'etraining' | 'digitalisation' | 'partnership'>('home');
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [loading, setLoading] = useState(true);

  const normalizePages = (inputPages: WebsitePage[]) => {
    return inputPages.map((page) => {
      if (page.pageId === 'PAGE-ETRAINING') {
        return {
          ...page,
          title: 'Accompagnement Professionnel',
          description: 'Clarifiez votre positionnement et avancez avec un expert, étape par étape.',
          icon: '💼',
          buttonText: 'Accéder',
        };
      }

      if (page.pageId === 'PAGE-PARTENARIAT') {
        return {
          ...page,
          title: 'Réseau de prestataires',
          description:
            'Découvrez nos opportunités de collaboration professionnelle et développez votre activité en toute indépendance avec nous.',
          icon: '🧰',
          buttonText: 'Nous rejoindre',
        };
      }

      return page;
    });
  };

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await WebsitePagesService.getActivePages();
      setPages(normalizePages(data));
    } catch (error) {
      console.error('Error loading pages:', error);
      // في حالة الخطأ، استخدم البيانات الافتراضية
      const defaultPages = WebsitePagesService.getDefaultPages();
      setPages(normalizePages(defaultPages));
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (pageType: 'about' | 'etraining' | 'digitalisation' | 'partnership') => {
    setCurrentPage(pageType);
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  if (currentPage !== 'home') {
    return <NotFoundPage pageType={currentPage} onBack={handleBackToHome} />;
  }

  // Icon mapping للأيقونات
  const getIconComponent = (iconText: string) => {
    const iconMap: { [key: string]: any } = {
      '👥': Users,
      '🎓': GraduationCap,
      '📱': Smartphone,
      '🤝': Handshake,
    };
    return iconMap[iconText] || Users;
  };

  // تحويل hex color إلى gradient classes
  const getGradientClass = (backgroundColor: string) => {
    const colorMap: { [key: string]: string } = {
      '#3B82F6': 'from-blue-500 to-blue-700',
      '#8B5CF6': 'from-purple-500 to-purple-700',
      '#F97316': 'from-orange-500 to-orange-700',
      '#10B981': 'from-green-500 to-green-700',
      '#EF4444': 'from-red-500 to-red-700',
      '#F59E0B': 'from-yellow-500 to-yellow-700',
    };
    return colorMap[backgroundColor] || 'from-blue-500 to-blue-700';
  };

  // تحديد pageType من العنوان
  const getPageType = (title: string): 'about' | 'etraining' | 'digitalisation' | 'partnership' => {
    switch (title.toLowerCase()) {
      case 'à propos de nous':
        return 'about';
      case 'e-training':
      case 'e-parcours professionnels':
      case 'accompagnement professionnel':
        return 'etraining';
      case 'digitalisation':
        return 'digitalisation';
      case 'partenariat':
      case 'réseau de prestataires':
      case 'reseau de prestataires':
      case 'réseau de prestataires indépendants':
      case 'reseau de prestataires independants':
        return 'partnership';
      default:
        return 'about';
    }
  };

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="w-16 h-16 bg-gray-300 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pages.map((page, index) => {
              const IconComponent = getIconComponent(page.icon);
              const gradientClass = getGradientClass(page.backgroundColor);
              const pageType = getPageType(page.title);
              
              return (
                <div key={page._id || index} className="navigation-card group">
                  <div className={`navigation-card-icon bg-gradient-to-br ${gradientClass}`}>
                    {/* عرض الأيقونة كـ emoji أو component */}
                    {page.icon.length === 2 ? (
                      <span className="text-2xl">{page.icon}</span>
                    ) : (
                      <IconComponent className="w-8 h-8 text-white" />
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="font-display text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {page.title}
                    </h3>
                    
                    <p className="font-sans text-gray-600 mb-6 line-clamp-3 font-light leading-relaxed">
                      {page.description}
                    </p>
                    
                    <button 
                      onClick={() => handleCardClick(pageType)}
                      className="navigation-card-button"
                    >
                      <span>{page.buttonText}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-all duration-300" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NavigationCards;