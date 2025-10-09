import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Save, 
  RefreshCw, 
  TestTube, 
  RotateCcw,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { digitalizationContactApiService, ContactData, ContactStats } from '../services/digitalizationContactApiService';

const DigitalizationContactPage: React.FC = () => {
  const [contactData, setContactData] = useState<ContactData | null>(null);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testResults, setTestResults] = useState<any>(null);
  const [showEmailTemplate, setShowEmailTemplate] = useState(false);

  useEffect(() => {
    loadContactData();
    loadStats();
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    const connected = await digitalizationContactApiService.testConnection();
    setApiConnected(connected);
  };

  const loadContactData = async () => {
    try {
      setLoading(true);
      const data = await digitalizationContactApiService.getContactData();
      setContactData(data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      showMessage('error', 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await digitalizationContactApiService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleSave = async () => {
    if (!contactData) return;

    try {
      setSaving(true);
      const savedData = await digitalizationContactApiService.saveContactData(contactData);
      if (savedData) {
        setContactData(savedData);
        showMessage('success', 'Données de contact sauvegardées avec succès');
        await loadStats();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showMessage('error', 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleTestLinks = async () => {
    if (!contactData) return;

    try {
      setTesting(true);
      const results = await digitalizationContactApiService.testLinks({
        email: contactData.email,
        phone: contactData.phone,
        whatsapp: contactData.whatsapp,
        customSubject: contactData.emailSubjectPrefix
      });
      setTestResults(results);
      showMessage('success', 'Liens testés avec succès');
    } catch (error) {
      console.error('Erreur lors du test:', error);
      showMessage('error', 'Erreur lors du test des liens');
    } finally {
      setTesting(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir réinitialiser aux valeurs par défaut ?')) {
      return;
    }

    try {
      setResetting(true);
      const defaultData = await digitalizationContactApiService.resetToDefault();
      if (defaultData) {
        setContactData(defaultData);
        showMessage('success', 'Données réinitialisées aux valeurs par défaut');
        await loadStats();
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      showMessage('error', 'Erreur lors de la réinitialisation');
    } finally {
      setResetting(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const updateContactData = (field: string, value: any) => {
    if (!contactData) return;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setContactData({
        ...contactData,
        [parent]: {
          ...(contactData[parent as keyof ContactData] as object),
          [child]: value
        }
      });
    } else {
      setContactData({
        ...contactData,
        [field]: value
      });
    }
  };

  const updateButtonData = (buttonType: 'email' | 'phone' | 'whatsapp', field: string, value: any) => {
    if (!contactData) return;
    
    setContactData({
      ...contactData,
      buttons: {
        ...contactData.buttons,
        [buttonType]: {
          ...contactData.buttons[buttonType],
          [field]: value
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2 text-gray-600">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Chargement des données de contact...</span>
        </div>
      </div>
    );
  }

  if (!contactData) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">Erreur lors du chargement des données</div>
        <button
          onClick={loadContactData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Contacts - Digitalisation</h1>
          <p className="text-gray-600 mt-1">
            Configurez les informations de contact affichées sur la page de digitalisation
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* API Status */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            apiConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {apiConnected ? '🟢 API Connectée' : '🔴 Mode Fallback'}
          </div>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalContacts}</div>
              <div className="text-sm text-gray-600">Total Contacts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeContacts}</div>
              <div className="text-sm text-gray-600">Contacts Actifs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.systemStatus}</div>
              <div className="text-sm text-gray-600">Statut Système</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Dernière MAJ</div>
              <div className="text-xs text-gray-500">
                {stats.lastUpdate ? new Date(stats.lastUpdate.date).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Informations de Contact</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleTestLinks}
              disabled={testing}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {testing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <TestTube className="w-4 h-4" />
              )}
              <span>Tester les Liens</span>
            </button>
            
            <button
              onClick={handleReset}
              disabled={resetting}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
              {resetting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
              <span>Réinitialiser</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Sauvegarder</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Coordonnées Principales</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={contactData.email}
                onChange={(e) => updateContactData('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="contact@exemple.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone className="w-4 h-4 inline mr-1" />
                Téléphone
              </label>
              <input
                type="tel"
                value={contactData.phone}
                onChange={(e) => updateContactData('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+216 XX XXX XXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                WhatsApp
              </label>
              <input
                type="tel"
                value={contactData.whatsapp}
                onChange={(e) => updateContactData('whatsapp', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+216 XX XXX XXX"
              />
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Informations Entreprise</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l'Entreprise
              </label>
              <input
                type="text"
                value={contactData.companyName}
                onChange={(e) => updateContactData('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Heures de Support
              </label>
              <input
                type="text"
                value={contactData.supportHours}
                onChange={(e) => updateContactData('supportHours', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Temps de Réponse
              </label>
              <input
                type="text"
                value={contactData.responseTime}
                onChange={(e) => updateContactData('responseTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Email Configuration */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">Configuration Email</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Préfixe Sujet Email
              </label>
              <input
                type="text"
                value={contactData.emailSubjectPrefix}
                onChange={(e) => updateContactData('emailSubjectPrefix', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Template Email
                </label>
                <button
                  onClick={() => setShowEmailTemplate(!showEmailTemplate)}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  {showEmailTemplate ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{showEmailTemplate ? 'Masquer' : 'Afficher'}</span>
                </button>
              </div>
              {showEmailTemplate && (
                <textarea
                  value={contactData.emailTemplate}
                  onChange={(e) => updateContactData('emailTemplate', e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message WhatsApp
              </label>
              <textarea
                value={contactData.whatsappMessage}
                onChange={(e) => updateContactData('whatsappMessage', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Button Configuration */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="font-medium text-gray-900 mb-4">Configuration des Boutons</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(contactData.buttons).map(([buttonType, buttonData]) => (
              <div key={buttonType} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 capitalize">{buttonType}</h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Texte du Bouton
                    </label>
                    <input
                      type="text"
                      value={buttonData.text}
                      onChange={(e) => updateButtonData(buttonType as any, 'text', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`${buttonType}-enabled`}
                      checked={buttonData.enabled}
                      onChange={(e) => updateButtonData(buttonType as any, 'enabled', e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor={`${buttonType}-enabled`} className="text-sm text-gray-700">
                      Bouton activé
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Style
                    </label>
                    <select
                      value={buttonData.style}
                      onChange={(e) => updateButtonData(buttonType as any, 'style', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Résultats des Tests</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Liens Générés</h3>
              <div className="space-y-2">
                {Object.entries(testResults.links || {}).map(([type, link]) => (
                  <div key={type} className="flex items-center space-x-2">
                    <span className="capitalize font-medium w-20">{type}:</span>
                    <a
                      href={link as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 underline flex items-center space-x-1"
                    >
                      <span className="truncate max-w-md">{link as string}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalizationContactPage;
