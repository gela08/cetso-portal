import React from 'react';
import { X, Download, FileSpreadsheet } from 'lucide-react';

interface ExportSanctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProgram: string;
  filteredData: any[];
  yearLevels: string[];
  onExport: (data: any[], fileName: string) => void;
}

const ExportSanctionModal: React.FC<ExportSanctionModalProps> = ({
  isOpen,
  onClose,
  activeProgram,
  filteredData,
  yearLevels,
  onExport
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="title-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
            <FileSpreadsheet size={20} />
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Export {activeProgram} List</h3>
          </div>
          <button className="btn-icon" onClick={onClose} style={{ color: 'white', background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
            Select the specific dataset you wish to generate as an Excel spreadsheet.
          </p>

          <div className="export-options-grid">
            <button 
              className="export-opt-btn" 
              onClick={() => {
                onExport(filteredData, `${activeProgram}_Full_Sanctions`);
                onClose();
              }}
            >
              <Download size={18} style={{ marginRight: '8px' }} />
              Export Full Program List
            </button>

            <div className="divider-text">OR SELECT BY YEAR LEVEL</div>

            <div className="year-grid">
              {yearLevels.map((year) => (
                <button
                  key={year}
                  className="export-opt-btn secondary"
                  onClick={() => {
                    const specific = filteredData.filter(
                      (s: any) => (s.year_level || s.yearLevel) === year
                    );
                    onExport(specific, `${activeProgram}_${year.replace(' ', '_')}`);
                    onClose();
                  }}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div style={{ padding: '15px 24px', background: '#f8fafc', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
          Total records available for export: <strong>{filteredData.length}</strong>
        </div>
      </div>
    </div>
  );
};

export default ExportSanctionModal;