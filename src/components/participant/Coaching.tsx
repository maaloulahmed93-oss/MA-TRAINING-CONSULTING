import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  BookOpen, 
  Video, 
  FileText, 
  MessageCircle,
  Send,
  User,
  Bot,
  Trash2,
  Clock,
  ArrowLeft,
  Eye,
  Gamepad2,
  Play,
  Library,
  Mic,
  Users,
  BarChart3,
  Monitor,
  Wrench
} from 'lucide-react';
import { mockCoachingResources } from '../../data/participantData';
import { participantApiService, ApiCoachingResource } from '../../services/participantApiService';


interface CoachingProps {
  participantId?: string;
  onNavigate: (page: string) => void;
}

interface ChatMessage {
  id: string;
  text: string;
  sender: 'participant' | 'expert' | 'organisation' | 'consultant';
  timestamp: Date;
  senderName: string;
}

interface ChatSession {
  id: string;
  participantId: string;
  messages: ChatMessage[];
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

const Coaching = ({ onNavigate, participantId }: CoachingProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [resources, setResources] = useState<ApiCoachingResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentMessage, setCurrentMessage] = useState('');
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [selectedRole, setSelectedRole] = useState<'participant' | 'expert' | 'organisation'>('participant');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const categories = ['all', 'Templates', 'Soft Skills', 'Carrière', 'Guide', 'Ressources', 'Marketing', 'Innovation', 'Productivité'];
  
  // Load resources from API with fallback to mock data
  useEffect(() => {
    const loadResources = async () => {
      if (!participantId) {
        console.log('🔄 No participantId provided, using mock data');
        setResources(mockCoachingResources as any);
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔄 Loading coaching resources for participant:', participantId);
        const apiResources = await participantApiService.getParticipantResources(participantId);
        
        if (apiResources && apiResources.length > 0) {
          console.log('✅ Loaded', apiResources.length, 'resources from API');
          setResources(apiResources);
        } else {
          console.log('⚠️ No API resources found, using mock data as fallback');
          setResources(mockCoachingResources as any);
        }
      } catch (error) {
        console.error('❌ Error loading resources, using mock data:', error);
        setResources(mockCoachingResources as any);
      } finally {
        setIsLoading(false);
      }
    };

    loadResources();
  }, [participantId]);
  
  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (resource.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Fonction pour créer une nouvelle session de chat
  const createChatSession = (): ChatSession => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000); // 72 heures
    
    return {
      id: `chat_${Date.now()}`,
      participantId: participantId || 'demo',
      messages: [
        {
          id: 'welcome',
          text: 'Bonjour ! Je suis votre consultant en orientation professionnelle. Comment puis-je vous aider aujourd\'hui ?',
          sender: 'consultant',
          timestamp: now,
          senderName: 'Consultant MA Training'
        }
      ],
      createdAt: now,
      expiresAt,
      isActive: true
    };
  };

  // Charger la session de chat existante ou en créer une nouvelle
  useEffect(() => {
    const savedSession = localStorage.getItem(`chat_session_${participantId}`);
    if (savedSession) {
      const session: ChatSession = JSON.parse(savedSession);
      const now = new Date();
      
      // Vérifier si la session a expiré (72h)
      if (new Date(session.expiresAt) > now) {
        setChatSession(session);
      } else {
        // Session expirée, la supprimer
        localStorage.removeItem(`chat_session_${participantId}`);
        console.log('Session de chat expirée et supprimée automatiquement');
      }
    }
  }, [participantId]);

  // Sauvegarder la session dans localStorage
  const saveChatSession = (session: ChatSession) => {
    localStorage.setItem(`chat_session_${participantId}`, JSON.stringify(session));
  };

  // Démarrer une nouvelle conversation
  const startNewChat = () => {
    const newSession = createChatSession();
    setChatSession(newSession);
    saveChatSession(newSession);
  };

  // Envoyer un message
  const sendMessage = () => {
    if (!currentMessage.trim() || !chatSession) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      text: currentMessage,
      sender: selectedRole,
      timestamp: new Date(),
      senderName: getRoleName(selectedRole)
    };

    const updatedSession = {
      ...chatSession,
      messages: [...chatSession.messages, newMessage]
    };

    setChatSession(updatedSession);
    saveChatSession(updatedSession);
    setCurrentMessage('');
    
    // Message envoyé avec succès - le consultant répondra manuellement
    console.log('Message envoyé par', getRoleName(selectedRole), ':', newMessage.text);
  };

  // Supprimer la conversation
  const deleteChatSession = () => {
    if (chatSession) {
      localStorage.removeItem(`chat_session_${participantId}`);
      setChatSession(null);

      alert('Conversation supprimée avec succès.');
    }
  };

  // Auto-scroll vers le bas des messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatSession?.messages]);

  // Calculer le temps restant avant expiration
  const getTimeRemaining = () => {
    if (!chatSession) return null;
    
    const now = new Date();
    const expiresAt = new Date(chatSession.expiresAt);
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expiré';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}min`;
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'CV Template':
      case 'Lettre de motivation':
        return FileText;
      case 'Vidéo Soft Skills':
        return Video;
      case 'Guide':
        return BookOpen;
      case 'Jeux Éducatifs':
        return Gamepad2;
      case 'Scénarios':
        return Play;
      case 'Bibliothèque Online':
        return Library;
      case 'Podcast':
        return Mic;
      case 'Atelier Interactif':
        return Users;
      case 'Cas d\'Etude':
        return BarChart3;
      case 'Webinaire':
        return Monitor;
      case 'Outils':
        return Wrench;
      default:
        return FileText;
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case 'CV Template':
        return 'from-blue-500 to-blue-600';
      case 'Lettre de motivation':
        return 'from-green-500 to-green-600';
      case 'Vidéo Soft Skills':
        return 'from-purple-500 to-purple-600';
      case 'Guide':
        return 'from-orange-500 to-orange-600';
      case 'Jeux Éducatifs':
        return 'from-pink-500 to-pink-600';
      case 'Scénarios':
        return 'from-indigo-500 to-indigo-600';
      case 'Bibliothèque Online':
        return 'from-teal-500 to-teal-600';
      case 'Podcast':
        return 'from-red-500 to-red-600';
      case 'Atelier Interactif':
        return 'from-yellow-500 to-yellow-600';
      case 'Cas d\'Etude':
        return 'from-cyan-500 to-cyan-600';
      case 'Webinaire':
        return 'from-violet-500 to-violet-600';
      case 'Outils':
        return 'from-slate-500 to-slate-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  // Fonctions utilitaires pour les rôles
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'participant':
        return 'bg-blue-500';
      case 'expert':
        return 'bg-green-500';
      case 'organisation':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'participant':
        return 'Participant';
      case 'expert':
        return 'Expert';
      case 'organisation':
        return 'Organisation';
      default:
        return 'Utilisateur';
    }
  };

  const getRoleSelectColor = (role: string) => {
    switch (role) {
      case 'participant':
        return 'border-blue-500 bg-blue-50 text-blue-700';
      case 'expert':
        return 'border-green-500 bg-green-50 text-green-700';
      case 'organisation':
        return 'border-purple-500 bg-purple-50 text-purple-700';
      default:
        return 'border-gray-500 bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Coaching & Orientation</h1>
                <p className="text-gray-600">Chat en temps réel avec nos consultants</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resources Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Ressources disponibles</h2>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'Toutes les catégories' : category}
                  </option>
                ))}
              </select>

              {/* Resources List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredResources.slice(0, 6).map((resource, index) => {
                  const ResourceIcon = getResourceIcon(resource.type);
                  
                  return (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${getResourceColor(resource.type)} flex items-center justify-center flex-shrink-0`}>
                        <ResourceIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{resource.title}</h4>
                        <p className="text-xs text-gray-500">{resource.type}</p>
                      </div>
                      <Eye 
                        className="w-4 h-4 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer" 
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = resource.dataLinks?.[0]?.url;
                          if (url) {
                            console.log('🔗 Opening resource URL:', url);
                            window.open(url, '_blank', 'noopener,noreferrer');
                          } else {
                            console.log('⚠️ No URL found for resource:', resource.title);
                          }
                        }}
                        title={resource.dataLinks?.[0]?.url ? 'Ouvrir le lien' : 'Aucun lien disponible'}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chat Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border h-[600px] flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Chat avec un Consultant</h3>
                      <p className="text-sm text-gray-500">
                        {chatSession ? (
                          <span className="flex items-center space-x-2">
                            <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                            <span>En attente de réponse • Expire dans {getTimeRemaining()}</span>
                          </span>
                        ) : (
                          'Démarrez une conversation'
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {chatSession && (
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={deleteChatSession}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer la conversation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {!chatSession ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <MessageCircle className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Commencez une conversation</h4>
                    <p className="text-gray-600 mb-6 max-w-sm">
                      Posez vos questions à nos consultants en orientation professionnelle. 
                      Un consultant vous répondra manuellement. Les conversations sont automatiquement supprimées après 72h.
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startNewChat}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      Démarrer le chat
                    </motion.button>
                  </div>
                ) : (
                  <>
                    {chatSession.messages.map((message, index) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`flex items-start space-x-3 ${
                          message.sender !== 'consultant' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === 'consultant' 
                            ? 'bg-gradient-to-r from-purple-500 to-blue-600'
                            : getRoleColor(message.sender)
                        }`}>
                          {message.sender === 'consultant' ? (
                            <Bot className="w-4 h-4 text-white" />
                          ) : (
                            <User className="w-4 h-4 text-white" />
                          )}
                        </div>
                        
                        <div className={`flex-1 max-w-xs lg:max-w-md ${
                          message.sender !== 'consultant' ? 'text-right' : ''
                        }`}>
                          <div className={`p-3 rounded-lg ${
                            message.sender === 'consultant'
                              ? 'bg-gray-100 text-gray-900'
                              : `${getRoleColor(message.sender)} text-white`
                          }`}>
                            <p className="text-sm">{message.text}</p>
                          </div>
                          <div className={`flex items-center space-x-2 mt-1 text-xs text-gray-500 ${
                            message.sender !== 'consultant' ? 'justify-end' : ''
                          }`}>
                            <span>{message.senderName}</span>
                            <span>•</span>
                            <span>{new Date(message.timestamp).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    

                    
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input */}
              {chatSession && (
                <div className="p-4 border-t border-gray-200">
                  {/* Role Selector */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-2">Envoyer en tant que :</label>
                    <div className="flex space-x-2">
                      {(['participant', 'expert', 'organisation'] as const).map((role) => (
                        <motion.button
                          key={role}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedRole(role)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all duration-200 ${
                            selectedRole === role 
                              ? getRoleSelectColor(role)
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                            selectedRole === role ? getRoleColor(role) : 'bg-gray-400'
                          }`}></span>
                          {getRoleName(role)}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={`Tapez votre message en tant que ${getRoleName(selectedRole)}...`}
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={sendMessage}
                      disabled={!currentMessage.trim()}
                      className={`p-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${getRoleColor(selectedRole)}`}
                    >
                      <Send className="w-5 h-5" />
                    </motion.button>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>💡 Un consultant vous répondra manuellement • Conversations supprimées après 72h</span>
                    {chatSession && (
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Expire dans {getTimeRemaining()}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Coaching;
