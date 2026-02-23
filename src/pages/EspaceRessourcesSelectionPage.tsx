import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEspaceRessourcesBonusCode } from "../services/espaceRessourcesAccessService";

const BONUS_ACCESS_CODE_FALLBACK = "00000000";

const EspaceRessourcesSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  const [bonusChecked, setBonusChecked] = useState(false);
  const [bonusDenied, setBonusDenied] = useState(false);
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [bonusCode, setBonusCode] = useState("");
  const [bonusCodeError, setBonusCodeError] = useState(false);

  useEffect(() => {
    const hasResourceAccess = sessionStorage.getItem("matc_resources_access") === "1";
    if (!hasResourceAccess) {
      navigate("/espaces-ressources", { replace: true });
    }
  }, [navigate]);

  const onAccessFree = () => {
    navigate("/espaces-ressources/gratuites");
  };

  const onVerifyBonusAccess = () => {
    setBonusChecked(true);

    const hasBonusAccess = sessionStorage.getItem("matc_resources_bonus_access") === "1";
    if (hasBonusAccess) {
      navigate("/espaces-ressources/bonus");
      return;
    }

    setBonusDenied(false);
    setBonusCodeError(false);
    setShowBonusForm(true);
  };

  const onValidateBonusCode = async () => {
    const remoteValid = await validateEspaceRessourcesBonusCode(bonusCode.trim());
    const fallbackExpected =
      localStorage.getItem("matc_resources_bonus_code") ?? BONUS_ACCESS_CODE_FALLBACK;
    const valid =
      remoteValid === null ? bonusCode.trim() === fallbackExpected : remoteValid;

    if (valid) {
      sessionStorage.setItem("matc_resources_bonus_access", "1");
      navigate("/espaces-ressources/bonus");
      return;
    }

    setBonusCodeError(true);
    setBonusDenied(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
            <div className="flex justify-start mb-4">
              <Link
                to="/"
                className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700 ring-1 ring-slate-200"
              >
                Retour à l’accueil
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Espace Ressources &amp; Recommandations professionnelles
            </h1>
            <p className="mt-3 text-gray-700">
              Selon votre niveau d’accès, vous pouvez entrer directement ou être invité à activer votre accès.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-blue-200 p-6 md:p-8">
              <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                Ressources gratuites
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                Ressources gratuites
              </h2>
              <p className="mt-2 text-gray-700">
                Des ressources accessibles à tous, pour clarifier les fondamentaux et structurer votre prise de décision.
              </p>

              <div className="mt-4 space-y-2 text-gray-700">
                <div>Mises en situation professionnelles courtes</div>
                <div>QCM avec explications</div>
                <div>Conseils d’orientation professionnelle</div>
                <div>Clarification des rôles et des intitulés</div>
              </div>

              <button
                type="button"
                onClick={onAccessFree}
                className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Accéder aux ressources gratuites
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-amber-200 p-6 md:p-8">
              <div className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                Ressources Bonus
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                Ressources Bonus
                <span className="block text-sm font-semibold text-gray-600">
                  (Accès réservé aux participants)
                </span>
              </h2>
              <p className="mt-2 text-gray-700">
                Ressources avancées, réservées exclusivement aux participants des services MA-TRAINING-CONSULTING.
              </p>
              <p className="mt-3 text-sm text-gray-600">
                Cet espace nécessite un accès spécifique, lié à la participation à Service 1 et/ou Service 2.
              </p>

              <button
                type="button"
                onClick={onVerifyBonusAccess}
                className="mt-6 w-full rounded-lg bg-amber-500 px-5 py-3 text-white font-semibold hover:bg-amber-600 transition-colors"
              >
                Vérifier mon accès
              </button>

              {showBonusForm && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4 text-gray-800">
                  <label className="block text-sm font-semibold text-gray-900">
                    Code d’accès
                  </label>
                  <input
                    type="password"
                    value={bonusCode}
                    onChange={(e) => {
                      setBonusCode(e.target.value);
                      setBonusCodeError(false);
                    }}
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="************"
                  />
                  {bonusCodeError && (
                    <div className="mt-2 text-sm text-red-700">
                      Code d’accès incorrect.
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onValidateBonusCode}
                      className="inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
                    >
                      Valider
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowBonusForm(false);
                        setBonusCode("");
                        setBonusCodeError(false);
                      }}
                      className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {bonusChecked && bonusDenied && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-800">
                  <div className="mt-1">
                    Cet espace est réservé aux participants des services MA-TRAINING-CONSULTING.
                    <br />
                    Pour demander un accès, consultez nos services professionnels.
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="mt-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    Découvrir les services
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 md:p-8 text-sm text-gray-600">
            Les Ressources Bonus ne sont pas vendues séparément et ne constituent pas un service de conseil à elles seules.
            Elles s’inscrivent comme un accompagnement de contenu, en complément d’un parcours professionnel.
          </div>
        </div>
      </div>
    </div>
  );
};

export default EspaceRessourcesSelectionPage;
