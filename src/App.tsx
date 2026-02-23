import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import EspaceParticipantPage from "./pages/EspaceParticipantPage";
import Service2LoginPage from "./pages/Service2LoginPage";
import Service2MissionPage from "./pages/Service2MissionPage";
import Service2ReportPage from "./pages/Service2ReportPage";
import Service2FinishPage from "./pages/Service2FinishPage";
import PartnershipPage from "./components/PartnershipPage";
import VerificationAttestationPage from "./pages/VerificationAttestationPage";
import VerificationParticipantPage from "./pages/VerificationParticipantPage";
import SystemTestPage from "./pages/SystemTestPage";
import DiagnosticWonderPage from "./pages/DiagnosticNewPage";
import ProfessionalDiagnosticWizardPage from "./pages/ProfessionalDiagnosticWizardPage";
import DiagnosticResultPage from "./pages/DiagnosticResultPage";
import Service1DashboardGate from "./pages/Service1DashboardGate";
import EcosystemPage from "./pages/EcosystemPage";
import EspaceRessourcesPage from "./pages/EspaceRessourcesPage";
import EspaceRessourcesSelectionPage from "./pages/EspaceRessourcesSelectionPage";
import EspaceRessourcesGratuitesPage from "./pages/EspaceRessourcesGratuitesPage";
import EspaceRessourcesBonusPage from "./pages/EspaceRessourcesBonusPage";
import EspaceRessourceDetailPage from "./pages/EspaceRessourceDetailPage";
import EspaceFormateurPage from "./pages/EspaceFormateurPage";
import EspaceFreelancerCadrePage from "./pages/EspaceFreelancerCadrePage";
import EspaceCommercialCadrePage from "./pages/EspaceCommercialCadrePage";
import CareerQuestPage from "./pages/CareerQuestPage";
import DemoTimer from "./components/DemoTimer";
import DemoExpired from "./components/DemoExpired";
// Test page (temporary)
import ProjectsTestPage from "./pages/ProjectsTestPage";
import "./styles/animations.css";
import Footer from "./components/Footer";
import { siteConfigService } from "./services/siteConfigApiService";

const Blank404 = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-6xl font-bold text-gray-300">404</div>
  </div>
);

function App() {
  const [isExpired, setIsExpired] = useState(false);

  // Appliquer la configuration du site au chargement
  useEffect(() => {
    siteConfigService.applySiteConfig().catch(error => {
      console.error('Erreur lors de l\'application de la configuration du site:', error);
    });
  }, []);

  // Si la démo est expirée, afficher uniquement l'écran de blocage
  if (isExpired) {
    return (
      <DemoExpired 
        storageKey="demo_start_time" 
        onUnlock={() => setIsExpired(false)} 
      />
    );
  }

  return (
    <Router>
      <DemoTimer durationMinutes={45} onExpire={() => setIsExpired(true)} />
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/espaces-ressources" element={<EspaceRessourcesPage />} />
            <Route
              path="/espaces-ressources/selection"
              element={<EspaceRessourcesSelectionPage />}
            />
            <Route
              path="/espaces-ressources/gratuites"
              element={<EspaceRessourcesGratuitesPage />}
            />
            <Route
              path="/espaces-ressources/bonus"
              element={<EspaceRessourcesBonusPage />}
            />
            <Route
              path="/espaces-ressources/:variant/:slug"
              element={<EspaceRessourceDetailPage />}
            />
            <Route
              path="/free-courses"
              element={<Navigate to="/espaces-ressources" replace />}
            />
            <Route
              path="/espace-participant"
              element={<EspaceParticipantPage />}
            />
            <Route
              path="/espace-consulting-operationnel"
              element={<Navigate to="/service-2" replace />}
            />
            <Route
              path="/espace-consulting-operationnel/templates"
              element={<Navigate to="/service-2/mission" replace />}
            />
            <Route
              path="/espace-consulting-operationnel/recap"
              element={<Navigate to="/service-2/report" replace />}
            />

            <Route path="/service-2" element={<Service2LoginPage />} />
            <Route path="/service-2/mission" element={<Service2MissionPage />} />
            <Route path="/service-2/report" element={<Service2ReportPage />} />
            <Route path="/service-2/finish" element={<Service2FinishPage />} />
            <Route path="/espace-formateur" element={<EspaceFormateurPage />} />
            <Route
              path="/espace-freelancer"
              element={<EspaceFreelancerCadrePage />}
            />
            <Route
              path="/espace-commercial"
              element={<EspaceCommercialCadrePage />}
            />
            <Route
              path="/espace-partenariat"
              element={<Blank404 />}
            />
            <Route
              path="/espace-professionnel"
              element={<Blank404 />}
            />
            <Route
              path="/programme-partenariat"
              element={<PartnershipPage onBack={() => window.history.back()} />}
            />
            <Route path="/partenaire/projets" element={<Blank404 />} />
            <Route path="/partenaire/formations-co-animees" element={<Blank404 />} />
            <Route path="/partenaire/evenements" element={<Blank404 />} />
            <Route path="/partenaire/messages" element={<Blank404 />} />
            <Route path="/diagnostic" element={<ProfessionalDiagnosticWizardPage />} />
            <Route path="/diagnostic-result" element={<DiagnosticResultPage />} />
            <Route path="/service-1" element={<Service1DashboardGate />} />
            <Route path="/career-quest" element={<CareerQuestPage />} />
            <Route path="/diagnostic-wonder" element={<DiagnosticWonderPage />} />
            <Route path="/ecosysteme" element={<EcosystemPage />} />
              {/* Verification d'attestation */}
              <Route path="/verification-attestation" element={<VerificationAttestationPage />} />
              <Route path="/verification-participant" element={<VerificationParticipantPage />} />
              {/* System Test Page */}
              <Route path="/system-test" element={<SystemTestPage />} />
              {/* Test route (temporary) */}
            <Route path="/test-projects" element={<ProjectsTestPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
