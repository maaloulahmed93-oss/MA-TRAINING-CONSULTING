import { useRef, useState, useEffect } from 'react';
import { ArrowLeft, Home, Globe, Settings, GraduationCap, Users, BarChart3, Star, Mail, ChevronLeft, ChevronRight, ArrowRight, CheckCircle2, Search, RefreshCw } from 'lucide-react';
import { digitalizationTestimonialsApiService, TestimonialsData } from '../services/digitalizationTestimonialsApiService';

interface DigitalizationPageProps {
  onBack: () => void;
}

const DigitalizationPage: React.FC<DigitalizationPageProps> = ({ onBack }) => {
  // API state
  const [testimonialsData, setTestimonialsData] = useState<TestimonialsData | null>(null);

  // Load data from API on component mount
  useEffect(() => {
    loadTestimonialsData();
  }, []);

  const loadTestimonialsData = async () => {
    try {
      console.log('🔄 Loading testimonials data from API...');
      const data = await digitalizationTestimonialsApiService.getTestimonialsData();
      setTestimonialsData(data);
      console.log('✅ Testimonials data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading testimonials data:', error);
    }
  };

  const testimonialsRef = useRef<HTMLDivElement>(null);
  const scrollTestimonials = (dir: 'prev' | 'next') => {
    const el = testimonialsRef.current;
    if (!el) return;
    const amount = Math.min(360, el.clientWidth * 0.8);
    el.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
  };

  // Use API data if available, otherwise fallback to static data
  const testimonials = testimonialsData ? testimonialsData.testimonials.slice(0, 3) : [
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
      <section className="py-24 relative overflow-hidden isolate">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-indigo-300/25 blur-3xl" />
              <div className="absolute -bottom-44 -left-36 h-[520px] w-[520px] rounded-full bg-violet-300/20 blur-3xl" />
              <div className="absolute -bottom-52 -right-44 h-[620px] w-[620px] rounded-full bg-emerald-300/15 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.14),transparent_55%),radial-gradient(circle_at_0%_65%,rgba(168,85,247,0.12),transparent_55%),radial-gradient(circle_at_100%_70%,rgba(16,185,129,0.10),transparent_55%)]" />
              <div className="absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_45%,transparent_78%)]" />
              <div className="floating-element-1 absolute top-20 left-10 w-16 h-16 bg-blue-200 rounded-full opacity-30"></div>
              <div className="floating-element-2 absolute top-40 right-20 w-12 h-12 bg-purple-200 rounded-full opacity-40"></div>
              <div className="floating-element-3 absolute bottom-20 left-1/4 w-20 h-20 bg-green-200 rounded-full opacity-25"></div>
            </div>

            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.08] animate-fade-in">
                Nous pilotons la croissance de votre entreprise,
                <span className="block bg-gradient-to-r from-blue-700 via-violet-700 to-indigo-700 bg-clip-text text-transparent animate-gradient-shift">
                  de l’analyse à l’exécution.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed animate-slide-up max-w-3xl mx-auto">
                Diagnostic stratégique intelligent, plan personnalisé et exécution pilotée —
                <span className="block">selon votre réalité, vos priorités et votre budget.</span>
                <span className="block mt-2">Un seul interlocuteur, un seul cadre, des résultats mesurables.</span>
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-bounce-in">
                <a
                  href="mailto:contact@matc-consulting.com?subject=Diagnostic%20gratuit%20-%20Digitalisation"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-7 py-4 font-semibold text-base md:text-lg shadow-sm ring-1 ring-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  <ArrowRight className="w-5 h-5" />
                  <span>Démarrer le diagnostic gratuit</span>
                </a>

                <a
                  href="mailto:contact@matc-consulting.com?subject=Besoin%20précis%20-%20Digitalisation"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-white/90 backdrop-blur-sm text-gray-900 px-7 py-4 font-semibold text-base md:text-lg shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <span>J’ai un besoin précis</span>
                </a>
              </div>

              <div className="mt-10 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-3xl border border-slate-200/70 bg-white/70 backdrop-blur-md p-6 shadow-sm ring-1 ring-white/50">
                  <div className="flex items-start gap-3 text-left">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <span className="text-gray-800 font-medium">Diagnostic gratuit et sans engagement</span>
                  </div>
                  <div className="flex items-start gap-3 text-left">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <span className="text-gray-800 font-medium">Exécution interne + partenaires pilotés</span>
                  </div>
                  <div className="flex items-start gap-3 text-left">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <span className="text-gray-800 font-medium">Solutions sur mesure (pas de services standards)</span>
                  </div>
                  <div className="flex items-start gap-3 text-left">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <span className="text-gray-800 font-medium">Résultats mesurables et durables</span>
                  </div>
                </div>

                <div className="mt-6 rounded-3xl border border-slate-200/70 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 shadow-sm ring-1 ring-white/10">
                  <p className="text-base md:text-lg font-semibold leading-relaxed">
                    Nous ne vendons pas des services.
                    <span className="block text-white/90">Nous structurons, exécutons et livrons des résultats.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-5 [font-family:Arial,Helvetica,sans-serif]">
              Une solution pensée pour des situations réelles,
              <span className="block bg-gradient-to-r from-blue-700 via-violet-700 to-indigo-700 bg-clip-text text-transparent">
                pas pour des profils standards.
              </span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Notre accompagnement s’adresse à :
            </p>

            <div className="mt-10 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-left ring-1 ring-transparent hover:ring-indigo-200">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white mb-4">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <p className="text-gray-900 font-semibold text-lg leading-snug">Entreprises existantes</p>
                  <p className="mt-2 text-gray-600">cherchant croissance, structuration ou performance</p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-left ring-1 ring-transparent hover:ring-violet-200">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white mb-4">
                    <Globe className="h-6 w-6" />
                  </div>
                  <p className="text-gray-900 font-semibold text-lg leading-snug">Startups et projets</p>
                  <p className="mt-2 text-gray-600">en phase de lancement ou de repositionnement</p>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 text-left ring-1 ring-transparent hover:ring-emerald-200">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white mb-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <p className="text-gray-900 font-semibold text-lg leading-snug">Entrepreneurs ou investisseurs</p>
                  <p className="mt-2 text-gray-600">sans idée précise mais avec un objectif clair</p>
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-slate-200/70 bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-5 shadow-sm text-left ring-1 ring-white/10">
                <p className="text-base md:text-lg font-semibold leading-relaxed">
                  👉 Que vous ayez une idée, un projet en cours ou uniquement une ambition,
                  <span className="block text-white/90">nous adaptons la trajectoire à votre réalité.</span>
                </p>
              </div>
            </div>

          </div>

          <div className="max-w-3xl mx-auto">
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 shadow-sm text-center">
              <p className="text-gray-700 text-lg leading-relaxed">
                Nos solutions sont définies et priorisées après le diagnostic — selon votre réalité, vos objectifs et votre budget.
              </p>
              <div className="mt-6 flex justify-center">
                <a
                  href="mailto:contact@matc-consulting.com?subject=Diagnostic%20gratuit%20-%20Digitalisation"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-7 py-3.5 font-semibold shadow-sm ring-1 ring-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  <ArrowRight className="h-5 w-5" />
                  <span>Démarrer le diagnostic gratuit</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notre modèle d’accompagnement */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-indigo-200/40 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-violet-200/40 blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-5">
                Un cadre clair,
                <span className="block bg-gradient-to-r from-blue-700 via-violet-700 to-indigo-700 bg-clip-text text-transparent">
                  du diagnostic jusqu’au résultat.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-7 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ring-1 ring-transparent hover:ring-indigo-200">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                    <Search className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-700">Étape 01</p>
                    <p className="text-xl font-bold text-gray-900">Diagnostic intelligent</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-7 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ring-1 ring-transparent hover:ring-violet-200">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-violet-700">Étape 02</p>
                    <p className="text-xl font-bold text-gray-900">Plan stratégique personnalisé</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-7 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ring-1 ring-transparent hover:ring-emerald-200">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">Étape 03</p>
                    <p className="text-xl font-bold text-gray-900">Exécution pilotée</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-7 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ring-1 ring-transparent hover:ring-blue-200">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <RefreshCw className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-blue-700">Étape 04</p>
                    <p className="text-xl font-bold text-gray-900">Suivi, coordination & optimisation</p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-7 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ring-1 ring-transparent hover:ring-indigo-200">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-indigo-700">Étape 05</p>
                    <p className="text-xl font-bold text-gray-900">Livraison + formation légère</p>
                    <p className="mt-2 text-gray-600">
                      Transmission des bases, documentation essentielle et montée en autonomie.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200/70 bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-6 py-5 shadow-sm flex items-start gap-3 ring-1 ring-white/10">
              <ArrowRight className="h-5 w-5 mt-0.5 text-white/90 flex-shrink-0" />
              <p className="text-base md:text-lg font-semibold leading-relaxed">
                Un seul cadre, un seul responsable, une vision globale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Le diagnostic intelligent (point d’entrée) */}
      <section className="py-24 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 backdrop-blur-md px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">
                  <Search className="h-4 w-4 text-indigo-600" />
                  <span>Le diagnostic intelligent (point d’entrée)</span>
                </div>

                <h2 className="mt-5 text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
                  Comprendre
                  <span className="bg-gradient-to-r from-blue-700 via-violet-700 to-indigo-700 bg-clip-text text-transparent"> avant d’agir.</span>
                </h2>

                <p className="mt-5 text-lg text-gray-600 leading-relaxed">
                  Le diagnostic permet d’identifier :
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span className="font-medium text-gray-900">La situation réelle</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span className="font-medium text-gray-900">Les forces et faiblesses</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span className="font-medium text-gray-900">Les priorités stratégiques</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-4 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span className="font-medium text-gray-900">Les contraintes budgétaires</span>
                  </div>
                </div>

                <div className="mt-8 rounded-3xl border border-slate-200/70 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 shadow-sm ring-1 ring-white/10">
                  <p className="text-base md:text-lg font-semibold leading-relaxed">
                    📌 Le diagnostic est gratuit et sans engagement.
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
                <div className="p-7 border-b border-slate-200/80">
                  <h3 className="text-2xl font-bold text-gray-900">Deux modes possibles</h3>
                  <p className="mt-2 text-gray-600">Choisis selon ton besoin et ton contexte.</p>
                </div>

                <div className="p-7 space-y-4">
                  <div className="rounded-3xl border border-slate-200/80 bg-white/70 backdrop-blur-sm p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                        <Globe className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-indigo-700">Mode 01</p>
                        <p className="text-xl font-bold text-gray-900">Diagnostic global</p>
                        <p className="mt-2 text-gray-600">Vision d’ensemble : objectifs, process, outils, organisation.</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200/80 bg-white/70 backdrop-blur-sm p-5 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                        <Settings className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-emerald-700">Mode 02</p>
                        <p className="text-xl font-bold text-gray-900">Diagnostic ciblé</p>
                        <p className="mt-2 text-gray-600">Site web, marketing, automatisation, IA…</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href="mailto:contact@matc-consulting.com?subject=Diagnostic%20gratuit%20-%20Digitalisation"
                      className="w-full inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-3.5 font-semibold shadow-sm ring-1 ring-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                    >
                      <ArrowRight className="h-5 w-5" />
                      <span>Démarrer le diagnostic gratuit</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Un objectif clair ? Nous construisons un plan dédié. */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
              <div className="p-8 md:p-10 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  Un objectif clair ? Nous construisons un plan dédié.
                </h2>
                <p className="mt-3 text-white/90 text-base md:text-lg">
                  Si votre besoin est déjà défini :
                </p>
              </div>

              <div className="p-8 md:p-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span className="font-semibold text-gray-900">Création ou refonte de site web</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span className="font-semibold text-gray-900">Développement commercial ou export</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span className="font-semibold text-gray-900">Automatisation des processus</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span className="font-semibold text-gray-900">Solutions digitales ou IA</span>
                  </div>
                </div>

                <div className="mt-8 rounded-3xl border border-slate-200/70 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 shadow-sm ring-1 ring-white/10">
                  <p className="text-base md:text-lg font-semibold leading-relaxed">
                    👉 Le diagnostic devient opérationnel
                    <span className="block text-white/90">👉 Nous livrons un plan d’exécution spécifique à cette mission.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
              <div className="p-8 md:p-10">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                  Une feuille de route,
                  <span className="block bg-gradient-to-r from-blue-700 via-violet-700 to-indigo-700 bg-clip-text text-transparent">
                    pas une liste de services.
                  </span>
                </h2>

                <p className="mt-4 text-lg text-gray-600">
                  À partir du diagnostic, nous construisons :
                </p>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span className="font-semibold text-gray-900">Une vision claire</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span className="font-semibold text-gray-900">Des priorités par phase</span>
                  </div>
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span className="font-semibold text-gray-900">Des packs adaptés au budget déclaré</span>
                  </div>
                </div>

                <div className="mt-8 rounded-3xl border border-slate-200/70 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 shadow-sm ring-1 ring-white/10">
                  <p className="text-base md:text-lg font-semibold leading-relaxed">
                    📌 La stratégie reste la même,
                    <span className="block text-white/90">seul le niveau d’exécution varie selon l’investissement.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                Des niveaux d’engagement clairs,
                <span className="block bg-gradient-to-r from-blue-700 via-violet-700 to-indigo-700 bg-clip-text text-transparent">
                  sans complexité
                </span>
              </h2>
              <p className="mt-4 text-lg text-gray-600">Chaque pack est décliné en 3 phases :</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-7 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ring-1 ring-transparent hover:ring-indigo-200">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-slate-900 to-slate-700 text-white">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Phase Basic</p>
                    <p className="text-xl font-bold text-gray-900">Actions essentielles</p>
                    <p className="mt-2 text-gray-600">Impact rapide</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-7 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ring-1 ring-transparent hover:ring-violet-200">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-violet-700">Phase Medium</p>
                    <p className="text-xl font-bold text-gray-900">Exécution structurée</p>
                    <p className="mt-2 text-gray-600">Outils et contenu renforcés</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-7 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ring-1 ring-transparent hover:ring-emerald-200">
                <div className="flex items-start gap-4">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">Phase Expert</p>
                    <p className="text-xl font-bold text-gray-900">Solution complète</p>
                    <p className="mt-2 text-gray-600">Automatisation, IA, formation et système durable</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200/70 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 shadow-sm flex items-start gap-3 ring-1 ring-white/10">
              <ArrowRight className="h-5 w-5 mt-0.5 text-white/90 flex-shrink-0" />
              <p className="text-base md:text-lg font-semibold leading-relaxed">
                📌 Le client choisit le niveau, pas la stratégie.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                Nous exécutons.
                <span className="block bg-gradient-to-r from-blue-700 via-violet-700 to-indigo-700 bg-clip-text text-transparent">
                  Et nous pilotons.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-indigo-700">Exécution directe</p>
                    <p className="text-xl font-bold text-gray-900">Nous livrons en interne</p>
                  </div>
                </div>

                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span>Marketing digital</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span>Sites web &amp; landing pages</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span>Automatisation &amp; outils</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span>Solutions digitales et IA</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-center gap-3 mb-5">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">Exécution via partenaires</p>
                    <p className="text-xl font-bold text-gray-900">Réseau piloté</p>
                  </div>
                </div>

                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span>Certifications (ISO, etc.)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span>Comptabilité, juridique, domiciliation</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200/70 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 shadow-sm flex items-start gap-3 ring-1 ring-white/10">
              <ArrowRight className="h-5 w-5 mt-0.5 text-white/90 flex-shrink-0" />
              <p className="text-base md:text-lg font-semibold leading-relaxed">
                ➡️ Toujours sous notre coordination et notre supervision.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                Un seul responsable
                <span className="block bg-gradient-to-r from-blue-700 via-violet-700 to-indigo-700 bg-clip-text text-transparent">
                  pour tout le projet.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <p className="text-sm font-semibold text-slate-700 mb-4">Nous assurons :</p>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span>La coordination stratégique</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span>Le suivi de l’exécution</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span>Le contrôle qualité</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <span>L’alignement avec les objectifs</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-[2rem] border border-slate-200/70 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-8 shadow-sm ring-1 ring-white/10">
                <p className="text-sm font-semibold text-white/80 mb-4">🎯 Avantage client :</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 mt-0.5 text-white/90" />
                    <span className="font-semibold">Pas de dispersion</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 mt-0.5 text-white/90" />
                    <span className="font-semibold">Délais maîtrisés</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="h-5 w-5 mt-0.5 text-white/90" />
                    <span className="font-semibold">Tarifs préférentiels grâce aux partenariats</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                Un projet structuré,
                <span className="block bg-gradient-to-r from-blue-700 via-violet-700 to-indigo-700 bg-clip-text text-transparent">
                  autonome et prêt à évoluer.
                </span>
              </h2>
            </div>

            <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 md:p-10 shadow-sm">
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                À la fin de l’accompagnement, vous obtenez :
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex-shrink-0">
                      <Settings className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Livrable</p>
                      <p className="text-xl font-bold text-gray-900">Une solution fonctionnelle</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex-shrink-0">
                      <Globe className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Clarté</p>
                      <p className="text-xl font-bold text-gray-900">Des outils clairs</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex-shrink-0">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Pilotage</p>
                      <p className="text-xl font-bold text-gray-900">Une vision stratégique</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white flex-shrink-0">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Autonomie</p>
                      <p className="text-xl font-bold text-gray-900">Une formation courte pour votre équipe</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-slate-200/70 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 shadow-sm flex items-start gap-3 ring-1 ring-white/10">
                <CheckCircle2 className="h-5 w-5 mt-0.5 text-white/90 flex-shrink-0" />
                <p className="text-base md:text-lg font-semibold leading-relaxed">
                  ➡️ Vous gardez la maîtrise après notre intervention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                Exemple de mission
                <span className="block bg-gradient-to-r from-blue-700 via-violet-700 to-indigo-700 bg-clip-text text-transparent">
                  réelle
                </span>
              </h2>
            </div>

            <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 md:p-10 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="lg:w-1/2 rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-7 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <p className="text-sm font-semibold text-slate-700">Contexte</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">Entreprise commerciale – Budget limité</p>
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    Une mission typique : on part du diagnostic, on choisit un pack prioritaire, puis on adapte la phase selon les contraintes.
                  </p>
                </div>

                <div className="lg:w-1/2 rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-7 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <p className="text-sm font-semibold text-slate-700">Cheminement</p>
                  <div className="mt-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100 flex-shrink-0">
                        <Search className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">Diagnostic</p>
                        <p className="text-gray-600">Comprendre la situation réelle avant d’agir.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100 flex-shrink-0">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">Pack prioritaire</p>
                        <p className="text-gray-600">On cible l’impact le plus rapide.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 flex-shrink-0">
                        <Settings className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">Phase adaptée</p>
                        <p className="text-gray-600">Basic / Medium / Expert selon budget et urgence.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-slate-700 ring-1 ring-slate-200 flex-shrink-0">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900">Résultat mesurable</p>
                        <p className="text-gray-600">Préparation à une phase supérieure.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-slate-200/70 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 shadow-sm flex items-start gap-3 ring-1 ring-white/10">
                <ArrowRight className="h-5 w-5 mt-0.5 text-white/90 flex-shrink-0" />
                <p className="text-base md:text-lg font-semibold leading-relaxed">
                  📌 Chaque projet suit la même logique, jamais le même scénario.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white/50">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
                Ce qui nous distingue
                <span className="block bg-gradient-to-r from-blue-700 via-violet-700 to-indigo-700 bg-clip-text text-transparent">
                  réellement
                </span>
              </h2>
            </div>

            <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 md:p-10 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-7 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <p className="text-sm font-semibold text-slate-700">Approche</p>
                  <ul className="mt-4 space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <Search className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <span>Diagnostic intelligent, pas générique</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <BarChart3 className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <span>Plan basé sur la réalité terrain</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Settings className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <span>Exécution pilotée</span>
                    </li>
                  </ul>
                </div>

                <div className="rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-7 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  <p className="text-sm font-semibold text-slate-700">Résultat</p>
                  <ul className="mt-4 space-y-3 text-gray-700">
                    <li className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <span>Partenaires intégrés sous supervision</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <span>Résultats mesurables</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <RefreshCw className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <span>Vision long terme</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
              {testimonialsData ? testimonialsData.title : 'Témoignages Clients'}
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              {testimonialsData ? testimonialsData.subtitle : 'Ce que disent nos clients de nos services de digitalisation'}
            </p>
          </div>

          <div className="relative">
            {/* Controls */}
            <div className="pointer-events-none absolute -top-12 right-0 flex items-center gap-2">
              <button
                onClick={() => scrollTestimonials('prev')}
                className="pointer-events-auto inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                aria-label="Précédent"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => scrollTestimonials('next')}
                className="pointer-events-auto inline-flex items-center justify-center h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
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
                  className={`min-w-[85%] sm:min-w-[360px] snap-center bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 ring-1 ring-transparent hover:ring-yellow-200`}
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

      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto">
            <div className="rounded-[2rem] border border-slate-200/70 bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-10 shadow-sm text-center ring-1 ring-white/10">
              <p className="text-xl md:text-2xl font-semibold leading-relaxed">
                Vous ne déléguez pas un service.
                <span className="block mt-3 text-white/90">Vous confiez la trajectoire de votre projet.</span>
              </p>
            </div>

            <div className="mt-8 rounded-[2rem] border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:contact@matc-consulting.com?subject=Diagnostic%20gratuit%20-%20Digitalisation"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-7 py-4 font-semibold text-base shadow-sm ring-1 ring-indigo-500/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  <ArrowRight className="w-5 h-5" />
                  Démarrer le diagnostic gratuit
                </a>
                <a
                  href="mailto:contact@matc-consulting.com?subject=Besoin%20précis%20-%20Digitalisation"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-white/90 backdrop-blur-sm text-gray-900 px-7 py-4 font-semibold text-base shadow-sm hover:shadow-md transition-all duration-300 border border-slate-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                >
                  <Mail className="w-5 h-5 text-indigo-600" />
                  J’ai un besoin précis
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
