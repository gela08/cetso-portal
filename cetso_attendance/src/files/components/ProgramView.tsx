import React from 'react';
import { Download, ClipboardList } from 'lucide-react';
import { exportToExcel } from '../utils/SanctionExport';

interface ProgramViewProps {
  program: string;
  students: any[];
  attendance: any[];
}

const ProgramView: React.FC<ProgramViewProps> = ({ program, students, attendance }) => {
  // Filter data for this specific program
  const programStudents = students.filter(s => s.program === program);
  const programLogs = attendance.filter(log => log.program === program);

  // Grouping students by year level for the Sanction Tables
  const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  return (
    <div className="program-container">
      <div className="section-header">
        <div>
          <h2 className="text-xl font-bold">{program} Department Portal</h2>
          <p className="text-sm text-gray-500">Managing sanctions and activity logs</p>
        </div>
        <button 
          className="export-btn" 
          onClick={() => exportToExcel(programStudents, `${program}_Sanctions`)}
        >
          <Download size={16} /> Export {program} Data
        </button>
      </div>

      {/* --- SANCTION TABLES BY YEAR LEVEL --- */}
      <div className="year-tables-grid">
        {yearLevels.map(year => {
          const studentsInYear = programStudents.filter(s => s.yearLevel === year);
          return (
            <div key={year} className="year-section">
              <h3 className="year-title">{year} Sanction List</h3>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Status</th>
                      <th>Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsInYear.length > 0 ? (
                      studentsInYear.map(s => (
                        <tr key={s.id}>
                          <td>{s.name}</td>
                          <td><span className="badge">{s.status}</span></td>
                          <td>{s.sanctionHours}h</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={3}>No records found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      <hr className="my-8" />

      {/* --- RECENT ACTIVITY LOGS --- */}
      <div className="section-header">
        <h2 className="flex items-center gap-2">
          <ClipboardList size={20} /> {program} Recent Activity
        </h2>
      </div>

      <div className="logs-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Student ID</th>
              <th>Name</th>
              <th>Activity</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {programLogs.length > 0 ? (
              programLogs.slice(0, 20).map((log, index) => (
                <tr key={index}>
                  <td className="text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.studentId}</td>
                  <td>{log.name}</td>
                  <td>{log.activityName}</td>
                  <td>
                    <span className={`status-pill ${log.type.toLowerCase()}`}>
                      {log.type}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-4">No recent activity logs</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProgramView;