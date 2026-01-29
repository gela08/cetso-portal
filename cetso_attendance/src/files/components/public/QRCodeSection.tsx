import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeSectionProps {
  url: string;
}

const QRCodeSection: React.FC<QRCodeSectionProps> = ({ url }) => {
  return (
    <div className="qr-container">
      <QRCodeSVG 
        value={url} 
        size={300}
        level="H"
        fgColor="#FF4500" // Matches your logo gear
        includeMargin={false}
      />
      <p className="qr-label">Scan to Submit</p>
    </div>
  );
};

export default QRCodeSection;