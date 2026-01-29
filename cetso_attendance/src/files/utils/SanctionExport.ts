import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], programName: string) => {
  const sortedData = [...data].sort((a, b) => 
    String(a.year_level || a.yearLevel).localeCompare(String(b.year_level || b.yearLevel), undefined, { numeric: true })
  );

  const excelData = sortedData.map((s, index) => ({
    'No.': index + 1,
    'Student ID': s.student_id || s.studentId,
    'Last Name': s.last_name || s.lastName,
    'First Name': s.first_name || s.firstName,
    'Email': s.email || 'N/A', // ADDED EMAIL
    'Year Level': s.year_level || s.yearLevel,
    'Program': s.program,
    'Absences': s.absences,
    'Sanction Item': s.item,
    'Estimated Price': `₱${s.price}`
  }));

  // 3. Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sanction List");

  // 4. Set column widths
  const wscols = [
    { wch: 5 },  // No.
    { wch: 15 }, // ID
    { wch: 30 }, // Last Name
    { wch: 30 }, // First Name
    { wch: 12 }, // Year
    { wch: 10 }, // Program
    { wch: 10 }, // Absences
    { wch: 40 }, // Item
    { wch: 15 }, // Price
  ];
  worksheet['!cols'] = wscols;

  // 5. Download file
  XLSX.writeFile(workbook, `CETSO_Sanctions_${programName}_2026.xlsx`);
};