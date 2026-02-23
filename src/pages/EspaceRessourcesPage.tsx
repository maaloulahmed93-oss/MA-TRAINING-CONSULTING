import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validateEspaceRessourcesAccessCode } from "../services/espaceRessourcesAccessService";

const ACCESS_CODE = "00000000";

const EspaceRessourcesPage: React.FC = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [codeStatus, setCodeStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    whatsapp: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const accessGranted = useMemo(() => codeStatus === "success", [codeStatus]);

  const onValidateAccess = async () => {
    const remoteValid = await validateEspaceRessourcesAccessCode(code.trim());
    const valid = remoteValid === null ? code.trim() === ACCESS_CODE : remoteValid;

    if (valid) {
      sessionStorage.setItem("matc_resources_access", "1");
      setCodeStatus("success");
      navigate("/espaces-ressources/selection");
      return;
    }

    setCodeStatus("error");
  };

  const onSubmitFreeAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
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
            <p className="mt-4 text-gray-700 leading-relaxed">
              Un espace de ressources professionnelles, conçu pour vous apporter des repères concrets,
              <br />
              clarifier les concepts clés et structurer votre manière de réfléchir,
              <br />
              à partir de situations professionnelles courantes —
              <br />
              sans formation, sans cours techniques, et sans accompagnement individuel.
            </p>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              Cet espace ne propose ni diagnostic individuel ni consultation personnalisée,
              <br />
              mais un contenu explicatif et opérationnel basé sur des cas d’usage métiers.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900">
                Ressources gratuites
              </h2>
              <p className="mt-2 text-gray-700">
                Ressources accessibles à tous,
                <br />
                pour consolider les fondamentaux,
                <br />
                et renforcer votre logique de décision professionnelle.
              </p>
              <div className="mt-4 space-y-2 text-gray-700">
                <div>Mises en situation professionnelles courtes</div>
                <div>Questions de réflexion (QCM simplifié)</div>
                <div>Clarification des rôles et des intitulés</div>
                <div>Conseils généraux</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900">
                Ressources Bonus (Accès réservé)
              </h2>
              <p className="mt-2 text-gray-700">
                Ressources complémentaires, réservées exclusivement
                <br />
                aux participants des services MA-TRAINING-CONSULTING.
              </p>
              <p className="mt-3 text-gray-700">
                L’accès est activé via un code d’accès.
              </p>
              <p className="mt-4 text-sm text-gray-600">
                Ces ressources complètent un parcours de service et ne sont pas proposées de façon indépendante.
              </p>
              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                {accessGranted
                  ? "Accès bonus activé (contenu protégé)"
                  : "Contenu bonus verrouillé (accès réservé)"}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Accéder à l’Espace Ressources &amp; Recommandations professionnelles
            </h2>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Code d’accès
                </label>
                <input
                  type="password"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setCodeStatus("idle");
                  }}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="************"
                />
                <div className="mt-2 text-xs text-gray-500">
                  Chaque code d’accès est personnel et non partageable.
                </div>
              </div>

              <button
                type="button"
                onClick={onValidateAccess}
                className="w-full rounded-lg bg-green-600 px-5 py-3 text-white font-semibold hover:bg-green-700 transition-colors"
              >
                Valider l’accès
              </button>
            </div>

            {codeStatus === "success" && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
                Accès validé.
              </div>
            )}

            {codeStatus === "error" && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                Code d’accès incorrect.
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Obtenir un accès gratuit aux ressources publiques
            </h2>
            <p className="mt-3 text-gray-700">
              Pour obtenir un accès aux ressources publiques, merci de compléter le formulaire ci-dessous.
            </p>

            <form onSubmit={onSubmitFreeAccess} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900">
                    Numéro WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        whatsapp: e.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full md:w-auto rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Obtenir mon accès gratuit
              </button>

              {formSubmitted && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
                  Votre code d’accès est : {ACCESS_CODE}
                </div>
              )}
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EspaceRessourcesPage;
