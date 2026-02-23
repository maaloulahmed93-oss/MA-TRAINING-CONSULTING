import React, { useEffect, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ESPACE_RESSOURCES_ITEMS } from "../data/espaceRessourcesData";

const EspaceRessourceDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { variant, slug } = useParams();

  const title = useMemo(() => {
    if (variant !== "gratuites" && variant !== "bonus") return "";
    const found = ESPACE_RESSOURCES_ITEMS.find(
      (x) => x.variant === variant && x.slug === slug
    );
    if (found?.title) return found.title;
    return String(slug ?? "");
  }, [variant, slug]);

  if (variant !== "gratuites" && variant !== "bonus") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-10">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
            <div className="text-xl font-bold text-gray-900">Page introuvable</div>
            <button
              type="button"
              className="mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
              onClick={() => navigate("/espaces-ressources/selection")}
            >
              Retour
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasResourceAccess = sessionStorage.getItem("matc_resources_access") === "1";
  const hasBonusAccess = sessionStorage.getItem("matc_resources_bonus_access") === "1";

  useEffect(() => {
    if (variant !== "gratuites" && variant !== "bonus") return;
    if (!hasResourceAccess) {
      navigate("/espaces-ressources", { replace: true });
      return;
    }
    if (variant === "bonus" && !hasBonusAccess) {
      navigate("/espaces-ressources/selection", { replace: true });
    }
  }, [variant, hasResourceAccess, hasBonusAccess, navigate]);

  if (variant === "gratuites" || variant === "bonus") {
    if (!hasResourceAccess) return null;
    if (variant === "bonus" && !hasBonusAccess) return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
            <div className="flex justify-start mb-4">
              <Link
                to="/"
                className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-slate-100 hover:bg-slate-200 text-slate-700 ring-1 ring-slate-200"
              >
                Retour à l’accueil
              </Link>
            </div>
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                {title}
              </h1>
              <button
                type="button"
                className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-gray-900 font-semibold hover:bg-gray-100 transition-colors"
                onClick={() => navigate(`/espaces-ressources/${variant ?? "selection"}`)}
              >
                Retour
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                <div className="text-base font-bold text-gray-900">Titre</div>
                <button
                  type="button"
                  onClick={() => {}}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Action
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-4">
                <div className="text-base font-bold text-gray-900">Titre</div>
                <button
                  type="button"
                  onClick={() => {}}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  Action
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EspaceRessourceDetailPage;
