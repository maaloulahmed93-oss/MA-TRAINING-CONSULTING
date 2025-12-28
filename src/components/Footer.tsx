import React, { useState, useEffect } from 'react';
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaTelegramPlane, FaFilePdf } from 'react-icons/fa';
import { footerApiService, FooterSettings } from '../services/footerApiService';
import { downloadParcoursProfessionnelPdf } from '../utils/parcoursProfessionnelPdfV2';

const Footer: React.FC = () => {
  const [footerData, setFooterData] = useState<FooterSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل إعدادات الفوتر عند بدء التشغيل
  useEffect(() => {
    loadFooterSettings();
  }, []);

  const loadFooterSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await footerApiService.getFooterSettings();
      
      if (settings) {
        setFooterData(settings);
        console.log('✅ تم تحميل إعدادات الفوتر من API');
      } else {
        // استخدام البيانات الافتراضية
        const defaultSettings = footerApiService.getDefaultFooterSettings();
        setFooterData(defaultSettings);
        console.log('⚠️ تم استخدام البيانات الافتراضية للفوتر');
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل إعدادات الفوتر:', error);
      // استخدام البيانات الافتراضية في حالة الخطأ
      const defaultSettings = footerApiService.getDefaultFooterSettings();
      setFooterData(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const excludedFaqTitles = new Set([
    "🎓 Programme Formateurs",
    "💼 Programme Freelancer (Indépendant)",
    "📈 Programme Commercial",
    "🏢 Programme Entreprise",
    "🎓 Foire aux Questions – Nos programmes de formation",
  ]);

  const visibleFaqLinks = (footerData?.faqLinks ?? []).filter((link) => !excludedFaqTitles.has(link.title));

  // عرض loading أثناء التحميل
  if (isLoading || !footerData) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-2">Chargement...</span>
          </div>
        </div>
      </footer>
    );
  }

  // دالة لتحويل اسم الأيقونة إلى مكون React
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'FaFacebookF':
        return <FaFacebookF />;
      case 'FaLinkedinIn':
        return <FaLinkedinIn />;
      case 'FaWhatsapp':
        return <FaWhatsapp />;
      case 'FaTelegramPlane':
        return <FaTelegramPlane />;
      default:
        return <FaFacebookF />; // أيقونة افتراضية
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2 lg:col-span-2 space-y-4">
            <h3 className="text-xl font-bold tracking-wider">{footerData.companyInfo.name}</h3>
            <p className="text-gray-400 pr-4">
              {footerData.companyInfo.description}
            </p>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg>
                <span>{footerData.contactInfo.email}</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg>
                <span>{footerData.contactInfo.phone}</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                <span>{footerData.contactInfo.address}</span>
              </li>
            </ul>
          </div>

          {/* FAQ */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold">FAQ Service MA-TRAINING-CONSULTING</h3>
            <ul className="mt-4 space-y-2">
              {visibleFaqLinks.map((link, index) => (
                <li key={`${link.title}-${index}`}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors duration-200">
                    {link.title}
                  </a>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={downloadParcoursProfessionnelPdf}
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-left inline-flex items-center gap-2"
                >
                  <FaFilePdf className="w-4 h-4" aria-hidden="true" />
                  Parcours professionnel
                </button>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold">Rejoignez-nous</h3>
            <div className="flex mt-4 space-x-4">
              {footerData.socialLinks.map((link, index) => (
                <a key={`${link.name}-${index}`} href={link.href} aria-label={link.name} className="text-gray-400 hover:text-white transition-colors duration-200 p-2 border border-gray-700 rounded-full">
                  <span className="sr-only">{link.name}</span>
                  {getIconComponent(link.icon)}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} {footerData.companyInfo.name}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
