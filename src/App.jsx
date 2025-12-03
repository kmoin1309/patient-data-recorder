import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ConsentForm from './components/ConsentForm';

function App() {
  // In v2, the Dashboard handles the session and patient flow.
  // The App component is now just a wrapper.

  return (
    <div className="font-sans text-gray-900">
      <Dashboard />
    </div>
  );
}

export default App;
