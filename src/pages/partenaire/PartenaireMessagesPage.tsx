import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MessageSquare, Bell, HelpCircle, History, Send, Paperclip,
  Bot, CheckCircle, Plus, FileText, Search, Pencil, Trash2, Check, X
} from 'lucide-react';
import {
  getMessages, addMessage, markMessageAsRead, markAllMessagesAsRead,
  createSupportTicket, getSupportTickets, getUnreadMessages, getMessagesStats,
  updateMessage, deleteMessage, updateSupportTicket, deleteSupportTicket, deleteMessagesByType,
  Message, SupportTicket
} from '../../services/partnershipMessagesService';

type ViewType = 'chat' | 'notifications' | 'support' | 'history';

const PartenaireMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentView, setCurrentView] = useState<ViewType>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  // Edition
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [messageDraft, setMessageDraft] = useState<{ content: string; priority?: 'low' | 'normal' | 'high' }>({ content: '' });
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [ticketDraft, setTicketDraft] = useState<{
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'normal' | 'high';
  }>({ subject: '', description: '', status: 'open', priority: 'normal' });
  
  // États pour le chat
  const [newMessage, setNewMessage] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<{ id: string; name: string; url: string }[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<{
    totalMessages: number;
    unreadMessages: number;
    messagesByType: {
      message: number;
      notification: number;
      support: number;
    };
    totalTickets: number;
    ticketsByStatus: {
      open: number;
      in_progress: number;
      resolved: number;
      closed: number;
    };
  } | null>(null);

  // États pour le support
  const [supportForm, setSupportForm] = useState({
    subject: '',
    description: '',
    priority: 'normal' as 'low' | 'normal' | 'high'
  });
  const [showSupportForm, setShowSupportForm] = useState(false);

  // Chargement initial des données
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🚀 Chargement des messages et données...');
        
        const allMessages = getMessages();
        const tickets = getSupportTickets();
        const unread = getUnreadMessages();
        const statistics = getMessagesStats();
        
        setMessages(allMessages);
        setSupportTickets(tickets);
        setUnreadMessages(unread);
        setStats(statistics);
        
        console.log('📧 Messages chargés:', allMessages.length);
        console.log('🎫 Tickets chargés:', tickets.length);
        console.log('🔔 Messages non lus:', unread.length);
        
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Auto-scroll vers le bas du chat
  useEffect(() => {
    if (currentView === 'chat' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentView]);

  // Fonctions de gestion des messages

  // Gestion des pièces jointes (chat)
  const handleOpenFilePicker = () => fileInputRef.current?.click();
  const handleFilesSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newAtts = files.map((f) => ({ id: `att-${Date.now()}-${Math.random().toString(36).slice(2,8)}`, name: f.name, url: URL.createObjectURL(f) }));
    setPendingAttachments(prev => [...prev, ...newAtts]);
    // reset input to allow re-uploading same file name
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleRemovePendingAttachment = (id: string) => {
    setPendingAttachments(prev => {
      const att = prev.find(a => a.id === id);
      if (att) URL.revokeObjectURL(att.url);
      return prev.filter(a => a.id !== id);
    });
  };
  const handleSendMessage = () => {
    if (!newMessage.trim() && pendingAttachments.length === 0) return;
    
    try {
      const message = addMessage(newMessage.trim(), pendingAttachments);
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      // Revoke object URLs and clear attachments
      pendingAttachments.forEach(att => URL.revokeObjectURL(att.url));
      setPendingAttachments([]);
      
      // Recharger les messages après un délai pour capturer la réponse auto
      setTimeout(() => {
        const updatedMessages = getMessages();
        setMessages(updatedMessages);
        setUnreadMessages(getUnreadMessages());
        setStats(getMessagesStats());
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
    }
  };

  const handleMarkAsRead = (messageId: string) => {
    markMessageAsRead(messageId);
    setMessages(getMessages());
    setUnreadMessages(getUnreadMessages());
    setStats(getMessagesStats());
  };

  const handleMarkAllAsRead = () => {
    markAllMessagesAsRead();
    setMessages(getMessages());
    setUnreadMessages([]);
    setStats(getMessagesStats());
  };

  // Supprimer toute la discussion (messages de type 'message')
  const handleClearChat = () => {
    if (!confirm('Supprimer toute la discussion ? Cette action est irréversible.')) return;
    deleteMessagesByType('message');
    setMessages(getMessages());
    setUnreadMessages(getUnreadMessages());
    setStats(getMessagesStats());
  };

  // Edition/Suppression Messages
  const handleStartEditMessage = (m: Message) => {
    setEditingMessageId(m.id);
    setMessageDraft({ content: m.content, priority: m.priority });
  };
  const handleCancelEditMessage = () => {
    setEditingMessageId(null);
    setMessageDraft({ content: '' });
  };
  const handleSaveEditMessage = () => {
    if (!editingMessageId) return;
    updateMessage(editingMessageId, { content: messageDraft.content, priority: messageDraft.priority });
    setMessages(getMessages());
    setUnreadMessages(getUnreadMessages());
    setStats(getMessagesStats());
    handleCancelEditMessage();
  };
  const handleDeleteMessage = (id: string) => {
    if (!confirm('Supprimer ce message ?')) return;
    deleteMessage(id);
    setMessages(getMessages());
    setUnreadMessages(getUnreadMessages());
    setStats(getMessagesStats());
  };

  // Edition/Suppression Tickets
  const handleStartEditTicket = (t: SupportTicket) => {
    setEditingTicketId(t.id);
    setTicketDraft({ subject: t.subject, description: t.description, status: t.status, priority: t.priority });
  };
  const handleCancelEditTicket = () => {
    setEditingTicketId(null);
    setTicketDraft({ subject: '', description: '', status: 'open', priority: 'normal' });
  };
  const handleSaveEditTicket = () => {
    if (!editingTicketId) return;
    updateSupportTicket(editingTicketId, { ...ticketDraft });
    setSupportTickets(getSupportTickets());
    handleCancelEditTicket();
  };
  const handleDeleteTicket = (id: string) => {
    if (!confirm('Supprimer ce ticket ?')) return;
    deleteSupportTicket(id);
    setSupportTickets(getSupportTickets());
  };

  // Fonctions de gestion du support
  const handleCreateSupportTicket = () => {
    if (!supportForm.subject.trim() || !supportForm.description.trim()) return;
    
    try {
      const ticket = createSupportTicket(
        supportForm.subject,
        supportForm.description,
        supportForm.priority
      );
      
      setSupportTickets(prev => [...prev, ticket]);
      setSupportForm({ subject: '', description: '', priority: 'normal' });
      setShowSupportForm(false);
      
      // Recharger les messages pour voir la confirmation
      setTimeout(() => {
        setMessages(getMessages());
        setUnreadMessages(getUnreadMessages());
        setStats(getMessagesStats());
      }, 500);
    } catch (error) {
      console.error('Erreur lors de la création du ticket:', error);
    }
  };

  // Fonction utilitaire pour formater les dates
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'À l\'instant';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'normal': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/espace-partenariat')}
                className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Espace Partenariat</span>
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-6 h-6 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  Messages & Communication
                </h1>
              </div>
            </div>
            
            {/* Statistiques rapides */}
            {stats && (
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">{stats.totalMessages}</span>
                </div>
                {stats.unreadMessages > 0 && (
                  <div className="flex items-center space-x-1">
                    <Bell className="w-4 h-4 text-red-500" />
                    <span className="text-red-600 font-medium">{stats.unreadMessages}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <HelpCircle className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">{stats.totalTickets}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h3>
              <nav className="space-y-2">
                {[
                  { id: 'chat', label: 'Chat Direct', icon: MessageSquare, count: stats?.messagesByType.message },
                  { id: 'notifications', label: 'Notifications', icon: Bell, count: stats?.messagesByType.notification },
                  { id: 'support', label: 'Support', icon: HelpCircle, count: stats?.totalTickets },
                  { id: 'history', label: 'Historique', icon: History, count: stats?.totalMessages }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id as ViewType)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                      currentView === item.id
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {(item.count ?? 0) > 0 && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        currentView === item.id ? 'bg-purple-200 text-purple-800' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {item.count ?? 0}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
              
              {unreadMessages.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleMarkAllAsRead}
                    className="w-full flex items-center justify-center space-x-2 p-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Tout marquer comme lu</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {/* Vue Chat */}
              {currentView === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-lg h-[600px] flex flex-col"
                >
                  {/* Header du chat */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Équipe Siteen</h3>
                          <p className="text-sm text-gray-500">En ligne</p>
                        </div>
                      </div>
                      <button
                        onClick={handleClearChat}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                        aria-label="Supprimer la discussion"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Supprimer la discussion</span>
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {messages.filter(m => m.type === 'message').map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.sender === 'Moi' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                          message.sender === 'Moi'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          {message.content && <p className="text-sm">{message.content}</p>}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {message.attachments.map(att => (
                                <a key={att.id} href={att.url} download className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-white/20 rounded-full underline">
                                  <FileText className="w-3 h-3" /> {att.name}
                                </a>
                              ))}
                            </div>
                          )}
                          <p className={`text-xs mt-2 ${
                            message.sender === 'Moi' ? 'text-purple-200' : 'text-gray-500'
                          }`}>
                            {formatDate(message.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input de message */}
                  <div className="p-6 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <button onClick={handleOpenFilePicker} className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200" aria-label="Ajouter une pièce jointe">
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilesSelected} />
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Tapez votre message..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        />
                        {pendingAttachments.length > 0 && (
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            {pendingAttachments.map(att => (
                              <span key={att.id} className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                <FileText className="w-3 h-3" /> {att.name}
                                <button onClick={() => handleRemovePendingAttachment(att.id)} className="text-purple-600 hover:text-purple-800" aria-label={`Retirer ${att.name}`}>
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() && pendingAttachments.length === 0}
                        className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Vue Notifications */}
              {currentView === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Notifications</h3>
                    {unreadMessages.filter(m => m.type === 'notification').length > 0 && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">
                        {unreadMessages.filter(m => m.type === 'notification').length} non lues
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {messages.filter(m => m.type === 'notification').map((notification) => (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-lg border-l-4 ${
                          notification.isRead
                            ? 'bg-gray-50 border-gray-300'
                            : 'bg-blue-50 border-blue-500'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Bell className={`w-4 h-4 ${
                                notification.priority === 'high' ? 'text-red-500' : 'text-blue-500'
                              }`} />
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                getPriorityColor(notification.priority || 'normal')
                              }`}>
                                {notification.priority === 'high' ? 'Urgent' : 
                                 notification.priority === 'low' ? 'Info' : 'Normal'}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatDate(notification.timestamp)}
                              </span>
                            </div>
                            {editingMessageId === notification.id ? (
                              <div className="space-y-3">
                                <textarea
                                  value={messageDraft.content}
                                  onChange={(e) => setMessageDraft(s => ({ ...s, content: e.target.value }))}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <div className="flex items-center gap-3">
                                  <select
                                    value={messageDraft.priority || 'normal'}
                                    onChange={(e) => setMessageDraft(s => ({ ...s, priority: e.target.value as 'low' | 'normal' | 'high' }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                  >
                                    <option value="low">Basse</option>
                                    <option value="normal">Normale</option>
                                    <option value="high">Haute</option>
                                  </select>
                                  <button onClick={handleSaveEditMessage} className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-full hover:bg-green-700">
                                    <Check className="w-4 h-4" /> Sauvegarder
                                  </button>
                                  <button onClick={handleCancelEditMessage} className="inline-flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border rounded-full hover:bg-gray-50">
                                    <X className="w-4 h-4" /> Annuler
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-900 mb-2">{notification.content}</p>
                            )}
                            {notification.attachments && notification.attachments.length > 0 && (
                              <div className="flex items-center space-x-2 mt-2">
                                <FileText className="w-4 h-4 text-gray-400" />
                                {notification.attachments.map((att) => (
                                  <button
                                    key={att.id}
                                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                                  >
                                    {att.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {!notification.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                                aria-label="Marquer comme lu"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}
                            {editingMessageId === notification.id ? null : (
                              <>
                                <button
                                  onClick={() => handleStartEditMessage(notification)}
                                  className="p-1 rounded-full bg-white text-gray-700 border hover:bg-gray-50"
                                  aria-label="Éditer"
                                >
                                  <Pencil className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(notification.id)}
                                  className="p-1 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                  aria-label="Supprimer"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {messages.filter(m => m.type === 'notification').length === 0 && (
                      <div className="text-center py-8">
                        <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Aucune notification pour le moment</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Vue Support */}
              {currentView === 'support' && (
                <motion.div
                  key="support"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Formulaire de création de ticket */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-900">Support Technique</h3>
                      <button
                        onClick={() => setShowSupportForm(!showSupportForm)}
                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Nouvelle demande</span>
                      </button>
                    </div>

                    <AnimatePresence>
                      {showSupportForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-6 p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sujet
                              </label>
                              <input
                                type="text"
                                value={supportForm.subject}
                                onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Décrivez brièvement votre problème"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                              </label>
                              <textarea
                                value={supportForm.description}
                                onChange={(e) => setSupportForm(prev => ({ ...prev, description: e.target.value }))}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                placeholder="Décrivez en détail votre problème ou votre demande"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Priorité
                              </label>
                              <select
                                value={supportForm.priority}
                                onChange={(e) => setSupportForm(prev => ({ ...prev, priority: e.target.value as 'low' | 'normal' | 'high' }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              >
                                <option value="low">Basse</option>
                                <option value="normal">Normale</option>
                                <option value="high">Haute</option>
                              </select>
                            </div>
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={handleCreateSupportTicket}
                                disabled={!supportForm.subject.trim() || !supportForm.description.trim()}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                              >
                                Créer le ticket
                              </button>
                              <button
                                onClick={() => setShowSupportForm(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Liste des tickets */}
                    <div className="space-y-4">
                      {supportTickets.map((ticket) => (
                        <div key={ticket.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            {editingTicketId === ticket.id ? (
                              <div className="flex-1 space-y-3">
                                <input
                                  type="text"
                                  value={ticketDraft.subject}
                                  onChange={(e) => setTicketDraft(s => ({ ...s, subject: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="Sujet"
                                />
                                <textarea
                                  value={ticketDraft.description}
                                  onChange={(e) => setTicketDraft(s => ({ ...s, description: e.target.value }))}
                                  rows={3}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  placeholder="Description"
                                />
                                <div className="flex items-center gap-3">
                                  <select
                                    value={ticketDraft.status}
                                    onChange={(e) => setTicketDraft(s => ({ ...s, status: e.target.value as 'open' | 'in_progress' | 'resolved' | 'closed' }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  >
                                    <option value="open">Ouvert</option>
                                    <option value="in_progress">En cours</option>
                                    <option value="resolved">Résolu</option>
                                    <option value="closed">Fermé</option>
                                  </select>
                                  <select
                                    value={ticketDraft.priority}
                                    onChange={(e) => setTicketDraft(s => ({ ...s, priority: e.target.value as 'low' | 'normal' | 'high' }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                  >
                                    <option value="low">Basse</option>
                                    <option value="normal">Normale</option>
                                    <option value="high">Haute</option>
                                  </select>
                                  <button onClick={handleSaveEditTicket} className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-full hover:bg-green-700">
                                    <Check className="w-4 h-4" /> Sauvegarder
                                  </button>
                                  <button onClick={handleCancelEditTicket} className="inline-flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border rounded-full hover:bg-gray-50">
                                    <X className="w-4 h-4" /> Annuler
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                                    ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                    ticket.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {ticket.status === 'open' ? 'Ouvert' :
                                     ticket.status === 'in_progress' ? 'En cours' :
                                     ticket.status === 'resolved' ? 'Résolu' : 'Fermé'}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    getPriorityColor(ticket.priority)
                                  }`}>
                                    {ticket.priority === 'high' ? 'Haute' :
                                     ticket.priority === 'low' ? 'Basse' : 'Normale'}
                                  </span>
                                  <button
                                    onClick={() => handleStartEditTicket(ticket)}
                                    className="p-1 rounded-full bg-white text-gray-700 border hover:bg-gray-50"
                                    aria-label="Éditer le ticket"
                                  >
                                    <Pencil className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTicket(ticket.id)}
                                    className="p-1 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                    aria-label="Supprimer le ticket"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                          {editingTicketId === ticket.id ? null : (
                            <>
                              <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>Créé le {formatDate(ticket.createdAt)}</span>
                                <span>#{ticket.id}</span>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      
                      {supportTickets.length === 0 && (
                        <div className="text-center py-8">
                          <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">Aucun ticket de support</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Vue Historique */}
              {currentView === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-lg p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Historique des Communications</h3>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Rechercher..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                      <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                        <option value="all">Tous les types</option>
                        <option value="message">Messages</option>
                        <option value="notification">Notifications</option>
                        <option value="support">Support</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.type === 'message' ? 'bg-blue-100' :
                              message.type === 'notification' ? 'bg-yellow-100' : 'bg-green-100'
                            }`}>
                              {message.type === 'message' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                              {message.type === 'notification' && <Bell className="w-4 h-4 text-yellow-600" />}
                              {message.type === 'support' && <HelpCircle className="w-4 h-4 text-green-600" />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{message.sender}</p>
                              <p className="text-sm text-gray-500">{formatDate(message.timestamp)}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            message.type === 'message' ? 'bg-blue-100 text-blue-800' :
                            message.type === 'notification' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {message.type === 'message' ? 'Message' :
                             message.type === 'notification' ? 'Notification' : 'Support'}
                          </span>
                        </div>
                        {editingMessageId === message.id ? (
                          <div className="ml-11 space-y-3">
                            <textarea
                              value={messageDraft.content}
                              onChange={(e) => setMessageDraft(s => ({ ...s, content: e.target.value }))}
                              rows={3}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                            <div className="flex items-center gap-3">
                              <button onClick={handleSaveEditMessage} className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-full hover:bg-green-700">
                                <Check className="w-4 h-4" /> Sauvegarder
                              </button>
                              <button onClick={handleCancelEditMessage} className="inline-flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border rounded-full hover:bg-gray-50">
                                <X className="w-4 h-4" /> Annuler
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="ml-11 flex items-start justify-between">
                            <p className="text-gray-700">{message.content}</p>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handleStartEditMessage(message)}
                                className="p-1 rounded-full bg-white text-gray-700 border hover:bg-gray-50"
                                aria-label="Éditer"
                              >
                                <Pencil className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(message.id)}
                                className="p-1 rounded-full bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                                aria-label="Supprimer"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        )}
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="flex items-center space-x-2 mt-2 ml-11">
                            <FileText className="w-4 h-4 text-gray-400" />
                            {message.attachments.map((att) => (
                              <button
                                key={att.id}
                                className="text-sm text-blue-600 hover:text-blue-800 underline"
                              >
                                {att.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartenaireMessagesPage;
