import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Send,
  Paperclip,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { PartnershipMessage } from "../../types/partnership";
import {
  getPartnershipMessages,
  sendPartnershipEmail,
  getPartnerById,
} from "../../services/partnershipData";
import { getCurrentPartnerId } from "../../services/partnershipAuth";

interface MessagesSectionProps {
  partnerId: string;
}

const MessagesSection: React.FC<MessagesSectionProps> = ({ partnerId }) => {
  const [messages] = useState<PartnershipMessage[]>(getPartnershipMessages());
  const [showComposer, setShowComposer] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: "",
    content: "",
    attachments: [] as string[],
  });

  const partner = getPartnerById(partnerId);
  const currentPartnerId = getCurrentPartnerId();

  const handleSendEmail = () => {
    if (!emailForm.subject.trim() || !emailForm.content.trim()) {
      alert("Veuillez remplir le sujet et le message");
      return;
    }

    const mailtoLink = sendPartnershipEmail(
      partnerId,
      emailForm.subject,
      emailForm.content,
      emailForm.attachments
    );

    window.location.href = mailtoLink;

    // Reset form
    setEmailForm({
      subject: "",
      content: "",
      attachments: [],
    });
    setShowComposer(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Send className="w-4 h-4 text-blue-600" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "read":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Mail className="w-6 h-6 text-orange-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Messages & Communication
          </h2>
        </div>
        <button
          onClick={() => setShowComposer(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Nouveau message
        </button>
      </div>

      {/* Partner Info */}
      {partner && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{partner.name}</h3>
              <p className="text-sm text-gray-600">
                Contact: {partner.contactPerson}
              </p>
              <p className="text-sm text-gray-600">Email: {partner.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Historique des messages
        </h3>

        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
              >
                {/* Message Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {message.subject}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                          message.priority
                        )}`}
                      >
                        {message.priority === "high"
                          ? "Urgent"
                          : message.priority === "medium"
                          ? "Normal"
                          : "Faible"}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>De: {message.from}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(message.timestamp)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(message.status)}
                        <span className="capitalize">{message.status}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Content */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">
                      Pièces jointes:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {message.attachments.map((attachment, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span>{attachment}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun message
            </h3>
            <p className="text-gray-600">
              Aucun message échangé pour le moment.
            </p>
          </div>
        )}
      </div>

      {/* Email Composer Modal */}
      {showComposer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Mail className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  Nouveau message
                </h3>
              </div>
              <button
                onClick={() => setShowComposer(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Email Form */}
            <div className="space-y-4">
              {/* Recipient */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destinataire
                </label>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">
                      {partner?.email || "admin@siteen.com"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Sujet
                </label>
                <input
                  id="subject"
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) =>
                    setEmailForm((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                  placeholder="Objet du message"
                />
              </div>

              {/* Content */}
              <div>
                <label
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message
                </label>
                <textarea
                  id="content"
                  value={emailForm.content}
                  onChange={(e) =>
                    setEmailForm((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Votre message..."
                />
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Information importante</p>
                    <p>
                      Ce message ouvrira votre client email par défaut avec les
                      informations pré-remplies. Vous pourrez ajouter des pièces
                      jointes avant l'envoi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => setShowComposer(false)}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSendEmail}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Envoyer
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MessagesSection;
