import React, { useState, useEffect } from 'react';
import RequestForm from '../../components/public/RequestForm';
import QRCodeSection from '../../components/public/QRCodeSection';
import { supabase } from '../../utils/supabaseClient';
import {
  Info,
  MessageCircle,
  HelpCircle,
  Search,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  Send
} from 'lucide-react';

// Styles
import '../../styles/pages/public/submissionportal.css';
import '../../styles/pages/public/suggestiontab.css';

const SubmissionPortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'request' | 'status' | 'suggestion'>('request');
  const [searchId, setSearchId] = useState('');
  const [statusResult, setStatusResult] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const GOOGLE_FORM_URL = "https://forms.gle/JHVwGQRK2dAkNuzs7";

  const [openFaq, setOpenFaq] = useState<number | null>(null);

const toggleFaq = (index: number) => {
  setOpenFaq(openFaq === index ? null : index);
};

  useEffect(() => {
    if (searchId.length < 8) {
      setStatusResult(null);
    }
  }, [searchId]);

  const handleCheckStatus = async () => {
    if (searchId.length < 8) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('student_requests')
      .select('*')
      .eq('student_id', searchId)
      .order('created_at', { ascending: false });

    if (!error) setStatusResult(data);
    setLoading(false);
  };

  return (
    <div className="public-container submission-portal-page">
      <header className="page-header">
        <h1>Student Submission Portal</h1>
        <p>Official gateway for CETSO appeals, excuses, and feedback</p>
      </header>

      {/* TABS NAVIGATION */}
      <div className="portal-tabs">
        <button
          className={`tab-btn ${activeTab === 'request' ? 'active' : ''}`}
          onClick={() => setActiveTab('request')}
        >
          <HelpCircle size={18} /> <span>Request</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'status' ? 'active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          <Search size={18} /> <span>Track Status</span>
        </button>
        <button
          className={`tab-btn ${activeTab === 'suggestion' ? 'active' : ''}`}
          onClick={() => setActiveTab('suggestion')}
        >
          <MessageCircle size={18} /> <span>Suggestions</span>
        </button>
      </div>

      {/* MAIN CONTENT AREA - Removed the nested .card to fix the double-border issue */}
      <div className={`portal-content-wrapper ${activeTab}`}>
        
        {/* REQUEST TAB */}
        {activeTab === 'request' && (
          <div className="card tab-content-fade">
            <div className="note-box">
              <Info size={24} strokeWidth={2.5} />
              <p><strong>Official Submission:</strong> Ensure your Student ID is correct. Official responses are sent via your registered email.</p>
            </div>
            <RequestForm />
          </div>
        )}

        {/* STATUS TRACKER TAB */}
        {activeTab === 'status' && (
          <div className="card tab-content-fade status-checker-container">
            <div className="suggestion-header">
              <h3>Track Your Request</h3>
              <p>Enter your 8-digit Student ID to view live status updates.</p>
            </div>

            <div className="search-bar-wrapper">
              <input
                type="text"
                placeholder="Enter Student ID (e.g. 59812345)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value.replace(/\D/g, ''))}
                maxLength={8}
              />
              <button className="btn-primary" onClick={handleCheckStatus} disabled={loading || searchId.length < 8}>
                {loading ? <Loader2 className="spinner" size={18} /> : "Check Status"}
              </button>
            </div>

            <div className="results-container">
              {statusResult && statusResult.length > 0 ? (
                statusResult.map((req) => (
                  <div key={req.id} className="status-result-card">
                    <div className="result-header">
                      <span className={`status-badge ${req.status.toLowerCase()}`}>{req.status}</span>
                      <span className="result-date"><Clock size={12} /> {new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                    <h4>{req.type}</h4>
                    <div className="status-instruction-box">
                      {req.status === 'Approved' ? (
                        <div className="instruction approved">
                          <CheckCircle size={18} className="icon-msg" />
                          <p><strong>Approved:</strong> Please check your email for updated records.</p>
                        </div>
                      ) : req.status === 'Rejected' ? (
                        <div className="instruction rejected">
                          <AlertCircle size={18} className="icon-msg" />
                          <p><strong>Notice:</strong> Please proceed to the CETSO office for clarification.</p>
                        </div>
                      ) : (
                        <p className="reason-preview">{req.reason.substring(0, 120)}...</p>
                      )}
                    </div>
                  </div>
                ))
              ) : statusResult && (
                <p className="no-results">No records found for this ID.</p>
              )}
            </div>
          </div>
        )}

        {/* SUGGESTION TAB */}
        {activeTab === 'suggestion' && (
          <div className="suggestion-tab-wrapper tab-content-fade">
            <div className="feedback-card-container">
              <div className="feedback-hero-layout">
                <div className="feedback-visual-side">
                  <QRCodeSection url={GOOGLE_FORM_URL} />
                </div>

                <div className="feedback-text-content">
                  <div className="feedback-badge">FEEDBACK FORM | CETSO</div>
                  <h3>Your Voice is Progress</h3>
                  <p>
                    CETSO invites all students to share experiences, insights, and concerns. 
                    Your input helps strengthen services and refine policies. Participation turns 
                    dialogue into action.
                  </p>
                  
                  <a href={GOOGLE_FORM_URL} target="_blank" rel="noopener noreferrer" className="suggestion-submit-btn">
                    Open Official Form <Send size={18} />
                  </a>
                </div>
              </div>

              <div className="data-privacy-notice">
                <Info size={20} />
                <p>
                  All personal information is handled in accordance with <strong>Republic Act 10173 (Data Privacy Act of 2012)</strong>. 
                  Responses are strictly confidential and used only for administrative purposes.
                </p>
              </div>
            </div>

            <div className="feedback-faq-section" onContextMenu={(e) => e.preventDefault()}>
  <div className="faq-header">
    <HelpCircle size={20} />
    <h4>Frequently Asked Questions</h4>
  </div>
  <div className="faq-grid">
    {[
      {
        q: "Is it really anonymous?",
        a: "Yes. The system does not collect your identity unless you choose to provide it for a follow-up."
      },
      {
        q: "What can I suggest?",
        a: "Office process improvements, website bugs, or campus-wide student concerns."
      },
      {
        q: "How are responses handled?",
        a: "Feedback is reviewed weekly by CETSO officers to inform future action."
      }
    ].map((item, index) => (
      <div 
        key={index} 
        className={`faq-item ${openFaq === index ? 'active' : ''}`}
        onClick={() => toggleFaq(index)}
      >
        <div className="faq-question">
          <h5>{item.q}</h5>
          <span className="faq-chevron">{openFaq === index ? '−' : '+'}</span>
        </div>
        <div className="faq-answer">
          <p>{item.a}</p>
        </div>
      </div>
    ))}
  </div>
</div>

          </div>
        )}
      </div>
    </div>
  );
};

export default SubmissionPortal;