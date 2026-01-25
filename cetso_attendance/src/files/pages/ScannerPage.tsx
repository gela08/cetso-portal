import React, { useState, useEffect, useRef } from 'react';
import '../styles/pages/scanner.css';

// Mock Data Types
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
  const [scanMode, setScanMode] = useState('AM_IN'); // AM_IN, AM_OUT, PM_IN, PM_OUT
  
  // Auto-focus input for barcode scanner
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    // Re-focus listener for clicking away
    const handleBlur = () => setTimeout(() => inputRef.current?.focus(), 100);
    window.addEventListener('click', handleBlur);
    return () => window.removeEventListener('click', handleBlur);
  }, []);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputId) return;

    const result = onRecordAttendance(inputId, scanMode);
    
    setLastScan({
      status: result.success ? 'success' : 'error',
      msg: result.msg,
      student: result.student
    });

    setInputId(''); // Clear for next scan
  };

  return (
    <div className="scanner-container">
      <div className="scanner-controls">
        <h2>Attendance Scanner</h2>
        
        <div className="mode-selector">
          <label>Session Mode:</label>
          <select value={scanMode} onChange={(e) => setScanMode(e.target.value)}>
            <option value="AM_IN">Morning IN</option>
            <option value="AM_OUT">Morning OUT</option>
            <option value="PM_IN">Afternoon IN</option>
            <option value="PM_OUT">Afternoon OUT</option>
          </select>
        </div>

        <form onSubmit={handleScan} className="scan-form">
          <input 
            ref={inputRef}
            type="text" 
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="Scan Barcode or Type ID..."
            autoComplete="off"
          />
          <button type="submit">Submit</button>
        </form>

        <div className="scan-instructions">
          <p>Scanner is <strong>READY</strong>. Click anywhere to refocus.</p>
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
                <div>
                  <h4>{lastScan.student.name}</h4>
                  <p>{lastScan.student.program}</p>
                  <span className="id-badge">{lastScan.student.id}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="waiting-state">
            Waiting for input...
          </div>
        )}
      </div>
    </div>
  );
};

export default ScannerPage;