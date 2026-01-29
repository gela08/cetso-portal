import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './files/utils/supabaseClient';

// Layout Components
import Navbar from './files/components/Navbar';
import Footer from './files/components/Footer';

// Public Pages
import PublicPage from './files/pages/PublicPage';
import CollegeOfficers from './files/pages/public/CollegeOfficers';
import ProgramOfficers from './files/pages/public/ProgramOfficers';
import PublicSanctions from './files/pages/public/PublicSanctions';
import SubmissionPortal from './files/pages/public/SubmissionPortal';

// Admin/Protected Pages
import LoginPage from './files/pages/LoginPage';
import ScannerPage from './files/pages/ScannerPage';
import DashboardPage from './files/pages/Dashboard';

import './App.css';

const App = () => {
  const [user, setUser] = useState<any>(null);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [dbStudents, setDbStudents] = useState<any[]>([]);
  const navigate = useNavigate();

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

    const attendanceChannel = supabase
      .channel('attendance_live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'attendance_logs' }, 
      (payload) => {
        setAttendance((prev) => [payload.new, ...prev]);
      })
      .subscribe();

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

  // --- LOGIC ---
  const handleRecordAttendance = async (studentIdInput: string, type: string) => {
    const numericId = parseInt(studentIdInput, 10);
    if (isNaN(numericId)) return { success: false, msg: "Invalid ID format." };

    const student = dbStudents.find(s => (s.student_id || s.studentId) === numericId);
    if (!student) return { success: false, msg: `ID ${numericId} not found.` };

    const today = new Date().toDateString();
    const duplicate = attendance.find(r =>
      (r.student_id || r.studentId) === numericId &&
      r.type === type &&
      new Date(r.timestamp).toDateString() === today
    );

    if (duplicate) return { success: false, msg: "Already recorded today.", student };

    const newRecord = {
      student_id: student.student_id || student.studentId,
      first_name: student.first_name || student.firstName,
      last_name: student.last_name || student.lastName,
      program: student.program,
      year_level: student.year_level || student.yearLevel,
      type,
      timestamp: new Date().toISOString()
    };

    const { error } = await supabase.from('attendance_logs').insert([newRecord]);
    if (error) return { success: false, msg: "Database error." };

    return { success: true, msg: "Recorded successfully!", student };
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
          {/* --- PUBLIC ROUTES --- */}
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

          {/* --- PROTECTED ADMIN ROUTES --- */}
          <Route 
            path="/scanner" 
            element={user ? <ScannerPage students={dbStudents} onRecordAttendance={handleRecordAttendance} /> : <Navigate to="/login" />} 
          />
          
          <Route 
            path="/dashboard" 
            element={user ? <DashboardPage attendance={attendance} setAttendance={setAttendance} dbStudents={dbStudents} /> : <Navigate to="/login" />} 
          />

          {/* Fallback for 404s */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;