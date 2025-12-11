import React, { useState } from 'react';
import loginImage from '../images/loginPage.jpg';

function Login({ onLogin, onGoToSignup, error }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <div className="login-page-container">
      <div className="login-image-section">
        <img src={loginImage} alt="AI Santa Login" className="login-image" />
      </div>
      <div className="login-page">
        <h2>AI Santa</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
            />
          </div>
          <div>
            <label>Password:</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
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
          </div>
          <button type="submit">Login</button>
        </form>
        {error && <div className="error">{error}</div>}
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={onGoToSignup}
            style={{
              background: 'none',
              border: 'none',
              color: '#d32f2f',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.95em'
            }}
          >
            Don't have an account? Sign up here
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

export default Login;
