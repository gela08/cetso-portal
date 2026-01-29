import { useState, useMemo } from 'react';
import { Info, Download, Search, Filter, Users } from 'lucide-react';
import { calculateSanctions } from '../utils/SanctionLogic';
import { SANCTION_RULES } from '../utils/Data';
import { exportToExcel } from '../utils/SanctionExport';
import ExportSanctionModal from '../components/ExportSanctionModal';

import '../styles/pages/sanctionlist.css';
import '../styles/pages/studentrecords.css';

const PROGRAMS = ['BSIT', 'BLIS', 'BSCpE', 'BSECE'];
const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const SanctionList = ({ students, attendance, activeEvent }: any) => {
  const [activeProgram, setActiveProgram] = useState('BSIT');
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const currentEvent = activeEvent || 'Intramurals';
  const totalRequired = currentEvent === 'Orientation' ? 2 : 12;

  const filteredData = useMemo(() => {
    const relevantRules = SANCTION_RULES.filter(rule => rule.category === currentEvent);
    const rawData = calculateSanctions(students, attendance, totalRequired, relevantRules);

    return rawData.filter((s: any) => {
      const matchProgram = s.program === activeProgram;
      const matchYear = yearFilter === 'ALL' || (s.year_level || s.yearLevel) === yearFilter;
      const fullSearch = `${s.first_name} ${s.last_name} ${s.student_id} ${s.email || ''}`.toLowerCase();
      return matchProgram && matchYear && fullSearch.includes(searchQuery.toLowerCase().trim());
    });
  }, [students, attendance, totalRequired, currentEvent, activeProgram, yearFilter, searchQuery]);

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

      <div className="table-card">
        <div className="card-header">
          <div className="header-top-row">
            <div className="title-group">
              <h3 className="section-title">{activeProgram} Sanctions</h3>
              <span className="count-badge">
                <Users size={14} /> {filteredData.length} Students
              </span>
            </div>
            <div className="action-buttons-group">
              <button className="btn-export" onClick={() => setIsExportModalOpen(true)}>
                <Download size={18} /> <span className="btn-text">Export Records</span>
              </button>
            </div>
          </div>

          <div className="header-controls">
            <div className="search-container">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="filter-group">
              <Filter size={16} className="filter-icon" />
              <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="filter-select">
                <option value="ALL">All Years View</option>
                {YEAR_LEVELS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="sanction-info-bar">
          <Info size={16} />
          <span>Event: <strong>{currentEvent}</strong> | Required: <strong>{totalRequired} Logs</strong></span>
        </div>

        <div className="year-sections-container">
          {YEAR_LEVELS.filter(y => yearFilter === 'ALL' || y === yearFilter).map((year) => {
            const yearData = filteredData.filter((s: any) => (s.year_level || s.yearLevel) === year);
            if (yearData.length === 0) return null;
            return (
              <div key={year} className="year-section">
                <div className="year-header"><h3>{year}</h3></div>
                <div className="table-responsive">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>#</th><th>Student ID</th><th>Full Name</th><th>Absences</th><th>Sanction</th><th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearData.map((s: any, i: number) => (
                        <tr key={s.student_id}>
                          <td>{i + 1}</td>
                          <td>{s.student_id}</td>
                          <td className="font-bold">{s.last_name}, {s.first_name}</td>
                          <td><span className="absences-cell">{s.absences}</span></td>
                          <td><span className="program-tag">{s.item}</span></td>
                          <td><span className="price-tag">₱{s.price}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <ExportSanctionModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        activeProgram={activeProgram}
        filteredData={filteredData}
        yearLevels={YEAR_LEVELS}
        onExport={exportToExcel}
      />
    </div>
  );
};

export default SanctionList;