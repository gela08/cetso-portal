import { useEffect, useState, useMemo } from 'react';
import { Check, X, Eye, Loader2, Search, Download, Layers, Mail, Clock, Bell } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import emailjs from '@emailjs/browser';
import toast, { Toaster } from 'react-hot-toast';
import RequestModal from '../components/RequestModal';
import BulkRequestModal from '../components/BulkRequestModal';
import { exportRequestsToExcel } from '../utils/exportUtils';
import '../styles/pages/requestmanager.css';

const RequestManager = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // State for the Email Automation Modal
  const [emailModal, setEmailModal] = useState<{ isOpen: boolean; request: any | null }>({ isOpen: false, request: null });
  const [followUps, setFollowUps] = useState<any[]>([]);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    // 1. Initialize EmailJS with your Public Key
    emailjs.init("PLzpq_c2Q4GLVUjct");

    fetchRequests();

    const channel = supabase.channel('db_changes').on('postgres_changes',
      { event: '*', schema: 'public', table: 'student_requests' }, () => {
        fetchRequests();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('student_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRequests(data);
      // Filter for tasks that need attention (the 24h follow-ups)
      const activeTasks = data
        .filter((r: any) => r.follow_up_due && !r.follow_up_completed)
        .map((r: any) => ({
          id: r.id,
          name: r.full_name,
          due: new Date(r.follow_up_due)
        }));
      setFollowUps(activeTasks);
    }
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return requests.filter(r =>
      r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.student_id.toString().includes(searchTerm)
    );
  }, [requests, searchTerm]);

  // FIXED: Standardized Promise handling for Toast and Async flow
  const handleStatusUpdate = async (ids: string[], status: 'Approved' | 'Rejected') => {
    const performUpdate = async () => {
      const { data, error } = await supabase
        .from('student_requests')
        .update({ status })
        .in('id', ids)
        .select();
      
      if (error) throw error;
      return data;
    };

    toast.promise(performUpdate(), {
      loading: `Updating status to ${status}...`,
      success: `Successfully ${status}!`,
      error: 'Failed to update database.'
    });

    try {
      await performUpdate();
      // Only show email options if a single student is approved
      if (ids.length === 1 && status === 'Approved') {
        const req = requests.find(r => r.id === ids[0]);
        setEmailModal({ isOpen: true, request: req });
      }
      setSelectedIds([]);
      fetchRequests();
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  const handleSendEmail = async (type: 'sanction' | 'inquiry') => {
    if (!emailModal.request) return;

    setSendingEmail(true);
    const req = emailModal.request;
    const toastId = toast.loading(`Sending notification to ${req.full_name}...`);

    // Prepare the update data including the new timestamp
    let updateData: any = {
      last_notified_at: new Date().toISOString() // Track the send time
    };
    
    if (type === 'sanction') {
      updateData.status = 'Approved';
      updateData.follow_up_completed = true;
    } else {
      const dueTime = new Date();
      dueTime.setHours(dueTime.getHours() + 24);
      updateData.status = 'Pending';
      updateData.follow_up_due = dueTime.toISOString();
      updateData.follow_up_completed = false;
    }

    const templateParams = {
      to_name: req.full_name,
      email: req.email, 
      type: type === 'sanction' ? "Sanction Approval" : "Inquiry Under Review",
      message: type === 'sanction'
        ? `Your request has been approved. SANCTION DETAILS: ${req.sanction_details }`
        : `Your inquiry has been received and is under review. Please expect an update within 24 hours. If no update is received, you may follow up in person at the office.`,
      subject: type === 'sanction' ? "Action Required: Sanction Details" : "Update: Your Request is Under Review"
    };

    try {
      await emailjs.send('service_b0favq5', 'template_x96e71i', templateParams);

      const { error: dbError } = await supabase
        .from('student_requests')
        .update(updateData)
        .eq('id', req.id);

      if (dbError) throw new Error("Database Sync Failed");

      toast.success(`Notification sent!`, { id: toastId });
      setEmailModal({ isOpen: false, request: null });
      fetchRequests();
    } catch (err : any) {
      console.error("Notification Error:", err);
      toast.error(`Failed: ${err.message || 'Check connection'}`, { id: toastId });
    } finally {
      setSendingEmail(false);
    }
  };

  const confirmFollowUp = async (id: string) => {
    const { error } = await supabase
      .from('student_requests')
      .update({ follow_up_completed: true })
      .eq('id', id);
    if (!error) {
      toast.success("Follow-up cleared.");
      fetchRequests();
    }
  };

  const handleDelete = async (ids: string[]) => {
    if (window.confirm(`Delete ${ids.length} records?`)) {
      const { error } = await supabase.from('student_requests').delete().in('id', ids);
      if (!error) {
        toast.success("Records deleted.");
        setSelectedIds([]);
        fetchRequests();
      }
    }
  };

  // Helper Component for the 24h Countdown
  const Countdown = ({ targetDate }: { targetDate: Date }) => {
    const [timeLeft, setTimeLeft] = useState("");
    useEffect(() => {
      const updateTimer = () => {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;
        if (distance < 0) setTimeLeft("OVERDUE");
        else {
          const h = Math.floor(distance / (1000 * 60 * 60));
          const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const s = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${h}h ${m}m ${s}s`);
        }
      };
      updateTimer();
      const timer = setInterval(updateTimer, 1000);
      return () => clearInterval(timer);
    }, [targetDate]);
    return <span className={timeLeft === "OVERDUE" ? "overdue-badge" : "timer-badge"}>{timeLeft}</span>;
  };

  if (loading) return <div className="loader-container"><Loader2 className="spinner" /><p>Loading Dashboard...</p></div>;

  return (
    <div className="request-manager-container">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="main-content">
        <div className="header-section">
          <div className="header-title">
            <h1>Request Manager</h1>
            <p>{filtered.length} active records</p>
          </div>
          <div className="header-actions">
            <button className={`bulk-trigger-btn ${selectedIds.length > 0 ? 'visible' : ''}`} onClick={() => setIsBulkModalOpen(true)}>
              <Layers size={16} /> Manage ({selectedIds.length})
            </button>
            <button className="export-btn" onClick={() => exportRequestsToExcel(filtered)}>
              <Download size={16} /> Export
            </button>
            <div className="search-bar">
              <Search size={16} />
              <input placeholder="Search student..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="checkbox-col">
                  <input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? filtered.map(r => r.id) : [])} checked={selectedIds.length === filtered.length && filtered.length > 0} />
                </th>
                <th>Details</th>
                <th>Year</th>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => (
                <tr key={req.id} className={selectedIds.includes(req.id) ? 'row-selected' : ''}>
                  <td className="checkbox-col">
                    <input type="checkbox" checked={selectedIds.includes(req.id)} onChange={() => setSelectedIds(prev => prev.includes(req.id) ? prev.filter(i => i !== req.id) : [...prev, req.id])} />
                  </td>
                  <td className="view-cell">
                    <button className="btn-icon view" onClick={() => setSelectedRequest(req)}><Eye size={16} /></button>
                  </td>
                  <td><span className="year-badge">{req.year_level}</span></td>
                  <td className="id-text">{req.student_id}</td>
                  <td className="name-text">{req.full_name}</td>
                  <td><span className="type-tag">{req.type}</span></td>
                  <td><span className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</span></td>
                  <td className="actions-cell">
                    <div className="action-group-fixed">
                      <button onClick={() => handleStatusUpdate([req.id], 'Approved')} className="btn-icon approve"><Check size={16} /></button>
                      <button onClick={() => handleStatusUpdate([req.id], 'Rejected')} className="btn-icon reject"><X size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="follow-up-sidebar">
        <div className="sidebar-header">
          <h3><Bell size={18} /> Priority Tasks</h3>
          <span className="count-badge">{followUps.length}</span>
        </div>
        {followUps.length === 0 ? <p className="empty-msg">No pending inquiries.</p> : (
          <div className="task-list">
            {followUps.map(task => (
              <div key={task.id} className="follow-up-card">
                <span className="task-name">{task.name}</span>
                <div className="card-mid"><Clock size={12} /> <Countdown targetDate={task.due} /></div>
                <button className="confirm-btn" onClick={() => confirmFollowUp(task.id)}>Mark Resolved</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AUTOMATED EMAIL MODAL */}
      {emailModal.isOpen && (
        <div className="email-choice-overlay">
          <div className="email-choice-modal">
            <h2>Notify Student</h2>
            <p>Select the appropriate email response for <strong>{emailModal.request?.full_name}</strong></p>
            
            <div className="choice-buttons">
              <button className="btn-choice primary" onClick={() => handleSendEmail('sanction')} disabled={sendingEmail}>
                {sendingEmail ? <Loader2 className="spinner" /> : <Mail size={18} />}
                <div className="text">
                  <strong>Option 1: Sanctions</strong>
                  <span>Send approval & requirement details</span>
                </div>
              </button>

              <button className="btn-choice secondary" onClick={() => handleSendEmail('inquiry')} disabled={sendingEmail}>
                {sendingEmail ? <Loader2 className="spinner" /> : <Clock size={18} />}
                <div className="text">
                  <strong>Option 2: Inquiry Update</strong>
                  <span>Notify 24h review & start timer</span>
                </div>
              </button>
            </div>
            
            <button className="close-btn" onClick={() => setEmailModal({ isOpen: false, request: null })}>Close without sending</button>
          </div>
        </div>
      )}

      {selectedRequest && <RequestModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />}
      {isBulkModalOpen && (
        <BulkRequestModal
          selectedCount={selectedIds.length}
          selectedNames={requests.filter(r => selectedIds.includes(r.id)).map(r => r.full_name)}
          onAction={(action) => {
            if (action === 'Delete') handleDelete(selectedIds);
            else handleStatusUpdate(selectedIds, action as 'Approved' | 'Rejected');
            setIsBulkModalOpen(false);
          }}
          onClose={() => setIsBulkModalOpen(false)}
        />
      )}
    </div>
  );
};

export default RequestManager;