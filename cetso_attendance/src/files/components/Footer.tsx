import React from 'react';
import '../styles/components/footer.css';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="portal-footer">
      <div className="footer-content">
        <div className="footer-top">
          <div className="footer-brand">
            <h3>CETSO Portal</h3>
            <p>College of Engineering and Technology Students Organization</p>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <div className="copyright">
            © {currentYear} HCDC CETSO. All Rights Reserved.
          </div>
          
          {/* DEVELOPER CREDIT ADDED HERE */}
          <div className="developer-credit">
            Developed by <span className="dev-name">Angela Gardan</span>
          </div>

          <div className="school-credit">
            Holy Cross of Davao College, Inc.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;