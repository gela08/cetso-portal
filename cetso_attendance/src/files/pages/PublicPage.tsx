import React from 'react';
import '../styles/pages/public.css';
import { INTRAMURALS_DISPLAY, ORIENTATION_DISPLAY } from '../utils/Data';

// Sub-component for individual sanction tables to keep things DRY
interface SanctionTableProps {
  title: string;
  sanctionRules: any[];
}

const SanctionTable: React.FC<SanctionTableProps> = ({ title, sanctionRules }) => (
  <div className="public-section" style={{ marginBottom: '2.5rem' }}>
    <h2 style={{ 
      color: '#333', 
      fontSize: '1.5rem', 
      borderLeft: '5px solid #ff6600', 
      paddingLeft: '15px',
      marginBottom: '1rem' 
    }}>
      {title}
    </h2>

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

const PublicPage: React.FC = () => {
  return (
    <div className="wide-container">
      {/* Header moved from App.tsx */}
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: '#ff6600', fontSize: '2.5rem' }}>Sanctions & Requirements</h1>
        <p>College of Engineering and Technology Students Organization</p>
      </header>

      {/* Section 1: Intramurals */}
      <SanctionTable 
        title="Intramurals/Fiesta 2025" 
        sanctionRules={INTRAMURALS_DISPLAY} 
      />

      {/* Section 2: Orientation */}
      <SanctionTable 
        title="1st Sem Orientation" 
        sanctionRules={ORIENTATION_DISPLAY} 
      />

      {/* Note Box moved from App.tsx */}
      <div className="note-box" style={{ marginTop: '2rem', padding: '1rem', background: '#eee', borderRadius: '8px' }}>
        <strong>Note:</strong> Visit the CETSO office for personal attendance queries.
      </div>
    </div>
  );
};

export default PublicPage;