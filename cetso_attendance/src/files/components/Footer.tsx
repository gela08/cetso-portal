import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer style={{
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      padding: '2rem 1rem',
      marginTop: '4rem',
      borderTop: '4px solid #ff6600'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#ff6600', margin: '0 0 5px 0' }}>CETSO Portal</h3>
          <p style={{ fontSize: '0.9rem', color: '#ccc', margin: 0 }}>
            College of Engineering and Technology Students Organization
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '20px',
          fontSize: '0.85rem'
        }}>
          <span style={{ color: '#888' }}>© {currentYear} HCDC CETSO. All Rights Reserved.</span>
        </div>
        
        <div style={{ fontSize: '0.75rem', color: '#666' }}>
          Holy Cross of Davao College, Inc.
        </div>
      </div>
    </footer>
  );
};

export default Footer;