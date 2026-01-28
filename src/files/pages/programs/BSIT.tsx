import { Download, ClipboardList } from 'lucide-react';
import { exportToExcel } from '../../utils/SanctionExport';

interface BSITProps {
  sanctionData: any[];
  attendance: any[]; // Add attendance to props
}

const BSITSanctionTable = ({ sanctionData, attendance }: BSITProps) => {
  // 1. Filter Sanctions for BSIT
  const bsitSanctions = sanctionData.filter(s => s.program === 'BSIT');
  
  // 2. Filter Activity Logs for BSIT
  // Note: Adjust 'log.program' to 'log.studentProgram' depending on your data structure
  const bsitLogs = attendance.filter(log => log.program === 'BSIT');

  return (
    <div className="program-container">
      {/* SANCTION SECTION */}
      <div className="section-header">
        <h2>BSIT Sanction List</h2>
        <button 
          className="export-btn" 
          onClick={() => exportToExcel(bsitSanctions, 'BSIT')}
        >
          <Download size={16} /> Export BSIT to Excel
        </button>
      </div>

      <div className="tables-wrapper">
         {/* Render your Year-Level Sanction Tables here */}
         {/* (1st Year Table, 2nd Year Table, etc.) */}
      </div>

      <hr className="section-divider" />

      {/* ACTIVITY LOGS SECTION */}
      <div className="section-header">
        <h2><ClipboardList size={20} /> BSIT Recent Activity Logs</h2>
      </div>

      <div className="logs-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Event/Activity</th>
              <th>Timestamp</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bsitLogs.length > 0 ? (
              bsitLogs.map((log, index) => (
                <tr key={index}>
                  <td>{log.studentId}</td>
                  <td>{log.name}</td>
                  <td>{log.activityName}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${log.type.toLowerCase()}`}>
                      {log.type}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="empty-state">No logs found for BSIT</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BSITSanctionTable;