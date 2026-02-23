import React, { useMemo, useState } from "react";
import { buildApiUrl } from "../config/api";

type Situation = "student" | "early_career" | "employed" | "transition";
type Likert = 1 | 2 | 3 | 4 | 5;
type Step = "entry" | "id" | "form" | "legal" | "done";

interface BlockDef {
  key: string;
  title: string;
  closed: { id: string; label: string }[];
  open: { id: string; label: string }[];
}

const blocks: BlockDef[] = [
  {
    key: "role",
    title: "Clarté de rôle",
    closed: [
      { id: "r1", label: "Je peux décrire mon rôle en une phrase claire." },
      { id: "r2", label: "Je sais ce qui est attendu de moi en priorité." },
    ],
    open: [{ id: "ro1", label: "Décrivez votre rôle : mission, livrables, interlocuteurs." }],
  },
  {
    key: "decision",
    title: "Périmètre de décision",
    closed: [
      { id: "d1", label: "Je sais qui doit décider (moi / manager / collectif)." },
      { id: "d2", label: "Je distingue une décision réversible d’une décision lourde." },
    ],
    open: [{ id: "do1", label: "Exemple : contexte, options, choix, conséquence." }],
  },
  {
    key: "reasoning",
    title: "Raisonnement & priorisation",
    closed: [
      { id: "p1", label: "Je formule le problème avant la solution." },
      { id: "p2", label: "Je priorise selon impact, urgence et risque." },
    ],
    open: [{ id: "po1", label: "Méthode : prioriser 5 sujets urgents (étapes)." }],
  },
  {
    key: "pressure",
    title: "Comportement sous pression",
    closed: [
      { id: "s1", label: "Sous stress, je communique clairement." },
      { id: "s2", label: "Je maintiens une qualité minimum acceptable." },
    ],
    open: [{ id: "so1", label: "Pression : réaction, résultat, apprentissage." }],
  },
  {
    key: "self",
    title: "Conscience de soi",
    closed: [
      { id: "a1", label: "Je peux citer forces et points de vigilance avec exemples." },
      { id: "a2", label: "Je sollicite du feedback et je l’utilise." },
    ],
    open: [{ id: "ao1", label: "Changement concret dans les 3 prochains mois." }],
  },
];

const likertLabels: Record<Likert, string> = {
  1: "Pas du tout",
  2: "Plutôt non",
  3: "Mitigé",
  4: "Plutôt oui",
  5: "Totalement",
};

const wizardSteps: { key: Step; label: string }[] = [
  { key: "entry", label: "Cadre" },
  { key: "id", label: "Identification" },
  { key: "form", label: "Évaluation" },
  { key: "legal", label: "Confirmation" },
  { key: "done", label: "Terminé" },
];

function mapLikertToPoints(v: Likert) {
  if (v === 1) return 0;
  if (v === 2) return 1;
  if (v === 3) return 1.5;
  if (v === 4) return 2.5;
  return 3;
}

function roundToHalf(v: number) {
  return Math.round(v * 2) / 2;
}

function classifyTotal(total: number) {
  if (total <= 6) return "Foundations level";
  if (total <= 11) return "Structuring level";
  return "Advanced level";
}

const DiagnosticWonderPage: React.FC = () => {
  const [step, setStep] = useState<Step>("entry");
  const [blockIndex, setBlockIndex] = useState(0);

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [situation, setSituation] = useState<Situation | "">("");

  const [closed, setClosed] = useState<Record<string, Likert>>({});
  const [open, setOpen] = useState<Record<string, string>>({});
  const [truth, setTruth] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const current = blocks[blockIndex];

  const scores = useMemo(() => {
    const perBlock = blocks.reduce((acc, b) => {
      const values = b.closed
        .map((q) => closed[q.id])
        .filter((v): v is Likert => typeof v === "number");
      const avg = values.length
        ? values.reduce((s, v) => s + mapLikertToPoints(v), 0) / values.length
        : 0;
      acc[b.key] = Math.max(0, Math.min(3, roundToHalf(avg)));
      return acc;
    }, {} as Record<string, number>);
    const total = roundToHalf(Object.values(perBlock).reduce((s, v) => s + v, 0));
    return { perBlock, total, orientation: classifyTotal(total) };
  }, [closed]);

  const idValid =
    firstName.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    situation !== "";

  const blockClosedComplete = current.closed.every((q) => typeof closed[q.id] === "number");
  const blockOpenComplete = current.open.every((q) => (open[q.id] || "").trim().length >= 10);

  const primaryDisabled =
    (step === "id" && !idValid) ||
    (step === "form" && !(blockClosedComplete && blockOpenComplete)) ||
    (step === "legal" && !truth);

  const next = () => {
    if (step === "entry") return setStep("id");
    if (step === "id") return setStep("form");
    if (step === "form") {
      if (!(blockClosedComplete && blockOpenComplete)) return;
      if (blockIndex < blocks.length - 1) return setBlockIndex((v) => v + 1);
      return setStep("legal");
    }
    if (step === "legal") {
      if (!truth) return;
      if (isSubmitting) return;

      const payload = {
        participant: { firstName: firstName.trim(), email: email.trim().toLowerCase(), situation },
        responses: {
          closedAnswers: closed,
          openAnswers: open,
        },
        scores: { perBlock: scores.perBlock, total: scores.total, orientation: scores.orientation },
        metadata: {
          source: "web",
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
        },
      };

      localStorage.setItem(
        "ma_consulting_professional_diagnostic",
        JSON.stringify({
          ...payload,
          submittedAt: new Date().toISOString(),
        })
      );

      setIsSubmitting(true);
      setSubmitError(null);
      fetch(buildApiUrl("diagnostic-sessions"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (r) => {
          if (!r.ok) {
            const text = await r.text();
            throw new Error(text || `HTTP ${r.status}`);
          }
          return r.json();
        })
        .then(() => {
          setStep("done");
        })
        .catch(() => {
          setSubmitError("Soumission impossible pour le moment. Vos réponses sont sauvegardées sur cet appareil.");
        })
        .finally(() => {
          setIsSubmitting(false);
        });
      return;
    }
    setStep("entry");
    setBlockIndex(0);
  };

  const back = () => {
    if (step === "id") return setStep("entry");
    if (step === "form") {
      if (blockIndex > 0) return setBlockIndex((v) => v - 1);
      return setStep("id");
    }
    if (step === "legal") return setStep("form");
    setStep("entry");
  };

  const stepIndex = useMemo(() => {
    const idx = wizardSteps.findIndex((s) => s.key === step);
    return idx >= 0 ? idx : 0;
  }, [step]);

  const blockProgress = useMemo(() => {
    if (step !== "form") return 0;
    if (blocks.length <= 1) return 100;
    return Math.round(((blockIndex + 1) / blocks.length) * 100);
  }, [blockIndex, step]);

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_0%,rgba(15,23,42,0.06),transparent_55%),radial-gradient(900px_circle_at_90%_10%,rgba(99,102,241,0.08),transparent_50%)] bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_26px_80px_-58px_rgba(15,23,42,0.35)] ring-1 ring-black/5 overflow-hidden">
          <div className="px-6 sm:px-10 py-7 border-b border-slate-200/70 bg-gradient-to-b from-white/90 to-white/60">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />
                  <span>MA-TRAINING-CONSULTING</span>
                </div>
                <h1 className="mt-3 text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">Diagnostic professionnel</h1>
                <p className="mt-2 text-sm text-slate-600">Diagnostic unique. Aucun choix de domaine.</p>
              </div>

              <div className="sm:min-w-[280px]">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>Progression</span>
                  <span>{stepIndex + 1} / {wizardSteps.length}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden ring-1 ring-inset ring-slate-200">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all"
                    style={{ width: `${Math.round(((stepIndex + 1) / wizardSteps.length) * 100)}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {wizardSteps.map((s, i) => {
                    const active = i <= stepIndex;
                    return (
                      <div key={s.key} className="min-w-0">
                        <div className={`h-1.5 rounded-full ${active ? "bg-slate-900" : "bg-slate-200"}`} />
                        <div className={`mt-1 truncate text-[10px] font-semibold ${active ? "text-slate-900" : "text-slate-500"}`}>{s.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {step === "form" && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                  <span>Blocs</span>
                  <span>{blockIndex + 1} / {blocks.length}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden ring-1 ring-inset ring-slate-200">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${blockProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="px-6 sm:px-10 py-8 space-y-6">
            {step === "entry" && (
              <div className="space-y-4">
                <p className="text-slate-700 leading-relaxed">
                  Ce dispositif n’est pas un test de connaissances et ne constitue pas une formation.
                </p>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-5 py-4 text-sm text-slate-700 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.25)]">
                  Gratuit • Aucune promesse • Résultat indicatif validé par un consultant
                </div>
              </div>
            )}

            {step === "id" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900">Prénom</label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      autoComplete="given-name"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900">Email</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      autoComplete="email"
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <div className="block text-sm font-semibold text-slate-900">Situation actuelle</div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(
                      [
                        { k: "student", l: "Étudiant" },
                        { k: "early_career", l: "Début de carrière" },
                        { k: "employed", l: "Salarié" },
                        { k: "transition", l: "Transition / reconversion" },
                      ] as { k: Situation; l: string }[]
                    ).map((opt) => (
                      <button
                        key={opt.k}
                        type="button"
                        onClick={() => setSituation(opt.k)}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 ${
                          situation === opt.k
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white/80 text-slate-900 hover:border-slate-300"
                        }`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === "form" && (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-semibold text-slate-500">Bloc {blockIndex + 1} / {blocks.length}</div>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">{current.title}</h2>
                </div>

                {current.closed.map((q) => (
                  <div key={q.id} className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)]">
                    <div className="text-sm font-semibold text-slate-900">{q.label}</div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {([1, 2, 3, 4, 5] as Likert[]).map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setClosed((prev) => ({ ...prev, [q.id]: v }))}
                          className={`rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 ${
                            closed[q.id] === v
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-300"
                          }`}
                        >
                          {likertLabels[v]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {current.open.map((q) => (
                  <div key={q.id} className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)]">
                    <label className="block text-sm font-semibold text-slate-900">{q.label}</label>
                    <textarea
                      value={open[q.id] || ""}
                      onChange={(e) => setOpen((prev) => ({ ...prev, [q.id]: e.target.value }))}
                      rows={4}
                      className="mt-3 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-200"
                      placeholder="Minimum 10 caractères…"
                    />
                  </div>
                ))}

                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-5 py-4 text-sm text-slate-800 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.22)]">
                  Score bloc (automatisé, indicatif) : {scores.perBlock[current.key]} / 3
                </div>
              </div>
            )}

            {step === "legal" && (
              <div className="space-y-4">
                <label className="flex items-start gap-3 text-sm text-slate-800 rounded-2xl border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)]">
                  <input
                    type="checkbox"
                    checked={truth}
                    onChange={(e) => setTruth(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-slate-900"
                  />
                  <span>Je confirme que mes réponses sont sincères et reflètent ma situation actuelle.</span>
                </label>

                {submitError && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">
                    {submitError}
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-5 text-sm text-slate-700 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.28)]">
                  Total indicatif : {scores.total} / 15 • Orientation : {scores.orientation}
                </div>
              </div>
            )}

            {step === "done" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-slate-900">Merci, votre diagnostic a été soumis.</h2>
                <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-5 py-4 text-sm text-slate-700 shadow-[0_18px_50px_-44px_rgba(15,23,42,0.22)]">
                  Pré-analyse automatique + revue humaine. Vous serez contacté par email.
                </div>
              </div>
            )}
          </div>

          <div className="px-6 sm:px-10 py-6 border-t border-slate-200/70 bg-white/70">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              {step !== "entry" && step !== "done" && (
                <button
                  type="button"
                  onClick={back}
                  className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white/85 px-5 py-3 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                >
                  Précédent
                </button>
              )}
              {step !== "done" && (
                <button
                  type="button"
                  onClick={next}
                  disabled={primaryDisabled}
                  className={`w-full sm:w-auto rounded-xl px-5 py-3 text-sm font-semibold text-white ${
                    primaryDisabled
                      ? "bg-slate-300 cursor-not-allowed"
                      : "bg-slate-900 hover:bg-slate-800 shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                  }`}
                >
                  {step === "entry" && "Commencer le diagnostic professionnel"}
                  {step === "id" && "Continuer"}
                  {step === "form" && (blockIndex === blocks.length - 1 ? "Continuer" : "Bloc suivant")}
                  {step === "legal" && (isSubmitting ? "Soumission…" : "Soumettre")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticWonderPage;
