import React, { useMemo, useState } from "react";
import { motion, useReducedMotion, type Easing } from "framer-motion";
import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

type LangKey = "fr" | "en";

type SubSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  deliverablesTitle?: string;
  deliverables?: string[];
};

type Section = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  subSections?: SubSection[];
  faqs?: Array<{ q: string; a: string }>;
  numbered?: Array<{ title: string; body: string }>;
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");

const buildDownloadText = (title: string, subtitle: string, sections: Section[]) => {
  const lines: string[] = [];
  lines.push(title);
  lines.push(subtitle);
  lines.push("");

  for (const section of sections) {
    lines.push(section.title);
    lines.push("-");

    if (section.paragraphs) {
      for (const p of section.paragraphs) {
        lines.push(p);
        lines.push("");
      }
    }

    if (section.bullets) {
      for (const b of section.bullets) {
        lines.push(`- ${b}`);
      }
      lines.push("");
    }

    if (section.subSections) {
      for (const ss of section.subSections) {
        lines.push(ss.title);
        if (ss.paragraphs) {
          for (const p of ss.paragraphs) {
            lines.push(p);
          }
        }
        if (ss.bullets) {
          for (const b of ss.bullets) {
            lines.push(`- ${b}`);
          }
        }
        if (ss.deliverables && ss.deliverables.length > 0) {
          lines.push(ss.deliverablesTitle ?? "Deliverables:");
          for (const d of ss.deliverables) {
            lines.push(`- ${d}`);
          }
        }
        lines.push("");
      }
    }

    if (section.faqs) {
      for (const f of section.faqs) {
        lines.push(`Q: ${f.q}`);
        lines.push(`A: ${f.a}`);
        lines.push("");
      }
    }

    if (section.numbered) {
      let i = 1;
      for (const n of section.numbered) {
        lines.push(`${i}. ${n.title}`);
        lines.push(n.body);
        lines.push("");
        i += 1;
      }
    }

    lines.push("");
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim() + "\n";
};

const buildPrintableHtml = (opts: {
  title: string;
  subtitle: string;
  sections: Section[];
  dir: "ltr" | "rtl";
  lang: string;
}) => {
  const { title, subtitle, sections, dir, lang } = opts;
  const parts: string[] = [];

  parts.push("<!doctype html>");
  parts.push(`<html lang=\"${escapeHtml(lang)}\" dir=\"${dir}\">`);
  parts.push("<head>");
  parts.push("<meta charset=\"utf-8\" />");
  parts.push("<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />");
  parts.push(`<title>${escapeHtml(title)}</title>`);
  parts.push("<style>");
  parts.push(`
    :root{color-scheme:light;}
    *{box-sizing:border-box;}
    body{margin:0;background:#fff;color:#0f172a;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial;line-height:1.55;}
    .page{padding:40px 32px;}
    .container{max-width:900px;margin:0 auto;}
    .badge{display:inline-block;padding:6px 10px;border:1px solid #e2e8f0;border-radius:999px;background:#f8fafc;font-weight:700;font-size:12px;color:#334155;}
    h1{margin:14px 0 0;font-size:24px;}
    .subtitle{margin:10px 0 0;color:#475569;font-size:14px;}
    .section{margin-top:22px;padding-top:18px;border-top:1px solid #e2e8f0;}
    h2{margin:0 0 10px;font-size:16px;}
    h3{margin:14px 0 8px;font-size:14px;}
    p{margin:8px 0;color:#0f172a;font-size:13px;}
    ul,ol{margin:8px 0 0;padding-${dir === "rtl" ? "right" : "left"}:18px;color:#0f172a;font-size:13px;}
    li{margin:4px 0;}
    .box{margin-top:10px;padding:10px 12px;border:1px solid #c7d2fe;background:#eef2ff;border-radius:12px;}
    .boxTitle{font-weight:800;font-size:12px;color:#1e3a8a;margin-bottom:6px;}
    .qa{margin-top:10px;padding:12px;border:1px solid #e2e8f0;border-radius:12px;background:#f8fafc;}
    .q{font-weight:800;margin:0 0 6px;font-size:13px;}
    .a{margin:0;color:#334155;font-size:13px;}
    @media print{
      .page{padding:18mm 16mm;}
      .section{break-inside:avoid;}
      a{color:inherit;text-decoration:none;}
    }
  `);
  parts.push("</style>");
  parts.push("</head>");
  parts.push("<body>");
  parts.push("<div class=\"page\"><div class=\"container\"> ");
  parts.push(`<span class=\"badge\">${escapeHtml(title)}</span>`);
  parts.push(`<h1>${escapeHtml(subtitle)}</h1>`);

  for (const section of sections) {
    parts.push("<div class=\"section\">");
    parts.push(`<h2>${escapeHtml(section.title)}</h2>`);

    if (section.paragraphs) {
      for (const p of section.paragraphs) {
        parts.push(`<p>${escapeHtml(p)}</p>`);
      }
    }

    if (section.bullets) {
      parts.push("<ul>");
      for (const b of section.bullets) {
        parts.push(`<li>${escapeHtml(b)}</li>`);
      }
      parts.push("</ul>");
    }

    if (section.subSections) {
      for (const ss of section.subSections) {
        parts.push(`<h3>${escapeHtml(ss.title)}</h3>`);
        if (ss.paragraphs) {
          for (const p of ss.paragraphs) {
            parts.push(`<p>${escapeHtml(p)}</p>`);
          }
        }
        if (ss.bullets) {
          parts.push("<ul>");
          for (const b of ss.bullets) {
            parts.push(`<li>${escapeHtml(b)}</li>`);
          }
          parts.push("</ul>");
        }
        if (ss.deliverables && ss.deliverables.length > 0) {
          parts.push("<div class=\"box\">");
          parts.push(`<div class=\"boxTitle\">${escapeHtml(ss.deliverablesTitle ?? "Deliverables:")}</div>`);
          parts.push("<ul>");
          for (const d of ss.deliverables) {
            parts.push(`<li>${escapeHtml(d)}</li>`);
          }
          parts.push("</ul>");
          parts.push("</div>");
        }
      }
    }

    if (section.faqs) {
      for (const f of section.faqs) {
        parts.push("<div class=\"qa\">");
        parts.push(`<div class=\"q\">${escapeHtml(f.q)}</div>`);
        parts.push(`<div class=\"a\">${escapeHtml(f.a)}</div>`);
        parts.push("</div>");
      }
    }

    if (section.numbered) {
      parts.push("<ol>");
      for (const n of section.numbered) {
        parts.push(`<li><strong>${escapeHtml(n.title)}:</strong> ${escapeHtml(n.body)}</li>`);
      }
      parts.push("</ol>");
    }

    parts.push("</div>");
  }

  parts.push("</div></div>");
  parts.push("</body>");
  parts.push("</html>");
  return parts.join("");
};

const downloadTextFile = (filename: string, text: string) => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const openPrintWindow = (html: string) => {
  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => {
    try {
      win.print();
    } catch {
      // no-op
    }
  }, 250);
};

const EcosystemPage: React.FC = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const [lang, setLang] = useState<LangKey>("fr");

  const whatsappLink = useMemo(() => {
    const text =
      "Je déclare avoir pris connaissance de la nature de l’activité et accepter l’ensemble des conditions sans réserve. Je souhaite m’inscrire au Service 1.";
    return `https://wa.me/21644172284?text=${encodeURIComponent(text)}`;
  }, []);

  const easeOut: Easing = [0.16, 1, 0.3, 1];

  const copy = useMemo(() => {
    const frSections: Section[] = [
      {
        // ...
        id: "intro",
        title: "MA-TRAINING-CONSULTING",
        paragraphs: [
          "Système de conseil professionnel basé sur le diagnostic, la simulation et les documents professionnels.",
          "MA-TRAINING-CONSULTING n’est pas un centre de formation, n’est pas une plateforme de cours, n’est pas un programme de promesses rapides.",
          "MA-TRAINING-CONSULTING est un système de conseil professionnel structuré, dont l’objectif est d’accompagner les participants afin de comprendre leur position réelle, tester leurs décisions dans des contextes professionnels concrets et formaliser leur positionnement à travers des documents professionnels à forte valeur.",
        ],
      },
      {
        id: "philosophie",
        title: "Philosophie de MA-TRAINING-CONSULTING",
        bullets: [
          "Aucun apprentissage sans diagnostic",
          "Aucune évaluation basée sur l’opinion",
          "Aucune certification symbolique",
        ],
      },
      {
        id: "livrables",
        title: "Tout livrable produit au sein du système est",
        bullets: [
          "Fondé sur une analyse réelle",
          "Validé par des situations ou missions professionnelles",
          "Formalisé par écrit dans des documents professionnels",
        ],
      },
      {
        id: "parcours",
        title: "Parcours professionnel",
        subSections: [
          {
            title: "Diagnostic général (gratuit)",
            paragraphs: ["Analyse préliminaire permettant d’évaluer :"],
            bullets: ["Le niveau global", "La logique de raisonnement", "L’éligibilité au parcours"],
            deliverablesTitle: "Livrable :",
            deliverables: ["Rapport de diagnostic initial (non définitif)"],
          },
          {
            title: "Service 1 — Diagnostic stratégique & positionnement professionnel",
            paragraphs: ["Analyse approfondie de :"],
            bullets: [
              "La posture professionnelle réelle",
              "Le niveau de maturité décisionnelle",
              "Les rôles professionnels envisageables de manière réaliste",
            ],
            deliverablesTitle: "Livrables :",
            deliverables: [
              "Rapport de diagnostic stratégique",
              "Document de positionnement professionnel",
              "Orientation professionnelle justifiée",
            ],
          },
          {
            title: "Service 2 — Missions professionnelles (réelles ou simulées)",
            paragraphs: ["Mise en situation concrète à travers :"],
            bullets: [
              "Missions professionnelles ou simulations avancées",
              "Prises de décision encadrées",
              "Évaluation directe par des experts",
            ],
            deliverablesTitle: "Livrables :",
            deliverables: ["Rapports de missions", "Analyses des décisions prises", "Feedback professionnel écrit"],
          },
          {
            title: "Service 3 — Accompagnement exécutif (si nécessaire)",
            paragraphs: ["Lorsque l’évaluation révèle un manque d’outils ou de méthodologie :"],
            bullets: [
              "Élaboration d’un plan d’exécution",
              "Introduction de nouveaux outils et stratégies",
              "Apprentissage par l’action, non par la théorie",
            ],
          },
        ],
      },
      {
        id: "documents",
        title: "Les documents professionnels : le cœur du système",
        paragraphs: [
          "Pourquoi les documents sont essentiels ?",
          "Parce que les entreprises se basent sur des preuves, non sur des discours. Un CV seul est insuffisant ; un positionnement professionnel doit être démontré.",
        ],
        subSections: [
          {
            title: "Types de documents",
            bullets: [
              "Documents à structure commune : Document d’Analyse Professionnelle, Rapport de Mission, Analyse Décisionnelle",
              "Documents personnalisés : le contenu, le niveau d’analyse et parfois l’intitulé varient selon chaque participant",
              "Documents internes : destinés exclusivement au participant (comprendre son fonctionnement, identifier ses limites, améliorer sa logique décisionnelle)",
              "Documents externes : utilisables professionnellement (CV, évolution de carrière, candidatures ou promotions)",
            ],
          },
          {
            title: "Valeur des documents pour les entreprises",
            bullets: [
              "Comprendre le profil réel",
              "Évaluer la capacité de décision et d’exécution",
              "Réduire les risques liés au recrutement ou à la promotion",
            ],
          },
          {
            title: "Option dédiée aux entreprises",
            paragraphs: [
              "Toute entreprise peut, avec l’accord du participant, demander une analyse professionnelle détaillée pour appuyer une décision de recrutement ou de promotion.",
            ],
          },
        ],
      },
      {
        id: "faq",
        title: "Questions fréquentes (FAQ)",
        faqs: [
          { q: "MA-TRAINING-CONSULTING est-il une formation ?", a: "Non. Il s’agit d’un système de conseil professionnel." },
          { q: "Y a-t-il des certificats ?", a: "Non. Des documents analytiques exploitables sont fournis." },
          {
            q: "Garantissez-vous un emploi ?",
            a: "Non. Nous clarifions le positionnement et fournissons des preuves, le marché décide.",
          },
          { q: "Le système est-il adapté aux débutants ?", a: "Oui, uniquement après diagnostic." },
          { q: "Peut-on accéder directement aux Services 2 ou 3 ?", a: "Non. Le parcours est progressif et structuré." },
          { q: "Les documents sont-ils identiques pour tous ?", a: "Non. La structure est commune, le contenu est personnalisé." },
          {
            q: "Les entreprises comprennent-elles les documents ?",
            a: "Oui, car ils sont rédigés dans un langage professionnel et analytique.",
          },
        ],
      },
      {
        id: "conditions",
        title: "Conditions générales",
        numbered: [
          { title: "Facturation", body: "Devis fourni avant paiement. Facture officielle après paiement (Prestation de conseil)." },
          {
            title: "Structure du parcours",
            body: "Le parcours est composé de 3 services distincts dans le temps. La participation à un service ne signifie pas la complétion du parcours.",
          },
          { title: "Livraison des documents", body: "Chaque service donne droit uniquement à ses propres livrables et bonus." },
          {
            title: "Respect des consignes",
            body: "Le non-respect des instructions entraîne un blocage du parcours. Aucun remboursement ou compensation ne sera accordé.",
          },
          {
            title: "Confidentialité",
            body: "Interdiction de partager les systèmes, supports ou documents internes. Seuls les documents professionnels externes peuvent être utilisés publiquement.",
          },
          {
            title: "Non-remboursement",
            body: "Aucun remboursement possible, quelle que soit la raison. Tout paiement vaut acceptation totale des conditions.",
          },
          {
            title: "Objectivité et neutralité",
            body: "Les documents sont rédigés sans complaisance. Aucun contenu ne sera modifié pour des raisons émotionnelles ou personnelles.",
          },
          {
            title: "Vérification (Vérification professionnelle)",
            body: "Système de vérification accessible aux entreprises. Toute falsification ou tentative de manipulation est considérée comme une infraction grave.",
          },
          { title: "Accès aux services", body: "Aucun livrable ou service ne sera fourni sans paiement intégral." },
          {
            title: "Règlement interne",
            body: "Tout manquement autorise MA-TRAINING-CONSULTING à prendre la décision jugée conforme à l’intérêt général.",
          },
        ],
      },
      {
        id: "engagement",
        title: "Note importante – Engagement du participant",
        subSections: [
          {
            title: "Confirmation de participation",
            paragraphs: [
              "Lors de la confirmation de participation, le participant est tenu de télécharger ce document, le signer, puis le renvoyer par email avec la mention suivante :",
              "« Je déclare avoir pris connaissance de la nature de l’activité et accepter l’ensemble des conditions sans réserve. »",
            ],
          },
          {
            title: "Confirmation de paiement",
            paragraphs: [
              "Lors de tout paiement (partiel ou total), le participant doit impérativement informer MA-TRAINING-CONSULTING par email, préciser le montant versé, joindre le reçu s’il est disponible et mentionner explicitement :",
              "« Après avoir pris connaissance de la nature de l’activité, je confirme ma participation et déclare avoir effectué le dépôt d’une partie ou de la totalité du montant dû. »",
            ],
          },
          {
            title: "Engagement final",
            bullets: [
              "Respecter strictement les instructions",
              "Suivre les consignes de l’équipe organisatrice et des experts de MA-TRAINING-CONSULTING",
              "Accepter le cadre méthodologique et décisionnel du système",
            ],
          },
        ],
      },
      {
        id: "conclusion",
        title: "Conclusion",
        paragraphs: [
          "MA-TRAINING-CONSULTING ne vend ni promesses ni illusions. Elle construit des analyses, des preuves et des documents professionnels crédibles.",
          "Le positionnement professionnel ne se proclame pas — il se démontre.",
        ],
      },
    ];

    const enSections: Section[] = [
      {
        id: "intro",
        title: "MA-TRAINING-CONSULTING",
        paragraphs: [
          "A professional advisory system built on diagnosis, simulation, and professional documents.",
          "MA-TRAINING-CONSULTING is not a training center, not a course platform, and not a program of quick promises.",
          "MA-TRAINING-CONSULTING is a structured professional advisory system designed to help participants understand their real position, test their decisions in concrete professional contexts, and formalize their positioning through high-value professional documents.",
        ],
      },
      {
        id: "philosophy",
        title: "MA-TRAINING-CONSULTING philosophy",
        bullets: ["No learning without diagnosis", "No evaluation based on opinion", "No symbolic certification"],
      },
      {
        id: "deliverables",
        title: "Every deliverable produced within the system is",
        bullets: ["Based on real analysis", "Validated through professional situations or missions", "Formalized in writing as professional documents"],
      },
      {
        id: "pathway",
        title: "Professional pathway",
        subSections: [
          {
            title: "General diagnosis (free)",
            paragraphs: ["Preliminary analysis to assess:"],
            bullets: ["Overall level", "Reasoning logic", "Eligibility for the pathway"],
            deliverablesTitle: "Deliverable:",
            deliverables: ["Initial diagnosis report (non-final)"],
          },
          {
            title: "Service 1 — Strategic diagnosis & professional positioning",
            paragraphs: ["In-depth analysis of:"],
            bullets: ["Real professional posture", "Decision-making maturity level", "Realistically achievable professional roles"],
            deliverablesTitle: "Deliverables:",
            deliverables: ["Strategic diagnosis report", "Professional positioning document", "Justified professional orientation"],
          },
          {
            title: "Service 2 — Professional missions (real or simulated)",
            paragraphs: ["Concrete practice through:"],
            bullets: ["Professional missions or advanced simulations", "Supervised decision-making", "Direct evaluation by experts"],
            deliverablesTitle: "Deliverables:",
            deliverables: ["Mission reports", "Analysis of decisions made", "Written professional feedback"],
          },
          {
            title: "Service 3 — Executive support (if necessary)",
            paragraphs: ["When assessment reveals lack of tools or methodology:"],
            bullets: ["Creation of an execution plan", "Introduction of new tools and strategies", "Learning by doing, not by theory"],
          },
        ],
      },
      {
        id: "docs",
        title: "Professional documents: the core of the system",
        paragraphs: [
          "Why are documents essential?",
          "Because companies rely on evidence, not speeches. A CV alone is not enough; professional positioning must be demonstrated.",
        ],
        subSections: [
          {
            title: "Document types",
            bullets: [
              "Common-structure documents: Professional Analysis Document, Mission Report, Decision Analysis",
              "Personalized documents: content, depth (and sometimes the title) vary by participant",
              "Internal documents: for the participant (understand how they operate, identify limits, improve decision logic)",
              "External documents: usable professionally (CV, career progression, applications or promotions)",
            ],
          },
          {
            title: "Value for companies",
            bullets: ["Understand the real profile", "Evaluate decision and execution capability", "Reduce risks in hiring or promotion"],
          },
          {
            title: "Company option",
            paragraphs: [
              "With the participant’s consent, any company may request a detailed professional analysis to support a hiring or promotion decision.",
            ],
          },
        ],
      },
      {
        id: "faq",
        title: "Frequently asked questions (FAQ)",
        faqs: [
          { q: "Is MA-TRAINING-CONSULTING a training program?", a: "No. It is a professional advisory system." },
          { q: "Are there certificates?", a: "No. Actionable analytical documents are provided." },
          { q: "Do you guarantee a job?", a: "No. We clarify positioning and provide evidence; the market decides." },
          { q: "Is the system suitable for beginners?", a: "Yes, only after diagnosis." },
          { q: "Can I access Services 2 or 3 directly?", a: "No. The pathway is progressive and structured." },
          { q: "Are documents identical for everyone?", a: "No. The structure is common; the content is personalized." },
          { q: "Do companies understand these documents?", a: "Yes, because they are written in a professional, analytical language." },
        ],
      },
      {
        id: "terms",
        title: "General terms",
        numbered: [
          { title: "Billing", body: "A quotation is provided before payment. An official invoice is issued after payment (advisory service)." },
          {
            title: "Program structure",
            body: "The pathway consists of 3 distinct services over time. Participation in a service does not mean completion of the pathway.",
          },
          { title: "Document delivery", body: "Each service grants access only to its own deliverables and bonuses." },
          {
            title: "Compliance",
            body: "Failure to follow instructions leads to a blockage of the pathway. No refund or compensation will be granted.",
          },
          {
            title: "Confidentiality",
            body: "Sharing internal systems/supports/documents is forbidden. Only external professional documents may be used publicly.",
          },
          { title: "No refunds", body: "No refunds, regardless of the reason. Any payment means full acceptance of the terms." },
          {
            title: "Objectivity & neutrality",
            body: "Documents are written without complacency. No content will be modified for emotional or personal reasons.",
          },
          {
            title: "Verification",
            body: "A verification system is available to companies. Any falsification or manipulation attempt is considered a serious offense.",
          },
          { title: "Service access", body: "No deliverable or service will be provided without full payment." },
          {
            title: "Internal rules",
            body: "Any breach authorizes MA-TRAINING-CONSULTING to take the decision deemed aligned with the general interest.",
          },
        ],
      },
      {
        id: "commitment",
        title: "Important note — Participant commitment",
        subSections: [
          {
            title: "Participation confirmation",
            paragraphs: [
              "When confirming participation, the participant must download this document, sign it, then send it back by email with the following statement:",
              "“I declare that I have understood the nature of the activity and accept all conditions without reservation.”",
            ],
          },
          {
            title: "Payment confirmation",
            paragraphs: [
              "For any payment (partial or total), the participant must email MA-TRAINING-CONSULTING, specify the amount paid, attach the receipt if available, and explicitly mention:",
              "“After acknowledging the nature of the activity, I confirm my participation and declare that I have deposited part or all of the amount due.”",
            ],
          },
          {
            title: "Final commitment",
            bullets: [
              "Strictly follow instructions",
              "Follow the guidelines of the organizing team and MA-TRAINING-CONSULTING experts",
              "Accept the system’s methodological and decision framework",
            ],
          },
        ],
      },
      {
        id: "conclusion",
        title: "Conclusion",
        paragraphs: [
          "MA-TRAINING-CONSULTING does not sell promises or illusions. It builds analysis, evidence, and credible professional documents.",
          "Professional positioning is not claimed — it is demonstrated.",
        ],
      },
    ];

    return {
      fr: {
        title: "MA-TRAINING-CONSULTING",
        subtitle: "Système de conseil professionnel basé sur le diagnostic, la simulation et les documents professionnels",
        pdfLabel: "Télécharger PDF",
        downloadLabel: "Télécharger",
        downloadFilename: "MA-TRAINING-CONSULTING_Systeme_FR.txt",
        sections: frSections,
      },
      en: {
        title: "MA-TRAINING-CONSULTING",
        subtitle: "Professional advisory system built on diagnosis, simulation, and professional documents",
        pdfLabel: "Download PDF",
        downloadLabel: "Download",
        downloadFilename: "MA-TRAINING-CONSULTING_System_EN.txt",
        sections: enSections,
      },
    };
  }, []);

  const current = lang === "fr" ? copy.fr : copy.en;
  const currentDir: "ltr" | "rtl" = "ltr";

  const handleDownload = () => {
    const text = buildDownloadText(current.title, current.subtitle, current.sections);
    downloadTextFile(current.downloadFilename, text);
  };

  const handleDownloadPdf = () => {
    const html = buildPrintableHtml({
      title: current.title,
      subtitle: current.subtitle,
      sections: current.sections,
      dir: currentDir,
      lang: lang,
    });
    openPrintWindow(html);
  };

  const containerVariants = useMemo(
    () =>
      prefersReducedMotion
        ? undefined
        : {
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
          },
    [prefersReducedMotion]
  );

  const itemVariants = useMemo(
    () =>
      prefersReducedMotion
        ? undefined
        : {
            hidden: { opacity: 0, y: 12 },
            show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easeOut } },
          },
    [prefersReducedMotion, easeOut]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-white" dir={currentDir}>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_42%,transparent_78%)]" />
          <div className="absolute -top-28 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.12),transparent_60%)] blur-2xl" />
          <div className="absolute -bottom-28 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.08),transparent_62%)] blur-2xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="pt-6 sm:pt-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors font-semibold"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{lang === "fr" ? "Retour" : "Back"}</span>
            </button>
          </div>

          <div className="max-w-5xl mx-auto pt-10 pb-16 sm:pt-12 sm:pb-20 lg:pt-14 lg:pb-24">
            <motion.div
              initial={prefersReducedMotion ? false : "hidden"}
              animate="show"
              variants={containerVariants}
              className="relative rounded-[2.5rem] sm:rounded-[3rem] border border-white/60 bg-white/75 backdrop-blur-xl shadow-[0_34px_90px_-60px_rgba(15,23,42,0.45)] ring-1 ring-black/5 overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-slate-900/[0.03] via-transparent to-indigo-600/[0.07]" />

              <div className="relative px-5 py-10 sm:px-10 sm:py-12 lg:px-14">
                <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:gap-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="inline-flex w-fit items-center rounded-full border border-slate-200/70 bg-white/80 px-4 py-2 text-xs font-semibold tracking-wide text-slate-700 shadow-sm ring-1 ring-black/5">
                      {current.title}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                      <div className="inline-flex w-fit rounded-full border border-slate-200/70 bg-white/70 p-1 ring-1 ring-black/5">
                        <button
                          type="button"
                          onClick={() => setLang("fr")}
                          className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-colors ${
                            lang === "fr" ? "bg-slate-900 text-white" : "text-slate-700 hover:text-slate-900"
                          }`}
                        >
                          Français
                        </button>
                        <button
                          type="button"
                          onClick={() => setLang("en")}
                          className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-full transition-colors ${
                            lang === "en" ? "bg-slate-900 text-white" : "text-slate-700 hover:text-slate-900"
                          }`}
                        >
                          English
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleDownloadPdf}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 shadow-sm hover:bg-slate-50 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>{current.pdfLabel}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>{current.downloadLabel}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight">
                      {current.subtitle}
                    </h1>
                  </div>
                </motion.div>

                <div className="mt-10 space-y-6 sm:space-y-8">
                  {current.sections.map((section) => (
                    <motion.div
                      key={section.id}
                      variants={itemVariants}
                      className="rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_-46px_rgba(15,23,42,0.22)] ring-1 ring-black/5"
                    >
                      <h2 className="text-lg sm:text-xl font-semibold text-slate-900">{section.title}</h2>

                      {section.paragraphs && (
                        <div className="mt-4 space-y-3">
                          {section.paragraphs.map((p, idx) => (
                            <p key={idx} className="text-sm sm:text-base text-slate-700 leading-relaxed">
                              {p}
                            </p>
                          ))}
                        </div>
                      )}

                      {section.bullets && (
                        <ul className="mt-5 space-y-2 text-sm sm:text-base text-slate-700 list-disc pl-5">
                          {section.bullets.map((b, idx) => (
                            <li key={idx}>{b}</li>
                          ))}
                        </ul>
                      )}

                      {section.subSections && (
                        <div className="mt-6 space-y-4">
                          {section.subSections.map((ss, idx) => (
                            <div key={idx} className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 sm:p-6">
                              <div className="text-sm sm:text-base font-semibold text-slate-900">{ss.title}</div>

                              {ss.paragraphs && (
                                <div className="mt-3 space-y-2">
                                  {ss.paragraphs.map((p, i2) => (
                                    <p key={i2} className="text-sm sm:text-base text-slate-700 leading-relaxed">
                                      {p}
                                    </p>
                                  ))}
                                </div>
                              )}

                              {ss.bullets && (
                                <ul className="mt-4 space-y-2 text-sm sm:text-base text-slate-700 list-disc pl-5">
                                  {ss.bullets.map((b, i2) => (
                                    <li key={i2}>{b}</li>
                                  ))}
                                </ul>
                              )}

                              {ss.deliverables && ss.deliverables.length > 0 && (
                                <div className="mt-4 rounded-xl border border-indigo-200/60 bg-indigo-50/40 p-4">
                                  <div className="text-xs sm:text-sm font-semibold text-indigo-900">{ss.deliverablesTitle}</div>
                                  <ul className="mt-2 space-y-1 text-sm sm:text-base text-slate-700 list-disc pl-5">
                                    {ss.deliverables.map((d, i2) => (
                                      <li key={i2}>{d}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {section.faqs && (
                        <div className="mt-6 space-y-3">
                          {section.faqs.map((f, idx) => (
                            <details key={idx} className="group rounded-2xl border border-slate-200/70 bg-white/70 p-5">
                              <summary className="cursor-pointer select-none font-semibold text-slate-900">{f.q}</summary>
                              <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">{f.a}</p>
                            </details>
                          ))}
                        </div>
                      )}

                      {section.numbered && (
                        <div className="mt-6 space-y-3">
                          {section.numbered.map((n, idx) => (
                            <div key={idx} className="rounded-2xl border border-slate-200/70 bg-white/70 p-5">
                              <div className="text-sm sm:text-base font-semibold text-slate-900">
                                {idx + 1}. {n.title}
                              </div>
                              <p className="mt-3 text-sm sm:text-base text-slate-700 leading-relaxed">{n.body}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}

                <motion.div
                  variants={itemVariants}
                  className="rounded-3xl border border-emerald-200/60 bg-emerald-50/50 backdrop-blur-xl p-6 sm:p-8 shadow-[0_20px_60px_-46px_rgba(15,23,42,0.22)] ring-1 ring-black/5"
                >
                  <div className="space-y-4">
                    <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Confirmation finale</h2>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                      Après lecture des conditions ci-dessus, vous pouvez confirmer votre accord et nous contacter directement via WhatsApp.
                    </p>
                    <button
                      type="button"
                      onClick={() => window.open(whatsappLink, "_blank", "noopener,noreferrer")}
                      className="w-full rounded-2xl bg-emerald-600 px-6 py-4 text-sm sm:text-base font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
                    >
                      J’ai lu les conditions et je les accepte — Me contacter sur WhatsApp
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default EcosystemPage;
