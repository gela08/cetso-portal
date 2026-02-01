import React from 'react';
import { X, CheckCircle2, AlertCircle, Trash2, XCircle, Layers } from 'lucide-react';
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
    <div className="rm-bulk-overlay" onClick={onClose}>
      <div className="rm-bulk-card" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="rm-bulk-header">
          <div className="rm-header-main">
            <div className="rm-icon-badge">
              <Layers size={22} />
            </div>
            <div className="rm-header-text">
              <h3>Batch Processing</h3>
              <p>Modifying {selectedCount} student records</p>
            </div>
          </div>
          <button className="rm-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Selected List Preview */}
        <div className="rm-bulk-body">
          <label className="rm-section-label">Selected Students</label>
          <div className="rm-name-grid">
            {selectedNames.map((name, i) => (
              <div key={i} className="rm-name-pill">
                {name}
              </div>
            ))}
          </div>

          {/* Action Stack */}
          <div className="rm-action-stack">
            <button onClick={() => onAction('Approved')} className="rm-action-item approve">
              <div className="rm-action-icon"><CheckCircle2 size={20} /></div>
              <div className="rm-action-info">
                <strong>Approve All</strong>
                <span>Set status to approved for selection</span>
              </div>
            </button>

            <button onClick={() => onAction('Rejected')} className="rm-action-item reject">
              <div className="rm-action-icon"><XCircle size={20} /></div>
              <div className="rm-action-info">
                <strong>Reject All</strong>
                <span>Mark selection as rejected</span>
              </div>
            </button>

            <div className="rm-divider"><span>Danger Zone</span></div>

            <button onClick={() => onAction('Delete')} className="rm-action-item delete">
              <div className="rm-action-icon"><Trash2 size={20} /></div>
              <div className="rm-action-info">
                <strong>Delete Permanently</strong>
                <span>This action cannot be undone</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="rm-bulk-footer">
          <AlertCircle size={14} />
          <span>Updates are applied to the database immediately.</span>
        </div>
      </div>
    </div>
  );
};

export default BulkRequestModal;