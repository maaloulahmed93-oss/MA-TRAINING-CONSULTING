import React from "react";
import {
  UserGroupIcon,
  PhoneIcon,
  EnvelopeIcon,
  HeartIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

interface EmergencyContactStepProps {
  emergencyContact: EmergencyContact;
  setEmergencyContact: React.Dispatch<React.SetStateAction<EmergencyContact>>;
}

const EmergencyContactStep: React.FC<EmergencyContactStepProps> = ({
  emergencyContact,
  setEmergencyContact,
}) => {
  const handleChange = (field: keyof EmergencyContact, value: string) => {
    setEmergencyContact((prev) => ({ ...prev, [field]: value }));
  };

  const relationships = [
    "Parent", "Conjoint(e)", "Frère/Sœur", "Enfant", "Ami(e)", 
    "Collègue", "Voisin(e)", "Autre membre de la famille"
  ];

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-900">Contact d'urgence</h4>
            <p className="text-sm text-red-700 mt-1">
              Cette personne sera contactée en cas d'urgence ou si nous ne pouvons pas vous joindre directement.
              Assurez-vous que cette personne est au courant et accepte d'être votre contact d'urgence.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <UserGroupIcon className="w-4 h-4 inline mr-1" />
            Nom complet *
          </label>
          <input
            type="text"
            required
            value={emergencyContact.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Prénom et nom de la personne"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <HeartIcon className="w-4 h-4 inline mr-1" />
            Relation
          </label>
          <select
            value={emergencyContact.relationship}
            onChange={(e) => handleChange("relationship", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner la relation...</option>
            {relationships.map((rel) => (
              <option key={rel} value={rel}>
                {rel}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <PhoneIcon className="w-4 h-4 inline mr-1" />
            Téléphone *
          </label>
          <input
            type="tel"
            required
            value={emergencyContact.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="+216 XX XXX XXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <EnvelopeIcon className="w-4 h-4 inline mr-1" />
            Email (optionnel)
          </label>
          <input
            type="email"
            value={emergencyContact.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="email@example.com"
          />
        </div>
      </div>

      {/* Contact Preview */}
      {(emergencyContact.name || emergencyContact.phone) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Résumé du contact d'urgence :</h4>
          <div className="space-y-1 text-gray-700">
            {emergencyContact.name && (
              <p><strong>Nom :</strong> {emergencyContact.name}</p>
            )}
            {emergencyContact.relationship && (
              <p><strong>Relation :</strong> {emergencyContact.relationship}</p>
            )}
            {emergencyContact.phone && (
              <p><strong>Téléphone :</strong> {emergencyContact.phone}</p>
            )}
            {emergencyContact.email && (
              <p><strong>Email :</strong> {emergencyContact.email}</p>
            )}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <HeartIcon className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Confidentialité</h4>
            <p className="text-sm text-blue-700 mt-1">
              Les informations de votre contact d'urgence sont strictement confidentielles et ne seront utilisées 
              qu'en cas d'urgence médicale ou de situation exceptionnelle nécessitant de vous contacter rapidement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContactStep;
