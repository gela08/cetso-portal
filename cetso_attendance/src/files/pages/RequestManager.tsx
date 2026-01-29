import { useEffect, useState, useMemo } from 'react';
import { Check, X, Eye, Loader2, Search, Download, Trash2, Layers } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';
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

  useEffect(() => {
    fetchRequests();
    const channel = supabase.channel('db_changes').on('postgres_changes', 
      { event: '*', schema: 'public', table: 'student_requests' }, (payload: any) => {
        if (payload.eventType === 'INSERT') setRequests(prev => [payload.new, ...prev]);
        if (payload.eventType === 'UPDATE') setRequests(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
        if (payload.eventType === 'DELETE') setRequests(prev => prev.filter(r => r.id !== payload.old.id));
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('student_requests').select('*').order('created_at', { ascending: false });
    if (!error) setRequests(data);
    setLoading(false);
  };

  const filtered = useMemo(() => {
    return requests.filter(r => 
      r.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.student_id.toString().includes(searchTerm)
    );
  }, [requests, searchTerm]);

  const handleStatusUpdate = async (ids: string[], status: 'Approved' | 'Rejected') => {
    const { error } = await supabase.from('student_requests').update({ status }).in('id', ids);
    if (!error) {
      setRequests(prev => prev.map(r => ids.includes(r.id) ? { ...r, status } : r));
      setSelectedIds([]);
    }
  };

  const handleDelete = async (ids: string[]) => {
    const confirmMsg = ids.length > 1 ? `Permanently delete ${ids.length} records?` : "Delete this record?";
    if (window.confirm(confirmMsg)) {
      const { error } = await supabase.from('student_requests').delete().in('id', ids);
      if (!error) {
        setRequests(prev => prev.filter(r => !ids.includes(r.id)));
        setSelectedIds([]);
      }
    }
  };

  const onBulkAction = (action: 'Approved' | 'Rejected' | 'Delete') => {
    if (action === 'Delete') handleDelete(selectedIds);
    else handleStatusUpdate(selectedIds, action);
    setIsBulkModalOpen(false);
  };

  if (loading) {
    return (
      <div className="loader-container">
        <Loader2 className="spinner" />
        <p>Syncing Database...</p>
      </div>
    );
  }

  return (
    <div className="request-manager-container">
      <div className="header-section">
        <div className="header-title">
          <h1>Request Manager</h1>
          <p>{filtered.length} students in records</p>
        </div>

        <div className="header-actions">
          <button 
            className={`bulk-trigger-btn ${selectedIds.length > 0 ? 'visible' : 'hidden'}`}
            onClick={() => setIsBulkModalOpen(true)}
          >
            <Layers size={18} /> Manage ({selectedIds.length})
          </button>

          <button className="export-btn" onClick={() => exportRequestsToExcel(filtered)}>
            <Download size={18} /> Export
          </button>
          
          <div className="search-bar">
            <Search size={18} />
            <input 
              placeholder="Search by name or ID..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="checkbox-col">
                <input 
                  type="checkbox" 
                  onChange={(e) => setSelectedIds(e.target.checked ? filtered.map(r => r.id) : [])} 
                  checked={selectedIds.length === filtered.length && filtered.length > 0} 
                />
              </th>
              <th>Year</th>
              <th>Student ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Status</th>
              <th className="actions-header">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((req) => (
              <tr key={req.id} className={selectedIds.includes(req.id) ? 'row-selected' : ''}>
                <td className="checkbox-col">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.includes(req.id)} 
                    onChange={() => setSelectedIds(prev => prev.includes(req.id) ? prev.filter(i => i !== req.id) : [...prev, req.id])} 
                  />
                </td>
                <td><span className="year-badge">{req.year_level}</span></td>
                <td><span className="id-text">{req.student_id}</span></td>
                <td className="name-text">{req.full_name}</td>
                <td><span className="type-tag">{req.type}</span></td>
                <td><span className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</span></td>
                <td className="actions-cell">
                  
                  <div className="action-group-fixed">
                    <button 
                      onClick={() => handleStatusUpdate([req.id], 'Approved')} 
                      className={`btn-icon approve ${req.status !== 'Pending' ? 'is-hidden' : ''}`}
                    ><Check size={16} /></button>
                    
                    <button 
                      onClick={() => handleStatusUpdate([req.id], 'Rejected')} 
                      className={`btn-icon reject ${req.status !== 'Pending' ? 'is-hidden' : ''}`}
                    ><X size={16} /></button>

                    <button className="btn-icon view" onClick={() => setSelectedRequest(req)}><Eye size={16} /></button>
                    <button className="btn-icon delete" onClick={() => handleDelete([req.id])}><Trash2 size={16} /></button>
                  </div>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedRequest && <RequestModal request={selectedRequest} onClose={() => setSelectedRequest(null)} />}
      
      {isBulkModalOpen && (
        <BulkRequestModal 
          selectedCount={selectedIds.length}
          selectedNames={requests.filter(r => selectedIds.includes(r.id)).map(r => r.full_name)}
          onAction={onBulkAction}
          onClose={() => setIsBulkModalOpen(false)}
        />
      )}
    </div>
  );
};

export default RequestManager;