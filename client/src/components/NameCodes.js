import React, { useState } from 'react';

function NameCodes({ codes, onAdd, isAdmin, error, onAddSuccess }) {
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [addMsg, setAddMsg] = useState("");
  const handleAdd = async () => {
    setAddMsg("");
    if (newName.trim() && newEmail.trim()) {
      const r = await onAdd(newName.trim(), newEmail.trim(), onAddSuccess);
      if (r && r.success) {
        setAddMsg("Player added!");
        setNewName(""); setNewEmail("");
      } else if (r && r.message) {
        setAddMsg(r.message);
      }
    } else {
      setAddMsg("Both NameCode and Email required!");
    }
  };
  return (
    <div className="namecodes-page">
      <h3>👥 All NameCodes</h3>
      {codes.length > 0 ? (
        <ul>{codes.map(name => <li key={name}>{name}</li>)}</ul>
      ) : (
        <p style={{color:'#718096', fontSize:'1.1rem', marginTop:'2rem'}}>No players added yet. Add your first player below!</p>
      )}
      {isAdmin && (
        <div className="namecodes-form">
          <h4 style={{marginTop:0, marginBottom:'1rem', color:'#4a5568'}}>➕ Add New Player</h4>
          <input value={newName} placeholder="Enter NameCode" onChange={e=>setNewName(e.target.value)} />
          <input value={newEmail} placeholder="Enter Email Address" type="email" onChange={e=>setNewEmail(e.target.value)} />
          <button onClick={handleAdd}>💾 Save Player</button>
          {addMsg && (
            <div className={addMsg.includes('added') ? 'success-message' : 'error'} style={{marginTop:10}}>
              {addMsg.includes('added') ? '✅ ' : '❌ '}{addMsg}
            </div>
          )}
        </div>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default NameCodes;

