import type { SanctionRule } from './Data';
// src/utils/SanctionLogic.ts

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  yearLevel: string;
  program: string;
}

export interface AttendanceLog {
  studentId: string;
}

export interface SanctionResult {
  studentId: string;
  firstName: string;
  lastName: string;
  yearLevel: string;
  program: string;
  absences: number;
  item: string;
  price: number;
}

export const calculateSanctions = (
  students: any[],
  attendance: any[],
  totalRequired: number,
  rules: SanctionRule[]
) => {
  return students.map(student => {
    // Count how many times this student ID appears in attendance logs
    const logs = attendance.filter(log => log.studentId === student.id);
    const absences = Math.max(0, totalRequired - logs.length);

    if (absences > 0) {
      // Find the rule that fits the number of absences
      const rule = rules.find(r => absences >= r.minAbsences && absences <= r.maxAbsences);
      
      if (rule) {
        return {
          studentId: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          program: student.program,
          yearLevel: student.yearLevel,
          absences,
          item: rule.item,
          price: rule.price
        };
      }
    }
    return null;
  }).filter(item => item !== null); // Remove students with 0 absences
};
