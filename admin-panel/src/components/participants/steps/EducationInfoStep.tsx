import React, { useState } from "react";
import {
  AcademicCapIcon,
  BuildingLibraryIcon,
  CalendarIcon,
  DocumentTextIcon,
  PlusIcon,
  XMarkIcon,
  GlobeAltIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

interface EducationInfo {
  educationLevel: string;
  institution: string;
  fieldOfStudy: string;
  graduationYear: string;
  certifications: string[];
  languages: string[];
}

interface EducationInfoStepProps {
  educationInfo: EducationInfo;
  setEducationInfo: React.Dispatch<React.SetStateAction<EducationInfo>>;
}

const EducationInfoStep: React.FC<EducationInfoStepProps> = ({
  educationInfo,
  setEducationInfo,
}) => {
  const [newCertification, setNewCertification] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  const handleChange = (field: keyof EducationInfo, value: string | string[]) => {
    setEducationInfo((prev) => ({ ...prev, [field]: value }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setEducationInfo((prev) => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()],
      }));
      setNewCertification("");
    }
  };

  const removeCertification = (index: number) => {
    setEducationInfo((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setEducationInfo((prev) => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()],
      }));
      setNewLanguage("");
    }
  };

  const removeLanguage = (index: number) => {
    setEducationInfo((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  const educationLevels = [
    "Primaire",
    "Secondaire",
    "Baccalauréat",
    "Bac+2 (BTS, DUT, etc.)",
    "Licence (Bac+3)",
    "Master (Bac+5)",
    "Doctorat (Bac+8)",
    "Formation professionnelle",
    "Autodidacte",
    "Autre"
  ];

  const fieldsOfStudy = [
    "Informatique",
    "Ingénierie",
    "Commerce/Gestion",
    "Sciences",
    "Lettres/Langues",
    "Droit",
    "Médecine",
    "Arts",
    "Communication",
    "Finance",
    "Marketing",
    "Ressources Humaines",
    "Autre"
  ];

  const commonLanguages = [
    "Arabe", "Français", "Anglais", "Allemand", "Espagnol", 
    "Italien", "Chinois", "Japonais", "Russe", "Portugais"
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AcademicCapIcon className="w-5 h-5 text-purple-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-purple-900">Formation académique</h4>
            <p className="text-sm text-purple-700 mt-1">
              Ces informations nous aident à adapter le contenu des formations à votre niveau et à vos besoins.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Education Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <AcademicCapIcon className="w-4 h-4 inline mr-1" />
            Niveau d'éducation *
          </label>
          <select
            required
            value={educationInfo.educationLevel}
            onChange={(e) => handleChange("educationLevel", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner le niveau...</option>
            {educationLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BuildingLibraryIcon className="w-4 h-4 inline mr-1" />
            Institution/École
          </label>
          <input
            type="text"
            value={educationInfo.institution}
            onChange={(e) => handleChange("institution", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nom de l'université, école, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <DocumentTextIcon className="w-4 h-4 inline mr-1" />
            Domaine d'études
          </label>
          <select
            value={educationInfo.fieldOfStudy}
            onChange={(e) => handleChange("fieldOfStudy", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner le domaine...</option>
            {fieldsOfStudy.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon className="w-4 h-4 inline mr-1" />
            Année de diplôme
          </label>
          <select
            value={educationInfo.graduationYear}
            onChange={(e) => handleChange("graduationYear", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner l'année...</option>
            {years.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Certifications */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <StarIcon className="w-5 h-5 mr-2 text-yellow-500" />
          Certifications et diplômes
        </h4>
        
        <div className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newCertification}
              onChange={(e) => setNewCertification(e.target.value)}
              placeholder="Nom de la certification..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
            />
            <button
              type="button"
              onClick={addCertification}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center space-x-1"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {educationInfo.certifications.map((cert, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-yellow-50 p-3 rounded-lg border border-yellow-200"
            >
              <span className="text-gray-900">{cert}</span>
              <button
                type="button"
                onClick={() => removeCertification(index)}
                className="text-red-500 hover:text-red-700"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <GlobeAltIcon className="w-5 h-5 mr-2 text-green-500" />
          Langues parlées
        </h4>
        
        <div className="mb-4">
          <div className="flex space-x-2">
            <select
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Sélectionner une langue...</option>
              {commonLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addLanguage}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-1"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {educationInfo.languages.map((lang, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200"
            >
              <span className="text-gray-900">{lang}</span>
              <button
                type="button"
                onClick={() => removeLanguage(index)}
                className="text-red-500 hover:text-red-700"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Education Summary */}
      {educationInfo.educationLevel && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Résumé de la formation :</h4>
          <div className="space-y-1 text-gray-700">
            <p><strong>Niveau :</strong> {educationInfo.educationLevel}</p>
            {educationInfo.institution && (
              <p><strong>Institution :</strong> {educationInfo.institution}</p>
            )}
            {educationInfo.fieldOfStudy && (
              <p><strong>Domaine :</strong> {educationInfo.fieldOfStudy}</p>
            )}
            {educationInfo.graduationYear && (
              <p><strong>Année de diplôme :</strong> {educationInfo.graduationYear}</p>
            )}
            {educationInfo.certifications.length > 0 && (
              <p><strong>Certifications :</strong> {educationInfo.certifications.length} certification(s)</p>
            )}
            {educationInfo.languages.length > 0 && (
              <p><strong>Langues :</strong> {educationInfo.languages.join(", ")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EducationInfoStep;
