import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: 'violet' | 'emerald' | 'coral' | 'amber' | 'none';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  glowColor = 'none',
  hoverable = false
}) => {
  const glowStyles = {
    violet: 'shadow-glass-glow hover:border-neonViolet/40 border-neonViolet/10',
    emerald: 'shadow-success-glow hover:border-neonMint/40 border-neonMint/10',
    coral: 'shadow-warning-glow hover:border-neonCoral/40 border-neonCoral/10',
    amber: 'shadow-glass-glow hover:border-neonAmber/40 border-neonAmber/10',
    none: 'border-darkBorder shadow-glass'
  };

  const baseStyles = 'bg-darkSurface backdrop-blur-md rounded-2xl border transition-all duration-300';
  const hoverStyles = hoverable ? 'hover:-translate-y-0.5 cursor-pointer' : '';

  return (
    <div className={`${baseStyles} ${glowStyles[glowColor]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`px-6 py-4 border-b border-darkBorder ${className}`}>
    {children}
  </div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-800/60 rounded ${className}`} />
);
