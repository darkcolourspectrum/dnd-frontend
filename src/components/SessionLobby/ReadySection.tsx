import React from 'react';

interface ReadySectionProps {
  isReady: boolean;
  onToggleReady: () => void;
  disabled: boolean;
}

const ReadySection: React.FC<ReadySectionProps> = ({ 
  isReady, 
  onToggleReady, 
  disabled
}) => {
  return (
    <div className="ready-section">
      <button
        onClick={onToggleReady}
        disabled={disabled}
        className={`ready-button ${isReady ? 'ready' : ''} ${disabled ? 'disabled' : ''}`}
      >
        {isReady ? 'Not Ready' : 'I\'m Ready'}
      </button>
      
      {disabled && !isReady && (
        <p className="hint">Select a character first</p>
      )}
    </div>
  );
};

export default ReadySection;