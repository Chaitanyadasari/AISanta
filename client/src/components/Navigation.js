import React from 'react';

function Navigation({ onHome, onNameCodes, onLogout, onSantaAI }) {
  return (
    <nav>
      <button onClick={onHome}>🏠 Home</button>
      <button onClick={onNameCodes}>👥 Players</button>
      <button onClick={onSantaAI} className="santa-ai-btn">🎅 Ask Santa AI</button>
      <button onClick={onLogout}>🚪 Logout</button>
    </nav>
  );
}

export default Navigation;

