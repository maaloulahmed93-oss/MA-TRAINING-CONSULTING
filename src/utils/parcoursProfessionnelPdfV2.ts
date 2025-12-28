export const downloadParcoursProfessionnelPdf = () => {
  const bytes = buildParcoursProfessionnelPdf();
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  const blob = new Blob([buffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "ECOSYSTEME-DE-CONSULTING-PROFESSIONNEL-INTEGRE.pdf";
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
    `BT\n/F1 9 Tf\n1 0 0 1 ${left} ${footerTextY} Tm\n(MA-TRAINING-CONSULTING - Ecosysteme de consulting professionnel integre) Tj\nET\n`
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

  const pushBullet = (text: string) => {
    lines.push({ text: `- ${text}`, font: "F1", size: 11 });
  };

  // Title
  pushHeading("Un ecosysteme de consulting professionnel integre", 16);

  // Intro
  pushParagraph("Un accompagnement professionnel sincere,");
  pushParagraph("sans complaisance ni promesses faciles -");
  pushParagraph("uniquement des decisions realistes pour avancer avec confiance.");
  pushParagraph("");

  pushParagraph("MA Training Consulting est un ecosysteme de consulting professionnel integre,");
  pushParagraph("dont l'objectif est de clarifier les parcours professionnels, soutenir la prise de decision et construire un positionnement credible et presentable,");
  pushParagraph("sans formation classique, sans enseignement academique et sans vente d'illusions.");
  pushParagraph("");

  pushParagraph("Nous ne formons pas.");
  pushParagraph("Nous ne delivrons pas de diplomes.");
  pushParagraph("Nous ne garantissons pas de resultats automatiques.");
  pushParagraph("");

  pushParagraph("Nous evaluons, analysons, decidons et accompagnons.");
  pushParagraph("");

  // Audience
  pushHeading("A qui s'adressent nos services ?", 13);
  pushParagraph("Notre ecosysteme est destine a :");
  pushParagraph("");
  pushBullet("Etudiants avant l'entree sur le marche du travail");
  pushBullet("Jeunes diplomes en recherche de positionnement");
  pushBullet("Debut de carriere");
  pushBullet("Profils en phase de clarification, reorientation ou prise de decision professionnelle sensible");
  pushParagraph("");
  pushParagraph("Vous passez d'un profil flou a un profil professionnel clair et credible.");
  pushParagraph("");

  // Employment question
  pushHeading("Pourquoi ne garantissons-nous ni emploi ni promotion ?", 13);
  pushParagraph("C'est l'une des questions les plus frequentes - et la reponse est volontairement claire et honnete.");
  pushParagraph("");
  pushParagraph("Parce que :");
  pushParagraph("");
  pushBullet("Chaque entreprise possede son propre systeme, ses criteres et sa culture");
  pushBullet("La decision finale de recrutement ou de promotion ne nous appartient pas");
  pushBullet("Les resultats dependent de facteurs externes (marche, timing, concurrence...)");
  pushBullet("Une part essentielle depend egalement de votre engagement, votre serieux et l'application reelle des recommandations");
  pushParagraph("");
  pushParagraph("Nous ne vendons pas de resultat cle en main,");
  pushParagraph("mais des decisions professionnelles realistes et un positionnement solide,");
  pushParagraph("qui augmentent vos chances de maniere concrete et credible.");
  pushParagraph("");

  // Certificates
  pushHeading("Difference entre certificats et documents professionnels", 13);
  pushHeading("Pourquoi ne delivrons-nous pas de certificats ou diplomes ?", 12);
  pushParagraph("Parce que, dans la majorite des cas :");
  pushParagraph("");
  pushBullet("Les certificats ne sont pas reconnus a l'echelle internationale");
  pushBullet("Ou sont reconnus uniquement localement");
  pushBullet("Et ont perdu une grande partie de leur credibilite aupres de nombreuses entreprises");
  pushBullet("Notamment lorsqu'ils attribuent un titre (Responsable, Manager, Expert) sans pratique reelle");
  pushParagraph("");
  pushParagraph("Un certificat indique : vous avez suivi une formation");
  pushParagraph("Un document professionnel indique : voici votre niveau reel et votre capacite professionnelle effective");
  pushParagraph("");

  pushHeading("Que delivrons-nous a la place ?", 13);
  pushParagraph("Nous produisons des documents professionnels analytiques, qui :");
  pushParagraph("");
  pushBullet("Refletent votre niveau reel");
  pushBullet("Clarifient votre positionnement professionnel");
  pushBullet("Appuient vos decisions (recrutement, promotion, transition, reorientation)");
  pushParagraph("");
  pushParagraph("Dans certains cas, ces documents sont accompagnes d'une lettre d'introduction professionnelle, permettant a une entreprise :");
  pushParagraph("");
  pushBullet("D'obtenir des informations precises");
  pushBullet("Basees sur une evaluation transparente");
  pushBullet("Sans complaisance ni favoritisme, quelles que soient les circonstances");
  pushParagraph("");

  // Services
  pushHeading("Nos services", 13);

  pushHeading("Service 1 - Diagnostic et parcours professionnel", 12);
  pushParagraph("Un service individuel, en ligne, fonde sur un diagnostic approfondi et structure.");
  pushParagraph("");

  pushHeading("Deroulement", 12);
  pushParagraph("Le participant suit 5 phases :");
  pushParagraph("");
  pushBullet("Diagnostic initial intelligent (gratuit)");
  pushBullet("Analyse approfondie de la situation professionnelle");
  pushBullet("Identification des ecarts, risques et opportunites");
  pushBullet("Construction d'un parcours et de decisions professionnelles claires");
  pushBullet("Session individuelle avec un expert (1h a 2h)");
  pushParagraph("");
  pushParagraph("Realisee dans la majorite des cas, selon le niveau et la complexite de la situation");
  pushParagraph("");
  pushParagraph("Cette session n'est pas une formation,");
  pushParagraph("mais une session d'analyse et de decision professionnelle.");
  pushParagraph("");

  pushHeading("Question frequente", 12);
  pushParagraph("Le Service 1 inclut-il des sessions en direct ?");
  pushParagraph("Oui. Une session individuelle avec un expert est generalement integree a la phase 5, mais elle n'est ni automatique ni systematique - elle depend du diagnostic et du besoin reel.");
  pushParagraph("");

  pushHeading("Service 2 - Accompagnement professionnel direct avec experts", 12);
  pushParagraph("Un service avance, base exclusivement sur des sessions en direct.");
  pushParagraph("");
  pushParagraph("Formats disponibles :");
  pushParagraph("");
  pushBullet("Individuel");
  pushBullet("Collectif (uniquement pour des profils au diagnostic et a la situation professionnelle comparables)");
  pushParagraph("");
  pushParagraph("Deux types d'accompagnement :");
  pushParagraph("");
  pushBullet("Mission Reelle : travail sur une situation ou un projet reel");
  pushBullet("Mission Simulee : simulation de missions professionnelles tres proches du reel");
  pushParagraph("");
  pushParagraph("En format collectif :");
  pushParagraph("");
  pushBullet("Les participants sont selectionnes selon un filtrage precis");
  pushBullet("Afin de garantir la qualite des echanges et de l'accompagnement");
  pushParagraph("");

  // Bonus
  pushHeading("Ecosysteme de situations et projets quasi-reels (Bonus)", 13);
  pushParagraph("L'acces est offert aux participants ayant souscrit aux Service 1 et Service 2.");
  pushParagraph("");

  pushHeading("Description", 12);
  pushBullet("Groupe professionnel ferme (WhatsApp / Telegram)");
  pushBullet("Relie a nos experts");
  pushBullet("Selectionne selon des criteres professionnels precis");
  pushParagraph("");

  pushHeading("Objectifs", 12);
  pushBullet("Echange de situations professionnelles reelles");
  pushBullet("Partage de ressources metiers");
  pushBullet("Discussion autour de decisions professionnelles");
  pushBullet("Continuite apres la fin des services");
  pushParagraph("");

  pushHeading("Projets proposes", 12);
  pushBullet("Situations et projets quasi-reels");
  pushBullet("Adaptes au niveau du participant");
  pushBullet("Visant a developper la prise de decision, la reflexion et les competences operationnelles");
  pushParagraph("");

  pushHeading("Les projets", 12);
  pushBullet("Ne sont pas commerciaux");
  pushBullet("Ont un objectif strictement professionnel et pedagogique");
  pushBullet("Restent la propriete exclusive du participant (meme en travail collectif)");
  pushParagraph("");

  pushHeading("Sessions avec experts", 12);
  pushBullet("Questions ponctuelles : gratuites");
  pushBullet("Sessions en direct : service distinct et payant");
  pushBullet("Tarification selon la complexite et la situation");
  pushParagraph("");

  // Pricing
  pushHeading("Diagnostic et tarification", 13);
  pushHeading("Tarification (indicative)", 12);

  pushHeading("Service 1 - Diagnostic et parcours professionnel", 12);
  pushParagraph("Le tarif se situe entre 100 EUR et 500 EUR,");
  pushParagraph("determine avec precision apres le diagnostic initial gratuit, en fonction de :");
  pushParagraph("");
  pushBullet("La complexite de la situation professionnelle");
  pushBullet("Le niveau d'experience et de responsabilite");
  pushBullet("La nature des decisions professionnelles a prendre");
  pushBullet("Le niveau d'approfondissement du parcours et des documents fournis");
  pushParagraph("");

  pushHeading("Service 2 - Accompagnement professionnel direct avec experts", 12);
  pushParagraph("Le tarif se situe entre 300 EUR et 2000 EUR ou plus selon le diagnostic, et depend de :");
  pushParagraph("");
  pushBullet("La complexite professionnelle");
  pushBullet("Le nombre et le type de sessions en direct");
  pushBullet("L'expertise des intervenants");
  pushBullet("La nature des situations ou projets traites");
  pushBullet("Le format choisi (individuel ou collectif)");
  pushParagraph("");
  pushParagraph("En format collectif, le cout est reparti entre les participants selon leur nombre et la similarite de leurs profils.");
  pushParagraph("");

  pushHeading("Information importante", 12);
  pushParagraph("Les tarifs indiques sont estimatifs et non contractuels.");
  pushParagraph("Le tarif final est fixe exclusivement apres diagnostic et l'envoi d'un devis officiel.");
  pushParagraph("Tout paiement (partiel ou total) vaut acceptation automatique des conditions generales.");
  pushParagraph("");

  // Conditions
  pushHeading("Conditions essentielles (FAQ juridique)", 13);

  pushHeading("Le paiement vaut-il acceptation ?", 12);
  pushParagraph("Oui. Tout paiement, meme partiel, vaut acceptation pleine et entiere des conditions generales.");
  pushParagraph("");

  pushHeading("Y a-t-il un remboursement possible ?", 12);
  pushParagraph("Non. Aucun remboursement n'est effectue en cas d'abandon ou d'arret en cours de parcours.");
  pushParagraph("");

  pushHeading("Les documents sont-ils remis avant paiement complet ?", 12);
  pushParagraph("Non. Aucun document professionnel n'est delivre avant reglement integral.");
  pushParagraph("");

  pushHeading("Peut-on acceder au Service 2 sans avoir complete le Service 1 ?", 12);
  pushParagraph("Non. L'ecosysteme repose sur une logique de diagnostic et de continuite.");
  pushParagraph("");

  pushHeading("Les bonus sont-ils accessibles a tous ?", 12);
  pushParagraph("Non. Les bonus sont reserves aux participants ayant souscrit aux deux services.");
  pushParagraph("");

  // Conclusion
  pushHeading("En conclusion", 13);
  pushParagraph("Nous ne vendons ni formation,");
  pushParagraph("ni certificats,");
  pushParagraph("ni promesses faciles.");
  pushParagraph("");

  pushParagraph("Nous proposons :");
  pushParagraph("");
  pushBullet("Un diagnostic rigoureux");
  pushBullet("Des decisions professionnelles realistes");
  pushBullet("Des documents professionnels credibles");
  pushBullet("Un accompagnement respectueux de votre intelligence et de votre avenir");
  pushParagraph("");

  pushParagraph("Si vous recherchez la clarte plutot que les illusions, vous etes au bon endroit.");

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
