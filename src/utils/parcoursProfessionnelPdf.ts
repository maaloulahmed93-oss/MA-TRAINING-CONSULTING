export const downloadParcoursProfessionnelPdf = () => {
  const bytes = buildParcoursProfessionnelPdf();
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "SYSTEME-DE-CONSULTING-PROFESSIONNEL-STRUCTURE.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

type PdfFont = "F1" | "F2";

type PdfLine = { text: string; font: PdfFont; size: number };

const normalizeAscii = (text: string) =>
  text
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/→/g, "->")
    .replace(/€/g, "EUR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const pdfEscape = (text: string) =>
  normalizeAscii(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const wrapText = (text: string, maxLen: number) => {
  const normalized = normalizeAscii(text);
  if (!normalized) return [""];

  const words = normalized.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const w of words) {
    if (!current) {
      current = w;
      continue;
    }

    if ((current + " " + w).length <= maxLen) {
      current += " " + w;
    } else {
      lines.push(current);
      current = w;
    }
  }

  if (current) lines.push(current);
  return lines;
};

const buildPageDecorations = (pageNumber: number, totalPages: number) => {
  const left = 50;
  const right = 562;
  const pageLeft = 34;
  const pageRight = 578;

  const headerTopY = 770;
  const headerDividerY = 742;
  const headerBandY = 736;
  const headerBandH = 40;
  const footerDividerY = 58;
  const footerTextY = 42;

  const parts: string[] = [];

  parts.push("q\n");

  // Page frame
  parts.push("0.85 0.85 0.85 RG\n0.8 w\n");
  parts.push(`${pageLeft} 40 m ${pageRight} 40 l ${pageRight} 776 l ${pageLeft} 776 l h S\n`);

  // Header band background
  parts.push("0.97 0.97 0.98 rg\n");
  parts.push(`${pageLeft} ${headerBandY} ${pageRight - pageLeft} ${headerBandH} re f\n`);

  parts.push("0.15 0.15 0.15 RG\n0.9 w\n");
  parts.push(`${left} ${headerDividerY} m ${right} ${headerDividerY} l S\n`);
  parts.push(
    `BT\n/F2 12 Tf\n1 0 0 1 ${left} ${headerTopY} Tm\n(SYSTEME DE CONSULTING PROFESSIONNEL) Tj\nET\n`
  );
  parts.push(
    `BT\n/F1 10 Tf\n1 0 0 1 ${left} ${headerTopY - 14} Tm\n(MA-TRAINING-CONSULTING) Tj\nET\n`
  );
  parts.push(
    `BT\n/F1 9 Tf\n1 0 0 1 ${left} ${headerTopY - 28} Tm\n(Parcours Professionnel) Tj\nET\n`
  );

  parts.push("0.70 0.70 0.70 RG\n0.5 w\n");
  parts.push(`${left} ${footerDividerY} m ${right} ${footerDividerY} l S\n`);
  parts.push(
    `BT\n/F1 9 Tf\n1 0 0 1 ${left} ${footerTextY} Tm\n(MA-TRAINING-CONSULTING - Parcours Professionnel) Tj\nET\n`
  );
  parts.push(
    `BT\n/F1 9 Tf\n1 0 0 1 500 ${footerTextY} Tm\n(Page ${pageNumber}/${totalPages}) Tj\nET\n`
  );

  parts.push("Q\n");
  return parts.join("");
};

const buildTextOps = (lines: PdfLine[]) => {
  const ops: string[] = [];

  const pages: string[][] = [[]];
  let y = 710;

  const marginLeft = 50;
  const marginRight = 562;
  const marginBottom = 70;

  const getMaxLen = (size: number) => {
    if (size >= 16) return 58;
    if (size >= 14) return 66;
    if (size >= 13) return 72;
    if (size >= 12) return 78;
    return 84;
  };

  const newPage = () => {
    pages.push([]);
    y = 710;
  };

  const addLine = (line: PdfLine, opts?: { xOffset?: number; extraGapAfter?: number }) => {
    const currentPage = pages[pages.length - 1];

    const lineHeight = Math.round(line.size * 1.25);
    if (y < marginBottom) newPage();

    const isHeading = line.font === "F2" && line.size >= 12;
    if (isHeading && y < marginBottom + 110) newPage();

    const escaped = pdfEscape(line.text);

    const x = marginLeft + (opts?.xOffset ?? 0);
    const block = `BT\n/${line.font} ${line.size} Tf\n1 0 0 1 ${x} ${y} Tm\n(${escaped}) Tj\nET\n`;

    currentPage.push(block);
    y -= lineHeight;

    if (isHeading) {
      const ruleY = y + Math.round(line.size * 0.25);
      currentPage.push(`0.80 0.80 0.80 RG\n0.6 w\n${marginLeft} ${ruleY} m ${marginRight} ${ruleY} l S\n`);
      y -= 8;
    }
    if (opts?.extraGapAfter) y -= opts.extraGapAfter;
  };

  for (const line of lines) {
    if (line.text === "") {
      y -= Math.round(line.size * 0.9);
      continue;
    }

    const maxLen = getMaxLen(line.size);
    const normalized = normalizeAscii(line.text);
    const isBullet = normalized.startsWith("- ");

    const baseText = isBullet ? normalized.slice(2).trim() : normalized;
    const wrapped = wrapText(baseText, maxLen);

    for (let i = 0; i < wrapped.length; i++) {
      const w = wrapped[i];
      if (isBullet) {
        if (i === 0) {
          addLine({ ...line, text: `- ${w}` }, { xOffset: 0 });
        } else {
          addLine({ ...line, text: w }, { xOffset: 14 });
        }
      } else {
        addLine({ ...line, text: w });
      }
    }
  }

  for (const p of pages) {
    ops.push(p.join(""));
  }

  return {
    pages: ops,
  };
};

const buildParcoursProfessionnelPdf = (): Uint8Array => {
  const contentLines: PdfLine[] = [
    { text: "", font: "F1", size: 11 },

    { text: "Systeme de consulting professionnel structure", font: "F2", size: 16 },
    { text: "", font: "F1", size: 11 },

    { text: "MA Training Consulting n’est pas un centre de formation,", font: "F1", size: 11 },
    { text: "ni une plateforme de cours,", font: "F1", size: 11 },
    { text: "ni un programme de promesses rapides.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Nous sommes un systeme de consulting professionnel", font: "F1", size: 11 },
    { text: "qui travaille sur le diagnostic, la decision et le positionnement professionnel,", font: "F1", size: 11 },
    { text: "dans un cadre reel, structure et responsable.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Un accompagnement professionnel honnete,", font: "F1", size: 11 },
    { text: "sans complaisance ni promesses faciles —", font: "F1", size: 11 },
    { text: "uniquement des decisions realistes pour avancer avec clarte et confiance.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Nous n’enseignons pas des competences,", font: "F1", size: 11 },
    { text: "nous ne delivrons pas de diplomes,", font: "F1", size: 11 },
    { text: "et nous ne vendons pas d’illusions.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Nous evaluons, analysons et orientons.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Que proposons-nous exactement ?", font: "F2", size: 13 },
    { text: "", font: "F1", size: 11 },

    { text: "Nous proposons deux services complementaires :", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Service 1 — Diagnostic & Parcours Professionnel", font: "F2", size: 12 },
    { text: "", font: "F1", size: 11 },

    { text: "Un service individuel, en ligne, base sur un diagnostic professionnel approfondi.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Il comprend :", font: "F1", size: 11 },
    { text: "- Diagnostic professionnel detaille", font: "F1", size: 11 },
    { text: "- Avis professionnel clair", font: "F1", size: 11 },
    { text: "- Orientation vers un parcours adapte", font: "F1", size: 11 },
    { text: "- Parcours structure en 5 phases", font: "F1", size: 11 },
    { text: "- Documents professionnels verifiables", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Dans la majorite des cas, ce service peut inclure une session directe avec un expert :", font: "F1", size: 11 },
    { text: "- En ligne", font: "F1", size: 11 },
    { text: "- Individuelle", font: "F1", size: 11 },
    { text: "- D’une duree de 1 a 2 heures", font: "F1", size: 11 },
    { text: "- Realisee en phase finale (Phase 5)", font: "F1", size: 11 },
    { text: "- Selon la situation (non automatique)", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Ce service ne repose pas sur des cours ni des sessions repetitives,", font: "F1", size: 11 },
    { text: "mais sur l’analyse de decisions reelles et de comportements professionnels concrets.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Service 2 — Mission Operationnelle (sur demande)", font: "F2", size: 12 },
    { text: "", font: "F1", size: 11 },

    { text: "Un service 100 % applique, base sur des sessions directes avec des experts.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Deux formats possibles :", font: "F1", size: 11 },
    { text: "- Mission reelle : liee a votre situation ou projet professionnel actuel", font: "F1", size: 11 },
    { text: "- Mission simulee : scenario realiste base sur un role professionnel precis", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Les missions peuvent etre :", font: "F1", size: 11 },
    { text: "- Individuelles", font: "F1", size: 11 },
    { text: "- Ou collectives (uniquement si les profils et situations sont tres proches)", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Service 2 marque le passage de :", font: "F1", size: 11 },
    { text: "comprehension → application → positionnement", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Comment travaillons-nous ? (Diagnostic reel, pas automatique)", font: "F2", size: 13 },
    { text: "", font: "F1", size: 11 },

    { text: "Nous commencons toujours par un diagnostic initial gratuit via le systeme.", font: "F1", size: 11 },
    { text: "Ce diagnostic fournit une premiere lecture generale.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Mais la decision professionnelle finale :", font: "F1", size: 11 },
    { text: "- N’est jamais automatique", font: "F1", size: 11 },
    { text: "- N’est pas generee par un algorithme", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Nous vous demandons donc de :", font: "F1", size: 11 },
    { text: "- Telecharger les questions", font: "F1", size: 11 },
    { text: "- Vos reponses", font: "F1", size: 11 },
    { text: "- Les resultats du diagnostic", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Puis nos experts :", font: "F1", size: 11 },
    { text: "- Analysent chaque reponse", font: "F1", size: 11 },
    { text: "- La confrontent au reel professionnel", font: "F1", size: 11 },
    { text: "- Prennent une decision humaine, responsable et argumentee", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Nous ne faisons pas confiance a un diagnostic automatique sans jugement humain.", font: "F1", size: 11 },
    { text: "La decision chez nous est professionnelle, humaine et assumee.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Garantissez-vous un emploi ou une promotion ?", font: "F2", size: 13 },
    { text: "", font: "F1", size: 11 },

    { text: "Non.", font: "F1", size: 11 },
    { text: "Et aucune structure serieuse ne peut le garantir.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Car :", font: "F1", size: 11 },
    { text: "- Chaque entreprise a ses propres regles", font: "F1", size: 11 },
    { text: "- Chaque poste a ses exigences", font: "F1", size: 11 },
    { text: "- Chaque decision de recrutement est independante", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Ce que nous garantissons :", font: "F1", size: 11 },
    { text: "- Une clarte professionnelle reelle", font: "F1", size: 11 },
    { text: "- Un positionnement coherent", font: "F1", size: 11 },
    { text: "- Un profil comprehensible et evaluable", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Le resultat final depend de votre serieux, votre engagement et votre maniere d’appliquer.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Pourquoi ne delivrons-nous pas de certificats ou diplomes ?", font: "F2", size: 13 },
    { text: "", font: "F1", size: 11 },

    { text: "Parce qu’aujourd’hui, la majorite des certificats :", font: "F1", size: 11 },
    { text: "- Ne sont pas reconnus internationalement", font: "F1", size: 11 },
    { text: "- Ou ont une valeur locale limitee", font: "F1", size: 11 },
    { text: "- Et ne refletent souvent pas la competence reelle", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Nous ne delivrons pas de certificats de formation,", font: "F1", size: 11 },
    { text: "mais des documents professionnels qui refletent :", font: "F1", size: 11 },
    { text: "- Votre maniere de penser", font: "F1", size: 11 },
    { text: "- Vos decisions", font: "F1", size: 11 },
    { text: "- Votre niveau reel", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Les documents ont-ils une valeur ?", font: "F2", size: 13 },
    { text: "", font: "F1", size: 11 },

    { text: "Oui, s’ils sont compris correctement.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Nos documents professionnels :", font: "F1", size: 11 },
    { text: "- Decrivent votre profil reel", font: "F1", size: 11 },
    { text: "- Evaluent votre niveau de preparation", font: "F1", size: 11 },
    { text: "- Mesurent votre adequation avec un role donne", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Avec votre accord, des entreprises peuvent nous contacter", font: "F1", size: 11 },
    { text: "pour obtenir un avis professionnel transparent,", font: "F1", size: 11 },
    { text: "sans complaisance ni exageration.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Cela exige de votre part :", font: "F1", size: 11 },
    { text: "- Du serieux", font: "F1", size: 11 },
    { text: "- De l’engagement", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Car l’evaluation est honnete, quelle que soit l’issue.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Qu’en est-il des projets et de la pratique ?", font: "F2", size: 13 },
    { text: "", font: "F1", size: 11 },

    { text: "Nous proposons un systeme de situations professionnelles quasi-reelles :", font: "F1", size: 11 },
    { text: "- Non commerciales", font: "F1", size: 11 },
    { text: "- Non exploitees", font: "F1", size: 11 },
    { text: "- Exclusivement orientees developpement", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Les projets peuvent etre :", font: "F1", size: 11 },
    { text: "- Individuels ou collectifs", font: "F1", size: 11 },
    { text: "- Toujours la propriete du participant", font: "F1", size: 11 },
    { text: "- Jamais utilises par l’entreprise", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Il s’agit de simulations intelligentes d’environnements de travail reels.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Y a-t-il des bonus ?", font: "F2", size: 13 },
    { text: "", font: "F1", size: 11 },

    { text: "Oui — mais pas des cours.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Ils peuvent inclure :", font: "F1", size: 11 },
    { text: "- Ressources professionnelles ciblees", font: "F1", size: 11 },
    { text: "- Frameworks", font: "F1", size: 11 },
    { text: "- Situations d’analyse", font: "F1", size: 11 },
    { text: "- Orientation sur des outils", font: "F1", size: 11 },
    { text: "- Acces a un espace professionnel ferme", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Les bonus :", font: "F1", size: 11 },
    { text: "- Varient selon le profil", font: "F1", size: 11 },
    { text: "- Ne sont pas garantis", font: "F1", size: 11 },
    { text: "- Ne peuvent pas etre reclamés comme un droit", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Groupe professionnel (bonus specifique)", font: "F2", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Accessible uniquement aux personnes ayant souscrit Service 1 + Service 2.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Ce n’est pas un groupe de discussion, mais :", font: "F1", size: 11 },
    { text: "- Un espace professionnel encadre", font: "F1", size: 11 },
    { text: "- Des situations reelles partagees", font: "F1", size: 11 },
    { text: "- Des ressources selectionnees", font: "F1", size: 11 },
    { text: "- L’intervention d’experts si necessaire", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Les sessions individuelles :", font: "F1", size: 11 },
    { text: "- Ne sont pas incluses", font: "F1", size: 11 },
    { text: "- Sont payantes", font: "F1", size: 11 },
    { text: "- Selon la situation", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Tarifs & modalites de paiement", font: "F2", size: 13 },
    { text: "Service 1", font: "F2", size: 12 },
    { text: "", font: "F1", size: 11 },

    { text: "A partir de 100 € jusqu’a plus de 500 €,", font: "F1", size: 11 },
    { text: "selon le diagnostic.", font: "F1", size: 11 },
    { text: "Service individuel.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Service 2", font: "F2", size: 12 },
    { text: "", font: "F1", size: 11 },

    { text: "A partir de 300 € jusqu’a plus de 2 000 € par personne,", font: "F1", size: 11 },
    { text: "tarif reduit en format collectif.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Processus", font: "F2", size: 13 },
    { text: "", font: "F1", size: 11 },

    { text: "Diagnostic initial gratuit", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Email contenant :", font: "F1", size: 11 },
    { text: "- Diagnostic", font: "F1", size: 11 },
    { text: "- Devis", font: "F1", size: 11 },
    { text: "- Conditions", font: "F1", size: 11 },
    { text: "- Accord ecrit", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Paiement de 50 % pour entrer dans le systeme", font: "F1", size: 11 },
    { text: "Solde avant la fin du parcours", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Possibilites :", font: "F1", size: 11 },
    { text: "- Paiement echelonné", font: "F1", size: 11 },
    { text: "- Accord selon la situation", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Aucun document n’est remis avant paiement complet", font: "F1", size: 11 },
    { text: "Aucun remboursement", font: "F1", size: 11 },
    { text: "Le paiement vaut acceptation automatique des conditions", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "A qui s’adresse ce systeme ?", font: "F2", size: 13 },
    { text: "", font: "F1", size: 11 },

    { text: "Pour ceux qui :", font: "F1", size: 11 },
    { text: "- Cherchent de la clarte", font: "F1", size: 11 },
    { text: "- Veulent un positionnement professionnel reel", font: "F1", size: 11 },
    { text: "- Comprennent que l’evolution est une decision, pas un diplome", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Pas pour ceux qui :", font: "F1", size: 11 },
    { text: "- Veulent une promesse d’emploi", font: "F1", size: 11 },
    { text: "- Cherchent un diplome", font: "F1", size: 11 },
    { text: "- Attendent des resultats automatiques", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Conclusion", font: "F2", size: 13 },
    { text: "", font: "F1", size: 11 },

    { text: "Nous ne vendons pas de formation.", font: "F1", size: 11 },
    { text: "Nous ne distribuons pas de titres.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "Nous vous confrontons a votre realite professionnelle,", font: "F1", size: 11 },
    { text: "et nous vous accompagnons pour devenir un profil clair, evaluable et respecte professionnellement.", font: "F1", size: 11 },
  ];

  const { pages } = buildTextOps(contentLines);
  const totalPages = pages.length;
  const decoratedPages = pages.map((p, idx) => buildPageDecorations(idx + 1, totalPages) + p);

  const objects: string[] = [];

  const pushObject = (body: string) => {
    objects.push(body);
  };

  const header = "%PDF-1.4\n";

  pushObject("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

  const pageCount = decoratedPages.length;

  const pageObjects: number[] = [];
  const contentObjects: number[] = [];

  let nextId = 3;

  const resourcesId = nextId++;
  pushObject(
    `${resourcesId} 0 obj\n<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> >> >>\nendobj\n`
  );

  for (let i = 0; i < pageCount; i++) {
    const pageId = nextId++;
    const contentId = nextId++;
    pageObjects.push(pageId);
    contentObjects.push(contentId);

    const contentStream = decoratedPages[i];
    const length = contentStream.length;

    pushObject(
      `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /Resources ${resourcesId} 0 R /MediaBox [0 0 612 792] /Contents ${contentId} 0 R >>\nendobj\n`
    );

    pushObject(
      `${contentId} 0 obj\n<< /Length ${length} >>\nstream\n${contentStream}endstream\nendobj\n`
    );
  }

  const kids = pageObjects.map((id) => `${id} 0 R`).join(" ");
  const pagesObject = `2 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pageCount} >>\nendobj\n`;

  objects.splice(1, 0, pagesObject);

  const fullBody = objects.join("");
  const xrefStart = header.length + fullBody.length;

  const xrefLines: string[] = [];
  xrefLines.push("xref\n");
  xrefLines.push(`0 ${nextId}\n`);
  xrefLines.push("0000000000 65535 f \n");

  const objectsWithHeader = header + fullBody;

  const computeOffsets: number[] = [];
  computeOffsets.push(0);

  let cursor = header.length;

  const objChunks = objects;
  for (const chunk of objChunks) {
    computeOffsets.push(cursor);
    cursor += chunk.length;
  }

  for (let i = 1; i < computeOffsets.length; i++) {
    const off = computeOffsets[i];
    xrefLines.push(`${String(off).padStart(10, "0")} 00000 n \n`);
  }

  const trailer = `trailer\n<< /Size ${nextId} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  const pdf = objectsWithHeader + xrefLines.join("") + trailer;
  return new TextEncoder().encode(pdf);
};
