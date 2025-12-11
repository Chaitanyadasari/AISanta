import React, { useState } from 'react';

const API_URL = 'http://localhost:5000/api';

function Login({ onLogin, error }) {
  const [nameCode, setNameCode] = useState("");
  const [email, setEmail] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(nameCode, email);
  };
  return (
    <div className="login-page">
      <h2>AI_Santa</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>NameCode:</label>
          <input value={nameCode} onChange={e => setNameCode(e.target.value)} required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  );
}

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

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [assignment, setAssignment] = useState("");
  const [codes, setCodes] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [loadingGen, setLoadingGen] = useState(false);
  const [genMessage, setGenMessage] = useState("");

  async function handleLogin(nameCode, email) {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameCode, email })
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) throw new Error(data.message || 'Login failed');
      setUser(nameCode);
      setUserEmail(email);
      setPage("landing");
      if (nameCode?.toLowerCase() !== "admin") {
        // Fetch assignment
        const assnResp = await fetch(`${API_URL}/getAssignment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nameCode })
        });
        const assnData = await assnResp.json();
        if (assnData.success) setAssignment(assnData.recipient);
        else setAssignment('None assigned');
      } else {
        setAssignment("");
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }
  async function openNameCodes() {
    setLoading(true);
    setError("");
    try {
      const resp = await fetch(`${API_URL}/namecodes`);
      const data = await resp.json();
      setCodes(data.nameCodes || []);
      setPage("namecodes");
    } catch (err) {
      setError("Failed to load NameCodes");
    } finally {
      setLoading(false);
    }
  }
  async function handleAddName(newName, newEmail, cbAfter) {
    setError("");
    try {
      const resp = await fetch(`${API_URL}/namecodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameCode: newName, email: newEmail })
      });
      const data = await resp.json();
      if (!data.success) return { success: false, message: data.message };
      // Re-fetch after add
      await openNameCodes();
      if (user?.toLowerCase() === "admin" && cbAfter) cbAfter();
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to add');
      return { success: false, message: err.message };
    }
  }
  async function handleGenerateAssignments() {
    setLoadingGen(true); setGenMessage("");
    try {
      const resp = await fetch(`${API_URL}/generate-assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameCode: user })
      });
      const data = await resp.json();
      if (data.success) setGenMessage('Assignments generated and emailed successfully!');
      else setGenMessage(data.message || 'Generation failed');
    } catch (err) {
      setGenMessage('Assignment generation failed.');
    } finally {
      setLoadingGen(false);
    }
  }

  function logout() {
    setUser(null);
    setAssignment("");
    setPage("login");
    setCodes([]);
    setError("");
    setUserEmail(null);
  }

  return (
    <div className={page !== "login" ? "app-container" : ""}>
      {page === "login" && (
        <div className="login-wrapper">
          <Login onLogin={handleLogin} error={error} />
        </div>
      )}
      {page !== "login" && (
        <nav>
          <button onClick={()=>setPage("landing")}>🏠 Home</button>
          <button onClick={openNameCodes}>👥 NameCodes</button>
          <button onClick={logout}>🚪 Logout</button>
        </nav>
      )}
      {page === "landing" && user && (
        <>
          <Landing
            currentUser={user}
            onGenerateAssignments={handleGenerateAssignments}
            genMessage={genMessage}
            loadingGen={loadingGen}
          />
          {user?.toLowerCase() !== 'admin' && assignment && assignment !== 'None assigned' && (
            <div className="assignment-display">
              <span className="santa-icon">🎁</span>
              <h3>You are Secret Santa for:</h3>
              <span className="assignment-name">{assignment}</span>
            </div>
          )}
        </>
      )}
      {page === "namecodes" && (
        <NameCodes
          codes={codes}
          onAdd={handleAddName}
          isAdmin={user?.toLowerCase() === 'admin'}
          error={error}
          onAddSuccess={()=>setPage("landing")}
        />
      )}
      {isLoading && <div className="loading">⏳ Loading...</div>}
    </div>
  );
}

export default App;
