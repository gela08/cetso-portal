import { Calendar } from 'lucide-react';
import '../styles/pages/programlogs.css';

const ProgramLogs = ({ program, attendance }: any) => {
  const logs = attendance.filter((l: any) => l.program === program);

  return (
    <div className="table-card">
      <table className="modern-table">
        <thead>
          <tr><th>Date</th><th>ID Number</th><th>Name</th><th>Status</th></tr>
        </thead>
        <tbody>
          {logs.map((log: any) => (
            <tr key={log.id}>
              <td><div className="date-pill"><Calendar size={12}/> {log.date}</div></td>
              <td className="font-mono">{log.studentId}</td>
              <td>{log.name}</td>
              <td><span className={`badge ${log.type}`}>{log.type}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProgramLogs;