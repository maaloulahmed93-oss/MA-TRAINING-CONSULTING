import React, { useState, useEffect } from 'react';
import { coursesData as initialCoursesData } from '../../data/coursesData';
import { Domain, Course, CourseModule } from '../../types/courses';
import { PlusCircle, Edit, Trash2, ChevronDown, ChevronRight, X, Link, KeyRound, Wifi, WifiOff } from 'lucide-react';
import { freeCoursesApiService } from '../../services/freeCoursesApiService';

const FreeCoursesManager: React.FC = () => {
  // API Connection State
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Data State
  const [domains, setDomains] = useState<Domain[]>(initialCoursesData.domains);
  const [accessIds, setAccessIds] = useState<string[]>(initialCoursesData.validAccessIds);
  const [newAccessId, setNewAccessId] = useState('');
  const [openDomainId, setOpenDomainId] = useState<string | null>(initialCoursesData.domains[0]?.id || null);
  const [openCourseId, setOpenCourseId] = useState<string | null>(null);

  // Domain Modal State
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [domainForm, setDomainForm] = useState<Omit<Domain, 'courses'>>({ id: '', title: '', icon: '', description: '' });

  // Course Modal State
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState<Omit<Course, 'modules'>>({ id: '', title: '', description: '' });
  const [currentDomainId, setCurrentDomainId] = useState<string | null>(null);

  // Module Modal State
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [moduleForm, setModuleForm] = useState<Omit<CourseModule, 'id'>>({ title: '', duration: '', url: '' });
  const [currentCourseId, setCurrentCourseId] = useState<string | null>(null);

  // Initialize API connection and load data
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setIsLoading(true);
    setApiError(null);
    
    try {
      console.log('🔄 Initialisation connexion API...');
      
      // Test API connection
      const connectionTest = await freeCoursesApiService.testConnection();
      console.log('🔍 Test connexion:', connectionTest);
      
      if (connectionTest.api && connectionTest.domains) {
        // API is working - load from API
        setIsApiConnected(true);
        await loadDataFromApi();
        console.log('✅ Données chargées depuis l\'API');
      } else {
        // API not available - use localStorage fallback
        setIsApiConnected(false);
        loadDataFromLocalStorage();
        console.log('📱 Fallback vers localStorage');
      }
    } catch (error) {
      console.error('❌ Erreur initialisation:', error);
      setApiError(error instanceof Error ? error.message : 'Erreur de connexion');
      setIsApiConnected(false);
      loadDataFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadDataFromApi = async () => {
    try {
      const [apiDomains, apiAccessIds] = await Promise.all([
        freeCoursesApiService.getDomains(),
        freeCoursesApiService.getAccessIds()
      ]);
      
      console.log('📊 Données API reçues:', { 
        domains: apiDomains.length, 
        accessIds: apiAccessIds.length 
      });
      
      setDomains(apiDomains);
      setAccessIds(apiAccessIds); // getAccessIds() returns string[] directly
    } catch (error) {
      console.error('❌ Erreur chargement API:', error);
      throw error;
    }
  };

  const loadDataFromLocalStorage = () => {
    try {
      const storedDomains = localStorage.getItem('free_courses_domains');
      const storedAccessIds = localStorage.getItem('free_courses_access_ids');
      
      if (storedDomains) {
        setDomains(JSON.parse(storedDomains));
      }
      
      if (storedAccessIds) {
        setAccessIds(JSON.parse(storedAccessIds));
      }
    } catch (error) {
      console.error('❌ Erreur localStorage:', error);
      // Keep initial data if localStorage fails
    }
  };

  const saveToLocalStorage = (newDomains?: Domain[], newAccessIds?: string[]) => {
    try {
      if (newDomains) {
        localStorage.setItem('free_courses_domains', JSON.stringify(newDomains));
      }
      if (newAccessIds) {
        localStorage.setItem('free_courses_access_ids', JSON.stringify(newAccessIds));
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde localStorage:', error);
    }
  };



  // --- Access ID Handlers ---
  const handleAddAccessId = async () => {
    const trimmedId = newAccessId.trim();
    if (!trimmedId || accessIds.includes(trimmedId)) return;

    try {
      if (isApiConnected) {
        // Try API first
        await freeCoursesApiService.addAccessId(trimmedId);
        console.log('✅ ID ajouté via API:', trimmedId);
      }
      
      // Update local state
      const newAccessIds = [...accessIds, trimmedId];
      setAccessIds(newAccessIds);
      setNewAccessId('');
      
      // Save to localStorage as backup
      saveToLocalStorage(undefined, newAccessIds);
      
    } catch (error) {
      console.error('❌ Erreur ajout ID:', error);
      // Fallback to localStorage only
      const newAccessIds = [...accessIds, trimmedId];
      setAccessIds(newAccessIds);
      setNewAccessId('');
      saveToLocalStorage(undefined, newAccessIds);
    }
  };

  const handleDeleteAccessId = async (idToDelete: string) => {
    try {
      if (isApiConnected) {
        // Try API first
        await freeCoursesApiService.deleteAccessId(idToDelete);
        console.log('✅ ID supprimé via API:', idToDelete);
      }
      
      // Update local state
      const newAccessIds = accessIds.filter(id => id !== idToDelete);
      setAccessIds(newAccessIds);
      
      // Save to localStorage as backup
      saveToLocalStorage(undefined, newAccessIds);
      
    } catch (error) {
      console.error('❌ Erreur suppression ID:', error);
      // Fallback to localStorage only
      const newAccessIds = accessIds.filter(id => id !== idToDelete);
      setAccessIds(newAccessIds);
      saveToLocalStorage(undefined, newAccessIds);
    }
  };

  const toggleDomain = (id: string) => {
    setOpenDomainId(openDomainId === id ? null : id);
    setOpenCourseId(null); // Close courses when domain is toggled
  };

  const toggleCourse = (id: string) => {
    setOpenCourseId(openCourseId === id ? null : id);
  };

  // --- Domain Handlers ---
  const handleOpenAddDomainModal = () => {
    setEditingDomain(null);
    setDomainForm({ id: '', title: '', icon: '', description: '' });
    setIsDomainModalOpen(true);
  };

  const handleOpenEditDomainModal = (domain: Domain) => {
    setEditingDomain(domain);
    setDomainForm(domain);
    setIsDomainModalOpen(true);
  };

  const handleCloseDomainModal = () => {
    setIsDomainModalOpen(false);
    setEditingDomain(null);
  };

  const handleSaveDomain = async () => {
    if (!domainForm.title || !domainForm.icon || !domainForm.description) return;

    try {
      if (editingDomain) {
        // Update existing domain
        if (isApiConnected) {
          await freeCoursesApiService.updateDomain(editingDomain.id, domainForm);
          console.log('✅ Domaine mis à jour via API:', domainForm.title);
        }
        
        // Update local state
        const updatedDomains = domains.map(d => d.id === editingDomain.id ? { ...d, ...domainForm } : d);
        setDomains(updatedDomains);
        saveToLocalStorage(updatedDomains);
      } else {
        // Create new domain
        const newDomainData = {
          domainId: domainForm.id || `domain-${Date.now()}`,
          title: domainForm.title,
          icon: domainForm.icon,
          description: domainForm.description
        };

        if (isApiConnected) {
          const savedDomain = await freeCoursesApiService.createDomain(newDomainData);
          console.log('✅ Domaine créé via API:', savedDomain);
          
          // Use the domain returned from API
          const newDomain: Domain = {
            id: savedDomain.domainId || newDomainData.domainId,
            title: savedDomain.title,
            icon: savedDomain.icon,
            description: savedDomain.description,
            courses: []
          };
          
          const updatedDomains = [...domains, newDomain];
          setDomains(updatedDomains);
          saveToLocalStorage(updatedDomains);
        } else {
          // Fallback to localStorage only
          const newDomain: Domain = { 
            ...domainForm, 
            id: newDomainData.domainId, 
            courses: [] 
          };
          const updatedDomains = [...domains, newDomain];
          setDomains(updatedDomains);
          saveToLocalStorage(updatedDomains);
        }
      }
      
      handleCloseDomainModal();
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde domaine:', error);
      
      // Fallback to localStorage
      if (editingDomain) {
        const updatedDomains = domains.map(d => d.id === editingDomain.id ? { ...d, ...domainForm } : d);
        setDomains(updatedDomains);
        saveToLocalStorage(updatedDomains);
      } else {
        const newDomain: Domain = { 
          ...domainForm, 
          id: domainForm.id || `domain-${Date.now()}`, 
          courses: [] 
        };
        const updatedDomains = [...domains, newDomain];
        setDomains(updatedDomains);
        saveToLocalStorage(updatedDomains);
      }
      
      handleCloseDomainModal();
      alert('⚠️ Domaine sauvegardé localement. Vérifiez la connexion API.');
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce domaine ?')) {
      try {
        if (isApiConnected) {
          await freeCoursesApiService.deleteDomain(domainId);
          console.log('✅ Domaine supprimé via API:', domainId);
        }
        
        // Update local state
        const updatedDomains = domains.filter(d => d.id !== domainId);
        setDomains(updatedDomains);
        saveToLocalStorage(updatedDomains);
        
      } catch (error) {
        console.error('❌ Erreur suppression domaine:', error);
        
        // Fallback to localStorage only
        const updatedDomains = domains.filter(d => d.id !== domainId);
        setDomains(updatedDomains);
        saveToLocalStorage(updatedDomains);
        
        alert('⚠️ Domaine supprimé localement. Vérifiez la connexion API.');
      }
    }
  };

  // --- Course Handlers ---
  const handleOpenAddCourseModal = (domainId: string) => {
    setCurrentDomainId(domainId);
    setEditingCourse(null);
    setCourseForm({ id: '', title: '', description: '' });
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourseModal = (course: Course, domainId: string) => {
    setCurrentDomainId(domainId);
    setEditingCourse(course);
    setCourseForm(course);
    setIsCourseModalOpen(true);
  };

  const handleCloseCourseModal = () => {
    setIsCourseModalOpen(false);
    setEditingCourse(null);
    setCurrentDomainId(null);
  };

  const handleSaveCourse = async () => {
    if (!courseForm.title || !currentDomainId) return;
    
    try {
      const courseAction = (courses: Course[]) => {
        if (editingCourse) {
          return courses.map(c => c.id === editingCourse.id ? { ...c, ...courseForm } : c);
        } else {
          const newCourse: Course = { ...courseForm, id: `course-${Date.now()}`, modules: [] };
          return [...courses, newCourse];
        }
      };
      
      // Update local state
      const updatedDomains = domains.map(d => d.id === currentDomainId ? { ...d, courses: courseAction(d.courses) } : d);
      setDomains(updatedDomains);
      
      // Save to localStorage as backup
      saveToLocalStorage(updatedDomains);
      
      // Save to API if connected
      if (isApiConnected) {
        try {
          if (editingCourse) {
            await freeCoursesApiService.updateCourse(editingCourse.id, {
              title: courseForm.title,
              description: courseForm.description
            });
            console.log('✅ Course mis à jour via API:', courseForm.title);
          } else {
            const newCourseData = {
              courseId: `course-${Date.now()}`,
              title: courseForm.title,
              description: courseForm.description
            };
            await freeCoursesApiService.createCourse(currentDomainId, newCourseData);
            console.log('✅ Course créé via API:', courseForm.title);
          }
        } catch (apiError) {
          console.error('❌ API Error for course:', apiError);
          // Continue with localStorage fallback
        }
      }
      
      handleCloseCourseModal();
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde course:', error);
      
      // Fallback to localStorage only
      const courseAction = (courses: Course[]) => {
        if (editingCourse) {
          return courses.map(c => c.id === editingCourse.id ? { ...c, ...courseForm } : c);
        } else {
          const newCourse: Course = { ...courseForm, id: `course-${Date.now()}`, modules: [] };
          return [...courses, newCourse];
        }
      };
      
      const updatedDomains = domains.map(d => d.id === currentDomainId ? { ...d, courses: courseAction(d.courses) } : d);
      setDomains(updatedDomains);
      saveToLocalStorage(updatedDomains);
      
      handleCloseCourseModal();
      alert('⚠️ Cours sauvegardé localement. API integration à venir.');
    }
  };

  const handleDeleteCourse = async (domainId: string, courseId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        // Update local state
        const updatedDomains = domains.map(d => d.id === domainId ? { ...d, courses: d.courses.filter(c => c.id !== courseId) } : d);
        setDomains(updatedDomains);
        
        // Save to localStorage as backup
        saveToLocalStorage(updatedDomains);
        
        // Delete from API if connected
        if (isApiConnected) {
          try {
            await freeCoursesApiService.deleteCourse(courseId);
            console.log('✅ Course supprimé via API:', courseId);
          } catch (apiError) {
            console.error('❌ API Error for course deletion:', apiError);
            // Continue with localStorage fallback
          }
        }
        
      } catch (error) {
        console.error('❌ Erreur suppression course:', error);
        
        // Fallback to localStorage only
        const updatedDomains = domains.map(d => d.id === domainId ? { ...d, courses: d.courses.filter(c => c.id !== courseId) } : d);
        setDomains(updatedDomains);
        saveToLocalStorage(updatedDomains);
        
        alert('⚠️ Cours supprimé localement. API integration à venir.');
      }
    }
  };

  // --- Module Handlers ---
  const handleOpenAddModuleModal = (domainId: string, courseId: string) => {
    setCurrentDomainId(domainId);
    setCurrentCourseId(courseId);
    setEditingModule(null);
    setModuleForm({ title: '', duration: '', url: '' });
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModuleModal = (module: CourseModule, courseId: string, domainId: string) => {
    setCurrentDomainId(domainId);
    setCurrentCourseId(courseId);
    setEditingModule(module);
    setModuleForm({ title: module.title, duration: module.duration, url: module.url || '' });
    setIsModuleModalOpen(true);
  };

  const handleCloseModuleModal = () => {
    setIsModuleModalOpen(false);
    setEditingModule(null);
    setCurrentDomainId(null);
    setCurrentCourseId(null);
  };

  const handleSaveModule = async () => {
    if (!moduleForm.title || !currentDomainId || !currentCourseId) return;

    try {
      const moduleAction = (modules: CourseModule[]) => {
        if (editingModule) {
          return modules.map(m => m.id === editingModule.id ? { ...m, ...moduleForm } : m);
        } else {
          const newModule: CourseModule = { ...moduleForm, id: Date.now() };
          return [...modules, newModule];
        }
      };

      // Update local state
      const updatedDomains = domains.map(d => 
        d.id === currentDomainId 
          ? { ...d, courses: d.courses.map(c => 
              c.id === currentCourseId 
                ? { ...c, modules: moduleAction(c.modules) } 
                : c
            ) }
          : d
      );
      
      setDomains(updatedDomains);
      
      // Save to localStorage as backup
      saveToLocalStorage(updatedDomains);
      
      // Save to API if connected
      if (isApiConnected) {
        try {
          if (editingModule) {
            await freeCoursesApiService.updateModule(editingModule.id, currentCourseId, {
              title: moduleForm.title,
              duration: moduleForm.duration,
              url: moduleForm.url
            });
            console.log('✅ Module mis à jour via API:', moduleForm.title);
          } else {
            const newModuleData = {
              moduleId: Date.now(),
              title: moduleForm.title,
              duration: moduleForm.duration,
              url: moduleForm.url
            };
            await freeCoursesApiService.createModule(currentCourseId, newModuleData);
            console.log('✅ Module créé via API:', moduleForm.title);
          }
        } catch (apiError) {
          console.error('❌ API Error for module:', apiError);
          // Continue with localStorage fallback
        }
      }
      
      handleCloseModuleModal();
      
    } catch (error) {
      console.error('❌ Erreur sauvegarde module:', error);
      
      // Fallback to localStorage only
      const moduleAction = (modules: CourseModule[]) => {
        if (editingModule) {
          return modules.map(m => m.id === editingModule.id ? { ...m, ...moduleForm } : m);
        } else {
          const newModule: CourseModule = { ...moduleForm, id: Date.now() };
          return [...modules, newModule];
        }
      };

      const updatedDomains = domains.map(d => 
        d.id === currentDomainId 
          ? { ...d, courses: d.courses.map(c => 
              c.id === currentCourseId 
                ? { ...c, modules: moduleAction(c.modules) } 
                : c
            ) }
          : d
      );
      
      setDomains(updatedDomains);
      saveToLocalStorage(updatedDomains);
      
      handleCloseModuleModal();
      alert('⚠️ Module sauvegardé localement. API integration à venir.');
    }
  };

  const handleDeleteModule = async (moduleId: number, courseId: string, domainId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce module ?')) {
      try {
        // Update local state
        const updatedDomains = domains.map(d => 
          d.id === domainId 
            ? { ...d, courses: d.courses.map(c => 
                c.id === courseId 
                  ? { ...c, modules: c.modules.filter(m => m.id !== moduleId) }
                  : c
              ) }
            : d
        );
        
        setDomains(updatedDomains);
        
        // Save to localStorage as backup
        saveToLocalStorage(updatedDomains);
        
        // Delete from API if connected
        if (isApiConnected) {
          try {
            await freeCoursesApiService.deleteModule(moduleId, courseId);
            console.log('✅ Module supprimé via API:', moduleId);
          } catch (apiError) {
            console.error('❌ API Error for module deletion:', apiError);
            // Continue with localStorage fallback
          }
        }
        
      } catch (error) {
        console.error('❌ Erreur suppression module:', error);
        
        // Fallback to localStorage only
        const updatedDomains = domains.map(d => 
          d.id === domainId 
            ? { ...d, courses: d.courses.map(c => 
                c.id === courseId 
                  ? { ...c, modules: c.modules.filter(m => m.id !== moduleId) }
                  : c
              ) }
            : d
        );
        
        setDomains(updatedDomains);
        saveToLocalStorage(updatedDomains);
        
        alert('⚠️ Module supprimé localement. API integration à venir.');
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            Gestion des Cours Gratuits
            {isLoading ? (
              <div className="ml-3 animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            ) : (
              <div className="ml-3 flex items-center">
                {isApiConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">API MongoDB</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600">
                    <WifiOff className="h-5 w-5 mr-1" />
                    <span className="text-sm font-medium">Mode Local</span>
                  </div>
                )}
              </div>
            )}
          </h1>
          <p className="text-gray-600 mt-2">
            Gérez les domaines, cours, modules et IDs d'accès
            {apiError && (
              <span className="block text-red-500 text-sm mt-1">
                ⚠️ {apiError}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={initializeData} 
            className="bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 flex items-center text-sm"
            disabled={isLoading}
          >
            🔄 Actualiser
          </button>
          <button onClick={handleOpenAddDomainModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center shadow-md">
            <PlusCircle className="mr-2 h-5 w-5" />
            Ajouter un Domaine
          </button>
        </div>
      </div>

      {/* Access ID Management */}
      <div className="mb-6 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center"><KeyRound className="mr-2"/>Gestion des IDs d'Accès</h2>
        <div className="flex items-start gap-8">
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">Ajouter un ID</h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newAccessId}
                onChange={(e) => setNewAccessId(e.target.value)}
                placeholder="Ex: NEW-STUDENT-2025"
                className="w-full p-2 border rounded"
              />
              <button onClick={handleAddAccessId} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Ajouter</button>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium mb-2">IDs Actifs ({accessIds.length})</h3>
            <div className="max-h-32 overflow-y-auto pr-2 space-y-2">
              {accessIds.map(id => (
                <div key={id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                  <span className="font-mono text-gray-800">{id}</span>
                  <button onClick={() => handleDeleteAccessId(id)} className="text-gray-500 hover:text-red-600"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Domains List */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Liste des Domaines</h2>
        <div className="space-y-3">
          {domains.map((domain) => (
            <div key={domain.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 bg-gray-100 cursor-pointer hover:bg-gray-200" onClick={() => toggleDomain(domain.id)}>
                <div className="flex items-center">
                  <span className="text-2xl mr-4">{domain.icon}</span>
                  <span className="font-semibold text-lg text-gray-800">{domain.title}</span>
                  <span className="ml-4 text-sm text-gray-500">({domain.courses.length} cours)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button onClick={(e) => { e.stopPropagation(); handleOpenEditDomainModal(domain); }} className="p-2 text-gray-500 hover:text-blue-600"><Edit className="h-5 w-5" /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteDomain(domain.id); }} className="p-2 text-gray-500 hover:text-red-600"><Trash2 className="h-5 w-5" /></button>
                  {openDomainId === domain.id ? <ChevronDown /> : <ChevronRight />}
                </div>
              </div>
              {openDomainId === domain.id && (
                <div className="p-4 border-t border-gray-200 bg-white">
                  <h3 className="font-semibold mb-3 text-gray-700">Cours dans "{domain.title}":</h3>
                  <div className="space-y-2">
                    {domain.courses.map((course) => (
                      <div key={course.id} className="border border-gray-200 rounded-md">
                        <div className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100" onClick={() => toggleCourse(course.id)}>
                          <span className="font-medium text-gray-800">{course.title}</span>
                          <div className="flex items-center space-x-2">
                            <button onClick={(e) => { e.stopPropagation(); handleOpenEditCourseModal(course, domain.id); }} className="p-1 text-gray-500 hover:text-blue-600"><Edit className="h-4 w-4" /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDeleteCourse(domain.id, course.id); }} className="p-1 text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                            {openCourseId === course.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </div>
                        </div>
                        {openCourseId === course.id && (
                          <div className="p-3 border-t border-gray-200">
                            <h4 className="font-semibold text-sm mb-2 text-gray-600">Modules:</h4>
                            {course.modules.length > 0 ? (
                              <ul className="space-y-1 pl-4">
                                {course.modules.map(module => (
                                  <li key={module.id} className="flex justify-between items-center text-sm text-gray-700">
                                    <span className="flex items-center">
                                      {module.title} ({module.duration})
                                      {module.url && <a href={module.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:text-blue-700"><Link className="h-4 w-4" /></a>}
                                    </span>
                                    <div className="flex items-center space-x-1">
                                      <button onClick={(e) => { e.stopPropagation(); handleOpenEditModuleModal(module, course.id, domain.id); }} className="p-1 text-gray-400 hover:text-blue-500"><Edit size={14} /></button>
                                      <button onClick={(e) => { e.stopPropagation(); handleDeleteModule(module.id, course.id, domain.id); }} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500 pl-4">Aucun module pour ce cours.</p>
                            )}
                            <button onClick={(e) => { e.stopPropagation(); handleOpenAddModuleModal(domain.id, course.id); }} className="mt-2 bg-teal-500 text-white px-2 py-1 rounded hover:bg-teal-600 flex items-center text-xs">
                              <PlusCircle size={14} className="mr-1" />
                              Ajouter Module
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); handleOpenAddCourseModal(domain.id); }} className="mt-4 bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 flex items-center text-sm">
                    <PlusCircle className="mr-1 h-4 w-4" />
                    Ajouter un Cours
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Domain Modal */}
      {isDomainModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{editingDomain ? 'Modifier le Domaine' : 'Ajouter un Domaine'}</h2>
              <button onClick={handleCloseDomainModal}><X /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label>Titre</label>
                <input type="text" value={domainForm.title} onChange={(e) => setDomainForm({ ...domainForm, title: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label>Icône</label>
                <input type="text" value={domainForm.icon} onChange={(e) => setDomainForm({ ...domainForm, icon: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label>Description</label>
                <textarea value={domainForm.description} onChange={(e) => setDomainForm({ ...domainForm, description: e.target.value })} className="w-full p-2 border rounded"></textarea>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={handleCloseDomainModal} className="mr-2">Annuler</button>
              <button onClick={handleSaveDomain} className="bg-blue-600 text-white px-4 py-2 rounded">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Course Modal */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{editingCourse ? 'Modifier le Cours' : 'Ajouter un Cours'}</h2>
              <button onClick={handleCloseCourseModal}><X /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label>Titre</label>
                <input type="text" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label>Description</label>
                <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} className="w-full p-2 border rounded"></textarea>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={handleCloseCourseModal} className="mr-2">Annuler</button>
              <button onClick={handleSaveCourse} className="bg-blue-600 text-white px-4 py-2 rounded">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Module Modal */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">{editingModule ? 'Modifier le Module' : 'Ajouter un Module'}</h2>
              <button onClick={handleCloseModuleModal}><X /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label>Titre du module</label>
                <input type="text" value={moduleForm.title} onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })} className="w-full p-2 border rounded" />
              </div>
              <div>
                <label>Durée</label>
                <input type="text" value={moduleForm.duration} onChange={(e) => setModuleForm({ ...moduleForm, duration: e.target.value })} className="w-full p-2 border rounded" placeholder="Ex: 2h 30min" />
              </div>
              <div>
                <label>URL du Module</label>
                <input type="url" value={moduleForm.url || ''} onChange={(e) => setModuleForm({ ...moduleForm, url: e.target.value })} className="w-full p-2 border rounded" placeholder="https://..." />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={handleCloseModuleModal} className="mr-2">Annuler</button>
              <button onClick={handleSaveModule} className="bg-blue-600 text-white px-4 py-2 rounded">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeCoursesManager;
