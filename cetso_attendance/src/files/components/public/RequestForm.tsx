import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { 
  Send, 
  CheckCircle, 
  User, 
  Hash, 
  BookOpen, 
  MessageSquare, 
  GraduationCap, 
  AlertCircle, 
  CheckCircle2, 
  Mail, 
  Lock 
} from 'lucide-react';
import '../../styles/components/public/requestform.css';

const RequestForm: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const [formData, setFormData] = useState({
    studentId: '',
    fullName: '',
    email: '',
    program: '',
    yearLevel: '',
    type: 'Absence Excuse',
    reason: ''
  });

  const isIdValid = formData.studentId.startsWith('598') && formData.studentId.length === 8;
  const isEmailValid = formData.email.toLowerCase().endsWith('@hcdc.edu.ph');
  const isFormValid = isIdValid && isEmailValid && formData.fullName && formData.reason && formData.program && formData.yearLevel;

  useEffect(() => {
    const fetchStudentData = async () => {
      if (isIdValid) {
        setVerifying(true);
        setErrorMessage(null);
        try {
          const { data, error } = await supabase
            .from('students')
            .select('first_name, last_name, program, year_level, email')
            .eq('student_id', Number(formData.studentId))
            .single();

          if (error || !data) {
            setErrorMessage("Student ID not found in CETSO Masterlist. Please visit the office.");
            setIsAutoFilled(false);
            setFormData(prev => ({ ...prev, fullName: '', program: '', yearLevel: '' }));
          } else {
            setFormData(prev => ({
              ...prev,
              fullName: `${data.last_name}, ${data.first_name}`,
              program: data.program,
              yearLevel: data.year_level,
              email: data.email || prev.email
            }));
            setIsAutoFilled(true);
          }
        } catch (err) {
          console.error("Fetch error:", err);
        } finally {
          setVerifying(false);
        }
      } else {
        setIsAutoFilled(false);
      }
    };
    fetchStudentData();
  }, [formData.studentId, isIdValid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !isAutoFilled) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const { data: existing } = await supabase
        .from('student_requests')
        .select('id')
        .eq('student_id', Number(formData.studentId))
        .eq('type', formData.type)
        .eq('status', 'Pending');

      if (existing && existing.length > 0) {
        setErrorMessage(`You already have a pending ${formData.type} request.`);
        setLoading(false);
        return;
      }

      const { error: insertError } = await supabase.from('student_requests').insert([{
        student_id: Number(formData.studentId),
        full_name: formData.fullName,
        email: formData.email.toLowerCase(),
        program: formData.program,
        year_level: formData.yearLevel,
        type: formData.type,
        reason: formData.reason,
        status: 'Pending'
      }]);

      if (insertError) throw insertError;

      await supabase.functions.invoke('send-request-confirmation', {
        body: {
          email: formData.email,
          studentName: formData.fullName,
          requestType: formData.type,
          studentId: formData.studentId
        }
      });

      setIsSubmitted(true);
    } catch (err: any) {
      alert(err.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  // Success View Logic
  if (isSubmitted) {
    return (
      <div className="request-card success-card">
        <div className="form-success-container">
          <div className="success-icon-wrapper">
            <CheckCircle size={64} className="success-icon" />
          </div>
          <h3>Request Submitted!</h3>
          <p>Your details have been logged. Check your status in the <strong>Track Status</strong> tab for updates.</p>
          <button 
            className="btn-primary" 
            onClick={() => {
                setIsSubmitted(false);
                setFormData({ studentId: '', fullName: '', email: '', program: '', yearLevel: '', type: 'Absence Excuse', reason: '' });
                setIsAutoFilled(false);
            }}
          >
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="request-card">
      <div className="form-header">
        <h2>Submit Official Request</h2>
        <p>Your details will be verified against the CETSO Masterlist.</p>
      </div>

      <form className="request-form" onSubmit={handleSubmit}>
        {errorMessage && (
          <div className="duplicate-warning">
            <AlertCircle size={20} /> <p>{errorMessage}</p>
          </div>
        )}

        <div className="form-group">
          <label><Hash size={14} /> Student ID</label>
          <div className="input-with-icon">
            <input
              type="text" 
              placeholder="598XXXXX" 
              maxLength={8}
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value.replace(/\D/g, '') })}
              className={formData.studentId.length === 8 ? (isAutoFilled ? 'valid' : 'invalid') : ''}
              required
            />
            {verifying ? <div className="spinner-small" /> : formData.studentId.length === 8 && (
              isAutoFilled ? <CheckCircle2 className="icon-success" size={18} /> : <AlertCircle className="icon-error" size={18} />
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label><User size={14} /> Full Name {isAutoFilled && <Lock size={12} style={{opacity: 0.5}} />}</label>
            <input type="text" value={formData.fullName} readOnly={isAutoFilled} className={isAutoFilled ? "input-locked" : ""} required />
          </div>
          <div className="form-group">
            <label><Mail size={14} /> Official Email</label>
            <input type="email" placeholder="hcdc.email@hcdc.edu.ph" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label><BookOpen size={14} /> Program</label>
            <input type="text" value={formData.program} readOnly className="input-locked" />
          </div>
          <div className="form-group">
            <label><GraduationCap size={14} /> Year Level</label>
            <input type="text" value={formData.yearLevel} readOnly className="input-locked" />
          </div>
        </div>

        <div className="form-group">
          <label>Request Type</label>
          <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
            <option value="Absence Excuse">Absence Excuse</option>
            <option value="Sanction Appeal">Sanction Appeal</option>
            <option value="Other">Other Inquiry</option>
          </select>
        </div>

        <div className="form-group">
          <label><MessageSquare size={14} /> Reason</label>
          <textarea rows={4} placeholder="Explain clearly..." value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} required />
        </div>

        <button type="submit" className="btn-primary" disabled={loading || !isFormValid || !isAutoFilled}>
          {loading ? "Processing..." : <><Send size={18} style={{marginRight: '8px'}} /> Submit Request</>}
        </button>
      </form>
    </div>
  );
};

export default RequestForm;