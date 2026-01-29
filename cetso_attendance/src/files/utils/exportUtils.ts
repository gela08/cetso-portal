import * as XLSX from 'xlsx';

export const exportRequestsToExcel = (data: any[]) => {
  // 1. Sort logic: First by Year Level (numeric), then by Full Name (alphabetical)
  const sortedData = [...data].sort((a, b) => {
    const yearA = String(a.year_level || '');
    const yearB = String(b.year_level || '');
    
    // Primary sort: Year Level
    const yearSort = yearA.localeCompare(yearB, undefined, { numeric: true });
    
    // Secondary sort: Name (if years are the same)
    if (yearSort === 0) {
      return a.full_name.localeCompare(b.full_name);
    }
    return yearSort;
  });

  // 2. Map data for Excel with professional headers
  const excelData = sortedData.map((req, index) => ({
    'No.': index + 1,
    'Year Level': req.year_level,
    'Student ID': req.student_id,
    'Full Name': req.full_name,
    'Program': req.program,
    'Official Email': req.email || 'N/A',
    'Request Type': req.type,
    'Reason/Details': req.reason,
    'Status': req.status,
    'Date Filed': new Date(req.created_at).toLocaleDateString(),
  }));

  // 3. Create worksheet and workbook
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sorted Student Requests");

  // 4. Define column widths for readability
  const wscols = [
    { wch: 6 },  // No.
    { wch: 12 }, // Year Level
    { wch: 15 }, // Student ID
    { wch: 30 }, // Full Name
    { wch: 15 }, // Program
    { wch: 35 }, // Official Email
    { wch: 20 }, // Request Type
    { wch: 50 }, // Reason/Details
    { wch: 12 }, // Status
    { wch: 15 }, // Date Filed
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, `HCDC_CETSO_Requests_${new Date().getFullYear()}.xlsx`);
};