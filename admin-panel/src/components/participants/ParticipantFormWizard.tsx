import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserIcon,
  PhoneIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  IdentificationIcon,
  HomeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  EnvelopeIcon,
  CalendarIcon,
} from "@heroicons/react/24/solid";
import { Participant } from "../../types/participant";

// Import step components
// import PersonalInfoStep from "./steps/PersonalInfoStep";
import AddressInfoStep from "./steps/AddressInfoStep";
import EmergencyContactStep from "./steps/EmergencyContactStep";
import EducationInfoStep from "./steps/EducationInfoStep";
import ProfessionalInfoStep from "./steps/ProfessionalInfoStep";
import AdministrativeInfoStep from "./steps/AdministrativeInfoStep";

interface ParticipantFormWizardProps {
  onSubmit: (data: Partial<Participant>) => void;
  onCancel: () => void;
  initialData?: Participant | null;
}

interface PersonalInfo {
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  secondaryPhone: string;
  birthDate: string;
  nationalId: string;
  avatar: string;
  gender: "male" | "female" | "";
  maritalStatus: "single" | "married" | "divorced" | "widowed" | "";
}

interface AddressInfo {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  region: string;
}

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

interface EducationInfo {
  educationLevel: string;
  institution: string;
  fieldOfStudy: string;
  graduationYear: string;
  certifications: string[];
  languages: string[];
}

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

interface AdministrativeInfo {
  status: "excellent" | "stable" | "expert" | "avancé";
  enrollmentDate: string;
  notes: string;
  formations: string[];
  projects: string[];
  coachingResources: string[];
  specialNeeds: string;
  medicalConditions: string;
}

const ParticipantFormWizard: React.FC<ParticipantFormWizardProps> = ({
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data states
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    secondaryPhone: "",
    birthDate: "",
    nationalId: "",
    avatar: "",
    gender: "",
    maritalStatus: "",
  });

  const [addressInfo, setAddressInfo] = useState<AddressInfo>({
    address: "",
    city: "",
    postalCode: "",
    country: "Tunisie",
    region: "",
  });

  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({
    name: "",
    relationship: "",
    phone: "",
    email: "",
  });

  const [educationInfo, setEducationInfo] = useState<EducationInfo>({
    educationLevel: "",
    institution: "",
    fieldOfStudy: "",
    graduationYear: "",
    certifications: [],
    languages: [],
  });

  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfo>({
    currentJob: "",
    company: "",
    experience: "",
    skills: [],
    previousExperience: "",
    motivation: "",
    goals: "",
    availability: "",
  });

  const [administrativeInfo, setAdministrativeInfo] =
    useState<AdministrativeInfo>({
      status: "stable",
      enrollmentDate: new Date().toISOString().split("T")[0],
      notes: "",
      formations: [],
      projects: [],
      coachingResources: [],
      specialNeeds: "",
      medicalConditions: "",
    });

  // Load initial data if editing
  useEffect(() => {
    if (initialData) {
      setPersonalInfo({
        fullName: initialData.fullName,
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        phone: initialData.phone || "",
        secondaryPhone: "",
        birthDate: "",
        nationalId: "",
        avatar: initialData.avatar || "",
        gender: "",
        maritalStatus: "",
      });

      setAddressInfo({
        address: initialData.address || "",
        city: "",
        postalCode: "",
        country: "Tunisie",
        region: "",
      });

      setAdministrativeInfo((prev) => ({
        ...prev,
        status: initialData.status as "excellent" | "stable" | "expert" | "avancé",
        enrollmentDate: prev.enrollmentDate,
        notes: initialData.notes || "",
        formations: initialData.formations.map((f) => f.title) || [],
        projects: initialData.projects.map((p) => p.title) || [],
        coachingResources:
          initialData.coachingResources.map((r) => r.title) || [],
        specialNeeds: prev.specialNeeds,
        medicalConditions: prev.medicalConditions,
      }));
    }
  }, [initialData]);

  // Auto-split full name
  useEffect(() => {
    if (personalInfo.fullName && !initialData) {
      const nameParts = personalInfo.fullName.trim().split(" ");
      if (nameParts.length >= 2) {
        setPersonalInfo((prev) => ({
          ...prev,
          firstName: nameParts[0],
          lastName: nameParts.slice(1).join(" "),
        }));
      } else {
        setPersonalInfo((prev) => ({
          ...prev,
          firstName: nameParts[0] || "",
          lastName: "",
        }));
      }
    }
  }, [personalInfo.fullName, initialData]);

  const steps = [
    {
      id: "personal",
      title: "Informations personnelles",
      description: "Données personnelles de base",
      icon: UserIcon,
      color: "blue",
    },
    {
      id: "address",
      title: "Adresse et contact",
      description: "Informations de localisation",
      icon: HomeIcon,
      color: "green",
    },
    {
      id: "emergency",
      title: "Contact d'urgence",
      description: "Personne à contacter en cas d'urgence",
      icon: UserGroupIcon,
      color: "red",
    },
    {
      id: "education",
      title: "Formation académique",
      description: "Parcours éducatif et certifications",
      icon: AcademicCapIcon,
      color: "purple",
    },
    {
      id: "professional",
      title: "Expérience professionnelle",
      description: "Carrière et compétences",
      icon: BriefcaseIcon,
      color: "indigo",
    },
    {
      id: "administrative",
      title: "Informations administratives",
      description: "Statut et formations assignées",
      icon: DocumentTextIcon,
      color: "gray",
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Combine all form data
      const submitData: Partial<Participant> = {
        fullName: personalInfo.fullName,
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        email: personalInfo.email,
        phone: personalInfo.phone,
        address:
          `${addressInfo.address}, ${addressInfo.city}, ${addressInfo.postalCode}, ${addressInfo.country}`
            .replace(/,\\s*,/g, ",")
            .replace(/^,\\s*|,\\s*$/g, ""),
        avatar: personalInfo.avatar,
        status: "active" as const,
        notes: `${administrativeInfo.notes}

--- Informations détaillées ---
Téléphone secondaire: ${personalInfo.secondaryPhone}
Date de naissance: ${personalInfo.birthDate}
CIN: ${personalInfo.nationalId}
Genre: ${personalInfo.gender}
Situation familiale: ${personalInfo.maritalStatus}

Région: ${addressInfo.region}

Contact d'urgence: ${emergencyContact.name} (${emergencyContact.relationship})
Téléphone urgence: ${emergencyContact.phone}
Email urgence: ${emergencyContact.email}

Niveau d'éducation: ${educationInfo.educationLevel}
Institution: ${educationInfo.institution}
Domaine d'études: ${educationInfo.fieldOfStudy}
Année de diplôme: ${educationInfo.graduationYear}
Certifications: ${educationInfo.certifications.join(", ")}
Langues: ${educationInfo.languages.join(", ")}

Emploi actuel: ${professionalInfo.currentJob}
Entreprise: ${professionalInfo.company}
Expérience: ${professionalInfo.experience}
Compétences: ${professionalInfo.skills.join(", ")}
Expérience précédente: ${professionalInfo.previousExperience}
Motivation: ${professionalInfo.motivation}
Objectifs: ${professionalInfo.goals}
Disponibilité: ${professionalInfo.availability}

Besoins spéciaux: ${administrativeInfo.specialNeeds}
Conditions médicales: ${administrativeInfo.medicalConditions}`,
        enrollmentDate: administrativeInfo.enrollmentDate,
        lastActivity: new Date().toISOString(),
        totalProgress: initialData?.totalProgress || 0,
        formations: administrativeInfo.formations.map((title, index) => ({
          id: `form-${Date.now()}-${index}`,
          title,
          description: "",
          domain: "Général",
          level: "Débutant" as const,
          duration: "0 heures",
          status: "not_started" as const,
          progress: 0,
          enrollmentDate: new Date().toISOString(),
          courses: [],
        })),
        projects: administrativeInfo.projects.map((title, index) => ({
          id: `proj-${Date.now()}-${index}`,
          title,
          description: "",
          formationId: "general",
          formationTitle: "Formation générale",
          status: "not_started" as const,
          dueDate: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          grade: undefined,
          feedback: "",
          files: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })),
        coachingResources: administrativeInfo.coachingResources.map(
          (title, index) => ({
            id: `res-${Date.now()}-${index}`,
            title,
            description: "",
            category: "Ressources" as const,
            type: "Guide" as const,
            assignedDate: new Date().toISOString(),
            isCompleted: false,
            dataLinks: [],
          })
        ),
        notifications: initialData?.notifications || [],
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0: // Personal info
        return !!(
          personalInfo.fullName &&
          personalInfo.email &&
          personalInfo.phone
        );
      case 1: // Address
        return !!(addressInfo.address && addressInfo.city);
      case 2: // Emergency contact
        return !!(emergencyContact.name && emergencyContact.phone);
      case 3: // Education
        return !!educationInfo.educationLevel;
      case 4: // Professional
        return true; // Optional step
      case 5: // Administrative
        return true; // Always valid
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfoStepLocal
            personalInfo={personalInfo}
            setPersonalInfo={setPersonalInfo}
          />
        );
      case 1:
        return (
          <AddressInfoStep
            addressInfo={addressInfo}
            setAddressInfo={setAddressInfo}
          />
        );
      case 2:
        return (
          <EmergencyContactStep
            emergencyContact={emergencyContact}
            setEmergencyContact={setEmergencyContact}
          />
        );
      case 3:
        return (
          <EducationInfoStep
            educationInfo={educationInfo}
            setEducationInfo={setEducationInfo}
          />
        );
      case 4:
        return (
          <ProfessionalInfoStep
            professionalInfo={professionalInfo}
            setProfessionalInfo={setProfessionalInfo}
          />
        );
      case 5:
        return (
          <AdministrativeInfoStep
            administrativeInfo={administrativeInfo}
            setAdministrativeInfo={setAdministrativeInfo}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isValid = isStepValid(index);

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                      isCompleted
                        ? `bg-${step.color}-500 border-${step.color}-500 text-white`
                        : isActive
                        ? `border-${step.color}-500 bg-${step.color}-50 text-${step.color}-600`
                        : isValid
                        ? `border-gray-300 bg-white text-gray-400`
                        : `border-red-300 bg-red-50 text-red-400`
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircleIcon className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${
                        isActive ? `text-${step.color}-600` : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 max-w-20">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      isCompleted ? `bg-${step.color}-500` : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-gray-600">{steps[currentStep].description}</p>
          </div>

          {renderStepContent()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-8">
        <button
          type="button"
          onClick={currentStep === 0 ? onCancel : prevStep}
          className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>{currentStep === 0 ? "Annuler" : "Précédent"}</span>
        </button>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Étape {currentStep + 1} sur {steps.length}
          </span>

          {currentStep === steps.length - 1 ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>
                    {initialData ? "Mettre à jour" : "Créer le participant"}
                  </span>
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={nextStep}
              disabled={!isStepValid(currentStep)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Suivant</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Step Components will be defined separately
const PersonalInfoStepLocal: React.FC<{
  personalInfo: PersonalInfo;
  setPersonalInfo: React.Dispatch<React.SetStateAction<PersonalInfo>>;
}> = ({ personalInfo, setPersonalInfo }) => {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex items-center space-x-6">
        <div className="flex-shrink-0">
          {personalInfo.avatar ? (
            <img
              className="h-24 w-24 rounded-full object-cover border-4 border-gray-200"
              src={personalInfo.avatar}
              alt="Avatar"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-2xl border-4 border-gray-200">
              {personalInfo.fullName.charAt(0) || "?"}
            </div>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photo de profil
          </label>
          <input
            type="url"
            placeholder="URL de l'image..."
            value={personalInfo.avatar}
            onChange={(e) => handleChange("avatar", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserIcon className="w-4 h-4 inline mr-1" />
            Nom complet *
          </label>
          <input
            type="text"
            required
            value={personalInfo.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Prénom Nom"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <EnvelopeIcon className="w-4 h-4 inline mr-1" />
            Email *
          </label>
          <input
            type="email"
            required
            value={personalInfo.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <PhoneIcon className="w-4 h-4 inline mr-1" />
            Téléphone principal *
          </label>
          <input
            type="tel"
            required
            value={personalInfo.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+216 XX XXX XXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <PhoneIcon className="w-4 h-4 inline mr-1" />
            Téléphone secondaire
          </label>
          <input
            type="tel"
            value={personalInfo.secondaryPhone}
            onChange={(e) => handleChange("secondaryPhone", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+216 XX XXX XXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CalendarIcon className="w-4 h-4 inline mr-1" />
            Date de naissance
          </label>
          <input
            type="date"
            value={personalInfo.birthDate}
            onChange={(e) => handleChange("birthDate", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <IdentificationIcon className="w-4 h-4 inline mr-1" />
            Numéro CIN
          </label>
          <input
            type="text"
            value={personalInfo.nationalId}
            onChange={(e) => handleChange("nationalId", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="12345678"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Genre
          </label>
          <select
            value={personalInfo.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner...</option>
            <option value="male">Masculin</option>
            <option value="female">Féminin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Situation familiale
          </label>
          <select
            value={personalInfo.maritalStatus}
            onChange={(e) => handleChange("maritalStatus", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner...</option>
            <option value="single">Célibataire</option>
            <option value="married">Marié(e)</option>
            <option value="divorced">Divorcé(e)</option>
            <option value="widowed">Veuf/Veuve</option>
          </select>
        </div>
      </div>
    </div>
  );
};

// Additional step components would be defined here...
// For brevity, I'll create them in separate files

export default ParticipantFormWizard;
