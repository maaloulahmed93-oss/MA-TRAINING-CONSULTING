export const downloadMatcConditionsPdf = () => {
  const bytes = buildMatcConditionsPdf();
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "CONDITIONS-GENERALES-DE-SERVICE-MATC.pdf";
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

  const headerTopY = 770;
  const headerDividerY = 742;
  const footerDividerY = 58;
  const footerTextY = 42;

  const parts: string[] = [];

  parts.push("q\n");

  // Header
  parts.push("0.15 0.15 0.15 RG\n0.8 w\n");
  parts.push(`${left} ${headerDividerY} m ${right} ${headerDividerY} l S\n`);
  parts.push(
    `BT\n/F2 11 Tf\n1 0 0 1 ${left} ${headerTopY} Tm\n(CONDITIONS GENERALES DE SERVICE) Tj\nET\n`
  );
  parts.push(
    `BT\n/F1 10 Tf\n1 0 0 1 ${left} ${headerTopY - 14} Tm\n(MA-TRAINING-CONSULTING \\( MATC \\)) Tj\nET\n`
  );
  parts.push(
    `BT\n/F1 9 Tf\n1 0 0 1 ${left} ${headerTopY - 28} Tm\n(Version 1.0) Tj\nET\n`
  );

  // Footer
  parts.push("0.70 0.70 0.70 RG\n0.4 w\n");
  parts.push(`${left} ${footerDividerY} m ${right} ${footerDividerY} l S\n`);
  parts.push(
    `BT\n/F1 9 Tf\n1 0 0 1 ${left} ${footerTextY} Tm\n(MA-TRAINING-CONSULTING \\( MATC \\) - Conditions Generales de Service) Tj\nET\n`
  );
  parts.push(
    `BT\n/F1 9 Tf\n1 0 0 1 500 ${footerTextY} Tm\n(Page ${pageNumber}/${totalPages}) Tj\nET\n`
  );

  parts.push("Q\n");
  return parts.join("");
};

const buildTextOps = (lines: PdfLine[]) => {
  const ops: string[] = [];

  const pageWidth = 612;
  const pageHeight = 792;
  const marginLeft = 50;
  // Reserve space for header
  const marginTop = 715;
  const marginBottom = 70;

  const pages: string[][] = [[]];
  let y = marginTop;

  const newPage = () => {
    pages.push([]);
    y = marginTop;
  };

  const addLine = (line: PdfLine, opts?: { xOffset?: number; extraGapAfter?: number }) => {
    const currentPage = pages[pages.length - 1];

    const lineHeight = Math.round(line.size * 1.25);
    if (y < marginBottom) newPage();

    const isHeading = line.font === "F2" && line.size >= 12;
    if (isHeading && y < marginBottom + 110) newPage();

    const escaped = pdfEscape(line.text);

    const x = marginLeft + (opts?.xOffset ?? 0);
    const block =
      `BT\n/${line.font} ${line.size} Tf\n1 0 0 1 ${x} ${y} Tm\n(${escaped}) Tj\nET\n`;

    currentPage.push(block);
    y -= lineHeight;

    if (isHeading) y -= 6;
    if (opts?.extraGapAfter) y -= opts.extraGapAfter;
  };

  for (const line of lines) {
    if (line.text === "") {
      y -= Math.round(line.size * 0.9);
      continue;
    }

    const maxLen = line.size >= 14 ? 70 : 96;
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
    pageWidth,
    pageHeight,
  };
};

const buildMatcConditionsPdf = (): Uint8Array => {
  const contentLines: Array<{ text: string; font: PdfFont; size: number }> = [
    { text: "", font: "F1", size: 11 },

    { text: "1. Objet du service", font: "F2", size: 12 },
    { text: "MA-TRAINING-CONSULTING ( MATC ) propose des services d'analyse, de diagnostic, d'orientation et d'accompagnement professionnel.", font: "F1", size: 11 },
    { text: "Les services ont pour objectif d'ameliorer :", font: "F1", size: 11 },
    { text: "- la clarte professionnelle", font: "F1", size: 11 },
    { text: "- la posture et le comportement professionnel", font: "F1", size: 11 },
    { text: "- la qualite de la prise de decision", font: "F1", size: 11 },
    { text: "- le positionnement face au marche et aux entreprises", font: "F1", size: 11 },
    { text: "MA-TRAINING-CONSULTING ( MATC ) ne fournit pas de formation academique, ne delivre pas de diplomes, et n'assure aucune obligation de resultat.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "2. Nature de l'engagement", font: "F2", size: 12 },
    { text: "MA-TRAINING-CONSULTING ( MATC ) est tenu a une obligation de moyens experts, et non a une obligation de resultat.", font: "F1", size: 11 },
    { text: "Aucune garantie n'est donnee concernant :", font: "F1", size: 11 },
    { text: "- l'obtention d'un emploi", font: "F1", size: 11 },
    { text: "- une promotion", font: "F1", size: 11 },
    { text: "- une augmentation de salaire", font: "F1", size: 11 },
    { text: "- ou un resultat professionnel automatique", font: "F1", size: 11 },
    { text: "Les resultats dependent du profil du participant, de son implication, de ses decisions et de son contexte professionnel.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "3. Description des services", font: "F2", size: 12 },
    { text: "Service 1 - Diagnostic, Avis & Parcours Professionnel", font: "F2", size: 11 },
    { text: "Le Service 1 comprend :", font: "F1", size: 11 },
    { text: "- un diagnostic professionnel structure (via plusieurs systemes d'analyse)", font: "F1", size: 11 },
    { text: "- une analyse du profil, du raisonnement et du positionnement", font: "F1", size: 11 },
    { text: "- un avis professionnel motive", font: "F1", size: 11 },
    { text: "- une orientation vers un parcours adapte au niveau reel du participant", font: "F1", size: 11 },
    { text: "- un accompagnement structure en plusieurs phases", font: "F1", size: 11 },
    { text: "Le Service 1 constitue le socle obligatoire de toute collaboration.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },
    { text: "Service 2 - Mission Operationnelle (sur demande)", font: "F2", size: 11 },
    { text: "Le Service 2 est optionnel et active uniquement apres validation du Service 1.", font: "F1", size: 11 },
    { text: "Il peut prendre la forme :", font: "F1", size: 11 },
    { text: "- d'une mission reelle", font: "F1", size: 11 },
    { text: "- ou d'une mission simulee basee sur un scenario professionnel realiste", font: "F1", size: 11 },
    { text: "Le Service 2 donne lieu a des livrables operationnels cadres contractuellement.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "4. GO / NO-GO / Reorientation", font: "F2", size: 12 },
    { text: "A l'issue du diagnostic, MA-TRAINING-CONSULTING ( MATC ) peut decider :", font: "F1", size: 11 },
    { text: "- d'un GO vers un parcours adapte", font: "F1", size: 11 },
    { text: "- d'une reorientation vers un autre niveau ou domaine", font: "F1", size: 11 },
    { text: "- ou exceptionnellement d'un NO-GO lorsque le profil ne correspond pas du tout au domaine cible", font: "F1", size: 11 },
    { text: "Le NO-GO reste une situation rare et motivee.", font: "F1", size: 11 },
    { text: "Dans tous les cas, un avis professionnel est communique au participant.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "5. Absence de formation et d'enseignement", font: "F2", size: 12 },
    { text: "MA-TRAINING-CONSULTING ( MATC ) ne fournit pas :", font: "F1", size: 11 },
    { text: "- de cours theoriques", font: "F1", size: 11 },
    { text: "- de programmes pedagogiques", font: "F1", size: 11 },
    { text: "- de contenus educatifs structures", font: "F1", size: 11 },
    { text: "- ni d'enseignement technique classique", font: "F1", size: 11 },
    { text: "L'accompagnement repose sur :", font: "F1", size: 11 },
    { text: "- l'analyse de situations reelles", font: "F1", size: 11 },
    { text: "- la correction du raisonnement", font: "F1", size: 11 },
    { text: "- la clarification des decisions", font: "F1", size: 11 },
    { text: "- et l'evolution du comportement professionnel", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "6. Role et responsabilite du participant", font: "F2", size: 12 },
    { text: "Le participant s'engage a :", font: "F1", size: 11 },
    { text: "- fournir des informations exactes et completes", font: "F1", size: 11 },
    { text: "- respecter le cadre et les consignes du dispositif", font: "F1", size: 11 },
    { text: "- accepter les analyses, avis et orientations fournis", font: "F1", size: 11 },
    { text: "- comprendre que le service repose sur l'analyse et non sur la complaisance", font: "F1", size: 11 },
    { text: "Le refus d'appliquer les recommandations ou de respecter le cadre ne peut engager la responsabilite de MA Consulting.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "7. Documents professionnels", font: "F2", size: 12 },
    { text: "Les documents fournis peuvent inclure :", font: "F1", size: 11 },
    { text: "- rapport de diagnostic", font: "F1", size: 11 },
    { text: "- avis professionnel", font: "F1", size: 11 },
    { text: "- syntheses d'analyse", font: "F1", size: 11 },
    { text: "- notes de positionnement", font: "F1", size: 11 },
    { text: "- documents de participation verifiables", font: "F1", size: 11 },
    { text: "- recommandations (si applicables)", font: "F1", size: 11 },
    { text: "Ces documents :", font: "F1", size: 11 },
    { text: "- ne sont pas des diplomes", font: "F1", size: 11 },
    { text: "- ne sont pas des certifications academiques", font: "F1", size: 11 },
    { text: "- constituent des preuves professionnelles consultatives", font: "F1", size: 11 },
    { text: "Ils peuvent etre :", font: "F1", size: 11 },
    { text: "- accessibles via l'Espace Participant", font: "F1", size: 11 },
    { text: "- verifiables via un systeme dedie", font: "F1", size: 11 },
    { text: "- ou transmis par email", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "8. Confidentialite & donnees", font: "F2", size: 12 },
    { text: "MA-TRAINING-CONSULTING ( MATC ) s'engage a :", font: "F1", size: 11 },
    { text: "- preserver la confidentialite des informations fournies", font: "F1", size: 11 },
    { text: "- limiter l'acces aux donnees aux personnes autorisees", font: "F1", size: 11 },
    { text: "- utiliser les informations uniquement dans le cadre du service", font: "F1", size: 11 },
    { text: "Aucune information n'est transmise a des tiers sans accord explicite, hors obligations legales.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "9. Paiement & non-remboursement", font: "F2", size: 12 },
    { text: "Tout service engage et paye est non remboursable, quelle que soit l'issue du diagnostic ou du parcours.", font: "F1", size: 11 },
    { text: "Le paiement vaut :", font: "F1", size: 11 },
    { text: "- acceptation pleine et entiere des presentes conditions", font: "F1", size: 11 },
    { text: "- engagement du participant dans le dispositif", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "10. Limitation de responsabilite", font: "F2", size: 12 },
    { text: "MA-TRAINING-CONSULTING ( MATC ) ne saurait etre tenu responsable :", font: "F1", size: 11 },
    { text: "- des decisions prises par le participant", font: "F1", size: 11 },
    { text: "- de leurs consequences professionnelles", font: "F1", size: 11 },
    { text: "- de l'evolution du marche ou du contexte externe", font: "F1", size: 11 },
    { text: "Les avis et analyses fournis ont une valeur consultative et strategique.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "11. Acceptation des conditions", font: "F2", size: 12 },
    { text: "L'acces aux services implique : la lecture, la comprehension et l'acceptation sans reserve des presentes Conditions Generales de Service.", font: "F1", size: 11 },
    { text: "Une validation explicite (checkbox, signature ou confirmation ecrite) est requise avant tout demarrage.", font: "F1", size: 11 },
    { text: "", font: "F1", size: 11 },

    { text: "MA-TRAINING-CONSULTING ne vend pas des promesses. Il apporte de la clarte, une direction et des decisions professionnelles assumees.", font: "F2", size: 11 },
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

  const trailer =
    `trailer\n<< /Size ${nextId} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

  const pdf = objectsWithHeader + xrefLines.join("") + trailer;
  return new TextEncoder().encode(pdf);
};
