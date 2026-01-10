import { useState } from 'react';
import {
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import de la nouvelle dashboard
import FormateurDashboard from '../components/formateur/FormateurDashboard';

const EspaceFormateurPage = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'document' | 'dashboard'>('document');
  const [docLanguage, setDocLanguage] = useState<'fr' | 'ar' | 'en'>('fr');

  const getCadreContent = (lang: 'fr' | 'ar' | 'en') => {
    const baseTitle = 'Cadre d’intervention de l’Expert Externe Indépendant – MA -Training-Consulting';

    if (lang === 'fr') {
      return {
        title: baseTitle,
        sections: [
          {
            heading: '1️⃣ Définition de l’Expert et indépendance',
            paragraphs: [
              'L’expert externe indépendant est considéré comme un prestataire autonome et ne crée aucun lien de subordination, d’emploi ou de partenariat avec la société.',
              'L’expert peut être :',
            ],
            bullets: [
              'un professionnel légalement habilité (patente/activité indépendante) émettant une facture, ou',
              'un salarié du secteur public ou privé, à condition que l’intervention se fasse en dehors de ses horaires de travail officiels, et que l’expert assume ses obligations légales et fiscales.',
            ],
          },
          {
            heading: '2️⃣ Activités consultatives et services',
            paragraphs: [
              'L’expert intervient dans le cadre de services à caractère consultatif ou service, incluant notamment :',
            ],
            bullets: [
              'Accompagnement professionnel',
              'Digitalisation / Transformation numérique',
              'Ateliers professionnels (Workshops / Ateliers)',
              'Toute autre activité consultative ou service complémentaire définie ultérieurement par la société',
            ],
            footnote: 'Toutes ces activités sont fournies dans un cadre consultatif non formatif, et ne constituent ni formation ni certification.',
          },
          {
            heading: '3️⃣ Respect de la méthodologie et de la stratégie',
            paragraphs: [
              'L’expert s’engage à respecter les fondamentaux du travail, la méthodologie et la stratégie de la société pour toutes les missions.',
              'Pour chaque activité, un guide spécifique est fourni à l’expert, précisant le cadre, les limites et la méthodologie de la mission.',
            ],
          },
          {
            heading: '4️⃣ Conditions générales et éthique professionnelle',
            bullets: [
              'Respect des échéances convenues.',
              'Travail avec diligence, sérieux, et professionnalisme, en respectant les horaires définis.',
              'Confidentialité absolue des informations de la société et de ses clients, et interdiction de les utiliser à d’autres fins.',
              'L’expert ne doit pas fournir d’activités concurrentes ou similaires sans en informer préalablement la société.',
              'Tout contenu ou document produit dans le cadre de la mission appartient exclusivement à la société et ne peut être utilisé qu’en son nom.',
            ],
          },
          {
            heading: '5️⃣ Collaboration avec l’équipe organisationnelle',
            paragraphs: [
              'L’expert collabore avec l’équipe organisationnelle de la société afin d’assurer l’efficacité des missions.',
            ],
            bullets: [
              'Toute activité organisationnelle, telles que réunions avec les organisateurs, ateliers internes ou webinars préparatoires, ne sera pas comptabilisée dans les heures ou jours de travail pour le calcul des rémunérations.',
              'Ces activités organisationnelles sont réalisées selon les besoins et avec accord préalable des deux parties.',
            ],
          },
          {
            heading: '6️⃣ Organisation des missions et communication',
            paragraphs: [
              'Les missions sont organisées et coordonnées via la plateforme de la société ou par communication directe avec la société.',
              'Ce cadre garantit un suivi précis et l’accès aux informations nécessaires à la bonne exécution des missions.',
            ],
          },
          {
            heading: '7️⃣ Développement et incitations',
            bullets: [
              'L’expert reconnaît que le succès et l’expansion de l’activité dépendent de sa contribution active.',
              'En cas de contribution effective, l’expert peut bénéficier de bonus financiers ou d’augmentation du tarif journalier si l’expansion ou le développement de l’activité résulte de sa participation directe.',
              'L’expert est encouragé à proposer des idées et suggestions pour améliorer et développer l’activité, dans le respect des intérêts des deux parties.',
              'Tout développement ou expansion se fait dans un cadre profitable aux deux parties et selon un accord préalable.',
            ],
          },
          {
            heading: '8️⃣ Calcul des jours et heures et modalités de paiement',
            bullets: [
              'La rémunération est basée sur les missions réalisées en jours (7 heures = 1 jour de travail).',
              'Le paiement est effectué tous les 15 jours à titre d’outil organisationnel pour compiler les heures et préparer la facture ou la Retenue à la source.',
              'Une mission peut exceptionnellement être réglée forfaitairement pour l’ensemble de la tâche sans calcul des jours.',
              'Toute activité organisationnelle ou promotionnelle n’est pas incluse dans le calcul de la rémunération.',
            ],
          },
          {
            heading: '9️⃣ Retenue à la source',
            bullets: [
              'L’expert émettra une facture légale s’il possède la capacité juridique.',
              'Si l’expert n’a pas de statut légal, le paiement se fera via Retenue à la source, conformément à la législation en vigueur.',
              'L’expert reconnaît que la société n’est pas responsable de toute obligation fiscale personnelle en dehors de la retenue.',
            ],
          },
          {
            heading: '🔟 Absence de garantie de missions',
            bullets: [
              'La société n’est pas tenue de fournir des missions de manière régulière (mensuelle ou annuelle).',
              'L’expert reste libre d’accepter ou de refuser toute mission, et la société peut ne pas attribuer de mission sans justification.',
            ],
          },
          {
            heading: '11️⃣ Résiliation en cas de non-respect',
            paragraphs: [
              'En cas de non-collaboration ou non-respect des règles et du contexte convenus, la société se réserve le droit de :',
            ],
            bullets: [
              'Annuler l’attribution de missions',
              'ou mettre fin à la collaboration sans aucune conséquence supplémentaire',
            ],
          },
          {
            heading: '2️⃣ Collaboration continue et fierté de contribution',
            bullets: [
              'Plus l’expert collabore et respecte les règles, plus son rôle et son efficacité dans l’activité augmentent, avec des opportunités de missions supplémentaires et de bonus.',
              'Toute initiative de développement ou d’expansion se fait dans un cadre de coopération mutuelle, garantissant les bénéfices pour les deux parties et l’amélioration continue de l’activité.',
            ],
          },
        ],
      };
    }

    if (lang === 'en') {
      return {
        title: 'Intervention Framework for the Independent External Expert – MA -Training-Consulting',
        sections: [
          {
            heading: '1️⃣ Definition of the Expert and Independence',
            paragraphs: [
              'The independent external expert is considered an autonomous service provider and does not create any relationship of subordination, employment, or partnership with the company.',
              'The expert may be:',
            ],
            bullets: [
              'a legally authorized professional (license/independent activity) issuing an invoice, or',
              'an employee in the public or private sector, provided the intervention takes place outside official working hours, and the expert assumes all legal and tax obligations.',
            ],
          },
          {
            heading: '2️⃣ Consulting Activities and Services',
            paragraphs: [
              'The expert intervenes within consulting or service activities, including in particular:',
            ],
            bullets: [
              'Professional support',
              'Digitalization / Digital transformation',
              'Professional workshops (Workshops / Sessions)',
              'Any other consulting activity or complementary service defined later by the company',
            ],
            footnote: 'All these activities are provided within a non-training consulting framework and do not constitute training or certification.',
          },
          {
            heading: '3️⃣ Compliance with Methodology and Strategy',
            paragraphs: [
              'The expert undertakes to respect the fundamentals of work, the methodology, and the company’s strategy for all assignments.',
              'For each activity, a specific guide is provided to the expert, specifying the framework, limits, and methodology of the assignment.',
            ],
          },
          {
            heading: '4️⃣ General Conditions and Professional Ethics',
            bullets: [
              'Respect agreed deadlines.',
              'Work diligently, seriously, and professionally, respecting the defined schedules.',
              'Absolute confidentiality of the company’s and its clients’ information, and prohibition of using it for other purposes.',
              'The expert must not provide competing or similar activities without informing the company in advance.',
              'Any content or document produced as part of the assignment belongs exclusively to the company and may only be used in its name.',
            ],
          },
          {
            heading: '5️⃣ Collaboration with the Organizational Team',
            paragraphs: [
              'The expert collaborates with the company’s organizational team to ensure the effectiveness of assignments.',
            ],
            bullets: [
              'Any organizational activity, such as meetings with organizers, internal workshops, or preparatory webinars, will not be counted in working hours/days for remuneration calculations.',
              'These organizational activities are carried out as needed and with prior agreement of both parties.',
            ],
          },
          {
            heading: '6️⃣ Assignment Organization and Communication',
            paragraphs: [
              'Assignments are organized and coordinated via the company’s platform or through direct communication with the company.',
              'This framework ensures accurate follow-up and access to the information necessary for proper execution of assignments.',
            ],
          },
          {
            heading: '7️⃣ Development and Incentives',
            bullets: [
              'The expert acknowledges that the success and expansion of the activity depends on their active contribution.',
              'In case of effective contribution, the expert may benefit from financial bonuses or an increased daily rate if the expansion/development results from their direct participation.',
              'The expert is encouraged to propose ideas and suggestions to improve and develop the activity, in line with the interests of both parties.',
              'Any development or expansion is carried out within a framework beneficial to both parties and subject to prior agreement.',
            ],
          },
          {
            heading: '8️⃣ Calculation of Days/Hours and Payment Terms',
            bullets: [
              'Remuneration is based on assignments completed in days (7 hours = 1 working day).',
              'Payment is made every 15 days as an organizational tool to compile hours and prepare the invoice or withholding tax statement.',
              'An assignment may exceptionally be paid as a fixed fee for the whole task without calculating days.',
              'Any organizational or promotional activity is not included in remuneration calculations.',
            ],
          },
          {
            heading: '9️⃣ Withholding Tax',
            bullets: [
              'The expert will issue a legal invoice if they have the legal capacity/status.',
              'If the expert does not have legal status, payment will be made via withholding tax in accordance with applicable legislation.',
              'The expert acknowledges that the company is not responsible for any personal tax obligations beyond the withholding.',
            ],
          },
          {
            heading: '🔟 No Guarantee of Assignments',
            bullets: [
              'The company is not required to provide assignments on a regular basis (monthly or yearly).',
              'The expert remains free to accept or refuse any assignment, and the company may choose not to assign work without justification.',
            ],
          },
          {
            heading: '11️⃣ Termination in Case of Non-Compliance',
            paragraphs: [
              'In case of lack of collaboration or non-compliance with the agreed rules and context, the company reserves the right to:',
            ],
            bullets: [
              'Cancel the allocation of assignments',
              'or end the collaboration without any further consequences',
            ],
          },
          {
            heading: '2️⃣ Ongoing Collaboration and Pride of Contribution',
            bullets: [
              'The more the expert collaborates and respects the rules, the more their role and effectiveness increases, with opportunities for additional assignments and bonuses.',
              'Any initiative for development or expansion takes place within a framework of mutual cooperation, ensuring benefits for both parties and continuous improvement of the activity.',
            ],
          },
        ],
      };
    }

    return {
      title: 'إطار تدخل الخبير الخارجي المستقل – MA -Training-Consulting',
      sections: [
        {
          heading: '1️⃣ تعريف الخبير والاستقلالية',
          paragraphs: [
            'يُعتبر الخبير الخارجي المستقل مزوّد خدمات مستقلًا ولا يُنشئ أي علاقة تبعية أو تشغيل أو شراكة مع الشركة.',
            'يمكن أن يكون الخبير:',
          ],
          bullets: [
            'مهنيًا مرخّصًا قانونيًا (بطاقة مهنية/نشاط مستقل) ويصدر فاتورة، أو',
            'موظفًا في القطاع العام أو الخاص بشرط أن يتمّ التدخل خارج أوقات عمله الرسمية، وأن يتحمل الخبير التزاماته القانونية والجبائية.',
          ],
        },
        {
          heading: '2️⃣ الأنشطة الاستشارية والخدمات',
          paragraphs: [
            'يتدخل الخبير ضمن خدمات ذات طابع استشاري أو خدمي، وتشمل على وجه الخصوص:',
          ],
          bullets: [
            'المرافقة المهنية',
            'الرقمنة / التحول الرقمي',
            'ورشات مهنية (Workshops / Ateliers)',
            'أي نشاط استشاري آخر أو خدمة مكملة يتم تحديدها لاحقًا من طرف الشركة',
          ],
          footnote: 'تُقدَّم كل هذه الأنشطة في إطار استشاري غير تكويني، ولا تُعدّ تدريبًا ولا شهادة.',
        },
        {
          heading: '3️⃣ احترام المنهجية والاستراتيجية',
          paragraphs: [
            'يلتزم الخبير باحترام أسس العمل والمنهجية واستراتيجية الشركة في جميع المهام.',
            'بالنسبة لكل نشاط، يتم تزويد الخبير بدليل خاص يوضح الإطار والحدود والمنهجية الخاصة بالمهمة.',
          ],
        },
        {
          heading: '4️⃣ الشروط العامة وأخلاقيات المهنة',
          bullets: [
            'احترام الآجال المتفق عليها.',
            'العمل بجدية واحترافية مع احترام الأوقات المحددة.',
            'السرية التامة لمعلومات الشركة وحرفائها ومنع استعمالها لأي أغراض أخرى.',
            'عدم تقديم أنشطة منافسة أو مشابهة دون إعلام الشركة مسبقًا.',
            'كل محتوى أو وثيقة يتم إنتاجها في إطار المهمة تعود ملكيتها حصريًا للشركة ولا تُستعمل إلا باسمها.',
          ],
        },
        {
          heading: '5️⃣ التعاون مع الفريق التنظيمي',
          paragraphs: [
            'يتعاون الخبير مع الفريق التنظيمي للشركة لضمان فعالية المهام.',
          ],
          bullets: [
            'أي نشاط تنظيمي مثل الاجتماعات مع المنظمين أو الورشات الداخلية أو الندوات التحضيرية (webinars) لا يُحتسب ضمن الساعات أو الأيام المعتمدة لحساب الأجور.',
            'تُنجز هذه الأنشطة التنظيمية حسب الحاجة وباتفاق مسبق بين الطرفين.',
          ],
        },
        {
          heading: '6️⃣ تنظيم المهام والتواصل',
          paragraphs: [
            'يتم تنظيم وتنسيق المهام عبر منصة الشركة أو عبر تواصل مباشر مع الشركة.',
            'يضمن هذا الإطار متابعة دقيقة وإتاحة المعلومات اللازمة لحسن تنفيذ المهام.',
          ],
        },
        {
          heading: '7️⃣ التطوير والتحفيزات',
          bullets: [
            'يقرّ الخبير بأن نجاح النشاط وتوسعه يعتمد على مساهمته الفعّالة.',
            'في حال وجود مساهمة فعّالة، يمكن للخبير الاستفادة من مكافآت مالية أو زيادة في التعريفة اليومية إذا كان توسع/تطور النشاط ناتجًا عن مشاركته المباشرة.',
            'يُشجَّع الخبير على تقديم أفكار واقتراحات لتحسين وتطوير النشاط بما يخدم مصلحة الطرفين.',
            'يتم أي تطوير أو توسع ضمن إطار مفيد للطرفين وبموجب اتفاق مسبق.',
          ],
        },
        {
          heading: '8️⃣ احتساب الأيام والساعات وطرق الدفع',
          bullets: [
            'تعتمد الأجرة على المهام المنجزة بالأيام (7 ساعات = يوم عمل واحد).',
            'يتم الدفع كل 15 يومًا كآلية تنظيمية لتجميع الساعات وتحضير الفاتورة أو بيان الخصم من المورد.',
            'يمكن استثنائيًا تسوية مهمة بنظام مبلغ جزافي لكامل العمل دون احتساب الأيام.',
            'أي نشاط تنظيمي أو ترويجي لا يدخل ضمن احتساب الأجرة.',
          ],
        },
        {
          heading: '9️⃣ الخصم من المورد',
          bullets: [
            'يصدر الخبير فاتورة قانونية إذا كان يتمتع بالصفة/الوضع القانوني.',
            'إذا لم يكن للخبير وضع قانوني، يتم الدفع عبر الخصم من المورد وفقًا للتشريع الجاري به العمل.',
            'يقرّ الخبير بأن الشركة غير مسؤولة عن أي التزامات جبائية شخصية خارج إطار الخصم.',
          ],
        },
        {
          heading: '🔟 عدم ضمان توفر المهام',
          bullets: [
            'لا تلتزم الشركة بتوفير مهام بصفة منتظمة (شهريًا أو سنويًا).',
            'يبقى الخبير حرًا في قبول أو رفض أي مهمة، ويمكن للشركة عدم إسناد مهمة دون تبرير.',
          ],
        },
        {
          heading: '11️⃣ إنهاء التعاون في حال عدم الالتزام',
          paragraphs: [
            'في حال عدم التعاون أو عدم احترام القواعد والسياق المتفق عليه، تحتفظ الشركة بحق:',
          ],
          bullets: [
            'إلغاء إسناد المهام',
            'أو إنهاء التعاون دون أي تبعات إضافية',
          ],
        },
        {
          heading: '2️⃣ تعاون مستمر وفخر بالمساهمة',
          bullets: [
            'كلما زاد تعاون الخبير واحترامه للقواعد، زاد دوره وفعاليته داخل النشاط مع فرص لمهام إضافية ومكافآت.',
            'أي مبادرة للتطوير أو التوسع تتم في إطار تعاون متبادل يضمن الفائدة للطرفين والتحسين المستمر للنشاط.',
          ],
        },
      ],
    };
  };

  const buildPrintableHtml = (lang: 'fr' | 'ar' | 'en') => {
    const { title, sections } = getCadreContent(lang);
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    const align = lang === 'ar' ? 'right' : 'left';
    const safe = (t: string) =>
      t
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const body = [
      `<h1>${safe(title)}</h1>`,
      ...sections.flatMap((s) => {
        const parts: string[] = [];
        parts.push(`<h2>${safe(s.heading)}</h2>`);
        if (s.paragraphs?.length) {
          for (const p of s.paragraphs) parts.push(`<p>${safe(p)}</p>`);
        }
        if (s.bullets?.length) {
          parts.push('<ul>');
          for (const b of s.bullets) parts.push(`<li>${safe(b)}</li>`);
          parts.push('</ul>');
        }
        if (s.footnote) parts.push(`<p class="footnote">${safe(s.footnote)}</p>`);
        return parts;
      }),
    ].join('\n');

    return `<!doctype html>
<html lang="${lang}" dir="${dir}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safe(title)}</title>
    <style>
      @page { size: A4; margin: 20mm; }
      html, body { background: #ffffff; color: #111827; }
      body {
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Helvetica Neue", sans-serif;
        line-height: 1.55;
        text-align: ${align};
      }
      h1 { font-size: 22px; margin: 0 0 18px 0; }
      h2 { font-size: 16px; margin: 16px 0 8px 0; }
      p { margin: 0 0 10px 0; }
      ul { margin: 0 0 10px 0; padding-${align === 'right' ? 'right' : 'left'}: 18px; }
      li { margin: 6px 0; }
      .footnote { margin-top: 8px; font-style: italic; color: #374151; }
    </style>
  </head>
  <body>
    ${body}
  </body>
</html>`;
  };

  const handleDownloadCadrePdf = () => {
    const html = buildPrintableHtml(docLanguage);
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const DocumentView = () => {
    const doc = getCadreContent(docLanguage);
    const isArabic = docLanguage === 'ar';

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour</span>
              </button>

              <div className="flex flex-col sm:items-end gap-3">
                <div className="flex items-center gap-3 justify-end">
                  <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                    <button
                      type="button"
                      onClick={() => setDocLanguage('fr')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md ${docLanguage === 'fr' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      FR
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocLanguage('ar')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md ${docLanguage === 'ar' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      العربية
                    </button>
                    <button
                      type="button"
                      onClick={() => setDocLanguage('en')}
                      className={`px-3 py-1.5 text-sm font-medium rounded-md ${docLanguage === 'en' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      EN
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadCadrePdf}
                    className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span>⬇️</span>
                    <span>Télécharger PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setView('dashboard')}
                    className="inline-flex items-center justify-center bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
                  >
                    Accéder au formulaire
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{doc.title}</h1>
            <p className="text-sm text-gray-600 mt-2">Document (lecture uniquement)</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" dir={isArabic ? 'rtl' : 'ltr'}>
            <div className={isArabic ? 'text-right' : 'text-left'}>
              {doc.sections.map((section, idx) => (
                <div key={`${section.heading}-${idx}`} className="mb-8 last:mb-0">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">{section.heading}</h2>
                  {section.paragraphs?.map((p, pIdx) => (
                    <p key={pIdx} className="text-gray-700 leading-relaxed mb-3">{p}</p>
                  ))}

                  {section.bullets?.length ? (
                    <ul className="list-disc pl-5 pr-5 text-gray-700 space-y-2">
                      {section.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="leading-relaxed">{b}</li>
                      ))}
                    </ul>
                  ) : null}

                  {section.footnote ? (
                    <p className="text-gray-600 italic mt-3">{section.footnote}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header avec bouton retour */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <button
                onClick={() => setView('document')}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour au document</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Dashboard */}
        <FormateurDashboard formateurId="SHARED" formateurName="Espace partagé" />
      </div>
    );
  }

  return <DocumentView />;
};

export default EspaceFormateurPage;
