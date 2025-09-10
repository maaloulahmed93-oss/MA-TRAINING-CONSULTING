import React, { useState } from 'react';
import {
  PhotoIcon,
  EyeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

/**
 * Hero Section Management Page
 * Edit hero section content
 */
const HeroSectionPage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: 'Transformez votre carrière avec MATC',
    subtitle: 'Formations professionnelles de qualité pour développer vos compétences',
    description: 'Rejoignez des milliers d\'étudiants qui ont fait confiance à MATC pour leur développement professionnel. Nos formations sont conçues par des experts et adaptées aux besoins du marché.',
    primaryButtonText: 'Découvrir nos formations',
    secondaryButtonText: 'En savoir plus',
    backgroundImage: '/images/hero-bg.jpg',
    videoUrl: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    // Show success message (you can implement toast notifications)
    alert('Section Hero mise à jour avec succès !');
  };

  const handleReset = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser les modifications ?')) {
      setFormData({
        title: 'Transformez votre carrière avec MATC',
        subtitle: 'Formations professionnelles de qualité pour développer vos compétences',
        description: 'Rejoignez des milliers d\'étudiants qui ont fait confiance à MATC pour leur développement professionnel. Nos formations sont conçues par des experts et adaptées aux besoins du marché.',
        primaryButtonText: 'Découvrir nos formations',
        secondaryButtonText: 'En savoir plus',
        backgroundImage: '/images/hero-bg.jpg',
        videoUrl: '',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Section Hero</h1>
          <p className="mt-2 text-gray-600">
            Gérez le contenu de votre page d'accueil principale
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Réinitialiser
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <EyeIcon className="h-4 w-4 mr-2" />
            Aperçu
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Contenu Principal</h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Titre Principal
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Titre accrocheur de votre section hero"
              />
            </div>

            {/* Subtitle */}
            <div>
              <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                Sous-titre
              </label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Sous-titre explicatif"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Description détaillée de votre offre"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Boutons d'Action</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Primary Button */}
              <div>
                <label htmlFor="primaryButtonText" className="block text-sm font-medium text-gray-700 mb-2">
                  Bouton Principal
                </label>
                <input
                  type="text"
                  id="primaryButtonText"
                  name="primaryButtonText"
                  value={formData.primaryButtonText}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Texte du bouton principal"
                />
              </div>

              {/* Secondary Button */}
              <div>
                <label htmlFor="secondaryButtonText" className="block text-sm font-medium text-gray-700 mb-2">
                  Bouton Secondaire
                </label>
                <input
                  type="text"
                  id="secondaryButtonText"
                  name="secondaryButtonText"
                  value={formData.secondaryButtonText}
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Texte du bouton secondaire"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Media */}
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Médias</h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Background Image */}
            <div>
              <label htmlFor="backgroundImage" className="block text-sm font-medium text-gray-700 mb-2">
                Image de Fond
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  id="backgroundImage"
                  name="backgroundImage"
                  value={formData.backgroundImage}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="URL de l'image de fond"
                />
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PhotoIcon className="h-4 w-4 mr-2" />
                  Parcourir
                </button>
              </div>
            </div>

            {/* Video URL */}
            <div>
              <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
                URL Vidéo (Optionnel)
              </label>
              <input
                type="url"
                id="videoUrl"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleInputChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="https://youtube.com/watch?v=..."
              />
              <p className="mt-1 text-sm text-gray-500">
                URL d'une vidéo YouTube ou Vimeo pour remplacer l'image de fond
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sauvegarde...
              </div>
            ) : (
              'Sauvegarder les modifications'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HeroSectionPage;
