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

function Landing({ currentUser, onAddNameCodes }) {
  return (
    <div className="landing-page">
      <h3>Welcome, {currentUser}</h3>
      {currentUser?.toLowerCase() === 'admin' ? (
        <>
          <p>Click 'NameCodes' to view all, or use button below to add players.</p>
          <button onClick={onAddNameCodes} style={{marginBottom:20}}>Add NameCodes</button>
        </>
      ) : null}
    </div>
  );
}

function NameCodes({ codes, onAdd, isAdmin, error, onAddSuccess }) {
  const [newName, setNewName] = useState("");
  const handleAdd = async () => {
    if (newName.trim()) {
      await onAdd(newName.trim(), onAddSuccess);
      setNewName("");
    }
  };
  return (
    <div className="namecodes-page">
      <h3>All NameCodes:</h3>
      <ul>{codes.map(name => <li key={name}>{name}</li>)}</ul>
      {isAdmin && (
        <div style={{marginTop:20}}>
          <input value={newName} placeholder="Add new name" onChange={e=>setNewName(e.target.value)} />
          <button onClick={handleAdd}>Save</button>
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
      if (nameCode !== "Admin") {
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
  async function handleAddName(newName, cbAfter) {
    setError("");
    try {
      const resp = await fetch(`${API_URL}/namecodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nameCode: newName })
      });
      const data = await resp.json();
      if (!data.success) throw new Error(data.message || 'Could not add');
      // Re-fetch after add
      await openNameCodes();
      if (user === "Admin" && cbAfter) cbAfter();
    } catch (err) {
      setError(err.message || 'Failed to add');
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
    <div>
      {page === "login" && <Login onLogin={handleLogin} error={error} />}
      {page !== "login" && (
        <nav>
          <button onClick={()=>setPage("landing")}>Home</button>
          <button onClick={openNameCodes}>NameCodes</button>
          <button onClick={logout}>Logout</button>
        </nav>
      )}
      {page === "landing" && user && (
        <Landing currentUser={user} onAddNameCodes={()=>setPage("namecodes")} />
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
      {isLoading && <div className="loading">Loading...</div>}
    </div>
  );
}

export default App;
