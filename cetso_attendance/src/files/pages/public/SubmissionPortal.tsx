import React, { useState } from 'react';
import RequestForm from '../../components/public/RequestForm';
import { Info, MessageCircle, HelpCircle } from 'lucide-react';
import '../../styles/pages/public.css';
import '../../styles/pages/public/submissionportal.css';

const SubmissionPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'request' | 'suggestion'>('request');

  return (
    <div className="public-container submission-portal-page">
      <header className="page-header">
        <h1>Student Submission Portal</h1>
        <p>Submit appeals, excuses, or general feedback to CETSO</p>
      </header>

      {/* TABS NAVIGATION */}
      <div className="portal-tabs">
        <button 
          className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`}
          onClick={() => setActiveTab('request')}
        >
          <HelpCircle size={18} /> 
          <span>Sanction/Absence Request</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'suggestion' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestion')}
        >
          <MessageCircle size={18} /> 
          <span>Suggestion Box</span>
        </button>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className={`portal-content-card ${activeTab}`}>
        <div className="card">
          {activeTab === 'request' ? (
            <div className="tab-content-fade">
              <div className="note-box">
                <Info size={20} />
                <p>Please ensure your Student ID is correct. Official responses are sent via email or posted in the office.</p>
              </div>
              <RequestForm />
            </div>
          ) : (
            <div className="suggestion-box-container tab-content-fade">
              <div className="suggestion-header">
                <h3>We Value Your Feedback</h3>
                <p>Your suggestions help us improve CETSO services. You can submit directly or use our official external form.</p>
              </div>
              
              <div className="iframe-container">
                 <div className="icon-circle">
                    <MessageCircle size={40} />
                 </div>
                 <p className="redirect-text">For anonymous or detailed feedback, please use our official Google Form.</p>
                 <a 
                   href="https://docs.google.com/forms/d/e/1FAIpQLSehlNz-tGou9gmuRpJn5kg2wueN4h7CU1MUwoRaJVqRjgNbaw/viewform" 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="btn-primary-form"
                 >
                   Open Suggestion Form
                 </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmissionPortal;