import React, { useState } from 'react';

const FooterSettingsPage: React.FC = () => {
  const [contactEmail, setContactEmail] = useState('contact@ma-training-consulting.com');
  const [contactPhone, setContactPhone] = useState('+33 1 23 45 67 89');
  const [contactAddress, setContactAddress] = useState('123 Avenue des Champs-Élysées, 75008 Paris');

    const [socialLinks, setSocialLinks] = useState([
    { name: 'Facebook', href: '#', icon: 'FaFacebookF' },
    { name: 'LinkedIn', href: '#', icon: 'FaLinkedinIn' },
    { name: 'WhatsApp', href: '#', icon: 'FaWhatsapp' },
    { name: 'Telegram', href: '#', icon: 'FaTelegramPlane' },
  ]);

  const [faqLinks, setFaqLinks] = useState([
    { title: 'Comment s\'inscrire ?', href: '#' },
    { title: 'Conditions de partenariat', href: '#' },
    { title: 'Avantages du programme', href: '#' },
    { title: 'Nos partenaires', href: '#' },
  ]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de sauvegarde des données (sera implémentée plus tard)
    console.log({ contactEmail, contactPhone, contactAddress, faqLinks, socialLinks });
    alert('Paramètres sauvegardés ! (Simulation)');
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestion du Footer</h1>
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
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                {/* Téléphone */}
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">Téléphone</label>
                  <input
                    type="text"
                    id="contactPhone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
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
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
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
                className="px-4 py-2 bg-primary-600 text-white font-semibold rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Sauvegarder les modifications
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FooterSettingsPage;
