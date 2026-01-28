import { useState, useEffect } from 'react';
import Navbar from './files/components/Navbar';
import Footer from './files/components/Footer';

// Pages
import PublicPage from './files/pages/PublicPage';
import LoginPage from './files/pages/LoginPage';
import ScannerPage from './files/pages/ScannerPage';
import DashboardPage from './files/pages/Dashboard';

// Supabase Connection
import { supabase } from './files/utils/supabaseClient';
import './App.css';

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
  const [dbStudents, setDbStudents] = useState<any[]>([]);

  // Function to fetch students (called on mount and via real-time)
  const fetchStudents = async () => {
    const { data, error } = await supabase.from('students').select('*');
    if (error) console.error("Error fetching students:", error);
    else setDbStudents(data);
  };

  // Function to fetch attendance (called on mount and via real-time)
  const fetchAttendance = async () => {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) console.error("Error fetching attendance:", error);
    else setAttendance(data);
  };

  useEffect(() => {
    // Initial Load
    fetchStudents();
    fetchAttendance();

    // --- REAL-TIME: ATTENDANCE LOGS ---
    const attendanceChannel = supabase
      .channel('attendance_live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'attendance_logs' },
        (payload) => {
          setAttendance((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    // --- REAL-TIME: STUDENTS MASTERLIST ---
    // This listens for any changes (INSERT, UPDATE, DELETE) to the student list
    const studentChannel = supabase
      .channel('students_live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'students' },
        () => {
          fetchStudents(); // Re-sync the local list whenever database changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(attendanceChannel);
      supabase.removeChannel(studentChannel);
    };
  }, []);

  const handleRecordAttendance = async (studentIdInput: string, type: string) => {
    const numericId = parseInt(studentIdInput, 10);
    if (isNaN(numericId)) {
      return { success: false, msg: "Invalid ID format. Numbers only." };
    }

    // Standardize key lookup (Supabase uses student_id)
    const student = dbStudents.find(s => (s.student_id || s.studentId) === numericId);
    if (!student) {
      return { success: false, msg: `ID ${numericId} not found in database.` };
    }

    const today = new Date().toDateString();
    const duplicate = attendance.find(r =>
      (r.student_id || r.studentId) === numericId &&
      r.type === type &&
      new Date(r.timestamp).toDateString() === today
    );

    if (duplicate) {
      return {
        success: false,
        msg: `Attendance already recorded for ${student.first_name || student.firstName} today.`,
        student
      };
    }

    const newRecord = {
      student_id: student.student_id || student.studentId,
      first_name: student.first_name || student.firstName,
      last_name: student.last_name || student.lastName,
      program: student.program,
      year_level: student.year_level || student.yearLevel,
      type,
      timestamp: new Date().toISOString()
    };

    const { error } = await supabase
      .from('attendance_logs')
      .insert([newRecord]);

    if (error) return { success: false, msg: "Failed to save to cloud database." };

    return {
      success: true,
      msg: `Successfully recorded ${type} for ${student.first_name || student.firstName}`,
      student
    };
  };

  const handleLogout = () => {
    setUser(null);
    setView('public');
  };

  return (
    <div className="app">
      <Navbar currentView={view} setView={setView} user={user} logout={handleLogout} />
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
            <ScannerPage
              students={dbStudents}
              onRecordAttendance={handleRecordAttendance}
            />
          </ProtectedRoute>
        )}

        {view === 'dashboard' && (
          <ProtectedRoute user={user} setView={setView}>
            <DashboardPage 
              attendance={attendance} 
              setAttendance={setAttendance} 
              dbStudents={dbStudents} 
            />
          </ProtectedRoute>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;