import React from "react";
import {
  MapPinIcon,
  GlobeAltIcon,
  HomeIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

interface AddressInfo {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  region: string;
}

interface AddressInfoStepProps {
  addressInfo: AddressInfo;
  setAddressInfo: React.Dispatch<React.SetStateAction<AddressInfo>>;
}

const AddressInfoStep: React.FC<AddressInfoStepProps> = ({
  addressInfo,
  setAddressInfo,
}) => {
  const handleChange = (field: keyof AddressInfo, value: string) => {
    setAddressInfo((prev) => ({ ...prev, [field]: value }));
  };

  const tunisianCities = [
    "Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès", "Ariana",
    "Gafsa", "Monastir", "Ben Arous", "Kasserine", "Médenine", "Nabeul",
    "Tataouine", "Béja", "Jendouba", "Mahdia", "Manouba", "Sidi Bouzid",
    "Siliana", "Kef", "Tozeur", "Kebili", "Zaghouan"
  ];

  const tunisianRegions = [
    "Grand Tunis", "Nord-Est", "Nord-Ouest", "Centre-Est", "Centre-Ouest", "Sud-Est", "Sud-Ouest"
  ];

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <MapPinIcon className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Informations de localisation</h4>
            <p className="text-sm text-blue-700 mt-1">
              Ces informations nous aident à mieux organiser les formations et à vous contacter si nécessaire.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <HomeIcon className="w-4 h-4 inline mr-1" />
            Adresse complète *
          </label>
          <input
            type="text"
            required
            value={addressInfo.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Rue, Avenue, Quartier, Numéro..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
            Ville *
          </label>
          <select
            required
            value={addressInfo.city}
            onChange={(e) => handleChange("city", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner une ville...</option>
            {tunisianCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Code postal
          </label>
          <input
            type="text"
            value={addressInfo.postalCode}
            onChange={(e) => handleChange("postalCode", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="1000, 2000, 3000..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <GlobeAltIcon className="w-4 h-4 inline mr-1" />
            Pays
          </label>
          <select
            value={addressInfo.country}
            onChange={(e) => handleChange("country", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Tunisie">Tunisie</option>
            <option value="Algérie">Algérie</option>
            <option value="Maroc">Maroc</option>
            <option value="Libye">Libye</option>
            <option value="France">France</option>
            <option value="Allemagne">Allemagne</option>
            <option value="Canada">Canada</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Région
          </label>
          <select
            value={addressInfo.region}
            onChange={(e) => handleChange("region", e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner une région...</option>
            {tunisianRegions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Address Preview */}
      {(addressInfo.address || addressInfo.city) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Aperçu de l'adresse :</h4>
          <p className="text-gray-700">
            {[
              addressInfo.address,
              addressInfo.city,
              addressInfo.postalCode,
              addressInfo.country
            ].filter(Boolean).join(", ")}
            {addressInfo.region && ` (${addressInfo.region})`}
          </p>
        </div>
      )}
    </div>
  );
};

export default AddressInfoStep;
