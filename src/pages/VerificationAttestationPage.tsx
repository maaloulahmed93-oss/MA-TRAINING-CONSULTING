import React, { useState } from 'react';
import { MagnifyingGlassIcon, CheckCircleIcon, XCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface VerificationResult {
  valid: boolean;
  data?: {
    attestationId: string;
    fullName: string;
    program: {
      title: string;
      category: string;
      level: string;
    };
    dateObtention: string;
    note: number;
    niveau: string;
    skills: string[];
    techniques: string[];
  };
  message?: string;
}

const VerificationAttestationPage: React.FC = () => {
  const [attestationId, setAttestationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!attestationId.trim()) {
      alert('Veuillez entrer un ID d\'attestation');
      return;
    }

    try {
      setIsLoading(true);
      setHasSearched(true);
      
      const response = await fetch(`https://matc-backend.onrender.com/api/attestations/verify/${attestationId.trim()}`);
      const data = await response.json();
      
      setResult(data);
    } catch (error) {
      console.error('Error verifying attestation:', error);
      setResult({
        valid: false,
        message: 'Erreur lors de la vérification. Veuillez réessayer.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (type: 'attestation' | 'recommandation' | 'evaluation' = 'attestation') => {
    if (!result?.data?.attestationId) return;
    
    try {
      const response = await fetch(`https://matc-backend.onrender.com/api/attestations/${result.data.attestationId}/download/${type}`);
      
      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${result.data.attestationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert(`Erreur lors du téléchargement du document ${type}`);
    }
  };

  const resetSearch = () => {
    setAttestationId('');
    setResult(null);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Vérification d'Attestation
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Entrez l'ID de votre attestation pour vérifier son authenticité et accéder aux détails de votre certification.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleVerification} className="space-y-6">
            <div>
              <label htmlFor="attestationId" className="block text-sm font-medium text-gray-700 mb-2">
                ID de l'Attestation
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="attestationId"
                  value={attestationId}
                  onChange={(e) => setAttestationId(e.target.value)}
                  placeholder="Ex: CERT-2024-001"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
                  disabled={isLoading}
                />
                <MagnifyingGlassIcon className="h-6 w-6 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isLoading || !attestationId.trim()}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Vérification...
                  </div>
                ) : (
                  'Vérifier l\'Attestation'
                )}
              </button>
              
              {hasSearched && (
                <button
                  type="button"
                  onClick={resetSearch}
                  className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Nouvelle Recherche
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Results */}
        {hasSearched && result && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {result.valid ? (
              <div className="space-y-8">
                {/* Success Header */}
                <div className="text-center">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    ✅ Attestation Valide
                  </h2>
                  <p className="text-green-600">
                    Cette attestation est authentique et valide.
                  </p>
                </div>

                {/* Attestation Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Informations Générales
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">ID:</span>
                        <span className="font-mono text-gray-900">{result.data?.attestationId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Titulaire:</span>
                        <span className="text-gray-900">{result.data?.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Programme:</span>
                        <span className="text-gray-900">{result.data?.program.title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Catégorie:</span>
                        <span className="text-gray-900">{result.data?.program.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Évaluation
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Note:</span>
                        <span className="text-2xl font-bold text-yellow-600">{result.data?.note}/20</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Niveau:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          result.data?.niveau === 'Avancé' 
                            ? 'bg-green-100 text-green-800'
                            : result.data?.niveau === 'Intermédiaire'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {result.data?.niveau}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Date d'obtention:</span>
                        <span className="text-gray-900">
                          {result.data?.dateObtention && new Date(result.data.dateObtention).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skills and Techniques */}
                {(result.data?.skills && result.data.skills.length > 0) || (result.data?.techniques && result.data.techniques.length > 0) ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {result.data?.skills && result.data.skills.length > 0 && (
                      <div className="bg-blue-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Compétences Acquises
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {result.data.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.data?.techniques && result.data.techniques.length > 0 && (
                      <div className="bg-purple-50 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Techniques Maîtrisées
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {result.data.techniques.map((technique, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                            >
                              {technique}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Documents disponibles */}
                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                    📄 Documents disponibles
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Attestation */}
                    <div className="text-center">
                      <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <ArrowDownTrayIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">Attestation</h4>
                      <button
                        onClick={() => handleDownload('attestation')}
                        className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm"
                      >
                        Télécharger
                      </button>
                    </div>

                    {/* Recommandation */}
                    <div className="text-center">
                      <div className="bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <ArrowDownTrayIcon className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">Recommandation</h4>
                      <button
                        onClick={() => handleDownload('recommandation')}
                        className="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors text-sm"
                      >
                        Télécharger
                      </button>
                    </div>

                    {/* Évaluation */}
                    <div className="text-center">
                      <div className="bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <ArrowDownTrayIcon className="h-6 w-6 text-purple-600" />
                      </div>
                      <h4 className="font-medium text-gray-900 mb-2">Évaluation</h4>
                      <button
                        onClick={() => handleDownload('evaluation')}
                        className="w-full px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors text-sm"
                      >
                        Télécharger
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    * Certains documents peuvent ne pas être disponibles selon le type de formation
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-800 mb-2">
                  ❌ Attestation Non Trouvée
                </h2>
                <p className="text-red-600 mb-4">
                  {result.message || 'Aucune attestation trouvée avec cet ID.'}
                </p>
                <div className="bg-red-50 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-red-800 mb-2">Vérifiez que :</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• L'ID est correctement saisi (format: CERT-YYYY-XXXX)</li>
                    <li>• L'attestation n'a pas été révoquée</li>
                    <li>• Vous utilisez l'ID exact fourni avec votre attestation</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            À propos de la Vérification
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CheckCircleIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Authentification</h3>
              <p className="text-sm text-gray-600">
                Vérification en temps réel de l'authenticité de votre attestation dans notre base de données sécurisée.
              </p>
            </div>
            <div>
              <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ArrowDownTrayIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Téléchargement</h3>
              <p className="text-sm text-gray-600">
                Accès direct au document PDF original de votre attestation pour vos démarches professionnelles.
              </p>
            </div>
            <div>
              <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MagnifyingGlassIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Transparence</h3>
              <p className="text-sm text-gray-600">
                Consultation publique des détails de certification pour employeurs et partenaires.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationAttestationPage;
