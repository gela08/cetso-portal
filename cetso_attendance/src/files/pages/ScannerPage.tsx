import React, { useState, useEffect, useRef } from 'react';
import '../styles/pages/scanner.css';

interface Student {
  student_id: number;
  first_name: string; 
  last_name: string;
  year_level: string;
  program: string;
}

interface ScannerPageProps {
  students: Student[];
  // Fix: Return type updated to Promise to match async App.tsx logic
  onRecordAttendance: (studentId: string, type: string) => Promise<{ 
    success: boolean, 
    msg: string, 
    student?: Student 
  }>;
}

const ScannerPage: React.FC<ScannerPageProps> = ({ onRecordAttendance }) => {
  const [inputId, setInputId] = useState('');
  const [lastScan, setLastScan] = useState<{status: string, msg: string, student?: any} | null>(null);
  const [eventMode, setEventMode] = useState('Intramurals'); 
  const [sessionTime, setSessionTime] = useState('AM_IN');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleBlur = () => setTimeout(() => inputRef.current?.focus(), 100);
    window.addEventListener('click', handleBlur);
    return () => window.removeEventListener('click', handleBlur);
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputId) return;

    const combinedType = `${eventMode} ${sessionTime}`;
    const result = await onRecordAttendance(inputId, combinedType);
    
    setLastScan({
      status: result.success ? 'success' : 'error',
      msg: result.msg,
      student: result.student
    });

    setInputId(''); 
  };

  return (
    <div className="scanner-container">
      <div className="scanner-controls">
        <h2>Attendance Scanner</h2>
        <div className="mode-section">
          <label className="section-label">Select Event:</label>
          <div className="button-grid">
            {['Intramurals', 'Orientation'].map((ev) => (
              <button 
                key={ev} 
                className={`mode-btn ${eventMode === ev ? 'active' : ''}`} 
                onClick={() => setEventMode(ev)}
              >
                {ev}
              </button>
            ))}
          </div>
        </div>
        <div className="mode-section">
          <label className="section-label">Session Time:</label>
          <div className="button-grid">
            {[
              { id: 'AM_IN', label: 'Morning IN' },
              { id: 'AM_OUT', label: 'Morning OUT' },
              { id: 'PM_IN', label: 'Afternoon IN' },
              { id: 'PM_OUT', label: 'Afternoon OUT' }
            ].map((opt) => (
              <button 
                key={opt.id} 
                className={`mode-btn ${sessionTime === opt.id ? 'active' : ''}`} 
                onClick={() => setSessionTime(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <form onSubmit={handleScan} className="scan-form">
          <input 
            ref={inputRef} 
            type="text" 
            value={inputId} 
            onChange={(e) => setInputId(e.target.value)} 
            placeholder="Scan Barcode..." 
            autoComplete="off" 
          />
          <button type="submit">Submit</button>
        </form>
      </div>

      <div className="scan-result">
        {lastScan ? (
          <div className={`result-card ${lastScan.status}`}>
            <h3>{lastScan.status === 'success' ? '✅ Success' : '❌ Error'}</h3>
            <p className="scan-msg">{lastScan.msg}</p>
            {lastScan.student && (
              <div className="student-details">
                <div className="avatar-placeholder">
                  {(lastScan.student.last_name || lastScan.student.lastName)?.charAt(0)}
                </div>
                <div className="student-info">
                  <h4>
                    {lastScan.student.first_name || lastScan.student.firstName}{' '}
                    {lastScan.student.last_name || lastScan.student.lastName}
                  </h4>
                  <p>{lastScan.student.program} — {lastScan.student.year_level || lastScan.student.yearLevel}</p>
                  <span className="id-badge">{lastScan.student.student_id || lastScan.student.studentId}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="waiting-state">
            <div className="pulse"></div>
            <p>Waiting for scan...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerPage;