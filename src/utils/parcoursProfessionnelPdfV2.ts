export const downloadParcoursProfessionnelPdf = () => {
  const bytes = buildParcoursProfessionnelPdf();
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "SYSTEME-DE-CONSEIL-MATC-VS-FORMATION-ACADEMIQUE.pdf";
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
  const footerDividerY = 58;
  const footerTextY = 42;

  const parts: string[] = [];

  parts.push("q\n");

  // Footer
  parts.push("0.70 0.70 0.70 RG\n0.4 w\n");
  parts.push(`${left} ${footerDividerY} m ${right} ${footerDividerY} l S\n`);
  parts.push(
    `BT\n/F1 9 Tf\n1 0 0 1 ${left} ${footerTextY} Tm\n(MA-TRAINING-CONSULTING - Systeme de conseil MATC VS formation academique) Tj\nET\n`
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
  let y = 760;

  const marginLeft = 50;
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
    y = 760;
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

    if (isHeading) y -= 6;
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

const buildLinesFromText = (): PdfLine[] => {
  const lines: PdfLine[] = [];

  const pushHeading = (text: string, size: number) => {
    lines.push({ text, font: "F2", size });
    lines.push({ text: "", font: "F1", size: 11 });
  };

  const pushParagraph = (text: string) => {
    if (!text.trim()) {
      lines.push({ text: "", font: "F1", size: 11 });
      return;
    }
    lines.push({ text, font: "F1", size: 11 });
  };

  // Title
  pushHeading("Systeme de conseil MATC VS formation academique", 16);
  pushParagraph("");
  pushParagraph("Differences entre le systeme de conseil MA Training Consulting et la formation academique");
  pushParagraph("");

  pushHeading("1. Objectif principal", 13);
  pushParagraph(
    "Systeme de conseil MA Training Consulting : Il vise a ameliorer les competences pratiques et a prendre des decisions professionnelles realistes dans un environnement de travail reel. Il se concentre sur l'accompagnement personnalise et l'application pratique des concepts."
  );
  pushParagraph(
    "Formation academique : Elle se concentre sur l'enseignement des concepts theoriques qui peuvent etre generaux et non directement lies a la realite professionnelle. L'objectif est d'enseigner des theories et de fournir des informations theoriques sur des sujets specifiques."
  );
  pushParagraph("");

  pushHeading("2. Application pratique contre enseignement theorique", 13);
  pushParagraph(
    "Systeme de conseil : Il repose sur l'application pratique dans des environnements de travail reels ou simules. Les experiences pratiques sont partagees, les problemes reels sont resolus et les decisions pratiques sont prises dans un contexte professionnel reel."
  );
  pushParagraph(
    "Formation academique : Elle repose sur des cours theoriques enseignes dans des classes ou des formations academiques, ou les etudiants apprennent les concepts et les theories a travers des conferences et des livres."
  );
  pushParagraph("");

  pushHeading("3. Personne qui offre le soutien", 13);
  pushParagraph(
    "Systeme de conseil : Le soutien est fourni par des experts professionnels dans le domaine, qui offrent un accompagnement personnalise en fonction des besoins individuels de chaque personne. L'expert analyse et guide en continu la performance professionnelle."
  );
  pushParagraph(
    "Formation academique : L'enseignement est donne par des professeurs academiques ou des formateurs specialises qui dispensent les informations et les explications theoriques. Le soutien repose sur le programme academique predefini, couvrant des sujets generaux."
  );
  pushParagraph("");

  pushHeading("4. Personnalisation de l'apprentissage", 13);
  pushParagraph(
    "Systeme de conseil : L'apprentissage est personnalise en fonction du diagnostic initial, ou le parcours professionnel est defini selon les besoins individuels et l'analyse approfondie des competences et du domaine professionnel."
  );
  pushParagraph(
    "Formation academique : L'enseignement est uniforme, ou le programme academique est enseigne a tous les etudiants de la meme maniere, sans grande personnalisation pour chaque eleve selon ses besoins specifiques."
  );
  pushParagraph("");

  pushHeading("5. Resultats", 13);
  pushParagraph(
    "Systeme de conseil : L'objectif est de produire des resultats concrets en ameliorant les competences pratiques et en prenant des decisions professionnelles reussies. Les progres sont mesures en fonction de la performance reelle dans les missions pratiques et les evaluations des experts."
  );
  pushParagraph(
    "Formation academique : Elle vise a transmettre des connaissances et a faire passer des examens theoriques. L'evaluation est generalement basee sur des tests academiques et des evaluations qui mesurent le niveau de comprehension theorique."
  );
  pushParagraph("");

  pushHeading("6. Connexion avec la realite professionnelle", 13);
  pushParagraph(
    "Systeme de conseil : Il est directement lie a la realite professionnelle, car il applique les competences apprises dans un environnement de travail reel. Chaque decision prise reflete la realite du monde professionnel."
  );
  pushParagraph(
    "Formation academique : Les etudiants etudient des concepts et des theories qui peuvent etre eloignes de la realite professionnelle quotidienne. Les sujets et techniques enseignes sont souvent theoriques et necessitent une mise en pratique ulterieure."
  );
  pushParagraph("");

  pushHeading("7. Type de documents et certificats", 13);
  pushParagraph(
    "Systeme de conseil : Apres la fin du programme, les participants recoivent des documents professionnels qui detaillent les ameliorations professionnelles et les competences acquises. Ces documents sont pratiques et peuvent etre utilises dans un environnement professionnel pour valider le progres."
  );
  pushParagraph(
    "Formation academique : Apres avoir suivi un programme academique, les etudiants recoivent des certificats academiques et des diplomes qui peuvent etre utilises pour entrer dans le marche du travail ou poursuivre des etudes superieures, mais qui ne refletent pas toujours les competences pratiques."
  );
  pushParagraph("");

  pushHeading("8. Continuite et developpement professionnel", 13);
  pushParagraph(
    "Systeme de conseil : Il repose sur un developpement continu a travers des revisions regulieres des experts, et l'accompagnement personnalise tout au long du programme afin de garantir des progres constants dans le parcours professionnel."
  );
  pushParagraph(
    "Formation academique : Elle est souvent finie une fois le cours ou le programme academique termine, et ne propose pas de soutien continu dans la phase pratique."
  );
  pushParagraph("");

  pushHeading("Resume", 13);
  pushParagraph(
    "Systeme de conseil MA Training Consulting se concentre sur l'amelioration des competences pratiques a travers un accompagnement personnalise et des missions reelles, avec un suivi continu des experts."
  );
  pushParagraph(
    "La formation academique se concentre sur l'enseignement theorique avec un programme uniforme qui ne reflete pas necessairement les competences pratiques ou les realites du terrain."
  );
  pushParagraph("");

  pushHeading("Difference principale", 13);
  pushParagraph(
    "Le conseil professionnel offre un accompagnement pratique personnalise pour chaque participant en fonction de ses besoins, tandis que la formation academique repose sur un enseignement theorique avec un programme standard pour tous les etudiants."
  );

  return lines;
};

const buildParcoursProfessionnelPdf = (): Uint8Array => {
  const contentLines = buildLinesFromText();

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
