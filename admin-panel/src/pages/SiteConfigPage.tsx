import React, { useState, useEffect } from 'react';
import { siteConfigApiService, SiteConfig } from '../services/siteConfigApiService';
import { 
  CogIcon, 
  GlobeAltIcon, 
  PhotoIcon, 
  PaintBrushIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const SiteConfigPage: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [apiConnected, setApiConnected] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'contact' | 'social' | 'seo'>('general');

  useEffect(() => {
    loadConfig();
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    const connected = await siteConfigApiService.checkApiConnection();
    setApiConnected(connected);
  };

  const loadConfig = async () => {
    try {
      setLoading(true);
      const siteConfig = await siteConfigApiService.getSiteConfig();
      setConfig(siteConfig);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      showMessage('error', 'Erreur lors du chargement de la configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);
      const updatedConfig = await siteConfigApiService.updateSiteConfig(config);
      setConfig(updatedConfig);
      showMessage('success', 'Configuration sauvegardée avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showMessage('error', 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'favicon' | 'logo') => {
    try {
      setUploading(true);
      const result = await siteConfigApiService.uploadFile(file, type);
      
      if (config) {
        setConfig({
          ...config,
          [type]: result[type] || config[type]
        });
      }
      
      showMessage('success', `${type === 'favicon' ? 'Favicon' : 'Logo'} uploadé avec succès`);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      showMessage('error', 'Erreur lors de l\'upload du fichier');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser la configuration ?')) return;

    try {
      setSaving(true);
      const defaultConfig = await siteConfigApiService.resetSiteConfig();
      setConfig(defaultConfig);
      showMessage('success', 'Configuration réinitialisée avec succès');
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      showMessage('error', 'Erreur lors de la réinitialisation');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const updateConfig = (field: string, value: any) => {
    if (!config) return;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setConfig({
        ...config,
        [parent]: {
          ...(config as any)[parent],
          [child]: value
        }
      });
    } else {
      setConfig({
        ...config,
        [field]: value
      });
    }
  };

  const tabs = [
    { id: 'general', name: 'Général', icon: CogIcon },
    { id: 'appearance', name: 'Apparence', icon: PaintBrushIcon },
    { id: 'contact', name: 'Contact', icon: PhoneIcon },
    { id: 'social', name: 'Réseaux Sociaux', icon: ShareIcon },
    { id: 'seo', name: 'SEO', icon: MagnifyingGlassIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Chargement de la configuration...</span>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Erreur lors du chargement de la configuration</p>
        <button 
          onClick={loadConfig}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <CogIcon className="h-8 w-8 mr-3 text-blue-600" />
            Configuration Site
          </h1>
          <p className="mt-2 text-gray-600">Configurez les paramètres généraux de votre site</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* API Status */}
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full ${apiConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="ml-2 text-sm text-gray-600">
              {apiConnected ? 'API Connecté' : 'Mode Local'}
            </span>
          </div>
          
          {/* Actions */}
          <button
            onClick={handleReset}
            disabled={saving}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Réinitialiser
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {saving ? (
              <>
                <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                Sauvegarde...
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Sauvegarder
              </>
            )}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 mr-2" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <GlobeAltIcon className="h-4 w-4 inline mr-1" />
                  Nom du Site
                </label>
                <input
                  type="text"
                  value={config.siteName}
                  onChange={(e) => updateConfig('siteName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="3d MA-TRAINING-CONSULTING"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du Site (pour l'onglet)
                </label>
                <input
                  type="text"
                  value={config.siteTitle}
                  onChange={(e) => updateConfig('siteTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="3d MA-TRAINING-CONSULTING - Formation et Consulting"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description du Site
              </label>
              <textarea
                value={config.siteDescription}
                onChange={(e) => updateConfig('siteDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Centre de formation professionnelle et consulting en Tunisie"
              />
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Favicon Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PhotoIcon className="h-4 w-4 inline mr-1" />
                  Favicon
                </label>
                <div className="flex items-center space-x-4">
                  {config.favicon && (
                    <img 
                      src={config.favicon.startsWith('/') ? `http://localhost:3001${config.favicon}` : config.favicon}
                      alt="Favicon"
                      className="h-8 w-8"
                    />
                  )}
                  <input
                    type="file"
                    accept=".ico,.png,.jpg,.jpeg,.svg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'favicon');
                    }}
                    disabled={uploading}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Formats acceptés: .ico, .png, .jpg, .svg (max 5MB)</p>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <div className="flex items-center space-x-4">
                  {config.logo && (
                    <img 
                      src={config.logo.startsWith('/') ? `http://localhost:3001${config.logo}` : config.logo}
                      alt="Logo"
                      className="h-12 w-auto"
                    />
                  )}
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'logo');
                    }}
                    disabled={uploading}
                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Formats acceptés: .png, .jpg, .svg (max 5MB)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PaintBrushIcon className="h-4 w-4 inline mr-1" />
                  Couleur Principale
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => updateConfig('primaryColor', e.target.value)}
                    className="h-10 w-20 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => updateConfig('primaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur Secondaire
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={config.secondaryColor}
                    onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                    className="h-10 w-20 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.secondaryColor}
                    onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="#1E40AF"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                  Email de Contact
                </label>
                <input
                  type="email"
                  value={config.contactEmail}
                  onChange={(e) => updateConfig('contactEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="contact@ma-training-consulting.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <PhoneIcon className="h-4 w-4 inline mr-1" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={config.contactPhone}
                  onChange={(e) => updateConfig('contactPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+216 XX XXX XXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPinIcon className="h-4 w-4 inline mr-1" />
                Adresse
              </label>
              <input
                type="text"
                value={config.address}
                onChange={(e) => updateConfig('address', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tunis, Tunisie"
              />
            </div>
          </div>
        )}

        {/* Social Tab */}
        {activeTab === 'social' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Facebook
                </label>
                <input
                  type="url"
                  value={config.socialMedia.facebook}
                  onChange={(e) => updateConfig('socialMedia.facebook', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://facebook.com/votre-page"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  value={config.socialMedia.linkedin}
                  onChange={(e) => updateConfig('socialMedia.linkedin', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://linkedin.com/company/votre-entreprise"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Twitter
                </label>
                <input
                  type="url"
                  value={config.socialMedia.twitter}
                  onChange={(e) => updateConfig('socialMedia.twitter', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://twitter.com/votre-compte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instagram
                </label>
                <input
                  type="url"
                  value={config.socialMedia.instagram}
                  onChange={(e) => updateConfig('socialMedia.instagram', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://instagram.com/votre-compte"
                />
              </div>
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MagnifyingGlassIcon className="h-4 w-4 inline mr-1" />
                Mots-clés SEO
              </label>
              <input
                type="text"
                value={config.seo.keywords}
                onChange={(e) => updateConfig('seo.keywords', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="formation, consulting, tunisie, professionnelle"
              />
              <p className="text-xs text-gray-500 mt-1">Séparez les mots-clés par des virgules</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Analytics ID
                </label>
                <input
                  type="text"
                  value={config.seo.googleAnalytics}
                  onChange={(e) => updateConfig('seo.googleAnalytics', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Tag Manager ID
                </label>
                <input
                  type="text"
                  value={config.seo.googleTagManager}
                  onChange={(e) => updateConfig('seo.googleTagManager', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="GTM-XXXXXXX"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteConfigPage;
