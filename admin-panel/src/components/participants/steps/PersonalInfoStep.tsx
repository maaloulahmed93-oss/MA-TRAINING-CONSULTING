import React from "react";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  IdentificationIcon,
  CameraIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

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

interface PersonalInfoStepProps {
  personalInfo: PersonalInfo;
  setPersonalInfo: React.Dispatch<React.SetStateAction<PersonalInfo>>;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  personalInfo,
  setPersonalInfo,
}) => {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    setPersonalInfo((prev) => ({ ...prev, [field]: value }));
  };

  const genderOptions = [
    { value: "male", label: "Homme" },
    { value: "female", label: "Femme" },
  ];

  const maritalStatusOptions = [
    { value: "single", label: "Célibataire" },
    { value: "married", label: "Marié(e)" },
    { value: "divorced", label: "Divorcé(e)" },
    { value: "widowed", label: "Veuf/Veuve" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">
              Informations personnelles
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              Ces informations nous permettent de créer votre profil et de vous
              contacter. Tous les champs marqués d'un astérisque (*) sont
              obligatoires.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
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
            placeholder="Prénom et nom"
          />
          <p className="text-xs text-gray-500 mt-1">
            Le nom sera automatiquement divisé en prénom et nom de famille
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prénom
          </label>
          <input
            type="text"
            value={personalInfo.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            placeholder="Prénom"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de famille
          </label>
          <input
            type="text"
            value={personalInfo.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            placeholder="Nom de famille"
            readOnly
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
            {genderOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
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
            {maritalStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Avatar URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <CameraIcon className="w-4 h-4 inline mr-1" />
          URL de la photo de profil
        </label>
        <input
          type="url"
          value={personalInfo.avatar}
          onChange={(e) => handleChange("avatar", e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com/photo.jpg"
        />
        <p className="text-xs text-gray-500 mt-1">
          Optionnel : URL d'une image pour votre photo de profil
        </p>
      </div>

      {/* Personal Info Preview */}
      {(personalInfo.fullName || personalInfo.email || personalInfo.phone) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">
            Résumé des informations personnelles :
          </h4>
          <div className="space-y-1 text-gray-700">
            {personalInfo.fullName && (
              <p>
                <strong>Nom complet :</strong> {personalInfo.fullName}
              </p>
            )}
            {personalInfo.email && (
              <p>
                <strong>Email :</strong> {personalInfo.email}
              </p>
            )}
            {personalInfo.phone && (
              <p>
                <strong>Téléphone :</strong> {personalInfo.phone}
              </p>
            )}
            {personalInfo.secondaryPhone && (
              <p>
                <strong>Téléphone secondaire :</strong>{" "}
                {personalInfo.secondaryPhone}
              </p>
            )}
            {personalInfo.birthDate && (
              <p>
                <strong>Date de naissance :</strong>{" "}
                {new Date(personalInfo.birthDate).toLocaleDateString("fr-FR")}
              </p>
            )}
            {personalInfo.nationalId && (
              <p>
                <strong>CIN :</strong> {personalInfo.nationalId}
              </p>
            )}
            {personalInfo.gender && (
              <p>
                <strong>Genre :</strong>{" "}
                {
                  genderOptions.find((g) => g.value === personalInfo.gender)
                    ?.label
                }
              </p>
            )}
            {personalInfo.maritalStatus && (
              <p>
                <strong>Situation familiale :</strong>{" "}
                {
                  maritalStatusOptions.find(
                    (s) => s.value === personalInfo.maritalStatus
                  )?.label
                }
              </p>
            )}
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <InformationCircleIcon className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-900">Confidentialité</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Toutes vos informations personnelles sont sécurisées et ne seront
              utilisées que dans le cadre de votre participation aux programmes
              de formation. Elles ne seront jamais partagées avec des tiers sans
              votre consentement explicite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
