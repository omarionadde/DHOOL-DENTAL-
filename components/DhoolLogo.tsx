
import React from 'react';

export const DhoolLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className || "w-10 h-10"} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="dhoolGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0052cc" />
        <stop offset="100%" stopColor="#00cc66" />
      </linearGradient>
    </defs>
    
    {/* Stylized Tooth Shape */}
    <path 
      d="M30 25 
         C 15 25, 10 40, 15 55 
         C 18 65, 25 80, 35 90 
         C 40 85, 45 75, 50 65 
         C 55 75, 60 85, 65 90 
         C 75 80, 82 65, 85 55 
         C 90 40, 85 25, 70 25 
         C 60 25, 55 35, 50 40 
         C 45 35, 40 25, 30 25 Z" 
      stroke="url(#dhoolGrad)" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    
    {/* Inner Swoosh/Smile Details */}
    <path 
      d="M35 45 C 40 55, 60 55, 65 45" 
      stroke="url(#dhoolGrad)" 
      strokeWidth="4" 
      strokeLinecap="round" 
      opacity="0.8" 
    />
  </svg>
);
