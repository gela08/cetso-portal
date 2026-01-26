import React, { useState } from 'react';
import { LayoutDashboard, Users, Scale, ClipboardList, Menu, X, ChevronRight } from 'lucide-react';
import StudentRecords from './StudentRecords';
import SanctionList from './SanctionList';
import ProgramLogs from './ProgramLogs';
import { INITIAL_STUDENTS } from '../utils/Data';
import '../styles/pages/dashboard.css';

const DashboardPage: React.FC<{ attendance: any[], setAttendance: any }> = ({ attendance }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [programFilter, setProgramFilter] = useState('ALL');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('cetso_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const programs = ['BLIS', 'BSCpE', 'BSECE', 'BSIT'];

  const renderContent = () => {
    switch (activeTab) {
      case 'records': return <StudentRecords students={students} setStudents={setStudents} programFilter={programFilter} />;
      case 'sanctions': return <SanctionList students={students} attendance={attendance} />;
      case 'logs': return <ProgramLogs program={programFilter} attendance={attendance} />;
      default: return (
        <div className="stats-grid">
          <div className="stat-card highlight">
            <span className="stat-label">TOTAL POPULATION</span>
            <h2 className="stat-value">{students.length}</h2>
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
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-logo">C</div>
            <div className="brand-info">
              <span className="brand-name">CET Portal</span>
              <span className="brand-dept">Engineering Council</span>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsSidebarOpen(false)}><X size={20}/></button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <span className="section-label">GENERAL</span>
            <button className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} 
              onClick={() => {setActiveTab('dashboard'); setProgramFilter('ALL'); setIsSidebarOpen(false);}}>
              <LayoutDashboard size={18}/> Dashboard
            </button>
            <button className={`nav-link ${activeTab === 'records' ? 'active' : ''}`} 
              onClick={() => {setActiveTab('records'); setProgramFilter('ALL'); setIsSidebarOpen(false);}}>
              <Users size={18}/> Student Records
            </button>
            <button className={`nav-link ${activeTab === 'sanctions' ? 'active' : ''}`} 
              onClick={() => {setActiveTab('sanctions'); setIsSidebarOpen(false);}}>
              <Scale size={18}/> Sanction List
            </button>
          </div>

          <div className="nav-section">
            <span className="section-label">PROGRAM LOGS</span>
            {programs.map(prog => (
              <button key={prog} 
                className={`nav-link ${programFilter === prog && activeTab === 'logs' ? 'active' : ''}`} 
                onClick={() => { setActiveTab('logs'); setProgramFilter(prog); setIsSidebarOpen(false); }}>
                <ClipboardList size={18}/> {prog}
                {programFilter === prog && activeTab === 'logs' && <ChevronRight size={14} className="active-icon" />}
              </button>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <header className="main-header">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
          <div className="header-title">
            <h1>{activeTab === 'logs' ? `${programFilter} Activity Logs` : activeTab.toUpperCase()}</h1>
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