import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Send, CheckCircle } from 'lucide-react';

const RequestForm: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const payload = {
      student_id: formData.get('student_id'),
      full_name: formData.get('full_name'),
      program: formData.get('program'),
      year_level: formData.get('year_level'),
      type: formData.get('type'),
      reason: formData.get('reason'),
      status: 'Pending'
    };

    const { error } = await supabase.from('student_requests').insert([payload]);

    if (!error) {
      setIsSubmitted(true);
    } else {
      alert("Error submitting request. Please try again.");
    }
    setLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="form-success">
        <CheckCircle size={48} className="text-green" />
        <h3>Request Submitted!</h3>
        <p>A confirmation email will be sent to your student account shortly.</p>
        <button onClick={() => setIsSubmitted(false)} className="btn-retry">Submit Another</button>
      </div>
    );
  }

  return (
    <form className="request-form-ui" onSubmit={handleSubmit}>
      <div className="input-grid">
        <div className="form-item">
          <label>Student ID Number</label>
          <input name="student_id" type="text" placeholder="202X-XXXXX" required />
        </div>
        <div className="form-item">
          <label>Full Name</label>
          <input name="full_name" type="text" placeholder="Last Name, First Name" required />
        </div>
      </div>

      <div className="input-grid">
        <div className="form-item">
          <label>Program</label>
          <select name="program" required>
            <option value="BSIT">BSIT</option>
            <option value="BSCpE">BSCpE</option>
            <option value="BSECE">BSECE</option>
            <option value="BLIS">BLIS</option>
          </select>
        </div>
        <div className="form-item">
          <label>Request Type</label>
          <select name="type" required>
            <option value="Absence Excuse">Absence Excuse</option>
            <option value="Sanction Appeal">Sanction Appeal</option>
          </select>
        </div>
      </div>

      <div className="form-item">
        <label>Reason / Explanation</label>
        <textarea name="reason" rows={5} placeholder="State your reason clearly..." required></textarea>
      </div>

      <button type="submit" className="btn-primary-form" disabled={loading}>
        {loading ? "Processing..." : <><Send size={18} /> Submit Request</>}
      </button>
    </form>
  );
};

export default RequestForm;