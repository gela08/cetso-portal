import type { SanctionRule } from './SanctionLogic';

// src/utils/Data.ts
export const INITIAL_STUDENTS = [
  { id: '123', name: 'Jerome Sagunday', yearLevel: '3rd Year', program: 'BSIT' },
  { id: '1234', name: 'We Miss You Jerome', yearLevel: '2nd Year', program: 'BSCpE' },
  { id: '12345', name: 'PAG DALI BA!', yearLevel: '4th Year', program: 'BSECE' },
  { id: '123456', name: 'Hell Nah Dawg', yearLevel: '1st Year', program: 'BLIS' },
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