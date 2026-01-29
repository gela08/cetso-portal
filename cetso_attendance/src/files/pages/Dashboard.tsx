import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Scale, 
  ClipboardList, 
  Menu, 
  X, 
  ChevronRight, 
  TrendingUp, 
  Clock,
  Activity,
  MessageSquare
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';

import StudentRecords from './StudentRecords';
import SanctionList from './SanctionList';
import RequestManager from './RequestManager'; // Ensure this component exists
import ProgramView from '../components/ProgramView';
import '../styles/pages/dashboard.css';

interface DashboardProps {
  attendance: any[];
  setAttendance: any;
  dbStudents: any[];
}

const COLORS = ['#ff6600', '#1a1a1a', '#475569', '#94a3b8'];

// --- Sub-Component: The Dashboard Home View ---
const DashboardHome = ({ students, logs }: { students: any[], logs: any[] }) => {
  const programStats = useMemo(() => {
    const counts: Record<string, number> = { BLIS: 0, BSCpE: 0, BSECE: 0, BSIT: 0 };
    students.forEach(s => {
      if (counts[s.program] !== undefined) counts[s.program]++;
    });
    return Object.keys(counts).map((key, index) => ({ name: key, value: counts[key], index }));
  }, [students]);

  const recentLogs = useMemo(() => {
    return [...logs].reverse().slice(0, 5);
  }, [logs]);

  const currentIn = logs.filter(l => l.status === 'in').length; 

  return (
    <div className="dashboard-home-grid">
      <div className="stats-row">
        <div className="stat-card highlight">
          <div className="stat-icon-bg"><Users size={24} color="#ff6600"/></div>
          <div>
            <span className="stat-label">TOTAL STUDENTS</span>
            <h2 className="stat-value">{students.length}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-bg"><Activity size={24} color="#1a1a1a"/></div>
          <div>
            <span className="stat-label">TOTAL LOGS</span>
            <h2 className="stat-value">{logs.length}</h2>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-bg"><TrendingUp size={24} color="#166534"/></div>
          <div>
            <span className="stat-label">CURRENTLY ACTIVE</span>
            <h2 className="stat-value">{currentIn} <span style={{fontSize:'0.8rem', color:'#999'}}>approx</span></h2>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Population Distribution</h3>
          <div style={{ width: '100%', height: 250 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={programStats}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80}
                  paddingAngle={5} dataKey="value"
                >
                  {programStats.map((index : any) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <h3>Recent Activity</h3>
          <div className="recent-activity-list">
            {recentLogs.length === 0 ? (
              <p className="no-data">No logs recorded yet.</p>
            ) : (
              recentLogs.map((log, idx) => (
                <div key={idx} className="activity-item">
                  <div className={`status-indicator ${log.status === 'in' ? 'bg-green' : 'bg-red'}`}>
                    {log.status === 'in' ? 'IN' : 'OUT'}
                  </div>
                  <div className="activity-details">
                    <span className="activity-id">{log.studentId || "Unknown ID"}</span>
                    <span className="activity-time">
                      <Clock size={12} style={{marginRight: 4}}/>
                      {log.timestamp || "Just now"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Page Component ---
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
      case 'requests':
        return <RequestManager />;
      case 'logs': 
        return <ProgramView program={programFilter} students={dbStudents} attendance={attendance} />;
      default:
        return <DashboardHome students={dbStudents} logs={attendance} />;
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
              className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`} 
              onClick={() => {setActiveTab('requests'); setProgramFilter('ALL'); setIsSidebarOpen(false);}}
            >
              <MessageSquare size={18}/> Requests
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
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="main-header">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="header-title">
            <h1>
              {activeTab === 'logs' ? `${programFilter} Dept` : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
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