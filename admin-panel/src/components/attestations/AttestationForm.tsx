import React, { useState, useEffect } from 'react';
import { PlusIcon, XMarkIcon, DocumentArrowUpIcon, CheckCircleIcon, LinkIcon } from '@heroicons/react/24/outline';
import { attestationsApi, type Attestation, type Program } from '../../services/attestationsApi';

interface AttestationFormProps {
  onSubmit: (success: boolean) => void;
  onCancel: () => void;
  initialData?: Attestation | null;
}

const AttestationForm: React.FC<AttestationFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    programId: '',
    dateObtention: '',
    note: '',
    niveau: 'Intermédiaire' as 'Débutant' | 'Intermédiaire' | 'Avancé',
  });
  
  // Dynamic arrays for skills and techniques
  const [skills, setSkills] = useState<string[]>(['']);
  const [techniques, setTechniques] = useState<string[]>(['']);
  
  // File upload state for 3 document types
  const [uploadedFiles, setUploadedFiles] = useState<{
    attestation: File | null;
    recommandation: File | null;
    evaluation: File | null;
  }>({ attestation: null, recommandation: null, evaluation: null });
  
  // URL input state for 3 document types
  const [documentUrls, setDocumentUrls] = useState<{
    attestation: string;
    recommandation: string;
    evaluation: string;
  }>({ attestation: '', recommandation: '', evaluation: '' });
  
  // Toggle between upload and URL input
  const [inputMode, setInputMode] = useState<{
    attestation: 'upload' | 'url';
    recommandation: 'upload' | 'url';
    evaluation: 'upload' | 'url';
  }>({ attestation: 'upload', recommandation: 'upload', evaluation: 'upload' });
  
  // Programs list and loading states
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load programs on component mount
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setIsLoading(true);
        const programsData = await attestationsApi.getPrograms();
        setPrograms(programsData);
      } catch (error) {
        console.error('Error loading programs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPrograms();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName,
        programId: initialData.programId,
        dateObtention: initialData.dateObtention.split('T')[0], // Format for date input
        note: initialData.note.toString(),
        niveau: initialData.niveau,
      });
      setSkills(initialData.skills.length > 0 ? initialData.skills : ['']);
      setTechniques(initialData.techniques.length > 0 ? initialData.techniques : ['']);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'niveau') {
      setFormData(prev => ({ ...prev, niveau: value as 'Débutant' | 'Intermédiaire' | 'Avancé' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Dynamic skills handlers
  const addSkill = () => {
    setSkills([...skills, '']);
  };

  const removeSkill = (index: number) => {
    if (skills.length > 1) {
      setSkills(skills.filter((_, i) => i !== index));
    }
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...skills];
    newSkills[index] = value;
    setSkills(newSkills);
  };

  // Dynamic techniques handlers
  const addTechnique = () => {
    setTechniques([...techniques, '']);
  };

  const removeTechnique = (index: number) => {
    if (techniques.length > 1) {
      setTechniques(techniques.filter((_, i) => i !== index));
    }
  };

  const updateTechnique = (index: number, value: string) => {
    const newTechniques = [...techniques];
    newTechniques[index] = value;
    setTechniques(newTechniques);
  };

  // File upload handlers for different document types
  const handleFileUpload = (type: 'attestation' | 'recommandation' | 'evaluation', file: File | null) => {
    setUploadedFiles(prev => ({ ...prev, [type]: file }));
  };
  
  // URL input handlers
  const handleUrlChange = (type: 'attestation' | 'recommandation' | 'evaluation', url: string) => {
    setDocumentUrls(prev => ({ ...prev, [type]: url }));
  };
  
  // Toggle input mode
  const toggleInputMode = (type: 'attestation' | 'recommandation' | 'evaluation') => {
    setInputMode(prev => ({
      ...prev,
      [type]: prev[type] === 'upload' ? 'url' : 'upload'
    }));
    // Clear the other input when switching
    if (inputMode[type] === 'upload') {
      setUploadedFiles(prev => ({ ...prev, [type]: null }));
    } else {
      setDocumentUrls(prev => ({ ...prev, [type]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName.trim()) {
      alert('Le nom complet est requis');
      return;
    }
    
    if (!formData.programId) {
      alert('Veuillez sélectionner un programme');
      return;
    }
    
    if (!formData.note || parseFloat(formData.note) < 0 || parseFloat(formData.note) > 20) {
      alert('La note doit être entre 0 et 20');
      return;
    }
    
    // En mode création, l'attestation est requise (soit upload soit URL)
    // En mode édition, l'upload est optionnel (garde les fichiers existants si non uploadé)
    if (!initialData && !uploadedFiles.attestation && !documentUrls.attestation.trim()) {
      alert('Veuillez uploader le fichier PDF de l\'attestation ou fournir un lien URL (requis)');
      return;
    }
    
    // Validate URLs if provided
    const urlFields: Array<'attestation' | 'recommandation' | 'evaluation'> = ['attestation', 'recommandation', 'evaluation'];
    for (const field of urlFields) {
      if (documentUrls[field].trim() && !documentUrls[field].match(/^https?:\/\/.+/)) {
        alert(`L'URL du ${field} doit commencer par http:// ou https://`);
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare URLs object for documents
      const urls: { attestation?: string; recommandation?: string; evaluation?: string } = {};
      
      // Collect URLs from input fields
      if (documentUrls.attestation.trim()) {
        urls.attestation = documentUrls.attestation.trim();
      }
      if (documentUrls.recommandation.trim()) {
        urls.recommandation = documentUrls.recommandation.trim();
      }
      if (documentUrls.evaluation.trim()) {
        urls.evaluation = documentUrls.evaluation.trim();
      }
      
      // Prepare attestation data
      const attestationData = {
        fullName: formData.fullName.trim(),
        programId: formData.programId,
        dateObtention: formData.dateObtention || new Date().toISOString().split('T')[0],
        note: parseFloat(formData.note),
        niveau: formData.niveau,
        skills: skills.filter(skill => skill.trim() !== ''),
        techniques: techniques.filter(technique => technique.trim() !== ''),
      };
      
      // Use create or update based on whether we have initial data
      if (initialData) {
        await attestationsApi.update(initialData.attestationId, attestationData, uploadedFiles, urls);
      } else {
        await attestationsApi.create(attestationData, uploadedFiles, urls);
      }
      onSubmit(true);
      
    } catch (error) {
      console.error('Error saving attestation:', error);
      const action = initialData ? 'mise à jour' : 'création';
      
      // Better error message for connection issues
      let errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('ERR_CONNECTION_CLOSED')) {
        errorMessage = 'Le serveur backend est en cours de démarrage. Veuillez patienter 30 secondes et réessayer.';
      }
      
      alert(`Erreur lors de la ${action} de l'attestation: ${errorMessage}`);
      onSubmit(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 📌 Informations du titulaire */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            📌 Informations du titulaire
          </h3>
          {/* ID will be auto-generated by backend */}
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Nom complet</label>
            <input 
              type="text" 
              name="fullName" 
              id="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
              placeholder="Ex: Ahmed Ben Ali"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              required 
              disabled={isSubmitting}
            />
          </div>
          <div className="mt-4">
            <label htmlFor="programId" className="block text-sm font-medium text-gray-700 mb-2">Programme suivi</label>
            <select 
              name="programId" 
              id="programId" 
              value={formData.programId} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              required
              disabled={isLoading || isSubmitting}
            >
              <option value="">Sélectionner un programme...</option>
              {programs.map((program) => (
                <option key={program._id} value={program._id}>
                  {program.title} ({program.level})
                </option>
              ))}
            </select>
            {isLoading && <p className="text-xs text-gray-500 mt-1">Chargement des programmes...</p>}
          </div>
          <div className="mt-4">
            <label htmlFor="dateObtention" className="block text-sm font-medium text-gray-700 mb-2">Date d'obtention</label>
            <input 
              type="date" 
              name="dateObtention" 
              id="dateObtention" 
              value={formData.dateObtention} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* 📌 Évaluation */}
        <div className="bg-yellow-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            📌 Évaluation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">Note obtenue (/ 20)</label>
              <input 
                type="number" 
                name="note" 
                id="note" 
                value={formData.note} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                step="0.1" 
                min="0" 
                max="20" 
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="niveau" className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
              <select 
                name="niveau" 
                id="niveau" 
                value={formData.niveau} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
              </select>
            </div>
          </div>
        </div>

        {/* 📌 Compétences acquises */}
        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            📌 Compétences acquises
          </h3>
          <p className="text-sm text-gray-600 mb-3">Liste compétences</p>
          <div className="space-y-3">
            {skills.map((skill, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => updateSkill(index, e.target.value)}
                  placeholder={`Compétence ${index + 1} (ex: React, Figma, Python...)`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
                {skills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSkill}
              className="flex items-center space-x-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Ajouter une compétence</span>
            </button>
          </div>
        </div>

        {/* 📌 Techniques maîtrisées */}
        <div className="bg-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            📌 Techniques maîtrisées
          </h3>
          <p className="text-sm text-gray-600 mb-3">Tags</p>
          <div className="space-y-3">
            {techniques.map((technique, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={technique}
                  onChange={(e) => updateTechnique(index, e.target.value)}
                  placeholder={`Technique ${index + 1} (ex: API REST, Design System...)`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isSubmitting}
                />
                {techniques.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTechnique(index)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addTechnique}
              className="flex items-center space-x-2 px-4 py-2 text-purple-600 border border-purple-300 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Ajouter une technique</span>
            </button>
          </div>
        </div>

        {/* 📌 Documents disponibles */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            📌 Documents disponibles
          </h3>
          <p className="text-sm text-gray-600 mb-2">Uploadez les documents PDF pour chaque participant</p>
          {initialData && (
            <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-3 mb-4 rounded">
              <p className="text-sm font-medium">ℹ️ Mode édition</p>
              <p className="text-xs mt-1">
                Les fichiers existants seront conservés si vous ne les remplacez pas. 
                Uploadez uniquement les fichiers que vous souhaitez modifier.
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Attestation (Required) */}
            <div className="space-y-3">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto">
                <DocumentArrowUpIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-center font-medium text-gray-900">Attestation *</h4>
              
              {/* Toggle between Upload and URL */}
              <div className="flex justify-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => toggleInputMode('attestation')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    inputMode.attestation === 'upload'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <DocumentArrowUpIcon className="w-4 h-4 inline mr-1" />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => toggleInputMode('attestation')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    inputMode.attestation === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  URL
                </button>
              </div>
              
              {inputMode.attestation === 'upload' ? (
                <>
                  <input
                    type="file"
                    id="attestation-upload"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload('attestation', e.target.files?.[0] || null)}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="attestation-upload"
                    className={`block w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-center ${
                      uploadedFiles.attestation
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploadedFiles.attestation ? (
                      <>
                        <CheckCircleIcon className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">Fichier uploadé</span>
                        <div className="text-xs text-gray-600 mt-1 truncate">{uploadedFiles.attestation.name}</div>
                      </>
                    ) : (
                      <>
                        <DocumentArrowUpIcon className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">Cliquez pour uploader</span>
                        <div className="text-xs text-gray-500 mt-1">PDF requis</div>
                      </>
                    )}
                  </label>
                </>
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={documentUrls.attestation}
                    onChange={(e) => handleUrlChange('attestation', e.target.value)}
                    placeholder="https://example.com/attestation.pdf"
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    disabled={isSubmitting}
                  />
                  {documentUrls.attestation && (
                    <div className="flex items-center justify-center text-green-600 text-xs">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      URL fourni
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recommandation (Optional) */}
            <div className="space-y-3">
              <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto">
                <DocumentArrowUpIcon className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-center font-medium text-gray-900">Recommandation</h4>
              
              {/* Toggle between Upload and URL */}
              <div className="flex justify-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => toggleInputMode('recommandation')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    inputMode.recommandation === 'upload'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <DocumentArrowUpIcon className="w-4 h-4 inline mr-1" />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => toggleInputMode('recommandation')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    inputMode.recommandation === 'url'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  URL
                </button>
              </div>
              
              {inputMode.recommandation === 'upload' ? (
                <>
                  <input
                    type="file"
                    id="recommandation-upload"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload('recommandation', e.target.files?.[0] || null)}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="recommandation-upload"
                    className={`block w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-center ${
                      uploadedFiles.recommandation
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploadedFiles.recommandation ? (
                      <>
                        <CheckCircleIcon className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">Fichier uploadé</span>
                        <div className="text-xs text-gray-600 mt-1 truncate">{uploadedFiles.recommandation.name}</div>
                      </>
                    ) : (
                      <>
                        <DocumentArrowUpIcon className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">Cliquez pour uploader</span>
                        <div className="text-xs text-gray-500 mt-1">PDF optionnel</div>
                      </>
                    )}
                  </label>
                </>
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={documentUrls.recommandation}
                    onChange={(e) => handleUrlChange('recommandation', e.target.value)}
                    placeholder="https://example.com/recommandation.pdf"
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                    disabled={isSubmitting}
                  />
                  {documentUrls.recommandation && (
                    <div className="flex items-center justify-center text-green-600 text-xs">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      URL fourni
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Évaluation (Optional) */}
            <div className="space-y-3">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mx-auto">
                <DocumentArrowUpIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-center font-medium text-gray-900">Évaluation</h4>
              
              {/* Toggle between Upload and URL */}
              <div className="flex justify-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => toggleInputMode('evaluation')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    inputMode.evaluation === 'upload'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <DocumentArrowUpIcon className="w-4 h-4 inline mr-1" />
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => toggleInputMode('evaluation')}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    inputMode.evaluation === 'url'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  <LinkIcon className="w-4 h-4 inline mr-1" />
                  URL
                </button>
              </div>
              
              {inputMode.evaluation === 'upload' ? (
                <>
                  <input
                    type="file"
                    id="evaluation-upload"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload('evaluation', e.target.files?.[0] || null)}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  <label
                    htmlFor="evaluation-upload"
                    className={`block w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors text-center ${
                      uploadedFiles.evaluation
                        ? 'border-green-300 bg-green-50 text-green-700'
                        : 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploadedFiles.evaluation ? (
                      <>
                        <CheckCircleIcon className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">Fichier uploadé</span>
                        <div className="text-xs text-gray-600 mt-1 truncate">{uploadedFiles.evaluation.name}</div>
                      </>
                    ) : (
                      <>
                        <DocumentArrowUpIcon className="w-6 h-6 mx-auto mb-2" />
                        <span className="text-sm font-medium">Cliquez pour uploader</span>
                        <div className="text-xs text-gray-500 mt-1">PDF optionnel</div>
                      </>
                    )}
                  </label>
                </>
              ) : (
                <div className="space-y-2">
                  <input
                    type="url"
                    value={documentUrls.evaluation}
                    onChange={(e) => handleUrlChange('evaluation', e.target.value)}
                    placeholder="https://example.com/evaluation.pdf"
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    disabled={isSubmitting}
                  />
                  {documentUrls.evaluation && (
                    <div className="flex items-center justify-center text-green-600 text-xs">
                      <CheckCircleIcon className="w-4 h-4 mr-1" />
                      URL fourni
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            Formats acceptés: PDF uniquement (max 10MB par fichier) ou lien URL vers le document
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (initialData ? 'Mise à jour en cours...' : 'Création en cours...') : (initialData ? 'Mettre à jour l\'Attestation' : 'Créer l\'Attestation')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttestationForm;
