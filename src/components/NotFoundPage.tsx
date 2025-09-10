
import { ArrowLeft, Home, Search, AlertTriangle } from 'lucide-react';
import AboutPage from './AboutPage';
import ETrainingPage from './ETrainingPage';
import PartnershipPage from './PartnershipPage';
import DigitalizationPage from './DigitalizationPage';

interface NotFoundPageProps {
  pageType: 'about' | 'etraining' | 'digitalisation' | 'partnership';
  onBack: () => void;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({ pageType, onBack }) => {
  // Function to navigate to partnership program page
  const handleNavigateToPartner = () => {
    // Navigate to partnership program page (inscription)
    window.location.href = '/programme-partenariat';
  };

  // Show the actual About page instead of 404 for 'about' type
  if (pageType === 'about') {
    return (
      <AboutPage 
        onBack={onBack} 
        onNavigateToPartner={handleNavigateToPartner}
        onContact={() => {
          // Le modal de contact sera géré directement par AboutPage
          console.log('Contact button clicked');
        }}
      />
    );
  }

  // Show the actual E-Training page instead of 404 for 'etraining' type
  if (pageType === 'etraining') {
    return <ETrainingPage onBack={onBack} />;
  }

  // Show the actual Partnership page instead of 404 for 'partnership' type
  if (pageType === 'partnership') {
    return <PartnershipPage onBack={onBack} />;
  }

  // Show the actual Digitalization page instead of 404 for 'digitalisation' type
  if (pageType === 'digitalisation') {
    return <DigitalizationPage onBack={onBack} />;
  }

  const getPageInfo = () => {
    switch (pageType) {
      default:
        return {
          title: 'Page non trouvée',
          description: 'Cette page n\'existe pas encore',
          icon: '❓',
          color: 'gray'
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="not-found-container">
          {/* Animated 404 */}
          <div className="not-found-number">
            <span className="number-digit">4</span>
            <span className="number-digit delay-1">0</span>
            <span className="number-digit delay-2">4</span>
          </div>
          
          {/* Page Icon */}
          <div className={`not-found-icon bg-gradient-to-br from-${pageInfo.color}-500 to-${pageInfo.color}-700`}>
            <span className="text-4xl">{pageInfo.icon}</span>
          </div>
          
          {/* Content */}
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {pageInfo.title}
          </h1>
          
          <p className="font-sans text-xl text-gray-600 mb-8 max-w-md mx-auto">
            {pageInfo.description}
          </p>
          
          {/* Status Badge */}
          <div className="status-badge">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-yellow-800 font-medium">En développement</span>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button 
              onClick={onBack}
              className="not-found-button primary"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>
            
            <button 
              onClick={() => window.location.reload()}
              className="not-found-button secondary"
            >
              <Home className="w-5 h-5" />
              <span>Accueil</span>
            </button>
          </div>
          
          {/* Additional Info */}
          <div className="mt-12 p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Search className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">En attendant...</h3>
            </div>
            <p className="text-gray-600 text-sm">
              Explorez nos autres sections disponibles ou contactez-nous pour plus d'informations 
              sur nos services de formation et conseil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;