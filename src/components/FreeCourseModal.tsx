import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, Clock, Play, CheckCircle, BookOpen, Users, Star, Search, ChevronLeft, ChevronRight, Wifi, WifiOff } from 'lucide-react';
import { coursesData } from '../data/coursesData';
import { Domain, Course } from '../types/courses';
import { freeCoursesService } from '../services/freeCoursesService';

interface FreeCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'access-id' | 'domain-selection' | 'course-list' | 'course-modules';

interface SelectedCourse {
  domainId: string;
  courseId: string;
}

const FreeCourseModal: React.FC<FreeCourseModalProps> = ({ isOpen, onClose }) => {
  // API Connection State
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [apiDomains, setApiDomains] = useState<Domain[]>([]);
  
  // Modal State
  const [currentStep, setCurrentStep] = useState<Step>('access-id');
  const [accessId, setAccessId] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [allowedDomainId, setAllowedDomainId] = useState<string | '*'>('*');
  const [selectedCourse, setSelectedCourse] = useState<SelectedCourse | null>(null);
  const [shakeError, setShakeError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Initialize API connection and load data
  useEffect(() => {
    if (isOpen) {
      initializeData();
    }
  }, [isOpen]);

  const initializeData = async () => {
    setIsLoadingData(true);
    
    try {
      console.log('🔄 Initialisation données cours gratuiti...');
      
      // Test API connection
      const connectionTest = await freeCoursesService.testConnection();
      console.log('🔍 Test connexion:', connectionTest);
      
      if (connectionTest.api && connectionTest.domains) {
        // API is working - load from API
        setIsApiConnected(true);
        const domains = await freeCoursesService.getDomains();
        setApiDomains(domains);
        console.log('✅ Données chargées depuis l\'API MongoDB');
      } else {
        // API not available - use static data
        setIsApiConnected(false);
        setApiDomains(coursesData.domains);
        console.log('📱 Fallback vers données statiques');
      }
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      setIsApiConnected(false);
      setApiDomains(coursesData.domains);
    } finally {
      setIsLoadingData(false);
    }
  };

  // Use API domains if connected, otherwise use static data, then filter by allowedDomainId
  const allDomains = isApiConnected ? apiDomains : coursesData.domains;
  const activeDomains = useMemo(() => {
    if (allowedDomainId === '*' || !allowedDomainId) return allDomains;
    return allDomains.filter((d) => d.id === allowedDomainId);
  }, [allDomains, allowedDomainId]);

  // Filtered domains based on search query
  const filteredDomains = useMemo(() => {
    if (!searchQuery.trim()) return activeDomains;
    return activeDomains.filter(domain =>
      domain.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      domain.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, activeDomains]);

  // Calculate slides per view and total slides
  const slidesPerView = 3;
  const totalSlides = Math.ceil(filteredDomains.length / slidesPerView);
  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('access-id');
      setAccessId('');
      setError('');
      setSelectedDomain('');
      setSelectedCourse(null);
      setShakeError(false);
      setSearchQuery('');
      setCurrentSlide(0);
    }
  }, [isOpen]);

  const handleAccessIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessId.trim()) {
      setError('Veuillez saisir un ID d\'accès');
      triggerShake();
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      if (isApiConnected) {
        // Use API validation
        console.log('🔐 Validation via API MongoDB...');
        const result = await freeCoursesService.validateAccess(accessId.toUpperCase());
        
        if (result.success) {
          console.log('✅ ID validé via API:', accessId);
          const targetDomain = (result.data && (result.data.domainId as string)) || '*';
          setAllowedDomainId(targetDomain as any);
          setIsValidating(false);
          setCurrentStep('domain-selection');
        } else {
          console.log('❌ ID invalide via API:', accessId);
          setIsValidating(false);
          setError(result.message || 'ID d\'accès invalide');
          triggerShake();
        }
      } else {
        // Fallback to static validation
        console.log('📱 Validation via données statiques...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        if (coursesData.validAccessIds.includes(accessId.toUpperCase())) {
          setIsValidating(false);
          setCurrentStep('domain-selection');
        } else {
          setIsValidating(false);
          setError('ID d\'accès invalide. Essayez: DEMO2024');
          triggerShake();
        }
      }
    } catch (error) {
      console.error('❌ Erreur validation:', error);
      // Fallback to static validation on error
      if (coursesData.validAccessIds.includes(accessId.toUpperCase())) {
        setIsValidating(false);
        setCurrentStep('domain-selection');
      } else {
        setIsValidating(false);
        setError('Erreur de connexion. Essayez: DEMO2024');
        triggerShake();
      }
    }
  };

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
  };

  const handleDomainSelect = (domainId: string) => {
    setSelectedDomain(domainId);
    setCurrentStep('course-list');
  };

  const handleCourseSelect = (domainId: string, courseId: string) => {
    setSelectedCourse({ domainId, courseId });
    setCurrentStep('course-modules');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'domain-selection':
        setCurrentStep('access-id');
        break;
      case 'course-list':
        setCurrentStep('domain-selection');
        break;
      case 'course-modules':
        setCurrentStep('course-list');
        break;
    }
  };

  const getCurrentDomain = (): Domain | undefined => {
    return activeDomains.find((d: Domain) => d.id === selectedDomain);
  };

  const getCurrentCourse = (): Course | undefined => {
    if (!selectedCourse) return undefined;
    const domain = activeDomains.find((d: Domain) => d.id === selectedCourse.domainId);
    return domain?.courses.find((c: Course) => c.id === selectedCourse.courseId);
  };

  // Carousel navigation functions
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleCourseAccess = (course: Course) => {
    console.log('🎯 Accès au cours:', course.title);
    
    // Naviguer vers les modules du cours
    setSelectedCourse({
      domainId: selectedDomain,
      courseId: course.id
    });
    setCurrentStep('course-modules');
  };

  const handleModuleAccess = (module: CourseModule) => {
    console.log('🎯 Accès au module:', module.title);
    
    if (module.url) {
      // Ouvrir l'URL du module dans un nouvel onglet
      window.open(module.url, '_blank', 'noopener,noreferrer');
      console.log('🔗 URL ouverte:', module.url);
    } else {
      // Si pas d'URL, afficher un message
      alert(`📖 Module: ${module.title}\n⏱️ Durée: ${module.duration}\n\n⚠️ Aucune URL configurée pour ce module.`);
      console.log('⚠️ Pas d\'URL pour le module:', module.title);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
      {/* Custom Styles for Enhanced Carousel */}
      <div dangerouslySetInnerHTML={{
        __html: `
          <style>
            /* Mobile modal responsiveness */
            @media (max-width: 640px) {
              .modal-responsive { max-width: 90% !important; width: 100%; margin: 0 auto; }
              .modal-body-responsive { padding: 16px !important; }
              .modal-content-scroll { max-height: calc(90vh - 88px) !important; }
            }
            .carousel-container {
              position: relative;
              overflow: hidden;
            }
            .carousel-track {
              display: flex;
              transition: transform 0.3s ease-in-out;
            }
            .carousel-slide {
              flex-shrink: 0;
              padding: 0 8px;
            }
            .domain-card {
              background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              padding: 24px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              transition: all 0.3s ease;
              cursor: pointer;
              height: 100%;
            }
            .domain-card:hover {
              transform: translateY(-8px) scale(1.02);
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            }
            .domain-icon {
              font-size: 3rem;
              margin-bottom: 16px;
              transition: transform 0.3s ease;
            }
            .domain-card:hover .domain-icon {
              transform: scale(1.1);
            }
            .search-input {
              background: rgba(255, 255, 255, 0.9);
              backdrop-filter: blur(10px);
              border: 2px solid #e2e8f0;
              transition: all 0.3s ease;
            }
            .search-input:focus {
              border-color: #3b82f6;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            .nav-button {
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(10px);
              border: 1px solid #e2e8f0;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              transition: all 0.3s ease;
            }
            .nav-button:hover {
              background: rgba(249, 250, 251, 0.95);
              transform: scale(1.05);
            }
            .pagination-dot {
              transition: all 0.3s ease;
            }
            .pagination-dot.active {
              background: #3b82f6;
              transform: scale(1.2);
            }
            .stats-card {
              background: rgba(255, 255, 255, 0.8);
              backdrop-filter: blur(10px);
              border-radius: 12px;
              padding: 16px;
              border: 1px solid #e2e8f0;
            }
          </style>
        `
      }} />
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={`modal-responsive bg-white rounded-2xl shadow-2xl w-full sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-hidden ${
            shakeError ? 'animate-shake-error' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              {currentStep !== 'access-id' && (
                <button
                  onClick={handleBack}
                  className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  {currentStep === 'access-id' && '🎓 Accès Cours Gratuit'}
                  {currentStep === 'domain-selection' && '📚 Choisir un Domaine'}
                  {currentStep === 'course-list' && `💻 Cours ${getCurrentDomain()?.title}`}
                  {currentStep === 'course-modules' && '📖 Modules du Cours'}
                  
                  {/* API Status Indicator */}
                  {isLoadingData ? (
                    <div className="ml-3 animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  ) : (
                    <div className="ml-3 flex items-center">
                      {isApiConnected ? (
                        <div className="flex items-center text-green-600 text-xs">
                          <Wifi className="h-4 w-4 mr-1" />
                          <span>MongoDB</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-orange-600 text-xs">
                          <WifiOff className="h-4 w-4 mr-1" />
                          <span>Local</span>
                        </div>
                      )}
                    </div>
                  )}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {currentStep === 'access-id' && 'Saisissez votre ID d\'accès pour commencer'}
                  {currentStep === 'domain-selection' && `Sélectionnez le domaine qui vous intéresse (${activeDomains.length} disponibles)`}
                  {currentStep === 'course-list' && 'Choisissez le cours que vous souhaitez suivre'}
                  {currentStep === 'course-modules' && 'Accédez aux modules de formation'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="modal-body-responsive p-4 sm:p-6 overflow-y-auto modal-content-scroll max-h-[calc(90vh-100px)]">
            <AnimatePresence mode="wait">
              {/* Step 1: Access ID */}
              {currentStep === 'access-id' && (
                <motion.div
                  key="access-id"
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="text-center max-w-md mx-auto"
                >
                  <div className="mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-10 h-10 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Initiation Offerte
                    </h3>
                    <p className="text-gray-600">
                      Accédez gratuitement à nos cours de formation professionnelle
                    </p>
                  </div>

                  <form onSubmit={handleAccessIdSubmit} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID d'accès
                      </label>
                      <input
                        type="text"
                        value={accessId}
                        onChange={(e) => setAccessId(e.target.value)}
                        placeholder="Saisissez votre ID d'accès"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={isValidating}
                      />
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-red-500 text-sm mt-2 flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          {error}
                        </motion.p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isValidating}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-5 rounded-lg font-semibold text-base hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isValidating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Validation...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          Valider
                        </>
                      )}
                    </button>
                  </form>

                  {/* Demo IDs hint removed per request */}
                </motion.div>
              )}

              {/* Step 2: Domain Selection with Search and Carousel */}
              {currentStep === 'domain-selection' && (
                <motion.div
                  key="domain-selection"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-8"
                >
                  {/* Header */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Choisissez votre domaine de formation
                    </h3>
                    <p className="text-gray-600">
                      Sélectionnez le domaine qui correspond à vos objectifs professionnels
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative max-w-md mx-auto">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Rechercher un domaine..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none"
                    />
                  </div>

                  {/* Statistics */}
                  <div className="flex justify-center gap-8 text-sm text-gray-600">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{filteredDomains.length}</div>
                      <div>Domaines</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {filteredDomains.reduce((total, domain) => total + domain.courses.length, 0)}
                      </div>
                      <div>Cours Gratuits</div>
                    </div>
                  </div>

                  {/* Carousel Container */}
                  <div className="relative">
                    {filteredDomains.length > 0 ? (
                      <>
                        {/* Domains Carousel */}
                        <div className="carousel-container">
                          <motion.div
                            className="carousel-track"
                            style={{
                              transform: `translateX(-${currentSlide * (100 / totalSlides)}%)`
                            }}
                          >
                            {filteredDomains.map((domain: Domain, index: number) => (
                              <motion.div
                                key={`${domain.id}-${index}`}
                                variants={staggerItem}
                                className="carousel-slide"
                                style={{ minWidth: `${100 / slidesPerView}%` }}
                              >
                                <div
                                  className="domain-card"
                                  onClick={() => handleDomainSelect(domain.id)}
                                >
                                  <div className="text-center">
                                    <div className="domain-icon">
                                      {domain.icon}
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-800 mb-2">
                                      {domain.title}
                                    </h4>
                                    <p className="text-gray-600 text-sm mb-4">
                                      {domain.description}
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-blue-600 font-medium">
                                      <span>{domain.courses.length} cours disponibles</span>
                                      <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </motion.div>
                        </div>

                        {/* Navigation Arrows */}
                        {totalSlides > 1 && (
                          <>
                            <button
                              onClick={prevSlide}
                              className="nav-button absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 rounded-full p-2 z-10"
                            >
                              <ChevronLeft className="w-6 h-6 text-gray-600" />
                            </button>
                            <button
                              onClick={nextSlide}
                              className="nav-button absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 rounded-full p-2 z-10"
                            >
                              <ChevronRight className="w-6 h-6 text-gray-600" />
                            </button>
                          </>
                        )}

                        {/* Dots Pagination */}
                        {totalSlides > 1 && (
                          <div className="flex justify-center gap-2 mt-6">
                            {Array.from({ length: totalSlides }).map((_, index) => (
                              <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`pagination-dot w-3 h-3 rounded-full ${
                                  currentSlide === index
                                    ? 'active'
                                    : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                          <Search className="w-16 h-16 mx-auto" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-600 mb-2">
                          Aucun domaine trouvé
                        </h4>
                        <p className="text-gray-500">
                          Essayez avec d'autres mots-clés
                        </p>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Réinitialiser la recherche
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Course List */}
              {currentStep === 'course-list' && selectedDomain && (
                <motion.div
                  key="course-list"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Cours {getCurrentDomain()?.title}
                    </h3>
                    <p className="text-gray-600">
                      {getCurrentDomain()?.courses.length} cours disponibles dans ce domaine
                    </p>
                  </div>

                  <div className="space-y-4">
                    {getCurrentDomain()?.courses.map((course: Course, index: number) => (
                      <motion.div
                        key={course.id}
                        variants={staggerItem}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
                        onClick={() => handleCourseSelect(selectedDomain, course.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                                  {course.title}
                                </h4>
                                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                                  <span className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    {course.modules.length} modules
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {course.modules.reduce((total: number, module) => {
                                      const duration = parseInt(module.duration);
                                      return total + duration;
                                    }, 0)} min
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    4.8
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-600 mb-4">
                              {course.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-green-600 font-medium">
                </motion.div>
              )}

              {/* Step 4: Course Modules */}
              {currentStep === 'course-modules' && selectedCourse && (
                <motion.div
                  key="course-modules"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      {getCurrentCourse()?.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {getCurrentCourse()?.description}
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {getCurrentCourse()?.modules.length} modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {getCurrentCourse()?.modules.reduce((total: number, module) => {
                          const duration = parseInt(module.duration);
                          return total + duration;
                        }, 0)} minutes au total
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        Formation gratuite
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {getCurrentCourse()?.modules.map((module, index: number) => (
                      <motion.div
                        key={module.id}
                        variants={staggerItem}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-4 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                                {module.title}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                <Clock className="w-4 h-4" />
                                <span>{module.duration}</span>
                              </div>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleModuleAccess(module)}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all transform group-hover:scale-105 flex items-center gap-2"
                          >
                            <Play className="w-4 h-4" />
                            Accéder
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Free Course Access Section */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                    <div className="text-center">
                      <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h4 className="text-lg font-bold text-green-800 mb-4">
                        Félicitations ! 🎉
                      </h4>
                      <button className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto mb-6">
                        <Play className="w-5 h-5" />
                        Commencer le cours
                      </button>
                    </div>
                  </div>

                  {/* Premium Programs Promotion */}
                  <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-white text-xl font-bold">⚠️</span>
                      </div>
                      <h4 className="text-lg font-bold text-blue-800 mb-4">
                        Remarque importante
                      </h4>
                      <div className="text-left space-y-4 max-w-2xl mx-auto">
                        <p className="text-blue-700 text-sm">
                          <span className="font-semibold">⚠️ Remarque :</span> Les cours gratuits vous permettent d'apprendre et de pratiquer, 
                          mais ils ne donnent pas droit à une attestation, ni aux avantages exclusifs réservés à nos programmes complets.
                        </p>
                        
                        <div className="bg-white/50 p-4 rounded-lg">
                          <p className="text-blue-800 font-semibold mb-2">📈 Si vous souhaitez :</p>
                          <ul className="text-blue-700 text-sm space-y-1 list-disc list-inside">
                            <li>Obtenir une <strong>attestation d'expertise reconnue</strong></li>
                            <li>Recevoir une <strong>lettre de recommandation professionnelle</strong></li>
                            <li>Accéder à un <strong>accompagnement personnalisé</strong> et à des ressources premium</li>
                          </ul>
                        </div>
                        
                        <p className="text-blue-800 font-semibold text-center">
                          💼 Découvrez nos Programmes et Packs payants et donnez un vrai coup d'accélérateur à votre carrière !
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => {
                          onClose();
                          // Scroll to programs section after modal closes
                          setTimeout(() => {
                            const programsSection = document.getElementById('programs-section') || 
                                                  document.querySelector('[data-section="programs"]') ||
                                                  document.querySelector('.programs-container');
                            if (programsSection) {
                              programsSection.scrollIntoView({ 
                                behavior: 'smooth',
                                block: 'start'
                              });
                            }
                          }, 300);
                        }}
                        className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
                      >
                        <BookOpen className="w-5 h-5" />
                        Découvrir les Programmes & Packs
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FreeCourseModal;
