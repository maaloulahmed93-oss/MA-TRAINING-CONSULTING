import { useState, useEffect } from "react";
import { Calendar, Clock, Eye, Users, RefreshCw, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  eventsData,
  updateEventParticipants,
  type Event,
} from "../data/eventsData";

const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>(eventsData);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mise à jour automatique des participants toutes les 20 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setIsUpdating(true);

      // Simuler une mise à jour des participants
      setTimeout(() => {
        const randomEventId =
          events[Math.floor(Math.random() * events.length)].id;
        const updatedEvents = updateEventParticipants(randomEventId);
        setEvents(updatedEvents);
        setLastUpdate(new Date());
        setIsUpdating(false);
      }, 1000);
    }, 20000);

    return () => clearInterval(interval);
  }, [events]);

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

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header with live update indicator */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Événements en temps réel</span>
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
            <div className="event-table-header bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-200">
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
              <AnimatePresence>
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    className="event-row p-6 hover:bg-gray-50 transition-colors duration-200"
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    whileHover={{ scale: 1.01 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
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
                          className="event-action-button bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2 rounded-full hover:shadow-lg transition-all duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
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
