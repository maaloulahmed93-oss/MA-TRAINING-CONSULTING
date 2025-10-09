import React, { useState, useEffect } from 'react';
import { footerApiService, FooterSettings, ContactInfo, FaqLink, SocialLink, CompanyInfo } from '../services/footerApiService';

const FooterSettingsPage: React.FC = () => {
  // États pour les données du formulaire
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'contact@ma-training-consulting.com',
    phone: '+33 1 23 45 67 89',
    address: '123 Avenue des Champs-Élysées, 75008 Paris'
  });

  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { name: 'Facebook', href: '#', icon: 'FaFacebookF' },
    { name: 'LinkedIn', href: '#', icon: 'FaLinkedinIn' },
    { name: 'WhatsApp', href: '#', icon: 'FaWhatsapp' },
    { name: 'Telegram', href: '#', icon: 'FaTelegramPlane' },
  ]);

  const [faqLinks, setFaqLinks] = useState<FaqLink[]>([
    { title: 'Comment s\'inscrire ?', href: '#' },
    { title: 'Conditions de partenariat', href: '#' },
    { title: 'Avantages du programme', href: '#' },
    { title: 'Nos partenaires', href: '#' },
  ]);

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: 'MA-TRAINING-CONSULTING',
    description: 'Votre partenaire stratégique pour la transformation digitale et le développement des compétences.'
  });

  // États pour l'interface utilisateur
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isApiConnected, setIsApiConnected] = useState(false);

  const handleFaqChange = (index: number, field: 'title' | 'href', value: string) => {
    const newFaqs = [...faqLinks];
    newFaqs[index][field] = value;
    setFaqLinks(newFaqs);
  };

  const addFaqLink = () => {
    setFaqLinks([...faqLinks, { title: '', href: '' }]);
  };

    const handleSocialLinkChange = (index: number, value: string) => {
    const newSocials = [...socialLinks];
    newSocials[index].href = value;
    setSocialLinks(newSocials);
  };

  const removeFaqLink = (index: number) => {
    const newFaqs = faqLinks.filter((_, i) => i !== index);
    setFaqLinks(newFaqs);
  };

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    loadFooterSettings();
    testApiConnection();
  }, []);

  // اختبار الاتصال بـ API
  const testApiConnection = async () => {
    const connected = await footerApiService.testConnection();
    setIsApiConnected(connected);
  };

  // تحميل إعدادات الفوتر من API
  const loadFooterSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await footerApiService.getFooterSettings();
      
      if (settings) {
        setContactInfo(settings.contactInfo);
        setFaqLinks(settings.faqLinks);
        setSocialLinks(settings.socialLinks);
        setCompanyInfo(settings.companyInfo);
        
        showMessage('success', 'تم تحميل إعدادات الفوتر من قاعدة البيانات');
      } else {
        // استخدام localStorage كـ fallback
        loadFromLocalStorage();
        showMessage('error', 'فشل في تحميل البيانات من API، تم استخدام البيانات المحلية');
      }
    } catch (error) {
      console.error('خطأ في تحميل الإعدادات:', error);
      loadFromLocalStorage();
      showMessage('error', 'خطأ في الاتصال، تم استخدام البيانات المحلية');
    } finally {
      setIsLoading(false);
    }
  };

  // تحميل البيانات من localStorage
  const loadFromLocalStorage = () => {
    try {
      const savedSettings = localStorage.getItem('footerSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setContactInfo(settings.contactInfo || contactInfo);
        setFaqLinks(settings.faqLinks || faqLinks);
        setSocialLinks(settings.socialLinks || socialLinks);
        setCompanyInfo(settings.companyInfo || companyInfo);
      }
    } catch (error) {
      console.error('خطأ في تحميل البيانات المحلية:', error);
    }
  };

  // حفظ البيانات في localStorage
  const saveToLocalStorage = (settings: FooterSettings) => {
    try {
      localStorage.setItem('footerSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('خطأ في حفظ البيانات المحلية:', error);
    }
  };

  // عرض رسالة للمستخدم
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // معالجة إرسال النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const settingsData: Omit<FooterSettings, '_id' | 'createdAt' | 'updatedAt'> = {
      contactInfo,
      faqLinks,
      socialLinks,
      companyInfo,
      isActive: true,
      updatedBy: 'admin-panel'
    };

    try {
      // محاولة الحفظ في API أولاً
      const savedSettings = await footerApiService.updateFooterSettings(settingsData);
      
      if (savedSettings) {
        // حفظ في localStorage كـ backup
        saveToLocalStorage(savedSettings);
        showMessage('success', 'تم حفظ إعدادات الفوتر بنجاح في قاعدة البيانات');
      } else {
        // حفظ في localStorage فقط
        saveToLocalStorage(settingsData as FooterSettings);
        showMessage('error', 'فشل في حفظ البيانات في API، تم الحفظ محلياً فقط');
      }
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      // حفظ في localStorage كـ fallback
      saveToLocalStorage(settingsData as FooterSettings);
      showMessage('error', 'خطأ في الاتصال، تم الحفظ محلياً فقط');
    } finally {
      setIsSaving(false);
    }
  };

  // إعادة تعيين الإعدادات
  const handleReset = async () => {
    if (!confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات للقيم الافتراضية؟')) {
      return;
    }

    setIsLoading(true);
    try {
      const defaultSettings = await footerApiService.resetFooterSettings();
      
      if (defaultSettings) {
        setContactInfo(defaultSettings.contactInfo);
        setFaqLinks(defaultSettings.faqLinks);
        setSocialLinks(defaultSettings.socialLinks);
        setCompanyInfo(defaultSettings.companyInfo);
        
        showMessage('success', 'تم إعادة تعيين الإعدادات للقيم الافتراضية');
      } else {
        showMessage('error', 'فشل في إعادة تعيين الإعدادات');
      }
    } catch (error) {
      console.error('خطأ في إعادة التعيين:', error);
      showMessage('error', 'خطأ في إعادة تعيين الإعدادات');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header avec statut API */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Gestion du Footer</h1>
        <div className="flex items-center space-x-4">
          <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
            isApiConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              isApiConnected ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            {isApiConnected ? 'API Connecté' : 'API Déconnecté'}
          </div>
          <button
            type="button"
            onClick={handleReset}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Messages d'état */}
      {message && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-md">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-800 mr-2"></div>
            Chargement des données...
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          {/* Section Informations de Contact */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Informations de Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="contactEmail"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                {/* Téléphone */}
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    type="text"
                    id="contactPhone"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              {/* Adresse */}
              <div className="mt-6">
                <label htmlFor="contactAddress" className="block text-sm font-medium text-gray-700">Adresse</label>
                <textarea
                  id="contactAddress"
                  rows={3}
                  value={contactInfo.address}
                  onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Section FAQ */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">FAQ Programme Partenariat</h2>
            <div className="space-y-4">
              {faqLinks.map((faq, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-md">
                  <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Titre de la question"
                      value={faq.title}
                      onChange={(e) => handleFaqChange(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="URL du lien"
                      value={faq.href}
                      onChange={(e) => handleFaqChange(index, 'href', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFaqLink(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addFaqLink}
              className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Ajouter un lien FAQ
            </button>
          </div>

          {/* Section Rejoignez-nous */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Réseaux Sociaux (Rejoignez-nous)</h2>
            <div className="space-y-4">
              {socialLinks.map((social, index) => (
                <div key={social.name} className="flex items-center space-x-4">
                  <label htmlFor={`social-${social.name}`} className="w-24 font-medium text-gray-700">{social.name}</label>
                  <input
                    type="text"
                    id={`social-${social.name}`}
                    placeholder={`URL du profil ${social.name}`}
                    value={social.href}
                    onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                    className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bouton de sauvegarde */}
          <div className="mt-8 pt-5 border-t border-gray-200">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </div>
                ) : (
                  'Sauvegarder les modifications'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FooterSettingsPage;
