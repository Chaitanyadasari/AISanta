import React from 'react';

function Landing({ currentUser, onGenerateAssignments, onResetAssignments, genMessage, loadingGen }) {
  return (
    <div className="landing-page-container">
      <div className="landing-page">
        <h3>🎅 Welcome, {currentUser}!</h3>
        {currentUser?.toLowerCase() === 'admin' ? (
          <>
            <p style={{fontSize:'1.1rem', color:'#4a5568', marginBottom:'2rem'}}>
              Click 'NameCodes' to view/add players. Use the buttons below to manage Secret Santa assignments.
            </p>
            <div style={{marginBottom:20}}>
              <button
                onClick={onGenerateAssignments}
                disabled={loadingGen}
                className="btn-generate"
                style={{marginBottom: '12px'}}
              >
                {loadingGen ? '⏳ Generating...' : '🎁 Generate Assignments'}
              </button>
              <button
                onClick={onResetAssignments}
                disabled={loadingGen}
                className="btn-reset"
              >
                {loadingGen ? '⏳ Resetting...' : '🔄 Reset Assignments'}
              </button>
              {genMessage && (
                <div style={{
                  fontSize:'0.97em',
                  marginTop:15,
                  padding:'12px 16px',
                  borderRadius:'10px',
                  color: genMessage.includes('success') || genMessage.includes('cleared') ? '#155724' : '#b81212',
                  background: genMessage.includes('success') || genMessage.includes('cleared') ? '#d4edda' : '#f8d7da',
                  borderLeft: `4px solid ${genMessage.includes('success') || genMessage.includes('cleared') ? '#28a745' : '#dc3545'}`
                }}>
                  {genMessage.includes('success') || genMessage.includes('cleared') ? '✅ ' : '❌ '}{genMessage}
                </div>
              )}
            </div>
          </>
        ) : (
          <p style={{fontSize:'1.1rem', color:'#4a5568', marginBottom:'2rem'}}>
            Welcome to AI Santa! Your Secret Santa assignment will appear below once the admin generates assignments.
          </p>
        )}
      </div>
    </div>
  );
}

export default Landing;

