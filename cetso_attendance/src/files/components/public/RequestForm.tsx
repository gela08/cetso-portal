import React, { useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { Send, CheckCircle, User, Hash, BookOpen, MessageSquare, GraduationCap, AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import '../../styles/components/public/requestform.css';

const RequestForm: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    program: '',
    yearLevel: '',
    type: 'Absence Excuse',
    reason: ''
  });

  // Validation Logic
  const isIdValid = formData.studentId.startsWith('598') && formData.studentId.length === 8;
  const isEmailValid = formData.email.toLowerCase().endsWith('@hcdc.edu.ph');
  const isFormValid = isIdValid && isEmailValid && formData.fullName && formData.reason;

  const formatName = (name: string) => {
    return name.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    const payload = {
      student_id: Number(formData.studentId),
      full_name: formatName(formData.fullName),
      email: formData.email.toLowerCase(),
      program: formData.program,
      year_level: formData.yearLevel,
      type: formData.type,
      reason: formData.reason,
      status: 'Pending',
      created_at: new Date().toISOString()
    };

    const { error } = await supabase.from('student_requests').insert([payload]);

    if (!error) {
      setIsSubmitted(true);
    } else {
      alert("Error submitting request. Please check your connection.");
    }
    setLoading(false);
  };

  if (isSubmitted) {
    return (
      <div className="form-success-container">
        <div className="success-icon-wrapper">
          <CheckCircle size={48} className="success-icon" />
        </div>
        <h3>Request Submitted!</h3>
        <p>Your request has been logged. The CETSO officers will review it soon.</p>
        <button 
          onClick={() => { setIsSubmitted(false); setFormData({ ...formData, studentId: '', fullName: '', reason: '' }); }} 
          className="btn-primary"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="request-card">
      <div className="form-header">
        <h2>Submit Official Request</h2>
        <p>Ensure details match your HCDC student records.</p>
      </div>

      <form className="request-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label><User size={14} /> Full Name</label>
            <input 
              type="text" 
              placeholder="Last Name, First Name" 
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              required 
            />
          </div>
          <div className="form-group">
            <label><Hash size={14} /> Student ID</label>
            <div className="input-with-icon">
              <input 
                type="text" 
                placeholder="598XXXXX" 
                maxLength={8}
                value={formData.studentId}
                onChange={(e) => setFormData({...formData, studentId: e.target.value.replace(/\D/g, '')})}
                className={formData.studentId.length > 0 ? (isIdValid ? 'valid' : 'invalid') : ''}
                required 
              />
              {formData.studentId.length > 0 && (
                isIdValid ? <CheckCircle2 className="icon-success" size={18} /> : <AlertCircle className="icon-error" size={18} />
              )}
            </div>
            {!isIdValid && formData.studentId.length > 0 && <span className="error-text">Must start with 598</span>}
          </div>
        </div>

        <div className="form-group">
          <label><Mail size={14} /> Official Email (@hcdc.edu.ph)</label>
          <div className="input-with-icon">
            <input 
              type="email" 
              placeholder="hcdcemail@hcdc.edu.ph"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className={formData.email.length > 0 ? (isEmailValid ? 'valid' : 'invalid') : ''}
              required 
            />
            {formData.email.length > 0 && (
              isEmailValid ? <CheckCircle2 className="icon-success" size={18} /> : <AlertCircle className="icon-error" size={18} />
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label><BookOpen size={14} /> Program</label>
            <select value={formData.program} onChange={(e) => setFormData({...formData, program: e.target.value})} required>
              <option value="">Select</option>
              <option value="BSIT">BSIT</option>
              <option value="BSCpE">BSCpE</option>
              <option value="BSECE">BSECE</option>
              <option value="BLIS">BLIS</option>
            </select>
          </div>
          <div className="form-group">
            <label><GraduationCap size={14} /> Year Level</label>
            <select value={formData.yearLevel} onChange={(e) => setFormData({...formData, yearLevel: e.target.value})} required>
              <option value="">Select</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Request Type</label>
          <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="type-select">
            <option value="Absence Excuse">Absence Excuse</option>
            <option value="Sanction Appeal">Sanction Appeal</option>
            <option value="Other">Other Inquiry</option>
          </select>
        </div>

        <div className="form-group">
          <label><MessageSquare size={14} /> Reason</label>
          <textarea 
            rows={4} 
            placeholder="Explain your request clearly..." 
            value={formData.reason}
            onChange={(e) => setFormData({...formData, reason: e.target.value})}
            required 
          ></textarea>
        </div>

        <button type="submit" className="btn-primary" disabled={loading || !isFormValid}>
          {loading ? "Processing..." : <><Send size={18} /> Submit Request</>}
        </button>
      </form>
    </div>
  );
};

export default RequestForm;