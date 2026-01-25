export interface SanctionRule {
  category: string;
  minAbsences: number;
  maxAbsences: number;
  item: string;
  price: number;
}

export const calculateSanctions = (
  students: any[],
  attendance: any[],
  totalRequiredChecks: number,
  rules: SanctionRule[]
) => {
  const sanctionList: any[] = [];

  students.forEach((student) => {
    const studentLogs = attendance.filter((log) => log.studentId === student.id);
    const absences = Math.max(0, totalRequiredChecks - studentLogs.length);

    // Only process if there is at least one absence
    if (absences > 0) {
      const assignedRule = rules.find(
        (rule) => absences >= rule.minAbsences && absences <= rule.maxAbsences
      );

      if (assignedRule) {
        sanctionList.push({
          studentName: student.name,
          program: student.program,
          absences: absences,
          item: assignedRule.item,
          price: assignedRule.price,
        });
      }
    }
  });

  return sanctionList;
};