import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Landing from './components/Landing';
import NameCodes from './components/NameCodes';
import AssignmentDisplay from './components/AssignmentDisplay';
import Navigation from './components/Navigation';
import { login, getAssignment, getNameCodes, addPlayer, generateAssignments } from './utils/api';
import './App.css';

function App() {
  // Initialize state from localStorage or defaults
  const [page, setPage] = useState(() => {
    const savedPage = localStorage.getItem('santa_page');
    return savedPage || "login";
  });
  const [user, setUser] = useState(() => {
    return localStorage.getItem('santa_user') || null;
  });
  const [userEmail, setUserEmail] = useState(() => {
    return localStorage.getItem('santa_userEmail') || null;
  });
  const [assignment, setAssignment] = useState(() => {
    return localStorage.getItem('santa_assignment') || "";
  });
  const [codes, setCodes] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [loadingGen, setLoadingGen] = useState(false);
  const [genMessage, setGenMessage] = useState("");

  // Function to check for assignment updates
  const checkAssignment = async (nameCode) => {
    if (nameCode?.toLowerCase() !== "admin") {
      try {
        const assnData = await getAssignment(nameCode);
        if (assnData.success) {
          setAssignment(assnData.recipient);
          localStorage.setItem('santa_assignment', assnData.recipient);
        } else {
          setAssignment('');
          localStorage.setItem('santa_assignment', '');
        }
      } catch (err) {
        // Error checking assignment
      }
    }
  };

  // Restore session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('santa_user');
    const savedPage = localStorage.getItem('santa_page');
    const savedAssignment = localStorage.getItem('santa_assignment');
    
    if (savedUser && savedPage && savedPage !== "login") {
      // User was logged in, restore their session
      setUser(savedUser);
      setUserEmail(localStorage.getItem('santa_userEmail'));
      setPage(savedPage);
      setAssignment(savedAssignment || "");
      
      // If not admin, always check for assignment updates on load
      if (savedUser?.toLowerCase() !== "admin") {
        checkAssignment(savedUser);
      }
      
      // If on namecodes page, reload the codes
      if (savedPage === "namecodes") {
        getNameCodes().then(data => {
          setCodes(data.nameCodes || []);
        });
      }
    }
  }, []);

  // Check for assignment updates when landing page is visited by non-admin
  useEffect(() => {
    if (page === "landing" && user && user?.toLowerCase() !== "admin") {
      checkAssignment(user);
    }
  }, [page, user]);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('santa_user', user);
    } else {
      localStorage.removeItem('santa_user');
    }
  }, [user]);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('santa_userEmail', userEmail);
    } else {
      localStorage.removeItem('santa_userEmail');
    }
  }, [userEmail]);

  useEffect(() => {
    if (page) {
      localStorage.setItem('santa_page', page);
    }
  }, [page]);

  useEffect(() => {
    if (assignment) {
      localStorage.setItem('santa_assignment', assignment);
    } else {
      localStorage.removeItem('santa_assignment');
    }
  }, [assignment]);

  async function handleLogin(nameCode, email) {
    setLoading(true);
    setError("");
    try {
      const data = await login(nameCode, email);
      if (!data.success) throw new Error(data.message || 'Login failed');
      setUser(nameCode);
      setUserEmail(email);
      setPage("landing");
      // Save to localStorage
      localStorage.setItem('santa_user', nameCode);
      localStorage.setItem('santa_userEmail', email);
      localStorage.setItem('santa_page', 'landing');
      
      if (nameCode?.toLowerCase() !== "admin") {
        // Only fetch existing assignment - don't create new ones
        const assnData = await getAssignment(nameCode);
        if (assnData.success) {
          setAssignment(assnData.recipient);
          localStorage.setItem('santa_assignment', assnData.recipient);
        } else {
          // No assignment yet - show "Wait and Watch"
          setAssignment('');
          localStorage.setItem('santa_assignment', '');
        }
      } else {
        setAssignment("");
        localStorage.removeItem('santa_assignment');
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
      localStorage.setItem('santa_page', 'namecodes');
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
      if (data.success) {
        setGenMessage('Assignments generated and emailed successfully!');
        // Clear any cached assignments so players see their new assignments
        localStorage.removeItem('santa_assignment');
        setAssignment('');
      } else {
        setGenMessage(data.message || 'Generation failed');
      }
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
    // Clear all session data from localStorage
    localStorage.removeItem('santa_user');
    localStorage.removeItem('santa_userEmail');
    localStorage.removeItem('santa_page');
    localStorage.removeItem('santa_assignment');
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
          onHome={() => {
            setPage("landing");
            localStorage.setItem('santa_page', 'landing');
          }}
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
            <AssignmentDisplay assignment={assignment || ''} />
          )}
        </>
      )}
      {page === "namecodes" && (
        <NameCodes
          codes={codes}
          onAdd={handleAddName}
          isAdmin={user?.toLowerCase() === 'admin'}
          error={error}
          onAddSuccess={() => {
            setPage("landing");
            localStorage.setItem('santa_page', 'landing');
          }}
        />
      )}
      {isLoading && <div className="loading">⏳ Loading...</div>}
    </div>
  );
}

export default App;
