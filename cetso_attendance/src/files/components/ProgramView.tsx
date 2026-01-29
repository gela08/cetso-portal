import React, { useMemo } from 'react';
import { Download, ClipboardList, UserCheck, AlertCircle } from 'lucide-react';
import { exportToExcel } from '../utils/SanctionExport'; // Ensure this path is correct
import '../styles/components/programview.css';

interface ProgramViewProps {
  program: string;
  students: any[];
  attendance: any[];
}

const ProgramView: React.FC<ProgramViewProps> = ({ program, students, attendance }) => {
  // 1. Filter Data for specific program
  const programStudents = useMemo(() => 
    students.filter(s => s.program === program), 
  [students, program]);

  const programLogs = useMemo(() => 
    attendance.filter(log => log.program === program).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), 
  [attendance, program]);

  // 2. Calculate Quick Stats
  const totalSanctioned = programStudents.filter(s => s.sanctionHours > 0).length;
  const totalCleared = programStudents.filter(s => s.sanctionHours === 0).length;

  const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  return (
    <div className="program-view-container">
      {/* --- HEADER SECTION --- */}
      <div className="program-header">
        <div className="header-left">
          <h2 className="program-title">{program} Department</h2>
          <div className="program-badges">
            <span className="p-badge orange"><AlertCircle size={12}/> {totalSanctioned} Sanctioned</span>
            <span className="p-badge green"><UserCheck size={12}/> {totalCleared} Cleared</span>
          </div>
        </div>
        <button 
          className="btn-export" 
          onClick={() => exportToExcel(programStudents, `${program}_Sanctions`)}
        >
          <Download size={16} /> Export Data
        </button>
      </div>

      {/* --- SANCTION TABLES GRID (Year Levels) --- */}
      <div className="year-grid">
        {yearLevels.map(year => {
          const studentsInYear = programStudents.filter(s => s.yearLevel === year);
          return (
            <div key={year} className="year-card">
              <div className="year-card-header">
                <h3>{year}</h3>
                <span className="count-bubble">{studentsInYear.length}</span>
              </div>
              
              <div className="table-wrapper">
                <table className="mini-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Hrs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsInYear.length > 0 ? (
                      studentsInYear.map(s => (
                        <tr key={s.id}>
                          <td className="font-medium">{s.name}</td>
                          <td>
                            <span className={`status-dot ${s.sanctionHours > 0 ? 'active' : 'cleared'}`}>
                              {s.sanctionHours > 0 ? 'Active' : 'Clear'}
                            </span>
                          </td>
                          <td className={s.sanctionHours > 0 ? 'text-red' : 'text-gray'}>
                            {s.sanctionHours}h
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={3} className="empty-row">No students found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      <div className="divider"></div>

      {/* --- RECENT ACTIVITY FEED --- */}
      <div className="logs-section">
        <div className="logs-header">
          <ClipboardList size={20} className="text-orange" />
          <h3>Recent Activity Logs</h3>
        </div>

        <div className="main-table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>ID</th>
                <th>Name</th>
                <th>Activity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {programLogs.length > 0 ? (
                programLogs.slice(0, 15).map((log, index) => (
                  <tr key={index}>
                    <td className="timestamp">
                      {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      <span className="date-small">{new Date(log.timestamp).toLocaleDateString()}</span>
                    </td>
                    <td className="mono-text">{log.studentId}</td>
                    <td className="font-bold">{log.name}</td>
                    <td>{log.activityName}</td>
                    <td>
                      <span className={`pill ${log.type === 'in' ? 'pill-in' : 'pill-out'}`}>
                        {log.type.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="empty-state">No recent activity for {program}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProgramView;