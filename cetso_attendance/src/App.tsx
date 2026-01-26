import { useState, useEffect } from 'react';
import Navbar from './files/components/Navbar';
import Footer from './files/components/Footer';

// Pages
import PublicPage from './files/pages/PublicPage';
import LoginPage from './files/pages/LoginPage';
import ScannerPage from './files/pages/ScannerPage';
import DashboardPage from './files/pages/Dashboard';

// Data
import { INITIAL_STUDENTS } from './files/utils/Data';
import './App.css';

// Guard Component: Ensures only logged-in users can see specific pages
const ProtectedRoute = ({ user, children, setView }: any) => {
  useEffect(() => {
    if (!user) setView('login');
  }, [user, setView]);
  return user ? children : null;
};

const App = () => {
  const [view, setView] = useState('public');
  const [user, setUser] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);

  // Load data from LocalStorage when the app starts
  useEffect(() => {
    const saved = localStorage.getItem('cetso_attendance');
    if (saved) {
      try {
        setAttendance(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse attendance data", error);
      }
    }
  }, []);

  // Automatically save attendance data whenever it changes
  useEffect(() => {
    localStorage.setItem('cetso_attendance', JSON.stringify(attendance));
  }, [attendance]);

  /**
   * Main Logic for Recording Attendance
   * Correctly captures firstName and lastName for the Sanction List
   */
  const handleRecordAttendance = (studentId: string, type: string) => {
    // Cast INITIAL_STUDENTS as any if TypeScript is still strict about the 'name' field
    const student = (INITIAL_STUDENTS as any[]).find(s => s.id === studentId);
    
    if (!student) {
      return { success: false, msg: `ID ${studentId} not found in CETSO database.` };
    }

    const today = new Date().toDateString();

    // Prevent duplicate logs for the same student, same type, on the same day
    const duplicate = attendance.find(r =>
      r.studentId === studentId && 
      r.type === type && 
      new Date(r.timestamp).toDateString() === today
    );

    if (duplicate) {
      return { 
        success: false, 
        msg: `Attendance already recorded for ${student.firstName} today.`, 
        student 
      };
    }

    // Create the new attendance record with updated name fields
    const newRecord = {
      id: Date.now(),
      studentId: student.id,
      firstName: student.firstName, 
      lastName: student.lastName,  
      program: student.program,
      yearLevel: student.yearLevel,
      type,
      timestamp: new Date().toISOString()
    };

    // Update state
    setAttendance([newRecord, ...attendance]);

    const fullName = `${student.firstName} ${student.lastName}`;
    return { 
      success: true, 
      msg: `Successfully recorded ${type} for ${fullName}`, 
      student 
    };
  };

  const handleLogout = () => {
    setUser(null);
    setView('public');
  };

  return (
    <div className="app">
      <Navbar 
        currentView={view} 
        setView={setView} 
        user={user} 
        logout={handleLogout} 
      />

      <main className="main-content">
        {view === 'public' && <PublicPage />}
        
        {view === 'login' && (
          <LoginPage onLoginSuccess={(userData) => { 
            setUser(userData); 
            setView('dashboard'); 
          }} />
        )}

        {view === 'scanner' && (
          <ProtectedRoute user={user} setView={setView}>
            {/* Note: Ensure ScannerPage component also uses split name fields internally */}
            <ScannerPage 
              students={INITIAL_STUDENTS as any} 
              onRecordAttendance={handleRecordAttendance} 
            />
          </ProtectedRoute>
        )}

        {view === 'dashboard' && (
          <ProtectedRoute user={user} setView={setView}>
            <DashboardPage 
              attendance={attendance} 
              setAttendance={setAttendance} 
            />
          </ProtectedRoute>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;