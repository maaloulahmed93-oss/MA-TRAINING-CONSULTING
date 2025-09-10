import React, { useState, useEffect } from 'react';
import type { Certificate, Level } from '../../services/certificatesService';
import { PlusIcon, XMarkIcon, DocumentArrowUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface AttestationFormProps {
  // We accept Partial<Certificate> to support add/edit with optional id
  onSubmit: (data: Partial<Certificate>) => void;
  onCancel: () => void;
  initialData?: Certificate | null;
}

const AttestationForm: React.FC<AttestationFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const [formData, setFormData] = useState({
    id: '',
    fullName: '',
    program: '',
    grade: '',
    level: 'Intermédiaire' as Level,
    completionDate: '',
    certificateUrl: '#',
    recommendationUrl: '#',
    evaluationUrl: '#',
  });
  
  // Dynamic arrays for skills and techniques
  const [skills, setSkills] = useState<string[]>(['']);
  const [techniques, setTechniques] = useState<string[]>(['']);
  
  // File upload states
  const [uploadedFiles, setUploadedFiles] = useState({
    certificate: null as File | null,
    recommendation: null as File | null,
    evaluation: null as File | null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        fullName: `${initialData.firstName} ${initialData.lastName}`,
        program: initialData.program,
        grade: initialData.grade.toString(),
        level: initialData.level,
        completionDate: initialData.completionDate,
        certificateUrl: initialData.certificateUrl,
        recommendationUrl: initialData.recommendationUrl,
        evaluationUrl: initialData.evaluationUrl,
      });
      setSkills(initialData.skills.length > 0 ? initialData.skills : ['']);
      setTechniques(initialData.techniques.length > 0 ? initialData.techniques : ['']);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'level') {
      setFormData(prev => ({ ...prev, level: value as Level }));
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

  // File upload handlers
  const handleFileUpload = (type: 'certificate' | 'recommendation' | 'evaluation', file: File | null) => {
    setUploadedFiles(prev => ({ ...prev, [type]: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nameParts = formData.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const finalData: Partial<Certificate> = {
      id: formData.id.trim() || undefined,
      firstName,
      lastName,
      program: formData.program,
      grade: parseFloat(formData.grade) || 0,
      level: formData.level,
      completionDate: formData.completionDate,
      certificateUrl: formData.certificateUrl,
      recommendationUrl: formData.recommendationUrl,
      evaluationUrl: formData.evaluationUrl,
      skills: skills.filter(skill => skill.trim() !== ''),
      techniques: techniques.filter(technique => technique.trim() !== ''),
    };
    onSubmit(finalData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 📌 Informations du titulaire */}
        <div className="bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            📌 Informations du titulaire
          </h3>
          {/* ID field (optional on add, read-only on edit) */}
          <div className="mb-4">
            <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-2">ID Attestation (optionnel)</label>
            <input 
              type="text" 
              name="id" 
              id="id" 
              value={formData.id} 
              onChange={handleChange} 
              placeholder="Ex: CERT-2024-001" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono" 
              disabled={!!initialData}
            />
            <p className="text-xs text-gray-500 mt-1">Si laissé vide lors de l'ajout, un ID sera généré automatiquement.</p>
          </div>
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
            />
          </div>
          <div className="mt-4">
            <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-2">Programme suivi</label>
            <input 
              type="text" 
              name="program" 
              id="program" 
              value={formData.program} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              required 
            />
          </div>
          <div className="mt-4">
            <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700 mb-2">Date d'obtention</label>
            <input 
              type="date" 
              name="completionDate" 
              id="completionDate" 
              value={formData.completionDate} 
              onChange={handleChange} 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
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
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">Note obtenue (/ 20)</label>
              <input 
                type="number" 
                name="grade" 
                id="grade" 
                value={formData.grade} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                step="0.1" 
                min="0" 
                max="20" 
              />
            </div>
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
              <select 
                name="level" 
                id="level" 
                value={formData.level} 
                onChange={handleChange} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
                <option value="Expert">Expert</option>
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
          <p className="text-sm text-gray-600 mb-4">Boutons (Upload PDF)</p>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Attestation Upload */}
            <div className="relative">
              <input
                type="file"
                id="certificate-upload"
                accept=".pdf"
                onChange={(e) => handleFileUpload('certificate', e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="certificate-upload"
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  uploadedFiles.certificate
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                {uploadedFiles.certificate ? (
                  <CheckCircleIcon className="w-8 h-8 mb-2" />
                ) : (
                  <DocumentArrowUpIcon className="w-8 h-8 mb-2" />
                )}
                <span className="text-sm font-medium">
                  {uploadedFiles.certificate ? 'Attestation uploadée' : 'Upload Attestation'}
                </span>
                {uploadedFiles.certificate && (
                  <span className="text-xs mt-1">{uploadedFiles.certificate.name}</span>
                )}
              </label>
            </div>

            {/* Recommandation Upload */}
            <div className="relative">
              <input
                type="file"
                id="recommendation-upload"
                accept=".pdf"
                onChange={(e) => handleFileUpload('recommendation', e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="recommendation-upload"
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  uploadedFiles.recommendation
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                {uploadedFiles.recommendation ? (
                  <CheckCircleIcon className="w-8 h-8 mb-2" />
                ) : (
                  <DocumentArrowUpIcon className="w-8 h-8 mb-2" />
                )}
                <span className="text-sm font-medium">
                  {uploadedFiles.recommendation ? 'Recommandation uploadée' : 'Upload Recommandation'}
                </span>
                {uploadedFiles.recommendation && (
                  <span className="text-xs mt-1">{uploadedFiles.recommendation.name}</span>
                )}
              </label>
            </div>

            {/* Évaluation Upload */}
            <div className="relative">
              <input
                type="file"
                id="evaluation-upload"
                accept=".pdf"
                onChange={(e) => handleFileUpload('evaluation', e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="evaluation-upload"
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                  uploadedFiles.evaluation
                    ? 'border-green-300 bg-green-50 text-green-700'
                    : 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                {uploadedFiles.evaluation ? (
                  <CheckCircleIcon className="w-8 h-8 mb-2" />
                ) : (
                  <DocumentArrowUpIcon className="w-8 h-8 mb-2" />
                )}
                <span className="text-sm font-medium">
                  {uploadedFiles.evaluation ? 'Évaluation uploadée' : 'Upload Évaluation'}
                </span>
                {uploadedFiles.evaluation && (
                  <span className="text-xs mt-1">{uploadedFiles.evaluation.name}</span>
                )}
              </label>
            </div>
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
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            {initialData ? 'Mettre à jour l\'Attestation' : 'Ajouter l\'Attestation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AttestationForm;
