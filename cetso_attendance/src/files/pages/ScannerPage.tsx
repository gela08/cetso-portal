import React, { useState, useEffect, useRef } from 'react';
import '../styles/pages/scanner.css';

// Types matches App.tsx
interface Student {
  id: string;
  name: string;
  program: string;
}

interface ScannerPageProps {
  students: Student[];
  onRecordAttendance: (studentId: string, type: string) => { success: boolean, msg: string, student?: Student };
}

const ScannerPage: React.FC<ScannerPageProps> = ({ onRecordAttendance }) => {
  const [inputId, setInputId] = useState('');
  const [lastScan, setLastScan] = useState<{status: string, msg: string, student?: Student} | null>(null);
  
  // States for the new Button Selection
  const [eventMode, setEventMode] = useState('Intramurals'); 
  const [sessionTime, setSessionTime] = useState('AM_IN');

  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input for barcode scanner
  useEffect(() => {
    inputRef.current?.focus();
    const handleBlur = () => setTimeout(() => inputRef.current?.focus(), 100);
    window.addEventListener('click', handleBlur);
    return () => window.removeEventListener('click', handleBlur);
  }, []);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputId) return;

    // We pass a combined string so App.tsx logic knows which event and time it is
    // Example: "Intramurals AM_IN"
    const combinedType = `${eventMode} ${sessionTime}`;
    const result = onRecordAttendance(inputId, combinedType);
    
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
        
        {/* Event Selection Buttons */}
        <div className="mode-section">
          <label className="section-label">Select Event:</label>
          <div className="button-grid">
            {['Intramurals', 'Orientation'].map((ev) => (
              <button 
                key={ev}
                type="button"
                className={`mode-btn ${eventMode === ev ? 'active' : ''}`}
                onClick={() => setEventMode(ev)}
              >
                {ev}
              </button>
            ))}
          </div>
        </div>

        {/* Session Selection Buttons */}
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
                type="button"
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

        <div className="scan-instructions">
          <p>Ready for: <strong>{eventMode}</strong> ({sessionTime.replace('_', ' ')})</p>
          <small>Click anywhere to refocus the scanner.</small>
        </div>
      </div>

      <div className="scan-result">
        {lastScan ? (
          <div className={`result-card ${lastScan.status}`}>
            <h3>{lastScan.status === 'success' ? '✅ Success' : '❌ Error'}</h3>
            <p className="scan-msg">{lastScan.msg}</p>
            {lastScan.student && (
              <div className="student-details">
                <div className="avatar-placeholder">ID</div>
                <div className="student-info">
                  <h4>{lastScan.student.name}</h4>
                  <p>{lastScan.student.program}</p>
                  <span className="id-badge">{lastScan.student.id}</span>
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