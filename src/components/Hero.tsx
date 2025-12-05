import { useState, useEffect } from 'react';
import { ChevronRight, Zap, Headphones, Target } from 'lucide-react';

const Hero = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const words = ['Conseil', 'Accompagnement', 'Transformation'];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, 2000); // Change word every 2 seconds
    
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      {/* Hero background image */}
      <div className="absolute inset-0">
        <img 
          src="https://images.pexels.com/photos/3182773/pexels-photo-3182773.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop" 
          alt="Professional business consulting and digital transformation"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-slate-800/80 to-gray-900/80"></div>
      </div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-6xl mx-auto">
          {/* Main content */}
          <div className="text-center mb-16">
            <div className="hero-title-container">
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white mb-8 min-h-[120px] sm:min-h-[150px] md:min-h-[200px] flex items-center justify-center tracking-tight px-4">
                <span className="word-animation text-white break-words text-center">
                  {words[currentWordIndex]}
                </span>
              </h1>
            </div>
            
            <div className="slogan-container mb-8 px-4">
              <p className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl text-sky-300 font-medium tracking-wide">
                L'excellence par <span className="text-sky-400 font-semibold break-words">MA-TRAINING-CONSULTING</span>
              </p>
            </div>
            
            <div className="description-container mb-8 px-4">
              <p className="font-sans text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
                Votre partenaire stratégique pour la transformation digitale et le développement des compétences.
              </p>
            </div>
            

          </div>
          
          {/* Key points grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="key-point-card">
              <div className="key-point-icon">
                <Zap className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 card-title">Compétences & Ateliers</h3>
              <p className="text-gray-600 text-sm font-medium">Ateliers professionnels</p>
              <p className="text-gray-500 text-xs font-light mt-2">Sessions pratiques intensives axées sur l'opérationnel.</p>
            </div>
            
            <div className="key-point-card">
              <div className="key-point-icon">
                <Target className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 card-title">E-Parcours Professionnels</h3>
              <p className="text-gray-600 text-sm font-medium">Programmes digitalisés</p>
              <p className="text-gray-500 text-xs font-light mt-2">Apprentissage moderne, flexible et orienté compétences.</p>
            </div>
            
            <div className="key-point-card">
              <div className="key-point-icon">
                <Headphones className="w-8 h-8 text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 card-title">Digitalisation</h3>
              <p className="text-gray-600 text-sm font-medium">Transformation & Modernisation</p>
              <p className="text-gray-500 text-xs font-light mt-2">Outils, méthodes et stratégies pour accélérer votre évolution.</p>
            </div>
            
            <div className="key-point-card">
              <div className="key-point-icon">
                <Target className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 card-title">Coaching & Support</h3>
              <p className="text-gray-600 text-sm font-medium">Accompagnement professionnel</p>
              <p className="text-gray-500 text-xs font-light mt-2">Mentorat, suivi personnalisé et assistance technique.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="scroll-indicator">
          <ChevronRight className="w-6 h-6 text-white transform rotate-90" />
        </div>
      </div>

    </section>
  );
};

export default Hero;