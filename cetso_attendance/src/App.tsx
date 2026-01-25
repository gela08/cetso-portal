import React, { useState, useEffect } from 'react';
import Navbar from './files/components/Navbar';
import PublicPage from './files/pages/PublicPage';
import ScannerPage from './files/pages/ScannerPage';
import './app.css';

import { calculateSanctions, type SanctionRule } from './files/utils/SanctionLogic';
import Footer from './files/components/Footer';

// --- DATABASE: STUDENTS ---
const INITIAL_STUDENTS = [
  { id: '2023001', name: 'Juan Dela Cruz', program: 'BSIT', year: '3' },
  { id: '2023002', name: 'Maria Santos', program: 'BSCpE', year: '2' },
  { id: '2023003', name: 'Pedro Penduko', program: 'BSECE', year: '4' },
];

// --- DATABASE: SANCTIONS (PUBLIC VIEW) ---
const INTRAMURALS_DISPLAY = [
  { eventName: 'Intramurals/Fiesta 2025', absences: '11–12', item: 'Lysol Disinfectant Spray 170g', price: 300 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '10', item: '1 ream short or long bond paper', price: 245 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '9', item: '1 Green Cross/Casino Alcohol 500ml, 1 stamp pad', price: 155 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '8', item: '1 pack band aid, 1 small betadine, 1 cotton', price: 115 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '7', item: '1 Pilot WB Marker, 2 Sign pens (B&B), 1 garbage bag', price: 95 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '6', item: '1 cleaning rag, 1 Pilot WB Marker, 1 masking tape', price: 95 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '5', item: '1 Pilot WB Marker, 1 garbage bag, 2 sign pens', price: 95 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '4', item: 'Canned goods (no sardines) / 1kg rice', price: 90 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '3', item: '1 pack bond paper, 1 Alcohol 250ml', price: 80 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '2', item: '1 short bond paper (20pcs), 1 tissue roll, 2 Carbon paper', price: 70 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '1', item: '1 Garbage bag, 2 sign pens (blue, black)', price: 50 }
];

const ORIENTATION_DISPLAY = [
  { eventName: '1st Sem Orientation', absences: '2', item: '1 pack Tissue, 1 Green Cross 250ml, 1 black ballpen', price: 70 },
  { eventName: '1st Sem Orientation', absences: '1', item: '1 Green Cross Alcohol, 1 Tissue roll', price: 50 }
];

// --- DATABASE: CALCULATION RULES ---
const SANCTION_RULES: SanctionRule[] = [
  // Intramurals
  { category: 'Intramurals', minAbsences: 11, maxAbsences: 12, item: 'Lysol Disinfectant Spray 170g', price: 300 },
  { category: 'Intramurals', minAbsences: 10, maxAbsences: 10, item: '1 ream short or long bond paper', price: 245 },
  { category: 'Intramurals', minAbsences: 9, maxAbsences: 9, item: '1 Green Cross 500ml, 1 stamp pad', price: 155 },
  { category: 'Intramurals', minAbsences: 8, maxAbsences: 8, item: '1 pack band aid, 1 small betadine, 1 cotton', price: 115 },
  { category: 'Intramurals', minAbsences: 7, maxAbsences: 7, item: '1 Pilot WB Marker, 2 Sign pens, 1 garbage bag', price: 95 },
  { category: 'Intramurals', minAbsences: 6, maxAbsences: 6, item: '1 cleaning rag, 1 Pilot WB Marker, 1 masking tape', price: 95 },
  { category: 'Intramurals', minAbsences: 5, maxAbsences: 5, item: '1 Pilot WB Marker, 1 garbage bag, 2 sign pens', price: 95 },
  { category: 'Intramurals', minAbsences: 4, maxAbsences: 4, item: 'Canned goods / 1kg rice', price: 90 },
  { category: 'Intramurals', minAbsences: 3, maxAbsences: 3, item: '1 pack bond paper, 1 Alcohol 250ml', price: 80 },
  { category: 'Intramurals', minAbsences: 2, maxAbsences: 2, item: '1 short bond paper (20pcs), 1 tissue, 2pcs Carbon', price: 70 },
  { category: 'Intramurals', minAbsences: 1, maxAbsences: 1, item: '1 Garbage bag, 2 sign pens', price: 50 },
  // Orientation
  { category: 'Orientation', minAbsences: 2, maxAbsences: 2, item: '1 pack Tissue, 1 Alcohol 250ml, 1 black ballpen', price: 70 },
  { category: 'Orientation', minAbsences: 1, maxAbsences: 1, item: '1 Alcohol, 1 Tissue roll', price: 50 }
];

const App = () => {
  const [view, setView] = useState('public'); 
  const [dashboardTab, setDashboardTab] = useState('logs');
  const [activeEvent, setActiveEvent] = useState('Intramurals'); // Intramurals or Orientation
  const [user, setUser] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('cetso_attendance');
    if (saved) setAttendance(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('cetso_attendance', JSON.stringify(attendance));
  }, [attendance]);

  const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  const target = e.target as typeof e.target & {
    0: { value: string }; // This targets the first input field
  };
  
  const accessCode = target[0].value;

  if (accessCode === 'CETSO2025') { // Set your specific code here
    setUser({ name: 'Officer', role: 'admin' });
    setView('dashboard');
  } else {
    alert('Invalid Access Code');
  }
};
  const handleRecordAttendance = (studentId: string, type: string) => {
    const student = INITIAL_STUDENTS.find(s => s.id === studentId);
    if (!student) return { success: false, msg: `ID ${studentId} not found.` };

    const today = new Date().toDateString();
    const duplicate = attendance.find(r => 
      r.studentId === studentId && r.type === type && new Date(r.timestamp).toDateString() === today
    );

    if (duplicate) return { success: false, msg: `Already recorded ${type} for today.`, student };

    const newRecord = {
      id: Date.now(),
      studentId,
      name: student.name,
      program: student.program,
      type,
      timestamp: new Date().toISOString()
    };

    setAttendance([newRecord, ...attendance]);
    return { success: true, msg: `Recorded ${type} for ${student.name}`, student };
  };

  const clearAttendanceLogs = () => {
  if (window.confirm("Are you sure? This will delete all recorded attendance logs.")) {
    setAttendance([]);
    localStorage.removeItem('cetso_attendance');
  }
};

  return (
    <div className="app">
      <Navbar currentView={view} setView={setView} user={user} logout={() => { setUser(null); setView('public'); }} />
      
      <main className="main-content">
        {view === 'public' && (
  <div className="wide-container">
    {/* Main Page Header (Only once) */}
    <header style={{textAlign: 'center', marginBottom: '3rem'}}>
        <h1 style={{color: '#ff6600', fontSize: '2.5rem'}}>Sanctions & Requirements</h1>
        <p>College of Engineering and Technology Students Organization</p>
    </header>

    {/* Section 1: Intramurals */}
    <PublicPage sanctionRules={INTRAMURALS_DISPLAY} title="Intramurals/Fiesta 2025" />
    
    {/* Section 2: Orientation */}
    <PublicPage sanctionRules={ORIENTATION_DISPLAY} title="1st Sem Orientation" />

    <div className="note-box" style={{marginTop: '2rem', padding: '1rem', background: '#eee', borderRadius: '8px', fontSize: '0.9rem'}}>
       <strong>Note:</strong> Visit the CETSO office for personal attendance queries.
    </div>
  </div>
)}
        
        {/* 2. LOGIN VIEW */}
{view === 'login' && (
  <div className="login-box-container"> 
    <div className="login-card">
      <h2>Officer Access</h2>
      <p>Please enter your access code to manage attendance.</p>
      <form onSubmit={handleLogin}>
        <input 
          type="password" 
          placeholder="Access Code" 
          required 
          className="login-input"
        />
        <button type="submit" className="login-btn">Login</button>
      </form>
    </div>
  </div>
)}

        {view === 'scanner' && user && (
          <ScannerPage students={INITIAL_STUDENTS} onRecordAttendance={handleRecordAttendance} />
        )}

        {view === 'dashboard' && user && (
          <div className="wide-container">
            <div className="dashboard-header">
              <h1>Officer Dashboard</h1>
              <div className="btn-group">
                <button className={dashboardTab === 'logs' ? 'active' : ''} onClick={() => setDashboardTab('logs')}>Logs</button>
                <button className={dashboardTab === 'sanctions' ? 'active' : ''} onClick={() => setDashboardTab('sanctions')}>Calculated Sanctions</button>
                <button onClick={clearAttendanceLogs} className="btn-clear">Reset All Logs</button>
              </div>
            </div>

            {dashboardTab === 'logs' ? (
              <div className="table-card">
                <h3>Live Attendance Stream</h3>
                <table className="modern-table">
                  <thead>
                    <tr><th>Time</th><th>Name</th><th>Status</th><th>Program</th></tr>
                  </thead>
                  <tbody>
                    {attendance.map(log => (
                      <tr key={log.id}>
                        <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td>{log.name}</td>
                        <td><span className={`badge ${log.type}`}>{log.type}</span></td>
                        <td>{log.program}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="table-card">
                <div className="filter-bar">
                  <label>Calculate for Event:</label>
                  <select value={activeEvent} onChange={(e) => setActiveEvent(e.target.value)}>
                    <option value="Intramurals">Intramurals (12 Checks Required)</option>
                    <option value="Orientation">Orientation (2 Checks Required)</option>
                  </select>
                </div>
                <table className="modern-table sanction-table">
                  <thead>
                    <tr><th>Student</th><th>Absences</th><th>Required Items</th><th>Value</th></tr>
                  </thead>
                  <tbody>
                    {calculateSanctions(
                      INITIAL_STUDENTS, 
                      attendance, 
                      activeEvent === 'Intramurals' ? 12 : 2, 
                      SANCTION_RULES.filter(r => r.category === activeEvent)
                    ).map((s, i) => (
                      <tr key={i}>
                        <td>{s.studentName}</td>
                        <td className="warning-text">{s.absences}</td>
                        <td>{s.item}</td>
                        <td>₱{s.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;