import React from 'react';
import { X, CheckCircle2, AlertCircle, Trash2, XCircle } from 'lucide-react';
import '../styles/components/bulkrequestmodal.css';

interface BulkRequestModalProps {
  selectedCount: number;
  selectedNames: string[];
  onAction: (action: 'Approved' | 'Rejected' | 'Delete') => void;
  onClose: () => void;
}

const BulkRequestModal: React.FC<BulkRequestModalProps> = ({ 
  selectedCount, 
  selectedNames, 
  onAction, 
  onClose 
}) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="bulk-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bulk-header">
          <div className="header-content">
            <div className="icon-badge">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h3>Batch Processing</h3>
              <p>Modifying {selectedCount} student records</p>
            </div>
          </div>
          <button className="close-minimal" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Selected List Preview */}
        <div className="bulk-body">
          <div className="name-preview-grid">
            {selectedNames.map((name, i) => (
              <div key={i} className="name-pill">
                {name}
              </div>
            ))}
          </div>

          {/* Action Cards */}
          <div className="action-stack">
            <button onClick={() => onAction('Approved')} className="action-row approve">
              <div className="action-icon"><CheckCircle2 size={18} /></div>
              <div className="action-label">
                <strong>Approve Requests</strong>
                <span>Set status to approved for all selected</span>
              </div>
            </button>

            <button onClick={() => onAction('Rejected')} className="action-row reject">
              <div className="action-icon"><XCircle size={18} /></div>
              <div className="action-label">
                <strong>Reject Requests</strong>
                <span>Mark selected as rejected</span>
              </div>
            </button>

            <button onClick={() => onAction('Delete')} className="action-row delete">
              <div className="action-icon"><Trash2 size={18} /></div>
              <div className="action-label">
                <strong>Remove Permanently</strong>
                <span>This action cannot be undone</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bulk-footer">
          <AlertCircle size={14} />
          <span>Students will see these updates in their portal immediately.</span>
        </div>
      </div>
    </div>
  );
};

export default BulkRequestModal;