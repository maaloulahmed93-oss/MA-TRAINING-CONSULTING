// Service de communication email pour l'Espace Partenariat
import { ExtendedProject } from './partnershipProjectsService';

// Configuration EmailJS (à remplacer par vos vraies clés)
const EMAILJS_CONFIG = {
  serviceId: 'service_partnership',
  templateId: 'template_project_contact',
  publicKey: 'your_public_key_here'
};

// Types pour les emails
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  template: string;
  variables: string[];
}

export interface EmailData {
  to: string;
  cc?: string;
  subject: string;
  message: string;
  projectId?: string;
  projectTitle?: string;
  senderName: string;
  senderEmail: string;
  priority: 'low' | 'normal' | 'high';
  attachments?: string[];
}

// Templates d'emails prédéfinis
export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'project_contact',
    name: 'Contact Équipe Projet',
    subject: 'Contact concernant le projet {{projectTitle}}',
    template: `Bonjour,

Je vous contacte concernant le projet "{{projectTitle}}".

{{message}}

Cordialement,
{{senderName}}
{{senderEmail}}`,
    variables: ['projectTitle', 'message', 'senderName', 'senderEmail']
  },
  {
    id: 'document_request',
    name: 'Demande de Document',
    subject: 'Demande de documents - {{projectTitle}}',
    template: `Bonjour,

Je souhaiterais obtenir des documents supplémentaires concernant le projet "{{projectTitle}}".

Documents demandés :
{{message}}

Merci d'avance pour votre retour.

Cordialement,
{{senderName}}
{{senderEmail}}`,
    variables: ['projectTitle', 'message', 'senderName', 'senderEmail']
  },
  {
    id: 'milestone_update',
    name: 'Mise à jour Jalons',
    subject: 'Mise à jour des jalons - {{projectTitle}}',
    template: `Bonjour,

Je vous informe d'une mise à jour concernant les jalons du projet "{{projectTitle}}".

Détails :
{{message}}

N'hésitez pas à me contacter pour toute question.

Cordialement,
{{senderName}}
{{senderEmail}}`,
    variables: ['projectTitle', 'message', 'senderName', 'senderEmail']
  },
  {
    id: 'meeting_request',
    name: 'Demande de Réunion',
    subject: 'Demande de réunion - {{projectTitle}}',
    template: `Bonjour,

Je souhaiterais organiser une réunion concernant le projet "{{projectTitle}}".

Objet de la réunion :
{{message}}

Merci de me faire savoir vos disponibilités.

Cordialement,
{{senderName}}
{{senderEmail}}`,
    variables: ['projectTitle', 'message', 'senderName', 'senderEmail']
  },
  {
    id: 'project_update',
    name: 'Mise à jour Projet',
    subject: 'Mise à jour du projet {{projectTitle}}',
    template: `Bonjour,

Voici une mise à jour concernant l'avancement du projet "{{projectTitle}}".

{{message}}

Je reste à votre disposition pour toute question.

Cordialement,
{{senderName}}
{{senderEmail}}`,
    variables: ['projectTitle', 'message', 'senderName', 'senderEmail']
  }
];

// Fonction pour remplacer les variables dans un template
export const replaceTemplateVariables = (template: string, variables: Record<string, string>): string => {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
};

// Fonction pour générer un email à partir d'un template
export const generateEmailFromTemplate = (
  templateId: string,
  variables: Record<string, string>
): { subject: string; message: string } => {
  const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
  if (!template) {
    throw new Error(`Template ${templateId} not found`);
  }

  return {
    subject: replaceTemplateVariables(template.subject, variables),
    message: replaceTemplateVariables(template.template, variables)
  };
};

// Fonction pour envoyer un email via EmailJS (simulation)
export const sendEmailViaEmailJS = async (emailData: EmailData): Promise<boolean> => {
  try {
    console.log('📧 Envoi d\'email via EmailJS...');
    console.log('Configuration:', EMAILJS_CONFIG);
    console.log('Données email:', emailData);

    // Simulation d'envoi avec délai
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulation de succès/échec (90% de succès)
    const success = Math.random() > 0.1;

    if (success) {
      console.log('✅ Email envoyé avec succès !');
      
      // Sauvegarder l'email dans l'historique
      saveEmailToHistory(emailData);
      
      return true;
    } else {
      console.log('❌ Échec de l\'envoi de l\'email');
      return false;
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
};

// Fonction pour générer un lien mailto amélioré
export const generateAdvancedMailtoLink = (emailData: EmailData): string => {
  const params = new URLSearchParams();
  
  if (emailData.cc) {
    params.append('cc', emailData.cc);
  }
  
  params.append('subject', emailData.subject);
  params.append('body', emailData.message);

  return `mailto:${emailData.to}?${params.toString()}`;
};

// Fonction pour sauvegarder l'historique des emails
export const saveEmailToHistory = (emailData: EmailData): void => {
  try {
    const history = getEmailHistory();
    const emailRecord = {
      id: `EMAIL_${Date.now()}`,
      ...emailData,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    history.unshift(emailRecord);
    
    // Garder seulement les 50 derniers emails
    const limitedHistory = history.slice(0, 50);
    
    localStorage.setItem('partnership_email_history', JSON.stringify(limitedHistory));
    console.log('📝 Email sauvegardé dans l\'historique');
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'email:', error);
  }
};

// Fonction pour récupérer l'historique des emails
export const getEmailHistory = (): any[] => {
  try {
    const history = localStorage.getItem('partnership_email_history');
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    return [];
  }
};

// Fonction pour générer un email de contact pour un projet
export const generateProjectContactEmail = (
  project: ExtendedProject,
  partnerName: string,
  message: string,
  senderName: string,
  senderEmail: string,
  templateId: string = 'project_contact'
): EmailData => {
  const variables = {
    projectTitle: project.title,
    message: message,
    senderName: senderName,
    senderEmail: senderEmail,
    partnerName: partnerName
  };

  const { subject, message: emailMessage } = generateEmailFromTemplate(templateId, variables);

  return {
    to: project.contactEmail || 'contact@partenariat.com',
    subject: subject,
    message: emailMessage,
    projectId: project.id,
    projectTitle: project.title,
    senderName: senderName,
    senderEmail: senderEmail,
    priority: 'normal'
  };
};

// Fonction pour envoyer une notification de document
export const sendDocumentNotification = async (
  project: ExtendedProject,
  documentName: string,
  action: 'added' | 'updated' | 'deleted',
  senderName: string
): Promise<boolean> => {
  const emailData: EmailData = {
    to: project.contactEmail || 'contact@partenariat.com',
    subject: `Document ${action === 'added' ? 'ajouté' : action === 'updated' ? 'mis à jour' : 'supprimé'} - ${project.title}`,
    message: `Bonjour,

Un document a été ${action === 'added' ? 'ajouté au' : action === 'updated' ? 'mis à jour dans le' : 'supprimé du'} projet "${project.title}".

Document concerné : ${documentName}
Action effectuée par : ${senderName}
Date : ${new Date().toLocaleDateString('fr-FR')}

Vous pouvez consulter les documents du projet dans votre espace partenariat.

Cordialement,
L'équipe Partenariat`,
    projectId: project.id,
    projectTitle: project.title,
    senderName: senderName,
    senderEmail: 'noreply@partenariat.com',
    priority: 'low'
  };

  return await sendEmailViaEmailJS(emailData);
};

// Fonction pour valider une adresse email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Fonction pour formater un email pour l'affichage
export const formatEmailForDisplay = (email: any): string => {
  return `
De: ${email.senderName} <${email.senderEmail}>
À: ${email.to}
${email.cc ? `Cc: ${email.cc}` : ''}
Sujet: ${email.subject}
Date: ${new Date(email.timestamp).toLocaleString('fr-FR')}
Priorité: ${email.priority}

${email.message}
  `.trim();
};

// Statistiques des emails
export const getEmailStats = (): {
  total: number;
  sent: number;
  failed: number;
  thisMonth: number;
} => {
  const history = getEmailHistory();
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  return {
    total: history.length,
    sent: history.filter(email => email.status === 'sent').length,
    failed: history.filter(email => email.status === 'failed').length,
    thisMonth: history.filter(email => {
      const emailDate = new Date(email.timestamp);
      return emailDate.getMonth() === thisMonth && emailDate.getFullYear() === thisYear;
    }).length
  };
};
