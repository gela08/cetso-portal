import { useState } from 'react';
import { UserPlus, Edit3, Trash2 } from 'lucide-react';


const StudentRecords = ({ students, programFilter }: any) => {
  const [, setIsModalOpen] = useState(false);
  const filtered = programFilter === 'ALL' ? students : students.filter((s:any) => s.program === programFilter);

  return (
    <div className="table-card">
      <div className="card-header flex-between">
        <h3>Masterlist</h3>
        <button className="btn-create" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={16} /> Add Student
        </button>
      </div>
      <table className="modern-table">
        <thead>
          <tr><th>ID</th><th>Name</th><th>Year</th><th>Program</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {filtered.map((s: any) => (
            <tr key={s.id}>
              <td className="font-mono">{s.id}</td>
              <td>{s.name}</td>
              <td>{s.yearLevel}</td>
              <td><span className="program-tag">{s.program}</span></td>
              <td>
                <button className="btn-icon edit"><Edit3 size={16}/></button>
                <button className="btn-icon delete"><Trash2 size={16}/></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentRecords;