import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Espace Ressources
            </h1>
            <p className="mt-4 text-gray-700 leading-relaxed">
              فضاء معرفي يقدّم موارد مهنية مبسّطة،
              <br />
              تهدف إلى توضيح المفاهيم، تطوير طريقة التفكير،
              <br />
              وفهم الوضعيات المهنية الشائعة —
              <br />
              دون تكوين، دون دروس تقنية، ودون توجيه فردي.
            </p>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              هذا الفضاء لا يقدّم تشخيصًا مهنيًا، ولا استشارة فردية،
              <br />
              بل محتوى توضيحي عام مبني على وضعيات مهنية نموذجية.
            </p>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900">
                Ressources gratuites
              </h2>
              <p className="mt-2 text-gray-700">
                موارد متاحة للعموم،
                <br />
                تساعد على فهم المفاهيم الأساسية،
                <br />
                وتطوير منطق اتخاذ القرار المهني.
              </p>
              <div className="mt-4 space-y-2 text-gray-700">
                <div>وضعيات مهنية قصيرة</div>
                <div>أسئلة تفكير (QCM بسيط)</div>
                <div>توضيح فروقات بين أدوار ومسميات</div>
                <div>نصائح عامة</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900">
                Ressources Bonus (Accès réservé)
              </h2>
              <p className="mt-2 text-gray-700">
                موارد إضافية مخصّصة حصريًا
                <br />
                للمشاركين في خدمات MA Consulting المدفوعة.
              </p>
              <p className="mt-3 text-gray-700">
                يتم تفعيل الوصول إليها عبر Code d’accès.
              </p>
              <p className="mt-4 text-sm text-gray-600">
                هذه الموارد تُكمّل المسار الاستشاري، ولا تُقدَّم بشكل مستقل.
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
              Accéder à l’Espace Ressources
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
                  كل Code d’accès شخصي وغير قابل للمشاركة.
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
                Code d’accès غير صحيح.
              </div>
            )}
          </section>

          <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Obtenir un accès gratuit aux ressources publiques
            </h2>
            <p className="mt-3 text-gray-700">
              للحصول على accès إلى الموارد المجانية، يرجى ملء النموذج التالي.
            </p>

            <form onSubmit={onSubmitFreeAccess} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900">
                    الاسم
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
                    اللقب
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
                    البريد الإلكتروني
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
                    رقم WhatsApp
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
                  لقد تحصلت علي رمز الدخول. و هو {ACCESS_CODE}
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
