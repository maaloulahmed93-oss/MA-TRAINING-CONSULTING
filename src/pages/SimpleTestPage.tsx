import React from 'react';

const SimpleTestPage: React.FC = () => {
  console.log('SimpleTestPage rendering');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Test Page</h1>
        <p className="text-gray-600 mb-4">
          This is a simple test page to verify routing is working.
        </p>
        <div className="space-y-2">
          <p><strong>Current URL:</strong> {window.location.pathname}</p>
          <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
        </div>
        <button 
          onClick={() => window.history.back()}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default SimpleTestPage;
