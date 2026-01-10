import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Espace Ressources – Orientation & Compréhension Métier
            </h1>
            <p className="mt-3 text-gray-700">
              وضعيات، مفاهيم، ونصائح مهنية
              <br />
              لمساعدتك على الفهم واتخاذ القرار — مش للتعلّم النظري.
            </p>
            <p className="mt-4 text-gray-700">
              هذا الفضاء يجمع موارد مختارة تساعدك تفهم منطق المهن، الأدوار، والاختيارات
              المهنية في سياق واقعي.
              <br />
              المحتوى توجيهي، غير تدريبي.
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
            هذه الموارد لا تُعتبر تكوينًا أو تدريبًا، ولا تعوّض مرافقة مهنية فردية. هي فضاء
            فهم وتوجيه عام.
          </div>
        </div>
      </div>
    </div>
  );
};

export default EspaceRessourcesGratuitesPage;
