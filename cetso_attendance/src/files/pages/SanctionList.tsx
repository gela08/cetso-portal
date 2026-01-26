import { Scale, AlertTriangle, Info } from 'lucide-react'; // Using icons
import { calculateSanctions } from '../utils/SanctionLogic';
import { SANCTION_RULES } from '../utils/Data';

const SanctionList = ({ students, attendance, activeEvent }: any) => {
  const sanctionData = calculateSanctions(students, attendance, 12, SANCTION_RULES);

  return (
    <div className="table-card sanction-container">
      <div className="sanction-info-bar">
        <Info size={18} color="var(--cetso-orange)" />
        <span className="filter-label">
          Calculated for: <strong>{activeEvent || 'Current Event'}</strong> (12 required logs)
        </span>
      </div>

      <table className="modern-table">
        <thead>
          <tr>
            <th><Scale size={14} style={{marginRight: '8px'}}/> Student</th>
            <th>Program</th>
            <th>Absences</th>
            <th>Sanction Item</th>
          </tr>
        </thead>
        <tbody>
          {sanctionData.length > 0 ? (
            sanctionData.map((s, i) => (
              <tr key={i}>
                <td className="font-bold">{s.studentName}</td>
                <td><span className="program-tag">{s.program}</span></td>
                <td className="warning-text">{s.absences}</td>
                <td className="item-cell">{s.item}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="no-sanctions">
                <AlertTriangle size={20} /> No sanctions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SanctionList;