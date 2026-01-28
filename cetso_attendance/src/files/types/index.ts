export interface AttendanceRecord {
  id?: string;           // Optional for new records, required for fetched ones
  student_id: number;    // Database uses numeric ID
  first_name: string;    // Split names to match student table
  last_name: string;
  program: string;
  year_level: string;
  timestamp: string;     // ISO string (timestamptz in Supabase)
  
  // UI Helper Fields (Parsed from the 'type' string or timestamp)
  eventName: string;     // e.g., "Intramurals"
  session: 'Morning' | 'Afternoon';
  type: 'IN' | 'OUT';
}

// Helper to determine the status color in your UI
export type AttendanceStatus = 'success' | 'error' | 'duplicate';