import React, { useState } from 'react';
import loginImage from '../images/loginPage.jpg';

function Login({ onLogin, error }) {
  const [nameCode, setNameCode] = useState("");
  const [email, setEmail] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(nameCode, email);
  };
  return (
    <div className="login-page-container">
      <div className="login-image-section">
        <img src={loginImage} alt="AI Santa Login" className="login-image" />
      </div>
      <div className="login-page">
        <h2>AI_Santa</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Player Name:</label>
            <input
              type="text"
              value={nameCode}
              onChange={e => setNameCode(e.target.value)}
              placeholder="Enter your player name"
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
          <button type="submit">Login</button>
        </form>
        {error && <div className="error">{error}</div>}
        <div className="login-footer">
          <p>Developed by <strong>Chaitanya Dasari</strong></p>
          <p>All rights reserved</p>
        </div>
      </div>
    </div>
  );
}

export default Login;

