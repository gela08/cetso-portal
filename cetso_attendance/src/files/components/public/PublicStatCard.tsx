import React from 'react';

interface PublicStatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
}

const PublicStatCard: React.FC<PublicStatCardProps> = ({ label, value, icon, colorClass }) => {
  return (
    <div className={`stat-card-public ${colorClass}`}>
      <div className="stat-icon-wrapper">
        {icon}
      </div>
      <div className="stat-text">
        <p className="stat-label">{label}</p>
        <h3 className="stat-value">{value}</h3>
      </div>
    </div>
  );
};

export default PublicStatCard;