import React, { useState } from "react";
import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  ClockIcon,
  StarIcon,
  HeartIcon,
  FlagIcon,
  PlusIcon,
  XMarkIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

interface ProfessionalInfo {
  currentJob: string;
  company: string;
  experience: string;
  skills: string[];
  previousExperience: string;
  motivation: string;
  goals: string;
  availability: string;
}

interface ProfessionalInfoStepProps {
  professionalInfo: ProfessionalInfo;
  setProfessionalInfo: React.Dispatch<React.SetStateAction<ProfessionalInfo>>;
}

const ProfessionalInfoStep: React.FC<ProfessionalInfoStepProps> = ({
  professionalInfo,
  setProfessionalInfo,
}) => {
  const [newSkill, setNewSkill] = useState("");

  const handleChange = (field: keyof ProfessionalInfo, value: string | string[]) => {
    setProfessionalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setProfessionalInfo((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setProfessionalInfo((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const experienceLevels = [
    "Débutant (0-1 an)",
    "Junior (1-3 ans)",
    "Intermédiaire (3-5 ans)",
    "Senior (5-10 ans)",
    "Expert (10+ ans)",
    "Aucune expérience professionnelle"
  ];

  const availabilityOptions = [
    "Temps plein",
    "Temps partiel",
    "Weekends uniquement",
    "Soirées uniquement",
    "Flexible",
    "Sur rendez-vous"
  ];

  const commonSkills = [
    "Microsoft Office", "Communication", "Travail d'équipe", "Leadership",
    "Gestion de projet", "Résolution de problèmes", "Créativité", "Analyse",
    "Négociation", "Service client", "Vente", "Marketing", "Comptabilité",
    "Langues étrangères", "Informatique", "Internet", "Réseaux sociaux"
  ];

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <BriefcaseIcon className="w-5 h-5 text-indigo-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-indigo-900">Expérience professionnelle</h4>
            <p className="text-sm text-indigo-700 mt-1">
              Ces informations nous permettent de personnaliser votre parcours de formation selon votre profil professionnel.
            </p>
          </div>
        </div>
      </div>

      {/* Current Job Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BriefcaseIcon className="w-4 h-4 inline mr-1" />
            Poste actuel
          </label>
          <input
            type="text"
            value={professionalInfo.currentJob}
            onChange={(e) => handleChange("currentJob", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Développeur, Manager, Étudiant, Sans emploi..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
            Entreprise/Organisation
          </label>
          <input
            type="text"
            value={professionalInfo.company}
            onChange={(e) => handleChange("company", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nom de l'entreprise ou organisation"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ClockIcon className="w-4 h-4 inline mr-1" />
            Niveau d'expérience
          </label>
          <select
            value={professionalInfo.experience}
            onChange={(e) => handleChange("experience", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner le niveau...</option>
            {experienceLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
            Disponibilité
          </label>
          <select
            value={professionalInfo.availability}
            onChange={(e) => handleChange("availability", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner la disponibilité...</option>
            {availabilityOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Skills */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <StarIcon className="w-5 h-5 mr-2 text-blue-500" />
          Compétences
        </h4>
        
        <div className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Ajouter une compétence..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            />
            <button
              type="button"
              onClick={addSkill}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>

        {/* Common Skills Quick Add */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Compétences courantes :</p>
          <div className="flex flex-wrap gap-2">
            {commonSkills.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => {
                  if (!professionalInfo.skills.includes(skill)) {
                    setProfessionalInfo((prev) => ({
                      ...prev,
                      skills: [...prev.skills, skill],
                    }));
                  }
                }}
                disabled={professionalInfo.skills.includes(skill)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  professionalInfo.skills.includes(skill)
                    ? "bg-blue-100 text-blue-800 border-blue-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {professionalInfo.skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200"
            >
              <span className="text-gray-900">{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="text-red-500 hover:text-red-700"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <BriefcaseIcon className="w-4 h-4 inline mr-1" />
          Expérience professionnelle détaillée
        </label>
        <textarea
          rows={4}
          value={professionalInfo.previousExperience}
          onChange={(e) => handleChange("previousExperience", e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Décrivez votre parcours professionnel, vos responsabilités principales, vos réalisations..."
        />
      </div>

      {/* Motivation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <HeartIcon className="w-4 h-4 inline mr-1" />
          Motivation pour rejoindre le programme
        </label>
        <textarea
          rows={3}
          value={professionalInfo.motivation}
          onChange={(e) => handleChange("motivation", e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Qu'est-ce qui vous motive à suivre cette formation ? Quels défis souhaitez-vous relever ?"
        />
      </div>

      {/* Goals */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FlagIcon className="w-4 h-4 inline mr-1" />
          Objectifs professionnels
        </label>
        <textarea
          rows={3}
          value={professionalInfo.goals}
          onChange={(e) => handleChange("goals", e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Quels sont vos objectifs à court et long terme ? Où vous voyez-vous dans 2-5 ans ?"
        />
      </div>

      {/* Professional Summary */}
      {(professionalInfo.currentJob || professionalInfo.experience || professionalInfo.skills.length > 0) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Résumé professionnel :</h4>
          <div className="space-y-1 text-gray-700">
            {professionalInfo.currentJob && (
              <p><strong>Poste actuel :</strong> {professionalInfo.currentJob}</p>
            )}
            {professionalInfo.company && (
              <p><strong>Entreprise :</strong> {professionalInfo.company}</p>
            )}
            {professionalInfo.experience && (
              <p><strong>Expérience :</strong> {professionalInfo.experience}</p>
            )}
            {professionalInfo.availability && (
              <p><strong>Disponibilité :</strong> {professionalInfo.availability}</p>
            )}
            {professionalInfo.skills.length > 0 && (
              <p><strong>Compétences :</strong> {professionalInfo.skills.length} compétence(s) listée(s)</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalInfoStep;
