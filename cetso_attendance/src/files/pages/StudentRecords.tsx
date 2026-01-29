import { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, Edit3, Trash2, Search, Filter, ArrowUpDown, Users, Download, X
} from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import EditStudentInfo from '../components/EditStudentInfo';
import '../styles/pages/studentrecords.css';

export interface Student {
  studentId: number;
  firstName: string;
  lastName: string;
  email: string;
  yearLevel: string;
  program: string;
}

interface Props {
  initialStudents: Student[];
  programFilter: string;
}

type SortOption = 'lastName' | 'studentId' | 'yearLevel';

const StudentRecords = ({ initialStudents, programFilter }: Props) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('lastName');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Sync state with incoming props from parent
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  // Filtering and Sorting Logic
  const displayStudents = useMemo(() => {
    const yearWeight: Record<string, number> = {
      '1st Year': 1, '2nd Year': 2, '3rd Year': 3, '4th Year': 4
    };

    return students
      .filter((s) => {
        const currentProgram = s.program?.trim().toUpperCase() || '';
        const targetFilter = programFilter?.trim().toUpperCase() || 'ALL';
        const matchProgram = targetFilter === 'ALL' || currentProgram === targetFilter;
        const matchYear = yearFilter === 'ALL' || s.yearLevel === yearFilter;
        
        const fullSearch = `${s.firstName} ${s.lastName} ${s.studentId} ${s.email}`.toLowerCase();
        const matchSearch = fullSearch.includes(searchQuery.toLowerCase().trim());
        
        return matchProgram && matchYear && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'studentId') return a.studentId - b.studentId;
        if (sortBy === 'yearLevel') return (yearWeight[a.yearLevel] || 0) - (yearWeight[b.yearLevel] || 0);
        return a.lastName.localeCompare(b.lastName);
      });
  }, [students, programFilter, yearFilter, searchQuery, sortBy]);

  // --- SUPABASE ACTIONS ---

  const handleSave = async (studentData: any) => {
    // Mapping frontend names to Supabase snake_case columns
    const dbPayload = {
      student_id: studentData.studentId || studentData.student_id,
      first_name: studentData.firstName || studentData.first_name,
      last_name: studentData.lastName || studentData.last_name,
      email: studentData.email,
      year_level: studentData.yearLevel || studentData.year_level,
      program: studentData.program
    };

    if (selectedStudent) {
      // UPDATE existing record
      const { error } = await supabase
        .from('students')
        .update(dbPayload)
        .eq('student_id', selectedStudent.studentId);
      
      if (error) return alert("Update failed: " + error.message);
    } else {
      // CREATE new record
      const { error } = await supabase
        .from('students')
        .insert([dbPayload]);
      
      if (error) return alert("Failed to add student: " + error.message);
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('student_id', id);

      if (error) alert("Delete failed: " + error.message);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Permanently delete ${selectedIds.length} records?`)) {
      const { error } = await supabase
        .from('students')
        .delete()
        .in('student_id', selectedIds);

      if (error) alert("Bulk delete failed: " + error.message);
      else setSelectedIds([]);
    }
  };

  // --- UI HELPERS ---
  const toggleSelectAll = () => {
    if (selectedIds.length === displayStudents.length && displayStudents.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayStudents.map(s => s.studentId));
    }
  };

  const handleExportCSV = () => {
    if (displayStudents.length === 0) return alert("No data to export");
    const headers = ["Student ID", "Last Name", "First Name", "Email", "Year Level", "Program"];
    const rows = displayStudents.map(s => [s.studentId, s.lastName, s.firstName, s.email, s.yearLevel, s.program]);
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
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery('')} title="Clear search">
                <X size={14} />
              </button>
            )}
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
              <option value="lastName">Sort: Name (A-Z)</option>
              <option value="studentId">Sort: ID Number</option>
              <option value="yearLevel">Sort: Year Level</option>
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
                <tr key={s.studentId} className={selectedIds.includes(s.studentId) ? 'row-selected' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(s.studentId)}
                      onChange={() => {
                        setSelectedIds(prev => 
                          prev.includes(s.studentId) ? prev.filter(id => id !== s.studentId) : [...prev, s.studentId]
                        );
                      }}
                    />
                  </td>
                  <td className="font-mono">{s.studentId}</td>
                  <td className="font-bold">{s.lastName}</td>
                  <td>{s.firstName}</td>
                  <td className="email-cell">{s.email || '—'}</td>
                  <td>{s.yearLevel}</td>
                  <td><span className="program-tag">{s.program}</span></td>
                  <td>
                    <div className="action-buttons-row">
                      <button className="btn-icon edit" title="Edit" onClick={() => { setSelectedStudent(s); setIsModalOpen(true); }}>
                        <Edit3 size={16} />
                      </button>
                      <button className="btn-icon delete" title="Delete" onClick={() => handleDelete(s.studentId)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="empty-state-cell">
                  No students found matching your filters.
                </td>
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