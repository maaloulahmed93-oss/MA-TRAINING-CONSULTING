import React, { useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Link2 } from "lucide-react";
import { ESPACE_RESSOURCES_ITEMS } from "../data/espaceRessourcesData";

const EspaceRessourcesGratuitesPage: React.FC = () => {
  const navigate = useNavigate();

  const items = useMemo(
    () => ESPACE_RESSOURCES_ITEMS.filter((x) => x.variant === "gratuites"),
    []
  );

  useEffect(() => {
    const hasResourceAccess = sessionStorage.getItem("matc_resources_access") === "1";
    if (!hasResourceAccess) {
      navigate("/espaces-ressources", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-10">
        <div className="max-w-5xl mx-auto space-y-6">
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
              Espace Ressources &amp; Recommandations professionnelles – Orientation &amp; Compréhension Métier
            </h1>
            <p className="mt-3 text-gray-700">
              Situations, repères et recommandations professionnelles
              <br />
              pour comprendre et décider — sans entrer dans une logique de formation académique.
            </p>
            <p className="mt-4 text-gray-700">
              Cet espace regroupe des ressources sélectionnées pour mieux lire les enjeux métiers, les rôles,
              et les choix professionnels dans un contexte concret.
              <br />
              Le contenu est orienté décision et clarification, et ne constitue pas une formation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it) => {
              const Icon = it.actionLabel === "Voir" ? Eye : Link2;
              return (
                <div
                  key={it.slug}
                  className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col"
                >
                  <div className="text-lg font-bold text-gray-900">{it.title}</div>
                  <div className="mt-2 text-sm text-gray-600">{it.shortDescription}</div>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/espaces-ressources/gratuites/${it.slug}`)
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {it.actionLabel}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/espaces-ressources/selection")}
                      className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Retour
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 text-sm text-gray-600">
            Ces ressources ne constituent ni une formation, ni un entraînement, et ne remplacent pas un accompagnement
            individuel. Elles offrent un cadre de compréhension et d’orientation.
          </div>
        </div>
      </div>
    </div>
  );
};

export default EspaceRessourcesGratuitesPage;
