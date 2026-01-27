import { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, Edit3, Trash2, Search, Filter, 
  RotateCcw, ArrowUpDown, Users, Download, X
} from 'lucide-react';
import EditStudentInfo from '../components/EditStudentInfo';
import '../styles/pages/studentrecords.css';

export interface Student {
  studentId: number;
  firstName: string;
  lastName: string;
  yearLevel: string;
  program: string;
}

interface Props {
  initialStudents: Student[];
  programFilter: string;
}

type SortOption = 'lastName' | 'studentId' | 'yearLevel';

const StudentRecords = ({ initialStudents, programFilter }: Props) => {
  // --- State ---
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('lastName');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // --- Effects ---
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  useEffect(() => {
    setSearchQuery('');
    setYearFilter('ALL');
    setSelectedIds([]);
  }, [programFilter]);

  useEffect(() => {
    setSelectedIds([]);
  }, [searchQuery, yearFilter]);

  // --- Optimization: Memoized Filtering & Sorting ---
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
        const fullSearch = `${s.firstName} ${s.lastName} ${s.studentId}`.toLowerCase();
        const matchSearch = fullSearch.includes(searchQuery.toLowerCase().trim());
        return matchProgram && matchYear && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'studentId') return a.studentId - b.studentId;
        if (sortBy === 'yearLevel') return (yearWeight[a.yearLevel] || 0) - (yearWeight[b.yearLevel] || 0);
        return a.lastName.localeCompare(b.lastName);
      });
  }, [students, programFilter, yearFilter, searchQuery, sortBy]);

  // --- Selection Handlers ---
  const toggleSelectAll = () => {
    if (selectedIds.length === displayStudents.length && displayStudents.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayStudents.map(s => s.studentId));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // --- Action Handlers ---
  const handleExportCSV = () => {
    if (displayStudents.length === 0) return alert("No data to export");
    
    // Helper to escape commas and quotes for CSV
    const safeCSV = (str: string | number) => `"${String(str).replace(/"/g, '""')}"`;

    const headers = ["Student ID", "Last Name", "First Name", "Year Level", "Program"];
    const rows = displayStudents.map(s => [
      s.studentId,
      safeCSV(s.lastName),
      safeCSV(s.firstName),
      safeCSV(s.yearLevel),
      safeCSV(s.program)
    ]);
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Masterlist_${programFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected records?`)) {
      setStudents(prev => prev.filter(s => !selectedIds.includes(s.studentId)));
      setSelectedIds([]);
    }
  };

  const handleSave = (studentData: Student) => {
    const isExisting = students.some(s => s.studentId === studentData.studentId);
    
    // If we are editing, we skip the ID check for the student being edited
    if (selectedStudent) {
        setStudents(prev => prev.map(s => s.studentId === selectedStudent.studentId ? studentData : s));
    } else {
        // Creating new
        if (isExisting) return alert("A student with this ID already exists!");
        setStudents(prev => [...prev, studentData]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setStudents(prev => prev.filter(s => s.studentId !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  return (
    <div className="table-card">
      {/* Header Section */}
      <div className="card-header">
        <div className="header-top-row">
          <div className="title-group">
            <h3 className="section-title">Masterlist</h3>
            <span className="count-badge">
              <Users size={14} /> {displayStudents.length}
            </span>
            
            {selectedIds.length > 0 && (
              <button className="btn-bulk-delete" onClick={handleBulkDelete}>
                <Trash2 size={16} /> Delete ({selectedIds.length})
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

        {/* Filter Toolbar */}
        <div className="header-controls">
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
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
              <option value="studentId">Sort: ID</option>
              <option value="yearLevel">Sort: Year</option>
            </select>
          </div>

          {(searchQuery || yearFilter !== 'ALL' || sortBy !== 'lastName') && (
            <button className="btn-reset" onClick={() => { setSearchQuery(''); setYearFilter('ALL'); setSortBy('lastName'); }}>
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
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
                      onChange={() => toggleSelectOne(s.studentId)}
                    />
                  </td>
                  <td className="font-mono">{s.studentId}</td>
                  <td className="font-bold">{s.lastName}</td>
                  <td>{s.firstName}</td>
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
                <td colSpan={7} className="empty-state">
                  <div className="empty-content">
                    <Search size={40} className="empty-icon"/>
                    <p>No records found matching your criteria.</p>
                    <button className="btn-link" onClick={() => {setSearchQuery(''); setYearFilter('ALL')}}>Clear filters</button>
                  </div>
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