import React, { useEffect, useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import type { Certificate } from "../services/certificatesService";
import Modal from "../components/common/Modal";
import CertificateModalContent from "../components/attestations/CertificateModalContent";
import AttestationForm from "../components/attestations/AttestationForm";
import {
  getAll as getAllCertificates,
  upsert as upsertCertificate,
  remove as removeCertificate,
  seedIfEmpty,
} from "../services/certificatesService";

// Default data used to seed localStorage on first run
const DEFAULT_CERTIFICATES: Certificate[] = [
  {
    id: "CERT-2024-001",
    firstName: "Ahmed",
    lastName: "Benali",
    program: "Développement Web Full Stack",
    skills: ["React", "Node.js", "MongoDB", "TypeScript"],
    techniques: [
      "API REST",
      "Authentication JWT",
      "Responsive Design",
      "Git/GitHub",
    ],
    grade: 18.5,
    level: "Avancé",
    certificateUrl: "#",
    recommendationUrl: "#",
    evaluationUrl: "#",
    completionDate: "2024-01-15",
  },
  {
    id: "CERT-2024-002",
    firstName: "Fatima",
    lastName: "El Mansouri",
    program: "Design UX/UI Professionnel",
    skills: ["Figma", "Adobe XD", "Prototypage", "User Research"],
    techniques: [
      "Design System",
      "Wireframing",
      "User Testing",
      "Design Thinking",
    ],
    grade: 16.8,
    level: "Intermédiaire",
    certificateUrl: "#",
    recommendationUrl: "#",
    evaluationUrl: "#",
    completionDate: "2024-02-20",
  },
  {
    id: "CERT-2024-003",
    firstName: "Omar",
    lastName: "Rachidi",
    program: "Data Science & Intelligence Artificielle",
    skills: ["Python", "Machine Learning", "TensorFlow", "Pandas"],
    techniques: [
      "Data Visualization",
      "Deep Learning",
      "NLP",
      "Statistical Analysis",
    ],
    grade: 19.2,
    level: "Expert",
    certificateUrl: "#",
    recommendationUrl: "#",
    evaluationUrl: "#",
    completionDate: "2024-03-10",
  },
];

const AttestationsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "add" | "edit">("view");
  const [selectedCertificate, setSelectedCertificate] =
    useState<Certificate | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] =
    useState<Certificate | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // Seed and load from localStorage, keep in sync with storage events
  useEffect(() => {
    seedIfEmpty(DEFAULT_CERTIFICATES);
    setCertificates(getAllCertificates());

    const onStorage = (e: StorageEvent) => {
      if (e.key === "matc_certificates") {
        setCertificates(getAllCertificates());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleViewDetails = (certificate: Certificate) => {
    setModalMode("view");
    setSelectedCertificate(certificate);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setModalMode("add");
    setSelectedCertificate(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (certificate: Certificate) => {
    setModalMode("edit");
    setSelectedCertificate(certificate);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (certificate: Certificate) => {
    setCertificateToDelete(certificate);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (certificateToDelete) {
      removeCertificate(certificateToDelete.id);
      setCertificates(getAllCertificates());
      setIsDeleteModalOpen(false);
      setCertificateToDelete(null);
    }
  };

  const handleFormSubmit = (data: Partial<Certificate>) => {
    // Normalize ID: use provided or generate one
    const providedId = (data.id || "").trim();
    const id = modalMode === "add"
      ? (providedId || `CERT-${Date.now()}`.slice(0, 15))
      : (selectedCertificate?.id || providedId);

    if (!id) return;

    const merged: Certificate = {
      id,
      firstName: data.firstName || selectedCertificate?.firstName || "",
      lastName: data.lastName || selectedCertificate?.lastName || "",
      program: data.program || selectedCertificate?.program || "",
      skills: data.skills || selectedCertificate?.skills || [],
      techniques: data.techniques || selectedCertificate?.techniques || [],
      grade: typeof data.grade === "number" ? data.grade : (selectedCertificate?.grade || 0),
      level: (data.level || selectedCertificate?.level || "Intermédiaire") as Certificate["level"],
      certificateUrl: data.certificateUrl || selectedCertificate?.certificateUrl || "#",
      recommendationUrl: data.recommendationUrl || selectedCertificate?.recommendationUrl || "#",
      evaluationUrl: data.evaluationUrl || selectedCertificate?.evaluationUrl || "#",
      completionDate: data.completionDate || selectedCertificate?.completionDate || "",
    };

    upsertCertificate(merged);
    setCertificates(getAllCertificates());
    setIsModalOpen(false);
  };

  const filteredCertificates = certificates.filter(
    (cert) =>
      cert.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${cert.firstName} ${cert.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      cert.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="p-6 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des Attestations
            </h1>
            <p className="text-gray-600 mt-1">
              Ajoutez, modifiez ou supprimez des attestations.
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm hover:bg-blue-700 flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Ajouter une Attestation
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par ID, nom, programme..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID Attestation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Titulaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Programme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Note
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Niveau
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCertificates.map((cert) => (
                  <tr key={cert.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                      {cert.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cert.firstName} {cert.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {cert.program}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                      {cert.grade}/20
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          cert.level === "Expert"
                            ? "bg-purple-100 text-purple-800"
                            : cert.level === "Avancé"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {cert.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => handleViewDetails(cert)}
                          className="text-gray-500 hover:text-blue-600"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditClick(cert)}
                          className="text-gray-500 hover:text-yellow-600"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cert)}
                          className="text-gray-500 hover:text-red-600"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "view"
            ? "Détails de l'Attestation"
            : modalMode === "add"
            ? "Ajouter une Attestation"
            : "Modifier l'Attestation"
        }
      >
        {modalMode === "view" && selectedCertificate && (
          <CertificateModalContent certificate={selectedCertificate} />
        )}
        {(modalMode === "add" || modalMode === "edit") && (
          <AttestationForm
            onSubmit={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            initialData={selectedCertificate}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmer la Suppression"
      >
        <div className="p-4">
          <p className="text-gray-700">
            Êtes-vous sûr de vouloir supprimer l'attestation pour{" "}
            <strong>{`${certificateToDelete?.firstName} ${certificateToDelete?.lastName}`}</strong>{" "}
            (ID: {certificateToDelete?.id}) ?
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Cette action est irréversible.
          </p>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              onClick={confirmDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AttestationsPage;
