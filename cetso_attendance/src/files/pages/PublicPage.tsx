import React from 'react';
import '../styles/pages/public.css';

// 1. Updated Interface to include the optional 'title' prop
interface PublicPageProps {
  sanctionRules: any[];
  title?: string; 
}

const PublicPage: React.FC<PublicPageProps> = ({ sanctionRules, title }) => {
  return (
    // We use a section class instead of container to avoid double-padding when nested
    <div className="public-section" style={{ marginBottom: '2.5rem' }}>
      
      {/* 2. Display the section title (e.g., "Intramurals" or "Orientation") */}
      {title && (
        <h2 style={{ 
          color: '#333', 
          fontSize: '1.5rem', 
          borderLeft: '5px solid #ff6600', 
          paddingLeft: '15px',
          marginBottom: '1rem' 
        }}>
          {title}
        </h2>
      )}

      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th style={{ width: '20%' }}>Absence Count</th>
                <th style={{ width: '60%' }}>Required Item (Sanction)</th>
                <th style={{ width: '20%' }}>Est. Price</th>
              </tr>
            </thead>
            <tbody>
              {sanctionRules.map((rule, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 'bold' }}>
                    {rule.absences} {parseInt(rule.absences) === 1 ? 'Absence' : 'Absences'}
                  </td>
                  <td style={{ whiteSpace: 'pre-line' }}>{rule.item}</td>
                  <td style={{ color: '#B91C1C', fontWeight: 'bold' }}>₱{rule.price}</td>
                </tr>
              ))}
              {sanctionRules.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>
                    No active sanction rules posted for this event.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PublicPage;