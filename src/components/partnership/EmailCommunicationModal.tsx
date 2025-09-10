import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send, X, Clock, CheckCircle, AlertCircle, FileText, Calendar, Users, Loader, Copy } from "lucide-react";
import { ExtendedProject } from "../../services/partnershipProjectsService";
import { EMAIL_TEMPLATES, EmailData, generateProjectContactEmail, sendEmailViaEmailJS, generateAdvancedMailtoLink, isValidEmail, getEmailHistory } from "../../services/emailCommunicationService";

interface EmailCommunicationModalProps {
  project: ExtendedProject | null;
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
}

const EmailCommunicationModal: React.FC<EmailCommunicationModalProps> = ({
  project,
  isOpen,
  onClose,
  partnerName,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState("project_contact");
  const [emailData, setEmailData] = useState<EmailData>({
    to: '',
    subject: '',
    senderName: '',
    senderEmail: '',
    message: '',
    priority: 'normal',
  });
  const [isSending, setIsSending] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  type EmailHistoryData = EmailData & { timestamp?: string };
  const [emailHistory, setEmailHistory] = useState<EmailHistoryData[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setEmailHistory(
        getEmailHistory()
          .filter((email) => email.projectId === project?.id)
          .slice(0, 10)
      );
    }
  }, [isOpen, project?.id]);

  if (!project) return null;

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSendEmail = async () => {
    // Validation
    if (!emailData.senderName.trim()) {
      showNotification("error", "Veuillez saisir votre nom");
      return;
    }

    if (!emailData.senderEmail.trim() || !isValidEmail(emailData.senderEmail)) {
      showNotification("error", "Veuillez saisir une adresse email valide");
      return;
    }

    if (!emailData.message.trim()) {
      showNotification("error", "Veuillez saisir un message");
      return;
    }

    setIsSending(true);

    try {
      const emailToSend = generateProjectContactEmail(
        project,
        partnerName,
        emailData.message,
        emailData.senderName,
        emailData.senderEmail,
        selectedTemplate
      );

      emailToSend.priority = emailData.priority;

      const success = await sendEmailViaEmailJS(emailToSend);

      if (success) {
        showNotification("success", "Email envoyé avec succès !");

        // Reset form
        setEmailData({
          to: '',
          subject: '',
          senderName: "",
          senderEmail: "",
          message: "",
          priority: "normal",
        });

        // Refresh history
        setEmailHistory(
          getEmailHistory()
            .filter((email) => email.projectId === project.id)
            .slice(0, 10)
        );
      } else {
        showNotification(
          "error",
          "Échec de l'envoi de l'email. Veuillez réessayer."
        );
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi de l\'email:', err);
      showNotification("error", "Une erreur est survenue lors de l'envoi.");
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenMailto = () => {
    if (!emailData.senderName.trim() || !emailData.senderEmail.trim()) {
      showNotification("error", "Veuillez remplir votre nom et email");
      return;
    }

    const emailToSend = generateProjectContactEmail(
      project,
      partnerName,
      emailData.message || "Votre message ici...",
      emailData.senderName,
      emailData.senderEmail,
      selectedTemplate
    );

    const mailtoLink = generateAdvancedMailtoLink(emailToSend);
    window.location.href = mailtoLink;

    showNotification("info", "Ouverture de votre client email...");
  };

  const copyEmailToClipboard = async () => {
    if (!emailData.senderName.trim() || !emailData.senderEmail.trim()) {
      showNotification("error", "Veuillez remplir votre nom et email");
      return;
    }

    const emailToSend = generateProjectContactEmail(
      project,
      partnerName,
      emailData.message || "Votre message ici...",
      emailData.senderName,
      emailData.senderEmail,
      selectedTemplate
    );

    const emailText = `À: ${emailToSend.to}
Sujet: ${emailToSend.subject}

${emailToSend.message}`;

    try {
      await navigator.clipboard.writeText(emailText);
      showNotification("success", "Email copié dans le presse-papiers !");
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
      showNotification("error", "Impossible de copier dans le presse-papiers");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Haute";
      case "low":
        return "Basse";
      default:
        return "Normale";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Communication Email
                    </h2>
                    <p className="text-gray-600">{project.title}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <Clock className="w-4 h-4 inline mr-1" />
                    Historique
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Notification */}
              <AnimatePresence>
                {notification && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`mb-6 p-4 rounded-lg flex items-center space-x-3 ${
                      notification.type === "success"
                        ? "bg-green-100 text-green-800"
                        : notification.type === "error"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {notification.type === "success" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : notification.type === "error" ? (
                      <AlertCircle className="w-5 h-5" />
                    ) : (
                      <Mail className="w-5 h-5" />
                    )}
                    <span>{notification.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Email Form */}
                <div className="lg:col-span-2">
                  <div className="space-y-6">
                    {/* Template Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Template d'email
                      </label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {EMAIL_TEMPLATES.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sender Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Votre nom *
                        </label>
                        <input
                          type="text"
                          value={emailData.senderName}
                          onChange={(e) =>
                            setEmailData((prev) => ({
                              ...prev,
                              senderName: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: Jean Dupont"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Votre email *
                        </label>
                        <input
                          type="email"
                          value={emailData.senderEmail}
                          onChange={(e) =>
                            setEmailData((prev) => ({
                              ...prev,
                              senderEmail: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="jean.dupont@example.com"
                        />
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priorité
                      </label>
                      <select
                        value={emailData.priority}
                        onChange={(e) =>
                          setEmailData((prev) => ({
                            ...prev,
                            priority: e.target.value as
                              | "low"
                              | "normal"
                              | "high",
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">Basse</option>
                        <option value="normal">Normale</option>
                        <option value="high">Haute</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        value={emailData.message}
                        onChange={(e) =>
                          setEmailData((prev) => ({
                            ...prev,
                            message: e.target.value,
                          }))
                        }
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Saisissez votre message ici..."
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleSendEmail}
                        disabled={isSending}
                        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        {isSending ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>{isSending ? "Envoi..." : "Envoyer"}</span>
                      </button>

                      <button
                        onClick={handleOpenMailto}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Client Email</span>
                      </button>

                      <button
                        onClick={copyEmailToClipboard}
                        className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copier</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Project Info & History */}
                <div className="space-y-6">
                  {/* Project Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Informations du projet
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Titre:</span>
                        <span className="font-medium">{project.title}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Participants:</span>
                        <span className="font-medium">
                          {project.participants.length}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Fin prévue:</span>
                        <span className="font-medium">{project.endDate}</span>
                      </div>
                      {project.contactEmail && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Contact:</span>
                          <span className="font-medium text-xs">
                            {project.contactEmail}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email History */}
                  {showHistory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Historique des emails ({emailHistory.length})
                      </h3>
                      {emailHistory.length > 0 ? (
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                          {emailHistory.map((message, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-white rounded border"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400">
                                  {message.to}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(
                                    message.priority
                                  )}`}
                                >
                                  {getPriorityText(message.priority)}
                                </span>
                              </div>
                              <div className="text-xs text-gray-600">
                                <div>
                                  <strong>De:</strong> {message.senderName} ({message.senderEmail})
                                </div>
                                <div>
                                  <strong>Date:</strong> {message.timestamp ? new Date(message.timestamp).toLocaleDateString("fr-FR") : 'N/A'}
                                </div>
                                <div>
                                  <strong>Sujet:</strong> {message.subject}
                                </div>
                                <div>
                                  <strong>Message:</strong> {message.message}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          Aucun email envoyé pour ce projet
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmailCommunicationModal;
