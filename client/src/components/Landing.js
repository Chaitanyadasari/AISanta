import React from 'react';

function Landing({ currentUser, onGenerateAssignments, genMessage, loadingGen }) {
  return (
    <div className="landing-page">
      <h3>🎅 Welcome, {currentUser}!</h3>
      {currentUser?.toLowerCase() === 'admin' ? (
        <>
          <p style={{fontSize:'1.1rem', color:'#4a5568', marginBottom:'2rem'}}>
            Click 'NameCodes' to view/add players. Use the button below to generate Secret Santa assignments.
          </p>
          <div style={{marginBottom:20}}>
            <button 
              onClick={onGenerateAssignments} 
              disabled={loadingGen} 
              className="btn-generate"
            >
              {loadingGen ? '⏳ Generating...' : '🎁 Generate Assignments'}
            </button>
            {genMessage && (
              <div style={{
                fontSize:'0.97em',
                marginTop:15,
                padding:'12px 16px',
                borderRadius:'10px',
                color: genMessage.includes('success') ? '#155724' : '#b81212',
                background: genMessage.includes('success') ? '#d4edda' : '#f8d7da',
                borderLeft: `4px solid ${genMessage.includes('success') ? '#28a745' : '#dc3545'}`
              }}>
                {genMessage.includes('success') ? '✅ ' : '❌ '}{genMessage}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default Landing;

