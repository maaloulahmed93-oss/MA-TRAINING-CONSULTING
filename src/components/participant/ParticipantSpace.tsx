import { useState, useEffect } from 'react';
import { Eye, LogOut, X } from 'lucide-react';

const ParticipantSpace = () => {
  const [session, setSession] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({ password: '' });
  const [loginError, setLoginError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [postLoginView, setPostLoginView] = useState<'list' | 'restitution'>('list');
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [searchId, setSearchId] = useState<string>('');
  const [isRestitutionPasswordOpen, setIsRestitutionPasswordOpen] = useState(false);
  const [restitutionPassword, setRestitutionPassword] = useState('');
  const [restitutionPasswordError, setRestitutionPasswordError] = useState('');

  const handleLogin = async (password: string) => {
    const raw = String(password || '').trim();

    if (!raw) {
      setLoginError('Veuillez saisir le mot de passe');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      const isValid = /^00[1-9]\*MA-TRAINING-CONSULTING$/.test(raw);
      if (!isValid) {
        setLoginError('Mot de passe incorrect');
        return;
      }

      const sessionData = {
        accessCode: raw,
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem('participantSession', JSON.stringify(sessionData));
      setSession(sessionData);
      setPostLoginView('list');
      setSelectedParticipantId(null);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    console.log('🚪 ParticipantSpace: Déconnexion');
    setSession(null);
    setLoginForm({ password: '' });
    setLoginError('');
    setPostLoginView('list');
    setSelectedParticipantId(null);
    
    // Clear all session data
    localStorage.removeItem('participantSession');
    
    console.log('✅ Session supprimée, retour à la page de connexion');
  };

  useEffect(() => {
    if (session) {
      setPostLoginView('list');
      setSelectedParticipantId(null);
      setSearchId('');
      setIsRestitutionPasswordOpen(false);
      setRestitutionPassword('');
      setRestitutionPasswordError('');
    }
  }, [session]);

  const getRestitutionUrl = async (participantId: string): Promise<string> => {
    try {
      const API_BASE = process.env.REACT_APP_API_URL || 'https://matc-backend.onrender.com/api';
      const response = await fetch(`${API_BASE}/participants-simple/${participantId}`);
      const result = await response.json();
      if (result.success && result.data?.documentLink) {
        return result.data.documentLink;
      }
      return '';
    } catch (error) {
      console.error('Error fetching restitution URL:', error);
      return '';
    }
  };

  const openRestitutionLink = async () => {
    if (!selectedParticipantId) return;
    const url = await getRestitutionUrl(selectedParticipantId);
    const safe = String(url || '').trim();
    if (!safe) {
      alert('Aucun lien de document configuré pour ce participant');
      return;
    }
    window.open(safe, '_blank', 'noopener,noreferrer');
  };

  // Check for existing session on component mount
  useEffect(() => {
    const checkExistingSession = () => {
      console.log('🔄 ParticipantSpace: Vérification session existante...');
      
      try {
        const savedSession = localStorage.getItem('participantSession');
        
        if (savedSession) {
          const sessionData = JSON.parse(savedSession);
          console.log('✅ Session trouvée:', sessionData);
          
          // Check if session is still valid (less than 24 hours old)
          const loginTime = new Date(sessionData.loginTime);
          const now = new Date();
          const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 24) {
            setSession(sessionData);
            console.log('✅ Session restaurée automatiquement');
          } else {
            // Session expired, clear it
            localStorage.removeItem('participantSession');
            console.log('⚠️ Session expirée, suppression');
          }
        } else {
          console.log('ℹ️ Aucune session trouvée');
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification de session:', error);
        // Clear corrupted session data
        localStorage.removeItem('participantSession');
      } finally {
        setIsInitializing(false);
      }
    };

    checkExistingSession();
  }, []);

  // Show loading screen while checking for existing session
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Vérification de session...</h2>
          <p className="text-gray-600">Patientez un moment</p>
        </div>
      </div>
    );
  }

  // Page de connexion - Enhanced Design
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl px-0">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden relative">
            <div className="flex flex-col lg:flex-row lg:min-h-[500px]">
              {/* Left Side - Login Form */}
              <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 flex flex-col justify-center relative">
                <div className="mb-6 sm:mb-8">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">Bonjour!</h1>
                  <p className="text-sm sm:text-base text-gray-600">Connectez-vous à votre compte</p>
                </div>

                {/* Error Message */}
                {loginError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                    <p className="text-sm">{loginError}</p>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin(loginForm.password);
                }} className="space-y-5 sm:space-y-6">
                  {/* Password Field */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      placeholder="Mot de passe"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ password: e.target.value })}
                      className="block w-full pl-12 pr-4 py-3 sm:py-4 bg-blue-50 border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-gray-700 placeholder-gray-500"
                      required
                      disabled={isLoggingIn}
                    />
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 px-2">
                    Format attendu: <span className="font-medium text-gray-700">001*MA-TRAINING-CONSULTING</span> à <span className="font-medium text-gray-700">009*MA-TRAINING-CONSULTING</span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoggingIn || !loginForm.password.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 sm:py-4 px-6 rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLoggingIn ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Connexion...
                      </>
                    ) : (
                      'SE CONNECTER'
                    )}
                  </button>
                </form>

                {/* Help Section */}
                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">
                    Besoin d'aide ? Contactez votre administrateur
                  </p>
                </div>
              </div>

              {/* Right Side - Welcome Section */}
              <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-500 to-purple-600 p-8 sm:p-10 lg:p-12 flex flex-col justify-center text-white relative overflow-hidden mt-8 lg:mt-0">
                {/* Decorative Wave Shapes */}
                <div className="absolute top-0 right-0 w-full h-32">
                  <svg viewBox="0 0 400 100" className="w-full h-full">
                    <path d="M0,50 Q100,0 200,50 T400,50 L400,0 L0,0 Z" fill="rgba(255,255,255,0.1)" />
                  </svg>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-40">
                  <svg viewBox="0 0 400 120" className="w-full h-full">
                    <path d="M0,120 Q100,70 200,120 T400,120 L400,120 L0,120 Z" fill="rgba(255,255,255,0.1)" />
                  </svg>
                </div>

                <div className="relative z-10 text-center">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">Bienvenue!</h2>
                  <p className="text-base sm:text-lg text-blue-100 leading-relaxed max-w-md mx-auto px-2">
                    Accédez à votre espace opérationnel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="fixed top-4 right-4">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center space-x-2 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors border border-red-200 hover:border-red-300"
          title="Se déconnecter"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {postLoginView === 'list' && (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-900 font-semibold text-xl">Liste des participants</div>
                <div className="text-gray-500 text-sm mt-1">Accès restreint par mot de passe</div>
              </div>
            </div>

            <div className="mt-6">
              <div className="max-w-sm">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher par ID</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Ex: 001"
                  value={searchId}
                  onChange={(e) => {
                    setSearchId(e.target.value);
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-xs text-gray-500 mt-2">Laissez vide pour afficher tous les participants.</div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {(() => {
                const participants = Array.from({ length: 9 }, (_, i) => {
                  const n = i + 1;
                  const id = `00${n}`;
                  return {
                    id,
                    role: 'Assistant Marketing',
                    situation: `Situation professionnelle ${n}`,
                  };
                });

                const cleaned = searchId.replace(/\s+/g, '').trim();
                const filtered = cleaned ? participants.filter((p) => p.id === cleaned) : participants;

                if (cleaned && filtered.length === 0) {
                  return (
                    <div className="p-10 text-center text-gray-600">
                      <div className="text-gray-900 font-semibold">Aucun participant trouvé</div>
                      <div className="text-sm text-gray-500 mt-2">ID recherché: {cleaned}</div>
                    </div>
                  );
                }

                return (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Rôle</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">Situation</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{p.role}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{p.situation}</td>
                          <td className="px-6 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedParticipantId(p.id);
                                setPostLoginView('restitution');
                              }}
                              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                            >
                              Accéder à la restitution
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>
        )}

        {postLoginView === 'restitution' && selectedParticipantId && (
          <div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-900 font-semibold text-xl">Restitution</div>
                <div className="text-gray-500 text-sm mt-1">Participant: {selectedParticipantId}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPostLoginView('list');
                  setSelectedParticipantId(null);
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Retour
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* Section 1 — Service 3 */}
              <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                <div className="flex items-start gap-2">
                  <div className="text-green-600 mt-1">🟢</div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Service 3 – Accompagnement opérationnel (Bonus)</h2>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Le Service 3 est un accompagnement opérationnel complémentaire, basé sur les situations et les décisions analysées précédemment.
                      <br /><br />
                      Il vous permet de prendre conscience de vos choix, de votre logique de décision et des points à améliorer avant toute mise en œuvre concrète.
                      <br /><br />
                      Ce service n'est pas une formation et ne constitue pas un enseignement général.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2 — Document de restitution */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 mt-1">📄</div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Document de restitution – Inclus</h2>
                    <p className="text-sm text-gray-700 leading-relaxed mb-4">
                      Le document de restitution vous est fourni gratuitement.
                      <br /><br />
                      Il synthétise :
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 mb-4 list-disc list-inside">
                      <li>Les situations professionnelles travaillées</li>
                      <li>Les décisions prises</li>
                      <li>Les points de blocage identifiés</li>
                      <li>Les alternatives possibles</li>
                      <li>Les axes d'amélioration recommandés</li>
                    </ul>
                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                      Ce document a pour objectif de vous aider à comprendre votre raisonnement et à préparer une mise en œuvre plus efficace.
                    </p>
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div className="text-gray-900 font-semibold">Document de restitution</div>
                        <button
                          type="button"
                          onClick={() => {
                            setRestitutionPassword('');
                            setRestitutionPasswordError('');
                            setIsRestitutionPasswordOpen(true);
                          }}
                          className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">📌 Ce document est informatif et analytique. Il ne contient pas de tutoriels ni de procédures techniques.</p>
                  </div>
                </div>
              </div>

              {/* Section 3 — Proposition de sessions */}
              <div className="rounded-2xl border border-green-200 bg-green-50 p-6">
                <div className="flex items-start gap-2">
                  <div className="text-green-600 mt-1">🟢</div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">3️⃣ Proposition de sessions – Exécution accompagnée</h2>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Selon votre situation et les constats issus du document de restitution,
                      des sessions d'exécution accompagnée peuvent être proposées.
                      <br /><br />
                      Ces sessions permettent de mettre en œuvre concrètement les ajustements recommandés, directement sur votre projet, avec l'accompagnement d'un expert.
                    </p>
                    <p className="text-xs text-gray-500 mt-3">📌 Important : Les sessions d'exécution accompagnée sont payantes et proposées uniquement lorsque cela est pertinent pour votre situation.</p>
                  </div>
                </div>
              </div>

              {/* Section 4 — Accès aux sessions live */}
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <div className="flex items-start gap-2">
                  <div className="text-gray-600 mt-1">📞</div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Accès aux sessions live</h2>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Si vous êtes intéressé par une session d'exécution accompagnée,
                      merci de contacter l'administrateur ou le responsable du cabinet.
                      <br /><br />
                      L'organisation des sessions se fait :
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1 mb-3 list-disc list-inside">
                      <li>Sur demande</li>
                      <li>En fonction de la disponibilité</li>
                      <li>Via les canaux de communication officiels (groupe WhatsApp dédié ou contact direct)</li>
                    </ul>
                    <p className="text-xs text-gray-500">📌 Aucune session live n'est automatique. Chaque intervention est validée au cas par cas.</p>
                  </div>
                </div>
              </div>

              {/* Phrase de protection */}
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-800 font-medium">
                  🔒 Les sessions d'exécution accompagnée ne constituent pas une formation et ne donnent lieu à aucune certification.
                  Elles sont strictement appliquées à la situation réelle du participant.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {isRestitutionPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <div className="text-gray-900 font-semibold">Accès au document</div>
                <div className="text-xs text-gray-500 mt-1">Saisissez le mot de passe pour ouvrir le lien externe.</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRestitutionPasswordOpen(false);
                  setRestitutionPassword('');
                  setRestitutionPasswordError('');
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                title="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
              <input
                type="password"
                value={restitutionPassword}
                onChange={(e) => {
                  setRestitutionPassword(e.target.value);
                  setRestitutionPasswordError('');
                }}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 001*MA-TRAINING-CONSULTING"
                autoFocus
              />

              {restitutionPasswordError && (
                <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                  {restitutionPasswordError}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setIsRestitutionPasswordOpen(false);
                  setRestitutionPassword('');
                  setRestitutionPasswordError('');
                }}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  const expected = String(session?.accessCode || '').trim();
                  const entered = String(restitutionPassword || '').trim();
                  if (!entered) {
                    setRestitutionPasswordError('Veuillez saisir le mot de passe.');
                    return;
                  }
                  if (!expected || entered !== expected) {
                    setRestitutionPasswordError('Mot de passe incorrect.');
                    return;
                  }
                  setIsRestitutionPasswordOpen(false);
                  openRestitutionLink();
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Ouvrir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantSpace;
