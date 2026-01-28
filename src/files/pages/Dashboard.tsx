import React, { useState } from 'react';
import { LayoutDashboard, Users, Scale, ClipboardList, Menu, X, ChevronRight, Database } from 'lucide-react';
import StudentRecords from './StudentRecords';
import SanctionList from './SanctionList';
import ProgramView from '../components/ProgramView';
import { DatabaseAdmin } from '../utils/DatabaseAdmin'; // Import the tool created earlier
import '../styles/pages/dashboard.css';

interface DashboardProps {
  attendance: any[];
  setAttendance: any;
  dbStudents: any[]; // New prop for live database students
}

const DashboardPage: React.FC<DashboardProps> = ({ attendance, dbStudents }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [programFilter, setProgramFilter] = useState('ALL');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const programs = ['BLIS', 'BSCpE', 'BSECE', 'BSIT'];

  const renderContent = () => {
    switch (activeTab) {
      case 'records': 
        return <StudentRecords initialStudents={dbStudents} programFilter={programFilter} />;
      
      case 'sanctions': 
        return <SanctionList students={dbStudents} attendance={attendance} />;
      
      case 'logs': 
        return <ProgramView 
                  program={programFilter} 
                  students={dbStudents} 
                  attendance={attendance} 
                />;
      
      case 'admin':
        return <DatabaseAdmin />;

      default:
        return (
          <div className="stats-grid">
            <div className="stat-card highlight">
              <span className="stat-label">TOTAL POPULATION</span>
              <h2 className="stat-value">{dbStudents.length}</h2>
            </div>
            <div className="stat-card">
              <span className="stat-label">TOTAL LOGS</span>
              <h2 className="stat-value">{attendance.length}</h2>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`dashboard-wrapper ${isSidebarOpen ? 'sidebar-mobile-open' : ''}`}>
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">C</div>
            <div className="brand-info">
              <span className="brand-name">CET Portal</span>
              <span className="brand-dept">Engineering Council</span>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsSidebarOpen(false)}>
            <X size={20}/>
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="section-label">GENERAL</span>
            <button 
              className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} 
              onClick={() => {setActiveTab('dashboard'); setProgramFilter('ALL'); setIsSidebarOpen(false);}}
            >
              <LayoutDashboard size={18}/> Dashboard
            </button>
            <button 
              className={`nav-link ${activeTab === 'records' ? 'active' : ''}`} 
              onClick={() => {setActiveTab('records'); setProgramFilter('ALL'); setIsSidebarOpen(false);}}
            >
              <Users size={18}/> Student Records
            </button>
            <button 
              className={`nav-link ${activeTab === 'sanctions' ? 'active' : ''}`} 
              onClick={() => {setActiveTab('sanctions'); setIsSidebarOpen(false);}}
            >
              <Scale size={18}/> Sanction List
            </button>
          </div>

          <div className="nav-section">
            <span className="section-label">PROGRAM DEPARTMENTS</span>
            {programs.map(prog => (
              <button 
                key={prog} 
                className={`nav-link ${programFilter === prog && activeTab === 'logs' ? 'active' : ''}`} 
                onClick={() => { setActiveTab('logs'); setProgramFilter(prog); setIsSidebarOpen(false); }}
              >
                <ClipboardList size={18}/> {prog}
                {programFilter === prog && activeTab === 'logs' && <ChevronRight size={14} className="active-icon" />}
              </button>
            ))}
          </div>

          {/* New Admin Section */}
          <div className="nav-section" style={{ marginTop: 'auto', borderTop: '1px solid #eee', paddingTop: '10px' }}>
            <button 
              className={`nav-link ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => { setActiveTab('admin'); setIsSidebarOpen(false); }}
            >
              <Database size={18}/> Database Admin
            </button>
          </div>
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="main-header">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="header-title">
            <h1>
              {activeTab === 'logs' ? `${programFilter} Department` : activeTab.toUpperCase()}
            </h1>
            <p>Welcome back, Admin</p>
          </div>
        </header>

        <section className="content-inner">
          {renderContent()}
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;