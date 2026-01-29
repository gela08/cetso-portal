import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Info, AlertCircle } from 'lucide-react';
import '../../styles/pages/public.css';
import '../../styles/pages/public/publicsanctions.css';

// Reusable Table for Guidelines
const SanctionTable: React.FC<{ title: string; sanctionRules: any[]; loading: boolean }> = ({ title, sanctionRules, loading }) => (
  <div className="public-section" style={{ marginBottom: '2.5rem' }}>
    <h4 className="section-title-border" style={{ fontSize: '1.2rem' }}>{title}</h4>
    <div className="card shadow-sm" style={{ overflow: 'hidden', padding: '0' }}>
      <table className="modern-table">
        <thead>
          <tr>
            <th style={{ width: '30%' }}>Absences</th>
            <th style={{ width: '50%' }}>Requirement</th>
            <th style={{ width: '20%' }}>Price</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>
          ) : sanctionRules.length > 0 ? (
            sanctionRules.map((rule, index) => (
              <tr key={index}>
                <td style={{ fontWeight: 'bold' }}>{rule.min_absences}+</td>
                <td style={{ whiteSpace: 'pre-line' }}>{rule.item}</td>
                <td className="text-red-bold">₱{rule.price}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>No rules posted.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const PublicSanctions: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('BSIT');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [stuRes, ruleRes] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('sanction_rules').select('*').order('min_absences', { ascending: true })
      ]);
      
      if (stuRes.data) setStudents(stuRes.data);
      if (ruleRes.data) setRules(ruleRes.data);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return students
      .filter(s => s.program === selectedProgram)
      .filter(s => 
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => a.last_name.localeCompare(b.last_name));
  }, [students, selectedProgram, searchQuery]);

  const intramuralRules = rules.filter(r => r.category === 'Intramurals');
  const orientationRules = rules.filter(r => r.category === 'Orientation');

  return (
    <div className="public-container">
      <header className="page-header">
        <h1>Public Sanction List</h1>
        <p>Real-time status of student requirements</p>
      </header>

      {/* 1. SEARCH & FILTERS */}
      <div className="card filter-controls">
        <div className="input-grid">
          <div className="form-item">
            <label>Select Program</label>
            <select value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)}>
              <option value="BSIT">BSIT</option>
              <option value="BSCpE">BSCpE</option>
              <option value="BSECE">BSECE</option>
              <option value="BLIS">BLIS</option>
            </select>
          </div>
          <div className="form-item">
            <label>Search Name</label>
            <div className="search-input-wrapper">
              <input 
                type="text" 
                placeholder="Search by name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. STUDENT STATUS LIST */}
      <div className="year-grid-public">
        {yearLevels.map(year => {
          const inYear = filteredData.filter(s => s.year_level === year);
          if (inYear.length === 0 && searchQuery === '') return null;

          return (
            <div key={year} className="card year-list-card">
              <h3 className="section-title-border">{year}</h3>
              <table className="modern-table">
                <thead>
                  <tr><th>Name</th><th>Status</th><th>Hrs</th></tr>
                </thead>
                <tbody>
                  {inYear.length > 0 ? inYear.map(s => (
                    <tr key={s.id}>
                      <td className="font-bold">{s.last_name}, {s.first_name[0]}.</td>
                      <td>
                        <span className={`status-dot ${s.sanction_hours > 0 ? 'active' : 'cleared'}`}>
                          {s.sanction_hours > 0 ? 'Active' : 'Clear'}
                        </span>
                      </td>
                      <td className={s.sanction_hours > 0 ? 'text-red' : ''}>{s.sanction_hours}h</td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} style={{textAlign:'center', color:'#999'}}>No matches</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* 3. OFFICIAL GUIDELINES SECTION */}
      <section className="guidelines-section">
        <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <Info size={28} style={{ color: 'var(--cetso-orange)' }} />
          <h2 style={{ margin: 0, color: 'var(--cetso-black)' }}>Official Guidelines</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          <SanctionTable 
            title="Intramurals / Fiesta 2025" 
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
          <p><strong>Official Note:</strong> These sanctions are approved by the CETSO legislative body. Fees or items collected are used for student-led activities.</p>
        </div>
      </section>
    </div>
  );
};

export default PublicSanctions;