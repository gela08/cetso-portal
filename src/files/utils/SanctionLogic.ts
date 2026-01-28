import type { SanctionRule } from './Data';

export const calculateSanctions = (
  students: any[],
  attendance: any[],
  totalRequired: number,
  rules: SanctionRule[]
): any[] => {
  return students
    .map((student) => {
      // Handle both database (student_id) and local (studentId) keys
      const sId = student.student_id || student.studentId;
      
      // Count logs for this specific student
      const logs = attendance.filter((log) => (log.student_id || log.studentId) === sId);
      const absences = Math.max(0, totalRequired - logs.length);

      if (absences > 0) {
        const rule = rules.find(
          (r) => absences >= r.minAbsences && absences <= r.maxAbsences
        );

        if (rule) {
          return {
            studentId: sId,
            firstName: student.first_name || student.firstName,
            lastName: student.last_name || student.lastName,
            program: student.program,
            yearLevel: student.year_level || student.yearLevel,
            absences,
            item: rule.item,
            price: rule.price,
          };
        }
      }
      return null;
    })
    .filter((item): item is any => item !== null); 
};