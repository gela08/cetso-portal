import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import '../styles/components/editstudentinfo.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  student?: any | null;
}

const EditStudentInfo = ({ isOpen, onClose, onSave, student }: ModalProps) => {
  // 1. Initial State matching Supabase Schema
  const [formData, setFormData] = useState({
    student_id: '',
    first_name: '',
    last_name: '',
    year_level: '1st Year',
    program: 'BSIT'
  });

  useEffect(() => {
    if (student) {
      // Map incoming student data to form fields
      setFormData({
        student_id: student.student_id || '',
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        year_level: student.year_level || '1st Year',
        program: student.program || 'BSIT'
      });
    } else {
      setFormData({
        student_id: '',
        first_name: '',
        last_name: '',
        year_level: '1st Year',
        program: 'BSIT'
      });
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct the clean data object for Supabase
    const finalData = {
      student_id: Number(formData.student_id),
      first_name: formData.first_name,
      last_name: formData.last_name,
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
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Student ID</label>
            <input
              type="number"
              placeholder="e.g. 59812345"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              required
              disabled={!!student} // IDs cannot be changed once created
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Year Level</label>
              <select
                value={formData.year_level}
                onChange={(e) => setFormData({ ...formData, year_level: e.target.value })}
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            <div className="form-group">
              <label>Program</label>
              <select
                value={formData.program}
                onChange={(e) => setFormData({ ...formData, program: e.target.value })}
                required
              >
                <option value="BSIT">BSIT</option>
                <option value="BSCpE">BSCpE</option>
                <option value="BSECE">BSECE</option>
                <option value="BLIS">BLIS</option>
              </select>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {student ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentInfo;