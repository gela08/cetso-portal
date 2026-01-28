import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient'; // Ensure path is correct
import '../styles/pages/login.css';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);

    // Query Supabase for the access code
    const { data, error } = await supabase
      .from('officers')
      .select('*')
      .eq('access_code', accessCode)
      .single();

    if (error || !data) {
      alert('Invalid Access Code');
      setIsVerifying(false);
      setAccessCode('');
    } else {
      // Small delay for UX feel
      setTimeout(() => {
        onLoginSuccess({ name: data.officer_name, role: data.role });
      }, 500);
    }
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