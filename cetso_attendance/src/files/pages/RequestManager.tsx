import { useEffect, useState } from 'react';
import { Check, X, Eye, Loader2, Search, Download } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
import RequestModal from '../components/RequestModal';
import { exportRequestsToExcel } from '../utils/exportUtils';
import '../styles/pages/requestmanager.css';

const RequestManager = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel('db_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'student_requests' }, (payload) => {
        if (payload.eventType === 'INSERT') setRequests(prev => [payload.new, ...prev]);
        if (payload.eventType === 'UPDATE') {
          setRequests(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
        }
      }).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('student_requests').select('*').order('created_at', { ascending: false });
    if (!error) setRequests(data);
    setLoading(false);
  };

  const handleStatusUpdate = async (ids: string[], status: 'Approved' | 'Rejected') => {
    const { error } = await supabase.from('student_requests').update({ status }).in('id', ids);
    if (!error) {
      setRequests(prev => prev.map(r => ids.includes(r.id) ? { ...r, status } : r));
      setSelectedIds([]);
    }
  };

  const filtered = requests.filter(r => 
    r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.student_id.toString().includes(searchTerm)
  );

  if (loading) return <div className="loader-container"><Loader2 className="spinner" /></div>;

  return (
    <div className="request-manager-container">
      <div className="header-section">
        <div className="header-title">
          <h1>Request Manager</h1>
          <p>{requests.length} students in records</p>
        </div>

        <div className="header-actions">
          <button className="export-btn" onClick={() => exportRequestsToExcel(filtered)}>
            <Download size={18} /> Export Grouped Excel
          </button>
          
          {selectedIds.length > 0 && (
            <div className="bulk-actions-bar">
              <button onClick={() => handleStatusUpdate(selectedIds, 'Approved')} className="bulk-btn approve">Approve ({selectedIds.length})</button>
              <button onClick={() => handleStatusUpdate(selectedIds, 'Rejected')} className="bulk-btn reject">Reject ({selectedIds.length})</button>
            </div>
          )}

          <div className="search-bar">
            <Search size={18} />
            <input placeholder="Search ID or Name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? filtered.map(r => r.id) : [])} checked={selectedIds.length === filtered.length && filtered.length > 0} /></th>
              <th>Year</th>
              <th>Student ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((req) => (
              <tr key={req.id} className={selectedIds.includes(req.id) ? 'row-selected' : ''}>
                <td><input type="checkbox" checked={selectedIds.includes(req.id)} onChange={() => setSelectedIds(prev => prev.includes(req.id) ? prev.filter(i => i !== req.id) : [...prev, req.id])} /></td>
                <td><span className="year-badge">{req.year_level}</span></td>
                <td><strong>{req.student_id}</strong></td>
                <td>{req.full_name}</td>
                <td><span className="type-tag">{req.type}</span></td>
                <td><span className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</span></td>
                <td className="actions-cell">
                  {req.status === 'Pending' && (
                    <div className="quick-actions">
                      <button onClick={() => handleStatusUpdate([req.id], 'Approved')} className="action-btn approve"><Check size={14} /></button>
                      <button onClick={() => handleStatusUpdate([req.id], 'Rejected')} className="action-btn reject"><X size={14} /></button>
                    </div>
                  )}
                  <button className="action-btn view" onClick={() => setSelectedRequest(req)}><Eye size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRequest && <RequestModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />}
    </div>
  );
};

export default RequestManager;