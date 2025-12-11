import React, { useState } from 'react';

function Signup({ onSignup, onBackToLogin, error }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nameCode, setNameCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");

  const checkPasswordStrength = (pwd) => {
    if (pwd.length === 0) {
      setPasswordStrength("");
      return;
    }
    
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

    if (strength <= 2) setPasswordStrength("weak");
    else if (strength <= 4) setPasswordStrength("medium");
    else setPasswordStrength("strong");
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    checkPasswordStrength(pwd);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    onSignup(username, email, password, nameCode);
  };

  return (
    <div className="login-page-container" style={{ justifyContent: 'center' }}>
      <div className="login-page" style={{ maxWidth: '500px' }}>
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Choose a username"
              required
              minLength="3"
            />
          </div>
          <div>
            <label>Full Name:</label>
            <input
              type="text"
              value={nameCode}
              onChange={e => setNameCode(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="Create a password"
                required
                minLength="8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2em',
                  padding: '5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 'auto',
                  width: '30px',
                  height: '30px',
                  margin: 0,
                  boxShadow: 'none'
                }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {passwordStrength && (
              <div className={`password-strength ${passwordStrength}`}>
                Password strength: <strong>{passwordStrength}</strong>
              </div>
            )}
            <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
              Must be 8+ characters with uppercase, lowercase, and number
            </small>
          </div>
          <div>
            <label>Confirm Password:</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              minLength="8"
            />
          </div>
          <button type="submit">Sign Up</button>
        </form>
        {error && <div className="error">{error}</div>}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={onBackToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: '#d32f2f',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.95em'
            }}
          >
            Already have an account? Login here
          </button>
        </div>
        <div className="login-footer">
          <p>Developed by <strong>Chaitanya Dasari</strong></p>
          <p>All rights reserved</p>
        </div>
      </div>
    </div>
  );
}

export default Signup;