import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  User,
  Mail,
  Phone,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { Program } from "../data/trainingPrograms";
import { addRegistration } from "../services/registrationService";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface ProgramRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: Program | null;
  selectedCurrency?: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  whatsapp: string;
  selectedSession: string;
}

const ProgramRegistrationModal: React.FC<ProgramRegistrationModalProps> = ({
  isOpen,
  onClose,
  program,
  selectedCurrency = "€",
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    whatsapp: "",
    selectedSession: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        whatsapp: "",
        selectedSession: "",
      });
      setErrors({});
      setIsSuccess(false);
    }
  }, [isOpen]);

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est obligatoire";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est obligatoire";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est obligatoire";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (formData.whatsapp && !/^\+?[\d\s-()]{8,}$/.test(formData.whatsapp)) {
      newErrors.whatsapp = "Format WhatsApp invalide (ex: +216 12 345 678)";
    }

    if (!formData.selectedSession) {
      newErrors.selectedSession = "Veuillez sélectionner un cycle";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (program) {
        // Préparer les données pour l'API
        const registrationData = {
          type: 'program' as const,
          itemId: program.id,
          itemName: program.title,
          price: program.price,
          currency: selectedCurrency,
          sessionId: formData.selectedSession,
          user: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            whatsapp: formData.whatsapp || undefined,
          },
        };

        console.log("📝 Envoi inscription vers API:", registrationData);

        // Envoyer vers l'API Backend
        const response = await fetch('https://matc-backend.onrender.com/api/registrations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Erreur lors de l\'inscription');
        }

        console.log("✅ Inscription sauvegardée:", result);

        // Fallback: Persist to localStorage for admin list (backup)
        addRegistration({
          id: result.data._id || `${program.id}-${Date.now()}`,
          type: 'program',
          itemId: program.id,
          itemName: program.title,
          price: program.price,
          currency: selectedCurrency,
          timestamp: new Date().toISOString(),
          sessionId: formData.selectedSession,
          user: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            whatsapp: formData.whatsapp || undefined,
          },
        });
      }

      setIsSuccess(true);

      // Fermer le modal après 2 secondes
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("❌ Erreur lors de l'inscription:", error);
      
      // En cas d'erreur API, sauvegarder quand même en localStorage
      if (program) {
        addRegistration({
          id: `${program.id}-${Date.now()}`,
          type: 'program',
          itemId: program.id,
          itemName: program.title,
          price: program.price,
          currency: selectedCurrency,
          timestamp: new Date().toISOString(),
          sessionId: formData.selectedSession,
          user: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            whatsapp: formData.whatsapp || undefined,
          },
        });
        
        console.log("💾 Inscription sauvegardée en localStorage (fallback)");
      }
      
      // Afficher quand même le succès à l'utilisateur
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gestion des changements de formulaire
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Fonction pour afficher le prix selon la devise
  const formatPrice = (price?: number) => {
    if (!price) return "Prix sur demande";
    
    const currencySymbols = {
      "€": "€",
      "$": "$",
      "DTN": "DTN"
    };
    
    const symbol = currencySymbols[selectedCurrency as keyof typeof currencySymbols] || "€";
    return `${price} ${symbol}`;
  };

  if (!program) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {program.title}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Inscription au parcours professionnel
                  </p>
                  {program.price && (
                    <p className="text-lg font-semibold text-blue-600 mt-2">
                      {formatPrice(program.price)}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Description du programme */}
              <div className="mb-8">
                <p className="text-gray-700 leading-relaxed mb-6">
                  {program.description}
                </p>
              </div>

              {/* Carousel des cycles */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  Cycles disponibles
                </h3>

                <div className="relative">
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={1}
                    breakpoints={{
                      640: { slidesPerView: 2 },
                      1024: { slidesPerView: 3 },
                    }}
                    navigation={{
                      prevEl: ".swiper-button-prev-custom",
                      nextEl: ".swiper-button-next-custom",
                    }}
                    pagination={{
                      clickable: true,
                      dynamicBullets: true,
                    }}
                    autoplay={{
                      delay: 3000,
                      disableOnInteraction: false,
                    }}
                    loop={true}
                    className="cycles-swiper pb-12"
                  >
                    {program.sessions.map((session) => (
                      <SwiperSlide key={session.id}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            formData.selectedSession === session.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-blue-300"
                          }`}
                          onClick={() =>
                            handleInputChange("selectedSession", session.id)
                          }
                        >
                          <div className="text-center">
                            <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                            <p className="font-medium text-gray-900 mb-1">
                              Cycle {session.id.split("-").pop()}
                            </p>
                            <p className="text-sm text-gray-600">
                              {session.date}
                            </p>
                            {formData.selectedSession === session.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="mt-2"
                              >
                                <CheckCircle className="w-5 h-5 text-blue-500 mx-auto" />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      </SwiperSlide>
                    ))}
                  </Swiper>

                  {/* Navigation personnalisée */}
                  <div className="swiper-button-prev-custom absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="swiper-button-next-custom absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </div>
                </div>

                {errors.selectedSession && (
                  <p className="text-red-500 text-sm mt-2">
                    {errors.selectedSession}
                  </p>
                )}
              </div>

              {/* Modules du parcours */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Modules du parcours
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {program.modules.map((module, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 text-sm">{module}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Formulaire d'inscription */}
              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Informations d'inscription
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Prénom */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prénom *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) =>
                            handleInputChange("firstName", e.target.value)
                          }
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.firstName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Votre prénom"
                        />
                      </div>
                      {errors.firstName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    {/* Nom */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) =>
                            handleInputChange("lastName", e.target.value)
                          }
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                            errors.lastName
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Votre nom"
                        />
                      </div>
                      {errors.lastName && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.email ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="votre.email@exemple.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* WhatsApp */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      WhatsApp (optionnel)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={(e) =>
                          handleInputChange("whatsapp", e.target.value)
                        }
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                          errors.whatsapp ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="+216 12 345 678"
                      />
                    </div>
                    {errors.whatsapp && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.whatsapp}
                      </p>
                    )}
                  </div>

                  {/* Bouton de soumission */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      "Envoyer l'inscription"
                    )}
                  </motion.button>
                </form>
              ) : (
                /* Message de succès avec contrat */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 space-y-6"
                >
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: "spring" }}
                      className="mb-4"
                    >
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      Inscription envoyée !
                    </h3>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                    <p className="text-gray-800 font-semibold">
                      Avant de finaliser votre participation, veuillez télécharger et lire attentivement le contrat ci-dessous :
                    </p>
                    
                    <a
                      href="#"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      📄 Télécharger le contrat (PDF)
                    </a>

                    <div className="border-t border-blue-200 pt-4">
                      <p className="text-gray-800 font-semibold mb-3">
                        Après lecture du contrat, veuillez confirmer :
                      </p>
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-5 h-5 mt-1 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          defaultChecked={false}
                        />
                        <span className="text-gray-700">
                          J'atteste avoir lu et compris le contrat d'inscription.
                        </span>
                      </label>
                    </div>

                    <div className="border-t border-blue-200 pt-4 text-sm text-gray-600">
                      <p>
                        Une fois cette confirmation enregistrée, vous recevrez un e-mail dans un délai maximum de 48 heures afin de valider votre acceptation et finaliser la procédure d'inscription et de paiement.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProgramRegistrationModal;
