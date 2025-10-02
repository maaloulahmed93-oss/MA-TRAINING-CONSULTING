import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EspaceParticipantPage from "./pages/EspaceParticipantPage";
import EspaceFormateurPage from "./pages/EspaceFormateurPage";
import EspaceFreelancerPage from "./pages/EspaceFreelancerPage";
import EspaceCommercialNewPage from "./pages/EspaceCommercialNewPage";
import EspacePartenaireePage from "./pages/EspacePartenaireePage";
import PartnershipPage from "./components/PartnershipPage";
import VerificationAttestationPage from "./pages/VerificationAttestationPage";
// Pages sections Espace Partenariat
import PartenaireProjectsPage from "./pages/partenaire/PartenaireProjectsPage";
import PartenaireFormationsCoAnimeesPage from "./pages/partenaire/PartenaireFormationsCoAnimeesPage";
import PartenaireEvenementsPage from "./pages/partenaire/PartenaireEvenementsPage";
import PartenaireMessagesPage from "./pages/partenaire/PartenaireMessagesPage";
// Test page (temporary)
import ProjectsTestPage from "./pages/ProjectsTestPage";
import "./styles/animations.css";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/espace-participant"
              element={<EspaceParticipantPage />}
            />
            <Route path="/espace-formateur" element={<EspaceFormateurPage />} />
            <Route
              path="/espace-freelancer"
              element={<EspaceFreelancerPage />}
            />
            <Route
              path="/espace-commercial"
              element={<EspaceCommercialNewPage />}
            />
            <Route
              path="/espace-partenariat"
              element={<EspacePartenaireePage />}
            />
            <Route
              path="/programme-partenariat"
              element={<PartnershipPage onBack={() => window.history.back()} />}
            />
            {/* Routes sections Espace Partenariat */}
            <Route
              path="/partenaire/projets"
              element={<PartenaireProjectsPage />}
            />
            <Route
              path="/partenaire/formations-co-animees"
              element={<PartenaireFormationsCoAnimeesPage />}
            />
            <Route
              path="/partenaire/evenements"
              element={<PartenaireEvenementsPage />}
            />
            <Route
              path="/partenaire/messages"
              element={<PartenaireMessagesPage />}
            />
            {/* Verification d'attestation */}
            <Route path="/verification-attestation" element={<VerificationAttestationPage />} />
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
