import { Download } from 'lucide-react';
import { exportToExcel } from '../../../utils/SanctionExport';

const BSITSanctionTable = ({ sanctionData }: { sanctionData: any[] }) => {
  // Filter only BSIT students
  const bsitData = sanctionData.filter(s => s.program === 'BSIT');

  return (
    <div className="program-container">
      <div className="section-header">
        <h2>BSIT Sanction List</h2>
        <button 
          className="export-btn" 
          onClick={() => exportToExcel(bsitData, 'BSIT')}
        >
          <Download size={16} /> Export BSIT to Excel
        </button>
      </div>

      {/* This is where the Year-Level Tables from the previous step are rendered */}
      {/* (1st Year Table, 2nd Year Table, etc.) */}
    </div>
  );
};

export default BSITSanctionTable;