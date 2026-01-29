import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import '../styles/components/editstudentinfo.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  student?: any | null;
}

const EditStudentInfo = ({ isOpen, onClose, onSave, student }: ModalProps) => {
  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
    year_level: '1st Year',
    program: 'BSIT'
  });

  useEffect(() => {
    if (student) {
      setFormData({
        student_id: student.student_id?.toString() || '',
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        email: student.email || '',
        year_level: student.year_level || '1st Year',
        program: student.program || 'BSIT'
      });
    } else {
      setFormData({
        student_id: '',
        first_name: '',
        last_name: '',
        email: '',
        year_level: '1st Year',
        program: 'BSIT'
      });
    }
  }, [student, isOpen]);

  // Validation Logic
  const isIdValid = formData.student_id.startsWith('598') && formData.student_id.length === 8;
  const isEmailValid = formData.email.toLowerCase().endsWith('@hcdc.edu.ph');

  const formatName = (name: string) => {
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isIdValid) return alert("Student ID must start with 598 and be 8 digits.");
    if (!isEmailValid) return alert("Please use a valid @hcdc.edu.ph email.");

    const finalData = {
      student_id: Number(formData.student_id),
      first_name: formatName(formData.first_name),
      last_name: formatName(formData.last_name),
      email: formData.email.toLowerCase(),
      year_level: formData.year_level,
      program: formData.program
    };

    onSave(finalData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{student ? 'Edit Student' : 'Add New Student'}</h2>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Student ID Field */}
          <div className="form-group">
            <label>Student ID</label>
            <div className="input-with-icon">
              <input
                type="text"
                placeholder="59812345"
                maxLength={8}
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value.replace(/\D/g, '') })}
                className={formData.student_id.length > 0 ? (isIdValid ? 'valid' : 'invalid') : ''}
                required
                disabled={!!student}
              />
              {formData.student_id.length > 0 && (
                isIdValid ? <CheckCircle2 className="icon-success" size={18} /> : <AlertCircle className="icon-error" size={18} />
              )}
            </div>
            {!isIdValid && formData.student_id.length > 0 && 
              <span className="error-text">Must start with 598 and be 8 digits</span>}
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              placeholder="Enter Last Name Here"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>First Name(s)</label>
            <input
              type="text"
              placeholder="Enter First Name Here"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label>Official Email</label>
            <div className="input-with-icon">
              <input
                type="email"
                placeholder="student@hcdc.edu.ph"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={formData.email.length > 0 ? (isEmailValid ? 'valid' : 'invalid') : ''}
                required
              />
              {formData.email.length > 0 && (
                isEmailValid ? <CheckCircle2 className="icon-success" size={18} /> : <AlertCircle className="icon-error" size={18} />
              )}
            </div>
            {!isEmailValid && formData.email.length > 0 && 
              <span className="error-text">Must end with @hcdc.edu.ph</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Year Level</label>
              <select value={formData.year_level} onChange={(e) => setFormData({ ...formData, year_level: e.target.value })}>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div className="form-group">
              <label>Program</label>
              <select value={formData.program} onChange={(e) => setFormData({ ...formData, program: e.target.value })} required>
                <option value="BSIT">BSIT</option>
                <option value="BSCpE">BSCpE</option>
                <option value="BSECE">BSECE</option>
                <option value="BLIS">BLIS</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={!isIdValid || !isEmailValid}>
              {student ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentInfo;