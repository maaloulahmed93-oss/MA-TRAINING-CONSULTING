import React from 'react';

/**
 * Test App WITHOUT React Router
 * To isolate if the problem is specifically with React Router
 */
const App: React.FC = () => {
  console.log('🚀 Test App WITHOUT Router Starting...');
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          MATC Admin Panel
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Test Version - No Router
        </p>
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          ✅ App loaded successfully without React Router!
        </div>
      </div>
    </div>
  );
};

export default App;
