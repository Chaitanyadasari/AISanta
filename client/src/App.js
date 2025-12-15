import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Landing from './components/Landing';
import NameCodes from './components/NameCodes';
import AssignmentDisplay from './components/AssignmentDisplay';
import Navigation from './components/Navigation';
import Chat from './components/Chat';
import ChatWidget from './components/ChatWidget';
import { signup, login, getAssignment, getNameCodes, addPlayer, generateAssignments, resetAssignments, deletePlayer } from './utils/api';
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
  const [nameCode, setNameCode] = useState(() => {
    return localStorage.getItem('santa_nameCode') || null;
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
  const checkAssignment = async (userNameCode) => {
    if (userNameCode && userNameCode.toLowerCase() !== "admin") {
      try {
        const assnData = await getAssignment(userNameCode);
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
    const savedNameCode = localStorage.getItem('santa_nameCode');
    
    if (savedUser && savedPage && savedPage !== "login" && savedPage !== "signup") {
      // User was logged in, restore their session
      setUser(savedUser);
      setUserEmail(localStorage.getItem('santa_userEmail'));
      setNameCode(savedNameCode);
      setPage(savedPage);
      setAssignment(savedAssignment || "");
      
      // If not admin, always check for assignment updates on load
      if (savedNameCode && savedNameCode.toLowerCase() !== "admin") {
        checkAssignment(savedNameCode);
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
    if (page === "landing" && nameCode && nameCode.toLowerCase() !== "admin") {
      checkAssignment(nameCode);
    }
  }, [page, nameCode]);

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
    if (nameCode) {
      localStorage.setItem('santa_nameCode', nameCode);
    } else {
      localStorage.removeItem('santa_nameCode');
    }
  }, [nameCode]);

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

  async function handleSignup(username, email, password, fullName) {
    setLoading(true);
    setError("");
    try {
      const data = await signup(username, email, password, fullName);
      if (!data.success) throw new Error(data.message || 'Signup failed');
      
      // Show success message and redirect to login
      alert('Account created successfully! Please login with your credentials.');
      setPage("login");
      localStorage.setItem('santa_page', 'login');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(username, password) {
    setLoading(true);
    setError("");
    try {
      const data = await login(username, password);
      if (!data.success) throw new Error(data.message || 'Login failed');
      
      setUser(username);
      setUserEmail(data.email);
      setNameCode(data.nameCode);
      setPage("landing");
      
      // Save to localStorage
      localStorage.setItem('santa_user', username);
      localStorage.setItem('santa_userEmail', data.email);
      localStorage.setItem('santa_nameCode', data.nameCode);
      localStorage.setItem('santa_page', 'landing');
      
      if (data.nameCode?.toLowerCase() !== "admin") {
        // Only fetch existing assignment - don't create new ones
        const assnData = await getAssignment(data.nameCode);
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
      if (nameCode?.toLowerCase() === "admin" && cbAfter) cbAfter();
      // Return success with credentials info for display
      return {
        success: true,
        username: data.username,
        tempPassword: data.tempPassword
      };
    } catch (err) {
      setError(err.message || 'Failed to add');
      return { success: false, message: err.message };
    }
  }

  async function handleDeletePlayer(playerNameCode) {
    setError("");
    try {
      const data = await deletePlayer(playerNameCode);
      if (!data.success) return { success: false, message: data.message };
      // Re-fetch after delete
      await openNameCodes();
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to delete');
      return { success: false, message: err.message };
    }
  }

  async function handleGenerateAssignments() {
    setLoadingGen(true); 
    setGenMessage("");
    try {
      const data = await generateAssignments(nameCode);
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

  async function handleResetAssignments() {
    if (!window.confirm('Are you sure you want to reset all assignments? This will clear all current Secret Santa assignments.')) {
      return;
    }
    setLoadingGen(true);
    setGenMessage("");
    try {
      const data = await resetAssignments(nameCode);
      if (data.success) {
        setGenMessage('All assignments have been cleared successfully!');
        // Clear cached assignments
        localStorage.removeItem('santa_assignment');
        setAssignment('');
      } else {
        setGenMessage(data.message || 'Reset failed');
      }
    } catch (err) {
      setGenMessage('Assignment reset failed.');
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
    setNameCode(null);
    // Clear all session data from localStorage
    localStorage.removeItem('santa_user');
    localStorage.removeItem('santa_userEmail');
    localStorage.removeItem('santa_nameCode');
    localStorage.removeItem('santa_page');
    localStorage.removeItem('santa_assignment');
  }

  return (
    <div className={page !== "login" && page !== "signup" ? "app-container" : ""}>
      {page === "login" && (
        <div className="login-wrapper">
          <Login 
            onLogin={handleLogin} 
            onGoToSignup={() => {
              setPage("signup");
              setError("");
            }}
            error={error} 
          />
        </div>
      )}
      {page === "signup" && (
        <div className="login-wrapper">
          <Signup 
            onSignup={handleSignup}
            onBackToLogin={() => {
              setPage("login");
              setError("");
            }}
            error={error}
          />
        </div>
      )}
      {page !== "login" && page !== "signup" && (
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
            currentUser={nameCode || user}
            onGenerateAssignments={handleGenerateAssignments}
            onResetAssignments={handleResetAssignments}
            genMessage={genMessage}
            loadingGen={loadingGen}
          />
          {nameCode?.toLowerCase() !== 'admin' && (
            <AssignmentDisplay assignment={assignment || ''} />
          )}
        </>
      )}
      {page === "namecodes" && (
        <NameCodes
          codes={codes}
          onAdd={handleAddName}
          onDelete={handleDeletePlayer}
          isAdmin={nameCode?.toLowerCase() === 'admin'}
          error={error}
          onAddSuccess={() => {
            setPage("landing");
            localStorage.setItem('santa_page', 'landing');
          }}
        />
      )}
      {isLoading && <div className="loading">⏳ Loading...</div>}
      
      {/* Floating Chat Widget - Available on all pages when logged in */}
      {user && page !== "login" && page !== "signup" && (
        <ChatWidget
          user={{
            username: user,
            nameCode: nameCode || user,
            email: userEmail
          }}
        />
      )}
    </div>
  );
}

export default App;
