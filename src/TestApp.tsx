import React from 'react';

function TestApp() {
  console.log('TestApp: Rendering');
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <h1 className="text-white text-4xl font-bold">
        Test App is Working!
      </h1>
    </div>
  );
}

export default TestApp;
