
import { useState } from 'react';
import { Users, GraduationCap, Smartphone, Handshake, ArrowRight } from 'lucide-react';
import NotFoundPage from './NotFoundPage';

const NavigationCards = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'etraining' | 'digitalisation' | 'partnership'>('home');



  const handleCardClick = (pageType: 'about' | 'etraining' | 'digitalisation' | 'partnership') => {
    setCurrentPage(pageType);
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  if (currentPage !== 'home') {
    return <NotFoundPage pageType={currentPage} onBack={handleBackToHome} />;
  }

  const cards = [
    {
      icon: Users,
      title: "À propos de nous",
      description: "Des experts humains, une mission claire, une vision tournée vers l'impact.",
      buttonText: "En savoir plus",
      color: "blue",
      gradient: "from-blue-500 to-blue-700",
      pageType: "about" as const
    },
    {
      icon: GraduationCap,
      title: "E-Training",
      description: "Formez-vous autrement. Progressez durablement.",
      buttonText: "Accéder",
      color: "purple",
      gradient: "from-purple-500 to-purple-700",
      pageType: "etraining" as const
    },
    {
      icon: Smartphone,
      title: "Digitalisation",
      description: "Moderniser n'est plus un choix, c'est une nécessité.",
      buttonText: "Découvrir",
      color: "orange",
      gradient: "from-orange-500 to-orange-700",
      pageType: "digitalisation" as const
    },
    {
      icon: Handshake,
      title: "Partenariat",
      description: "Mobilisation des compétences & articulation fonctionnelle. Ensemble, construisons des projets à impact réel.",
      buttonText: "Nous rejoindre",
      color: "green",
      gradient: "from-green-500 to-green-700",
      pageType: "partnership" as const
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cards.map((card, index) => (
              <div key={index} className="navigation-card group">
                <div className={`navigation-card-icon bg-gradient-to-br ${card.gradient}`}>
                  <card.icon className="w-8 h-8 text-white" />
                </div>
                
                <div className="p-6">
                  <h3 className="font-display text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h3>
                  
                  <p className="font-sans text-gray-600 mb-6 line-clamp-3 font-light leading-relaxed">
                    {card.description}
                  </p>
                  
                  <button 
                    onClick={() => handleCardClick(card.pageType)}
                    className="navigation-card-button"
                  >
                    <span>{card.buttonText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-all duration-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default NavigationCards;