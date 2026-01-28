// src/files/utils/MigrateData.tsx
import { supabase } from '../utils/supabaseClient';
import { INITIAL_STUDENTS, SANCTION_RULES } from './Data';

export const MigrateData = () => {
  const handleUpload = async () => {
    try {
      // 1. Prepare Students (Mapping camelCase -> snake_case)
      const formattedStudents = INITIAL_STUDENTS.map(student => ({
        student_id: student.studentId,
        first_name: student.firstName,
        last_name: student.lastName,
        email: student.email,
        year_level: student.yearLevel,
        program: student.program
      }));

      // 2. Prepare Rules
      const formattedRules = SANCTION_RULES.map(rule => ({
        category: rule.category,
        min_absences: rule.minAbsences,
        max_absences: rule.maxAbsences,
        item: rule.item,
        price: rule.price
      }));

      // 3. Upload to Supabase
      const { error: studentErr } = await supabase.from('students').insert(formattedStudents);
      const { error: rulesErr } = await supabase.from('sanction_rules').insert(formattedRules);

      if (studentErr || rulesErr) throw studentErr || rulesErr;

      alert("Migration Successful! Check your Supabase Table Editor.");
    } catch (err) {
      console.error("Migration failed:", err);
      alert("Error: check console for details.");
    }
  };

  return (
    <button 
      onClick={handleUpload}
      style={{ padding: '10px', backgroundColor: '#3ecf8e', color: 'white', border: 'none', borderRadius: '5px' }}
    >
      🚀 Upload Local Data to Supabase
    </button>
  );
};