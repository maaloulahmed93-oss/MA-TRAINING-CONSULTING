export type EspaceRessourcesVariant = "gratuites" | "bonus";

export type EspaceRessourceOption = {
  label: string;
  explanation: string;
};

export type EspaceRessourceItem = {
  variant: EspaceRessourcesVariant;
  slug: string;
  title: string;
  shortDescription: string;
  actionLabel: "Voir" | "Accéder";
  intro: string;
  scenario: string;
  question: string;
  options: EspaceRessourceOption[];
  correctIndex: number;
  advice: string;
};

export const ESPACE_RESSOURCES_ITEMS: EspaceRessourceItem[] = [
  {
    variant: "gratuites",
    slug: "comprendre-les-roles",
    title: "Comprendre les rôles professionnels",
    shortDescription: "Situations courtes + lecture métier simplifiée.",
    actionLabel: "Voir",
    intro: "Clarifier qui fait quoi, et pourquoi ça compte.",
    scenario:
      "On te demande de \"gérer\" un projet mais sans périmètre clair et sans pouvoir de décision.",
    question: "Quelle est la meilleure réaction?",
    options: [
      {
        label: "Clarifier objectifs, périmètre et niveau de décision.",
        explanation: "Tu crées un cadre concret avant d'accepter la responsabilité.",
      },
      {
        label: "Accepter et avancer sans clarifier.",
        explanation: "Risque: responsabilité sans moyens ni critères d'évaluation.",
      },
      {
        label: "Refuser immédiatement.",
        explanation: "Possible, mais mieux de clarifier d'abord.",
      },
    ],
    correctIndex: 0,
    advice:
      "Quand un rôle est flou: demande objectifs, périmètre, décideur, et critères d'évaluation.",
  },
  {
    variant: "gratuites",
    slug: "lire-une-offre-demploi",
    title: "Lire une offre d'emploi avec discernement",
    shortDescription: "Repérer les indices cachés dans le descriptif.",
    actionLabel: "Accéder",
    intro: "Comprendre si le poste correspond vraiment au niveau attendu.",
    scenario:
      "Une offre annonce \"autonomie\" et \"polyvalence\" sans préciser le cadre ni l'équipe.",
    question: "Quel est le bon réflexe?",
    options: [
      {
        label: "Demander des exemples concrets de missions et de critères de réussite.",
        explanation: "Tu transformes des mots vagues en réalité mesurable.",
      },
      {
        label: "Se fier au titre du poste.",
        explanation: "Le titre seul ne garantit pas le contenu du rôle.",
      },
      {
        label: "Décider uniquement selon le salaire.",
        explanation: "Important, mais insuffisant pour juger la progression.",
      },
    ],
    correctIndex: 0,
    advice:
      "Demande 2 exemples de journées-type + 2 contraintes + 1 critère d'évaluation.",
  },
  {
    variant: "bonus",
    slug: "alignement-avec-le-diagnostic",
    title: "Alignement avec le diagnostic",
    shortDescription: "Relier décision et niveau de responsabilité réel.",
    actionLabel: "Voir",
    intro: "Vérifier si une décision correspond à ta posture actuelle.",
    scenario:
      "Tu veux piloter une initiative transverse, mais ton périmètre officiel reste local.",
    question: "Quel est le premier pas le plus cohérent?",
    options: [
      {
        label: "Négocier un périmètre clair et des relais avant de lancer.",
        explanation: "Tu sécurises le cadre et évites l'échec structurel.",
      },
      {
        label: "Lancer directement pour prouver ta valeur.",
        explanation: "Risque: blocage politique et surcharge sans autorité.",
      },
      {
        label: "Attendre sans agir.",
        explanation: "Perte de momentum: mieux vaut cadrer un petit pilote.",
      },
    ],
    correctIndex: 0,
    advice:
      "Commence par un pilote: petit périmètre, sponsor identifié, critères de réussite.",
  },
  {
    variant: "bonus",
    slug: "decision-sous-contrainte",
    title: "Décider sous contrainte",
    shortDescription: "Choisir sans se disperser.",
    actionLabel: "Accéder",
    intro: "Prioriser quand temps, budget ou soutien sont limités.",
    scenario:
      "Tu as 2 semaines pour livrer: on te demande qualité, vitesse, et documentation complète.",
    question: "Quelle approche est la plus professionnelle?",
    options: [
      {
        label: "Négocier un triangle: livrable minimum + critères + compromis assumés.",
        explanation: "Tu rends la contrainte explicite et tu protèges la qualité essentielle.",
      },
      {
        label: "Tout faire à 100% sans discuter.",
        explanation: "Risque: burnout + résultat incohérent.",
      },
      {
        label: "Choisir au hasard ce qui semble urgent.",
        explanation: "Tu perds la logique du livrable et la lisibilité.",
      },
    ],
    correctIndex: 0,
    advice:
      "Écris 3 priorités max, un livrable minimum, et valide les compromis par écrit.",
  },
];
