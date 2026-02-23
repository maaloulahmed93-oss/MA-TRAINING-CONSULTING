import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type Lang = 'fr' | 'en' | 'ar';

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  dir: 'ltr' | 'rtl';
  t: (key: string, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY = 'mtc_lang';

const translations: Record<Lang, Record<string, string>> = {
  fr: {
    lang_fr: 'Français',
    lang_en: 'English',
    lang_ar: 'العربية',

    service2_mission_title: 'Service 2 — Mission',
    back_home: 'Retour à l’accueil',
    finish_slots: 'Finish (Slots)',

    loading: 'Chargement...',
    scenario: 'Scenario',
    constraints: 'Constraints',
    success_criteria: 'Success Criteria',
    your_answer: 'Votre réponse',
    final_report: 'Rapport final',
    send_analyze: 'Envoyer & analyser',
    submission: 'Submission: {id}',

    ai_feedback: 'AI Feedback',
    score: 'Score: {score}/100',
    warnings: 'Warnings',
    tips: 'Tips',
    constraint_violations: 'Constraint Violations',

    no_exam_assigned: 'Aucun exam assigné pour ce compte.',
    error_loading_exam: 'Erreur chargement exam',
    error_generic: 'Erreur',

    plan_title: 'Plan d\'action',
    plan_help: 'Ajoute des tâches (grandes étapes). Le texte et le PDF ne sont pas enregistrés, seul le feedback IA est sauvegardé.',
    task_title: 'Titre de la tâche',
    add_task: 'Ajouter une tâche',
    due_at: 'Deadline',
    save_plan: 'Enregistrer le plan',
    plan_saved: 'Plan enregistré.',
    analyze_task: 'Analyser (texte + PDF)',
    report_text: 'Texte (court rapport)',
    select_pdf: 'PDF',
    send_for_ai: 'Envoyer à l\'IA',
    task_done: 'Terminé',
    time_left: 'Temps restant',
  },
  en: {
    lang_fr: 'Français',
    lang_en: 'English',
    lang_ar: 'العربية',

    service2_mission_title: 'Service 2 — Mission',
    back_home: 'Back to home',
    finish_slots: 'Finish (Slots)',

    loading: 'Loading...',
    scenario: 'Scenario',
    constraints: 'Constraints',
    success_criteria: 'Success Criteria',
    your_answer: 'Your answer',
    final_report: 'Final report',
    send_analyze: 'Send & analyze',
    submission: 'Submission: {id}',

    ai_feedback: 'AI Feedback',
    score: 'Score: {score}/100',
    warnings: 'Warnings',
    tips: 'Tips',
    constraint_violations: 'Constraint violations',

    no_exam_assigned: 'No exam assigned to this account.',
    error_loading_exam: 'Error loading exam',
    error_generic: 'Error',

    plan_title: 'Action plan',
    plan_help: 'Add big tasks. The text and PDF are not stored; only AI feedback is saved.',
    task_title: 'Task title',
    add_task: 'Add task',
    due_at: 'Deadline',
    save_plan: 'Save plan',
    plan_saved: 'Plan saved.',
    analyze_task: 'Analyze (text + PDF)',
    report_text: 'Text (short report)',
    select_pdf: 'PDF',
    send_for_ai: 'Send to AI',
    task_done: 'Done',
    time_left: 'Time left',
  },
  ar: {
    lang_fr: 'Français',
    lang_en: 'English',
    lang_ar: 'العربية',

    service2_mission_title: 'الخدمة 2 — المهمة',
    back_home: 'العودة إلى الصفحة الرئيسية',
    finish_slots: 'مواعيد النهاية',

    loading: 'جار التحميل...',
    scenario: 'السيناريو',
    constraints: 'القيود',
    success_criteria: 'معايير النجاح',
    your_answer: 'إجابتك',
    final_report: 'التقرير النهائي',
    send_analyze: 'إرسال وتحليل',
    submission: 'المحاولة: {id}',

    ai_feedback: 'ملاحظات الذكاء الاصطناعي',
    score: 'النتيجة: {score}/100',
    warnings: 'تحذيرات',
    tips: 'نصائح',
    constraint_violations: 'مخالفات القيود',

    no_exam_assigned: 'لا يوجد امتحان مخصّص لهذا الحساب.',
    error_loading_exam: 'خطأ أثناء تحميل الامتحان',
    error_generic: 'خطأ',

    plan_title: 'خطة عمل',
    plan_help: 'أضف مهام كبيرة. لا يتم حفظ النص أو ملف PDF؛ يتم حفظ ملاحظات الذكاء الاصطناعي فقط.',
    task_title: 'عنوان المهمة',
    add_task: 'إضافة مهمة',
    due_at: 'الموعد النهائي',
    save_plan: 'حفظ الخطة',
    plan_saved: 'تم حفظ الخطة.',
    analyze_task: 'تحليل (نص + PDF)',
    report_text: 'نص (تقرير قصير)',
    select_pdf: 'PDF',
    send_for_ai: 'إرسال إلى الذكاء الاصطناعي',
    task_done: 'مكتملة',
    time_left: 'الوقت المتبقي',
  },
};

function detectInitialLang(): Lang {
  const saved = (typeof window !== 'undefined' && window.localStorage.getItem(STORAGE_KEY)) || '';
  if (saved === 'fr' || saved === 'en' || saved === 'ar') return saved;

  const nav = (typeof navigator !== 'undefined' && navigator.language) || '';
  if (nav.toLowerCase().startsWith('ar')) return 'ar';
  if (nav.toLowerCase().startsWith('en')) return 'en';
  return 'fr';
}

function interpolate(template: string, params?: Record<string, string | number>) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(params[key] ?? `{${key}}`));
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() => detectInitialLang());

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const raw = translations[lang]?.[key] ?? translations.fr[key] ?? key;
      return interpolate(raw, params);
    },
    [lang]
  );

  const value = useMemo<I18nContextValue>(() => ({ lang, setLang, dir, t }), [lang, setLang, dir, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within LanguageProvider');
  return ctx;
}
