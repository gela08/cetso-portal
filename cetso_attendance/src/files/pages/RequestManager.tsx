import { useEffect, useState } from 'react';
import { Check, X, Eye, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

const RequestManager = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('student_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setRequests(data);
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: 'Approved' | 'Rejected') => {
    const { error } = await supabase
      .from('student_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    }
  };

  if (loading) return <div className="loader-container"><Loader2 className="spinner" /></div>;

  return (
    <div className="request-manager-container">
      <div className="table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td><strong>{req.student_id}</strong></td>
                <td>{req.full_name}</td>
                <td><span className="type-tag">{req.type}</span></td>
                <td className="reason-cell" title={req.reason}>{req.reason}</td>
                <td>
                  <span className={`status-badge ${req.status.toLowerCase()}`}>
                    {req.status}
                  </span>
                </td>
                <td className="actions-cell">
                  {req.status === 'Pending' && (
                    <>
                      <button onClick={() => updateStatus(req.id, 'Approved')} className="action-btn approve" title="Approve">
                        <Check size={16} />
                      </button>
                      <button onClick={() => updateStatus(req.id, 'Rejected')} className="action-btn reject" title="Reject">
                        <X size={16} />
                      </button>
                    </>
                  )}
                  <button className="action-btn view" title="View Details"><Eye size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestManager;