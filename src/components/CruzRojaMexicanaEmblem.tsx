import React from 'react';
import { CRUZ_ROJA_EMBLEM_PATH } from '../data/cruzRojaEmblem';

interface SocorrosEmblemProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'badge' | 'header' | 'icon' | 'watermark';
  className?: string;
}

/**
 * Emblema Oficial Institucional de Cruz Roja Mexicana - Coordinación de Socorros
 * Generado conforme a la imagen provista por el usuario.
 */
export const CruzRojaMexicanaEmblem: React.FC<SocorrosEmblemProps> = ({
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    xs: 'h-6 w-auto',
    sm: 'h-8 w-auto',
    md: 'h-10 w-auto',
    lg: 'h-14 w-auto',
    xl: 'h-20 w-auto'
  };

  return (
    <img
      src={CRUZ_ROJA_EMBLEM_PATH}
      alt="Cruz Roja Mexicana - Socorros"
      className={`object-contain rounded-md shadow-md ring-1 ring-orange-500/40 ${sizeClasses[size] || sizeClasses.md} ${className}`}
      loading="eager"
    />
  );
};

export default CruzRojaMexicanaEmblem;

