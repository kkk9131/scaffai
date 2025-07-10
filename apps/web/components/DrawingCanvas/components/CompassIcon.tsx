'use client';

import React from 'react';

interface CompassIconProps {
  size?: number;
  className?: string;
}

export default function CompassIcon({ size = 80, className = '' }: CompassIconProps) {
  return (
    <div 
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 背景円 */}
      <div 
        className="absolute inset-0 bg-white/90 rounded-full border-2 border-gray-300 shadow-lg"
        style={{ width: size, height: size }}
      />
      
      {/* 方角の文字 */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* 北 */}
        <div 
          className="absolute text-red-600 font-bold text-sm"
          style={{ 
            top: '8px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          N
        </div>
        
        {/* 東 */}
        <div 
          className="absolute text-gray-700 font-semibold text-xs"
          style={{ 
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          E
        </div>
        
        {/* 南 */}
        <div 
          className="absolute text-gray-700 font-semibold text-xs"
          style={{ 
            bottom: '8px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          S
        </div>
        
        {/* 西 */}
        <div 
          className="absolute text-gray-700 font-semibold text-xs"
          style={{ 
            left: '8px',
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          W
        </div>
        
        {/* 中央の針（北向き） */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="bg-red-600 transform rotate-0"
            style={{ 
              width: '2px', 
              height: size * 0.3,
              transformOrigin: 'bottom center',
              marginTop: `-${size * 0.15}px`
            }}
          />
          {/* 針の先端 */}
          <div 
            className="absolute bg-red-600"
            style={{ 
              width: '6px', 
              height: '6px',
              top: `${size * 0.2}px`,
              left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }}
          />
        </div>
        
        {/* 中央の点 */}
        <div 
          className="absolute bg-gray-800 rounded-full"
          style={{ 
            width: '4px', 
            height: '4px',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      </div>
    </div>
  );
}