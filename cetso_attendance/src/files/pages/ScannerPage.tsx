import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  // --- State ---
  const [inputId, setInputId] = useState('');
  const [lastScan, setLastScan] = useState<{ status: string, msg: string, student?: any } | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [eventMode, setEventMode] = useState('Intramurals');
  const [sessionTime, setSessionTime] = useState('AM_IN');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  
  // --- Refs ---
  const lastScannedId = useRef<string | null>(null);
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Central Logic for Recording Attendance (Memoized to prevent effect loops)
  const handleProcessAttendance = useCallback(async (idToSubmit: string) => {
    const cleanId = idToSubmit.trim();
    if (!cleanId || isProcessing) return;

    setIsProcessing(true);
    
    // Clear any existing "clear screen" timers if a new person scans
    if (resetTimer.current) clearTimeout(resetTimer.current);

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
          ...prev.slice(0, 9) // Keep last 10
        ]);
      }

      // AUTO-RESET: Clear the result screen after 5 seconds to be ready for next student
      resetTimer.current = setTimeout(() => {
        setLastScan(null);
      }, 5000);

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
  }, [eventMode, sessionTime, isProcessing, onRecordAttendance, showCamera]);

  // 2. Automatic Focus Management (USB/Hardware Scanners)
  useEffect(() => {
    const keepFocus = () => {
      if (!showCamera && !isProcessing) inputRef.current?.focus();
    };
    document.addEventListener('click', keepFocus);
    return () => document.removeEventListener('click', keepFocus);
  }, [showCamera, isProcessing]);

  // 3. Camera Scanner Initialization
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (showCamera) {
      scanner = new Html5QrcodeScanner(
        "sp-reader",
        {
          fps: 20,
          qrbox: { width: 280, height: 160 }, 
          aspectRatio: 1.77,
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.QR_CODE, // Added QR support just in case
            Html5QrcodeSupportedFormats.EAN_13
          ]
        },
        false
      );

      scanner.render(
        (decodedText) => {
          // Prevent rapid double-scanning of same ID
          if (decodedText === lastScannedId.current) return;

          handleProcessAttendance(decodedText);

          lastScannedId.current = decodedText;
          if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
          cooldownTimer.current = setTimeout(() => {
            lastScannedId.current = null;
          }, 3500); // 3.5s cooldown
        },
        (error) => {
          // Scanner error handling (optional)
             console.warn(`Scan error: ${error}`);
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Scanner clear failed", err));
      }
      if (cooldownTimer.current) clearTimeout(cooldownTimer.current);
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, [showCamera, handleProcessAttendance]);

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
              <div className={`sp-indicator-pulse ${showCamera || !showCamera ? 'active' : ''}`}></div>
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
                    disabled={isProcessing}
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
                {showCamera ? "Close Camera" : "Open Camera Scanner"}
              </button>
            </div>
          </div>

          {showCamera && (
            <div className="sp-reader-outer">
               <div id="sp-reader" className="sp-camera-viewfinder"></div>
               <div className="sp-scan-overlay">Align Barcode within Box</div>
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
                      <strong>{scan.last_name}, {scan.first_name}</strong>
                      <span>{scan.student_id}</span>
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
                <RotateCcw size={16} /> Reset View
              </button>

              <div className="sp-icon-reveal">
                {lastScan.status === 'success' ? <ShieldCheck size={120} /> : <ShieldAlert size={120} />}
              </div>

              <h1 className="sp-title">
                {lastScan.status === 'success' ? 'ACCESS GRANTED' : 'INVALID ATTEMPT'}
              </h1>
              <p className="sp-message">{lastScan.msg}</p>

              {lastScan.student && (
                <div className="sp-profile-card">
                  <div className="sp-avatar">
                    {lastScan.student.last_name?.charAt(0) || 'S'}
                  </div>
                  <div className="sp-info">
                    <h3>{lastScan.student.first_name} {lastScan.student.last_name}</h3>
                    <p>{lastScan.student.program} • Year {lastScan.student.year_level}</p>
                    <span className="sp-id-tag">ID: {lastScan.student.student_id}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="sp-idle-state">
              <div className="sp-visualizer">
                <div className="sp-scanner-line"></div>
                <Scan size={140} strokeWidth={1} />
              </div>
              <h2>READY TO SCAN</h2>
              <p>System active. Use hardware scanner or camera to log attendance.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ScannerPage;