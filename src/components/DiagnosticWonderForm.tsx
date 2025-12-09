import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle, AlertCircle } from 'lucide-react';

interface FormData {
  // Section 1
  level: string;
  objective: string;
  availability: string;
  format: string;
  // Section 4
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
}

interface ProfileData {
  profile: string;
  title: string;
  description: string;
  modules: string[];
  basePrice: number;
}

const DiagnosticWonderForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    level: '',
    objective: '',
    availability: '',
    format: '',
    firstName: '',
    lastName: '',
    email: '',
    whatsapp: '',
  });
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  // Profile determination logic
  const determineProfile = (level: string): ProfileData => {
    if (level === 'debutant') {
      return {
        profile: 'debutant',
        title: '🎓 Votre Profil : Débutant',
        description: '👉 Recommandation : Parcours "Initiation & Fondamentaux"',
        modules: [
          'Module 1 : Initiation & Fondamentaux',
          'Exercices pratiques légers',
          'Suivi simple',
        ],
        basePrice: 80,
      };
    } else if (level === 'intermediaire') {
      return {
        profile: 'intermediaire',
        title: '🎓 Votre Profil : Intermédiaire',
        description: '👉 Recommandation : Parcours Professionnel (Parcours Pro)',
        modules: [
          'Diagnostic avancé',
          'Ateliers pratiques',
          'Exercices approfondis',
          'Mini-projet',
        ],
        basePrice: 150,
      };
    } else {
      return {
        profile: 'avance',
        title: '🎓 Votre Profil : Avancé',
        description: '👉 Recommandation : Accompagnement Projet – Sur mesure',
        modules: [
          'Analyse de votre projet',
          'Définition des objectifs',
          'Accompagnement technique et stratégique',
          'Suivi personnalisé',
        ],
        basePrice: 200,
      };
    }
  };

  // Price calculation logic
  const calculatePrice = (basePrice: number, format: string): number => {
    switch (format) {
      case 'solo':
        return Math.round(basePrice * 1.4); // +40%
      case 'duo':
        return Math.round(basePrice * 1.2); // +20%
      case 'groupe3-4':
        return basePrice; // Base price
      case 'groupe5-8':
        return Math.round(basePrice * 0.8); // -20%
      default:
        return basePrice;
    }
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate step 1
  const validateStep1 = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.level) newErrors.level = 'Veuillez sélectionner votre niveau';
    if (!formData.objective) newErrors.objective = 'Veuillez sélectionner un objectif';
    if (!formData.availability) newErrors.availability = 'Veuillez sélectionner votre disponibilité';
    if (!formData.format) newErrors.format = 'Veuillez sélectionner un format';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate step 4
  const validateStep4 = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'Le prénom est obligatoire';
    if (!formData.lastName.trim()) newErrors.lastName = 'Le nom est obligatoire';
    if (!formData.email.trim()) newErrors.email = 'L\'email est obligatoire';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Email invalide';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNext = () => {
    if (currentStep === 1) {
      if (!validateStep1()) return;
      const profile = determineProfile(formData.level);
      setProfileData(profile);
      const price = calculatePrice(profile.basePrice, formData.format);
      setFinalPrice(price);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep4()) return;

    setIsSubmitting(true);
    try {
      const diagnosticData = {
        ...formData,
        profile: profileData?.profile,
        format: formData.format,
        finalPrice,
        timestamp: new Date().toISOString(),
      };

      // Send to API
      const response = await fetch('http://localhost:3001/api/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(diagnosticData),
      });

      if (!response.ok) throw new Error('Erreur lors de la soumission');

      setCurrentStep(5);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la soumission. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get format label
  const getFormatLabel = (format: string): string => {
    const labels: Record<string, string> = {
      solo: 'Solo',
      duo: 'Groupe 2',
      'groupe3-4': 'Groupe 3–4',
      'groupe5-8': 'Groupe 5–8',
    };
    return labels[format] || format;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            🔍 Diagnostic
          </h1>
          <p className="text-gray-600 text-lg">
            Trouvez votre Parcours Professionnel Recommandé
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 mx-1 rounded-full transition-all ${
                  step <= currentStep ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Étape {currentStep} sur 5
          </p>
        </div>

        {/* Main Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-3xl shadow-xl p-8"
        >
          {/* STEP 1: Questions */}
          {currentStep === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  🧩 Répondez à quelques questions
                </h2>
                <p className="text-gray-600 mb-8">
                  Répondez à ces quelques questions pour analyser votre niveau, vos objectifs et votre disponibilité.
                </p>
              </div>

              {/* Q1: Level */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Q1 — Votre niveau actuel dans ce domaine ?
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'debutant', label: 'Débutant (0–6 mois)' },
                    { value: 'intermediaire', label: 'Intermédiaire (6 mois – 2 ans)' },
                    { value: 'avance', label: 'Avancé (2+ ans)' },
                  ].map((option) => (
                    <motion.label
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all"
                      style={{
                        borderColor: formData.level === option.value ? '#3b82f6' : '#e5e7eb',
                        backgroundColor: formData.level === option.value ? '#eff6ff' : '#ffffff',
                      }}
                    >
                      <input
                        type="radio"
                        name="level"
                        value={option.value}
                        checked={formData.level === option.value}
                        onChange={(e) => handleInputChange('level', e.target.value)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="ml-3 text-gray-900 font-medium">{option.label}</span>
                    </motion.label>
                  ))}
                </div>
                {errors.level && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {errors.level}
                  </p>
                )}
              </div>

              {/* Q2: Objective */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Q2 — Votre objectif principal :
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'bases', label: 'Je veux apprendre les bases' },
                    { value: 'ameliorer', label: 'Je veux améliorer mes compétences' },
                    { value: 'projet', label: 'J\'ai un projet spécifique à réaliser' },
                    { value: 'accompagnement', label: 'Je veux un accompagnement personnalisé' },
                  ].map((option) => (
                    <motion.label
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all"
                      style={{
                        borderColor: formData.objective === option.value ? '#3b82f6' : '#e5e7eb',
                        backgroundColor: formData.objective === option.value ? '#eff6ff' : '#ffffff',
                      }}
                    >
                      <input
                        type="radio"
                        name="objective"
                        value={option.value}
                        checked={formData.objective === option.value}
                        onChange={(e) => handleInputChange('objective', e.target.value)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="ml-3 text-gray-900 font-medium">{option.label}</span>
                    </motion.label>
                  ))}
                </div>
                {errors.objective && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {errors.objective}
                  </p>
                )}
              </div>

              {/* Q3: Availability */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Q3 — Votre disponibilité hebdomadaire :
                </label>
                <div className="space-y-3">
                  {[
                    { value: '2-4', label: '2–4 heures / semaine' },
                    { value: '4-6', label: '4–6 heures / semaine' },
                    { value: '6+', label: '6+ heures / semaine' },
                  ].map((option) => (
                    <motion.label
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all"
                      style={{
                        borderColor: formData.availability === option.value ? '#3b82f6' : '#e5e7eb',
                        backgroundColor: formData.availability === option.value ? '#eff6ff' : '#ffffff',
                      }}
                    >
                      <input
                        type="radio"
                        name="availability"
                        value={option.value}
                        checked={formData.availability === option.value}
                        onChange={(e) => handleInputChange('availability', e.target.value)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="ml-3 text-gray-900 font-medium">{option.label}</span>
                    </motion.label>
                  ))}
                </div>
                {errors.availability && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {errors.availability}
                  </p>
                )}
              </div>

              {/* Q4: Format */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-4">
                  Q4 — Comment préférez-vous suivre votre préparation ?
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'solo', label: 'Seul(e)', icon: '🧍' },
                    { value: 'duo', label: 'En duo (2)', icon: '👥' },
                    { value: 'groupe3-4', label: 'En petit groupe (3–4)', icon: '👨‍👩‍👧' },
                    { value: 'groupe5-8', label: 'En groupe élargi (5–8)', icon: '👫' },
                  ].map((option) => (
                    <motion.label
                      key={option.value}
                      whileHover={{ scale: 1.02 }}
                      className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all"
                      style={{
                        borderColor: formData.format === option.value ? '#3b82f6' : '#e5e7eb',
                        backgroundColor: formData.format === option.value ? '#eff6ff' : '#ffffff',
                      }}
                    >
                      <input
                        type="radio"
                        name="format"
                        value={option.value}
                        checked={formData.format === option.value}
                        onChange={(e) => handleInputChange('format', e.target.value)}
                        className="w-5 h-5 text-blue-600"
                      />
                      <span className="ml-3 text-gray-900 font-medium">
                        {option.icon} {option.label}
                      </span>
                    </motion.label>
                  ))}
                </div>
                {errors.format && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {errors.format}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: Profile Analysis */}
          {currentStep === 2 && profileData && (
            <div className="space-y-8">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 border-2 border-blue-200"
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {profileData.title}
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  {profileData.description}
                </p>
                <p className="text-gray-600 mb-6">
                  Ce parcours est idéal pour commencer sur de bonnes bases avec un accompagnement simple et progressif.
                </p>

                <div className="mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">Modules inclus :</h3>
                  <ul className="space-y-3">
                    {profileData.modules.map((module, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                        <span className="text-gray-700">{module}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-6 border-2 border-blue-200">
                  <p className="text-gray-600 mb-2">💰 Prix :</p>
                  <p className="text-3xl font-bold text-blue-600">
                    À partir de {profileData.basePrice}€
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    (Le prix final dépend de votre choix : solo ou groupe)
                  </p>
                </div>
              </motion.div>
            </div>
          )}

          {/* STEP 3: Price Adjustment */}
          {currentStep === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  💸 Ajustement du prix
                </h2>
                <p className="text-gray-600 mb-8">
                  Voici le prix final selon votre choix de format :
                </p>
              </div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-gray-600 mb-2">💼 Mode choisi :</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {getFormatLabel(formData.format)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 mb-2">💰 Prix final estimé :</p>
                    <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {finalPrice}€
                    </p>
                  </div>
                </div>

                <div className="border-t border-green-200 pt-6 mt-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Détails du calcul :</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      Prix de base : <span className="font-semibold">{profileData?.basePrice}€</span>
                    </p>
                    <p>
                      Ajustement format ({getFormatLabel(formData.format)}) :{' '}
                      <span className="font-semibold">
                        {formData.format === 'solo' && '+40%'}
                        {formData.format === 'duo' && '+20%'}
                        {formData.format === 'groupe3-4' && 'Base'}
                        {formData.format === 'groupe5-8' && '-20%'}
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <p className="text-gray-700">
                  ✨ <span className="font-semibold">Bon à savoir :</span> Plus vous êtes nombreux, plus c'est économique !
                </p>
              </div>
            </div>
          )}

          {/* STEP 4: Registration Form */}
          {currentStep === 4 && (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Parfait ! Voici votre parcours idéal 🎉
                </h2>
                <p className="text-gray-600 mb-8">
                  Merci d'entrer vos informations pour finaliser votre inscription.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prénom */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Votre prénom"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Votre nom"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="votre.email@exemple.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  WhatsApp (optionnel)
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="+216 12 345 678"
                />
              </div>

              {/* Confirmation */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                <p className="text-gray-900 font-semibold mb-2">
                  ✅ Mode confirmé : {getFormatLabel(formData.format)}
                </p>
                <p className="text-gray-700">
                  Prix final : <span className="font-bold text-blue-600">{finalPrice}€</span>
                </p>
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Envoi en cours...
                  </>
                ) : (
                  '📩 Confirmer mon Parcours'
                )}
              </motion.button>
            </form>
          )}

          {/* STEP 5: Success Message */}
          {currentStep === 5 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring' }}
                className="mb-6"
              >
                <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
              </motion.div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Votre parcours est confirmé 🎉
              </h2>

              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 mb-8">
                <p className="text-gray-700 mb-6">
                  Notre équipe vous contactera sous <span className="font-bold">24h</span> avec :
                </p>
                <ul className="space-y-3 text-left max-w-md mx-auto">
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Votre planning personnalisé</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Votre lien WhatsApp</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">Votre dossier de démarrage</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                <p className="text-gray-700">
                  📧 Un email de confirmation a été envoyé à <span className="font-semibold">{formData.email}</span>
                </p>
              </div>

              <motion.button
                onClick={() => window.location.href = '/'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-8 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all"
              >
                Retour à l'accueil
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex gap-4 mt-8">
            {currentStep > 1 && (
              <motion.button
                onClick={handlePrevious}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-200 text-gray-900 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
                Précédent
              </motion.button>
            )}
            {currentStep < 4 && (
              <motion.button
                onClick={handleNext}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                Suivant
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiagnosticWonderForm;
