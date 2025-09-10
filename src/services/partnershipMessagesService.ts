// Service de gestion des messages et communications de partenariat
// Utilise localStorage pour la persistance des données

export interface Message {
  id: string;
  sender: "Moi" | "Siteen" | string;
  timestamp: string;
  content: string;
  attachments?: { id: string; name: string; url: string }[];
  type: "message" | "notification" | "support";
  isRead?: boolean;
  priority?: "low" | "normal" | "high";
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high";
  createdAt: string;
  updatedAt: string;
  attachments?: { id: string; name: string; url: string }[];
}

const STORAGE_KEY = 'messagesPartenariat';
const SUPPORT_STORAGE_KEY = 'supportPartenariat';

// Génération des données mock réalistes
const generateMockMessages = (): Message[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return [
    // Messages de bienvenue
    {
      id: 'msg-001',
      sender: 'Siteen',
      timestamp: weekAgo.toISOString(),
      content: 'Bienvenue dans votre espace partenariat ! Nous sommes ravis de collaborer avec vous. N\'hésitez pas à nous contacter pour toute question.',
      type: 'message',
      isRead: true,
      priority: 'normal'
    },
    {
      id: 'msg-002',
      sender: 'Moi',
      timestamp: weekAgo.toISOString(),
      content: 'Merci pour l\'accueil ! J\'ai hâte de commencer notre collaboration. Pouvez-vous me donner plus d\'informations sur le processus de démarrage ?',
      type: 'message',
      isRead: true,
      priority: 'normal'
    },
    
    // Notifications importantes
    {
      id: 'notif-001',
      sender: 'Siteen',
      timestamp: twoDaysAgo.toISOString(),
      content: 'Votre projet ERP a été mis à jour. Les nouvelles fonctionnalités sont maintenant disponibles dans votre tableau de bord.',
      type: 'notification',
      isRead: false,
      priority: 'high',
      attachments: [
        { id: 'att-001', name: 'Mise-à-jour-ERP-v2.1.pdf', url: '/attachments/erp-update.pdf' }
      ]
    },
    {
      id: 'notif-002',
      sender: 'Siteen',
      timestamp: yesterday.toISOString(),
      content: 'Rappel : Réunion de suivi prévue demain à 14h00. Lien de connexion envoyé par email.',
      type: 'notification',
      isRead: false,
      priority: 'normal'
    },

    // Messages récents
    {
      id: 'msg-003',
      sender: 'Siteen',
      timestamp: yesterday.toISOString(),
      content: 'Bonjour ! J\'espère que tout se passe bien de votre côté. Avez-vous eu l\'occasion de tester les nouvelles fonctionnalités ?',
      type: 'message',
      isRead: true,
      priority: 'normal'
    },
    {
      id: 'msg-004',
      sender: 'Moi',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      content: 'Oui, j\'ai testé et c\'est très impressionnant ! J\'aurais quelques questions sur l\'intégration avec nos systèmes existants.',
      type: 'message',
      isRead: true,
      priority: 'normal'
    },

    // Support technique
    {
      id: 'support-001',
      sender: 'Siteen',
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      content: 'Votre demande de support technique a été reçue par notre équipe. Un technicien vous contactera dans les 24h.',
      type: 'support',
      isRead: false,
      priority: 'high'
    }
  ];
};

const generateMockSupportTickets = (): SupportTicket[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  return [
    {
      id: 'ticket-001',
      subject: 'Problème de connexion API',
      description: 'Impossible de se connecter à l\'API depuis ce matin. Erreur 500 récurrente.',
      status: 'in_progress',
      priority: 'high',
      createdAt: yesterday.toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      attachments: [
        { id: 'att-support-001', name: 'error-log.txt', url: '/attachments/error-log.txt' }
      ]
    },
    {
      id: 'ticket-002',
      subject: 'Demande de formation',
      description: 'Souhaitons organiser une formation pour notre équipe sur les nouvelles fonctionnalités.',
      status: 'open',
      priority: 'normal',
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
};

// Fonctions de gestion du localStorage
const saveMessages = (messages: Message[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
};

const saveSupportTickets = (tickets: SupportTicket[]): void => {
  localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(tickets));
};

// Fonctions principales d'accès aux données
export const getMessages = (): Message[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const mockMessages = generateMockMessages();
      saveMessages(mockMessages);
      return mockMessages;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Erreur lors du chargement des messages:', error);
    const mockMessages = generateMockMessages();
    saveMessages(mockMessages);
    return mockMessages;
  }
};

export const getSupportTickets = (): SupportTicket[] => {
  try {
    const stored = localStorage.getItem(SUPPORT_STORAGE_KEY);
    if (!stored) {
      const mockTickets = generateMockSupportTickets();
      saveSupportTickets(mockTickets);
      return mockTickets;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Erreur lors du chargement des tickets:', error);
    const mockTickets = generateMockSupportTickets();
    saveSupportTickets(mockTickets);
    return mockTickets;
  }
};

// Fonctions CRUD pour les messages
export const addMessage = (content: string, attachments?: { id: string; name: string; url: string }[]): Message => {
  const messages = getMessages();
  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    sender: 'Moi',
    timestamp: new Date().toISOString(),
    content,
    type: 'message',
    isRead: true,
    priority: 'normal',
    attachments
  };
  
  messages.push(newMessage);
  saveMessages(messages);
  
  // Simuler une réponse automatique de Siteen après 2-5 secondes
  setTimeout(() => {
    const updatedMessages = getMessages();
    const autoReply: Message = {
      id: `msg-${Date.now()}-auto`,
      sender: 'Siteen',
      timestamp: new Date().toISOString(),
      content: 'Merci pour votre message ! Notre équipe va examiner votre demande et vous répondra rapidement.',
      type: 'message',
      isRead: false,
      priority: 'normal'
    };
    updatedMessages.push(autoReply);
    saveMessages(updatedMessages);
  }, Math.random() * 3000 + 2000);
  
  return newMessage;
};

export const markMessageAsRead = (messageId: string): boolean => {
  const messages = getMessages();
  const messageIndex = messages.findIndex(m => m.id === messageId);
  
  if (messageIndex !== -1) {
    messages[messageIndex].isRead = true;
    saveMessages(messages);
    return true;
  }
  
  return false;
};

export const markAllMessagesAsRead = (): void => {
  const messages = getMessages();
  const updatedMessages = messages.map(m => ({ ...m, isRead: true }));
  saveMessages(updatedMessages);
};

// Fonctions pour les tickets de support
export const createSupportTicket = (
  subject: string, 
  description: string, 
  priority: "low" | "normal" | "high" = "normal",
  attachments?: { id: string; name: string; url: string }[]
): SupportTicket => {
  const tickets = getSupportTickets();
  const messages = getMessages();
  
  const newTicket: SupportTicket = {
    id: `ticket-${Date.now()}`,
    subject,
    description,
    status: 'open',
    priority,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attachments
  };
  
  tickets.push(newTicket);
  saveSupportTickets(tickets);
  
  // Ajouter un message de confirmation
  const confirmationMessage: Message = {
    id: `support-${Date.now()}`,
    sender: 'Siteen',
    timestamp: new Date().toISOString(),
    content: `Votre demande de support "${subject}" a été créée avec succès. Numéro de ticket: ${newTicket.id}. Notre équipe technique vous contactera sous 24h.`,
    type: 'support',
    isRead: false,
    priority: 'high'
  };
  
  messages.push(confirmationMessage);
  saveMessages(messages);
  
  return newTicket;
};

// Fonctions de filtrage et statistiques
export const getMessagesByType = (type: "message" | "notification" | "support"): Message[] => {
  return getMessages().filter(m => m.type === type);
};

export const getUnreadMessages = (): Message[] => {
  return getMessages().filter(m => !m.isRead);
};

export const getMessagesByDateRange = (startDate: string, endDate: string): Message[] => {
  const messages = getMessages();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return messages.filter(m => {
    const messageDate = new Date(m.timestamp);
    return messageDate >= start && messageDate <= end;
  });
};

export const getMessagesStats = () => {
  const messages = getMessages();
  const tickets = getSupportTickets();
  
  const totalMessages = messages.length;
  const unreadMessages = messages.filter(m => !m.isRead).length;
  const messagesByType = {
    message: messages.filter(m => m.type === 'message').length,
    notification: messages.filter(m => m.type === 'notification').length,
    support: messages.filter(m => m.type === 'support').length
  };
  
  const ticketsByStatus = {
    open: tickets.filter(t => t.status === 'open').length,
    in_progress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    closed: tickets.filter(t => t.status === 'closed').length
  };
  
  return {
    totalMessages,
    unreadMessages,
    messagesByType,
    totalTickets: tickets.length,
    ticketsByStatus
  };
};

// Fonction de recherche
export const searchMessages = (query: string): Message[] => {
  const messages = getMessages();
  const lowercaseQuery = query.toLowerCase();
  
  return messages.filter(m => 
    m.content.toLowerCase().includes(lowercaseQuery) ||
    m.sender.toLowerCase().includes(lowercaseQuery)
  );
};

// Suppression en lot par type de message (ex: vider le chat)
export const deleteMessagesByType = (type: 'message' | 'notification' | 'support'): boolean => {
  const messages = getMessages();
  const next = messages.filter(m => m.type !== type);
  if (next.length === messages.length) return false;
  saveMessages(next);
  return true;
};

// Mise à jour d'un message
export const updateMessage = (messageId: string, updates: Partial<Omit<Message, 'id' | 'timestamp'>>): boolean => {
  const messages = getMessages();
  const index = messages.findIndex(m => m.id === messageId);
  if (index === -1) return false;
  messages[index] = { ...messages[index], ...updates };
  saveMessages(messages);
  return true;
};

// Suppression d'un message
export const deleteMessage = (messageId: string): boolean => {
  const messages = getMessages();
  const next = messages.filter(m => m.id !== messageId);
  if (next.length === messages.length) return false;
  saveMessages(next);
  return true;
};

// Mise à jour d'un ticket de support
export const updateSupportTicket = (
  ticketId: string,
  updates: Partial<Omit<SupportTicket, 'id' | 'createdAt'>>
): boolean => {
  const tickets = getSupportTickets();
  const idx = tickets.findIndex(t => t.id === ticketId);
  if (idx === -1) return false;
  tickets[idx] = { ...tickets[idx], ...updates, updatedAt: new Date().toISOString() };
  saveSupportTickets(tickets);
  return true;
};

// Suppression d'un ticket de support
export const deleteSupportTicket = (ticketId: string): boolean => {
  const tickets = getSupportTickets();
  const next = tickets.filter(t => t.id !== ticketId);
  if (next.length === tickets.length) return false;
  saveSupportTickets(next);
  return true;
};
