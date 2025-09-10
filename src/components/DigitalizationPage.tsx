import { useRef, useState } from 'react';
import { ArrowLeft, Home, Globe, Bot, Settings, GraduationCap, Database, Users, BarChart3, Star, Phone, Mail, MessageCircle, ExternalLink, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DigitalizationPageProps {
  onBack: () => void;
}

const DigitalizationPage: React.FC<DigitalizationPageProps> = ({ onBack }) => {
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  const services = [
    {
      id: 'creation',
      title: 'Création digitale & présence en ligne',
      icon: Globe,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      items: [
        'Site web vitrine avec démo',
        'Plateforme e-commerce prête à l\'emploi',
        'Packs publications (affiches, vidéos)',
        'Sponsoring & campagnes réseaux sociaux'
      ]
    },
    {
      id: 'automation',
      title: 'Automatisation & Applications IA',
      icon: Bot,
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      items: [
        'Automatisation des processus internes',
        'Applications IA sur mesure',
        'Marketing automatisé',
        'Analyse BI & rapports'
      ]
    },
    {
      id: 'training',
      title: 'Accompagnement & formation',
      icon: GraduationCap,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      items: [
        'Certification ISO',
        'Transformation digitale sur mesure',
        'Formations pratiques'
      ]
    },
    {
      id: 'saas',
      title: 'Solutions (SaaS)',
      icon: Database,
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600',
      items: [
        'ERP modulaire',
        'CRM en ligne',
        'Gestion réseaux sociaux avec IA',
        'Plateforme e-commerce + maintenance'
      ]
    }
  ];

  const testimonialsRef = useRef<HTMLDivElement>(null);
  const scrollTestimonials = (dir: 'prev' | 'next') => {
    const el = testimonialsRef.current;
    if (!el) return;
    const amount = Math.min(360, el.clientWidth * 0.8);
    el.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
  };

  const products = [
    {
      title: 'Site Web Démo',
      description: 'Site vitrine professionnel avec accès test complet',
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600&auto=format&fit=crop',
      details: [
        'Hébergement et domaine inclus (démo)',
        'Design responsive multi-plateformes',
        'Formulaire de contact et pages essentielles'
      ],
      mailtoSubject: 'Plus d\'infos - Site Web Démo',
      demoLink: '#demo-site'
    },
    {
      title: 'Pack Publications Pro',
      description: 'Affiches et contenus visuels professionnels prêts à utiliser',
      imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop',
      details: [
        'Templates multi-format (feed, story, reels)',
        'Charte graphique cohérente',
        'Calendrier éditorial de 30 jours'
      ],
      mailtoSubject: 'Plus d\'infos - Pack Publications Pro',
      demoLink: '#demo-publications'
    },
    {
      title: 'E-commerce Testable',
      description: 'Plateforme de vente en ligne complète et personnalisable',
      imageUrl: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1600&auto=format&fit=crop',
      details: [
        'Catalogue produits et gestion panier',
        'Paiement test (sandbox) et factures',
        'Dashboard commandes et clients'
      ],
      mailtoSubject: 'Plus d\'infos - E-commerce Testable',
      demoLink: '#demo-ecommerce'
    },
    {
      title: 'Campagnes Sponsoring',
      description: 'Campagnes publicitaires optimisées prêtes à lancer',
      imageUrl: 'https://images.unsplash.com/photo-1543286386-2e659306cd6c?q=80&w=1600&auto=format&fit=crop',
      details: [
        'Ciblage précis et audiences lookalike',
        'Cohortes tests et A/B testing',
        'Rapports de performance clairs'
      ],
      mailtoSubject: 'Plus d\'infos - Campagnes Sponsoring',
      demoLink: '#demo-campaigns'
    }
  ];

  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<typeof products[number] | null>(null);

  const openProductModal = (product: typeof products[number]) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };
  const closeProductModal = () => {
    setProductModalOpen(false);
    setSelectedProduct(null);
  };

  const portfolio = [
    {
      title: 'Transformation E-commerce',
      description: 'Augmentation de 300% des ventes en ligne',
      result: '+300% ventes',
      image: '📊'
    },
    {
      title: 'Automatisation RH',
      description: 'Réduction de 70% du temps de traitement',
      result: '-70% temps',
      image: '⚡'
    },
    {
      title: 'Présence Digitale',
      description: 'Croissance de 250% de la visibilité en ligne',
      result: '+250% visibilité',
      image: '🚀'
    }
  ];

  // Real examples per portfolio category (dummy placeholders to be replaced by real client names)
  type PortfolioExample = { name: string; detail: string; link?: string; imageUrl?: string };
  const portfolioExamples: Record<string, PortfolioExample[]> = {
    'Transformation E-commerce': [
      { name: 'Boutique Alpha', detail: 'Migration Shopify + campagnes Meta/Google → CA x3 en 4 mois', link: '#case-boutique-alpha', imageUrl: 'https://images.unsplash.com/photo-1515165562835-c3b8c2e5d3c4?q=80&w=400&auto=format&fit=crop' },
      { name: 'ModeLine', detail: 'Optimisation checkout et upsell → +22% panier moyen', link: '#case-modeline' },
      { name: 'TechGear', detail: 'Emailing automation (Klaviyo) → +35% revenus récurrents', link: '#case-techgear' }
    ],
    'Automatisation RH': [
      { name: 'HRPro', detail: 'Flux onboarding automatisé (Zapier) → -70% temps administratif', link: '#case-hrpro' },
      { name: 'EduNext', detail: 'Signature électronique + suivi candidats → délais divisés par 2', link: '#case-edunext' },
      { name: 'AgriSmart', detail: 'Portail self-service employés → -40% tickets support', link: '#case-agri' }
    ],
    'Présence Digitale': [
      { name: 'FinSolve', detail: 'SEO + contenu LinkedIn → +250% impressions organiques', link: '#case-finsolve' },
      { name: 'RetailPlus', detail: 'Refonte site + social kit → +180% trafic qualifié', link: '#case-retailplus' },
      { name: 'StartupXYZ', detail: 'Branding cohérent + blog → 3x leads marketing', link: '#case-startupxyz' }
    ]
  };

  const [showPortfolioDetails, setShowPortfolioDetails] = useState(false);

  const testimonials = [
    {
      name: 'Sarah Dubois',
      company: 'TechStart SAS',
      rating: 5,
      comment: 'Transformation digitale exceptionnelle ! Notre productivité a doublé en 3 mois.',
      avatar: 'SD'
    },
    {
      name: 'Ahmed Benali',
      company: 'Commerce Plus',
      rating: 5,
      comment: 'L\'équipe a créé notre e-commerce de A à Z. Résultats au-delà de nos attentes !',
      avatar: 'AB'
    },
    {
      name: 'Marie Laurent',
      company: 'Consulting Pro',
      rating: 5,
      comment: 'Support 24/7 exceptionnel et formations très pratiques. Je recommande vivement !',
      avatar: 'ML'
    }
  ];

  const moreTestimonials = [
    {
      name: 'Amel Rekik',
      company: 'RetailPlus',
      rating: 5,
      comment: 'Nos ventes en ligne ont doublé grâce à leur stratégie et automatisation marketing.',
      avatar: 'AR'
    },
    {
      name: 'Mohamed Ali Saidi',
      company: 'EduNext',
      rating: 5,
      comment: 'Plateforme e-learning livrée à temps, UX impeccable et support réactif.',
      avatar: 'MS'
    },
    {
      name: 'Ines Bouaziz',
      company: 'FinSolve',
      rating: 4,
      comment: 'Tableaux de bord clairs, décisions plus rapides. Très bon rapport qualité/prix.',
      avatar: 'IB'
    },
    {
      name: 'Hatem Jlassi',
      company: 'AgriSmart',
      rating: 5,
      comment: 'Intégration IA sur mesure, réduction des coûts opérationnels de 25%.',
      avatar: 'HJ'
    }
  ];

  const testimonialsAll = [...testimonials, ...moreTestimonials];

  // Contact info shown inside the product modal
  const CONTACT_EMAIL = 'contact@example.com';
  const CONTACT_PHONE = '+216 52 345 678';

  const generateMailto = (subject: string) => {
    const body = `Bonjour,

Je souhaite obtenir plus d'informations concernant vos services de digitalisation.

Mes coordonnées :
- Nom : [Votre nom]
- Entreprise : [Nom de votre entreprise]
- Téléphone : [Votre numéro]
- Secteur d'activité : [Votre secteur]

Besoins spécifiques :
[Décrivez brièvement vos besoins]

Cordialement,
[Votre nom]`;

    return `mailto:contact@digitalisation.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 rounded-full px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50/60 transition-colors duration-200 ring-1 ring-transparent hover:ring-blue-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <button
              onClick={onBack}
              className="flex items-center space-x-2 rounded-full px-3 py-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50/60 transition-colors duration-200 ring-1 ring-transparent hover:ring-blue-200"
            >
              <Home className="w-5 h-5" />
              <span className="font-medium">Accueil</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="floating-element-1 absolute top-20 left-10 w-16 h-16 bg-blue-200 rounded-full opacity-30"></div>
              <div className="floating-element-2 absolute top-40 right-20 w-12 h-12 bg-purple-200 rounded-full opacity-40"></div>
              <div className="floating-element-3 absolute bottom-20 left-1/4 w-20 h-20 bg-green-200 rounded-full opacity-25"></div>
            </div>

            <div className="relative z-10">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in">
                Transformez Votre
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-gradient-shift">
                  Entreprise Digitalement
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed animate-slide-up">
                Solutions complètes de digitalisation pour propulser votre business vers le futur. 
                <span className="block mt-2 font-semibold text-blue-600">
                  Consultation + Support + Formation GRATUITS inclus !
                </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center animate-bounce-in">
                <a
                  href={generateMailto('Demande de devis - Transformation digitale')}
                  className="inline-flex items-center space-x-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 font-semibold text-lg shadow-sm ring-1 ring-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <Mail className="w-6 h-6" />
                  <span>📩 Demander un devis</span>
                </a>
                
                <div className="flex gap-4">
                  <a
                    href="tel:+33123456789"
                    className="inline-flex items-center space-x-3 rounded-full bg-white text-gray-800 px-6 py-4 font-semibold shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 hover:-translate-y-0.5"
                  >
                    <Phone className="w-5 h-5 text-blue-600" />
                    <span>📞 Appeler</span>
                  </a>
                  
                  <a
                    href="https://wa.me/33123456789"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-3 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-4 font-semibold shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Services Section */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6 [font-family:Arial,Helvetica,sans-serif]">
              Nos <span className="text-blue-600">Services</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Des solutions complètes pour digitaliser votre entreprise et optimiser vos performances
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div
                key={service.id}
                className={`service-card bg-white/90 rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-slide-up ring-1 ring-transparent hover:ring-indigo-200`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onMouseEnter={() => setHoveredService(service.id)}
                onMouseLeave={() => setHoveredService(null)}
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${service.gradient} rounded-2xl mb-6 transform transition-transform duration-300 ${hoveredService === service.id ? 'scale-110 rotate-6' : ''}`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h3>
                
                <ul className="space-y-3">
                  {service.items.map((item, idx) => (
                    <li key={idx} className="flex items-start space-x-3 text-gray-700">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo & Products Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
              Démo &{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Produits Prêts
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez nos solutions en action et testez nos produits avant de vous engager
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, index) => (
              <div
                key={index}
                className={`product-card bg-white/90 rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-slide-up ring-1 ring-transparent hover:ring-purple-200`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-4 rounded-2xl overflow-hidden">
                  <img src={product.imageUrl} alt={product.title} className="h-40 w-full object-cover" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{product.title}</h3>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">{product.description}</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => openProductModal(product)}
                    className="w-full inline-flex items-center justify-center space-x-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-3 px-4 font-medium shadow-sm hover:shadow-md transition-colors duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Plus de détails</span>
                  </button>
                  
                  <a
                    href={product.demoLink}
                    className="w-full inline-flex items-center justify-center space-x-2 rounded-full bg-gray-100 text-gray-800 py-3 px-4 font-medium hover:bg-gray-200 transition-colors duration-200"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>🛒 Voir démo</span>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Product Details Modal */}
          {isProductModalOpen && selectedProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeProductModal} />
              <div className="relative z-10 w-[92%] max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                  <h3 className="text-xl font-bold text-gray-900">{selectedProduct.title}</h3>
                  <button onClick={closeProductModal} className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {selectedProduct.imageUrl && (
                  <img src={selectedProduct.imageUrl} alt={selectedProduct.title} className="h-52 w-full object-cover" />
                )}
                <div className="px-6 py-5 space-y-4">
                  <p className="text-gray-700">{selectedProduct.description}</p>
                  {selectedProduct.details && (
                    <ul className="list-disc pl-5 text-gray-700 space-y-1">
                      {selectedProduct.details.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  )}
                  <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50">
                    <h4 className="font-semibold text-slate-900 mb-2">Contact</h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Mail className="h-5 w-5 text-indigo-600" />
                        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:underline">{CONTACT_EMAIL}</a>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700">
                        <Phone className="h-5 w-5 text-emerald-600" />
                        <a href={`tel:${CONTACT_PHONE.replace(/\s/g,'')}`} className="hover:underline">{CONTACT_PHONE}</a>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-3">
                      <a
                        href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(selectedProduct.mailtoSubject)}`}
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md"
                      >
                        <Mail className="h-4 w-4" /> Envoyer un email
                      </a>
                      <a
                        href={`tel:${CONTACT_PHONE.replace(/\s/g,'')}`}
                        className="inline-flex items-center gap-2 rounded-full bg-white text-gray-900 px-4 py-2 text-sm font-medium border border-slate-200 hover:bg-slate-50"
                      >
                        <Phone className="h-4 w-4" /> Appeler maintenant
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-20 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
              Portfolio & <span className="text-green-600">Réalisations</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les résultats concrets obtenus pour nos clients
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {portfolio.map((project, index) => (
              <div
                key={index}
                className={`portfolio-card bg-white/90 rounded-3xl p-8 text-center border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 animate-slide-up ring-1 ring-transparent hover:ring-emerald-200`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-6xl mb-4">{project.image}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="text-3xl font-bold text-green-600">{project.result}</div>
              </div>
            ))}
          </div>

          {/* Exemples réels de projets (intégré dans Portfolio) */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Exemples réels de projets</h3>
              <button
                onClick={() => setShowPortfolioDetails((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-slate-50"
              >
                {showPortfolioDetails ? 'Masquer' : 'Voir'} les exemples
              </button>
            </div>
            {showPortfolioDetails && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {portfolio.map((p) => (
                  <div key={p.title} className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-2xl">{p.image}</div>
                      <div>
                        <h4 className="font-bold text-gray-900">{p.title}</h4>
                        <p className="text-sm text-gray-600">{p.description}</p>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {(portfolioExamples[p.title] || []).map((ex, i) => (
                        <li key={i}>
                          {ex.link ? (
                            <a
                              href={ex.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3 hover:bg-white hover:shadow-sm transition"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {ex.imageUrl && (
                                  <img src={ex.imageUrl} alt={ex.name} className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{ex.name}</p>
                                  <p className="text-sm text-gray-600 truncate">{ex.detail}</p>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600" />
                            </a>
                          ) : (
                            <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3">
                              <div className="flex items-center gap-3 min-w-0">
                                {ex.imageUrl && (
                                  <img src={ex.imageUrl} alt={ex.name} className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                                )}
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{ex.name}</p>
                                  <p className="text-sm text-gray-600 truncate">{ex.detail}</p>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-slate-300" />
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
              Témoignages
              {" "}
              <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                Clients
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Ce que disent nos clients de nos services de digitalisation
            </p>
          </div>

          <div className="relative">
            {/* Controls */}
            <div className="pointer-events-none absolute -top-12 right-0 flex items-center gap-2">
              <button
                onClick={() => scrollTestimonials('prev')}
                className="pointer-events-auto inline-flex items-center justify-center h-9 w-9 rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                aria-label="Précédent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollTestimonials('next')}
                className="pointer-events-auto inline-flex items-center justify-center h-9 w-9 rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
                aria-label="Suivant"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Carousel */}
            <div
              ref={testimonialsRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-pb-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {/* Hide scrollbar */}
              <style>{`.snap-x::-webkit-scrollbar{display:none}`}</style>
              {testimonialsAll.map((testimonial, index) => (
                <div
                  key={index}
                  className={`min-w-[85%] sm:min-w-[360px] snap-center bg-white/90 rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 ring-1 ring-transparent hover:ring-yellow-200`}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                      <p className="text-gray-600 text-sm">{testimonial.company}</p>
                    </div>
                  </div>
                  <div className="flex space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Prêt à transformer votre entreprise ?
            </h2>
            <p className="text-xl mb-4">
              <span className="font-bold text-yellow-300">Consultation + Support + Formation GRATUITS</span>
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 mb-12">
              <h3 className="text-2xl font-bold mb-6">Bonus gratuits inclus :</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-6 h-6 text-yellow-300" />
                  <span>Formation de votre équipe</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Settings className="w-6 h-6 text-yellow-300" />
                  <span>Support technique 24/7</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-yellow-300" />
                  <span>Accompagnement personnalisé</span>
                </div>
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-6 h-6 text-yellow-300" />
                  <span>Maintenance préventive</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href={generateMailto('Demande de consultation gratuite - Transformation digitale')}
                className="inline-flex items-center space-x-3 bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <Mail className="w-6 h-6" />
                <span>📩 Email</span>
              </a>
              
              <div className="flex gap-4">
                <a
                  href="tel:+33123456789"
                  className="inline-flex items-center space-x-3 bg-white/20 backdrop-blur-sm text-white px-6 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <Phone className="w-5 h-5" />
                  <span>📞 Téléphone</span>
                </a>
                
                <a
                  href="https://wa.me/33123456789"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-3 bg-green-500 text-white px-6 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DigitalizationPage;
