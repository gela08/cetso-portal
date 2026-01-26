import { useState, useEffect } from 'react';
import { UserPlus, Edit3, Trash2 } from 'lucide-react';
import EditStudentInfo from '../components/EditStudentInfo';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  yearLevel: number;
  program: string;
}

interface Props {
  initialStudents: Student[];
  programFilter: string;
}

const StudentRecords = ({ initialStudents, programFilter }: Props) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Sync when initialStudents changes
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  const filtered =
    programFilter === 'ALL'
      ? students
      : students.filter(
          (s) => s.program === programFilter.toUpperCase()
        );

  // Handlers
  const handleAddClick = () => {
    setSelectedStudent(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      setStudents(students.filter((s) => s.id !== id));
    }
  };

  const handleSave = (studentData: Student) => {
    if (studentData.id) {
      // Update
      setStudents(
        students.map((s) =>
          s.id === studentData.id ? studentData : s
        )
      );
    } else {
      // Add
      setStudents([
        ...students,
        {
          ...studentData,
          id: Date.now().toString()
        }
      ]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="table-card">
      <div className="card-header flex-between">
        <h3>Masterlist</h3>
        <button className="btn-create" onClick={handleAddClick}>
          <UserPlus size={16} /> Add Student
        </button>
      </div>

      <table className="modern-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Last Name</th>
            <th>First Name</th>
            <th>Year</th>
            <th>Program</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((s) => (
            <tr key={s.id}>
              <td className="font-mono">{s.id}</td>
              <td>{s.lastName}</td>
              <td>{s.firstName}</td>
              <td>{s.yearLevel}</td>
              <td>
                <span className="program-tag">{s.program}</span>
              </td>
              <td>
                <button
                  className="btn-icon edit"
                  onClick={() => handleEditClick(s)}
                >
                  <Edit3 size={16} />
                </button>
                <button
                  className="btn-icon delete"
                  onClick={() => handleDelete(s.id)}
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <EditStudentInfo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        student={selectedStudent}
      />
    </div>
  );
};

export default StudentRecords;
