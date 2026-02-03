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
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
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
  const [lastScan, setLastScan] = useState<{ status: string, msg: string, student?: any } | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [eventMode, setEventMode] = useState('Intramurals');
  const [sessionTime, setSessionTime] = useState('AM_IN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  
  // Cooldown to prevent duplicate rapid scans of the same ID
  const lastScannedId = useRef<string | null>(null);
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Automatic Focus Management for Hardware Scanners
  useEffect(() => {
    const keepFocus = () => {
      if (!showCamera) inputRef.current?.focus();
    };
    document.addEventListener('click', keepFocus);
    return () => document.removeEventListener('click', keepFocus);
  }, [showCamera]);

  // 2. Continuous Camera Scanner Initialization
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (showCamera) {
      scanner = new Html5QrcodeScanner(
        "sp-reader",
        {
          fps: 25, // Higher FPS for snappier "automatic" detection
          qrbox: { width: 320, height: 180 }, 
          aspectRatio: 1.77, // Widescreen ratio is better for 1D barcodes
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8
          ]
        },
        false
      );

      scanner.render(
        (decodedText) => {
          // Check if this is a duplicate scan within the cooldown period
          if (decodedText === lastScannedId.current) return;

          // Provide immediate visual/audio feedback logic here if desired
          handleProcessAttendance(decodedText);

          // Set cooldown: Prevent scanning the SAME ID for 3 seconds
          lastScannedId.current = decodedText;
          if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
          cooldownTimer.current = setTimeout(() => {
            lastScannedId.current = null;
          }, 3000); 
        },
        (error) => { /* Silently ignore scanning noise */ }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
      if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
    };
  }, [showCamera, eventMode, sessionTime]); // Re-init if mode changes to ensure context is fresh

  // 3. Central Logic for Recording Attendance
  const handleProcessAttendance = async (idToSubmit: string) => {
    const cleanId = idToSubmit.trim();
    if (!cleanId || isProcessing) return;

    setIsProcessing(true);
    const combinedType = `${eventMode} ${sessionTime}`;

    try {
      const result = await onRecordAttendance(cleanId, combinedType);

      const scanResult = {
        status: result.success ? 'success' : 'error',
        msg: result.msg,
        student: result.student,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };

      setLastScan(scanResult);

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
      // Ensure hardware scanner focus returns
      setTimeout(() => {
        if (!showCamera) inputRef.current?.focus();
      }, 100);
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
              <div className={`sp-indicator-pulse ${showCamera ? 'active' : ''}`}></div>
              <span>CET Scanner Engine</span>
            </div>

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
                {showCamera ? "Close Camera" : "Open Auto-Scanner"}
              </button>
            </div>
          </div>

          {showCamera && (
            <div className="sp-reader-container">
               <div id="sp-reader" className="sp-camera-viewfinder"></div>
               <div className="sp-scan-overlay">Scanning for 1D Barcodes...</div>
            </div>
          )}

          <div className="sp-history-card">
            <div className="sp-history-header">
              <History size={16} />
              <span>Recent Records</span>
            </div>
            <div className="sp-history-list">
              {recentScans.length === 0 ? (
                <p className="sp-empty-text">Awaiting first scan...</p>
              ) : (
                recentScans.map((scan, i) => (
                  <div key={i} className="sp-history-item">
                    <div className="sp-hist-info">
                      <strong>{scan.last_name || scan.lastName}, {scan.first_name || scan.firstName}</strong>
                      <span>{scan.student_id || scan.studentId}</span>
                    </div>
                    <span className="sp-hist-time">{scan.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Right Panel: Result Display */}
        <main className="sp-display">
          {lastScan ? (
            <div className={`sp-result-box ${lastScan.status}`}>
              <button className="sp-reset-btn" onClick={() => setLastScan(null)}>
                <RotateCcw size={16} /> Clear Screen
              </button>

              <div className="sp-icon-reveal">
                {lastScan.status === 'success' ? <ShieldCheck size={100} /> : <ShieldAlert size={100} />}
              </div>

              <h1 className="sp-title">{lastScan.status === 'success' ? 'ACCESS GRANTED' : 'INVALID ID'}</h1>
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
                    <span className="sp-id-tag">STUDENT ID: {lastScan.student.student_id || lastScan.student.studentId}</span>
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
              <h2>READY TO SCAN</h2>
              <p>Place the student barcode within the camera viewfinder or use a USB scanner.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ScannerPage;