import { Calendar } from 'lucide-react';
import '../styles/pages/programlogs.css';

const ProgramLogs = ({ program, attendance }: any) => {
  // Filter logs by the selected program
  const logs = attendance.filter((l: any) => l.program === program);

  return (
    <div className="table-card">
      <table className="modern-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>ID Number</th>
            <th>Name</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {logs.length > 0 ? (
            logs.map((log: any) => (
              <tr key={log.id}>
                <td>
                  <div className="date-pill">
                    <Calendar size={12}/> 
                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td className="font-mono">{log.student_id}</td>
                <td>{log.first_name} {log.last_name}</td>
                <td>
                  <span className={`badge ${log.type.includes('IN') ? 'in' : 'out'}`}>
                    {log.type}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>
                No attendance logs found for {program}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProgramLogs;