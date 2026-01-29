import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import OfficerCard from '../../components/public/OfficerCard';
import type { Officer } from '../../types/index'; // Updated to match your structure
import '../../styles/pages/public.css';
import '../../styles/pages/public/programofficers.css'; // New CSS import

const ProgramOfficers: React.FC = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const programs = ['BSIT', 'BSCpE', 'BSECE', 'BLIS'];

  useEffect(() => {
    const fetchProgramOfficers = async () => {
      const { data, error } = await supabase
        .from('officers')
        .select('*')
        .eq('level', 'program')
        .order('rank_order', { ascending: true });

      if (!error && data) setOfficers(data);
      setLoading(false);
    };
    fetchProgramOfficers();
  }, []);

  return (
    <div className="public-container">
      <header className="page-header">
        <h1>Departmental Officers</h1>
        <p>Leadership per academic program</p>
      </header>

      {loading ? (
        <div className="text-center">Loading Departments...</div>
      ) : (
        programs.map(prog => {
          const filteredOfficers = officers.filter(o => o.program === prog);
          
          return (
            <section key={prog} className="program-section">
              <h2 className="program-group-title">{prog} Department</h2>
              <div className="officer-grid">
                {filteredOfficers.length > 0 ? (
                  filteredOfficers.map(off => (
                    <OfficerCard 
                      key={off.id}
                      name={`${off.first_name} ${off.last_name}`}
                      position={off.position}
                      imageUrl={off.image_url}
                    />
                  ))
                ) : (
                  <div className="no-officers-note">
                    No officers currently listed for {prog}.
                  </div>
                )}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
};

export default ProgramOfficers;