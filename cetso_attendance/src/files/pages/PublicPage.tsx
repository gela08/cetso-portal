import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { Info, Users, ClipboardList, MessageSquare, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/pages/public.css';

interface SanctionTableProps {
  title: string;
  sanctionRules: any[];
  loading: boolean;
}

const SanctionTable: React.FC<SanctionTableProps> = ({ title, sanctionRules, loading }) => (
  <div className="public-section" style={{ marginBottom: '2.5rem' }}>
    <h2 className="section-title-border">{title}</h2>

    <div className="card shadow-sm" style={{ overflow: 'hidden' }}>
      <div className="table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Absence Count</th>
              <th style={{ width: '55%' }}>Required Item (Sanction)</th>
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
                    {rule.min_absences} {rule.min_absences === 1 ? 'Absence' : 'Absences'}
                  </td>
                  <td style={{ whiteSpace: 'pre-line' }}>{rule.item}</td>
                  <td className="text-red-bold">₱{rule.price}</td>
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
        .from('sanction_rules')
        .select('*')
        .order('min_absences', { ascending: true });

      if (error) console.error("Error fetching rules:", error);
      else setRules(data || []);
      setLoading(false);
    };

    fetchRules();
  }, []);

  const intramuralRules = rules.filter(r => r.category === 'Intramurals');
  const orientationRules = rules.filter(r => r.category === 'Orientation');

  return (
    <div className="public-container">
      {/* --- HERO SECTION --- */}
      <header className="public-hero">
        <h1 className="hero-title">CETSO Student Portal</h1>
        <p className="hero-subtitle">College of Engineering and Technology Students Organization</p>
      </header>

      {/* --- NAVIGATION GRID --- */}
      <div className="public-nav-grid">
        <Link to="/public/college-officers" className="nav-card">
          <Users size={32} />
          <span>College Officers</span>
        </Link>
        <Link to="/public/program-officers" className="nav-card">
          <Users size={32} />
          <span>Program Officers</span>
        </Link>
        <Link to="/public/sanctions" className="nav-card">
          <ClipboardList size={32} />
          <span>Sanction List</span>
        </Link>
        <Link to="/public/submissions" className="nav-card">
          <MessageSquare size={32} />
          <span>Submit Request</span>
        </Link>
      </div>

      <hr className="divider" />

      {/* --- SANCTION TABLES --- */}
      <div className="rules-container" style={{ marginTop: '3rem' }}>
        <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <Info size={24} style={{ color: 'var(--cetso-orange)' }} />
          <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--cetso-black)' }}>Official Sanction Guidelines</h3>
        </div>

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
      </div>

      <div className="note-box">
        <AlertCircle size={20} />
        <p><strong>Note:</strong> These rules are approved by the CETSO body. Visit the office for specific attendance queries.</p>
      </div>
    </div>
  );
};

export default PublicPage;