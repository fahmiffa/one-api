import React from 'react';

const App: React.FC = () => {
  return (
    <div className="container">
      <header className="d-flex flex-column align-items-center justify-content-center min-vh-100">
        <h1 className="display-4 mb-4">Welcome to My App</h1>
        <p className="lead mb-4">This is a simple React app with Vite and TypeScript, using Bootstrap 5 for styling.</p>
        <button className="btn btn-primary">Get Started</button>
      </header>
    </div>
  );
};

export default App;
