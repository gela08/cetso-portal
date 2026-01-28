import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import '../styles/pages/public.css';

interface SanctionTableProps {
  title: string;
  sanctionRules: any[];
  loading: boolean;
}

const SanctionTable: React.FC<SanctionTableProps> = ({ title, sanctionRules, loading }) => (
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
            {loading ? (
              <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>Loading rules...</td></tr>
            ) : sanctionRules.length > 0 ? (
              sanctionRules.map((rule, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 'bold' }}>
                    {/* Using min_absences from Supabase */}
                    {rule.min_absences} {rule.min_absences === 1 ? 'Absence' : 'Absences'}
                  </td>
                  <td style={{ whiteSpace: 'pre-line' }}>{rule.item}</td>
                  <td style={{ color: '#B91C1C', fontWeight: 'bold' }}>₱{rule.price}</td>
                </tr>
              ))
            ) : (
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
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('sanction_rules') // Make sure this matches your Supabase table name
        .select('*')
        .order('min_absences', { ascending: true });

      if (error) console.error("Error fetching rules:", error);
      else setRules(data || []);
      setLoading(false);
    };

    fetchRules();
  }, []);

  // Filter rules by category (Event Name)
  const intramuralRules = rules.filter(r => r.category === 'Intramurals');
  const orientationRules = rules.filter(r => r.category === 'Orientation');

  return (
    <div className="wide-container">
      <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: '#ff6600', fontSize: '2.5rem' }}>Sanctions & Requirements</h1>
        <p>College of Engineering and Technology Students Organization</p>
      </header>

      <SanctionTable 
        title="Intramurals/Fiesta 2025" 
        sanctionRules={intramuralRules} 
        loading={loading}
      />

      <SanctionTable 
        title="1st Sem Orientation" 
        sanctionRules={orientationRules} 
        loading={loading}
      />

      <div className="note-box" style={{ marginTop: '2rem', padding: '1rem', background: '#eee', borderRadius: '8px' }}>
        <strong>Note:</strong> Visit the CETSO office for personal attendance queries.
      </div>
    </div>
  );
};

export default PublicPage;