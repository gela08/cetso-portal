import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], programName: string) => {
  // 1. Prepare the data for Excel (Mapping headers)
  const excelData = data.map((s, index) => ({
    'No.': index + 1,
    'Student ID': s.id,
    'Last Name': s.lastName,
    'First Name': s.firstName,
    'Year Level': s.yearLevel,
    'Program': s.program,
    'Absences': s.absences,
    'Sanction Item': s.item,
    'Estimated Price': `₱${s.price}`
  }));

  // 2. Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sanction List");

  // 3. Set column widths for better readability
  const wscols = [
    { wch: 5 },  // No.
    { wch: 15 }, // ID
    { wch: 20 }, // Last Name
    { wch: 20 }, // First Name
    { wch: 12 }, // Year
    { wch: 10 }, // Program
    { wch: 10 }, // Absences
    { wch: 40 }, // Item
    { wch: 15 }, // Price
  ];
  worksheet['!cols'] = wscols;

  // 4. Download file
  XLSX.writeFile(workbook, `CETSO_Sanctions_${programName}_2026.xlsx`);
};