import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="hero-container">
      <div className="hero-content">
        <h1 className="hero-title">Elyx Healthcare</h1>
        <Link to="/conversation" className="hero-button-link">
          <button className="hero-button">Go to Conversation</button>
        </Link>
        <Link to="/generate" className="generate-link">Generate Yourself</Link>
      </div>
    </div>
  );
}

export default App;