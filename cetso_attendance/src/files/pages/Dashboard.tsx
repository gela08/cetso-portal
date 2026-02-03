import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Users, ClipboardList, Menu,
  TrendingUp, Clock, Activity, MessageSquare, QrCode, Zap 
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend 
} from 'recharts';

// Sub-components
import StudentRecords from './StudentRecords';
import SanctionList from './SanctionList';
import RequestManager from './RequestManager'; 
import ProgramView from '../components/ProgramView';
import ScannerPage from './ScannerPage'; 

import '../styles/pages/dashboard.css';

interface DashboardProps {
  attendance: any[];
  dbStudents: any[];
  onRecordAttendance: (studentId: string, type: string) => Promise<{ 
    success: boolean, 
    msg: string, 
    student?: any 
  }>;
}

const COLORS = ['#ff6600', '#0f172a', '#64748b', '#94a3b8'];

const DashboardHome = ({ students, logs, onLaunchScanner }: { students: any[], logs: any[], onLaunchScanner: () => void }) => {
  const programStats = useMemo(() => {
    const counts: Record<string, number> = { BLIS: 0, BSCpE: 0, BSECE: 0, BSIT: 0 };
    students.forEach(s => { if (counts[s.program] !== undefined) counts[s.program]++; });
    return Object.keys(counts).map((key) => ({ name: key, value: counts[key] }));
  }, [students]);

  const recentLogs = useMemo(() => [...logs].reverse().slice(0, 5), [logs]);
  const currentIn = logs.filter(l => l.status === 'in').length; 

  return (
    <div className="db-home-content">
      {/* Stats Grid */}
      <div className="db-stats-grid">
        <div className="db-stat-card db-featured">
          <div className="db-stat-icon"><Users size={24} /></div>
          <div className="db-stat-info">
            <p>Students</p>
            <h3>{students.length}</h3>
          </div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-icon"><Activity size={24} /></div>
          <div className="db-stat-info">
            <p>Total Logs</p>
            <h3>{logs.length}</h3>
          </div>
        </div>
        <div className="db-stat-card">
          <div className="db-stat-icon db-active-pulse"><TrendingUp size={24} /></div>
          <div className="db-stat-info">
            <p>Active Now</p>
            <h3>{currentIn}</h3>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="db-hero-banner" onClick={onLaunchScanner}>
        <div className="db-hero-text">
          <h2>Attendance Scanner</h2>
          <p>Instantly log student attendance via QR code</p>
          <button className="db-hero-btn">Launch Scanner <Zap size={16} /></button>
        </div>
        <div className="db-hero-icon"><QrCode size={80} /></div>
      </div>

      <div className="db-data-sections">
        {/* Chart */}
        <div className="db-card-panel">
          <div className="db-panel-header"><h3>Program Distribution</h3></div>
          <div className="db-chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={programStats} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {programStats.map((index:any) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="db-card-panel">
          <div className="db-panel-header"><h3>Recent Activity</h3></div>
          <div className="db-activity-feed">
            {recentLogs.length === 0 ? (
              <div className="db-empty">No recent logs</div>
            ) : (
              recentLogs.map((log, idx) => (
                <div key={idx} className="db-activity-row">
                  <div className={`db-badge ${log.status === 'in' ? 'db-in' : 'db-out'}`}>{log.status}</div>
                  <div className="db-activity-meta">
                    <span className="db-sid">{log.studentId}</span>
                    <span className="db-ts"><Clock size={12}/> {log.timestamp || "Just now"}</span>
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

const DashboardPage: React.FC<DashboardProps> = ({ attendance, dbStudents, onRecordAttendance }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [programFilter, setProgramFilter] = useState('ALL');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const programs = ['BLIS', 'BSCpE', 'BSECE', 'BSIT'];

  const handleNavClick = (tab: string, filter: string = 'ALL') => {
    setActiveTab(tab);
    setProgramFilter(filter);
    setIsSidebarOpen(false);
  };

  return (
    <div className={`db-app-container ${isSidebarOpen ? 'db-sidebar-active' : ''}`}>
      <div className="db-sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      
      <aside className="db-sidebar">
        <div className="db-logo-area">
          <div className="db-logo">C</div>
          <div className="db-logo-text">
            <h4>CET Portal</h4>
            <span>Engineering Council</span>
          </div>
        </div>

        <nav className="db-nav">
          <div className="db-nav-label">Main Menu</div>
          <button className={`db-nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleNavClick('dashboard')}>
            <LayoutDashboard size={20} /> <span>Dashboard</span>
          </button>
          <button className={`db-nav-btn ${activeTab === 'scanner' ? 'active' : ''}`} onClick={() => handleNavClick('scanner')}>
            <QrCode size={20} /> <span>Live Scanner</span>
          </button>
          <button className={`db-nav-btn ${activeTab === 'records' ? 'active' : ''}`} onClick={() => handleNavClick('records')}>
            <Users size={20} /> <span>Students</span>
          </button>
          <button className={`db-nav-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => handleNavClick('requests')}>
            <MessageSquare size={20} /> <span>Requests</span>
          </button>

          <div className="db-nav-label">Departments</div>
          {programs.map(prog => (
            <button key={prog} className={`db-nav-btn ${programFilter === prog ? 'active' : ''}`} onClick={() => handleNavClick('logs', prog)}>
              <ClipboardList size={20} /> <span>{prog}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="db-main-view">
        <header className="db-header">
          <button className="db-hamburger" onClick={() => setIsSidebarOpen(true)}><Menu size={24} /></button>
          <div className="db-header-title">
            <h2>{activeTab.replace(/^\w/, c => c.toUpperCase())}</h2>
          </div>
          <div className="db-user-pill">Admin</div>
        </header>

        <section className="db-scroll-area">
          {activeTab === 'scanner' && <ScannerPage onRecordAttendance={onRecordAttendance} />}
          {activeTab === 'records' && <StudentRecords initialStudents={dbStudents} programFilter={programFilter} />}
          {activeTab === 'sanctions' && <SanctionList students={dbStudents} attendance={attendance} />}
          {activeTab === 'requests' && <RequestManager />}
          {activeTab === 'logs' && <ProgramView program={programFilter} students={dbStudents} attendance={attendance} />}
          {activeTab === 'dashboard' && <DashboardHome students={dbStudents} logs={attendance} onLaunchScanner={() => setActiveTab('scanner')} />}
        </section>

        <nav className="db-bottom-nav">
          <button onClick={() => handleNavClick('dashboard')} className={activeTab === 'dashboard' ? 'active' : ''}><LayoutDashboard size={22} /></button>
          <button onClick={() => handleNavClick('scanner')} className={activeTab === 'scanner' ? 'active' : ''}><QrCode size={22} /></button>
          <button onClick={() => handleNavClick('records')} className={activeTab === 'records' ? 'active' : ''}><Users size={22} /></button>
          <button onClick={() => handleNavClick('requests')} className={activeTab === 'requests' ? 'active' : ''}><MessageSquare size={22} /></button>
        </nav>
      </main>
    </div>
  );
};

export default DashboardPage;