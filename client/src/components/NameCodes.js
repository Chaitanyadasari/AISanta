import React, { useState } from 'react';

function NameCodes({ codes, onAdd, onDelete, isAdmin, error, onAddSuccess }) {
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [addMsg, setAddMsg] = useState("");
  const [deleteMsg, setDeleteMsg] = useState("");
  const [credentialsInfo, setCredentialsInfo] = useState(null);

  const handleAdd = async () => {
    setAddMsg("");
    setCredentialsInfo(null);
    if (newName.trim() && newEmail.trim()) {
      const r = await onAdd(newName.trim(), newEmail.trim(), onAddSuccess);
      if (r && r.success) {
        // Show username and temp password info
        setCredentialsInfo({
          username: r.username,
          tempPassword: r.tempPassword
        });
        setAddMsg("Player added successfully!");
        setNewName(""); 
        setNewEmail("");
      } else if (r && r.message) {
        setAddMsg(r.message);
      }
    } else {
      setAddMsg("Both Name and Email are required!");
    }
  };

  const handleDelete = async (nameCode) => {
    if (!window.confirm(`Are you sure you want to delete player "${nameCode}"?`)) {
      return;
    }
    setDeleteMsg("");
    const r = await onDelete(nameCode);
    if (r && r.success) {
      setDeleteMsg("Player deleted!");
      setTimeout(() => setDeleteMsg(""), 3000);
    } else if (r && r.message) {
      setDeleteMsg(r.message);
    }
  };

  return (
    <div className="namecodes-page">
      <h3>👥 All Players</h3>
      {codes.length > 0 ? (
        <ul className="namecodes-list">
          {codes.map(code => {
            const displayName = typeof code === 'string' ? code : code.nameCode;
            return (
              <li key={displayName} className="namecode-item">
                <span className="namecode-name">{displayName}</span>
                {isAdmin && (
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(displayName)}
                    title="Delete player"
                    aria-label={`Delete ${displayName}`}
                  >
                    ✕
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p style={{color:'#718096', fontSize:'1.1rem', marginTop:'2rem'}}>
          No players yet. Players can sign up directly, or you can add them below!
        </p>
      )}
      {deleteMsg && (
        <div className={deleteMsg.includes('deleted') ? 'success-message' : 'error'} style={{marginTop:10}}>
          {deleteMsg.includes('deleted') ? '✅ ' : '❌ '}{deleteMsg}
        </div>
      )}
      {isAdmin && (
        <div className="namecodes-form">
          <h4 style={{marginTop:0, marginBottom:'1rem', color:'#4a5568'}}>➕ Add New Player</h4>
          <p style={{fontSize:'0.9rem', color:'#718096', marginBottom:'1rem'}}>
            Note: If a player already signed up with this name, you cannot add them again.
          </p>
          <input 
            value={newName} 
            placeholder="Enter Full Name" 
            onChange={e=>setNewName(e.target.value)} 
          />
          <input 
            value={newEmail} 
            placeholder="Enter Email Address" 
            type="email" 
            onChange={e=>setNewEmail(e.target.value)} 
          />
          <button onClick={handleAdd}>💾 Add Player</button>
          {addMsg && (
            <div className={addMsg.includes('successfully') ? 'success-message' : 'error'} style={{marginTop:10}}>
              {addMsg.includes('successfully') ? '✅ ' : '❌ '}{addMsg}
            </div>
          )}
          {credentialsInfo && (
            <div style={{
              marginTop: '15px',
              padding: '15px',
              background: '#e6f7ff',
              border: '2px solid #1890ff',
              borderRadius: '10px',
              fontSize: '0.95rem'
            }}>
              <p style={{margin: '0 0 10px 0', fontWeight: 'bold', color: '#0050b3'}}>
                📋 Player Credentials (Share with player):
              </p>
              <p style={{margin: '5px 0'}}>
                <strong>Username:</strong> <code style={{background:'#fff', padding:'2px 8px', borderRadius:'4px'}}>{credentialsInfo.username}</code>
              </p>
              <p style={{margin: '5px 0'}}>
                <strong>Temp Password:</strong> <code style={{background:'#fff', padding:'2px 8px', borderRadius:'4px'}}>{credentialsInfo.tempPassword}</code>
              </p>
              <p style={{margin: '10px 0 0 0', fontSize: '0.85rem', color: '#666'}}>
                ⚠️ Make sure to share these credentials with the player securely!
              </p>
            </div>
          )}
        </div>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default NameCodes;
