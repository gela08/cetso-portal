export interface AttendanceRecord {
  id: string;
  studentId: string;
  name: string;
  program: string;
  timestamp: string; // Full ISO string
  date: string;      // e.g., "2026-01-26"
  eventName: string; // e.g., "Intramurals 2026"
  session: 'Morning' | 'Afternoon';
  type: 'IN' | 'OUT';
}