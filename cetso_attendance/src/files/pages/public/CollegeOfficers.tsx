import React, { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabaseClient';
import OfficerCard from '../../components/public/OfficerCard';
import type { Officer } from '../../types';
import '../../styles/pages/public.css'; 
import '../../styles/pages/public/collegeofficers.css'; // Import the new specific CSS

const CollegeOfficers: React.FC = () => {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollegeOfficers = async () => {
      const { data, error } = await supabase
        .from('officers')
        .select('*')
        .eq('level', 'college')
        .order('rank_order', { ascending: true });

      if (!error && data) setOfficers(data);
      setLoading(false);
    };
    fetchCollegeOfficers();
  }, []);

  return (
    <div className="public-container college-officers-page">
      <header className="page-header">
        <h1>CETSO College Officers</h1>
        <p>The executive leadership of the College of Engineering and Technology</p>
      </header>

      {loading ? (
        <div className="loading-container">
          <span>Loading Officers...</span>
        </div>
      ) : (
        <div className="officer-grid">
          {officers.map((off) => (
            <OfficerCard 
              key={off.id}
              name={`${off.first_name} ${off.last_name}`}
              position={off.position}
              imageUrl={off.image_url}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CollegeOfficers;