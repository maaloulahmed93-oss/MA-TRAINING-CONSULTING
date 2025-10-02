import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  FreelancerDecision,
  getFreelancerDecisions,
  markDecisionAsRead,
  formatDecisionDate,
} from "../../services/freelancerDecisionsService";

interface NotificationsTabProps {
  freelancerId: string;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({ freelancerId }) => {
  const [decisions, setDecisions] = useState<FreelancerDecision[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [error, setError] = useState<string | null>(null);

  // تحميل القرارات
  const loadDecisions = async () => {
    if (!freelancerId) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log(`📬 جلب القرارات للفريلانسر ${freelancerId}...`);
      const freelancerDecisions = await getFreelancerDecisions(freelancerId);
      setDecisions(freelancerDecisions || []);
      console.log(`✅ تم تحميل ${freelancerDecisions?.length || 0} قرار للفريلانسر ${freelancerId}`);
    } catch (error) {
      console.error('خطأ في تحميل القرارات:', error);
      setError('فشل في تحميل القرارات');
      setDecisions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDecisions();
    
    // تحديث القرارات كل دقيقة (بدلاً من 30 ثانية لتقليل الطلبات)
    const interval = setInterval(loadDecisions, 60000);
    return () => clearInterval(interval);
  }, [freelancerId]);

  // فلترة القرارات
  const filteredDecisions = decisions.filter(decision => {
    if (filter === "unread") return decision.status === 'sent';
    if (filter === "read") return decision.status === 'read';
    return true;
  });

  // تحديد قرار كمقروء
  const handleMarkAsRead = async (decisionId: string) => {
    try {
      await markDecisionAsRead(decisionId, freelancerId);
      await loadDecisions(); // إعادة تحميل البيانات
    } catch (error) {
      console.error('خطأ في تحديد القرار كمقروء:', error);
    }
  };

  // تحديد جميع القرارات كمقروءة
  const handleMarkAllAsRead = async () => {
    try {
      const unreadDecisions = decisions.filter(d => d.status === 'sent');
      for (const decision of unreadDecisions) {
        await markDecisionAsRead(decision._id, freelancerId);
      }
      await loadDecisions(); // إعادة تحميل البيانات
    } catch (error) {
      console.error('خطأ في تحديد جميع القرارات كمقروءة:', error);
    }
  };


  // أيقونة حسب نوع القرار
  const getDecisionIcon = (decision: string) => {
    if (decision === 'approved') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (decision === 'rejected') return <XCircle className="w-5 h-5 text-red-500" />;
    return <AlertCircle className="w-5 h-5 text-blue-500" />;
  };

  // لون حسب نوع القرار
  const getDecisionColor = (decision: string) => {
    if (decision === 'approved') return 'border-l-green-500 bg-green-50';
    if (decision === 'rejected') return 'border-l-red-500 bg-red-50';
    return 'border-l-blue-500 bg-blue-50';
  };

  const unreadCount = decisions.filter(d => d.status === 'sent').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل القرارات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-600 mb-2">خطأ في التحميل</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDecisions}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Bell className="w-6 h-6 text-purple-600" />
            Décisions
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h2>
          <p className="text-gray-600">
            Décisions et mises à jour de vos livrables
          </p>
        </div>

        <div className="flex gap-3">
          {/* Filtres */}
          <div className="flex gap-2">
            {(["all", "unread", "read"] as const).map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  filter === filterType
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filterType === "all"
                  ? "Tous"
                  : filterType === "unread"
                  ? "Non lus"
                  : "Lus"}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                <Eye className="w-4 h-4" />
                Tout marquer lu
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Liste des décisions */}
      <div className="space-y-4">
        {filteredDecisions.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {filter === "unread" 
                ? "Aucune décision non lue"
                : filter === "read"
                ? "Aucune décision lue"
                : "Aucune décision"}
            </h3>
            <p className="text-gray-500">
              {filter === "all" 
                ? "Les décisions de l'admin apparaîtront ici"
                : "Changez de filtre pour voir d'autres décisions"}
            </p>
          </div>
        ) : (
          filteredDecisions.map((decision, index) => (
            <motion.div
              key={decision._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-l-4 ${getDecisionColor(decision.decision)} ${
                decision.status === 'sent' ? 'shadow-md' : 'opacity-75'
              } hover:shadow-lg transition-all duration-200`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {getDecisionIcon(decision.decision)}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800">
                        {decision.decision === 'approved' ? '✅ Livrable Accepté' : '❌ Livrable Refusé'}
                      </h4>
                      {decision.status === 'sent' && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">Livrable: {decision.deliverableTitle}</span>
                      </div>
                      <div className="mb-1">
                        <strong>Décision:</strong> {decision.decision === 'approved' ? 'Accepté ✅' : 'Refusé ❌'}
                      </div>
                      {decision.observation && (
                        <div className="bg-white p-2 rounded border mt-2">
                          <strong>Observation:</strong> {decision.observation}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>De: {decision.adminId}</span>
                      <span>{formatDecisionDate(decision.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {decision.status === 'sent' && (
                    <button
                      onClick={() => handleMarkAsRead(decision._id)}
                      className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                      title="Marquer comme lu"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Statistiques */}
      {decisions.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Statistiques</h4>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-lg text-blue-600">{decisions.length}</div>
              <div className="text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-orange-600">{unreadCount}</div>
              <div className="text-gray-600">Non lus</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-green-600">
                {decisions.filter(d => d.decision === 'approved').length}
              </div>
              <div className="text-gray-600">Acceptés</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-red-600">
                {decisions.filter(d => d.decision === 'rejected').length}
              </div>
              <div className="text-gray-600">Refusés</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsTab;
