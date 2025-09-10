import React from 'react';

/**
 * Loading Spinner Component
 * Used for loading states throughout the application
 */
const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        
        {/* Loading text */}
        <div className="text-gray-600 text-sm font-medium">
          Chargement...
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
