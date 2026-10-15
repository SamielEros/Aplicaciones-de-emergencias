import React from 'react';

interface SocorrosEmblemProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'badge' | 'header' | 'icon' | 'watermark';
  className?: string;
}

/**
 * Emblema Oficial removido conforme a la solicitud del usuario:
 * "Solo quítale los emblemas oficiales de cruz roja mexicana y socorros a esta aplicación"
 */
export const CruzRojaMexicanaEmblem: React.FC<SocorrosEmblemProps> = () => {
  return null;
};

export default CruzRojaMexicanaEmblem;
