import React from 'react';

function AssignmentDisplay({ assignment }) {
  if (!assignment || assignment === 'None assigned') {
    return null;
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

