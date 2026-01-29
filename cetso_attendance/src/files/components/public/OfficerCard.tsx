import React from 'react';
import { User } from 'lucide-react';

interface OfficerCardProps {
  name: string;
  position: string;
  program?: string;
  imageUrl?: string;
}

const OfficerCard: React.FC<OfficerCardProps> = ({ name, position, program, imageUrl }) => {
  return (
    <div className="officer-card">
      <div className="officer-image-wrapper">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="officer-img" />
        ) : (
          <div className="officer-placeholder">
            <User size={40} />
          </div>
        )}
      </div>
      <div className="officer-details">
        <h4 className="off-name">{name}</h4>
        <p className="off-pos">{position}</p>
        {program && <span className="off-prog-badge">{program}</span>}
      </div>
    </div>
  );
};

export default OfficerCard;