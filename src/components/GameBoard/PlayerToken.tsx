import React from 'react';

interface PlayerTokenProps {
  x: number;
  y: number;
  label: string;
}

const PlayerToken: React.FC<PlayerTokenProps> = ({ x, y, label }) => {
  return (
    <div 
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: '#4285f4',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'translate(-50%, -50%)',
        border: '2px solid white'
      }}
    >
      {label.charAt(0)}
    </div>
  );
};

export default PlayerToken;