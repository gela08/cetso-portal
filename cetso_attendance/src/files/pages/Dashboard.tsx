import React, { useState } from 'react';
import { calculateSanctions } from '../utils/SanctionLogic';
import { INITIAL_STUDENTS, SANCTION_RULES } from '../utils/Data';
import '../styles/pages/dashboard.css';

interface DashboardProps {
  attendance: any[];
  setAttendance: React.Dispatch<React.SetStateAction<any[]>>;
}

const DashboardPage: React.FC<DashboardProps> = ({ attendance, setAttendance }) => {
  const [dashboardTab, setDashboardTab] = useState('dashboard'); 
  const [programFilter, setProgramFilter] = useState('ALL');
  
  // NEW: Event and Date States
  const [activeEvent, setActiveEvent] = useState('Intramurals 2026');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const programs = [
    { id: 'BLIS', name: 'Library & Info Science' },
    { id: 'BSCpE', name: 'Computer Engineering' },
    { id: 'BSECE', name: 'Electronics Engineering' },
    { id: 'BSIT', name: 'Information Technology' }
  ];

  const clearAttendanceLogs = () => {
    if (window.confirm("Are you sure? This will delete all logs permanently.")) {
      setAttendance([]);
      localStorage.removeItem('cetso_attendance');
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Updated filter logic to include Date/Event if needed later
  const filteredAttendance = programFilter === 'ALL' 
    ? attendance 
    : attendance.filter(log => log.program === programFilter);

  const filteredStudents = programFilter === 'ALL'
    ? INITIAL_STUDENTS
    : INITIAL_STUDENTS.filter(s => s.program === programFilter);

  return (
    <div className={`dashboard-layout ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      {/* --- SIDEBAR --- */}
      <aside className={`dashboard-sidebar ${isSidebarOpen ? 'show' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">C</div>
          <div className="brand-text">
            <strong>CET Portal</strong>
            <span>Admin Panel</span>
          </div>
          <button className="mobile-close" onClick={toggleSidebar}>×</button>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">GENERAL</p>
          <button 
            className={`nav-item ${dashboardTab === 'dashboard' ? 'active' : ''}`} 
            onClick={() => { setDashboardTab('dashboard'); setProgramFilter('ALL'); setIsSidebarOpen(false); }}
          >
            <span className="icon">🏠</span> Dashboard
          </button>
          <button 
            className={`nav-item ${dashboardTab === 'records' ? 'active' : ''}`} 
            onClick={() => { setDashboardTab('records'); setIsSidebarOpen(false); }}
          >
            <span className="icon">📂</span> Student Records
          </button>
          <button 
            className={`nav-item ${dashboardTab === 'sanctions' ? 'active' : ''}`} 
            onClick={() => { setDashboardTab('sanctions'); setIsSidebarOpen(false); }}
          >
            <span className="icon">⚖️</span> Sanction List
          </button>
          
          <p className="nav-label">PROGRAM LOGS</p>
          {programs.map(prog => (
            <button 
              key={prog.id}
              className={`nav-item ${programFilter === prog.id && dashboardTab === 'logs' ? 'active' : ''}`} 
              onClick={() => { 
                setDashboardTab('logs'); 
                setProgramFilter(prog.id); 
                setIsSidebarOpen(false); 
              }}
            >
              <span className="icon">📋</span> {prog.id}
            </button>
          ))}

          <div className="sidebar-footer">
             <p className="nav-label">SYSTEM</p>
             <button className="nav-item btn-reset" onClick={clearAttendanceLogs}>
               <span className="icon">🗑️</span> Reset Data
             </button>
          </div>
        </nav>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="dashboard-main">
        <header className="main-header">
          <div className="header-left">
            <button className="hamburger-menu" onClick={toggleSidebar}>☰</button>
            <div className="welcome-text">
              <h1>{dashboardTab === 'logs' ? `${programFilter} Attendance` : dashboardTab.toUpperCase()}</h1>
              <p>HCDC College of Engineering and Technology</p>
            </div>
          </div>
          
          {/* UPDATED: Header Controls for Event & Date */}
          <div className="header-controls">
            <div className="input-group">
                <label>Event Name</label>
                <input 
                    type="text" 
                    value={activeEvent} 
                    onChange={(e) => setActiveEvent(e.target.value)}
                    className="event-header-input"
                />
            </div>
            <div className="input-group">
                <label>Active Date</label>
                <input 
                    type="date" 
                    value={currentDate} 
                    onChange={(e) => setCurrentDate(e.target.value)}
                    className="event-header-input"
                />
            </div>
          </div>
        </header>

        {/* CONTENT AREA */}
        <section className="content-container">
          
          {dashboardTab === 'logs' && (
            <div className="table-card">
              <div className="card-header">
                <h3>Live Attendance: {programFilter}</h3>
              </div>
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>ID Number</th>
                    <th>Name</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.length > 0 ? filteredAttendance.map(log => (
                    <tr key={log.id}>
                      {/* NEW: Date Column */}
                      <td><span className="date-pill">{log.date || currentDate}</span></td>
                      <td>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="font-mono">{log.studentId}</td>
                      <td>{log.name}</td>
                      <td><span className={`badge ${log.type}`}>{log.type}</span></td>
                    </tr>
                  )) : <tr><td colSpan={5} className="text-center">No logs found for this program.</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW: STUDENT RECORDS */}
          {dashboardTab === 'records' && (
            <div className="table-card">
              <div className="card-header flex-between">
                <h3>Masterlist: {programFilter === 'ALL' ? 'CETSO Students' : programFilter}</h3>
                <input type="text" placeholder="Search ID or Name..." className="table-search" />
              </div>
              <table className="modern-table">
                <thead>
                  <tr><th>ID Number</th><th>Full Name</th><th>Year</th><th>Program</th></tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student.id}>
                      <td className="font-mono">{student.id}</td>
                      <td>{student.name}</td>
                      <td>Year {student.yearLevel}</td>
                      <td><span className="program-tag">{student.program}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VIEW: SANCTIONS */}
          {dashboardTab === 'sanctions' && (
             <div className="table-card">
                <div className="filter-bar">
                  <span className="filter-label">Filtering for: <strong>{activeEvent}</strong></span>
                </div>
                <table className="modern-table">
                  <thead>
                    <tr><th>Student</th><th>Program</th><th>Absences</th><th>Required Item</th></tr>
                  </thead>
                  <tbody>
                    {calculateSanctions(INITIAL_STUDENTS, attendance, 12, SANCTION_RULES).map((s, i) => (
                      <tr key={i}>
                        <td>{s.studentName}</td>
                        <td>{s.program}</td>
                        <td className="warning-text font-bold">{s.absences}</td>
                        <td className="item-cell">{s.item}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          )}

          {/* VIEW: DASHBOARD STATS */}
          {dashboardTab === 'dashboard' && (
            <div className="dashboard-stats-view">
               <div className="stats-grid">
                  <div className="stat-card highlight">
                    <span className="stat-label">CURRENT EVENT</span>
                    <h2 className="stat-value" style={{fontSize: '1.2rem', color: '#FF8C00'}}>{activeEvent}</h2>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">TOTAL LOGS</span>
                    <h2 className="stat-value">{attendance.length}</h2>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">ACTIVE DATE</span>
                    <h2 className="stat-value" style={{fontSize: '1.2rem'}}>{currentDate}</h2>
                  </div>
               </div>
               
               

            </div>
          )}

        </section>
      </main>
    </div>
  );
};

export default DashboardPage;