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

// Guard Component
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

  // Load persistence on mount
  useEffect(() => {
    const saved = localStorage.getItem('cetso_attendance');
    if (saved) setAttendance(JSON.parse(saved));
  }, []);

  // Save persistence on changes
  useEffect(() => {
    localStorage.setItem('cetso_attendance', JSON.stringify(attendance));
  }, [attendance]);

  // Shared function for Scanner
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

  return (
    <div className="app">
      <Navbar 
        currentView={view} 
        setView={setView} 
        user={user} 
        logout={() => { setUser(null); setView('public'); }} 
      />

      <main className="main-content">
        {view === 'public' && <PublicPage />}
        
        {view === 'login' && (
          <LoginPage onLoginSuccess={(userData) => { setUser(userData); setView('dashboard'); }} />
        )}

        {view === 'scanner' && (
          <ProtectedRoute user={user} setView={setView}>
            <ScannerPage students={INITIAL_STUDENTS} onRecordAttendance={handleRecordAttendance} />
          </ProtectedRoute>
        )}

        {view === 'dashboard' && (
          <ProtectedRoute user={user} setView={setView}>
            <DashboardPage attendance={attendance} setAttendance={setAttendance} />
          </ProtectedRoute>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default App;