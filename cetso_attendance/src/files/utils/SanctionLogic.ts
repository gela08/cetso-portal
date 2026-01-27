import type { SanctionRule } from './Data';
// src/utils/SanctionLogic.ts

export interface Student {
  studentId: number;
  firstName: string;
  lastName: string;
  yearLevel: string;
  program: string;
}

export interface AttendanceLog {
  studentId: number;
}

export interface SanctionResult {
  studentId: number;
  firstName: string;
  lastName: string;
  yearLevel: string;
  program: string;
  absences: number;
  item: string;
  price: number;
}

export const calculateSanctions = (
  students: Student[], // Use the interface instead of any[]
  attendance: AttendanceLog[],
  totalRequired: number,
  rules: SanctionRule[]
): SanctionResult[] => { // Explicitly return the Result type
  return students
    .map((student) => {
      const logs = attendance.filter((log) => log.studentId === student.studentId);
      const absences = Math.max(0, totalRequired - logs.length);

      if (absences > 0) {
        const rule = rules.find(
          (r) => absences >= r.minAbsences && absences <= r.maxAbsences
        );

        if (rule) {
          return {
            studentId: student.studentId, // Fixed from .idd
            firstName: student.firstName,
            lastName: student.lastName,
            program: student.program,
            yearLevel: student.yearLevel,
            absences,
            item: rule.item,
            price: rule.price,
          };
        }
      }
      return null;
    })
    .filter((item): item is SanctionResult => item !== null); 
};
