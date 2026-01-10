import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  type AnimateurCadreLang,
  getAnimateurCadreContent,
} from '../data/animateurCadreContent';

const EspaceCommercialCadrePage = () => {
  const navigate = useNavigate();

  const [lang, setLang] = useState<AnimateurCadreLang>('fr');

  const {
    title,
    subtitle,
    sections,
    sommaireLabel,
    retainTitle,
    retainText,
    backLabel,
    downloadPdfLabel,
  } = useMemo(() => getAnimateurCadreContent(lang), [lang]);

  const isArabic = lang === 'ar';
  const textAlignClass = isArabic ? 'text-right' : 'text-left';
  const sommaireButtonAlignClass = isArabic ? 'text-right' : 'text-left';

  const buildPrintableHtml = (printLang: AnimateurCadreLang) => {
    const content = getAnimateurCadreContent(printLang);
    const dir = printLang === 'ar' ? 'rtl' : 'ltr';
    const align = printLang === 'ar' ? 'right' : 'left';
    const ulPadProp = align === 'right' ? 'padding-right' : 'padding-left';

    const safe = (t: string) =>
      t
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const body = [
      `<h1>${safe(content.title)}</h1>`,
      `<p class="subtitle">${safe(content.subtitle)}</p>`,
      ...content.sections.flatMap((s) => {
        const parts: string[] = [];
        parts.push(`<h2>${safe(s.title)}</h2>`);
        if (s.paragraphs?.length) {
          for (const p of s.paragraphs) parts.push(`<p>${safe(p)}</p>`);
        }
        if (s.bullets?.length) {
          parts.push('<ul>');
          for (const b of s.bullets) parts.push(`<li>${safe(b)}</li>`);
          parts.push('</ul>');
        }
        return parts;
      }),
    ].join('\n');

    return `<!doctype html>
<html lang="${printLang}" dir="${dir}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safe(content.title)}</title>
    <style>
      @page { size: A4; margin: 18mm; }
      html, body { background: #ffffff; color: #111827; }
      body {
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Helvetica Neue", sans-serif;
        line-height: 1.6;
        text-align: ${align};
      }
      h1 { font-size: 22px; margin: 0 0 6px 0; }
      .subtitle { margin: 0 0 18px 0; color: #374151; font-size: 13px; }
      h2 { font-size: 15px; margin: 16px 0 8px 0; }
      p { margin: 0 0 10px 0; }
      ul { margin: 0 0 10px 0; ${ulPadProp}: 18px; }
      li { margin: 6px 0; }
    </style>
  </head>
  <body>
    ${body}
  </body>
</html>`;
  };

  const handleDownloadPdf = () => {
    const html = buildPrintableHtml(lang);
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

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <div className="bg-white/70 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-amber-700 hover:text-amber-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{backLabel}</span>
            </button>

            <div className="flex items-center gap-3 justify-end">
              <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                <button
                  type="button"
                  onClick={() => setLang('fr')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${lang === 'fr' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  FR
                </button>
                <button
                  type="button"
                  onClick={() => setLang('ar')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${lang === 'ar' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  العربية
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md ${lang === 'en' ? 'bg-white shadow text-gray-900' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  EN
                </button>
              </div>

              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center justify-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
              >
                <span>⬇️</span>
                <span>{downloadPdfLabel}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-24">
              <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 ${textAlignClass}`}>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{title}</h1>
                <p className="text-sm text-gray-600 mt-2">{subtitle}</p>

                <div className="mt-6">
                  <div className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{sommaireLabel}</div>
                  <div className="mt-3 space-y-2">
                    {sections.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleScrollTo(s.id)}
                        className={`w-full ${sommaireButtonAlignClass} rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 px-3 py-2 text-sm text-gray-800 transition-colors`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <div className="text-sm font-semibold text-amber-900">{retainTitle}</div>
                  <p className="text-sm text-amber-900 mt-2">{retainText}</p>
                </div>
              </div>
            </div>
          </aside>

          <section className="lg:col-span-8">
            <div className="space-y-6">
              {sections.map((s) => (
                <div key={s.id} id={s.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-8 w-8 rounded-lg bg-amber-600 text-white flex items-center justify-center text-sm font-bold">i</div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{s.title}</h2>
                    </div>
                  </div>

                  {s.paragraphs?.length ? (
                    <div className={`mt-4 space-y-3 ${textAlignClass}`}>
                      {s.paragraphs.map((p, idx) => (
                        <p key={idx} className="text-gray-700 leading-relaxed">{p}</p>
                      ))}
                    </div>
                  ) : null}

                  {s.bullets?.length ? (
                    <ul className={`mt-4 list-disc ${isArabic ? 'pr-5' : 'pl-5'} text-gray-700 space-y-2 ${textAlignClass}`}>
                      {s.bullets.map((b, idx) => (
                        <li key={idx} className="leading-relaxed">{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EspaceCommercialCadrePage;
