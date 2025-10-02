import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  LogOut,
  Building2,
  FolderOpen,
  GraduationCap,
  Calendar,
  Mail,
  TrendingUp,
} from "lucide-react";
import PartnershipLoginModal from "../components/partnership/PartnershipLoginModal";
import {
  isPartnerAuthenticated,
  getCurrentPartnerId,
  clearPartnershipSession,
} from "../services/partnershipAuth";
import {
  getPartnerById,
  getProjectsStats,
} from "../services/enterpriseApiService";
import { Partner, PartnershipStats } from "../types/partnership";

const EspacePartenaireePage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [stats, setStats] = useState<PartnershipStats | null>(null);
  const [activeSection, setActiveSection] = useState<string>("dashboard");

  // Vérifier l'authentification au chargement
  const checkAuthentication = useCallback(async () => {
    console.log("🚀 EspacePartenaireePage: Vérification de l'authentification");
    setIsLoading(true);

    try {
      const authenticated = isPartnerAuthenticated();
      console.log("🔍 Statut d'authentification:", authenticated);

      if (authenticated) {
        const partnerId = getCurrentPartnerId();
        if (partnerId) {
          try {
            // Appels API asynchrones pour récupérer les données réelles
            const partnerData = await getPartnerById(partnerId);
            const projectStats = await getProjectsStats(partnerId);
            
            if (partnerData) {
              // Créer les stats compatibles avec PartnershipStats
              const partnerStats: PartnershipStats = {
                totalProjects: projectStats.totalProjects,
                activeProjects: projectStats.activeProjects,
                completedProjects: projectStats.completedProjects,
                totalFormations: 5, // Valeur fixe pour l'instant
                upcomingEvents: projectStats.upcomingDeadlines,
                totalParticipants: projectStats.totalParticipants,
                partnershipDuration: 12, // Valeur fixe pour l'instant
                satisfactionRate: Math.min(95, Math.max(75, projectStats.averageProgress)) // Basé sur la progression
              };

              setPartner(partnerData);
              setStats(partnerStats);
              setIsAuthenticated(true);
              console.log("✅ Partenaire authentifié:", partnerData.name);
            } else {
              console.log("❌ Partenaire non trouvé");
              setIsAuthenticated(false);
            }
          } catch (apiError) {
            console.error("❌ Erreur API:", apiError);
            setIsAuthenticated(false);
          }
        }
      }
    } catch (error) {
      console.error("❌ Erreur lors de la vérification:", error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
      console.log("🏁 Vérification terminée");
    }
  }, []);

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  const handleAuthenticated = (partnerId: string) => {
    console.log("🔐 Partenaire authentifié:", partnerId);
    // Don't re-check authentication immediately to avoid loop
    // Instead, directly set the authenticated state
    setIsAuthenticated(true);
    setIsLoading(false);
    // Load partner data after successful authentication
    loadPartnerData(partnerId);
  };

  const loadPartnerData = async (partnerId: string) => {
    try {
      const partnerData = await getPartnerById(partnerId);
      const projectStats = await getProjectsStats(partnerId);
      
      if (partnerData) {
        setPartner(partnerData);
      }
      
      if (projectStats) {
        setStats(projectStats);
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des données:", error);
    }
  };

  const handleLogout = () => {
    clearPartnershipSession();
    setIsAuthenticated(false);
    setPartner(null);
    setStats(null);
    setActiveSection("dashboard");
    console.log("👋 Déconnexion effectuée");
  };

  const handleBack = () => {
    navigate("/");
  };

  // Affichage du loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Vérification de l'authentification...
          </p>
        </motion.div>
      </div>
    );
  }

  // Affichage du modal de connexion si non authentifié
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <PartnershipLoginModal
          isOpen={true}
          onAuthenticated={handleAuthenticated}
        />
      </div>
    );
  }

  // Dashboard principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Retour</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <Building2 className="w-6 h-6 text-purple-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Espace Partenariat
                  </h1>
                  <p className="text-sm text-gray-600">{partner?.name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {partner?.contactPerson}
                </p>
                <p className="text-xs text-gray-600">{partner?.type}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Bienvenue, {partner?.name} ! 👋
                </h2>
                <p className="text-gray-600 text-lg">
                  Gérez vos projets, formations et événements en partenariat
                  avec Siteen
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Partenaire depuis</p>
                <p className="text-lg font-semibold text-purple-600">
                  {partner?.joinDate
                    ? new Date(partner.joinDate).toLocaleDateString("fr-FR")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Projets Actifs
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.activeProjects}
                  </p>
                </div>
                <FolderOpen className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Formations
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.totalFormations}
                  </p>
                </div>
                <GraduationCap className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Événements
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.upcomingEvents}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Satisfaction
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {stats.satisfactionRate}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Navigation Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Projets en cours */}
          <Link
            to="/partenaire/projets"
            className="block bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Projets en cours
                </h3>
                <p className="text-gray-600">
                  Suivez l'avancement de vos projets
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {stats?.activeProjects} projets actifs
              </span>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </Link>

          {/* Formations co-animées */}
          <Link
            to="/partenaire/formations-co-animees"
            className="block bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Formations co-animées
                </h3>
                <p className="text-gray-600">Gérez vos formations partagées</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {stats?.totalFormations} formations
              </span>
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
            </div>
          </Link>

          {/* Événements & Séminaires */}
          <Link
            to="/partenaire/evenements"
            className="block bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Événements & Séminaires
                </h3>
                <p className="text-gray-600">Organisez vos événements</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {stats?.upcomingEvents} événements à venir
              </span>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
            </div>
          </Link>

          {/* Messages & Communication */}
          <Link
            to="/partenaire/messages"
            className="block bg-white rounded-2xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Messages & Communication
                </h3>
                <p className="text-gray-600">Communiquez avec l'équipe</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                Communication par email
              </span>
              <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
            </div>
          </Link>
        </motion.div>

        {/* Section Content Placeholder */}
        {activeSection !== "dashboard" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Section {activeSection} en cours de développement
              </h3>
              <p className="text-gray-600 mb-6">
                Cette section sera bientôt disponible avec toutes les
                fonctionnalités.
              </p>
              <button
                onClick={() => setActiveSection("dashboard")}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Retour au tableau de bord
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EspacePartenaireePage;
