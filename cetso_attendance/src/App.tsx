import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './files/utils/supabaseClient';

// Layout & Pages
import Navbar from './files/components/Navbar';
import Footer from './files/components/Footer';
import PublicPage from './files/pages/PublicPage';
import CollegeOfficers from './files/pages/public/CollegeOfficers';
import ProgramOfficers from './files/pages/public/ProgramOfficers';
import PublicSanctions from './files/pages/public/PublicSanctions';
import SubmissionPortal from './files/pages/public/SubmissionPortal';
import LoginPage from './files/pages/LoginPage';
import ScannerPage from './files/pages/ScannerPage';
import DashboardPage from './files/pages/Dashboard';

import './App.css';

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [dbStudents, setDbStudents] = useState<any[]>([]);
  const navigate = useNavigate();
  const location = useLocation(); // Corrected: use the hook for path detection

  const isDashboard = location.pathname === '/dashboard';
  const isScanner = location.pathname === '/scanner';

  // --- DATA FETCHING ---
  const fetchStudents = async () => {
    const { data, error } = await supabase.from('students').select('*');
    if (error) console.error("Error fetching students:", error);
    else setDbStudents(data || []);
  };

  const fetchAttendance = async () => {
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) console.error("Error fetching attendance:", error);
    else setAttendance(data || []);
  };

  useEffect(() => {
    fetchStudents();
    fetchAttendance();

    // REALTIME: Sync attendance logs instantly
    const attendanceChannel = supabase
      .channel('attendance_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance_logs' },
        (payload) => {
          // Only add if not already in state to prevent race conditions
          setAttendance((prev) => {
            const exists = prev.some(item => item.id === payload.new.id);
            return exists ? prev : [payload.new, ...prev];
          });
        })
      .subscribe();

    // REALTIME: Sync student list (if names or programs change)
    const studentChannel = supabase
      .channel('students_live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' },
        () => { fetchStudents(); })
      .subscribe();

    return () => {
      supabase.removeChannel(attendanceChannel);
      supabase.removeChannel(studentChannel);
    };
  }, []);

  // --- ATTENDANCE LOGIC ---
  const handleRecordAttendance = async (studentIdInput: string, type: string) => {
    // 1. Validate Input (Clean up barcode artifacts if necessary)
    const cleanId = studentIdInput.replace(/\D/g, '');
    const numericId = parseInt(cleanId, 10);

    if (isNaN(numericId)) return { success: false, msg: "Invalid ID format." };

    // 2. Find Student in Database State
    const student = dbStudents.find(s => (s.student_id ?? s.studentId) === numericId);
    if (!student) return { success: false, msg: `ID ${numericId} not found in CET records.` };

    // 3. Prevent Duplicate Entry for the same session today
    const today = new Date().toDateString();
    const duplicate = attendance.find(r => {
      const rId = r.student_id ?? r.studentId;
      const rDate = new Date(r.timestamp).toDateString();
      return rId === numericId && r.type === type && rDate === today;
    });

    if (duplicate) return { success: false, msg: "Attendance already logged for this session.", student };

    // 4. Prepare Record for Supabase
    const newRecord = {
      student_id: student.student_id ?? student.studentId,
      first_name: student.first_name ?? student.firstName,
      last_name: student.last_name ?? student.lastName,
      program: student.program,
      year_level: student.year_level ?? student.yearLevel,
      type,
      timestamp: new Date().toISOString()
    };

    // 5. Insert to Supabase
    const { error } = await supabase.from('attendance_logs').insert([newRecord]);

    if (error) {
      console.error("Supabase Insert Error:", error);
      return { success: false, msg: "Database sync failed." };
    }

    // Note: We don't manually setAttendance here because the Realtime Channel handles it!
    return { success: true, msg: "Verified! Entry recorded.", student };
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <div className="app">
      <Navbar user={user} logout={handleLogout} />

      <main className="main-content">
        <Routes>
          <Route path="/" element={<PublicPage />} />
          <Route path="/public/college-officers" element={<CollegeOfficers />} />
          <Route path="/public/program-officers" element={<ProgramOfficers />} />
          <Route path="/public/sanctions" element={<PublicSanctions />} />
          <Route path="/public/submissions" element={<SubmissionPortal />} />

          <Route path="/login" element={
            <LoginPage onLoginSuccess={(userData) => {
              setUser(userData);
              navigate('/dashboard');
            }} />
          } />

          <Route
            path="/scanner"
            element={user ? <ScannerPage onRecordAttendance={handleRecordAttendance} /> : <Navigate to="/login" />}
          />

          <Route
            path="/dashboard"
            element={user ? (
              <DashboardPage
                attendance={attendance}
                setAttendance={setAttendance}
                dbStudents={dbStudents}
                onRecordAttendance={handleRecordAttendance} // Add this line
              />
            ) : <Navigate to="/login" />}
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Hide footer on focused admin pages to keep the UI clean */}
      {!isDashboard && !isScanner && <Footer />}
    </div>
  );
};

export default App;