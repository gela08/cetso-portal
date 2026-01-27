export interface SanctionRule {
  category: 'Intramurals' | 'Orientation';
  minAbsences: number;
  maxAbsences: number;
  item: string;
  price: number;
}


// src/utils/Data.ts
export const INITIAL_STUDENTS = [

  {
    studentId: '123',
    firstName: 'Jerome',
    lastName: 'Sagunday',
    yearLevel: '3rd Year',
    program: 'BSIT'
  },

  {
    studentId: '1234',
    firstName: 'You Jerome',
    lastName: 'We Miss',
    yearLevel: '1st Year',
    program: 'BSIT'
  },

  {
    studentId: '12345',
    firstName: 'NAH',
    lastName: 'HELL',
    yearLevel: '1st Year',
    program: 'BSIT'
  },

  {
    studentId: '123456',
    firstName: 'Way Bro',
    lastName: 'Aint No',
    yearLevel: '4th Year',
    program: 'BSCpE'
  }

];

// --- DATABASE: SANCTIONS (FOR PUBLIC VIEW) ---
// This is what the students see on the landing page
export const INTRAMURALS_DISPLAY = [
  { eventName: 'Intramurals/Fiesta 2025', absences: '11–12', item: 'Lysol Disinfectant Spray 170g', price: 300 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '10', item: '1 ream short or long bond paper', price: 245 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '9', item: '1 Green Cross/Casino Alcohol 500ml, 1 stamp pad', price: 155 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '8', item: '1 pack band aid, 1 small betadine, 1 cotton', price: 115 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '7', item: '1 Pilot WB Marker, 2 Sign pens (B&B), 1 garbage bag', price: 95 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '6', item: '1 cleaning rag, 1 Pilot WB Marker, 1 masking tape', price: 95 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '5', item: '1 Pilot WB Marker, 1 garbage bag, 2 sign pens', price: 95 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '4', item: 'Canned goods (no sardines) / 1kg rice', price: 90 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '3', item: '1 pack bond paper, 1 Alcohol 250ml', price: 80 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '2', item: '1 short bond paper (20pcs), 1 tissue roll, 2 Carbon paper', price: 70 },
  { eventName: 'Intramurals/Fiesta 2025', absences: '1', item: '1 Garbage bag, 2 sign pens (blue, black)', price: 50 }
];

export const ORIENTATION_DISPLAY = [
  { eventName: '1st Sem Orientation', absences: '2', item: '1 pack Tissue, 1 Green Cross 250ml, 1 black ballpen', price: 70 },
  { eventName: '1st Sem Orientation', absences: '1', item: '1 Green Cross Alcohol, 1 Tissue roll', price: 50 }
];

// --- DATABASE: CALCULATION RULES (FOR OFFICER DASHBOARD) ---
// This is what the system uses to calculate absences
export const SANCTION_RULES: SanctionRule[] = [
  { category: 'Intramurals', minAbsences: 11, maxAbsences: 12, item: 'Lysol Disinfectant Spray 170g', price: 300 },
  { category: 'Intramurals', minAbsences: 10, maxAbsences: 10, item: '1 ream short or long bond paper', price: 245 },
  { category: 'Intramurals', minAbsences: 9, maxAbsences: 9, item: '1 Green Cross 500ml, 1 stamp pad', price: 155 },
  { category: 'Intramurals', minAbsences: 8, maxAbsences: 8, item: '1 pack band aid, 1 small betadine, 1 cotton', price: 115 },
  { category: 'Intramurals', minAbsences: 7, maxAbsences: 7, item: '1 Pilot WB Marker, 2 Sign pens, 1 garbage bag', price: 95 },
  { category: 'Intramurals', minAbsences: 6, maxAbsences: 6, item: '1 cleaning rag, 1 Pilot WB Marker, 1 masking tape', price: 95 },
  { category: 'Intramurals', minAbsences: 5, maxAbsences: 5, item: '1 Pilot WB Marker, 1 garbage bag, 2 sign pens', price: 95 },
  { category: 'Intramurals', minAbsences: 4, maxAbsences: 4, item: 'Canned goods / 1kg rice', price: 90 },
  { category: 'Intramurals', minAbsences: 3, maxAbsences: 3, item: '1 pack bond paper, 1 Alcohol 250ml', price: 80 },
  { category: 'Intramurals', minAbsences: 2, maxAbsences: 2, item: '1 short bond paper (20pcs), 1 tissue, 2pcs Carbon', price: 70 },
  { category: 'Intramurals', minAbsences: 1, maxAbsences: 1, item: '1 Garbage bag, 2 sign pens', price: 50 },
  { category: 'Orientation', minAbsences: 2, maxAbsences: 2, item: '1 pack Tissue, 1 Alcohol 250ml, 1 black ballpen', price: 70 },
  { category: 'Orientation', minAbsences: 1, maxAbsences: 1, item: '1 Alcohol, 1 Tissue roll', price: 50 }
];