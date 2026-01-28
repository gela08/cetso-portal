import { useState, useMemo } from 'react';
import { Info, Download, AlertCircle } from 'lucide-react';
import { calculateSanctions } from '../utils/SanctionLogic';
import { SANCTION_RULES } from '../utils/Data';
import { exportToExcel } from '../utils/SanctionExport';
import '../styles/pages/sanctionlist.css';

const PROGRAMS = ['BSIT', 'BLIS', 'BSCpE', 'BSECE'];
const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const SanctionList = ({ students, attendance, activeEvent }: any) => {
  const [activeProgram, setActiveProgram] = useState('BSIT');

  // 1. Determine requirements based on event
  const currentEvent = activeEvent || 'Intramurals';
  const totalRequired = currentEvent === 'Orientation' ? 2 : 12;

  // 2. Memoized Calculation (Handling Supabase snake_case)
  const filteredData = useMemo(() => {
    const relevantRules = SANCTION_RULES.filter(rule => rule.category === currentEvent);
    
    // We map the database data to what the logic expects, or update logic to handle both
    const rawData = calculateSanctions(
      students,
      attendance,
      totalRequired,
      relevantRules
    );

    return rawData.filter((s: any) => s.program === activeProgram);
  }, [students, attendance, totalRequired, currentEvent, activeProgram]);

  return (
    <div className="sanction-wrapper">
      <div className="program-tabs">
        {PROGRAMS.map((prog) => (
          <button
            key={prog}
            className={`tab-btn ${activeProgram === prog ? 'active' : ''}`}
            onClick={() => setActiveProgram(prog)}
          >
            {prog}
          </button>
        ))}
      </div>

      <div className="sanction-container">
        <div className="sanction-info-bar">
          <div className="info-meta">
            <Info size={18} className="info-icon" />
            <span className="filter-label">
              <strong>{activeProgram}</strong> Sanctions 
              <span className="divider">|</span>
              Event: <strong>{currentEvent}</strong>
              <span className="divider">|</span>
              Required Logs: <strong>{totalRequired}</strong>
            </span>
          </div>
          
          <button 
            className="export-btn" 
            onClick={() => exportToExcel(filteredData, activeProgram)}
            disabled={filteredData.length === 0}
          >
            <Download size={16} /> Export to Excel
          </button>
        </div>

        {YEAR_LEVELS.map((year) => {
          // Note: s.year_level or s.yearLevel depending on how your Logic helper returns it
          const yearData = filteredData
            .filter((s: any) => (s.year_level || s.yearLevel) === year)
            .sort((a: any, b: any) => (a.last_name || a.lastName).localeCompare(b.last_name || b.lastName));

          return (
            <div key={year} className="year-section">
              <div className="year-header">
                <h3>{year}</h3>
                <span className="count-badge">{yearData.length} Students</span>
              </div>
              
              <div className="table-responsive">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th style={{ width: '120px' }}>Student ID</th>
                      <th>Last Name</th>
                      <th>First Name</th>
                      <th>Absences</th>
                      <th>Sanction Item</th>
                      <th style={{ width: '100px' }}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearData.length > 0 ? (
                      yearData.map((s: any, i: number) => (
                        <tr key={s.student_id || s.studentId}>
                          <td className="row-index">{i + 1}</td>
                          <td className="mono-text">{s.student_id || s.studentId}</td>
                          <td className="name-cell">{s.last_name || s.lastName}</td>
                          <td className="name-cell">{s.first_name || s.firstName}</td>
                          <td><span className="absences-cell">{s.absences}</span></td>
                          <td><span className="item-name">{s.item}</span></td>
                          <td><span className="price-tag">₱{s.price}</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="empty-state">
                          <AlertCircle size={18} />
                          <span>No students found with absences in {year}.</span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SanctionList;