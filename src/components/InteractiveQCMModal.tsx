import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Target,
  Award,
  Users,
  Star,
  Package,
  GraduationCap,
} from "lucide-react";

// Types pour le QCM
interface QCMQuestion {
  id: string;
  question: string;
  type: "single" | "multiple";
  options: {
    id: string;
    text: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }[];
}

interface QCMAnswers {
  [questionId: string]: string | string[];
}

interface RecommendedItem {
  id: string;
  name: string;
  type: "pack" | "programme";
  category: string;
  price: number;
  originalPrice?: number;
  savings?: number;
  description: string;
  level?: string;
  duration?: string;
  instructor?: string;
  themes?: number;
  modules?: number;
  score: number; // Score de pertinence (0-100)
  reasons: string[]; // Raisons de la recommandation
}

interface InteractiveQCMModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemSelect: (item: RecommendedItem) => void;
  catalogItems: {
    id: string;
    name: string;
    type: "pack" | "programme";
    category: string;
    price: number;
    originalPrice?: number;
    savings?: number;
    description: string;
    level?: string;
    duration?: string;
    instructor?: string;
    themes?: number;
    modules?: number;
  }[];
}

const InteractiveQCMModal: React.FC<InteractiveQCMModalProps> = ({
  isOpen,
  onClose,
  onItemSelect,
  catalogItems,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<QCMAnswers>({});
  const [recommendations, setRecommendations] = useState<RecommendedItem[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Questions du QCM
  const questions: QCMQuestion[] = [
    {
      id: "domain",
      question: "Quel domaine vous intéresse le plus ?",
      type: "single",
      options: [
        {
          id: "tech",
          text: "Technologies & Développement",
          value: "Technologies",
        },
        { id: "marketing", text: "Marketing Digital", value: "Marketing" },
        { id: "data", text: "Data Science & IA", value: "Data Science" },
        { id: "design", text: "Design UX/UI", value: "Design" },
        {
          id: "business",
          text: "Business & Entrepreneuriat",
          value: "Business",
        },
      ],
    },
    {
      id: "level",
      question: "Quel est votre niveau actuel ?",
      type: "single",
      options: [
        { id: "beginner", text: "Débutant", value: "Débutant", icon: Target },
        {
          id: "intermediate",
          text: "Intermédiaire",
          value: "Intermédiaire",
          icon: Users,
        },
        { id: "advanced", text: "Avancé", value: "Avancé", icon: Award },
        { id: "expert", text: "Expert", value: "Expert", icon: Star },
      ],
    },
    {
      id: "objective",
      question: "Quel est votre objectif principal ?",
      type: "single",
      options: [
        { id: "improve", text: "Améliorer mes compétences", value: "improve" },
        { id: "portfolio", text: "Préparer un dossier professionnel", value: "portfolio" },
        { id: "reorient", text: "Me réorienter", value: "reorient" },
        { id: "recommendation", text: "Avoir une recommandation professionnelle", value: "recommendation" },
        { id: "job", text: "Trouver un emploi / évoluer dans mon travail", value: "job" },
        { id: "project", text: "Développer un projet personnel", value: "project" },
      ],
    },
    {
      id: "currentLevel",
      question: "Quel est votre niveau actuel dans ce domaine ?",
      type: "single",
      options: [
        { id: "beginner", text: "Débutant", value: "Débutant", icon: Target },
        { id: "intermediate", text: "Intermédiaire", value: "Intermédiaire", icon: Users },
        { id: "advanced", text: "Avancé", value: "Avancé", icon: Award },
        { id: "unknown", text: "Je ne sais pas", value: "Je ne sais pas", icon: Target },
      ],
    },
    {
      id: "situation",
      question: "Vous êtes actuellement :",
      type: "single",
      options: [
        { id: "student", text: "Étudiant", value: "Étudiant" },
        { id: "graduate", text: "Jeune diplômé", value: "Jeune diplômé" },
        { id: "jobseeker", text: "En recherche d'emploi", value: "En recherche d'emploi" },
        { id: "professional", text: "Professionnel en activité", value: "Professionnel en activité" },
        { id: "entrepreneur", text: "Entrepreneur / Freelance", value: "Entrepreneur / Freelance" },
      ],
    },
    {
      id: "difficulty",
      question: "Quelle est votre principale difficulté actuellement ?",
      type: "single",
      options: [
        { id: "clarity", text: "Manque de clarté / orientation", value: "clarity" },
        { id: "practice", text: "Manque de pratique", value: "practice" },
        { id: "experience", text: "Manque d'expérience professionnelle", value: "experience" },
        { id: "confidence", text: "Manque de confiance", value: "confidence" },
        { id: "guidance", text: "Manque d'encadrement", value: "guidance" },
        { id: "interview", text: "Difficulté à passer un entretien", value: "interview" },
      ],
    },
    {
      id: "timePerWeek",
      question: "Combien de temps pouvez-vous consacrer par semaine ?",
      type: "single",
      options: [
        { id: "2h", text: "2h / semaine", value: "2h" },
        { id: "4h", text: "4h / semaine", value: "4h" },
        { id: "6h", text: "6h / semaine", value: "6h" },
        { id: "8h", text: "Plus de 8h", value: "8h+" },
      ],
    },
    {
      id: "accompanimentMode",
      question: "Quel mode d'accompagnement préférez-vous ?",
      type: "single",
      options: [
        { id: "individual", text: "Individuel (1:1)", value: "individual" },
        { id: "group", text: "Groupe (max 10 personnes)", value: "group" },
        { id: "both", text: "Les deux me conviennent", value: "both" },
      ],
    },
    {
      id: "customized",
      question: "Souhaitez-vous un parcours 100% sur-mesure ?",
      type: "single",
      options: [
        { id: "yes", text: "Oui", value: "yes" },
        { id: "no", text: "Non", value: "no" },
        { id: "unsure", text: "Je ne sais pas", value: "unsure" },
      ],
    },
  ];

  // Reset du modal quand il s'ouvre
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setAnswers({});
      setRecommendations([]);
      setShowResults(false);
    }
  }, [isOpen]);

  // Fonction pour calculer les recommandations
  const calculateRecommendations = () => {
    const scored: RecommendedItem[] = catalogItems.map((item) => {
      let score = 0;
      const reasons: string[] = [];

      // Score basé sur le niveau
      if (answers.level) {
        if (item.level === answers.level) {
          score += 30;
          reasons.push(`Niveau ${answers.level} correspondant`);
        } else if (item.level) {
          // Score partiel pour niveaux proches
          const levels = ["Débutant", "Intermédiaire", "Avancé", "Expert"];
          const userLevelIndex = levels.indexOf(answers.level as string);
          const itemLevelIndex = levels.indexOf(item.level);
          const levelDiff = Math.abs(userLevelIndex - itemLevelIndex);
          if (levelDiff === 1) {
            score += 15;
            reasons.push(`Niveau proche de votre profil`);
          }
        }
      }

      // Score basé sur le domaine
      if (answers.domain && item.category === answers.domain) {
        score += 40;
        reasons.push(`Domaine ${answers.domain} correspondant`);
      }

      // Score basé sur l'objectif
      if (answers.objective) {
        switch (answers.objective) {
          case "career":
            if (item.type === "pack") {
              score += 20;
              reasons.push("Pack complet idéal pour reconversion");
            }
            break;
          case "skills":
            if (item.type === "programme") {
              score += 20;
              reasons.push(
                "Programme spécialisé pour développer vos compétences"
              );
            }
            break;
          case "promotion":
            if (item.level === "Avancé" || item.level === "Expert") {
              score += 15;
              reasons.push("Niveau avancé pour progression de carrière");
            }
            break;
          case "business":
            if (
              item.category === "Business" ||
              item.name.toLowerCase().includes("business")
            ) {
              score += 25;
              reasons.push("Formation orientée entrepreneuriat");
            }
            break;
        }
      }

      // Score basé sur le format préféré
      if (answers.format) {
        if (answers.format === item.type || answers.format === "both") {
          score += 10;
          if (answers.format !== "both") {
            reasons.push(`Format ${item.type} comme souhaité`);
          }
        }
      }

      // Score basé sur la durée
      if (answers.duration && item.duration) {
        const duration = item.duration.toLowerCase();
        switch (answers.duration) {
          case "short":
            if (duration.includes("semaine") && parseInt(duration) < 8) {
              score += 15;
              reasons.push("Durée courte adaptée");
            }
            break;
          case "medium":
            if (
              duration.includes("semaine") &&
              parseInt(duration) >= 8 &&
              parseInt(duration) <= 16
            ) {
              score += 15;
              reasons.push("Durée moyenne adaptée");
            }
            break;
          case "long":
            if (duration.includes("semaine") && parseInt(duration) > 16) {
              score += 15;
              reasons.push("Formation longue et approfondie");
            }
            break;
          case "flexible":
            score += 5;
            break;
        }
      }

      // Bonus pour les packs (économies)
      if (item.type === "pack" && item.savings) {
        score += 5;
        reasons.push(`Économisez ${item.savings}€`);
      }

      return {
        ...item,
        score: Math.min(score, 100),
        reasons,
      };
    });

    // Trier par score décroissant et prendre les 3 meilleurs
    const topRecommendations = scored
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    setRecommendations(topRecommendations);
    setShowResults(true);
  };

  // Gestion des réponses
  const handleAnswer = (questionId: string, value: string | string[]) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // Navigation
  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateRecommendations();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleItemClick = (item: RecommendedItem) => {
    onItemSelect(item);
    onClose();
  };

  const resetQCM = () => {
    setCurrentStep(0);
    setAnswers({});
    setRecommendations([]);
    setShowResults(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  🎯 Trouvez votre parcours idéal
                </h2>
                <p className="text-gray-600">
                  {showResults
                    ? "Vos recommandations personnalisées"
                    : "Répondez à quelques questions pour des recommandations sur mesure"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {!showResults ? (
            <>
              {/* Progress Bar */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-600">
                    Question {currentStep + 1} sur {questions.length}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(((currentStep + 1) / questions.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${((currentStep + 1) / questions.length) * 100}%`,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* Question */}
              <div className="p-8">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    {questions[currentStep].question}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {questions[currentStep].options.map((option) => {
                      const isSelected =
                        answers[questions[currentStep].id] === option.value;
                      const IconComponent = option.icon;

                      return (
                        <motion.button
                          key={option.id}
                          onClick={() =>
                            handleAnswer(
                              questions[currentStep].id,
                              option.value
                            )
                          }
                          className={`p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 text-blue-900"
                              : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center space-x-3">
                            {IconComponent && (
                              <IconComponent
                                className={`w-5 h-5 ${
                                  isSelected ? "text-blue-600" : "text-gray-400"
                                }`}
                              />
                            )}
                            <span className="font-medium">{option.text}</span>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Navigation */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      currentStep === 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Précédent</span>
                  </button>

                  <button
                    onClick={nextStep}
                    disabled={!answers[questions[currentStep].id]}
                    className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors ${
                      !answers[questions[currentStep].id]
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    <span>
                      {currentStep === questions.length - 1
                        ? "Voir mes recommandations"
                        : "Suivant"}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Results */
            <div className="p-8 overflow-y-auto max-h-[70vh]">
              {recommendations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Target className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune recommandation trouvée
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Essayez de modifier vos réponses ou contactez-nous pour des
                    conseils personnalisés.
                  </p>
                  <button
                    onClick={resetQCM}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Recommencer le questionnaire
                  </button>
                </div>
              ) : (
                <>
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Vos recommandations personnalisées
                    </h3>
                    <p className="text-gray-600">
                      Basées sur vos réponses, voici les{" "}
                      {recommendations.length} formations les plus adaptées à
                      votre profil
                    </p>
                  </div>

                  <div className="space-y-6">
                    {recommendations.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleItemClick(item)}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer group relative"
                      >
                        {/* Score Badge */}
                        <div className="absolute top-4 right-4">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              item.score >= 80
                                ? "bg-green-100 text-green-800"
                                : item.score >= 60
                                ? "bg-blue-100 text-blue-800"
                                : "bg-orange-100 text-orange-800"
                            }`}
                          >
                            {item.score}% de correspondance
                          </div>
                        </div>

                        {/* Type Badge */}
                        <div className="flex items-center space-x-2 mb-4">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              item.type === "pack"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {item.type === "pack" ? (
                              <>
                                <Package className="w-3 h-3 mr-1" />
                                Pack
                              </>
                            ) : (
                              <>
                                <GraduationCap className="w-3 h-3 mr-1" />
                                Programme
                              </>
                            )}
                          </span>
                          {index === 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Star className="w-3 h-3 mr-1" />
                              Recommandé
                            </span>
                          )}
                        </div>

                        {/* Title and Description */}
                        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-gray-600 text-sm mb-4">
                          {item.description}
                        </p>

                        {/* Reasons */}
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">
                            Pourquoi cette recommandation :
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {item.reasons.map((reason, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                              >
                                ✓ {reason}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                          <div>
                            <span className="text-gray-500">Catégorie:</span>
                            <div className="font-medium">{item.category}</div>
                          </div>
                          {item.level && (
                            <div>
                              <span className="text-gray-500">Niveau:</span>
                              <div className="font-medium">{item.level}</div>
                            </div>
                          )}
                          {item.duration && (
                            <div>
                              <span className="text-gray-500">Durée:</span>
                              <div className="font-medium">{item.duration}</div>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500">Prix:</span>
                            <div className="font-medium text-green-600">
                              {item.originalPrice && item.savings ? (
                                <>
                                  {item.price}€
                                  <span className="text-gray-400 line-through text-xs ml-1">
                                    {item.originalPrice}€
                                  </span>
                                </>
                              ) : (
                                `${item.price}€`
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-500">
                            Cliquez pour voir les détails
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
                    <button
                      onClick={resetQCM}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Recommencer le questionnaire
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InteractiveQCMModal;
