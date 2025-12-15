import React from 'react';

const DiagnosticWonderForm: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Page supprimée</h1>
        <p className="text-gray-600 text-lg mb-8">Cette page n'est plus disponible.</p>
        <a href="/" className="bg-blue-600 text-white py-3 px-8 rounded-lg font-bold hover:bg-blue-700">
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
};

export default DiagnosticWonderForm;
