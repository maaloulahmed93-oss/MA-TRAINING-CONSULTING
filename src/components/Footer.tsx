import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaLinkedinIn, FaWhatsapp, FaTelegramPlane, FaFilePdf } from 'react-icons/fa';
import { downloadParcoursProfessionnelPdf } from '../utils/parcoursProfessionnelPdfV2';

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

interface SocialLink {
  name: 'Facebook' | 'LinkedIn' | 'WhatsApp' | 'Telegram';
  href: string;
  icon: string;
}

interface CompanyInfo {
  name: string;
  description: string;
}

interface FooterSettings {
  contactInfo: ContactInfo;
  socialLinks: SocialLink[];
  companyInfo: CompanyInfo;
}

const Footer: React.FC = () => {
  const footerData: FooterSettings = {
    contactInfo: {
      email: 'contact@ma-training-consulting.com',
      phone: '+33 1 23 45 67 89',
      address: '123 Avenue des Champs-Élysées, 75008 Paris',
    },
    socialLinks: [
      { name: 'Facebook', href: '#', icon: 'FaFacebookF' },
      { name: 'LinkedIn', href: '#', icon: 'FaLinkedinIn' },
      { name: 'WhatsApp', href: '#', icon: 'FaWhatsapp' },
      { name: 'Telegram', href: '#', icon: 'FaTelegramPlane' },
    ],
    companyInfo: {
      name: 'MA-TRAINING-CONSULTING',
      description:
        'Votre partenaire stratégique pour la transformation digitale et le développement des compétences.',
    },
  };

  // Convertir le nom de l'icône en composant React
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
        return <FaFacebookF />; // Icône par défaut
    }
  };

  return (
    <footer id="site-footer" className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-10 space-y-4">
          <Link
            to="/verification-participant"
            className="group block rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 shadow-sm ring-1 ring-white/10 hover:from-indigo-500 hover:to-violet-500 transition-colors duration-200"
          >
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="text-xs sm:text-sm font-medium text-white/80">Accès rapide</div>
                <div className="mt-1 text-base sm:text-lg font-bold">
                  Vérification de participation au parcours professionnel
                </div>
              </div>
              <div className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15 group-hover:bg-white/15 transition-colors">
                Ouvrir
              </div>
            </div>
          </Link>

          <div
            className="block rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 shadow-sm ring-1 ring-white/10 opacity-70 cursor-not-allowed"
            aria-disabled="true"
          >
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="text-xs sm:text-sm font-medium text-white/80">Accès rapide</div>
                <div className="mt-1 text-base sm:text-lg font-bold">
                  Vérification de Prestataires Indépendants
                </div>
              </div>
              <div className="shrink-0 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/15">
                Bientôt disponible
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10 rounded-2xl bg-gray-950/30 p-6">
          <div className="text-xs sm:text-sm font-medium text-gray-300">Plus de détails en PDF</div>
          <button
            type="button"
            onClick={downloadParcoursProfessionnelPdf}
            className="mt-2 inline-flex items-center gap-2 text-gray-200 hover:text-white transition-colors duration-200 text-left font-semibold"
          >
            <FaFilePdf className="w-4 h-4" aria-hidden="true" />
            Différence entre le parcours d’accompagnement MATC et la formation classique
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

            {/* Social Media */}
            <div className="pt-4">
              <h3 className="text-xl font-bold">Rejoignez-nous</h3>
              <div className="flex mt-4 space-x-4">
                {footerData.socialLinks.map((link, index) => (
                  <a key={`${link.name}-${index}`} href={link.href} aria-label={link.name} className="text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-full">
                    <span className="sr-only">{link.name}</span>
                    {getIconComponent(link.icon)}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="col-span-1">
            <h3 className="text-xl font-bold">Espaces du parcours professionnel</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  to="/career-quest"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Service 1 — Career Quest (jeu)
                </Link>
              </li>
              <li>
                <Link
                  to="/service-2"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  Service 2 — Espace de mission professionnelle
                </Link>
              </li>
              <li>
                <Link to="/espace-participant" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Espace d’analyse & recommandations avancées
                </Link>
              </li>
              <li>
                <Link to="/espaces-ressources" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Espace Ressources &amp; Recommandations professionnelles
                </Link>
              </li>
            </ul>
          </div>

          {/* PDF */}

        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} {footerData.companyInfo.name}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
