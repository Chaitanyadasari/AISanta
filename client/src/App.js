import React, { useState } from 'react';

function Login({ onLogin }) {
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
    </div>
  );
}

function Landing({ currentUser, assignment }) {
  return (
    <div className="landing-page">
      <h3>Welcome, {currentUser}</h3>
      {currentUser === 'Admin' ? (
        <p>Click 'NameCodes' to add/view players.</p>
      ) : (
        <p>You are Secret Santa for: <strong>{assignment}</strong></p>
      )}
    </div>
  );
}

function NameCodes({ codes, onAdd, isAdmin }) {
  const [newName, setNewName] = useState("");
  const handleAdd = () => {
    if (newName.trim()) {
      onAdd(newName.trim());
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
    </div>
  );
}

function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [assignment, setAssignment] = useState("");
  const [codes, setCodes] = useState([]);

  // Placeholder handlers until API is connected
  function handleLogin(nameCode, email) {
    setUser(nameCode);
    setPage("landing");
    if (nameCode !== "Admin") setAssignment("...");
  }
  function openNameCodes() {
    setPage("namecodes");
    setCodes(["Alice","Bob","Charlie"]); // Will call API later
  }
  function handleAddName(newName) {
    setCodes(prev => ([...prev, newName])); // Later, sent to API
  }

  return (
    <div>
      {page === "login" && <Login onLogin={handleLogin} />}
      {page !== "login" && (
        <nav>
          {user === 'Admin' && <button onClick={()=>setPage("landing")}>Home</button>}
          <button onClick={openNameCodes}>NameCodes</button>
          <button onClick={()=>setPage("login")}>Logout</button>
        </nav>
      )}
      {page === "landing" && user && (
        <Landing currentUser={user} assignment={assignment} />
      )}
      {page === "namecodes" && (
        <NameCodes codes={codes} onAdd={handleAddName} isAdmin={user==="Admin"} />
      )}
    </div>
  );
}

export default App;
