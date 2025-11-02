import { useState, useEffect } from "react";
import { Calendar, Clock, Eye, Users, RefreshCw, Zap, MapPin, Video } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  eventsData,
  updateEventParticipants,
  type Event,
} from "../data/eventsData";
import { eventsApiService } from "../services/eventsApiService";

const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>(eventsData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // جلب الأحداث من API
  const fetchEventsFromAPI = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 جلب الأحداث من API...');
      const apiEvents = await eventsApiService.getPublishedEvents();
      
      if (!apiEvents || apiEvents.length === 0) {
        console.warn('⚠️ Aucun événement publié dans l\'API');
        setError('Aucun événement disponible actuellement');
        setEvents([]);
        setLastUpdate(new Date());
        return;
      }
      
      // تحويل البيانات من API format إلى Event format مع الأيقونات
      const transformedEvents: Event[] = apiEvents.map(apiEvent => ({
        ...apiEvent,
        icon: getIconComponent(apiEvent.color), // تحويل اللون إلى أيقونة
      }));
      
      setEvents(transformedEvents);
      setLastUpdate(new Date());
      console.log(`✅ Events loaded from API: ${transformedEvents.length} events`);
      
    } catch (error) {
      console.error('❌ Error loading events from API:', error);
      setError('Impossible de charger les événements depuis le serveur. Veuillez ajouter des événements depuis le panneau d\'administration.');
      
      // لا نستخدم البيانات التجريبية، فقط نعرض رسالة خطأ
      setEvents([]);
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  };

  // تحميل الأحداث عند بداية التشغيل
  useEffect(() => {
    fetchEventsFromAPI();
  }, []);

  // دالة لتحويل اللون إلى أيقونة
  const getIconComponent = (color: string) => {
    switch (color) {
      case 'blue': return MapPin;
      case 'purple': return Video;
      case 'green': return Users;
      case 'orange': return Calendar;
      default: return MapPin;
    }
  };

  // Mise à jour automatique des participants toutes les 30 ثانية من الـ API
  useEffect(() => {
    if (error || events.length === 0) return; // لا تحديث إذا كان هناك خطأ أو لا توجد أحداث
    
    // إعادة تحميل البيانات من الـ API كل 30 ثانية
    const interval = setInterval(() => {
      setIsUpdating(true);
      
      // إعادة جلب البيانات من الـ API
      fetchEventsFromAPI().finally(() => {
        setIsUpdating(false);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [error]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "text-blue-600 bg-blue-50",
      purple: "text-purple-600 bg-purple-50",
      green: "text-green-600 bg-green-50",
      orange: "text-orange-600 bg-orange-50",
    };
    return (
      colorMap[color as keyof typeof colorMap] || "text-blue-600 bg-blue-50"
    );
  };

  const getProgressColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 80) return "bg-red-500";
    if (percentage >= 60) return "bg-orange-500";
    return "bg-green-500";
  };

  // Fonction pour ouvrir le lien de l'événement
  const handleViewEvent = (event: Event) => {
    if (event.url) {
      // Ouvrir le lien dans un nouvel onglet
      window.open(event.url, '_blank', 'noopener,noreferrer');
      console.log(`🔗 Opening event URL: ${event.url}`);
    } else {
      // Afficher les informations de l'événement s'il n'y a pas de lien
      alert(`Informations de l'événement:\n\nTitre: ${event.title}\nDate: ${event.date}\nDurée: ${event.duration}\nLieu: ${event.format}`);
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des événements...</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <RefreshCw className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Header with live update indicator */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-4">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                error 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  error ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <span>{error ? 'البيانات التجريبية' : 'Événements en temps réel'}</span>
                {isUpdating && <RefreshCw className="w-3 h-3 animate-spin" />}
              </div>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
              Événements,{" "}
              <span className="text-gradient bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Webinaires
              </span>{" "}
              & Team Building
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Découvrez nos événements dynamiques avec inscriptions en temps
              réel
            </p>
          </motion.div>

          {/* Events Table */}
          <motion.div
            className="event-table-container bg-white rounded-2xl shadow-xl overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Table Header */}
            {/* Desktop Header - Hidden on mobile */}
            <div className="hidden md:block event-table-header bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-gray-900">Date</span>
                </div>
                <div className="col-span-3 font-semibold text-gray-900">
                  
                </div>
                <div className="col-span-2 font-semibold text-gray-900">
                  Format
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-gray-900">Durée</span>
                </div>
                <div className="col-span-1 font-semibold text-gray-900">
                  Places
                </div>
                <div className="col-span-1 font-semibold text-gray-900 text-center">
                  Action
                </div>
              </div>
            </div>

            {/* Events List */}
            <div className="divide-y divide-gray-100">
              {/* Afficher un message s'il n'y a pas d'événements */}
              {!loading && events.length === 0 && (
                <div className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Aucun événement disponible actuellement
                  </h3>
                  <p className="text-gray-600">
                    Revenez bientôt pour découvrir nos prochains événements, webinaires et activités de team building !
                  </p>
                </div>
              )}

              <AnimatePresence>
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    className="event-row p-4 md:p-6 hover:bg-gray-50 transition-colors duration-200"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    whileHover={{ scale: 1.01 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {/* Mobile Layout */}
                    <div className="md:hidden space-y-4">
                      {/* Date & Title */}
                      <div>
                        <div className="event-date bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium inline-block mb-2">
                          {event.date}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                          {event.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(
                              event.color
                            )}`}
                          >
                            {event.type}
                          </span>
                          {event.price === 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Gratuit
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Format & Duration */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <event.icon
                            className={`w-4 h-4 ${
                              event.color === "blue"
                                ? "text-blue-600"
                                : event.color === "purple"
                                ? "text-purple-600"
                                : event.color === "green"
                                ? "text-green-600"
                                : "text-orange-600"
                            }`}
                          />
                          <span className="text-gray-700 text-sm">
                            {event.format}
                          </span>
                        </div>
                        <span className="event-duration bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium">
                          {event.duration}
                        </span>
                      </div>

                      {/* Participants & Action */}
                      <div className="flex items-center justify-between">
                        {event.currentParticipants && event.maxParticipants && (
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">{event.currentParticipants}</span>
                            <span className="text-gray-400"> / {event.maxParticipants} places</span>
                          </div>
                        )}
                        <a
                          href={event.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                        >
                          <Eye className="w-5 h-5" />
                        </a>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                      {/* Date */}
                      <div className="col-span-3">
                        <div className="event-date bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium">
                          {event.date}
                        </div>
                      </div>

                      {/* Event Title & Description */}
                      <div className="col-span-3">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {event.title}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getColorClasses(
                              event.color
                            )}`}
                          >
                            {event.type}
                          </span>
                          {event.price === 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                              Gratuit
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Format */}
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <event.icon
                            className={`w-4 h-4 ${
                              event.color === "blue"
                                ? "text-blue-600"
                                : event.color === "purple"
                                ? "text-purple-600"
                                : event.color === "green"
                                ? "text-green-600"
                                : "text-orange-600"
                            }`}
                          />
                          <span className="text-gray-700 text-sm">
                            {event.format}
                          </span>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="col-span-2">
                        <span className="event-duration bg-purple-50 text-purple-700 px-3 py-1 rounded-lg text-sm font-medium">
                          {event.duration}
                        </span>
                      </div>

                      {/* Participants Progress */}
                      <div className="col-span-1">
                        {event.currentParticipants && event.maxParticipants && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>{event.currentParticipants}</span>
                              <span>{event.maxParticipants}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(
                                  event.currentParticipants,
                                  event.maxParticipants
                                )}`}
                                style={{
                                  width: `${
                                    (event.currentParticipants /
                                      event.maxParticipants) *
                                    100
                                  }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="col-span-1 text-center">
                        <motion.button
                          onClick={() => handleViewEvent(event)}
                          className={`event-action-button text-white p-2 rounded-full hover:shadow-lg transition-all duration-200 ${
                            event.url 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700' 
                              : 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          title={event.url ? 'عرض تفاصيل الحدث' : 'معلومات الحدث'}
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer with stats */}
            <motion.div
              className="bg-gray-50 p-6 border-t border-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>{events.length} événements disponibles</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-green-500" />
                    <span>
                      {events.reduce(
                        (acc, event) => acc + (event.currentParticipants || 0),
                        0
                      )}{" "}
                      participants inscrits
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
