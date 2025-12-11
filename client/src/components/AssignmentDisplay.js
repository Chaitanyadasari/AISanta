import React from 'react';

function AssignmentDisplay({ assignment }) {
  // Show "Wait and Watch" if no assignment exists yet
  if (!assignment || assignment === 'None assigned' || assignment === '') {
    return (
      <div className="assignment-display" style={{background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'}}>
        <span className="santa-icon">⏳</span>
        <h3>Wait and Watch</h3>
        <p style={{fontSize: '1.2rem', marginTop: '1rem', opacity: 0.9}}>
          Your Secret Santa assignment will be revealed soon!
        </p>
      </div>
    );
  }
  
  return (
    <div className="assignment-display">
      <span className="santa-icon">🎁</span>
      <h3>You are Secret Santa for:</h3>
      <span className="assignment-name">{assignment}</span>
    </div>
  );
}

export default AssignmentDisplay;

