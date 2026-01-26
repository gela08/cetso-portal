import React, { useState } from 'react';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    // Simulate a small delay for a professional "verifying" feel
    setTimeout(() => {
      if (accessCode === 'CETSO2025') {
        onLoginSuccess({ name: 'Officer', role: 'admin' });
      } else {
        alert('Invalid Access Code');
        setIsVerifying(false);
      }
    }, 800);
  };

  if (isVerifying) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
        <p>Verifying Credentials...</p>
      </div>
    );
  }

  return (
    <div className="login-box-container">
      <div className="login-card">
        <header style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ color: '#ff6600' }}>Officer Access</h2>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>Enter code to access scanner & logs</p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="input-group" style={{ marginBottom: '1rem' }}>
            <input 
              type="password" 
              placeholder="Enter Access Code" 
              required 
              className="login-input" 
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
            />
          </div>
          <button type="submit" className="login-btn" style={{ width: '100%' }}>
            Login to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;