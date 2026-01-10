export type FreelancerCadreLang = 'fr' | 'ar' | 'en';

export type FreelancerCadreSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type FreelancerCadreContent = {
  title: string;
  subtitle: string;
  sommaireLabel: string;
  retainTitle: string;
  retainText: string;
  backLabel: string;
  downloadPdfLabel: string;
  sections: FreelancerCadreSection[];
};

export const getFreelancerCadreContent = (lang: FreelancerCadreLang): FreelancerCadreContent => {
  if (lang === 'ar') {
    return {
      title: 'إطار تدخّل المستقل (Freelancer)',
      subtitle: 'وثيقة (للقراءة فقط)',
      sommaireLabel: 'الفهرس',
      retainTitle: 'مهم',
      retainText: 'هذا الإطار يحدد تعاونًا ظرفيًا ومحدودًا، دون علاقة تبعية أو التزام بالاستمرارية.',
      backLabel: 'رجوع',
      downloadPdfLabel: 'تنزيل PDF',
      sections: [
        {
          id: 'definition',
          title: '1️⃣ تعريف المستقل (Freelancer) والاستقلالية',
          paragraphs: [
            'المستقل (Freelancer) هو مزوّد خدمات خارجي يتدخل لإنجاز مهام محددة وذات نطاق صغير لفائدة الشركة.',
            'هذا الإطار لا ينشئ أي علاقة عمل أو شراكة أو تبعية إدارية أو اندماج دائم داخل هيكلة الشركة.',
            'يعمل المستقل باستقلالية تامة في تنظيم وتنفيذ المهام، ضمن حدود المتطلبات المحددة لكل مهمة.',
          ],
        },
        {
          id: 'nature-missions',
          title: '2️⃣ طبيعة المهام',
          paragraphs: ['يتدخل المستقل في مهام تشغيلية محدودة وواضحة، بما في ذلك (دون حصر):'],
          bullets: [
            'مهام رقمية بسيطة',
            'أعمال تشغيلية عبر منصات رقمية',
            'مهام تقنية أو تنظيمية قصيرة المدة',
            'دعم ظرفي لبعض مراحل المشاريع',
            'هذه المهام ليست استشارية ولا تكوينية ولا تعليمية.',
          ],
        },
        {
          id: 'attribution',
          title: '3️⃣ إطار إسناد المهام',
          bullets: [
            'تُسند المهام حسب الحاجة فقط، دون التزام بالاستمرارية.',
            'يتم تحديد كل مهمة من حيث نطاقها وأهدافها ومخرجاتها.',
            'يبقى المستقل حرًا في قبول أو رفض أي مهمة مقترحة.',
            'لا تلتزم الشركة بتوفير مهام بشكل شهري أو سنوي.',
          ],
        },
        {
          id: 'engagements',
          title: '4️⃣ الالتزامات المهنية',
          paragraphs: ['يلتزم المستقل بـ:'],
          bullets: [
            'إنجاز المهمة وفق الشروط المتفق عليها دون تجاوز نطاقها.',
            'احترام الآجال والجودة المطلوبة.',
            'العمل بجدية واحترافية ونزاهة.',
            'ضمان سرية تامة للمعلومات المتعلقة بالشركة وحرفائها.',
          ],
        },
        {
          id: 'propriete',
          title: '5️⃣ الملكية الفكرية والسرية',
          paragraphs: [
            'كل خدمة أو محتوى أو وثيقة أو مخرجات أو نتائج ينجزها المستقل في إطار مهمة تصبح ملكية حصرية وكاملة للشركة.',
            'يُمنع منعا باتّا على المستقل:',
          ],
          bullets: [
            'مشاركة هذه العناصر مع أي طرف ثالث',
            'إعادة استخدامها لأغراض شخصية أو مهنية',
            'نشرها أو تقديمها كمرجع',
            'إلا بإذن كتابي مسبق من الشركة.',
            'يبقى هذا الالتزام ساريًا حتى بعد انتهاء العلاقة المهنية.',
          ],
        },
        {
          id: 'organisation',
          title: '6️⃣ التنظيم والتواصل',
          bullets: [
            'تُنظم المهام وتُتابع عبر منصات الشركة أو وسائل التواصل المعتمدة.',
            'تُحصر الاتصالات في ما هو ضروري لتنفيذ المهمة.',
            'أي تبادل تنظيمي ظرفي يُعتبر جزءًا من المهمة دون أجر إضافي.',
          ],
        },
        {
          id: 'paiement',
          title: '7️⃣ طرق الدفع (حسب المهمة فقط)',
          bullets: [
            'يتم الاتفاق مسبقًا على مبلغ جزافي لكل مهمة.',
            'لا يتم اعتماد حساب بالساعات أو بالأيام.',
            'المبلغ المتفق عليه شامل ويغطي كامل تنفيذ المهمة كما تم تحديدها.',
            'يتم الدفع بصفة دورية (مثال: كل 15 يومًا) كآلية تنظيمية لتجميع المهام المنجزة وإصدار الفاتورة أو وثيقة الخصم.',
          ],
        },
        {
          id: 'facturation',
          title: '8️⃣ الفوترة والخصم من المورد',
          bullets: [
            'إذا كان للمستقل وضع قانوني، فعليه تقديم فاتورة مطابقة للتشريع الجاري به العمل.',
            'إذا لم يكن له وضع قانوني، تتم معالجة الأجر عبر الخصم من المورد وفقًا للقوانين المعمول بها.',
            'الشركة غير مسؤولة عن الالتزامات الجبائية أو القانونية الشخصية للمستقل خارج هذا الإطار.',
          ],
        },
        {
          id: 'absence',
          title: '9️⃣ عدم الالتزام بتوفير مهام',
          paragraphs: [
            'لا تلتزم الشركة بتوفير مهام بصفة مستمرة أو منتظمة.',
            'هذا الإطار قائم حصريًا على تدخلات ظرفية حسب الحاجة.',
          ],
        },
        {
          id: 'resiliation',
          title: '🔟 إنهاء التعاون',
          paragraphs: ['تحتفظ الشركة بحق إنهاء التعاون مع المستقل في حال:'],
          bullets: [
            'عدم احترام شروط المهمة',
            'التقصير في الجودة أو الآجال',
            'عدم احترام القواعد المهنية أو السرية',
            'دون أن يحق للمستقل المطالبة بأي تعويض أو تبعات إضافية.',
          ],
        },
        {
          id: 'relation',
          title: '1️⃣1️⃣ العلاقة المهنية',
          paragraphs: ['هذا الإطار قائم على:'],
          bullets: [
            'الاستقلالية',
            'الشفافية',
            'الثقة',
            'تعاون محدود حصريًا لتنفيذ المهام',
            'لضمان حسن إنجاز الأعمال دون خلق مخاطر قانونية أو جبائية.',
          ],
        },
      ],
    };
  }

  if (lang === 'en') {
    return {
      title: 'Independent Freelancer Engagement Framework',
      subtitle: 'Document (read-only)',
      sommaireLabel: 'Contents',
      retainTitle: 'Key takeaway',
      retainText: 'This framework defines a punctual and limited collaboration, without subordination or continuity commitment.',
      backLabel: 'Back',
      downloadPdfLabel: 'Download PDF',
      sections: [
        {
          id: 'definition',
          title: '1️⃣ Definition of the Freelancer & independence',
          paragraphs: [
            'The independent Freelancer is an external contractor engaged to perform punctual, small-scope assignments for the company.',
            'This framework does not create any employment relationship, partnership, administrative subordination, nor permanent integration within the company’s structure.',
            'The Freelancer acts autonomously in organizing and executing the mission, within the requirements defined for each assignment.',
          ],
        },
        {
          id: 'nature-missions',
          title: '2️⃣ Nature of assignments',
          paragraphs: ['The Freelancer carries out limited and clearly defined operational tasks, including (but not limited to):'],
          bullets: [
            'Simple digital tasks',
            'Operational work via digital platforms',
            'Short-term technical or organizational missions',
            'Occasional support for specific project phases',
            'These missions are not consulting, training, or educational activities.',
          ],
        },
        {
          id: 'attribution',
          title: '3️⃣ Assignment allocation framework',
          bullets: [
            'Assignments are provided only as needed, with no continuity commitment.',
            'Each assignment is defined by its scope, objectives, and deliverables.',
            'The Freelancer remains free to accept or refuse any proposed assignment.',
            'The company does not commit to providing assignments on a monthly or yearly basis.',
          ],
        },
        {
          id: 'engagements',
          title: '4️⃣ Professional commitments',
          paragraphs: ['The Freelancer agrees to:'],
          bullets: [
            'Execute the mission according to agreed terms, without exceeding its scope.',
            'Respect deadlines and expected quality.',
            'Work with seriousness, professionalism, and integrity.',
            'Ensure full confidentiality of information related to the company and its clients.',
          ],
        },
        {
          id: 'propriete',
          title: '5️⃣ Intellectual property & confidentiality',
          paragraphs: [
            'Any deliverable, content, document, work product, or result produced by the Freelancer as part of a mission becomes the exclusive property of the company.',
            'It is strictly forbidden for the Freelancer to:',
          ],
          bullets: [
            'Share these elements with any third party',
            'Reuse them for personal or professional purposes',
            'Publish them or present them as references',
            'unless prior written authorization is granted by the company.',
            'This obligation remains valid even after the end of the professional relationship.',
          ],
        },
        {
          id: 'organisation',
          title: '6️⃣ Organization & communication',
          bullets: [
            'Missions are organized and tracked via the company’s platforms or validated communication channels.',
            'Exchanges are strictly limited to what is necessary to execute the mission.',
            'Any punctual organizational exchange is considered part of the mission, without additional compensation.',
          ],
        },
        {
          id: 'paiement',
          title: '7️⃣ Payment terms (per mission only)',
          bullets: [
            'A fixed fee is agreed in advance for each mission.',
            'No hourly or daily calculation applies.',
            'The agreed amount is global and covers the full execution of the mission as defined.',
            'Payment is made periodically (e.g., every 15 days) as an organizational mechanism to group completed missions and issue the invoice or withholding document.',
          ],
        },
        {
          id: 'facturation',
          title: '8️⃣ Invoicing & withholding tax',
          bullets: [
            'If the Freelancer has a legal status, they must provide a compliant invoice under applicable law.',
            'If not, compensation is processed via withholding tax, according to applicable regulations.',
            'The company disclaims any responsibility for the Freelancer’s personal fiscal or legal obligations outside this framework.',
          ],
        },
        {
          id: 'absence',
          title: '9️⃣ No mission continuity commitment',
          paragraphs: [
            'The company has no obligation to provide assignments continuously or regularly.',
            'This framework is based exclusively on punctual interventions, depending on needs.',
          ],
        },
        {
          id: 'resiliation',
          title: '🔟 Termination of collaboration',
          paragraphs: ['The company reserves the right to terminate the collaboration in case of:'],
          bullets: [
            'Non-compliance with mission conditions',
            'Failure to meet expected quality or deadlines',
            'Non-compliance with professional or confidentiality rules',
            'without any compensation or additional consequences being claimable.',
          ],
        },
        {
          id: 'relation',
          title: '1️⃣1️⃣ Professional relationship',
          paragraphs: ['This framework is based on:'],
          bullets: [
            'Independence',
            'Transparency',
            'Trust',
            'Collaboration strictly limited to mission execution',
            'to ensure proper delivery without creating legal or tax risk.',
          ],
        },
      ],
    };
  }

  return {
    title: 'Cadre d’intervention du Freelancer Indépendant',
    subtitle: 'Document (lecture uniquement)',
    sommaireLabel: 'Sommaire',
    retainTitle: 'À retenir',
    retainText: 'Ce cadre définit une collaboration ponctuelle et limitée, sans lien de subordination ni engagement de continuité.',
    backLabel: 'Retour',
    downloadPdfLabel: 'Télécharger PDF',
    sections: [
      {
        id: 'definition',
        title: '1️⃣ Définition du Freelancer et indépendance',
        paragraphs: [
          'Le Freelancer indépendant est un prestataire externe intervenant pour l’exécution de missions ponctuelles et de petite envergure au profit de la société.',
          'Le présent cadre ne crée aucune relation de travail, de partenariat, de subordination administrative ni d’intégration permanente au sein de la structure de la société.',
          'Le Freelancer agit en toute autonomie dans l’organisation et les modalités d’exécution de ses missions, dans les limites des exigences définies pour chaque mission.',
        ],
      },
      {
        id: 'nature-missions',
        title: '2️⃣ Nature des missions',
        paragraphs: ['Le Freelancer intervient dans des tâches opérationnelles limitées et clairement définies, notamment et sans s’y limiter :'],
        bullets: [
          'Tâches digitales simples',
          'Travaux opérationnels via des plateformes numériques',
          'Missions techniques ou organisationnelles de courte durée',
          'Appui ponctuel à certaines étapes de projets',
          'Ces missions ne sont ni consultatives, ni formatives, ni éducatives.',
        ],
      },
      {
        id: 'attribution',
        title: '3️⃣ Cadre d’attribution des missions',
        bullets: [
          'Les missions sont confiées uniquement selon les besoins, sans engagement de continuité.',
          'Chaque mission est définie par son périmètre, ses objectifs et ses livrables.',
          'Le Freelancer demeure libre d’accepter ou de refuser toute mission proposée.',
          'La société ne s’engage pas à fournir des missions de manière mensuelle ou annuelle.',
        ],
      },
      {
        id: 'engagements',
        title: '4️⃣ Engagements professionnels',
        paragraphs: ['Le Freelancer s’engage à :'],
        bullets: [
          'Exécuter la mission conformément aux termes convenus, sans dépasser son périmètre.',
          'Respecter les délais et la qualité attendue.',
          'Travailler avec sérieux, professionnalisme et intégrité.',
          'Garantir la confidentialité totale des informations relatives à la société et à ses clients.',
        ],
      },
      {
        id: 'propriete',
        title: '5️⃣ Propriété intellectuelle et confidentialité',
        paragraphs: [
          'Toute prestation, contenu, document, livrable ou résultat réalisé par le Freelancer dans le cadre d’une mission devient la propriété exclusive et intégrale de la société.',
          'Il est strictement interdit au Freelancer de :',
        ],
        bullets: [
          'Partager ces éléments avec tout tiers',
          'Les réutiliser à des fins personnelles ou professionnelles',
          'Les publier ou les présenter comme référence',
          'sauf autorisation écrite préalable de la société.',
          'Cette obligation demeure valable même après la fin de la relation professionnelle.',
        ],
      },
      {
        id: 'organisation',
        title: '6️⃣ Organisation et communication',
        bullets: [
          'Les missions sont organisées et suivies via les plateformes de la société ou par les moyens de communication validés.',
          'Les échanges sont strictement limités à ce qui est nécessaire à l’exécution de la mission.',
          'Tout échange organisationnel ponctuel est considéré comme faisant partie intégrante de la mission, sans rémunération supplémentaire.',
        ],
      },
      {
        id: 'paiement',
        title: '7️⃣ Modalités de paiement (par mission uniquement)',
        bullets: [
          'Un montant forfaitaire est convenu à l’avance pour chaque mission.',
          'Aucun calcul en heures ou en jours n’est appliqué.',
          'Le montant convenu est global et couvre l’intégralité de l’exécution de la mission telle que définie.',
          'Le paiement est effectué de manière périodique (par exemple tous les 15 jours), à titre de mécanisme organisationnel permettant de regrouper les missions réalisées et d’établir la facture ou le document de retenue.',
        ],
      },
      {
        id: 'facturation',
        title: '8️⃣ Facturation et Retenue à la source',
        bullets: [
          'Si le Freelancer dispose d’un statut légal, il est tenu de fournir une facture conforme à la législation en vigueur.',
          'En l’absence de statut légal, la rémunération est traitée via la Retenue à la source, conformément aux lois applicables.',
          'La société décline toute responsabilité quant aux obligations fiscales ou légales personnelles du Freelancer en dehors de ce cadre.',
        ],
      },
      {
        id: 'absence',
        title: '9️⃣ Absence d’engagement de missions',
        paragraphs: [
          'La société n’a aucune obligation de fournir des missions de manière continue ou régulière.',
          'Le présent cadre repose exclusivement sur des interventions ponctuelles, selon les besoins.',
        ],
      },
      {
        id: 'resiliation',
        title: '🔟 Résiliation de la collaboration',
        paragraphs: ['La société se réserve le droit de mettre fin à la collaboration avec le Freelancer en cas de :'],
        bullets: [
          'Non-respect des conditions de la mission',
          'Manquement à la qualité ou aux délais',
          'Non-respect des règles professionnelles ou de confidentialité',
          'sans qu’aucune indemnité ou conséquence supplémentaire ne puisse être réclamée.',
        ],
      },
      {
        id: 'relation',
        title: '1️⃣1️⃣ Relation professionnelle',
        paragraphs: ['Ce cadre repose sur :'],
        bullets: [
          'L’indépendance',
          'La transparence',
          'La confiance',
          'La collaboration strictement limitée à l’exécution des missions',
          'afin d’assurer la bonne réalisation des tâches confiées, sans créer de risque juridique ou fiscal.',
        ],
      },
    ],
  };
};
