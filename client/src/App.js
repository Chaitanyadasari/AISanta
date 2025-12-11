import React, { useState } from 'react';
import Login from './components/Login';
import Landing from './components/Landing';
import NameCodes from './components/NameCodes';
import AssignmentDisplay from './components/AssignmentDisplay';
import Navigation from './components/Navigation';
import { login, getAssignment, getNameCodes, addPlayer, generateAssignments } from './utils/api';
import './App.css';

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
      const data = await login(nameCode, email);
      if (!data.success) throw new Error(data.message || 'Login failed');
      setUser(nameCode);
      setUserEmail(email);
      setPage("landing");
      if (nameCode?.toLowerCase() !== "admin") {
        // Fetch assignment
        const assnData = await getAssignment(nameCode);
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
      const data = await getNameCodes();
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
      const data = await addPlayer(newName, newEmail);
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
    setLoadingGen(true); 
    setGenMessage("");
    try {
      const data = await generateAssignments(user);
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
        <Navigation
          onHome={() => setPage("landing")}
          onNameCodes={openNameCodes}
          onLogout={logout}
        />
      )}
      {page === "landing" && user && (
        <>
          <Landing
            currentUser={user}
            onGenerateAssignments={handleGenerateAssignments}
            genMessage={genMessage}
            loadingGen={loadingGen}
          />
          {user?.toLowerCase() !== 'admin' && (
            <AssignmentDisplay assignment={assignment} />
          )}
        </>
      )}
      {page === "namecodes" && (
        <NameCodes
          codes={codes}
          onAdd={handleAddName}
          isAdmin={user?.toLowerCase() === 'admin'}
          error={error}
          onAddSuccess={() => setPage("landing")}
        />
      )}
      {isLoading && <div className="loading">⏳ Loading...</div>}
    </div>
  );
}

export default App;
