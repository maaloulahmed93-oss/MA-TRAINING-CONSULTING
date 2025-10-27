import React, { useState, useEffect } from 'react';
import freeCoursesApiService, { Domain, Course, CourseModule, FreeCourseAccess } from '../services/freeCoursesApiService';

interface Stats {
  domains: number;
  courses: number;
  modules: number;
  accessIds: number;
  totalUsage: number;
}

const FreeCoursesPage: React.FC = () => {
  // States
  const [domains, setDomains] = useState<Domain[]>([]);
  const [accessIds, setAccessIds] = useState<FreeCourseAccess[]>([]);
  const [stats, setStats] = useState<Stats>({ domains: 0, courses: 0, modules: 0, accessIds: 0, totalUsage: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'domains' | 'access'>('domains');
  
  // Form states
  const [showDomainForm, setShowDomainForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showAccessForm, setShowAccessForm] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  
  // Form data
  const [domainFormData, setDomainFormData] = useState({ domainId: '', title: '', icon: '📚', description: '', order: 0 });
  const [courseFormData, setCourseFormData] = useState({ courseId: '', domainId: '', title: '', description: '', order: 0 });
  const [moduleFormData, setModuleFormData] = useState({ moduleId: '', courseId: '', title: '', duration: '', url: '', order: 0 });
  const [accessFormData, setAccessFormData] = useState({ accessId: '', description: '', maxUsage: -1, expiresAt: '' });
  
  // Expandable sections
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [domainsData, accessData, statsData] = await Promise.all([
        freeCoursesApiService.getAdminDomains(),
        freeCoursesApiService.getAccessIds().then(ids => 
          Promise.all(ids.map(id => fetch(`https://matc-backend.onrender.com/api/free-courses/admin/access-ids`).then(r => r.json()).then(d => d.data.find((a: any) => a.accessId === id) || {})))
        ),
        fetch('https://matc-backend.onrender.com/api/free-courses/admin/stats').then(r => r.json()).then(d => d.data)
      ]);
      
      setDomains(domainsData);
      setAccessIds(accessData.flat() as any);
      setStats(statsData || stats);
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Domain handlers
  const handleCreateDomain = async () => {
    try {
      await freeCoursesApiService.createDomain(domainFormData);
      setShowDomainForm(false);
      setDomainFormData({ domainId: '', title: '', icon: '📚', description: '', order: 0 });
      loadData();
    } catch (error) {
      alert('Erreur lors de la création du domaine');
    }
  };

  const handleEditDomain = (domain: Domain) => {
    setEditingDomain(domain);
    setDomainFormData({ domainId: domain.id, title: domain.title, icon: domain.icon, description: domain.description, order: 0 });
    setShowDomainForm(true);
  };

  const handleUpdateDomain = async () => {
    if (!editingDomain) return;
    try {
      await freeCoursesApiService.updateDomain(editingDomain.id, {
        title: domainFormData.title,
        icon: domainFormData.icon,
        description: domainFormData.description
      });
      setShowDomainForm(false);
      setEditingDomain(null);
      setDomainFormData({ domainId: '', title: '', icon: '📚', description: '', order: 0 });
      loadData();
    } catch (error) {
      alert('Erreur lors de la modification du domaine');
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce domaine et tous ses cours?')) return;
    try {
      await freeCoursesApiService.deleteDomain(domainId);
      loadData();
    } catch (error) {
      alert('Erreur lors de la suppression du domaine');
    }
  };

  // Course handlers
  const handleCreateCourse = async () => {
    try {
      await freeCoursesApiService.createCourse(courseFormData.domainId, courseFormData);
      setShowCourseForm(false);
      setEditingCourse(null);
      setCourseFormData({ courseId: '', domainId: '', title: '', description: '', order: 0 });
      loadData();
    } catch (error) {
      alert('Erreur lors de la création du cours');
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseFormData({
      courseId: course.id,
      domainId: domains.find(d => d.courses.some(c => c.id === course.id))?.id || '',
      title: course.title,
      description: course.description,
      order: 0
    });
    setShowCourseForm(true);
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;
    try {
      await freeCoursesApiService.updateCourse(editingCourse.id, {
        title: courseFormData.title,
        description: courseFormData.description
      });
      setShowCourseForm(false);
      setEditingCourse(null);
      setCourseFormData({ courseId: '', domainId: '', title: '', description: '', order: 0 });
      loadData();
    } catch (error) {
      alert('Erreur lors de la modification du cours');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cours?')) return;
    try {
      await freeCoursesApiService.deleteCourse(courseId);
      loadData();
    } catch (error) {
      alert('Erreur lors de la suppression du cours');
    }
  };

  // Module handlers
  const handleCreateModule = async () => {
    try {
      await freeCoursesApiService.createModule(moduleFormData.courseId, {
        moduleId: parseInt(moduleFormData.moduleId),
        title: moduleFormData.title,
        duration: moduleFormData.duration,
        url: moduleFormData.url
      });
      setShowModuleForm(false);
      setEditingModule(null);
      setModuleFormData({ moduleId: '', courseId: '', title: '', duration: '', url: '', order: 0 });
      loadData();
    } catch (error) {
      alert('Erreur lors de la création du module');
    }
  };

  const handleUpdateModule = async () => {
    if (!editingModule) return;
    try {
      await freeCoursesApiService.updateModule(editingModule.id, moduleFormData.courseId, {
        title: moduleFormData.title,
        duration: moduleFormData.duration,
        url: moduleFormData.url
      });
      setShowModuleForm(false);
      setEditingModule(null);
      setModuleFormData({ moduleId: '', courseId: '', title: '', duration: '', url: '', order: 0 });
      loadData();
    } catch (error) {
      alert('Erreur lors de la modification du module');
    }
  };

  const handleDeleteModule = async (moduleId: number, courseId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce module?')) return;
    try {
      await freeCoursesApiService.deleteModule(moduleId, courseId);
      loadData();
    } catch (error) {
      alert('Erreur lors de la suppression du module');
    }
  };

  // Access ID handlers
  const handleCreateAccess = async () => {
    try {
      await freeCoursesApiService.addAccessId(accessFormData.accessId);
      setShowAccessForm(false);
      setAccessFormData({ accessId: '', description: '', maxUsage: -1, expiresAt: '' });
      loadData();
    } catch (error) {
      alert('Erreur lors de la création du code d\'accès');
    }
  };

  const handleDeleteAccess = async (accessId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code d\'accès?')) return;
    try {
      await freeCoursesApiService.deleteAccessId(accessId);
      loadData();
    } catch (error) {
      alert('Erreur lors de la suppression du code d\'accès');
    }
  };

  // Toggle expand
  const toggleDomain = (domainId: string) => {
    const newSet = new Set(expandedDomains);
    if (newSet.has(domainId)) newSet.delete(domainId);
    else newSet.add(domainId);
    setExpandedDomains(newSet);
  };

  const toggleCourse = (courseId: string) => {
    const newSet = new Set(expandedCourses);
    if (newSet.has(courseId)) newSet.delete(courseId);
    else newSet.add(courseId);
    setExpandedCourses(newSet);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cours Gratuits</h1>
        <p className="text-gray-600 mt-2">Gestion des cours gratuits et formations libres</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{stats.domains}</div>
          <div className="text-sm text-gray-600">Domaines</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{stats.courses}</div>
          <div className="text-sm text-gray-600">Cours</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{stats.modules}</div>
          <div className="text-sm text-gray-600">Modules</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{stats.accessIds}</div>
          <div className="text-sm text-gray-600">Codes d'accès</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{stats.totalUsage}</div>
          <div className="text-sm text-gray-600">Utilisations</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b">
        <button
          onClick={() => setActiveTab('domains')}
          className={`px-4 py-2 mr-2 ${activeTab === 'domains' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Domaines & Cours
        </button>
        <button
          onClick={() => setActiveTab('access')}
          className={`px-4 py-2 ${activeTab === 'access' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
        >
          Codes d'Accès
        </button>
      </div>

      {activeTab === 'domains' && (
        <div className="space-y-4">
          {/* Add Domain Button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Domaines</h2>
            <button
              onClick={() => {
                setEditingDomain(null);
                setShowDomainForm(true);
                setDomainFormData({ domainId: '', title: '', icon: '📚', description: '', order: 0 });
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Ajouter un Domaine
            </button>
          </div>

          {/* Domains List */}
          {domains.map((domain) => (
            <div key={domain.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <button onClick={() => toggleDomain(domain.id)} className="text-xl">
                    {expandedDomains.has(domain.id) ? '▼' : '▶'}
                  </button>
                  <span className="text-2xl">{domain.icon}</span>
                  <div>
                    <h3 className="font-semibold">{domain.title}</h3>
                    <p className="text-sm text-gray-600">{domain.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditDomain(domain)}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                  >
                    ✏️ Modifier
                  </button>
                  <button
                    onClick={() => handleDeleteDomain(domain.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    🗑️ Supprimer
                  </button>
                </div>
              </div>

              {expandedDomains.has(domain.id) && (
                <div className="mt-4 ml-8 space-y-4">
                  <button
                    onClick={() => {
                      setCourseFormData({ ...courseFormData, domainId: domain.id });
                      setShowCourseForm(true);
                    }}
                    className="px-3 py-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                  >
                    + Ajouter un Cours
                  </button>

                  {domain.courses.map((course) => (
                    <div key={course.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <button onClick={() => toggleCourse(course.id)} className="text-sm">
                            {expandedCourses.has(course.id) ? '▼' : '▶'}
                          </button>
                          <h4 className="font-semibold">{course.title}</h4>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditCourse(course)}
                            className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
                          >
                            ✏️ Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="px-2 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                          >
                            🗑️ Supprimer
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 ml-5 mb-2">{course.description}</p>

                      {expandedCourses.has(course.id) && (
                        <div className="ml-5 space-y-2">
                          <button
                            onClick={() => {
                              setModuleFormData({ ...moduleFormData, courseId: course.id });
                              setShowModuleForm(true);
                            }}
                            className="px-2 py-1 bg-purple-100 text-purple-600 rounded text-sm"
                          >
                            + Ajouter un Module
                          </button>

                          {course.modules.map((module) => (
                            <div key={module.id} className="bg-white rounded p-2 flex items-center justify-between">
                              <div className="flex-1">
                                <span className="font-medium">{module.title}</span>
                                <span className="text-sm text-gray-500 ml-2">{module.duration}</span>
                                {module.url && (
                                  <a
                                    href={module.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-3 px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs hover:bg-blue-200"
                                  >
                                    🔗 Accéder
                                  </a>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => {
                                    setEditingModule(module);
                                    setModuleFormData({
                                      moduleId: module.id.toString(),
                                      courseId: course.id,
                                      title: module.title,
                                      duration: module.duration,
                                      url: module.url || '',
                                      order: 0
                                    });
                                    setShowModuleForm(true);
                                  }}
                                  className="text-blue-600 text-sm hover:text-blue-800"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteModule(module.id, course.id)}
                                  className="text-red-600 text-sm hover:text-red-800"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'access' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Codes d'Accès</h2>
            <button
              onClick={() => setShowAccessForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Ajouter un Code
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Utilisations</th>
                  <th className="px-4 py-3 text-left">Limite</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accessIds.map((access: any) => (
                  <tr key={access.accessId} className="border-t">
                    <td className="px-4 py-3 font-mono">{access.accessId}</td>
                    <td className="px-4 py-3">{access.usageCount || 0}</td>
                    <td className="px-4 py-3">{access.maxUsage === -1 ? 'Illimité' : access.maxUsage}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDeleteAccess(access.accessId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Forms */}
      {showDomainForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">{editingDomain ? 'Modifier le Domaine' : 'Ajouter un Domaine'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID du Domaine</label>
                <input
                  type="text"
                  value={domainFormData.domainId}
                  onChange={(e) => setDomainFormData({ ...domainFormData, domainId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!!editingDomain}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input
                  type="text"
                  value={domainFormData.title}
                  onChange={(e) => setDomainFormData({ ...domainFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Icône</label>
                <input
                  type="text"
                  value={domainFormData.icon}
                  onChange={(e) => setDomainFormData({ ...domainFormData, icon: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={domainFormData.description}
                  onChange={(e) => setDomainFormData({ ...domainFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={editingDomain ? handleUpdateDomain : handleCreateDomain}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingDomain ? 'Modifier' : 'Créer'}
                </button>
                <button
                  onClick={() => {
                    setShowDomainForm(false);
                    setEditingDomain(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCourseForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">{editingCourse ? 'Modifier le Cours' : 'Ajouter un Cours'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID du Cours</label>
                <input
                  type="text"
                  value={courseFormData.courseId}
                  onChange={(e) => setCourseFormData({ ...courseFormData, courseId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!!editingCourse}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input
                  type="text"
                  value={courseFormData.title}
                  onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={editingCourse ? handleUpdateCourse : handleCreateCourse}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingCourse ? 'Modifier' : 'Créer'}
                </button>
                <button
                  onClick={() => {
                    setShowCourseForm(false);
                    setEditingCourse(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModuleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">{editingModule ? 'Modifier le Module' : 'Ajouter un Module'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">ID du Module</label>
                <input
                  type="number"
                  value={moduleFormData.moduleId}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, moduleId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!!editingModule}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Titre</label>
                <input
                  type="text"
                  value={moduleFormData.title}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Durée</label>
                <input
                  type="text"
                  value={moduleFormData.duration}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, duration: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="ex: 30 min"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL (optionnel)</label>
                <input
                  type="text"
                  value={moduleFormData.url}
                  onChange={(e) => setModuleFormData({ ...moduleFormData, url: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={editingModule ? handleUpdateModule : handleCreateModule}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  {editingModule ? 'Modifier' : 'Créer'}
                </button>
                <button
                  onClick={() => {
                    setShowModuleForm(false);
                    setEditingModule(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showAccessForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">Ajouter un Code d'Accès</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Code d'Accès</label>
                <input
                  type="text"
                  value={accessFormData.accessId}
                  onChange={(e) => setAccessFormData({ ...accessFormData, accessId: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg font-mono"
                  placeholder="ex: ACCESS123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={accessFormData.description}
                  onChange={(e) => setAccessFormData({ ...accessFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateAccess}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Créer
                </button>
                <button
                  onClick={() => setShowAccessForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreeCoursesPage;
