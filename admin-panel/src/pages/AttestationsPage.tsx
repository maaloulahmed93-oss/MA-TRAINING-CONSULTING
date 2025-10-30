import React, { useEffect, useState } from "react";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { PencilIcon } from "@heroicons/react/24/solid";
import { attestationsApi, type Attestation } from "../services/attestationsApi";
import { API_BASE_URL } from "../config/api";
import Modal from "../components/common/Modal";
import AttestationForm from "../components/attestations/AttestationForm";


const AttestationsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"view" | "add" | "edit">("view");
  const [selectedAttestation, setSelectedAttestation] =
    useState<Attestation | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [attestationToDelete, setAttestationToDelete] =
    useState<Attestation | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [attestations, setAttestations] = useState<Attestation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load attestations from API
  const loadAttestations = async () => {
    try {
      setIsLoading(true);
      const data = await attestationsApi.getAll();
      setAttestations(data);
    } catch (error) {
      console.error('Error loading attestations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttestations();
  }, []);

  const handleViewDetails = (attestation: Attestation) => {
    setModalMode("view");
    setSelectedAttestation(attestation);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setModalMode("add");
    setSelectedAttestation(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (attestation: Attestation) => {
    setModalMode("edit");
    setSelectedAttestation(attestation);
    setIsModalOpen(true);
  };


  const handleDeleteClick = (attestation: Attestation) => {
    setAttestationToDelete(attestation);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (attestationToDelete) {
      try {
        await attestationsApi.delete(attestationToDelete.attestationId);
        await loadAttestations(); // Reload the list
        setIsDeleteModalOpen(false);
        setAttestationToDelete(null);
      } catch (error) {
        console.error('Error deleting attestation:', error);
        alert('Erreur lors de la suppression de l\'attestation');
      }
    }
  };

  const handleFormSubmit = async (success: boolean) => {
    if (success) {
      await loadAttestations(); // Reload the list
      setIsModalOpen(false);
    }
    // If not successful, keep modal open for user to retry
  };

  const handleDownload = async (attestation: Attestation, type: 'attestation' | 'recommandation' | 'evaluation' = 'attestation') => {
    try {
      // Navigate to API endpoint so the browser follows 302 redirect to Cloudinary
      const downloadUrl = `${API_BASE_URL}/attestations/${attestation.attestationId}/download/${type}`;
      window.open(downloadUrl, '_blank', 'noopener');
    } catch (error) {
      console.error('Error opening download URL:', error);
      alert('Erreur lors du téléchargement');
    }
  };

  const filteredAttestations = attestations.filter(
    (att) =>
      att.attestationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      att.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (att.program?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="text-sm text-gray-500">
              {isLoading ? 'Chargement...' : `${filteredAttestations.length} attestation(s)`}
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Chargement des attestations...</span>
              </div>
            ) : filteredAttestations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucune attestation trouvée.</p>
                {searchTerm && (
                  <p className="text-sm text-gray-400 mt-1">Essayez de modifier votre recherche.</p>
                )}
              </div>
            ) : (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAttestations.map((att) => (
                    <tr key={att._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                        {att.attestationId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {att.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {att.program?.title || 'Programme supprimé'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-semibold">
                        {att.note}/20
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            att.niveau === "Avancé"
                              ? "bg-green-100 text-green-800"
                              : att.niveau === "Intermédiaire"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {att.niveau}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(att.dateObtention).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-3">
                          <button
                            onClick={() => handleViewDetails(att)}
                            className="text-gray-500 hover:text-blue-600"
                            title="Voir les détails"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => {
                              console.log('Edit button clicked for:', att.attestationId);
                              handleEditClick(att);
                            }}
                            className="text-gray-500 hover:text-orange-600 transition-colors"
                            title="Modifier l'attestation"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <div className="relative group">
                            <button
                              className="text-gray-500 hover:text-green-600"
                              title="Télécharger les documents"
                            >
                              <ArrowDownTrayIcon className="h-5 w-5" />
                            </button>
                            <div className="absolute right-0 top-6 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleDownload(att, 'attestation')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                >
                                  📄 Attestation
                                </button>
                                <button
                                  onClick={() => handleDownload(att, 'recommandation')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-600"
                                >
                                  📋 Recommandation
                                </button>
                                <button
                                  onClick={() => handleDownload(att, 'evaluation')}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                                >
                                  📊 Évaluation
                                </button>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteClick(att)}
                            className="text-gray-500 hover:text-red-600"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
        {modalMode === "view" && selectedAttestation && (
          <div className="p-6">
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Informations générales</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="font-medium">ID:</span> {selectedAttestation.attestationId}</div>
                  <div><span className="font-medium">Nom:</span> {selectedAttestation.fullName}</div>
                  <div><span className="font-medium">Programme:</span> {selectedAttestation.program?.title}</div>
                  <div><span className="font-medium">Note:</span> {selectedAttestation.note}/20</div>
                  <div><span className="font-medium">Niveau:</span> {selectedAttestation.niveau}</div>
                  <div><span className="font-medium">Date:</span> {new Date(selectedAttestation.dateObtention).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
              
              {selectedAttestation.skills.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Compétences acquises</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAttestation.skills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedAttestation.techniques.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Techniques maîtrisées</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAttestation.techniques.map((technique, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-sm">
                        {technique}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">Documents disponibles</h4>
                  <button
                    onClick={() => handleEditClick(selectedAttestation)}
                    className="flex items-center space-x-2 px-3 py-1 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Modifier</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    onClick={() => handleDownload(selectedAttestation, 'attestation')}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>📄 Attestation</span>
                  </button>
                  <button
                    onClick={() => handleDownload(selectedAttestation, 'recommandation')}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>📋 Recommandation</span>
                  </button>
                  <button
                    onClick={() => handleDownload(selectedAttestation, 'evaluation')}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    <span>📊 Évaluation</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  * Certains documents peuvent ne pas être disponibles
                </p>
              </div>
            </div>
          </div>
        )}
        {(modalMode === "add" || modalMode === "edit") && (
          <AttestationForm
            onSubmit={handleFormSubmit}
            onCancel={() => setIsModalOpen(false)}
            initialData={selectedAttestation}
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
            <strong>{attestationToDelete?.fullName}</strong>{" "}
            (ID: {attestationToDelete?.attestationId}) ?
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
