import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import '../styles/components/editstudentinfo.css';
import type { Student } from '../pages/StudentRecords';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Student) => void;
  student?: Student | null;
}

const EditStudentInfo = ({ isOpen, onClose, onSave, student }: ModalProps) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    studentId: 0,
    firstName: '',
    lastName: '',
    yearLevel: '1st Year',
    program: 'BSIT'
  });

  useEffect(() => {
    if (student) {
      setFormData(student);
    } else {
      setFormData({
        studentId: 0,
        firstName: '',
        lastName: '',
        yearLevel: '1st Year',
        program: 'BSIT'
      });
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct the clean data object
    const finalData: Student = {
      studentId: Number(formData.studentId),
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      yearLevel: String(formData.yearLevel),
      program: formData.program || 'BSIT'
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
              value={formData.studentId || ''}
              onChange={(e) => setFormData({ ...formData, studentId: Number(e.target.value) })}
              required
              // Disable ID editing to prevent record mismatch
              disabled={!!student} 
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={formData.lastName || ''}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={formData.firstName || ''}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Year Level</label>
              <select
                value={formData.yearLevel}
                onChange={(e) => setFormData({ ...formData, yearLevel: e.target.value })}
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
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStudentInfo;