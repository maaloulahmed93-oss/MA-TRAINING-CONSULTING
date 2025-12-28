import CertificateVerification from "../components/CertificateVerification";
import { useNavigate } from "react-router-dom";

const VerificationParticipantPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-100">
      <CertificateVerification isOpen={true} onClose={() => navigate(-1)} />
    </div>
  );
};

export default VerificationParticipantPage;
