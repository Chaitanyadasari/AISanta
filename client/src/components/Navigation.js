import React from 'react';

function Navigation({ onHome, onNameCodes, onLogout }) {
  return (
    <nav>
      <button onClick={onHome}>🏠 Home</button>
      <button onClick={onNameCodes}>👥 Players</button>
      <button onClick={onLogout}>🚪 Logout</button>
    </nav>
  );
}

export default Navigation;

