import { Programme, Session, Participant, Event, Payment } from '../types/trainer';
// Notify admin panel
import { addAdminNotificationWithBroadcast as addAdminNotification } from '../../admin-panel/src/data/adminNotifications';

const STORAGE_KEYS = {
  PROGRAMMES: 'trainer_programmes',
  SESSIONS: 'trainer_sessions',
  PARTICIPANTS: 'trainer_participants',
  EVENTS: 'trainer_events',
  PAYMENTS: 'trainer_payments'
};

// Programmes Management
export const getProgrammes = (): Programme[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PROGRAMMES);
  return data ? JSON.parse(data) : [];
};

export const saveProgrammes = (programmes: Programme[]): void => {
  localStorage.setItem(STORAGE_KEYS.PROGRAMMES, JSON.stringify(programmes));
};

export const addProgramme = (programme: Programme): void => {
  const programmes = getProgrammes();
  programmes.push(programme);
  saveProgrammes(programmes);
  // Admin notification
  addAdminNotification({
    title: 'Nouveau programme',
    message: `Programme ajouté: "${programme.title}" (${programme.category})`,
    type: 'info',
    actionUrl: '/programs',
    payload: {
      event: 'trainer_programme_added',
      programmeId: programme.id,
      title: programme.title,
      price: programme.price,
      status: programme.status,
    },
  });
};

export const updateProgramme = (id: string, updates: Partial<Programme>): void => {
  const programmes = getProgrammes();
  const index = programmes.findIndex(p => p.id === id);
  if (index !== -1) {
    programmes[index] = { ...programmes[index], ...updates };
    saveProgrammes(programmes);
    addAdminNotification({
      title: 'Programme modifié',
      message: `Programme mis à jour: "${programmes[index].title}"`,
      type: 'info',
      actionUrl: '/programs',
      payload: { event: 'trainer_programme_updated', programmeId: id, updates },
    });
  }
};

export const deleteProgramme = (id: string): void => {
  const all = getProgrammes();
  const removed = all.find(p => p.id === id);
  const programmes = all.filter(p => p.id !== id);
  saveProgrammes(programmes);
  addAdminNotification({
    title: 'Programme supprimé',
    message: `Programme supprimé: "${removed?.title ?? id}"`,
    type: 'info',
    actionUrl: '/programmes',
    payload: { event: 'trainer_programme_deleted', programmeId: id },
  });
};

// Sessions Management
export const getSessions = (): Session[] => {
  const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
  return data ? JSON.parse(data) : [];
};

export const saveSessions = (sessions: Session[]): void => {
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
};

export const addSession = (session: Session): void => {
  const sessions = getSessions();
  sessions.push(session);
  saveSessions(sessions);
  addAdminNotification({
    title: 'Nouvelle session',
    message: `Session ajoutée: "${session.title}" (${session.type})`,
    type: 'info',
    actionUrl: '/programs',
    payload: {
      event: 'trainer_session_added',
      sessionId: session.id,
      programmeId: session.programmeId,
      title: session.title,
      date: session.date,
    },
  });
};

export const updateSession = (id: string, updates: Partial<Session>): void => {
  const sessions = getSessions();
  const index = sessions.findIndex(s => s.id === id);
  if (index !== -1) {
    sessions[index] = { ...sessions[index], ...updates };
    saveSessions(sessions);
    addAdminNotification({
      title: 'Session modifiée',
      message: `Session mise à jour: "${sessions[index].title}"`,
      type: 'info',
      actionUrl: '/programs',
      payload: { event: 'trainer_session_updated', sessionId: id, updates },
    });
  }
};

export const deleteSession = (id: string): void => {
  const all = getSessions();
  const removed = all.find(s => s.id === id);
  const sessions = all.filter(s => s.id !== id);
  saveSessions(sessions);
  addAdminNotification({
    title: 'Session supprimée',
    message: `Session supprimée: "${removed?.title ?? id}"`,
    type: 'info',
    actionUrl: '/sessions',
    payload: { event: 'trainer_session_deleted', sessionId: id },
  });
};

// Participants Management
export const getParticipants = (): Participant[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
  return data ? JSON.parse(data) : [];
};

export const saveParticipants = (participants: Participant[]): void => {
  localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
};

export const addParticipant = (participant: Participant): void => {
  const participants = getParticipants();
  participants.push(participant);
  saveParticipants(participants);
  addAdminNotification({
    title: 'Nouveau participant',
    message: `Participant ajouté: ${participant.firstName} ${participant.lastName}`,
    type: 'info',
    actionUrl: '/participants',
    payload: {
      event: 'trainer_participant_added',
      participantId: participant.id,
      programmeId: participant.programmeId,
      status: participant.status,
      paymentStatus: participant.paymentStatus,
      amountPaid: participant.amountPaid,
    },
  });
  
  // Auto-create payment record if paid
  if (participant.paymentStatus === 'Payant' && participant.amountPaid > 0) {
    const payment: Payment = {
      id: `payment_${Date.now()}`,
      participantId: participant.id,
      programmeId: participant.programmeId,
      amount: participant.amountPaid,
      commission: participant.commission,
      paymentDate: new Date().toISOString(),
      method: 'Carte',
      status: 'Payé'
    };
    addPayment(payment);
  }
};

export const updateParticipant = (id: string, updates: Partial<Participant>): void => {
  const participants = getParticipants();
  const index = participants.findIndex(p => p.id === id);
  if (index !== -1) {
    participants[index] = { ...participants[index], ...updates };
    saveParticipants(participants);
    addAdminNotification({
      title: 'Participant modifié',
      message: `Participant mis à jour: ${participants[index].firstName} ${participants[index].lastName}`,
      type: 'info',
      actionUrl: '/participants',
      payload: { event: 'trainer_participant_updated', participantId: id, updates },
    });
  }
};

export const deleteParticipant = (id: string): void => {
  const all = getParticipants();
  const removed = all.find(p => p.id === id);
  const participants = all.filter(p => p.id !== id);
  saveParticipants(participants);
  addAdminNotification({
    title: 'Participant supprimé',
    message: `Participant supprimé: ${removed ? removed.firstName + ' ' + removed.lastName : id}`,
    type: 'info',
    actionUrl: '/participants',
    payload: { event: 'trainer_participant_deleted', participantId: id },
  });
};

// Events Management
export const getEvents = (): Event[] => {
  const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
  return data ? JSON.parse(data) : [];
};

export const saveEvents = (events: Event[]): void => {
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
};

export const addEvent = (event: Event): void => {
  const events = getEvents();
  events.push(event);
  saveEvents(events);
  addAdminNotification({
    title: 'Nouvel évènement',
    message: `Évènement ajouté: "${event.title}" (${event.type})`,
    type: 'info',
    actionUrl: '/events',
    payload: {
      event: 'trainer_event_added',
      eventId: event.id,
      title: event.title,
      date: event.date,
      price: event.price,
    },
  });
};

export const updateEvent = (id: string, updates: Partial<Event>): void => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === id);
  if (index !== -1) {
    events[index] = { ...events[index], ...updates };
    saveEvents(events);
    addAdminNotification({
      title: 'Évènement modifié',
      message: `Évènement mis à jour: "${events[index].title}"`,
      type: 'info',
      actionUrl: '/events',
      payload: { event: 'trainer_event_updated', eventId: id, updates },
    });
  }
};

export const deleteEvent = (id: string): void => {
  const all = getEvents();
  const removed = all.find(e => e.id === id);
  const events = all.filter(e => e.id !== id);
  saveEvents(events);
  addAdminNotification({
    title: 'Évènement supprimé',
    message: `Évènement supprimé: "${removed?.title ?? id}"`,
    type: 'info',
    actionUrl: '/events',
    payload: { event: 'trainer_event_deleted', eventId: id },
  });
};

// Payments Management
export const getPayments = (): Payment[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
  return data ? JSON.parse(data) : [];
};

export const savePayments = (payments: Payment[]): void => {
  localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
};

export const addPayment = (payment: Payment): void => {
  const payments = getPayments();
  payments.push(payment);
  savePayments(payments);
  addAdminNotification({
    title: 'Paiement enregistré',
    message: `Paiement reçu: ${payment.amount.toLocaleString()} €`,
    type: 'info',
    actionUrl: '/finance',
    payload: {
      event: 'trainer_payment_added',
      paymentId: payment.id,
      participantId: payment.participantId,
      programmeId: payment.programmeId,
      amount: payment.amount,
      commission: payment.commission,
      status: payment.status,
      method: payment.method,
    },
  });
};

export const updatePayment = (id: string, updates: Partial<Payment>): void => {
  const payments = getPayments();
  const index = payments.findIndex(p => p.id === id);
  if (index !== -1) {
    payments[index] = { ...payments[index], ...updates };
    savePayments(payments);
    addAdminNotification({
      title: 'Paiement modifié',
      message: `Paiement mis à jour: ${payments[index].amount.toLocaleString()} €`,
      type: 'info',
      actionUrl: '/finance',
      payload: { event: 'trainer_payment_updated', paymentId: id, updates },
    });
  }
};

export const deletePayment = (id: string): void => {
  const all = getPayments();
  const removed = all.find(p => p.id === id);
  const payments = all.filter(p => p.id !== id);
  savePayments(payments);
  addAdminNotification({
    title: 'Paiement supprimé',
    message: `Paiement supprimé: ${removed ? removed.amount.toLocaleString() + ' €' : id}`,
    type: 'info',
    actionUrl: '/payments',
    payload: { event: 'trainer_payment_deleted', paymentId: id },
  });
};

// Utility functions
export const calculateCommission = (amount: number): number => {
  return amount * 0.25; // 25% commission
};

export const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Initialize with sample data if empty
export const initializeSampleData = (): void => {
  if (getProgrammes().length === 0) {
    const sampleProgrammes: Programme[] = [
      {
        id: generateId('prog'),
        title: 'Marketing Digital Avancé',
        description: 'Formation complète en marketing digital et stratégies numériques',
        startDate: '2024-02-01',
        endDate: '2024-04-30',
        category: 'Marketing',
        maxParticipants: 25,
        price: 1500,
        status: 'Actif',
        createdAt: new Date().toISOString()
      },
      {
        id: generateId('prog'),
        title: 'Développement Web Full Stack',
        description: 'Apprenez React, Node.js et MongoDB pour devenir développeur full stack',
        startDate: '2024-03-01',
        endDate: '2024-06-30',
        category: 'Développement',
        maxParticipants: 20,
        price: 2000,
        status: 'Actif',
        createdAt: new Date().toISOString()
      }
    ];
    saveProgrammes(sampleProgrammes);
  }
};
