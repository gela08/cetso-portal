import { supabase } from './supabaseClient';
import { INITIAL_STUDENTS, SANCTION_RULES } from './Data';

export const DatabaseAdmin = () => {
  const migrateData = async () => {
    try {
      // 1. Map students to database format (snake_case)
      const students = INITIAL_STUDENTS.map(s => ({
        student_id: s.studentId,
        first_name: s.firstName,
        last_name: s.lastName,
        email: s.email,
        year_level: s.yearLevel,
        program: s.program
      }));

      // 2. Map rules
      const rules = SANCTION_RULES.map(r => ({
        category: r.category,
        min_absences: r.minAbsences,
        max_absences: r.maxAbsences,
        item: r.item,
        price: r.price
      }));

      await supabase.from('students').insert(students);
      await supabase.from('sanction_rules').insert(rules);
      
      alert("✅ Migration Successful!");
    } catch (err) {
      alert("❌ Migration failed. See console.");
      console.error(err);
    }
  };

  const testAttendance = async () => {
    // This simulates a scan for ID 123
    const { data, error } = await supabase.from('attendance_logs').insert([{
      student_id: 123,
      first_name: "Test",
      last_name: "User",
      type: "In",
      category: "Intramurals"
    }]).select();

    if (error) alert("❌ Insert failed: " + error.message);
    else alert("✅ Insert Success! ID: " + data[0].id);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
      <h3>Database Admin Tools</h3>
      <button onClick={migrateData} style={{ marginRight: '10px', background: '#3ecf8e', color: 'white' }}>
        🚀 Run Migration (Upload local data)
      </button>
      <button onClick={testAttendance} style={{ background: '#444', color: 'white' }}>
        🧪 Test Scan (ID 123)
      </button>
    </div>
  );
};