import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Scan, 
  Calendar, 
  Clock, 
  RotateCcw, 
  History, 
  Camera, 
  Keyboard,
  Send
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import '../styles/pages/scanner.css';

interface ScannerPageProps {
  onRecordAttendance: (studentId: string, type: string) => Promise<{ 
    success: boolean, 
    msg: string, 
    student?: any 
  }>;
}

const ScannerPage: React.FC<ScannerPageProps> = ({ onRecordAttendance }) => {
  // State Management
  const [inputId, setInputId] = useState('');
  const [lastScan, setLastScan] = useState<{status: string, msg: string, student?: any} | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [eventMode, setEventMode] = useState('Intramurals'); 
  const [sessionTime, setSessionTime] = useState('AM_IN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Automatic Focus Management
  // This ensures hardware barcode scanners always have a place to "type"
  useEffect(() => {
    const keepFocus = () => {
      if (!showCamera) inputRef.current?.focus();
    };
    document.addEventListener('click', keepFocus);
    return () => document.removeEventListener('click', keepFocus);
  }, [showCamera]);

  // 2. Camera Scanner Initialization
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (showCamera) {
      scanner = new Html5QrcodeScanner(
        "sp-reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } }, 
        false
      );

      scanner.render(
        (decodedText) => {
          handleProcessAttendance(decodedText);
          setShowCamera(false); // Close camera after successful scan
          if (scanner) scanner.clear();
        },
        (error) => {
          // Handle scan failure, if needed
          console.warn(`Scan error: ${error}`);
        }
      );
    }

    return () => {
      if (scanner) scanner.clear().catch(console.error);
    };
  }, [showCamera]);

  // 3. Central Logic for Recording Attendance
  const handleProcessAttendance = async (idToSubmit: string) => {
    const cleanId = idToSubmit.trim();
    if (!cleanId || isProcessing) return;

    setIsProcessing(true);
    const combinedType = `${eventMode} ${sessionTime}`;
    
    try {
      // Direct Database Sync via parent prop
      const result = await onRecordAttendance(cleanId, combinedType);
      
      const scanResult = {
        status: result.success ? 'success' : 'error',
        msg: result.msg,
        student: result.student,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setLastScan(scanResult);

      // Add to session history if successful
      if (result.success && result.student) {
        setRecentScans(prev => [
          { ...result.student, type: combinedType, time: scanResult.timestamp },
          ...prev.slice(0, 9)
        ]);
      }
    } catch (err) {
      setLastScan({ status: 'error', msg: 'Database connection failed.' });
    } finally {
      setInputId(''); 
      setIsProcessing(false);
      // Return focus to input for next hardware scan
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const onManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleProcessAttendance(inputId);
  };

  return (
    <div className="sp-wrapper">
      <div className="sp-container">
        
        {/* Left Sidebar: Control Panel */}
        <aside className="sp-sidebar">
          <div className="sp-engine-card">
            <div className="sp-status-header">
              <div className="sp-indicator-pulse"></div>
              <span>CET Scanner Engine</span>
            </div>

            {/* Event Selection */}
            <div className="sp-field">
              <label><Calendar size={14} /> Event Context</label>
              <div className="sp-button-group">
                {['Intramurals', 'Orientation'].map(ev => (
                  <button 
                    key={ev} 
                    className={`sp-toggle ${eventMode === ev ? 'active' : ''}`} 
                    onClick={() => setEventMode(ev)}
                  >
                    {ev}
                  </button>
                ))}
              </div>
            </div>

            {/* Shift Selection */}
            <div className="sp-field">
              <label><Clock size={14} /> Session Period</label>
              <div className="sp-grid-options">
                {['AM_IN', 'AM_OUT', 'PM_IN', 'PM_OUT'].map(id => (
                  <button 
                    key={id} 
                    className={`sp-toggle ${sessionTime === id ? 'active' : ''}`} 
                    onClick={() => setSessionTime(id)}
                  >
                    {id.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Method Section */}
            <div className="sp-input-section">
              <label><Keyboard size={14} /> Manual ID Entry</label>
              <form onSubmit={onManualSubmit} className="sp-manual-form">
                <div className={`sp-input-group ${isProcessing ? 'processing' : ''}`}>
                  <input 
                    ref={inputRef}
                    type="text" 
                    value={inputId} 
                    onChange={(e) => setInputId(e.target.value)} 
                    placeholder="Scan or type ID..." 
                    autoComplete="off"
                  />
                  <button type="submit" className="sp-submit-btn" disabled={isProcessing}>
                    <Send size={16} />
                  </button>
                </div>
              </form>

              <button 
                className={`sp-camera-btn ${showCamera ? 'active' : ''}`}
                onClick={() => setShowCamera(!showCamera)}
              >
                <Camera size={18} />
                {showCamera ? "Close Camera" : "Use Phone Camera"}
              </button>
            </div>
          </div>

          {/* Inline Camera Viewfinder */}
          {showCamera && (
            <div id="sp-reader" className="sp-camera-viewfinder"></div>
          )}
          
          {/* Real-time Session Logs */}
          <div className="sp-history-card">
            <div className="sp-history-header">
              <History size={16} />
              <span>Session History</span>
            </div>
            <div className="sp-history-list">
              {recentScans.length === 0 ? (
                <p className="sp-empty-text">No scans recorded yet</p>
              ) : (
                recentScans.map((scan, i) => (
                  <div key={i} className="sp-history-item">
                    <div className="sp-hist-info">
                      <strong>{scan.first_name || scan.firstName} {scan.last_name || scan.lastName}</strong>
                      <span>{scan.student_id || scan.studentId}</span>
                    </div>
                    <span className="sp-hist-time">{scan.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Right Panel: Display Results */}
        <main className="sp-display">
          {lastScan ? (
            <div className={`sp-result-box ${lastScan.status}`}>
              <button className="sp-reset-btn" onClick={() => setLastScan(null)}>
                <RotateCcw size={16} /> Clear
              </button>
              
              <div className="sp-icon-reveal">
                {lastScan.status === 'success' ? <ShieldCheck size={100} /> : <ShieldAlert size={100} />}
              </div>
              
              <h1 className="sp-title">{lastScan.status === 'success' ? 'Verified' : 'Access Denied'}</h1>
              <p className="sp-message">{lastScan.msg}</p>

              {lastScan.student && (
                <div className="sp-profile-card">
                  <div className="sp-avatar">
                    {(lastScan.student.last_name || lastScan.student.lastName || '?').charAt(0)}
                  </div>
                  <div className="sp-info">
                    <h3>
                      {lastScan.student.first_name || lastScan.student.firstName} {' '}
                      {lastScan.student.last_name || lastScan.student.lastName}
                    </h3>
                    <p>{lastScan.student.program} • Year {lastScan.student.year_level || lastScan.student.yearLevel}</p>
                    <span className="sp-id-tag">ID: {lastScan.student.student_id || lastScan.student.studentId}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="sp-idle-state">
              <div className="sp-visualizer">
                <div className="sp-scanner-line"></div>
                <Scan size={120} strokeWidth={1} />
              </div>
              <h2>Awaiting Scan</h2>
              <p>Position barcode or enter Student ID to record attendance</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ScannerPage;