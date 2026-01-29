import React from 'react';
import { X, Calendar, User, FileText, Info, Mail, BookOpen, GraduationCap } from 'lucide-react';
import '../styles/components/requestmodal.css';

interface RequestModalProps {
  request: any;
  onClose: () => void;
}

const RequestModal: React.FC<RequestModalProps> = ({ request, onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Request Details</h2>
            <span className="request-id">REF: {request.id.split('-')[0].toUpperCase()}</span>
          </div>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body">
          <div className="detail-grid">
            <div className="detail-item">
              <label><User size={14} /> Full Name</label>
              <p>{request.full_name}</p>
            </div>
            <div className="detail-item">
              <label><Info size={14} /> Student ID</label>
              <p>{request.student_id}</p>
            </div>
            <div className="detail-item">
              <label><Mail size={14} /> Official Email</label>
              <p>{request.email}</p>
            </div>
            <div className="detail-item">
              <label><Calendar size={14} /> Submitted On</label>
              <p>{new Date(request.created_at).toLocaleDateString()}</p>
            </div>
            <div className="detail-item">
              <label><BookOpen size={14} /> Program</label>
              <p>{request.program}</p>
            </div>
            <div className="detail-item">
              <label><GraduationCap size={14} /> Year Level</label>
              <p>{request.year_level}</p>
            </div>
          </div>

          <div className="detail-section">
            <label><FileText size={14} /> Request Type: <strong>{request.type}</strong></label>
            <div className="reason-box">
              {request.reason}
            </div>
          </div>

          <div className="modal-footer">
            <div className={`status-badge ${request.status.toLowerCase()}`}>
              {request.status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestModal;