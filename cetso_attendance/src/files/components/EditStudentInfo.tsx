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

const EditStudentInfo = ({
  isOpen,
  onClose,
  onSave,
  student
}: ModalProps) => {
  const [formData, setFormData] = useState<Partial<Student>>({
    firstName: '',
    lastName: '',
    yearLevel: 1,
    program: 'BSCS'
  });

  useEffect(() => {
    if (student) {
      setFormData(student);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        yearLevel: 1,
        program: 'BSCS'
      });
    }
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      ...formData,
      program: formData.program!.trim().toUpperCase(),
      yearLevel: Number(formData.yearLevel)
    } as Student);
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
            <label>First Name</label>
            <input
              type="text"
              value={formData.firstName || ''}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={formData.lastName || ''}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Year Level</label>
              <select
                value={formData.yearLevel}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    yearLevel: Number(e.target.value)
                  })
                }
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
              </select>
            </div>

            <div className="form-group">
              <label>Program</label>
              <input
                type="text"
                value={formData.program || ''}
                onChange={(e) =>
                  setFormData({ ...formData, program: e.target.value })
                }
                placeholder="e.g. BSIT"
                required
              />
            </div>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
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
