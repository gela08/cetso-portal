import { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, Edit3, Trash2, Search, Filter, ArrowUpDown, Users, Download,
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import EditStudentInfo from '../components/EditStudentInfo';
import '../styles/pages/studentrecords.css';

// 1. Interface matched exactly to Supabase Columns
export interface Student {
  student_id: number;   
  first_name: string;   
  last_name: string;    
  email: string;
  year_level: string;   
  program: string;
}

interface Props {
  initialStudents: Student[];
  programFilter: string;
}

// 2. Sort options matched to snake_case keys
type SortOption = 'last_name' | 'student_id' | 'year_level';

const StudentRecords = ({ initialStudents, programFilter }: Props) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('last_name');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  // 3. Logic updated to use snake_case properties
  const displayStudents = useMemo(() => {
    const yearWeight: Record<string, number> = {
      '1st Year': 1, '2nd Year': 2, '3rd Year': 3, '4th Year': 4
    };

    return students
      .filter((s) => {
        const currentProgram = s.program?.trim().toUpperCase() || '';
        const targetFilter = programFilter?.trim().toUpperCase() || 'ALL';
        const matchProgram = targetFilter === 'ALL' || currentProgram === targetFilter;
        const matchYear = yearFilter === 'ALL' || s.year_level === yearFilter;
        
        const fullSearch = `${s.first_name} ${s.last_name} ${s.student_id} ${s.email}`.toLowerCase();
        const matchSearch = fullSearch.includes(searchQuery.toLowerCase().trim());
        
        return matchProgram && matchYear && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'student_id') return a.student_id - b.student_id;
        if (sortBy === 'year_level') return (yearWeight[a.year_level] || 0) - (yearWeight[b.year_level] || 0);
        return a.last_name.localeCompare(b.last_name);
      });
  }, [students, programFilter, yearFilter, searchQuery, sortBy]);

  // --- SUPABASE ACTIONS (NOW WITH LOCAL STATE UPDATES) ---

  const handleSave = async (studentData: any) => {
    const dbPayload: Student = {
      student_id: Number(studentData.student_id),
      first_name: studentData.first_name,
      last_name: studentData.last_name,
      email: studentData.email || '',
      year_level: studentData.year_level,
      program: studentData.program
    };

    if (selectedStudent) {
      // UPDATE logic
      const { error } = await supabase
        .from('students')
        .update(dbPayload)
        .eq('student_id', selectedStudent.student_id); 
      
      if (error) return alert("Update failed: " + error.message);

      // Update local state instead of reloading
      setStudents(prev => 
        prev.map(s => s.student_id === dbPayload.student_id ? dbPayload : s)
      );
    } else {
      // INSERT logic
      const { data, error } = await supabase
        .from('students')
        .insert([dbPayload])
        .select(); // Select is needed to get the new record back
      
      if (error) return alert("Failed to add student: " + error.message);

      // Add new record to local state
      if (data && data[0]) {
        setStudents(prev => [...prev, data[0]]);
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('student_id', id);

      if (error) {
        alert("Delete failed: " + error.message);
      } else {
        // Remove from local state
        setStudents(prev => prev.filter(s => s.student_id !== id));
        setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Permanently delete ${selectedIds.length} records?`)) {
      const { error } = await supabase
        .from('students')
        .delete()
        .in('student_id', selectedIds);

      if (error) {
        alert("Bulk delete failed: " + error.message);
      } else {
        // Remove all selected IDs from local state
        setStudents(prev => prev.filter(s => !selectedIds.includes(s.student_id)));
        setSelectedIds([]);
      }
    }
  };

  // --- UI HELPERS ---
  const toggleSelectAll = () => {
    if (selectedIds.length === displayStudents.length && displayStudents.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayStudents.map(s => s.student_id));
    }
  };

  const handleExportCSV = () => {
    if (displayStudents.length === 0) return alert("No data to export");
    const headers = ["Student ID", "Last Name", "First Name", "Email", "Year Level", "Program"];
    const rows = displayStudents.map(s => [s.student_id, s.last_name, s.first_name, s.email, s.year_level, s.program]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `CETSO_Masterlist_${programFilter}_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  return (
    <div className="table-card">
      <div className="card-header">
        <div className="header-top-row">
          <div className="title-group">
            <h3 className="section-title">Masterlist</h3>
            <span className="count-badge">
              <Users size={14} /> {displayStudents.length} Students
            </span>
            {selectedIds.length > 0 && (
              <button className="btn-bulk-delete" onClick={handleBulkDelete}>
                <Trash2 size={16} /> Delete Selected ({selectedIds.length})
              </button>
            )}
          </div>
            
          <div className="action-buttons-group">
            <button className="btn-export" onClick={handleExportCSV}>
              <Download size={18} /> <span className="btn-text">Export CSV</span>
            </button>
            <button className="btn-create" onClick={() => { setSelectedStudent(null); setIsModalOpen(true); }}>
              <UserPlus size={18} /> <span className="btn-text">Add Student</span>
            </button>
          </div>
        </div>

        <div className="header-controls">
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by name, ID, or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <Filter size={16} className="filter-icon" />
            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="filter-select">
              <option value="ALL">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>

          <div className="filter-group">
            <ArrowUpDown size={16} className="filter-icon" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="filter-select">
              <option value="last_name">Sort: Name (A-Z)</option>
              <option value="student_id">Sort: ID Number</option>
              <option value="year_level">Sort: Year Level</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th className="th-checkbox">
                <input 
                  type="checkbox" 
                  checked={selectedIds.length === displayStudents.length && displayStudents.length > 0}
                  onChange={toggleSelectAll}
                />
              </th>
              <th>Student ID</th>
              <th>Last Name</th>
              <th>First Name</th>
              <th>Email</th>
              <th>Year Level</th>
              <th>Program</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayStudents.length > 0 ? (
              displayStudents.map((s) => (
                <tr key={s.student_id} className={selectedIds.includes(s.student_id) ? 'row-selected' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(s.student_id)}
                      onChange={() => {
                        setSelectedIds(prev => 
                          prev.includes(s.student_id) ? prev.filter(id => id !== s.student_id) : [...prev, s.student_id]
                        );
                      }}
                    />
                  </td>
                  <td className="font-mono">{s.student_id}</td>
                  <td className="font-bold">{s.last_name}</td>
                  <td>{s.first_name}</td>
                  <td className="email-cell">{s.email || '—'}</td>
                  <td>{s.year_level}</td>
                  <td><span className="program-tag">{s.program}</span></td>
                  <td>
                    <div className="action-buttons-row">
                      <button className="btn-icon edit" title="Edit" onClick={() => { setSelectedStudent(s); setIsModalOpen(true); }}>
                        <Edit3 size={16} />
                      </button>
                      <button className="btn-icon delete" title="Delete" onClick={() => handleDelete(s.student_id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="empty-state-cell">No students found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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