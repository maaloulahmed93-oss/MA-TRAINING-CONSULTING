export type AnimateurCadreLang = 'fr' | 'ar' | 'en';

export type AnimateurCadreSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type AnimateurCadreContent = {
  title: string;
  subtitle: string;
  sommaireLabel: string;
  retainTitle: string;
  retainText: string;
  backLabel: string;
  downloadPdfLabel: string;
  sections: AnimateurCadreSection[];
};

export const getAnimateurCadreContent = (lang: AnimateurCadreLang): AnimateurCadreContent => {
  if (lang === 'ar') {
    return {
      title: 'إطار تدخّل المنشّط المستقل (Animateur)',
      subtitle: 'وثيقة (للقراءة فقط)',
      sommaireLabel: 'الفهرس',
      retainTitle: 'مهم',
      retainText:
        'هذا الإطار يحدد دور المنشّط كمُتدخل خارجي مستقل، ضمن مهام تشغيلية/تنشيطية، دون علاقة تبعية أو التزام بالاستمرارية.',
      backLabel: 'رجوع',
      downloadPdfLabel: 'تنزيل PDF',
      sections: [
        {
          id: 'definition',
          title: '1️⃣ تعريف المنشّط والاستقلالية',
          paragraphs: [
            'يُعتبر المنشّط المستقل متدخلًا خارجيًا ومستقلًا في تقديم خدماته لفائدة الشركة.',
            'هذا الإطار لا يُنشئ أي علاقة عمل أو شراكة أو تبعية إدارية أو تنظيمية.',
            'يمكن أن يكون المنشّط:',
          ],
          bullets: [
            'حاملًا لوضع قانوني (باتيندا / نشاط مستقل) ويقدّم فاتورة مطابقة للقانون، أو',
            'أجيرًا بالقطاع العام أو الخاص، بشرط أن يتم تدخله خارج أوقات عمله الرسمية وأن يتحمل كامل مسؤولياته القانونية والجبائية.',
          ],
        },
        {
          id: 'nature',
          title: '2️⃣ طبيعة الأنشطة والخدمات',
          paragraphs: ['يتدخل المنشّط في خدمات ذات طابع تشغيلي، وتشمل خصوصًا:'],
          bullets: [
            'جلسات مباشرة لمرافقة مهنية مع المستفيدين',
            'جلسات تقديم أو ترويج للأنشطة والخدمات',
            'ويبينارات أو جلسات توجيه مرتبطة بالأنشطة',
            'هذه التدخلات ليست استشارية ولا تكوينية، ولا تندرج ضمن التدريس أو تسليم شهادات أو اعتماديات.',
            'تندرج حصريًا ضمن إطار التنشيط والمتابعة والتفاعل العملي.',
          ],
        },
        {
          id: 'cadre',
          title: '3️⃣ الإطار العام للتدخل',
          paragraphs: [
            'يلتزم المنشّط باحترام الإطار العام والمنهجية والاستراتيجية التي تحددها الشركة لكل مهمة.',
            'يتم تحديد كل مهمة مسبقًا من حيث الأهداف والنطاق والمدة، دون أن يؤدي ذلك إلى علاقة تبعية أو التزام دائم.',
          ],
        },
        {
          id: 'ethique',
          title: '4️⃣ الشروط العامة وأخلاقيات المهنة',
          paragraphs: ['يلتزم المنشّط بـ:'],
          bullets: [
            'احترام الآجال والأوقات المتفق عليها مسبقًا.',
            'العمل بجدية واحترافية ونزاهة.',
            'احترام سياق الشركة وصورتها وسمعتها لدى المستفيدين.',
            'عدم استغلال مستفيدي الشركة لأغراض شخصية أو لحساب أطراف أخرى.',
            'عدم اقتراح خدمات مماثلة مباشرة لمستفيدي الشركة في نفس الإطار دون إعلام مسبق.',
            'ضمان سرية المعلومات والبيانات المتعلقة بالشركة ومستفيديها.',
          ],
        },
        {
          id: 'collaboration',
          title: '5️⃣ التعاون مع الفريق التنظيمي',
          paragraphs: [
            'يتعاون المنشّط مع الفريق التنظيمي للشركة فقط عندما تتطلب المهمة إعدادًا أو تنسيقًا مسبقًا.',
            'الأنشطة التنظيمية مثل:',
          ],
          bullets: [
            'اجتماعات تحضيرية',
            'تنسيقات داخلية',
            'إجراءات تنظيمية أو ترويجية',
            'لا تُحتسب كوقت قابل للفوترة، وتُنجز حسب الحاجة وبموافقة الطرفين.',
          ],
        },
        {
          id: 'organisation',
          title: '6️⃣ تنظيم المهام والتواصل',
          paragraphs: ['تُنظم وتُسند المهام عبر:'],
          bullets: [
            'منصة الشركة (عندما تكون متاحة)، أو',
            'قنوات التواصل المعتمدة من الشركة.',
            'يهدف هذا الإطار فقط لضمان المتابعة وحسن تنظيم المهام دون خلق التزام بالاستمرارية.',
          ],
        },
        {
          id: 'developpement',
          title: '7️⃣ التطوير والتطور والتثمين',
          paragraphs: [
            'يقرّ المنشّط بأن أداء وتطوير الأنشطة يعتمد على جودة مساهمته.',
            'في حال مساهمة مهمة في:',
          ],
          bullets: [
            'تحسين الأنشطة',
            'تحسين/تحسين جودة الجلسات',
            'تطوير الخدمات وتوسيعها',
            'يمكن للشركة، حسب تقديرها وباتفاق مسبق، إسناد مهام إضافية و/أو تعديل الأجر ضمن إطار متوازن ومفيد للطرفين.',
          ],
        },
        {
          id: 'remuneration',
          title: '8️⃣ طرق الاحتساب والأجر',
          bullets: [
            'الأجر يعتمد على المهام المنجزة فعليًا.',
            'كل مهمة يتم تقديرها ساعيًا لأغراض تنظيمية داخلية.',
            'يمكن أن يتم الدفع إمّا على أساس الساعات المرتبطة بالمهمة، أو في شكل مبلغ جزافي متفق عليه لكل مهمة.',
            'الأنشطة التنظيمية أو الترويجية لا تُدرج ضمن الأجر.',
          ],
        },
        {
          id: 'retenue',
          title: '9️⃣ الخصم من المورد',
          paragraphs: [
            'يلتزم المنشّط بتقديم فاتورة قانونية إذا كان لديه وضع قانوني.',
            'في غياب وضع قانوني، يتم صرف الأجر عبر الخصم من المورد وفق التشريع الجاري به العمل.',
            'يقرّ المنشّط أن الشركة غير مسؤولة عن التزاماته الجبائية الشخصية خارج إطار الخصم المعتمد.',
          ],
        },
        {
          id: 'absence',
          title: '🔟 عدم وجود التزام بمهام منتظمة',
          paragraphs: [
            'لا تلتزم الشركة بتوفير مهام بصفة منتظمة (شهرية أو سنوية).',
            'يبقى المنشّط حرًا في قبول أو رفض أي مهمة، وتحتفظ الشركة بحق عدم إسناد مهمة دون تبرير.',
          ],
        },
        {
          id: 'resiliation',
          title: '1️⃣1️⃣ الإنهاء في حال عدم الالتزام',
          paragraphs: ['في حال عدم احترام القواعد أو الإطار أو الالتزامات المهنية، تحتفظ الشركة بحق:'],
          bullets: [
            'تعليق أو إلغاء إسناد المهام، أو',
            'إنهاء التعاون دون تعويض أو تبعات إضافية.',
          ],
        },
        {
          id: 'efficacite',
          title: '1️⃣2️⃣ التعاون والنجاعة',
          paragraphs: [
            'كلما احترم المنشّط الإطار وتعاون بفعالية، كلما يمكن أن يتطور دوره ومساهمته.',
            'أي تطور أو توسيع أو تثمين للتعاون يتم في إطار مهني ومرن ومتوافق مع مصلحة الطرفين.',
          ],
        },
      ],
    };
  }

  if (lang === 'en') {
    return {
      title: 'Independent Facilitator (Animateur) Engagement Framework',
      subtitle: 'Document (read-only)',
      sommaireLabel: 'Contents',
      retainTitle: 'Key takeaway',
      retainText:
        'This framework defines the Facilitator as an independent external contributor, focused on operational facilitation services, without subordination or continuity commitment.',
      backLabel: 'Back',
      downloadPdfLabel: 'Download PDF',
      sections: [
        {
          id: 'definition',
          title: '1️⃣ Definition of the Facilitator & independence',
          paragraphs: [
            'The independent Facilitator is considered an external and independent contributor when providing services to the company.',
            'This framework creates no employment relationship, partnership, nor administrative or organizational subordination.',
            'The Facilitator may be:',
          ],
          bullets: [
            'Holding a legal status (business registration / independent activity) and providing a compliant invoice, or',
            'A public or private sector employee, provided the intervention is performed outside official working hours and the Facilitator assumes full legal and tax responsibilities.',
          ],
        },
        {
          id: 'nature',
          title: '2️⃣ Nature of activities and services',
          paragraphs: ['The Facilitator delivers operational services, including in particular:'],
          bullets: [
            'Live professional support sessions with beneficiaries',
            'Presentation or promotion sessions for activities and services',
            'Webinars or orientation sessions related to activities',
            'These interventions are neither consulting nor training services and do not fall under teaching, nor the issuance of diplomas or certifications.',
            'They are strictly within a facilitation, follow-up, and practical interaction framework.',
          ],
        },
        {
          id: 'cadre',
          title: '3️⃣ General intervention framework',
          paragraphs: [
            'The Facilitator agrees to work in accordance with the general framework, methodology, and strategy defined by the company for each mission.',
            'Each mission is defined in advance in terms of objectives, scope, and duration, without creating subordination or a permanent commitment.',
          ],
        },
        {
          id: 'ethique',
          title: '4️⃣ General conditions and professional ethics',
          paragraphs: ['The Facilitator commits to:'],
          bullets: [
            'Respect agreed deadlines and schedules.',
            'Work with seriousness, professionalism, and integrity.',
            'Respect the company context, image, and reputation with beneficiaries.',
            'Not exploit the company’s beneficiaries for personal purposes or on behalf of third parties.',
            'Not offer similar services directly to the company’s beneficiaries within the same context without prior notice.',
            'Ensure confidentiality of information and data related to the company and its beneficiaries.',
          ],
        },
        {
          id: 'collaboration',
          title: '5️⃣ Collaboration with the organizational team',
          paragraphs: [
            'The Facilitator collaborates with the company’s organizational team only when the mission requires prior preparation or coordination.',
            'Organizational activities such as:',
          ],
          bullets: [
            'Preparation meetings',
            'Internal coordination',
            'Organizational or promotional actions',
            'are not counted as billable time and are carried out as needed with both parties’ agreement.',
          ],
        },
        {
          id: 'organisation',
          title: '6️⃣ Mission organization and communication',
          paragraphs: ['Missions are organized and assigned via:'],
          bullets: [
            'the company platform (when available), or',
            'the communication channels validated by the company.',
            'This framework is solely intended to ensure follow-up and proper organization, without creating any continuity obligation.',
          ],
        },
        {
          id: 'developpement',
          title: '7️⃣ Development, evolution, and recognition',
          paragraphs: [
            'The Facilitator acknowledges that performance and activity development depend on the quality of their contribution.',
            'In case of significant contribution to:',
          ],
          bullets: [
            'improving activities',
            'optimizing sessions',
            'developing and expanding services',
            'the company may, at its discretion and with prior agreement, assign additional missions and/or adjust compensation within a balanced framework beneficial to both parties.',
          ],
        },
        {
          id: 'remuneration',
          title: '8️⃣ Calculation and compensation terms',
          bullets: [
            'Compensation is based on missions effectively delivered.',
            'Each mission is assigned an estimated number of hours for internal organizational purposes.',
            'Payment may be made either based on mission-related hours or as a fixed fee agreed per mission.',
            'Organizational or promotional activities are not included in compensation.',
          ],
        },
        {
          id: 'retenue',
          title: '9️⃣ Withholding tax',
          paragraphs: [
            'The Facilitator commits to providing a legal invoice if they have a legal status.',
            'If not, compensation is processed via withholding tax, according to applicable law.',
            'The Facilitator acknowledges that the company is not responsible for personal tax obligations outside the withholding mechanism.',
          ],
        },
        {
          id: 'absence',
          title: '🔟 No obligation for regular missions',
          paragraphs: [
            'The company has no obligation to provide missions on a regular basis (monthly or yearly).',
            'The Facilitator remains free to accept or refuse any mission, and the company reserves the right not to assign missions without justification.',
          ],
        },
        {
          id: 'resiliation',
          title: '1️⃣1️⃣ Termination in case of non-compliance',
          paragraphs: ['In case of non-compliance with rules, framework, or professional obligations, the company reserves the right to:'],
          bullets: [
            'suspend or cancel mission assignments, or',
            'end the collaboration without compensation or additional consequences.',
          ],
        },
        {
          id: 'efficacite',
          title: '1️⃣2️⃣ Collaboration and effectiveness',
          paragraphs: [
            'The more the Facilitator respects the framework and collaborates efficiently, the more their role and involvement may evolve.',
            'Any evolution, extension, or recognition of collaboration takes place in a professional, flexible framework aligned with both parties’ interests.',
          ],
        },
      ],
    };
  }

  return {
    title: 'Cadre d’intervention de l’Animateur Indépendant',
    subtitle: 'Document (lecture uniquement)',
    sommaireLabel: 'Sommaire',
    retainTitle: 'À retenir',
    retainText:
      'Ce cadre définit l’Animateur comme un intervenant externe indépendant, centré sur des prestations d’animation opérationnelles, sans lien de subordination ni obligation de continuité.',
    backLabel: 'Retour',
    downloadPdfLabel: 'Télécharger PDF',
    sections: [
      {
        id: 'definition',
        title: '1️⃣ Définition de l’Animateur et indépendance',
        paragraphs: [
          'L’Animateur indépendant est considéré comme un intervenant externe et indépendant dans la prestation de ses services pour la société.',
          'Ce cadre ne crée aucun lien de travail, de partenariat ni de subordination administrative ou organisationnelle.',
          'L’Animateur peut être :',
        ],
        bullets: [
          'Titulaire d’un statut légal (patente / activité indépendante) et fournir une facture conforme, ou',
          'Salarié du secteur public ou privé, à condition que son intervention soit réalisée en dehors de ses horaires de travail officiels et qu’il assume pleinement ses responsabilités légales et fiscales.',
        ],
      },
      {
        id: 'nature',
        title: '2️⃣ Nature des activités et des services',
        paragraphs: ['L’Animateur intervient dans des prestations à caractère opérationnel et services, incluant notamment :'],
        bullets: [
          'Sessions directes d’accompagnement professionnel avec les bénéficiaires',
          'Sessions de présentation ou de promotion des activités et services',
          'Webinars ou sessions d’orientation liés aux activités',
          'Ces interventions ne constituent ni des prestations de conseil, ni de formation, et ne relèvent ni de l’enseignement, ni de la délivrance de diplômes ou certifications.',
          'Elles s’inscrivent exclusivement dans un cadre d’animation, de suivi et d’interaction pratique.',
        ],
      },
      {
        id: 'cadre',
        title: '3️⃣ Cadre général d’intervention',
        paragraphs: [
          'L’Animateur s’engage à intervenir dans le respect du cadre général, de la méthodologie et de la stratégie définies par la société pour chaque mission.',
          'Chaque mission est définie préalablement en termes d’objectifs, de périmètre et de durée, sans que cela n’entraîne une quelconque relation de subordination ou d’engagement permanent.',
        ],
      },
      {
        id: 'ethique',
        title: '4️⃣ Conditions générales et éthique professionnelle',
        paragraphs: ['L’Animateur s’engage à :'],
        bullets: [
          'Respecter les délais et horaires convenus à l’avance.',
          'Travailler avec sérieux, professionnalisme et intégrité.',
          'Respecter le contexte, l’image et la réputation de la société auprès des bénéficiaires.',
          'Ne pas exploiter les bénéficiaires de la société à des fins personnelles ou pour le compte de tiers.',
          'Ne pas proposer de services similaires directement aux bénéficiaires de la société dans le même cadre sans information préalable.',
          'Garantir la confidentialité des informations et données relatives à la société et à ses bénéficiaires.',
        ],
      },
      {
        id: 'collaboration',
        title: '5️⃣ Collaboration avec l’équipe organisationnelle',
        paragraphs: [
          'L’Animateur collabore avec l’équipe organisationnelle de la société uniquement lorsque la mission nécessite une préparation ou une coordination préalable.',
          'Les activités organisationnelles telles que :',
        ],
        bullets: [
          'réunions préparatoires,',
          'coordinations internes,',
          'actions organisationnelles ou promotionnelles,',
          'ne sont pas comptabilisées comme temps facturable, et sont réalisées selon les besoins et avec l’accord des deux parties.',
        ],
      },
      {
        id: 'organisation',
        title: '6️⃣ Organisation des missions et communication',
        paragraphs: ['Les missions sont organisées et attribuées via :'],
        bullets: [
          'la plateforme de la société (lorsqu’elle est disponible), ou',
          'les canaux de communication validés par la société.',
          'Ce cadre vise exclusivement à assurer le suivi et la bonne organisation des missions, sans créer d’obligation de continuité.',
        ],
      },
      {
        id: 'developpement',
        title: '7️⃣ Développement, évolution et valorisation',
        paragraphs: [
          'L’Animateur reconnaît que la performance et le développement des activités dépendent de la qualité de sa contribution.',
          'En cas de contribution significative à :',
        ],
        bullets: [
          'l’amélioration des activités,',
          'l’optimisation des sessions,',
          'ou le développement et l’élargissement des services,',
          'la société pourra, selon son appréciation et sur accord préalable :',
          'confier des missions supplémentaires,',
          'et/ou ajuster la rémunération,',
          'dans un cadre équilibré et bénéfique pour les deux parties.',
        ],
      },
      {
        id: 'remuneration',
        title: '8️⃣ Modalités de calcul et de rémunération',
        bullets: [
          'La rémunération est basée sur les missions effectivement réalisées.',
          'Chaque mission fait l’objet d’une estimation horaire à titre organisationnel interne.',
          'Le paiement peut être effectué : soit sur la base des heures liées à la mission, soit sous forme de forfait convenu par mission.',
          'Les activités organisationnelles ou promotionnelles ne sont pas incluses dans la rémunération.',
        ],
      },
      {
        id: 'retenue',
        title: '9️⃣ Retenue à la source',
        paragraphs: [
          'L’Animateur s’engage à fournir une facture légale s’il dispose d’un statut juridique.',
          'En l’absence de statut légal, la rémunération est effectuée via retenue à la source, conformément à la législation en vigueur.',
          'L’Animateur reconnaît que la société n’est pas responsable de ses obligations fiscales personnelles en dehors du cadre de la retenue appliquée.',
        ],
      },
      {
        id: 'absence',
        title: '🔟 Absence d’obligation de missions régulières',
        paragraphs: [
          'La société n’a aucune obligation de fournir des missions de manière régulière (mensuelle ou annuelle).',
          'L’Animateur reste libre d’accepter ou de refuser toute mission, et la société se réserve le droit de ne pas attribuer de mission sans justification.',
        ],
      },
      {
        id: 'resiliation',
        title: '1️⃣1️⃣ Résiliation en cas de non-respect',
        paragraphs: ['En cas de non-respect des règles, du cadre ou des obligations professionnelles, la société se réserve le droit de :'],
        bullets: [
          'suspendre ou annuler l’attribution des missions, ou',
          'mettre fin à la collaboration sans indemnité ni conséquence supplémentaire.',
        ],
      },
      {
        id: 'efficacite',
        title: '1️⃣2️⃣ Collaboration et efficacité',
        paragraphs: [
          'Plus l’Animateur respecte le cadre établi et collabore de manière efficace, plus son rôle et son implication peuvent évoluer.',
          'Toute évolution, extension ou valorisation de la collaboration se fait dans un cadre professionnel, flexible et conforme à l’intérêt des deux parties.',
        ],
      },
    ],
  };
};
