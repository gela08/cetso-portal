export interface AttendanceRecord {
  id?: string;
  student_id: number;
  first_name: string;
  last_name: string;
  program: string;
  year_level: string;
  timestamp: string;
  eventName: string;
  session: 'Morning' | 'Afternoon';
  type: 'IN' | 'OUT';
}

export type AttendanceStatus = 'success' | 'error' | 'duplicate';

// --- NEW PUBLIC VIEW TYPES ---

export interface Officer {
  id: string;
  first_name: string;
  last_name: string;
  position: string;
  program?: string; // Optional for College-level
  image_url: string;
  level: 'college' | 'program';
  rank_order: number;
}

export interface SubmissionRequest {
  id?: string;
  student_id: string;
  full_name: string;
  program: string;
  year_level: string;
  type: 'Sanction Appeal' | 'Absence Excuse';
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at?: string;
}